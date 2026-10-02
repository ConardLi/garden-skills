#!/usr/bin/env node
// Audio toolkit for motion-showreel. You cannot hear: every command prints numbers and draws pictures.
//
//   build  node audio.mjs build <score.mjs | score.tone.js> [--out audio/music.wav] [--dur D] [--lufs -14] [--stems] [--raw]
//          score.mjs      → tier 1: the built-in synth session (export default (S) => {...}), runs in Node.
//          score.tone.js  → tier 2: a Tone.js score rendered offline in the headless browser (samplers, convolution
//                           reverb, effects). Both are mastered to the loudness target (24-bit WAV); --raw skips mastering
//                           (use it when the result is a layer that another score loads with S.load()).
//   samples node audio.mjs samples [salamander]   fetch a licensed sample pack for Tone scores (lists packs without a name)
//   beats  node audio.mjs beats <track.mp3> [--out audio/beats.json] [--bpm 120] [--shift 0.5] [--engine auto|librosa|js]
//          uses librosa for the beat grid when python3 + librosa are available (more robust), the built-in tracker otherwise.
//          Measures a supplied track: bpm, beats, downbeats, onset hits, bar energy and likely drops.
//   check  node audio.mjs check <file.wav|mp4> [--out qa/audio]
//          Loudness (LUFS / true peak), band balance, silences, clipping + waveform & spectrum PNGs.
//   mux    node audio.mjs mux <video.mp4> <audio.wav> [--out final.mp4]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { session, writeWav, loadAudio, lufs, master, SR } from './lib/synth.mjs';
import { renderTone, fetchPack, PACKS, SAMPLES_DIR } from './lib/tone-render.mjs';
import { stft } from './lib/fft.mjs';
import { args, die } from './lib/browser.mjs';

const { pos, opt } = args(process.argv.slice(2));
const cmd = pos[0];
const cmds = { build, beats, check, mux, samples };
if (!cmds[cmd]) die('usage: audio.mjs build|samples|beats|check|mux …  (see the header of this file)');
await cmds[cmd]();

async function build() {
  const file = pos[1] && path.resolve(pos[1]);
  if (!file || !fs.existsSync(file)) die('usage: audio.mjs build <score.mjs | score.tone.js> [--out audio/music.wav]');
  if (/\.tone\.m?js$/.test(file)) return buildTone(file);
  const mod = await import(pathToFileURL(file).href);
  const dur = +(opt.dur || mod.DUR);
  if (!(dur > 0)) die('score needs a duration: export const DUR = <seconds> (or re-export it from timeline.js), or pass --dur');
  const S = session({ dur });
  const t0 = Date.now();
  await (mod.default || mod.score)(S);
  const out = path.resolve(typeof opt.out === 'string' ? opt.out : path.join(path.dirname(file), 'audio', 'music.wav'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  let stems = null;
  if (opt.stems) { stems = path.join(path.dirname(out), 'stems'); fs.mkdirSync(stems, { recursive: true }); }
  const { L, R, lufs: lu } = S.render({ target: +(opt.lufs || -14), stems });
  writeWav(out, L, R);
  let peak = 0; for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  console.log(`${out}\n  ${dur.toFixed(2)}s, ${isFinite(lu) ? lu.toFixed(1) + ' LUFS' : 'silent'}, sample peak ${(20 * Math.log10(peak || 1e-9)).toFixed(1)} dBFS, built in ${((Date.now() - t0) / 1000).toFixed(1)}s${stems ? `\n  stems → ${stems}` : ''}`);
  console.log('  next: node audio.mjs check ' + path.relative(process.cwd(), out));
}

async function buildTone(file) {
  const t0 = Date.now();
  const { L, R } = await renderTone(file, { dur: opt.dur ? +opt.dur : undefined });
  const out = path.resolve(typeof opt.out === 'string' ? opt.out : path.join(path.dirname(file), 'audio', 'music.wav'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const m = opt.raw ? { L, R, lufs: lufs(L, R) } : master(L, R, { target: +(opt.lufs || -14) });
  writeWav(out, m.L, m.R);
  let peak = 0; for (let i = 0; i < m.L.length; i++) peak = Math.max(peak, Math.abs(m.L[i]), Math.abs(m.R[i]));
  console.log(`${out}\n  tone score · ${(m.L.length / SR).toFixed(2)}s, ${isFinite(m.lufs) ? m.lufs.toFixed(1) + ' LUFS' : 'silent'}, sample peak ${(20 * Math.log10(peak || 1e-9)).toFixed(1)} dBFS${opt.raw ? ' (raw, not mastered)' : ''}, built in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  if (!isFinite(m.lufs)) die('the Tone score rendered silence: check that instruments are connected .toDestination() and notes are scheduled inside DUR');
}

async function samples() {
  const name = pos[1];
  if (!name) { console.log(`sample packs (stored in ${SAMPLES_DIR}):`); for (const [k, p] of Object.entries(PACKS)) console.log(`  ${k.padEnd(12)} ${p.licence}`); return; }
  const r = await fetchPack(name);
  console.log(`${r.dir}: ${r.count} files\n  licence: ${r.licence}  → list it in the delivery notes`);
}

function librosaBeats(file) {
  const py = `import json,sys,librosa\ny,sr=librosa.load(sys.argv[1],sr=22050,mono=True)\nt,b=librosa.beat.beat_track(y=y,sr=sr,units='time')\nimport numpy as np\nprint(json.dumps({'bpm':float(np.atleast_1d(t)[0]),'beats':[float(x) for x in b]}))`;
  const r = spawnSync('python3', ['-c', py, file], { encoding: 'utf8' });
  if (r.status !== 0) return null;
  try { return JSON.parse(r.stdout.trim().split('\n').pop()); } catch { return null; }
}

async function beats() {
  const file = pos[1]; if (!file || !fs.existsSync(file)) die('usage: audio.mjs beats <track>');
  const sr = 22050, hop = 256, nfft = 1024;
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'f32le', '-ac', '1', '-ar', String(sr), '-'], { maxBuffer: 1 << 30 });
  const y = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  const spec = stft(y, nfft, hop), fps = sr / hop, n = spec.length;
  if (n < 50) die('track too short to analyse');
  // spectral flux on 24 log-spaced bands (each band counts equally, so hats don't drown the kick)
  const edges = [...Array(25)].map((_, i) => Math.max(1, Math.round(40 * Math.pow(9000 / 40, i / 24) * nfft / sr)));
  const bandsOf = m => edges.slice(0, -1).map((e, i) => { let s = 0; for (let k = e; k < Math.max(e + 1, edges[i + 1]); k++) s += m[k]; return Math.log1p(10 * s / Math.max(1, edges[i + 1] - e)); });
  const B = spec.map(bandsOf), on = new Float64Array(n);
  for (let f = 1; f < n; f++) { let s = 0; for (let k = 0; k < 24; k++) { const d = B[f][k] - B[f - 1][k]; if (d > 0) s += d; } on[f] = s; }
  // low-band (kick) flux decides where the beat sits; the full-band flux finds the tempo
  const lowOn = new Float64Array(n), lowK = Math.ceil(180 * nfft / sr);
  for (let f = 1; f < n; f++) { let s = 0; for (let k = 1; k <= lowK; k++) { const d = Math.log1p(spec[f][k]) - Math.log1p(spec[f - 1][k]); if (d > 0) s += d; } lowOn[f] = s; }
  const z = a => { const m = a.reduce((s, v) => s + v, 0) / n, sd = Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / n) || 1; for (let i = 0; i < n; i++) a[i] = (a[i] - m) / sd; };
  const smooth = a => { const c = Float64Array.from(a); for (let i = 1; i < n - 1; i++) a[i] = 0.25 * c[i - 1] + 0.5 * c[i] + 0.25 * c[i + 1]; };
  smooth(on); smooth(lowOn); z(on); z(lowOn);
  const acc = on.map((v, i) => v + 1.5 * lowOn[i]);
  // tempo by autocorrelation (60–180 BPM, gentle prior around 120) unless given
  let period;
  if (opt.bpm) period = 60 * fps / +opt.bpm;
  else {
    let best = -Infinity, bi = 0; const lo = Math.floor(fps * 60 / 180), hi = Math.ceil(fps * 60 / 60), sc = [];
    for (let l = lo; l <= hi; l++) { let s = 0; for (let i = 0; i + l < n; i++) s += on[i] * on[i + l]; s *= Math.exp(-0.5 * (Math.log2(60 * fps / l / 120) / 0.9) ** 2); sc.push(s); if (s > best) { best = s; bi = l; } }
    const ac = l => { let s = 0; for (let i = 0; i + l < n; i++) s += on[i] * on[i + l]; return s; };
    // octave check: kick/snare patterns make the 2-beat lag strong; prefer the faster tempo when it is well supported
    const half = Math.round(bi / 2), acH = Math.max(ac(half - 1), ac(half), ac(half + 1));
    if (process.env.BEATS_DEBUG) console.error({ bi, half, acBi: ac(bi), acH });
    if (60 * fps / half <= 185 && acH > 0.5 * ac(bi)) bi = [half - 1, half, half + 1].reduce((a, l) => (ac(l) > ac(a) ? l : a), half);
    period = bi;
    const refine = [bi - 1, bi, bi + 1].map(ac), den = refine[0] - 2 * refine[1] + refine[2];
    if (den) period += Math.max(-0.5, Math.min(0.5, 0.5 * (refine[0] - refine[2]) / den));
  }
  const engine = opt.engine || 'auto';
  const lb = engine === 'js' ? null : librosaBeats(file);
  if (engine === 'librosa' && !lb) die('librosa engine requested but python3 + librosa are not available (pip install librosa)');
  const grid = o => { const g = []; for (let t = o; t < n; t += period) g.push(Math.round(t)); return g; };
  let phase = 0, ps = -Infinity;
  for (let o = 0; o < period; o++) { const s = grid(o).reduce((a, i) => a + (acc[i] || 0), 0); if (s > ps) { ps = s; phase = o; } }
  const bt = [], w = Math.max(2, Math.round(period * 0.1));
  if (lb && lb.beats.length > 4 && !opt.bpm) {
    period = 60 * fps / lb.bpm;
    for (const s of lb.beats) bt.push(Math.max(0, Math.round((s - nfft / 2 / sr) * fps)));
  } else for (let t = phase; t < n;) { const c = Math.round(t); let j = c, m = -Infinity; for (let k = Math.max(0, c - w); k <= Math.min(n - 1, c + w); k++) if (acc[k] > m) { m = acc[k]; j = k; } const p = m > 0.5 ? j : c; bt.push(p); t = p + period; }
  const lag = nfft / 2 / sr + (+(opt.shift || 0)) * period / fps, sec = i => +(i / fps + lag).toFixed(3);   // --shift 0.5 moves the grid half a beat
  let d0 = 0, ds = -Infinity; for (let k = 0; k < Math.min(4, bt.length); k++) { const s = bt.filter((_, i) => i % 4 === k).reduce((a, i) => a + lowOn[i], 0); if (s > ds) { ds = s; d0 = k; } }
  const hits = []; let last = -1e9;
  for (let i = 1; i < n - 1; i++) if (on[i] > 2 && on[i] >= on[i - 1] && on[i] >= on[i + 1] && i - last > fps * 0.1) { hits.push(sec(i)); last = i; }
  // energy per bar → likely drops / quiet breaks
  const downs = bt.filter((_, i) => i % 4 === d0).map(sec), dur = y.length / sr, bars = [];
  for (let i = 0; i < downs.length; i++) {
    const a = Math.floor(downs[i] * sr), b = Math.floor((downs[i + 1] ?? dur) * sr); let s = 0; for (let k = a; k < b; k++) s += y[k] * y[k];
    bars.push({ t: downs[i], db: +(10 * Math.log10(s / Math.max(1, b - a) + 1e-12)).toFixed(1) });
  }
  const drops = bars.filter((b, i) => i >= 2 && b.db - (bars[i - 1].db + bars[i - 2].db) / 2 > 4).map(b => b.t);
  const breaks = bars.filter((b, i) => i >= 1 && bars[i - 1].db - b.db > 5).map(b => b.t);
  const res = { engine: lb && !opt.bpm ? 'librosa' : 'js', file: path.basename(file), duration: +dur.toFixed(3), bpm: +(60 * fps / period).toFixed(2), beats: bt.map(sec), downbeats: downs, hits, bars, drops, breaks };
  const out = typeof opt.out === 'string' ? opt.out : null;
  if (out) { fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true }); fs.writeFileSync(out, JSON.stringify(res, null, 1)); }
  else console.log(JSON.stringify(res, null, 1));
  console.error(`bpm ≈ ${res.bpm}, ${res.beats.length} beats, first downbeat ${downs[0]}s, ${hits.length} hits, drops at [${drops.join(', ')}], breaks at [${breaks.join(', ')}]${out ? ' → ' + out : ''}`);
  console.error('Sanity-check the grid: tempo trackers can lock to half/double time. If a known BPM disagrees, rerun with --bpm; if beats sit on the off-beats, rerun with --shift 0.5.');
}

async function check() {
  const file = pos[1]; if (!file || !fs.existsSync(file)) die('usage: audio.mjs check <file>');
  const prefix = path.resolve(typeof opt.out === 'string' ? opt.out : path.join(path.dirname(path.resolve(file)), '..', 'qa', 'audio'));
  fs.mkdirSync(path.dirname(prefix), { recursive: true });
  const st = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const sum = st.slice(st.lastIndexOf('Summary:'));
  const I = +(/I:\s+(-?[\d.]+) LUFS/.exec(sum)?.[1]), LRA = +(/LRA:\s+(-?[\d.]+) LU/.exec(sum)?.[1]), TP = +(/Peak:\s+(-?[\d.inf]+) dBFS/.exec(sum)?.[1]);
  spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-filter_complex', 'showwavespic=s=1600x320:split_channels=1:colors=0x4fd1c5|0xf6ad55', '-frames:v', '1', `${prefix}-wave.png`]);
  spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-lavfi', 'showspectrumpic=s=1600x520:legend=1:scale=log', `${prefix}-spectrum.png`]);
  const { L, R } = loadAudio(file), n = L.length, dur = n / SR;
  const mono = new Float32Array(n); let clip = 0;
  for (let i = 0; i < n; i++) { mono[i] = (L[i] + R[i]) / 2; if (Math.abs(L[i]) >= 0.999 || Math.abs(R[i]) >= 0.999) clip++; }
  // band balance from an averaged spectrum
  const sp = stft(mono, 4096, 2048), bins = new Float64Array(2049);
  for (const f of sp) for (let k = 0; k < f.length; k++) bins[k] += f[k] * f[k];
  // power per octave band (pink noise = flat), in dB relative to the 1 kHz octave
  const band = (a, b) => { let s = 0; for (let k = Math.round(a * 4096 / SR); k < Math.round(b * 4096 / SR); k++) s += bins[k] || 0; return s; };
  const OCT = [31.5, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000], pw = OCT.map(c => band(c / Math.SQRT2, c * Math.SQRT2) + 1e-20);
  const ref = pw[5], db = OCT.map((c, i) => +(10 * Math.log10(pw[i] / ref)).toFixed(1));
  const label = c => (c >= 1000 ? c / 1000 + 'k' : String(c));
  const lowDb = 10 * Math.log10((pw[0] + pw[1] + pw[2]) / 3 / ref), highDb = 10 * Math.log10((pw[7] + pw[8]) / 2 / ref);
  // silences ≥ 0.6 s below −50 dBFS (inside the piece)
  const win = Math.round(0.05 * SR), quiet = []; let runStart = -1;
  for (let s = 0; s + win <= n; s += win) {
    let m = 0; for (let i = s; i < s + win; i++) m += mono[i] * mono[i];
    const db = 10 * Math.log10(m / win + 1e-12);
    if (db < -50) { if (runStart < 0) runStart = s; } else { if (runStart >= 0 && (s - runStart) / SR >= 0.6) quiet.push([+(runStart / SR).toFixed(2), +(s / SR).toFixed(2)]); runStart = -1; }
  }
  const warn = [];
  if (!(I > -15.5 && I < -12.5)) warn.push(`integrated loudness ${I} LUFS is off target (−14 ± 1)`);
  if (TP > -1) warn.push(`true peak ${TP} dBFS is above −1 dBTP (lower the master or limit harder)`);
  if (clip > 10) warn.push(`${clip} clipped samples`);
  if (lowDb > 14) warn.push(`boomy: the 31–125 Hz octaves sit ${lowDb.toFixed(1)} dB above 1 kHz (typical mixes: +4…+12). Cut sub/bass gain, shorten kick decay, high-pass pads/music`);
  if (lowDb < 0) warn.push(`thin: almost no low end (${lowDb.toFixed(1)} dB re 1 kHz); add a kick/sub or bass, unless the piece is deliberately delicate`);
  if (highDb < -24) warn.push(`dull: the 4–8 kHz octaves sit ${highDb.toFixed(1)} dB below 1 kHz (typical: −6…−18). Add hats/shakers, transients, brighter synth cutoffs`);
  if (highDb > -2) warn.push(`harsh/hissy: 4–8 kHz is ${highDb.toFixed(1)} dB re 1 kHz; tame noise layers, hats, risers`);
  if (quiet.length) warn.push(`silences: ${quiet.map(q => q.join('–') + 's').join(', ')} (fine only if intentional, e.g. the breath before a drop)`);
  console.log(`${file}\n  duration ${dur.toFixed(2)}s · ${I} LUFS · LRA ${LRA} LU · true peak ${TP} dBFS · internal LUFS ${lufs(L, R).toFixed(1)}`);
  console.log('  octave power, dB re 1 kHz (pink noise = all 0): ' + OCT.map((c, i) => `${label(c)} ${db[i] > 0 ? '+' : ''}${db[i]}`).join(' · '));
  console.log(`  images: ${prefix}-wave.png, ${prefix}-spectrum.png`);
  console.log(warn.length ? '  WARN\n   - ' + warn.join('\n   - ') : '  OK: loudness, peaks and band balance look sane');
}

async function mux() {
  const [, v, a] = pos; if (!v || !a) die('usage: audio.mjs mux <video.mp4> <audio.wav> [--out final.mp4]');
  const out = typeof opt.out === 'string' ? opt.out : v.replace(/\.mp4$/, '') + '-final.mp4';
  const vd = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', v]).toString().trim();
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', v, '-i', a, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-af', 'apad', '-t', String(vd), '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log(out);
}
