// Frame-difference analysis for inspect.mjs, all in Node + ffmpeg (no Python, no image libraries).
//   grayFrames   stream a video as small grayscale frames
//   diffProfile  per frame step: share of pixels that changed, mean change; single-frame flashes
//   shotMotion   per shot: how much moves, how often nothing moves, sudden spikes, stutter
//   findStarts   where cuts / transitions start (for reference videos)
//   fitGrid      the beat grid those starts sit on → step, offset, units per segment, BPM candidates
//   heatmap      per segment: where in the frame things move (red over the segment's last frame)
import fs from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';

export const PIX = 12;          // a pixel "changed" when its gray level moves more than this (encoder noise stays below)
export const STILL = 0.001;     // a frame step is "still" when under 0.1 % of the pixels changed

export const smallSize = (info, width) => ({ w: width, h: Math.max(2, Math.round(width * info.h / info.w / 2) * 2) });

/** Calls onFrame(Uint8Array gray, index) for every frame, scaled to w×h. */
export function grayFrames(video, w, h, onFrame) {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', ['-v', 'error', '-i', video, '-an', '-vf', `scale=${w}:${h}:flags=area,format=gray`, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { stdio: ['ignore', 'pipe', 'pipe'] });
    const size = w * h; let buf = Buffer.alloc(0), k = 0, err = '';
    ff.stdout.on('data', chunk => {
      buf = buf.length ? Buffer.concat([buf, chunk]) : chunk;
      while (buf.length >= size) { onFrame(new Uint8Array(buf.subarray(0, size)), k++); buf = buf.subarray(size); }
    });
    ff.stderr.on('data', d => { err += d; });
    ff.on('error', reject);
    ff.on('close', code => (code === 0 ? resolve(k) : reject(new Error(`ffmpeg could not decode the video: ${err.trim().split('\n').pop() || 'exit ' + code}`))));
  });
}

function compare(a, b) {
  let c = 0, s = 0;
  for (let i = 0; i < a.length; i++) { const d = a[i] > b[i] ? a[i] - b[i] : b[i] - a[i]; s += d; if (d > PIX) c++; }
  return [c / a.length, s / a.length];
}

/** ratio[i] / mean[i] describe the step from frame i to frame i+1.
 *  flashes: frames that differ strongly from both neighbours while the neighbours match each other
 *  (a one-frame glitch, a blank frame, a stray layer; or a deliberate one-frame strobe). */
export async function diffProfile(video, info, { width = 160 } = {}) {
  const { w, h } = smallSize(info, width);
  const ratio = [], mean = [], flashes = [];
  let p2 = null, p1 = null;
  const frames = await grayFrames(video, w, h, (f, k) => {
    if (p1) {
      const [r, m] = compare(p1, f); ratio.push(r); mean.push(m);
      if (p2) {   // judged on the mean change: with fast motion the neighbours never match pixel for pixel, but stay close
        const A = mean[mean.length - 2];
        if (A > 8 && m > 8 && compare(p2, f)[1] < 0.35 * Math.min(A, m)) flashes.push(k - 1);
      }
    }
    p2 = p1; p1 = f;
  });
  return { w, h, frames, ratio, mean, flashes };
}

const median = a => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/** segments: [{ id, t0, t1 }]; cuts: seconds of deliberate hard cuts (steps next to them are not "spikes"). */
export function shotMotion(prof, fps, segments, cuts = []) {
  const nearCut = i => cuts.some(c => Math.abs((i + 1) / fps - c) <= 1.5 / fps);
  return segments.map(s => {
    const steps = [];
    for (let i = Math.ceil(s.t0 * fps); i < Math.min(prof.ratio.length, Math.floor(s.t1 * fps) - 1); i++) if (!nearCut(i)) steps.push(i);
    if (steps.length < 3) return { ...s, steps: steps.length };
    const r = steps.map(i => prof.ratio[i]), med = median(r);
    const still = r.filter(v => v < STILL).length / r.length;
    // a jump: ≥ 8 % of the frame changes in one step and far more than usual here (a letter popping in is not one)
    const spikes = steps.filter((i, k) => r[k] > Math.max(0.08, 6 * med)).map(i => (i + 1) / fps);
    let flips = 0; for (let k = 1; k < r.length; k++) if ((r[k] < STILL) !== (r[k - 1] < STILL)) flips++;
    return { ...s, steps: steps.length, moving: r.reduce((a, v) => a + v, 0) / r.length, still, spikes, alternation: flips / (r.length - 1) };
  });
}

/** Runs of big whole-frame jumps (≥ 20 % of the pixels in one step, and at least twice the steps on either side, so
 *  steady fast motion is not one) that come ≤ `gap` s apart, at least `min` of them. Either a deliberate rapid montage,
 *  or strokes / noise / textures regenerated every few frames (reads as flicker). Independent of cut detection on
 *  purpose: a scene detector reports each regeneration as a "cut". */
export function bursts(prof, fps, { big = 0.2, gap = 0.35, min = 5 } = {}) {
  const R = prof.ratio, ev = [];
  R.forEach((r, i) => { if (r >= big && r >= 2 * Math.max(R[i - 1] ?? 0, R[i + 1] ?? 0)) ev.push((i + 1) / fps); });
  const out = []; let run = [];
  const flush = () => { if (run.length >= min) out.push({ t0: run[0], t1: run.at(-1), n: run.length, every: (run.at(-1) - run[0]) / (run.length - 1) }); };
  for (const t of ev) { if (run.length && t - run.at(-1) > gap) { flush(); run = []; } run.push(t); }
  flush();
  return out;
}

/** Starts of cuts / transitions: a step whose mean change rises above `thresh` and well above the recent level. */
export function findStarts(prof, fps, { thresh = 5, debounce = 0.2 } = {}) {
  const m = prof.mean, out = []; let last = -1e9;
  for (let i = 0; i < m.length; i++) {
    const local = median(m.slice(Math.max(0, i - Math.round(fps / 2)), i));
    if (m[i] > thresh && m[i] > 2.5 * local + 1 && i - last >= debounce * fps) { out.push(i + 1); last = i; }
  }
  return out;   // frame numbers of the first changed frame
}

/** The largest step (in frames) that ≥ 80 % of the starts sit on, within ±tol frames. */
export function fitGrid(starts, fps, { tol = 1.5, need = 0.8 } = {}) {
  if (starts.length < 4) return null;
  const gaps = starts.slice(1).map((v, i) => v - starts[i]);
  const lo = Math.max(4 * tol, 2), hi = Math.max(...gaps) + tol;
  const evalStep = s => {
    let sx = 0, cx = 0; for (const x of starts) { sx += Math.sin(2 * Math.PI * x / s); cx += Math.cos(2 * Math.PI * x / s); }
    let o = ((Math.atan2(sx, cx) / (2 * Math.PI)) * s + s) % s;
    const res = x => { const d = ((x - o) % s + s) % s; return Math.min(d, s - d); };
    let inl = starts.filter(x => res(x) <= tol);
    if (inl.length) { o = median(inl.map(x => x - Math.round((x - o) / s) * s)); inl = starts.filter(x => res(x) <= tol); }
    return { s, o, inl, res };
  };
  // the largest step that holds `need` of the starts; then, close below it, the step that holds the most with the least error
  // (the largest passing step leans long: a slightly long step still catches most starts within ±tol)
  let top = null;
  for (let s = lo; s <= hi; s += 0.05) { const e = evalStep(s); if (e.inl.length / starts.length >= need) top = e; }
  if (!top) return null;
  let best = top, bestErr = Infinity;
  for (let s = top.s * 0.97; s <= top.s + 1e-9; s += 0.01) {
    const e = evalStep(s); if (e.inl.length / starts.length < need) continue;
    const err = e.inl.reduce((a, x) => a + e.res(x) ** 2, 0) / e.inl.length;
    if (e.inl.length > best.inl.length || (e.inl.length === best.inl.length && err < bestErr)) { best = e; bestErr = err; }
  }
  const { s, o, inl, res } = best, sec = s / fps;
  const BPM = [[0.25, 'a 16th'], [0.5, 'an 8th'], [1, 'a beat'], [2, 'half a bar'], [4, 'a bar']]
    .map(([u, label]) => ({ bpm: +(60 * u / sec).toFixed(1), step: label })).filter(c => c.bpm >= 60 && c.bpm <= 200);
  return {
    stepFrames: +s.toFixed(2), stepSec: +sec.toFixed(4), offsetSec: +(o / fps).toFixed(3),
    inliers: inl.length, total: starts.length, outliers: starts.filter(x => !inl.includes(x)).map(x => +(x / fps).toFixed(3)),
    maxResidualFrames: +Math.max(...inl.map(res)).toFixed(2),
    unitsPerSegment: gaps.map(g => +(g / s).toFixed(1)),
    bpmCandidates: BPM,
  };
}

/** One cell per segment: the segment's last frame in gray, every pixel that moved inside it in red. */
export async function heatmap(video, info, segments, file, { width = 320, skip = 0.35, cols } = {}) {
  const { w, h } = smallSize(info, width), N = w * h, fps = info.fps;
  const acc = segments.map(() => ({ max: new Uint8Array(N), base: null }));
  const interior = segments.map(s => [Math.ceil((s.t0 + Math.min(skip, (s.t1 - s.t0) / 3)) * fps), Math.floor(s.t1 * fps) - 2]);
  let prev = null;
  await grayFrames(video, w, h, (f, k) => {
    interior.forEach(([a, b], j) => {
      if (k < a || k > b) return;
      const A = acc[j];
      if (prev && k > a) for (let i = 0; i < N; i++) { const d = f[i] > prev[i] ? f[i] - prev[i] : prev[i] - f[i]; if (d > A.max[i]) A.max[i] = d; }
      A.base = f;
    });
    prev = f;
  });
  const n = segments.length, C = cols || Math.min(5, Math.ceil(Math.sqrt(n))), R = Math.ceil(n / C), pad = 4;
  const W = C * w + (C + 1) * pad, H = R * h + (R + 1) * pad, rgb = Buffer.alloc(W * H * 3, 17);
  const areas = acc.map(({ max, base }, j) => {
    const x0 = pad + (j % C) * (w + pad), y0 = pad + Math.floor(j / C) * (h + pad); let moved = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, g = (base ? base[i] : 0) * 0.55, on = max[i] > PIX, a = on ? 0.5 + 0.5 * Math.min(1, (max[i] - PIX) / 40) : 0;
      if (on) moved++;
      const o = ((y0 + y) * W + x0 + x) * 3;
      rgb[o] = g + (255 - g) * a; rgb[o + 1] = g + (40 - g) * a; rgb[o + 2] = g + (40 - g) * a;
    }
    return base ? moved / N : null;
  });
  writePng(rgb, W, H, file);
  return areas;
}

export function writePng(rgb, w, h, file) {
  fs.rmSync(file, { force: true });
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${w}x${h}`, '-i', '-', '-frames:v', '1', file], { input: rgb });
  if (r.status !== 0 || !fs.existsSync(file) || !fs.statSync(file).size) throw new Error(`could not write ${file}: ${String(r.stderr || '').trim().split('\n').pop()}`);
  return file;
}
