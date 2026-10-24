// Targeted long-form regressions. No full-length video render is needed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { buildLong, validateManifest, runCommand } from '../build-long.mjs';

const S = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const quietFfmpeg = argv => execFileSync('ffmpeg', ['-v', 'error', '-y', ...argv], { stdio: 'ignore' });
function fixture(t, duration = 1) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'showreel-long-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const id of ['a', 'b']) { fs.mkdirSync(path.join(root, id)); fs.writeFileSync(path.join(root, id, 'index.html'), '<canvas></canvas>'); fs.writeFileSync(path.join(root, id, 'motion.js'), `// ${id}\n`); }
  const spec = { version: 1, duration: duration * 2, size: '64x36', fps: 4, chapters: ['a', 'b'].map(id => ({ id, project: id, start: 0, duration })) };
  const manifest = path.join(root, 'film.json');
  const save = () => fs.writeFileSync(manifest, JSON.stringify(spec)); save();
  const calls = [], failures = new Set();
  const run = async (command, argv) => {
    if (command === process.execPath && argv[0].endsWith('/render.mjs')) {
      if (argv.includes('--determinism')) return; // Chapter cache tests replace rendering; acceptance remains real below.
      const id = path.basename(argv[1]), out = argv[argv.indexOf('--out') + 1], dur = argv[argv.indexOf('--duration') + 1];
      calls.push(id); if (failures.has(id)) throw new Error('injected renderer failure');
      await runCommand('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `testsrc2=s=64x36:r=4:d=${dur}`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', out]);
    } else await runCommand(command, argv);
  };
  return { root, spec, manifest, save, calls, failures, run };
}

test('chapter builds retain completed work after failure, retry only failed work, and invalidate only changed chapters', async t => {
  const f = fixture(t); f.failures.add('b');
  await assert.rejects(buildLong(f.manifest, { run: f.run, skipQa: true, retries: 1 }), /injected renderer failure/);
  assert.deepEqual(f.calls, ['a', 'b', 'b']);
  assert.ok(fs.existsSync(path.join(f.root, '.showreel-cache', 'a.mp4')));
  assert.ok(!fs.existsSync(path.join(f.root, '.showreel-cache', '.build.lock')));
  f.failures.clear(); f.calls.length = 0;
  const resumed = await buildLong(f.manifest, { run: f.run, skipQa: true });
  assert.deepEqual(resumed.reused, ['a']); assert.deepEqual(f.calls, ['b']);
  assert.equal(resumed.accepted, false, 'skipping QA must never claim acceptance');
  f.calls.length = 0;
  const cached = await buildLong(f.manifest, { run: f.run, skipQa: true });
  assert.deepEqual(cached.reused, ['a', 'b']); assert.deepEqual(f.calls, []);
  fs.appendFileSync(path.join(f.root, 'a', 'motion.js'), '// source changed\n');
  const changed = await buildLong(f.manifest, { run: f.run, skipQa: true });
  assert.deepEqual(changed.rendered, ['a']); assert.deepEqual(changed.reused, ['b']);
  // Corrupted segments do not pass simply because their stored hash still matches.
  fs.writeFileSync(path.join(f.root, '.showreel-cache', 'b.mp4'), 'incomplete');
  const repaired = await buildLong(f.manifest, { run: f.run, skipQa: true });
  assert.deepEqual(repaired.rendered, ['b']);
});

test('chapter audio is local, missing tracks receive silence, changing audio reuses video, mismatched lengths fail', async t => {
  const f = fixture(t, 0.5), audio = path.join(f.root, 'a.wav');
  quietFfmpeg(['-f', 'lavfi', '-i', 'sine=frequency=440:duration=0.5', audio]);
  f.spec.chapters[0].audio = 'a.wav'; f.save();
  const built = await buildLong(f.manifest, { run: f.run, skipQa: true });
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', built.output]).toString());
  assert.ok(probe.streams.some(s => s.codec_type === 'audio'));
  assert.ok(Math.abs(+probe.format.duration - 1) < 0.05);
  quietFfmpeg(['-f', 'lavfi', '-i', 'sine=frequency=880:duration=0.5', audio]);
  f.calls.length = 0;
  const changed = await buildLong(f.manifest, { run: f.run, skipQa: true });
  assert.deepEqual(changed.reused, ['a', 'b']); assert.deepEqual(f.calls, []);
  quietFfmpeg(['-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', audio]);
  await assert.rejects(buildLong(f.manifest, { run: f.run, skipQa: true }), /audio duration .* must match/);
  f.spec.audio = 'a.wav'; f.save();
  await assert.rejects(buildLong(f.manifest, { run: f.run, skipQa: true }), /mutually exclusive/);
});

test('interrupted chapter work is never retried, including a real SIGINT forwarded to a child', async t => {
  const f = fixture(t);
  for (const abort of [Object.assign(new Error('cancelled'), { name: 'AbortError' }), Object.assign(new Error('interrupted'), { interrupted: true })]) {
    let calls = 0;
    await assert.rejects(buildLong(f.manifest, { skipQa: true, retries: 2, run: async () => { calls++; throw abort; } }), e => e === abort);
    assert.equal(calls, 1);
    assert.ok(!fs.existsSync(path.join(f.root, '.showreel-cache', '.build.lock')));
  }
  // Signal only an isolated process so the test runner itself cannot intercept Ctrl-C.
  const source = `
    import {buildLong,runCommand} from ${JSON.stringify(pathToFileURL(path.join(S, 'build-long.mjs')).href)};
    let calls=0;
    try { await buildLong(${JSON.stringify(f.manifest)}, {skipQa:true,retries:2,run:async()=>{
      calls++;
      if(calls>1) throw Error('unexpected retry after SIGINT');
      const timer=setTimeout(()=>process.kill(process.pid,'SIGINT'),100);
      try {await runCommand(process.execPath,['-e','setInterval(()=>{},1000)']);} finally {clearTimeout(timer);}
    }}); process.exitCode=1;
    } catch(error) {console.log(JSON.stringify({calls,name:error.name,signal:error.signal,interrupted:error.interrupted}));}
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', source], { encoding: 'utf8', timeout: 10000 });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const receipt = JSON.parse(result.stdout.trim().split('\n').at(-1));
  assert.deepEqual(receipt, { calls: 1, name: 'AbortError', signal: 'SIGINT', interrupted: true });
  assert.doesNotMatch(result.stdout + result.stderr, /attempt 2|retry after/);
  assert.ok(!fs.existsSync(path.join(f.root, '.showreel-cache', '.build.lock')));
});

test('top-level and chapter narration receipts are checked before any rendering', async t => {
  const f = fixture(t), audio = path.join(f.root, 'voice.wav');
  quietFfmpeg(['-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', audio]);
  fs.mkdirSync(path.join(f.root, 'audio')); fs.writeFileSync(path.join(f.root, 'audio', 'narration.json'), '{}');
  f.spec.audio = 'voice.wav'; f.save();
  const commands = [], run = async (command, argv) => { commands.push(argv); throw new Error('unresolved narration or stale mix'); };
  await assert.rejects(buildLong(f.manifest, { skipQa: true, run }), /unresolved narration/);
  assert.equal(commands.length, 1);
  assert.deepEqual(commands[0], [path.join(S, 'narration.mjs'), 'check', f.root, '--duration', '2', '--audio', audio]);
  delete f.spec.audio;
  quietFfmpeg(['-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', audio]);
  fs.mkdirSync(path.join(f.root, 'a', 'audio')); fs.writeFileSync(path.join(f.root, 'a', 'audio', 'narration.json'), '{}');
  f.spec.chapters[0].audio = 'voice.wav'; f.save(); commands.length = 0;
  await assert.rejects(buildLong(f.manifest, { skipQa: true, run }), /unresolved narration/);
  assert.equal(commands.length, 1);
  assert.deepEqual(commands[0], [path.join(S, 'narration.mjs'), 'check', path.join(f.root, 'a'), '--duration', '1', '--audio', audio]);
});

test('manifest requires explicit bounded specifications and frame-aligned chapter durations', t => {
  const f = fixture(t);
  assert.throws(() => validateManifest({ ...f.spec, duration: undefined }, f.root), /duration must be explicit/);
  assert.throws(() => validateManifest({ ...f.spec, duration: 1200.25 }, f.root), /1200/);
  assert.throws(() => validateManifest({ ...f.spec, size: undefined }, f.root), /size must be explicit/);
  assert.throws(() => validateManifest({ ...f.spec, chapters: [] }, f.root), /explicit chapters/);
  assert.throws(() => validateManifest({ ...f.spec, duration: 2.1 }, f.root), /align to a frame/);
  const long = { ...f.spec, duration: 1200, chapters: f.spec.chapters.map(c => ({ ...c, duration: 600 })) };
  assert.equal(validateManifest(long, f.root).duration, 1200);
});

test('chapter assembly runs the real full-spec acceptance before publishing the final file', async t => {
  const f = fixture(t);
  const built = await buildLong(f.manifest, { run: f.run });
  assert.equal(built.accepted, true);
  assert.ok(fs.existsSync(built.output));
  assert.ok(fs.statSync(path.join(f.root, 'qa', 'final-sheet.png')).size > 0);
  assert.ok(!fs.existsSync(path.join(f.root, 'out', `.long-${process.pid}.mp4`)));
});

test('determinism checks a chapter source interval instead of sampling the beginning of the film', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'showreel-interval-')); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'index.html'), `<canvas width="64" height="36"></canvas><script>
    window.DUR=100; window.READY=true;
    window.render=t=>{if(t<20 || t>=21) throw Error('sampled outside chapter');
      const g=document.querySelector('canvas').getContext('2d');g.fillStyle='rgb('+Math.floor(t*10)+',100,100)';g.fillRect(0,0,64,36);};
  </script>`);
  const r = spawnSync(process.execPath, [path.join(S, 'render.mjs'), root, '--size', '64x36', '--fps', '4', '--start', '20', '--duration', '1', '--determinism'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr); assert.match(r.stdout, /deterministic:/);
});

test('20-minute audio loudness measurement does not overflow logs, and decode failures are explicit', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'showreel-meter-')); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const audio = path.join(root, 'twenty-minutes.flac');
  quietFfmpeg(['-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=8000:duration=1200', '-c:a', 'flac', audio]);
  const measured = spawnSync(process.execPath, [path.join(S, 'audio.mjs'), 'loudness', audio], { encoding: 'utf8' });
  assert.equal(measured.status, 0, measured.stderr);
  const result = JSON.parse(measured.stdout); assert.ok(Number.isFinite(result.I)); assert.ok(Number.isFinite(result.TP));
  const bad = path.join(root, 'bad.wav'); fs.writeFileSync(bad, 'not audio');
  const failed = spawnSync(process.execPath, [path.join(S, 'audio.mjs'), 'loudness', bad], { encoding: 'utf8' });
  assert.equal(failed.status, 1); assert.match(failed.stderr, /could not measure audio/); assert.doesNotMatch(failed.stdout, /NaN/);
});

test('streaming audio review writes real images and measures short audio without full-track buffers', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'showreel-review-')); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const audio = path.join(root, 'track.wav'), prefix = path.join(root, 'review');
  quietFfmpeg(['-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', audio]);
  const r = spawnSync(process.execPath, [path.join(S, 'audio.mjs'), 'check', audio, '--out', prefix, '--timeline', 'none'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /duration 2.00s/); assert.match(r.stdout, /streaming analysis/);
  for (const suffix of ['-wave.png', '-spectrum.png']) assert.ok(fs.statSync(prefix + suffix).size > 0);
});
