#!/usr/bin/env node
// Look at a rendered video. Two kinds of output, kept apart on purpose:
//   • technical checks (PASS / FAIL, exit code 1 on any FAIL): file, size, fps, duration, frames, audio, black frames, loudness
//   • review material (images + notes) for a human-style look: contact sheets, strips, dead air, cuts, loop seam
//
//   node inspect.mjs qa <video> [--out qa/final] [--expect-size 1920x1080] [--expect-fps 30] [--expect-duration 16]
//                              [--audio required|none|any] [--loop] [--timeline <proj>/timeline.js | none]
//   node inspect.mjs sheet <video> [--cells 24] [--width 320] [--out qa/sheet]
//   node inspect.mjs phone <video> [--out qa/phone]
//   node inspect.mjs strip <video> --at 4.1 [--frames 12] [--step 1] [--width 320]
//   node inspect.mjs frames <video> 1.5 4 9.2 [--out qa/f]
//   node inspect.mjs loop <video>
//   node inspect.mjs motion <video> [--freeze 0.8] [--timeline …]
// Reading a reference video (step 1: learn its structure, not its assets):
//   node inspect.mjs grid <ref> [--thresh 5] [--debounce 0.2] [--tol 1.5] [--strips]   cut/transition starts + the beat grid they sit on
//   node inspect.mjs heat <ref> [--at 1.2,3.4,…] [--skip 0.35]                         where inside each segment things move
// qa without --expect-size / --expect-fps / --expect-duration / --audio says which checks did NOT run (never "all passed").
// The project's timeline.js (found next to out/ automatically) may export HOLDS = [[t0, t1], …]: freezes inside a
// declared hold are reported as intended holds instead of dead air. SHOTS = [{ id, t0, t1 }] makes motion report per shot.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { args, die } from './lib/browser.mjs';
import { findTimeline, loadTimeline, sameClock } from './lib/project.mjs';
import { diffProfile, shotMotion, bursts, findStarts, fitGrid, heatmap } from './lib/frames.mjs';

const { pos, opt } = args(process.argv.slice(2));
const [cmd, video] = pos;
const CMDS = { qa, sheet, phone, strip, frames, loop, motion, grid, heat };
if (!CMDS[cmd]) die('usage: inspect.mjs qa|sheet|phone|strip|frames|loop|motion|grid|heat <video> …');
if (!video || !fs.existsSync(video)) die(`video not found: ${video}`);
const info = probe(video);
const outPrefix = path.resolve(typeof opt.out === 'string' ? opt.out.replace(/\.png$/, '') : path.join(path.dirname(path.resolve(video)), '..', 'qa', path.basename(video, path.extname(video))));
fs.mkdirSync(path.dirname(outPrefix), { recursive: true });

function probe(v) {
  let j;
  try { j = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', '-count_packets', v], { stdio: ['ignore', 'pipe', 'pipe'] }).toString()); }
  catch (e) { die(`cannot read ${v}: ${String(e.stderr || e.message).trim().split('\n')[0]}`); }
  const vs = j.streams.find(s => s.codec_type === 'video'); if (!vs) die(`no video stream in ${v}`);
  const [a, b] = vs.r_frame_rate.split('/').map(Number);
  return { dur: +j.format.duration, w: vs.width, h: vs.height, fps: b ? a / b : 0, frames: +(vs.nb_read_packets || vs.nb_frames || 0), audio: j.streams.some(s => s.codec_type === 'audio') };
}
// run ffmpeg and insist the output file really exists and is non-empty
function ffOut(argv, file) {
  try { fs.rmSync(file, { force: true }); } catch {}
  const r = spawnSync('ffmpeg', ['-hide_banner', '-v', 'error', '-y', ...argv, file], { encoding: 'utf8' });
  if (r.status !== 0 || !fs.existsSync(file) || fs.statSync(file).size === 0) die(`ffmpeg produced no ${path.basename(file)}${r.stderr ? ': ' + r.stderr.trim().split('\n').pop() : ''}`);
  return file;
}
const inRange = (t, label) => { if (!(t >= 0 && t < info.dur)) die(`${label} ${t}s is outside the video (0–${info.dur.toFixed(2)}s)`); return t; };
const hasDrawtext = (() => { try { return execFileSync('ffmpeg', ['-hide_banner', '-filters'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().includes(' drawtext '); } catch { return false; } })();
const stamp = hasDrawtext ? `,drawtext=text='%{pts\\:hms}':x=8:y=8:fontsize=h/9:fontcolor=white:box=1:boxcolor=black@0.6` : '';

function makeSheet(file, cells, width) {
  const cols = cells <= 12 ? 4 : cells <= 20 ? 5 : 6, rows = Math.ceil(cells / cols);
  ffOut(['-i', video, '-vf', `fps=${cells}/${info.dur},scale=${width}:-2${stamp},tile=${cols}x${rows}:padding=4:color=0x111111`, '-frames:v', '1'], file);
  return { cols, rows, step: info.dur / cells };
}
async function sheet() {
  const file = `${outPrefix}-sheet.png`, s = makeSheet(file, +(opt.cells || 24), +(opt.width || 320));
  console.log(`${file}  (${s.cols}×${s.rows}, one cell every ${s.step.toFixed(2)}s${hasDrawtext ? ', timestamps burned in' : ''})`);
}
async function phone() {
  const file = `${outPrefix}-phone.png`;
  makeSheet(file, +(opt.cells || 12), info.h > info.w ? 180 : 320);
  console.log(`${file}  (feed-size cells: if a word is hard to read here, it is too small or too short on screen)`);
}
// n frames, every `step`-th one, starting at `from` seconds
function stripTile(from, n, step, file, width = 320) {
  const cols = Math.min(n, n > 12 ? 5 : 6), rows = Math.ceil(n / cols), pick = step > 1 ? `select='not(mod(n\\,${step}))',` : '';
  ffOut(['-ss', String(from), '-i', video, '-vf', `${pick}scale=${width}:-2${stamp},tile=${cols}x${rows}:padding=4:color=0x111111`, '-frames:v', '1'], file);
  return file;
}
async function strip() {
  if (opt.at === undefined) die('strip needs --at <seconds>');
  const at = inRange(+opt.at, '--at'), n = +(opt.frames || 12), step = Math.max(1, +(opt.step || 1) | 0), from = Math.max(0, at - n * step / 2 / info.fps);
  const file = stripTile(from, n, step, `${outPrefix}-strip-${at.toFixed(2)}.png`, +(opt.width || 320));
  console.log(`${file}  (${n} frames${step > 1 ? `, every ${step}th` : ' in a row'} from ${from.toFixed(2)}s at ${info.fps.toFixed(0)}fps)`);
}
async function frames() {
  const ts = pos.slice(2).map(Number); if (!ts.length) die('frames needs seconds, e.g. frames out/video.mp4 1.5 4');
  for (const t of ts) console.log(ffOut(['-ss', String(inRange(t, 'time')), '-i', video, '-frames:v', '1'], `${outPrefix}-t${t.toFixed(2)}.png`));
}
// A loop's last frame is one frame step BEFORE the first (render(DUR) = render(0)), so first vs last differ by one step
// of motion: comparing that to a fixed threshold fails every loop with fast full-frame motion. Instead, the seam step
// (last → first) must look like the ordinary steps on either side of it (last-1 → last, first → second).
const ssimOf = (a, b) => { const r = spawnSync('ffmpeg', ['-hide_banner', '-i', a, '-i', b, '-lavfi', 'ssim', '-f', 'null', '-'], { encoding: 'utf8' }).stderr; return +(/All:(-?[\d.]+)/.exec(r)?.[1] ?? NaN); };   // SSIM goes negative for inverted images: keep the sign
async function loop() {
  const n = info.frames; if (n < 4) die(`loop check needs at least 4 frames (got ${n})`);
  const frame = (k, name) => ffOut(['-i', video, '-vf', `select=eq(n\\,${k})`, '-frames:v', '1'], `${outPrefix}-${name}.png`);
  const first = frame(0, 'first'), second = frame(1, 'second'), prev = frame(n - 2, 'before-last'), last = frame(n - 1, 'last');
  const seam = ssimOf(last, first), steps = [ssimOf(prev, last), ssimOf(first, second)];
  if (![seam, ...steps].every(Number.isFinite)) die('could not measure SSIM between the loop frames');
  const ref = Math.min(...steps);
  // seamless = as similar as a normal step (small tolerance for encoder noise), or near-identical outright
  const ok = seam > 0.97 || seam >= ref - 0.03;
  const twice = ffOut(['-stream_loop', '1', '-i', video, '-c', 'copy'], `${outPrefix}-loop2x.mp4`);
  console.log(`loop seam: last→first SSIM ${seam.toFixed(4)} vs ordinary frame steps ${steps.map(s => s.toFixed(4)).join(' / ')} ${ok ? '(seamless)' : '(visible jump)'} · watch ${twice}`);
  return { ok, seam, ref };
}
function detect() {
  const freezeMin = +(opt.freeze || 0.8);
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', video, '-vf', `freezedetect=n=0.0005:d=${freezeMin},blackdetect=d=0.04:pix_th=0.06,select='gt(scene,0.32)',metadata=print:key=lavfi.scene_score:file=-`, '-an', '-f', 'null', '-'], { encoding: 'utf8' });
  if (r.status !== 0) die(`ffmpeg could not analyse ${video}: ${r.stderr.trim().split('\n').pop()}`);
  const txt = r.stdout + '\n' + r.stderr;
  // freezes: pair starts with ends in order; a freeze still open at EOF runs to the end of the video
  const freezes = [];
  for (const m of txt.matchAll(/freeze_(start|end): ([\d.]+)/g)) {
    if (m[1] === 'start') freezes.push([+m[2], null]);
    else if (freezes.length && freezes.at(-1)[1] == null) freezes.at(-1)[1] = +m[2];
  }
  for (const f of freezes) if (f[1] == null) f[1] = info.dur;
  const blacks = [...txt.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map(m => [+m[1], +m[2]]);
  const cuts = [];
  for (const block of r.stdout.split(/(?=frame:)/)) { const t = /pts_time:([\d.]+)/.exec(block), s = /lavfi\.scene_score=([\d.]+)/.exec(block); if (t && s) cuts.push(+t[1]); }
  const fmt = a => a.map(([x, y]) => `${x.toFixed(2)}–${y.toFixed(2)}s`).join(', ');
  return { freezes, blacks, cuts, fmt, freezeMin };
}
// Split freezes into declared holds (timeline.js HOLDS) and the rest. freezedetect needs a few frames to notice a freeze,
// so a freeze counts as a hold when it sits inside a declared window give or take 0.35 s.
async function classifyFreezes(freezes) {
  const tl = await loadTimeline(findTimeline(video, opt.timeline));
  let note = '';
  if (!tl) note = 'no timeline.js found: declare deliberate holds as HOLDS = [[t0, t1]] in timeline.js (or pass --timeline)';
  else if (tl.error) note = `could not read ${tl.file}: ${tl.error}`;
  else if (!sameClock(tl, info.dur)) note = `timeline DUR ${tl.DUR ?? '?'}s ≠ video ${info.dur.toFixed(2)}s (a segment?): HOLDS not applied`;
  else if (!tl.hasHolds) note = 'timeline.js has no HOLDS: declare deliberate holds (end card, a held breath) as HOLDS = [[t0, t1]]';
  const holds = note ? [] : tl.HOLDS;
  const isHold = ([a, b]) => holds.some(([h0, h1]) => a >= h0 - 0.35 && b <= h1 + 0.35);
  return { intended: freezes.filter(isHold), dead: freezes.filter(f => !isHold(f)), note };
}
async function motion() {
  const { freezes, blacks, cuts, fmt, freezeMin } = detect();
  const { intended, dead, note } = await classifyFreezes(freezes);
  const b = [0, ...cuts, info.dur]; let longest = 0; for (let i = 1; i < b.length; i++) longest = Math.max(longest, b[i] - b[i - 1]);
  console.log(`dead air (frozen ≥ ${freezeMin}s): ${dead.length ? fmt(dead) : 'none'}`);
  if (intended.length) console.log(`intended holds (HOLDS in timeline.js): ${fmt(intended)}`);
  else if (note && dead.length) console.log(`  (${note})`);
  console.log(`black frames: ${blacks.length ? fmt(blacks) : 'none'}`);
  console.log(`hard cuts (${cuts.length}): ${cuts.map(c => c.toFixed(2)).join(', ') || 'none'}; longest uncut stretch ${longest.toFixed(2)}s`);
  for (const l of await motionReport(cuts)) console.log(l);
}

// Per shot (SHOTS in timeline.js, else the stretches between hard cuts): how much of the frame changes per step,
// how many steps change nothing, sudden spikes, stutter; plus one-frame flashes. Review material, never pass/fail:
// a quiet style is allowed to be still, a stepped style is allowed to stutter.
async function motionReport(cuts) {
  const prof = await diffProfile(video, info), fps = info.fps;
  const tl = await loadTimeline(findTimeline(video, opt.timeline));
  const clockOk = sameClock(tl, info.dur), holds = clockOk ? tl.HOLDS : [];
  const b = [0, ...cuts, info.dur];
  const segs = clockOk && tl.SHOTS.length ? tl.SHOTS : b.slice(1).map((t1, i) => ({ id: `#${i + 1}`, t0: b[i], t1 })).filter(s => s.t1 - s.t0 >= 0.2);
  const pct = v => `${(v * 100).toFixed(v < 0.1 ? 1 : 0)}%`, ts = a => a.slice(0, 6).map(t => t.toFixed(2)).join(', ') + (a.length > 6 ? ', …' : '') + 's';
  const held = s => holds.some(([h0, h1]) => Math.min(h1, s.t1) - Math.max(h0, s.t0) >= 0.8 * (s.t1 - s.t0));
  const lines = [`motion per ${clockOk && tl.SHOTS.length ? 'shot (SHOTS in timeline.js)' : 'stretch between hard cuts'}: share of the frame changing per frame step · steps where nothing changes · sudden jumps`];
  // a run of 3+ "cuts" each < 0.35 s apart is the picture being regenerated, not editing: measure those steps.
  // One or two close cuts stay cuts (a hit that inverts the frame for a beat and back is two cuts).
  const runs = []; for (const c of cuts) { if (runs.length && c - runs.at(-1).at(-1) < 0.35) runs.at(-1).push(c); else runs.push([c]); }
  const realCuts = runs.filter(r => r.length <= 2).flat();
  for (const r of shotMotion(prof, fps, segs, realCuts)) {
    const head = `  ${r.id.padEnd(10)} ${r.t0.toFixed(2)}–${r.t1.toFixed(2)}s`;
    if (r.moving === undefined) { lines.push(`${head}  (too short to measure)`); continue; }
    const notes = [];
    if (r.still >= 0.95 && !held(r)) notes.push('nothing moves: a deliberate hold (add it to HOLDS) or dead air?');
    if (r.spikes.length) notes.push(`sudden jumps at ${ts(r.spikes)}: a deliberate hit (inversion, smash), whole-frame churn (noise reseeded every few frames reads as flicker) or a glitch? look with strip --at`);
    if (r.alternation > 0.5 && r.still > 0.2 && r.still < 0.8) notes.push('every other step is still: stepped animation (fine if the style steps, but the camera should stay smooth) or duplicated frames');
    lines.push(`${head}  moving ${pct(r.moving)} · still ${pct(r.still)} · jumps ${r.spikes.length}${notes.map(n => `\n      ↳ ${n}`).join('')}`);
  }
  for (const r of bursts(prof, fps)) lines.push(`rapid whole-frame changes ${r.t0.toFixed(2)}–${r.t1.toFixed(2)}s: ${r.n} in a row, one every ~${r.every.toFixed(2)}s — a deliberate fast montage, or strokes / noise / textures regenerated every few frames (reads as flicker: keep positions fixed, vary a parameter continuously)`);
  const fl = prof.flashes.map(k => k / fps);
  lines.push(`flash frames (one frame unlike both neighbours, which match each other): ${fl.length ? ts(fl) + ' — a glitch, a blank frame or a stray layer, unless it is a deliberate one-frame strobe' : 'none'}`);
  return lines;
}

// ── reading a reference video ──
async function grid() {
  const prof = await diffProfile(video, info), fps = info.fps;
  const starts = findStarts(prof, fps, { thresh: +(opt.thresh || 5), debounce: +(opt.debounce || 0.2) });
  const fit = fitGrid(starts, fps, { tol: +(opt.tol || 1.5) });
  const sec = starts.map(f => +(f / fps).toFixed(3));
  const json = `${outPrefix}-grid.json`;
  fs.writeFileSync(json, JSON.stringify({ video: path.basename(video), fps: +info.fps.toFixed(3), duration: +info.dur.toFixed(3), starts: sec, grid: fit }, null, 1));
  console.log(`${starts.length} cut / transition starts: ${sec.map(t => t.toFixed(2)).join(', ') || 'none'}`);
  if (fit) {
    console.log(`grid: one step = ${fit.stepFrames} frames (${fit.stepSec}s), first on ${fit.offsetSec}s; ${fit.inliers}/${fit.total} starts sit on it (worst ${fit.maxResidualFrames} frames off)`);
    console.log(`  BPM if one step is…  ${fit.bpmCandidates.map(c => `${c.step}: ${c.bpm}`).join(' · ') || '(outside 60–200 BPM for every reading)'}`);
    console.log(`  segment lengths in steps: ${fit.unitsPerSegment.join(' ')}   (shrinking numbers = the cut accelerates while the tempo stays)`);
    if (fit.outliers.length) console.log(`  off the grid: ${fit.outliers.join(', ')}s (false detections, or deliberate off-beat cuts)`);
    console.log('  confirm with the music when there is a track: audio.mjs beats <ref> (the picture grid and the beat grid should agree)');
  } else console.log('no regular grid: fewer than 4 starts, or no step holds 80 % of them (cut to phrases, or to the voice, not to a fixed beat)');
  if (opt.strips) {
    const step = Math.max(1, Math.round(fps / 30));
    for (const f of starts) console.log('  ' + stripTile(Math.max(0, (f - 2) / fps), 15, step, `${outPrefix}-start-${(f / fps).toFixed(2)}.png`, 240));
    console.log(`  (15 frames from 2 frames before each start, ${step > 1 ? `every ${step}th frame` : 'every frame'}: read the transition mechanism here, not from a sheet)`);
  }
  console.log(`${json}\nnext: inspect.mjs heat ${path.relative(process.cwd(), video)}  (what moves inside each segment)`);
}

async function heat() {
  const fps = info.fps;
  let cutsAt;
  if (opt.at !== undefined) {
    cutsAt = String(opt.at).split(',').map(Number);
    if (opt.at === true || cutsAt.some(v => !Number.isFinite(v))) die(`bad --at ${opt.at}: segment boundaries in seconds, e.g. --at 1.2,3.4`);
  } else {
    const tl = await loadTimeline(findTimeline(video, opt.timeline));
    if (sameClock(tl, info.dur) && tl.SHOTS.length) cutsAt = tl.SHOTS.slice(1).map(s => s.t0);
    else cutsAt = findStarts(await diffProfile(video, info), fps, { thresh: +(opt.thresh || 5), debounce: +(opt.debounce || 0.2) }).map(f => f / fps);
  }
  const b = [0, ...cutsAt.filter(t => t > 0 && t < info.dur).sort((x, y) => x - y), info.dur];
  const segs = b.slice(1).map((t1, i) => ({ t0: b[i], t1 })).filter(s => s.t1 - s.t0 >= 0.15);
  if (!segs.length) die('no segment is long enough (≥ 0.15 s) to measure');
  const file = `${outPrefix}-heat.png`;
  const areas = await heatmap(video, info, segs, file, { skip: +(opt.skip ?? 0.35) });
  console.log(`${file}  (${segs.length} cells, left to right: each segment's last frame in gray, everything that moved inside it in red)`);
  segs.forEach((s, i) => console.log(`  #${String(i + 1).padEnd(3)} ${s.t0.toFixed(2)}–${s.t1.toFixed(2)}s  ${areas[i] == null ? 'too short' : `${(areas[i] * 100).toFixed(1)}% of the frame moves`}`));
  console.log('Write down what moves and where (a main action plus small loops?), and how much: that is the motion budget to learn, not the imagery.');
}

function loudness(file) {
  const st = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const sum = st.slice(st.lastIndexOf('Summary:'));
  return { I: +(/I:\s+(-?[\d.]+) LUFS/.exec(sum)?.[1] ?? NaN), TP: +(/Peak:\s+(-?[\d.]+) dBFS/.exec(sum)?.[1] ?? NaN) };
}

async function qa() {
  // a typo in the spec must not silently switch a check off
  if (opt.audio !== undefined && !['required', 'none', 'any'].includes(opt.audio)) die(`bad --audio ${opt.audio === true ? '(no value)' : opt.audio}: use required | none | any`);
  if (opt['expect-size'] !== undefined && !/^\d+x\d+$/.test(String(opt['expect-size']))) die(`bad --expect-size ${opt['expect-size']}: use WxH, e.g. 1920x1080`);
  for (const k of ['expect-fps', 'expect-duration']) if (opt[k] !== undefined && !(+opt[k] > 0)) die(`bad --${k} ${opt[k]}: needs a positive number`);
  const checks = [];   // [ok, label, detail]
  const check = (ok, label, detail) => checks.push([ok, label, detail]);
  check(info.dur > 0 && info.frames > 0, 'file decodes', `${info.frames} frames, ${info.dur.toFixed(2)}s`);
  if (opt['expect-size']) check(`${info.w}x${info.h}` === opt['expect-size'], 'size', `${info.w}x${info.h} (expected ${opt['expect-size']})`);
  if (opt['expect-fps']) check(Math.abs(info.fps - +opt['expect-fps']) < 0.01, 'fps', `${info.fps.toFixed(2)} (expected ${opt['expect-fps']})`);
  if (opt['expect-duration']) check(Math.abs(info.dur - +opt['expect-duration']) <= 1.5 / (info.fps || 30) + 0.05, 'duration', `${info.dur.toFixed(3)}s (expected ${opt['expect-duration']}s)`);
  check(Math.abs(info.frames - Math.round(info.dur * info.fps)) <= 2, 'frame count matches duration × fps', `${info.frames} vs ${Math.round(info.dur * info.fps)}`);
  const audioMode = opt.audio || 'any';
  if (audioMode === 'required') check(info.audio, 'audio track present', info.audio ? 'yes' : 'missing');
  if (audioMode === 'none') check(!info.audio, 'no audio track (silent piece)', info.audio ? 'unexpected audio track' : 'ok');
  const { freezes, blacks, cuts, fmt, freezeMin } = detect();
  check(!blacks.length, 'no black frames', blacks.length ? fmt(blacks) : 'none');
  if (info.audio) {
    const { I, TP } = loudness(video);
    check(I > -15.5 && I < -12.5, 'loudness −14 ± 1.5 LUFS', `${I} LUFS`);
    check(TP <= -1, 'true peak ≤ −1 dBTP', `${TP} dBTP`);
  }
  if (opt.loop) { const s = await loop(); check(s.ok, 'loop seam (last→first is an ordinary frame step)', `SSIM ${s.seam.toFixed(4)} vs ordinary steps ≥ ${s.ref.toFixed(4)}`); }

  // what the brief's spec would have checked but nobody asked for: say so, never call that "all passed"
  const unchecked = [['expect-size', 'size'], ['expect-fps', 'fps'], ['expect-duration', 'duration'], ['audio', 'audio track']].filter(([k]) => !opt[k]).map(([, l]) => l);

  console.log(`${video}\n  ${info.w}×${info.h} · ${info.fps.toFixed(2)} fps · ${info.dur.toFixed(2)}s · audio: ${info.audio ? 'yes' : 'no'}\n\nTECHNICAL CHECKS`);
  for (const [ok, label, detail] of checks) console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label} — ${detail}`);
  if (unchecked.length) console.log(`  NOT CHECKED  ${unchecked.join(', ')} — pass --expect-size WxH --expect-fps N --expect-duration S --audio required|none (build.sh does)`);

  console.log('\nREVIEW MATERIAL (not pass/fail: look at it and judge)');
  makeSheet(`${outPrefix}-sheet.png`, +(opt.cells || 24), 320); console.log(`  sheet: ${outPrefix}-sheet.png`);
  makeSheet(`${outPrefix}-phone.png`, 12, info.h > info.w ? 180 : 320); console.log(`  phone: ${outPrefix}-phone.png`);
  const { intended, dead, note } = await classifyFreezes(freezes);
  const frozen = [...(intended.length ? [fmt(intended) + ' (intended hold: HOLDS in timeline.js)'] : []), ...(dead.length ? [fmt(dead) + (note ? ' (intended hold or dead air?)' : ' (not a declared hold: dead air?)')] : [])];
  console.log(`  frozen ≥ ${freezeMin}s: ${frozen.join('; ') || 'none'}`);
  if (dead.length && note) console.log(`    ${note}`);
  console.log(`  hard cuts: ${cuts.map(c => c.toFixed(2)).join(', ') || 'none'}`);
  for (const l of await motionReport(cuts)) console.log('  ' + l);
  if (info.audio) {
    const r = spawnSync(process.execPath, [fileURLToPath(new URL('./audio.mjs', import.meta.url)), 'check', video, '--out', `${outPrefix}-audio`, ...(opt.timeline ? ['--timeline', String(opt.timeline)] : [])], { encoding: 'utf8' });
    process.stdout.write((r.stdout + r.stderr).split('\n').map(l => '  ' + l).join('\n') + '\n');
    if (r.status !== 0) console.log('  ! the audio review material is incomplete (audio check failed above); loudness / peak checks were measured separately');
  }
  const failed = checks.filter(c => !c[0]).length;
  if (failed) console.log(`\n${failed} technical check(s) FAILED: fix before delivery.`);
  else if (unchecked.length) console.log(`\nThe ${checks.length} checks that ran passed, but ${unchecked.join(', ')} were NOT checked: rerun with the brief's spec before calling this accepted.`);
  else console.log('\nAll technical checks passed. Now review the images against references/review.md.');
  process.exit(failed ? 1 : 0);
}

await CMDS[cmd]();
