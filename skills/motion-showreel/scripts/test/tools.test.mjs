// Regression tests for the motion-showreel tools.  Run: cd scripts && npm test   (needs ffmpeg + Playwright)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { args } from '../lib/browser.mjs';
import { seg, spring, springTo, tween, stagger, ease } from '../../assets/starter/motion.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const S = path.resolve(HERE, '..');
const PAGE = path.join(HERE, 'fixtures', 'page');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'msr-test-'));
const node = (script, argv) => spawnSync(process.execPath, [path.join(S, script), ...argv], { encoding: 'utf8' });
const frames = f => parseInt(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', f]).toString(), 10);
const leftovers = dir => fs.readdirSync(dir).filter(n => n.startsWith('.segs-') || n.endsWith('.lock'));

// ── argument parsing ──
test('args: values containing "=" are kept whole', () => {
  const { opt } = args(['--q=mode=ok&x=1', '--out=a=b.mp4', '--fps', '60', '--png']);
  assert.equal(opt.q, 'mode=ok&x=1');
  assert.equal(opt.out, 'a=b.mp4');
  assert.equal(opt.fps, '60');
  assert.equal(opt.png, true);
});

// ── motion helpers never produce NaN ──
test('motion: seg handles empty / infinite windows without NaN', () => {
  assert.equal(seg(1, Infinity, Infinity + 0.25), 0);
  assert.equal(seg(1, 2, 2), 0);
  assert.equal(seg(3, 2, 2), 1);
  assert.equal(ease.inCubic(seg(5, Infinity, Infinity)), 0);
});
test('motion: springs, tweens and stagger stay finite at the edges', () => {
  for (const t of [-1, 0, 0.001, 1, 100]) {
    assert.ok(Number.isFinite(spring(t)));
    assert.ok(Number.isFinite(spring(t, { damp: 1 })));
    assert.ok(Number.isFinite(springTo(t, [[0, 0], [0.5, 10], [0.5, 3]])));
    assert.ok(Number.isFinite(tween(t, [[0, 0], [1, 1]])));
  }
  assert.equal(stagger(0, 1, 2), 0);
  assert.ok(Math.abs(spring(10) - 1) < 1e-6);
});

// ── inspect ──
const tailFreeze = path.join(tmp, 'tailfreeze.mp4');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=size=320x180:rate=30:duration=2', '-vf', 'tpad=stop_mode=clone:stop_duration=2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', tailFreeze]);

test('inspect motion: a freeze that runs to the end of the video is reported', () => {
  const r = node('inspect.mjs', ['motion', tailFreeze, '--out', path.join(tmp, 'q')]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /dead air[^\n]*(1\.9|2\.0)\d–4\.00s/);
});
test('inspect frames: a time outside the video fails and writes nothing', () => {
  const r = node('inspect.mjs', ['frames', tailFreeze, '99', '--out', path.join(tmp, 'f')]);
  assert.equal(r.status, 1);
  assert.ok(!fs.existsSync(path.join(tmp, 'f-t99.00.png')));
});
test('inspect sheet: the image really exists', () => {
  const r = node('inspect.mjs', ['sheet', tailFreeze, '--out', path.join(tmp, 's')]);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(fs.statSync(path.join(tmp, 's-sheet.png')).size > 0);
});
test('inspect qa: a wrong size / missing audio is a FAIL with exit code 1', () => {
  const r = node('inspect.mjs', ['qa', tailFreeze, '--out', path.join(tmp, 'qa'), '--expect-size', '1920x1080', '--audio', 'required']);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /FAIL\s+size/);
  assert.match(r.stdout, /FAIL\s+audio track present/);
});
test('inspect qa: matching expectations pass', () => {
  const r = node('inspect.mjs', ['qa', tailFreeze, '--out', path.join(tmp, 'qa2'), '--expect-size', '320x180', '--expect-fps', '30', '--expect-duration', '4', '--audio', 'none']);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

// ── render ──
test('render: exact frame count, query with "=" reaches the page, no leftovers', () => {
  const out = path.join(tmp, 'ok.mp4');
  const r = node('render.mjs', [PAGE, '--size', '160x90', '--fps', '24', '--workers', '2', '--q=mode=ok&x=1', '--out', out]);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(frames(out), 24);
  assert.deepEqual(leftovers(tmp), []);
});
test('render: a page error fails and publishes nothing', () => {
  const out = path.join(tmp, 'err.mp4');
  const r = node('render.mjs', [PAGE, '--size', '160x90', '--fps', '24', '--q', 'throwAt=0.5', '--out', out]);
  assert.equal(r.status, 1);
  assert.ok(!fs.existsSync(out));
  assert.deepEqual(leftovers(tmp), []);
});
test('render: an encoder that refuses its settings fails fast and publishes nothing', () => {
  const out = path.join(tmp, 'enc.mp4');
  const r = node('render.mjs', [PAGE, '--size', '160x90', '--fps', '24', '--crf', '60', '--out', out]);
  assert.equal(r.status, 1);
  assert.ok(!fs.existsSync(out));
});
test('render: a second render to the same --out is refused while the first runs', async () => {
  const out = path.join(tmp, 'busy.mp4');
  fs.writeFileSync(out + '.lock', String(process.pid));          // this live process "owns" the output
  const r = node('render.mjs', [PAGE, '--size', '160x90', '--out', out]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /another render/);
  fs.rmSync(out + '.lock');
  fs.writeFileSync(out + '.lock', '999999');                      // stale lock from a dead pid is taken over
  const r2 = node('render.mjs', [PAGE, '--size', '160x90', '--fps', '12', '--out', out]);
  assert.equal(r2.status, 0, r2.stderr);
  assert.ok(!fs.existsSync(out + '.lock'));
});
test('render: interruption cleans up temp segments and the lock', async () => {
  const out = path.join(tmp, 'int.mp4');
  const p = spawn(process.execPath, [path.join(S, 'render.mjs'), PAGE, '--size', '640x360', '--fps', '240', '--duration', '1', '--subframes', '4', '--out', out], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 4000));
  p.kill('SIGINT');
  const code = await new Promise(r => p.on('close', r));
  assert.notEqual(code, 0);
  assert.ok(!fs.existsSync(out));
  assert.deepEqual(leftovers(tmp), []);
});
test('render: stills and determinism', () => {
  const r = node('render.mjs', [PAGE, '--size', '160x90', '--still', '0,0.5', '--out', path.join(tmp, 'stills')]);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.readdirSync(path.join(tmp, 'stills')).filter(f => f.endsWith('.png')).length, 2);
  assert.equal(node('render.mjs', [PAGE, '--size', '160x90', '--determinism']).status, 0);
});

// ── audio ──
test('audio build: masters to −14 LUFS under the ceiling', () => {
  const score = path.join(tmp, 'score.mjs');
  fs.writeFileSync(score, `export const DUR = 4;\nexport default S => { S.tempo(120); const d = S.bus('d'); for (let i = 0; i < 8; i++) d.add(S.kick(), S.beat(i)); S.bus('m', { gain: 0.5 }).add(S.pad(S.chord('A3','min7'), 3.5), 0); };\n`);
  const r = node('audio.mjs', ['build', score, '--out', path.join(tmp, 'm.wav')]);
  assert.equal(r.status, 0, r.stderr);
  const m = /(-?[\d.]+) LUFS, sample peak (-?[\d.]+) dBFS/.exec(r.stdout);
  assert.ok(Math.abs(+m[1] + 14) < 0.5, r.stdout);
  assert.ok(+m[2] <= -1.4, r.stdout);
});
test('audio check: a missing file fails', () => {
  assert.equal(node('audio.mjs', ['check', path.join(tmp, 'nope.wav')]).status, 1);
});
