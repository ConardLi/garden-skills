// Regression tests for the motion-showreel tools.  Run: cd scripts && npm test   (needs ffmpeg + Playwright)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { args } from '../lib/browser.mjs';
import { seg, spring, springTo, tween, stagger, ease, camera3d, drawBoxes } from '../../assets/starter/motion.js';

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

test('audio build: a Tone.js score renders offline and is mastered', { skip: !fs.existsSync(path.join(S, 'node_modules', 'tone', 'build', 'Tone.js')) && 'tone not installed' }, () => {
  const dir = fs.mkdtempSync(path.join(tmp, 'tone-'));
  fs.writeFileSync(path.join(dir, 'score.tone.js'), `export const DUR = 3;\nexport default async (Tone, kit) => { const s = new Tone.PolySynth(Tone.Synth).toDestination(); const k = new Tone.MembraneSynth().toDestination(); for (let i = 0; i < 6; i++) k.triggerAttackRelease('C1', '8n', i * 0.5); s.triggerAttackRelease(['A3','C4','E4'], 2.5, 0); };\n`);
  const r = node('audio.mjs', ['build', path.join(dir, 'score.tone.js'), '--out', path.join(dir, 'm.wav')]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /tone score · 3\.00s, -1[34]\.\d LUFS/);
});
// ── motion: 2.5-D camera and boxes ──
test('motion: camera3d top view is a 1:1 flat layout and never degenerates', () => {
  const cam = camera3d({ W: 1920, H: 1080, pitch: Math.PI / 2, yaw: 0, dist: 1000 });
  const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≈ ${b}`);
  const [cx, cy] = cam.project([0, 0, 0]); near(cx, 960); near(cy, 540);
  const [rx, ry] = cam.project([100, 0, 0]); near(rx, 1060); near(ry, 540);        // +x → right, 1:1
  const [, dy] = cam.project([0, 0, 100]); near(dy, 640);                           // +z → down the screen
  for (const v of [...cam.pos, ...cam.up, ...cam.right]) assert.ok(Number.isFinite(v));
  const tilted = camera3d({ W: 1920, H: 1080, pitch: 0.6, yaw: 0.4, dist: 1000, cx: 1200, cy: 700 });
  const [tx, ty] = tilted.project([0, 0, 0]); near(tx, 1200); near(ty, 700);       // the target lands on (cx, cy)
  assert.ok(tilted.project([0, 200, 0])[1] < 700, 'a point above the ground is drawn higher');
});
test('motion: drawBoxes draws visible faces only, far to near', () => {
  const calls = [];
  const ctx = { beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, stroke() {}, fill() { calls.push(this.fillStyle); }, fillStyle: '', strokeStyle: '', lineWidth: 1 };
  const color = { top: 'top', px: 'px', nx: 'nx', pz: 'pz', nz: 'nz' };
  drawBoxes(ctx, camera3d({ W: 100, H: 100, pitch: Math.PI / 2, dist: 1000 }), [{ x: 0, z: 0, w: 10, h: 0, color }]);
  assert.deepEqual(calls, ['top'], 'flat box seen from above = just its top');
  calls.length = 0;
  drawBoxes(ctx, camera3d({ W: 100, H: 100, pitch: 0.6, yaw: 0.5, dist: 1000 }), [{ x: 0, z: 0, w: 10, h: 40, color }]);
  assert.deepEqual(calls.sort(), ['px', 'pz', 'top'], 'camera on the +x/+z side sees +x, +z and the top');
  calls.length = 0;
  const far = { ...color, top: 'far' }, near = { ...color, top: 'near' };
  drawBoxes(ctx, camera3d({ W: 100, H: 100, pitch: 0.6, dist: 1000 }), [{ x: 0, z: 300, w: 10, h: 0, color: near }, { x: 0, z: -300, w: 10, h: 0, color: far }]);
  assert.deepEqual(calls, ['far', 'near']);
});

// ── qa honesty, holds and drops ──
test('inspect qa: without the spec it lists NOT CHECKED and never says all passed', () => {
  const r = node('inspect.mjs', ['qa', tailFreeze, '--out', path.join(tmp, 'qa3'), '--timeline', 'none']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /NOT CHECKED\s+size, fps, duration, audio track/);
  assert.doesNotMatch(r.stdout, /All technical checks passed/);
  const full = node('inspect.mjs', ['qa', tailFreeze, '--out', path.join(tmp, 'qa4'), '--expect-size', '320x180', '--expect-fps', '30', '--expect-duration', '4', '--audio', 'none']);
  assert.doesNotMatch(full.stdout, /NOT CHECKED/);
  assert.match(full.stdout, /All technical checks passed/);
});
test('inspect: freezes inside timeline HOLDS are intended holds, others stay dead air', () => {
  const proj = fs.mkdtempSync(path.join(tmp, 'holds-'));
  fs.mkdirSync(path.join(proj, 'out'));
  const v = path.join(proj, 'out', 'final.mp4'); fs.copyFileSync(tailFreeze, v);
  fs.writeFileSync(path.join(proj, 'timeline.js'), 'export const DUR = 4;\nexport const HOLDS = [[2, 4]];\n');
  const r = node('inspect.mjs', ['motion', v]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /dead air[^\n]*: none/);
  assert.match(r.stdout, /intended holds[^\n]*(1\.9|2\.0)\d–4\.00s/);
  fs.writeFileSync(path.join(proj, 'timeline.js'), 'export const DUR = 4;\nexport const HOLDS = [[0, 1]];\n');
  assert.match(node('inspect.mjs', ['motion', v]).stdout, /dead air[^\n]*(1\.9|2\.0)\d–4\.00s/, 'a hold elsewhere does not excuse this freeze');
  fs.writeFileSync(path.join(proj, 'timeline.js'), 'export const DUR = 9;\nexport const HOLDS = [[2, 4]];\n');
  assert.match(node('inspect.mjs', ['motion', v]).stdout, /dead air[^\n]*(1\.9|2\.0)\d–4\.00s/, 'another clock (a segment) is not trusted');
});
test('audio check: measures the breath before each drop', () => {
  const mk = (name, breath) => {
    const score = path.join(tmp, `${name}.mjs`);
    fs.writeFileSync(score, `export const DUR = 4;\nexport default S => { S.tempo(120); const d = S.bus('d'), m = S.bus('m', { gain: 0.5 });
      for (let i = 0; i < 8; i++) { const t = S.beat(i); if (${breath} && t >= 1.75 && t < 2) continue; d.add(S.hat(), t + S.beat(0.5)); if (!(${breath} && t + 0.25 >= 1.75 && t < 2)) d.add(S.kick(), t); }
      m.add(S.pad(S.chord('A3', 'min7'), ${breath} ? 1.75 : 2), 0); m.add(S.pad(S.chord('A3', 'min7'), 2), 2); d.add(S.impact(), 2, { gain: 1.5 }); d.add(S.crash(), 2); };\n`);
    const wav = path.join(tmp, `${name}.wav`);
    assert.equal(node('audio.mjs', ['build', score, '--out', wav]).status, 0);
    return node('audio.mjs', ['check', wav, '--out', path.join(tmp, name), '--drops', '2']);
  };
  const flat = mk('nobreath', false), held = mk('breath', true);
  assert.match(flat.stdout, /drop @2\.00s/);
  assert.match(flat.stdout, /no audible breath before the drop at 2\.00s/);
  assert.match(held.stdout, /drop @2\.00s/);
  assert.doesNotMatch(held.stdout, /no audible breath/);
});

// ── render: poster and directions ──
test('render: --poster writes out/poster.png; --directions writes singles + a labelled sheet', () => {
  const proj = fs.mkdtempSync(path.join(tmp, 'poster-'));
  fs.copyFileSync(path.join(PAGE, 'index.html'), path.join(proj, 'index.html'));
  const p = node('render.mjs', [proj, '--size', '160x90', '--poster', '0.5']);
  assert.equal(p.status, 0, p.stderr);
  assert.ok(fs.statSync(path.join(proj, 'out', 'poster.png')).size > 0);
  const d = node('render.mjs', [proj, '--size', '160x90', '--directions', 'a,b,c', '--at', '0.2,0.5,0.8']);
  assert.equal(d.status, 0, d.stderr);
  assert.ok(fs.statSync(path.join(proj, 'qa', 'directions.png')).size > 0);
  assert.deepEqual(fs.readdirSync(path.join(proj, 'qa', 'directions')).sort(), ['a_t0.20.png', 'b_t0.50.png', 'c_t0.80.png']);
  const bad = node('render.mjs', [proj, '--size', '160x90', '--directions', 'a,b', '--at', '1,2,3']);
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /3 times for 2 directions/);
});

// ── scaffold + build.sh: the spec drives both the render and the checks ──
const SCAFFOLD = path.join(S, 'scaffold.sh');
test('scaffold: --audio copies only the chosen score and presets build.sh', () => {
  const files = mode => { const d = path.join(tmp, `sc-${mode}`); const r = spawnSync('sh', [SCAFFOLD, d, ...(mode ? ['--audio', mode] : [])], { encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr + r.stdout); return [fs.readdirSync(d).filter(f => f.startsWith('score')).sort(), /^AUDIO=\$\{AUDIO:-(\w+)\}/m.exec(fs.readFileSync(path.join(d, 'build.sh'), 'utf8'))[1]]; };
  assert.deepEqual(files(''), [['score.mjs'], 'synth']);
  assert.deepEqual(files('tone'), [['score.tone.js'], 'tone']);
  assert.deepEqual(files('layer'), [['score.mjs', 'score.tone.js'], 'layer']);
  assert.deepEqual(files('none'), [[], 'none']);
  assert.equal(spawnSync('sh', [SCAFFOLD, path.join(tmp, 'sc-bad'), '--audio', 'piano']).status, 1);
});
test('build.sh: renders, builds the chosen score, and runs qa with the full spec', () => {
  const d = path.join(tmp, 'built');
  assert.equal(spawnSync('sh', [SCAFFOLD, d]).status, 0);
  fs.copyFileSync(path.join(S, '..', 'assets', 'starter', 'score.tone.js'), path.join(d, 'score.tone.js'));   // a stray second score
  const env = { ...process.env, SIZE: '320x180', FPS: '12' };
  const r = spawnSync('sh', [path.join(d, 'build.sh')], { encoding: 'utf8', env });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /score\.tone\.js is ignored \(AUDIO=synth\)/);
  for (const re of [/PASS\s+size — 320x180/, /PASS\s+fps — 12\.00/, /PASS\s+duration — 8\.000s/, /PASS\s+audio track present/, /All technical checks passed/]) assert.match(r.stdout, re);
  assert.doesNotMatch(r.stdout, /NOT CHECKED/);
  const flag = spawnSync('sh', [path.join(d, 'build.sh'), '--fps', '60'], { encoding: 'utf8', env });
  assert.equal(flag.status, 1);
  assert.match(flag.stdout, /FPS \/ SIZE are variables here/);
});

test('audio build: a silent Tone.js score fails loudly', { skip: !fs.existsSync(path.join(S, 'node_modules', 'tone', 'build', 'Tone.js')) && 'tone not installed' }, () => {
  const dir = fs.mkdtempSync(path.join(tmp, 'tone-'));
  fs.writeFileSync(path.join(dir, 'score.tone.js'), `export const DUR = 1;\nexport default async (Tone) => { new Tone.Synth(); };\n`);
  assert.equal(node('audio.mjs', ['build', path.join(dir, 'score.tone.js'), '--out', path.join(dir, 'm.wav')]).status, 1);
});
