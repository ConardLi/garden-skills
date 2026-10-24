import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { discoverEditorProject, initialSession, validateSession, digest, localFile } from '../lib/editor-model.mjs';
import { prepareEditorAudio, waveform, newJob } from '../lib/editor-media.mjs';
import { createEditorServer } from '../editor.mjs';

function fixture(t, config = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'showreel-editor-model-'));
  fs.mkdirSync(path.join(root, 'audio'));
  fs.writeFileSync(path.join(root, 'index.html'), '<!doctype html>test');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=4', path.join(root, 'audio/a.wav')]);
  fs.writeFileSync(path.join(root, 'editor.json'), JSON.stringify({ duration: 4, size: '320x180', tracks: [{ id: 'fx', kind: 'sfx', file: 'audio/a.wav' }], ...config }));
  t.after(() => fs.rmSync(root, { recursive: true, force: true })); return root;
}
const rms = (buffer, start, end) => {
  let sum = 0, count = 0;
  for (let i = Math.floor(start * 8000); i < Math.min(end * 8000, buffer.length / 4); i++) { sum += buffer.readFloatLE(i * 4) ** 2; count++; }
  return Math.sqrt(sum / count);
};

test('original soundtrack is reused byte-for-byte; clip edits render only a cached audio file at the requested time', async t => {
  const root = fixture(t, { audio: 'audio/a.wav' }), project = await discoverEditorProject(root);
  const before = digest(fs.readFileSync(path.join(root, 'audio/a.wav')));
  const session = initialSession(project), original = await prepareEditorAudio(root, project, session, newJob('mix'));
  assert.equal(original.file, 'audio/a.wav'); assert.equal(original.original, true);
  session.tracks[0].clips = [{ ...session.tracks[0].clips[0], start: 1, in: 0.5, duration: 1, fadeIn: 0.1, fadeOut: 0.1 }];
  const edited = await prepareEditorAudio(root, project, session, newJob('mix'));
  assert.notEqual(edited.file, original.file);
  const bytes = execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(root, edited.file), '-ac', '1', '-ar', '8000', '-f', 'f32le', '-']);
  assert.ok(rms(bytes, 0.1, 0.8) < 0.0001, 'moved clip leaves silence before start');
  assert.ok(rms(bytes, 1.2, 1.8) > 0.01, 'clip is audible inside its edited range');
  assert.ok(rms(bytes, 2.2, 3) < 0.0001, 'clip ends at its edited out point');
  const modified = fs.statSync(path.join(root, edited.file)).mtimeMs;
  const cached = await prepareEditorAudio(root, project, session, newJob('mix'));
  assert.equal(cached.file, edited.file); assert.equal(fs.statSync(path.join(root, cached.file)).mtimeMs, modified);
  assert.equal(digest(fs.readFileSync(path.join(root, 'audio/a.wav'))), before);
  assert.equal(fs.existsSync(path.join(root, 'out')), false, 'audition never renders an MP4');
  session.tracks[0].mute = true;
  assert.equal((await prepareEditorAudio(root, project, session, newJob('mix'))).file, null, 'explicitly muted tracks produce a silent export');
});

test('voice timing is locked; malicious ranges, duplicate clips, unknown paths and stale sources are rejected', async t => {
  const root = fixture(t, { tracks: [{ id: 'voice', kind: 'voice', file: 'audio/a.wav' }] });
  const project = await discoverEditorProject(root), session = initialSession(project);
  session.tracks[0].clips[0].start = 0.1;
  assert.throws(() => validateSession(session, project), /locked/);
  session.tracks = initialSession(project).tracks; session.tracks[0].file = '../secret.wav';
  assert.throws(() => validateSession(session, project), /Invalid track/);
  assert.throws(() => localFile(root, '../outside'), /relative/);
  fs.symlinkSync(os.tmpdir(), path.join(root, 'escape'));
  assert.throws(() => localFile(root, 'escape'), /outside/);
  const old = initialSession(project);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=880:duration=4', path.join(root, 'audio/a.wav')]);
  const replaced = await discoverEditorProject(root);
  assert.notEqual(replaced.sourceSignature, project.sourceSignature);
  assert.throws(() => validateSession(old, replaced), /current source/);
});

test('waveform uses real audio and is cached; server gates mutations and preserves old project sources', async t => {
  const root = fixture(t), app = await createEditorServer(root);
  t.after(() => app.close());
  const base = new URL(app.url).origin, response = await fetch(base + '/api/project'), data = await response.json();
  const denied = await fetch(base + '/api/session', { method: 'POST', body: JSON.stringify(data.session) });
  assert.equal(denied.status, 403);
  const hostile = await fetch(base + '/api/session', { method: 'POST', headers: { Origin: 'https://example.com', 'X-Showreel-Token': data.token }, body: JSON.stringify(data.session) });
  assert.equal(hostile.status, 403);
  const headers = { 'Content-Type': 'application/json', 'X-Showreel-Token': data.token };
  assert.equal((await fetch(base + '/api/session', { method: 'POST', headers, body: JSON.stringify(data.session) })).status, 200);
  const wave = await waveform(root, data.project.tracks[0]);
  assert.equal(wave.interval, 0.05); assert.ok(wave.peaks.length >= 79); assert.ok(wave.peaks.some(v => v > 0));
  assert.deepEqual(await waveform(root, data.project.tracks[0]), wave);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=4000:duration=4', path.join(root, 'audio/high.wav')]);
  const high = await waveform(root, { file: 'audio/high.wav', sourceDuration: 4 });
  assert.ok(high.peaks.some(v => v > 0.1), 'treble remains visible in the waveform');
  const invalid = structuredClone(data.session); invalid.tracks[0].clips.push(structuredClone(invalid.tracks[0].clips[0]));
  assert.equal((await fetch(base + '/api/session', { method: 'POST', headers, body: JSON.stringify(invalid) })).status, 400);
  const range = await fetch(base + '/project/audio/a.wav', { headers: { Range: 'bytes=0-15' } });
  assert.equal(range.status, 206); assert.equal((await range.arrayBuffer()).byteLength, 16);
  const first = await fetch(base + '/api/jobs', { method: 'POST', headers, body: JSON.stringify({ type: 'mix', session: data.session }) });
  const job = await first.json(); let result = job;
  for (let i = 0; i < 100 && result.status === 'running'; i++) { await new Promise(r => setTimeout(r, 30)); result = await (await fetch(base + '/api/jobs/' + job.id)).json(); }
  assert.equal(result.status, 'complete');
  assert.equal(result.result.file, 'audio/a.wav');
  const state = JSON.parse(fs.readFileSync(path.join(root, '.showreel-editor/session.json')));
  assert.deepEqual(state, data.session);
  assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), '<!doctype html>test');
});
