import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scripts = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'showreel-prepared-'));
after(() => fs.rmSync(tmp, { recursive: true, force: true }));
function scaffold(name) {
  const project = path.join(tmp, name);
  execFileSync('sh', [path.join(scripts, 'scaffold.sh'), project, '--audio', 'file']);
  return project;
}
function wave(file, duration) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `sine=frequency=440:duration=${duration}`, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', file]);
}
function build(project) {
  return spawnSync('sh', ['build.sh'], { cwd: project, encoding: 'utf8', env: { ...process.env, SIZE: '160x90', FPS: '12', TEXTCHECK: '0', AUDIO_FILE: 'audio/final mix.wav' }, timeout: 60000 });
}

test('prepared audio starter preserves paths with spaces and passes complete acceptance', () => {
  const project = scaffold('with spaces');
  assert.ok(!fs.existsSync(path.join(project, 'score.mjs')));
  wave(path.join(project, 'audio', 'final mix.wav'), 8);
  const result = build(project);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /PASS/);
  assert.doesNotMatch(result.stdout, /NOT CHECKED/);
  const streams = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-of', 'json', path.join(project, 'out/final.mp4')], { encoding: 'utf8' })).streams;
  assert.ok(streams.some(s => s.codec_type === 'audio'));
  assert.ok(Math.abs(+streams.find(s => s.codec_type === 'video').duration - 8) < 1 / 12);
});

test('prepared audio duration conflict fails before rendering and leaves no final video', () => {
  const project = scaffold('conflict');
  wave(path.join(project, 'audio', 'final mix.wav'), 9);
  const result = build(project);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /duration conflicts/);
  assert.ok(!fs.existsSync(path.join(project, 'out/final.mp4')));
});

test('starter refuses over twenty minutes before audio synthesis or rendering', () => {
  const project = scaffold('too-long');
  fs.writeFileSync(path.join(project, 'timeline.js'), 'export const DUR=1201;\n');
  const result = build(project);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /at most 1200 seconds/);
  assert.ok(!fs.existsSync(path.join(project, 'out/final.mp4')));
});

test('prepared narration cannot publish when imported speech lacks sentence timestamps', () => {
  const project = scaffold('unresolved'), voice = path.join(project, 'voice.wav');
  wave(voice, 8);
  execFileSync(process.execPath, [path.join(scripts, 'narration.mjs'), 'import', project, '--audio', voice]);
  execFileSync(process.execPath, [path.join(scripts, 'narration.mjs'), 'mix', project, '--duration', '8', '--out', path.join(project, 'audio/final mix.wav')]);
  const result = build(project);
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /FAIL alignment/);
  assert.ok(!fs.existsSync(path.join(project, 'out/final.mp4')));
});
