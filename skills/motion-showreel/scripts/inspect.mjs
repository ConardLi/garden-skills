#!/usr/bin/env node
// Look at a rendered video. Two kinds of output, kept apart on purpose:
//   • technical checks (PASS / FAIL, exit code 1 on any FAIL): file, size, fps, duration, frames, audio, black frames, loudness
//   • review material (images + notes) for a human-style look: contact sheets, strips, dead air, cuts, loop seam
//
//   node inspect.mjs qa <video> [--out qa/final] [--expect-size 1920x1080] [--expect-fps 30] [--expect-duration 16]
//                              [--audio required|none|any] [--loop] [--timeline <proj>/timeline.js | none]
//   node inspect.mjs sheet <video> [--cells 24] [--width 320] [--out qa/sheet]
//   node inspect.mjs phone <video> [--out qa/phone]
//   node inspect.mjs strip <video> --at 4.1 [--frames 12] [--width 320]
//   node inspect.mjs frames <video> 1.5 4 9.2 [--out qa/f]
//   node inspect.mjs loop <video>
//   node inspect.mjs motion <video> [--freeze 0.8] [--timeline …]
// qa without --expect-size / --expect-fps / --expect-duration / --audio says which checks did NOT run (never "all passed").
// The project's timeline.js (found next to out/ automatically) may export HOLDS = [[t0, t1], …]: freezes inside a
// declared hold are reported as intended holds instead of dead air.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { args, die } from './lib/browser.mjs';
import { findTimeline, loadTimeline, sameClock } from './lib/project.mjs';

const { pos, opt } = args(process.argv.slice(2));
const [cmd, video] = pos;
const CMDS = { qa, sheet, phone, strip, frames, loop, motion };
if (!CMDS[cmd]) die('usage: inspect.mjs qa|sheet|phone|strip|frames|loop|motion <video> …');
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
async function strip() {
  if (opt.at === undefined) die('strip needs --at <seconds>');
  const at = inRange(+opt.at, '--at'), n = +(opt.frames || 12), from = Math.max(0, at - n / 2 / info.fps), file = `${outPrefix}-strip-${at.toFixed(2)}.png`;
  const cols = Math.min(n, 6), rows = Math.ceil(n / cols);
  ffOut(['-ss', String(from), '-i', video, '-vf', `scale=${+(opt.width || 320)}:-2${stamp},tile=${cols}x${rows}:padding=4:color=0x111111`, '-frames:v', '1'], file);
  console.log(`${file}  (${n} consecutive frames from ${from.toFixed(2)}s at ${info.fps.toFixed(0)}fps)`);
}
async function frames() {
  const ts = pos.slice(2).map(Number); if (!ts.length) die('frames needs seconds, e.g. frames out/video.mp4 1.5 4');
  for (const t of ts) console.log(ffOut(['-ss', String(inRange(t, 'time')), '-i', video, '-frames:v', '1'], `${outPrefix}-t${t.toFixed(2)}.png`));
}
async function loop() {
  const a = ffOut(['-i', video, '-frames:v', '1'], `${outPrefix}-first.png`);
  const b = ffOut(['-sseof', String(-Math.max(1.5 / info.fps, 0.05)), '-i', video, '-update', '1', '-frames:v', '1'], `${outPrefix}-last.png`);
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', a, '-i', b, '-lavfi', 'ssim', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const ssim = +(/All:([\d.]+)/.exec(r)?.[1] ?? NaN);
  const twice = ffOut(['-stream_loop', '1', '-i', video, '-c', 'copy'], `${outPrefix}-loop2x.mp4`);
  console.log(`loop seam: first vs last frame SSIM ${ssim.toFixed(4)} ${ssim > 0.97 ? '(seamless)' : '(visible jump)'} · watch ${twice}`);
  return ssim;
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
}

function loudness(file) {
  const st = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const sum = st.slice(st.lastIndexOf('Summary:'));
  return { I: +(/I:\s+(-?[\d.]+) LUFS/.exec(sum)?.[1] ?? NaN), TP: +(/Peak:\s+(-?[\d.]+) dBFS/.exec(sum)?.[1] ?? NaN) };
}

async function qa() {
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
  let seam = null;
  if (opt.loop) { seam = await loop(); check(seam > 0.97, 'loop seam (first ≈ last frame)', `SSIM ${seam.toFixed(4)}`); }

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
  if (info.audio) {
    const r = spawnSync(process.execPath, [fileURLToPath(new URL('./audio.mjs', import.meta.url)), 'check', video, '--out', `${outPrefix}-audio`, ...(opt.timeline ? ['--timeline', String(opt.timeline)] : [])], { encoding: 'utf8' });
    process.stdout.write((r.stdout + r.stderr).split('\n').map(l => '  ' + l).join('\n') + '\n');
  }
  const failed = checks.filter(c => !c[0]).length;
  if (failed) console.log(`\n${failed} technical check(s) FAILED: fix before delivery.`);
  else if (unchecked.length) console.log(`\nThe ${checks.length} checks that ran passed, but ${unchecked.join(', ')} were NOT checked: rerun with the brief's spec before calling this accepted.`);
  else console.log('\nAll technical checks passed. Now review the images against references/review.md.');
  process.exit(failed ? 1 : 0);
}

await CMDS[cmd]();
