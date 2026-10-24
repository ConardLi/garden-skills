#!/usr/bin/env node
// Persistent chapter builds. Paths in the manifest are relative to the manifest;
// chapter inputs are relative to that chapter's project. No shell commands are evaluated.
// node build-long.mjs film.json [--out out/final.mp4] [--cache .showreel-cache] [--retries 1] [--skip-qa]
// {version:1,duration:1200,size:'1920x1080',fps:30,audio?:'audio/final.wav',
//  chapters:[{id:'intro',project:'chapters/intro',start:0,duration:60,audio?:'audio/intro.wav',
//             inputs?:['index.html','motion.js','timeline.js','assets']}],render?:{workers:3,crf:16}}
// Top-level audio and chapter audio are mutually exclusive. Missing chapter audio becomes silence.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { args } from './lib/browser.mjs';

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const RENDER_KEYS = ['workers', 'subframes', 'shutter', 'dpr', 'grain', 'crf', 'png'];
const IGNORED = new Set(['node_modules', '.git', 'out', 'qa', '.showreel-cache']);
const positive = n => typeof n === 'number' && Number.isFinite(n) && n > 0;
const within = (a, b, tolerance) => Math.abs(a - b) <= tolerance;

export function validateManifest(data, root) {
  if (data.version !== 1) throw new Error('manifest version must be 1');
  if (!positive(data.duration) || data.duration > 1200) throw new Error('manifest duration must be explicit and within 0–1200 seconds');
  if (typeof data.size !== 'string' || !/^\d+x\d+$/.test(data.size)) throw new Error('manifest size must be explicit, e.g. 1920x1080');
  const [w, h] = data.size.split('x').map(Number);
  if (w < 2 || h < 2 || w % 2 || h % 2) throw new Error('manifest size needs positive, even dimensions');
  if (!positive(data.fps) || data.fps > 240) throw new Error('manifest fps must be explicit and within 0–240');
  if (!Array.isArray(data.chapters) || !data.chapters.length) throw new Error('manifest requires explicit chapters');
  if (data.render && (typeof data.render !== 'object' || Array.isArray(data.render))) throw new Error('render must be an object');
  for (const key of Object.keys(data.render || {})) if (!RENDER_KEYS.includes(key)) throw new Error(`unsupported render setting ${key}`);
  const frameAligned = (seconds, label) => { if (!within(seconds * data.fps, Math.round(seconds * data.fps), 1e-6)) throw new Error(`${label} must align to a frame at ${data.fps} fps`); };
  frameAligned(data.duration, 'duration');
  const ids = new Set();
  const chapters = data.chapters.map((chapter, i) => {
    if (typeof chapter.id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(chapter.id) || ids.has(chapter.id)) throw new Error(`chapter ${i + 1} needs a unique safe id`);
    ids.add(chapter.id);
    if (typeof chapter.project !== 'string' || !chapter.project) throw new Error(`${chapter.id}: project is required`);
    if (!positive(chapter.duration)) throw new Error(`${chapter.id}: duration is required`);
    const start = chapter.start ?? 0;
    if (typeof start !== 'number' || !Number.isFinite(start) || start < 0) throw new Error(`${chapter.id}: start must be nonnegative`);
    frameAligned(chapter.duration, `${chapter.id} duration`); frameAligned(start, `${chapter.id} start`);
    if (chapter.inputs && (!Array.isArray(chapter.inputs) || !chapter.inputs.length || chapter.inputs.some(p => typeof p !== 'string' || !p))) throw new Error(`${chapter.id}: inputs must be a nonempty array of dependency paths`);
    const project = path.resolve(root, chapter.project);
    if (!fs.existsSync(path.join(project, 'index.html'))) throw new Error(`${chapter.id}: project has no index.html: ${project}`);
    if (chapter.audio !== undefined && (typeof chapter.audio !== 'string' || !chapter.audio)) throw new Error(`${chapter.id}: audio must be a path`);
    return { ...chapter, project, start, audio: chapter.audio ? path.resolve(root, chapter.audio) : null };
  });
  const sum = chapters.reduce((s, c) => s + c.duration, 0);
  if (!within(sum, data.duration, 1e-6)) throw new Error(`chapter durations total ${sum}s, expected ${data.duration}s`);
  if (data.audio !== undefined && (typeof data.audio !== 'string' || !data.audio)) throw new Error('audio must be a path');
  if (data.audio && chapters.some(c => c.audio)) throw new Error('top-level audio and chapter audio are mutually exclusive');
  return { ...data, chapters, root, audio: data.audio ? path.resolve(root, data.audio) : null };
}

async function hashPaths(hash, paths, exclude, useIgnore) {
  const seen = new Set();
  async function visit(file, label) {
    const abs = path.resolve(file);
    if (exclude.some(p => abs === p || abs.startsWith(p + path.sep)) || seen.has(abs)) return;
    seen.add(abs);
    const stat = fs.lstatSync(abs);
    if (stat.isSymbolicLink()) throw new Error(`source symlinks are not supported; copy the dependency into the project: ${abs}`);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(abs).sort()) {
        if (useIgnore && (IGNORED.has(name) || name.startsWith('.segs-'))) continue;
        await visit(path.join(abs, name), `${label}/${name}`);
      }
    } else if (stat.isFile()) {
      hash.update(`\0${label}\0${stat.size}\0`);
      for await (const chunk of fs.createReadStream(abs)) hash.update(chunk);
    }
  }
  for (const [label, file] of paths) await visit(file, label);
}

export async function chapterHash(chapter, spec, exclude = []) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify({ version: 1, project: chapter.project, start: chapter.start, duration: chapter.duration, size: spec.size, fps: spec.fps, render: spec.render || {} }));
  // Tool changes invalidate cached video too. Project lockfiles are included by default.
  await hashPaths(hash, [['renderer', path.join(SCRIPTS, 'render.mjs')], ['browser', path.join(SCRIPTS, 'lib', 'browser.mjs')], ['dependencies', path.join(SCRIPTS, 'package-lock.json')]], [], false);
  const inputs = chapter.inputs ? chapter.inputs.map(p => [p, path.resolve(chapter.project, p)]) : [['project', chapter.project]];
  await hashPaths(hash, inputs, exclude, !chapter.inputs);
  return hash.digest('hex');
}

function probe(file) {
  const json = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-count_packets', '-of', 'json', file], { maxBuffer: 4 * 1024 * 1024 }).toString());
  const video = json.streams.find(s => s.codec_type === 'video'), audio = json.streams.find(s => s.codec_type === 'audio');
  const rate = video?.r_frame_rate?.split('/').map(Number);
  return { duration: +json.format.duration, video, audio, fps: rate ? rate[0] / rate[1] : 0 };
}
function validVideo(file, chapter, spec) {
  try {
    const p = probe(file), [w, h] = spec.size.split('x').map(Number);
    return !!p.video && !p.audio && p.video.codec_name === 'h264' && p.video.width === w && p.video.height === h && within(p.fps, spec.fps, 0.01) && within(p.duration, chapter.duration, 0.5 / spec.fps + 0.001) && +p.video.nb_read_packets === Math.round(chapter.duration * spec.fps);
  } catch { return false; }
}
function assertAudio(file, duration, label, fps) {
  if (!fs.existsSync(file)) throw new Error(`${label}: audio not found: ${file}`);
  const p = probe(file), actual = +(p.audio?.duration || p.duration);
  if (!p.audio || !Number.isFinite(actual) || !within(actual, duration, 0.05)) throw new Error(`${label}: audio duration ${actual}s must match ${duration}s (50 ms codec tolerance); trim/pad intentionally before building`);
}
const readJson = file => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } };
function saveJson(file, value) { const tmp = `${file}.${process.pid}.tmp`; fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n'); fs.renameSync(tmp, file); }
const concatQuote = file => `file '${file.replace(/'/g, "'\\''")}'`;

export async function runCommand(command, argv, options = {}) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, argv, { stdio: 'inherit', ...options });
    let interruptedBy = null;
    const aborted = signal => Object.assign(new Error(`${path.basename(command)} interrupted (${signal})`), { name: 'AbortError', code: 'ABORT_ERR', signal, interrupted: true });
    const handlers = new Map(['SIGINT', 'SIGTERM', 'SIGHUP'].map(signal => [signal, () => { interruptedBy = signal; child.kill(signal); }]));
    for (const [signal, handler] of handlers) process.once(signal, handler);
    const cleanup = () => { for (const [signal, handler] of handlers) process.removeListener(signal, handler); };
    child.on('error', e => { cleanup(); reject(interruptedBy ? aborted(interruptedBy) : e); });
    child.on('close', (code, signal) => {
      cleanup();
      if (interruptedBy || signal) reject(aborted(interruptedBy || signal));
      else code === 0 ? resolve() : reject(new Error(`${path.basename(command)} failed (${code})`));
    });
  });
}

export async function buildLong(manifestFile, options = {}) {
  const file = path.resolve(manifestFile), root = path.dirname(file), spec = validateManifest(JSON.parse(fs.readFileSync(file, 'utf8')), root);
  const out = path.resolve(root, options.out || 'out/final.mp4'), cache = path.resolve(root, options.cache || '.showreel-cache');
  const retries = options.retries ?? 1, run = options.run || runCommand;
  if (!Number.isInteger(retries) || retries < 0 || retries > 5) throw new Error('retries must be an integer from 0 to 5');
  if (cache === root || spec.chapters.some(c => cache === c.project)) throw new Error('cache must be a separate directory');
  const chapterAudio = spec.chapters.some(c => c.audio);
  if (spec.audio) assertAudio(spec.audio, spec.duration, 'film', spec.fps);
  for (const chapter of spec.chapters) if (chapter.audio) assertAudio(chapter.audio, chapter.duration, chapter.id, spec.fps);
  // Narration projects must validate their alignment and final mix receipt before any
  // expensive render; projects without narration metadata retain the original path.
  const checkNarration = async (project, audio, duration) => {
    if (audio && fs.existsSync(path.join(project, 'audio', 'narration.json'))) await run(process.execPath, [path.join(SCRIPTS, 'narration.mjs'), 'check', project, '--duration', String(duration), '--audio', audio]);
  };
  await checkNarration(root, spec.audio, spec.duration);
  for (const chapter of spec.chapters) await checkNarration(chapter.project, chapter.audio, chapter.duration);
  fs.mkdirSync(cache, { recursive: true }); fs.mkdirSync(path.dirname(out), { recursive: true });
  const lock = path.join(cache, '.build.lock');
  const alive = pid => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
  try { fs.writeFileSync(lock, String(process.pid), { flag: 'wx' }); }
  catch { const pid = +fs.readFileSync(lock, 'utf8'); if (pid && alive(pid)) throw new Error(`another chapter build (pid ${pid}) is using ${cache}`); fs.writeFileSync(lock, String(process.pid)); }
  const report = { rendered: [], reused: [], output: out, accepted: false };
  const staging = path.join(path.dirname(out), `.long-${process.pid}.mp4`), videoFiles = [], audioFiles = [];
  const excluded = [file, cache, out, staging, ...(spec.audio ? [spec.audio] : []), ...spec.chapters.map(c => c.audio).filter(Boolean)];
  try {
    for (const chapter of spec.chapters) {
      const key = await chapterHash(chapter, spec, excluded), segment = path.join(cache, `${chapter.id}.mp4`), metadata = segment + '.json';
      if (readJson(metadata)?.hash === key && validVideo(segment, chapter, spec)) {
        console.log(`chapter ${chapter.id}: cached`); report.reused.push(chapter.id);
      } else {
        const temp = path.join(cache, `${chapter.id}.building.mp4`);
        let succeeded = false;
        for (let attempt = 0; attempt <= retries; attempt++) {
          console.log(`chapter ${chapter.id}: render attempt ${attempt + 1}/${retries + 1}`);
          const argv = [path.join(SCRIPTS, 'render.mjs'), chapter.project, '--size', spec.size, '--fps', String(spec.fps), '--start', String(chapter.start), '--duration', String(chapter.duration), '--out', temp];
          for (const [key, value] of Object.entries(spec.render || {})) { if (key === 'png') { if (value) argv.push('--png'); } else argv.push(`--${key}`, String(value)); }
          try {
            await run(process.execPath, [path.join(SCRIPTS, 'render.mjs'), chapter.project, '--size', spec.size, '--fps', String(spec.fps), '--start', String(chapter.start), '--duration', String(chapter.duration), '--determinism']);
            await run(process.execPath, argv);
            if (!validVideo(temp, chapter, spec)) throw new Error(`${chapter.id}: renderer produced a segment with the wrong video specification`);
            fs.renameSync(temp, segment); saveJson(metadata, { hash: key, id: chapter.id, duration: chapter.duration });
            succeeded = true; break;
          } catch (e) {
            fs.rmSync(temp, { force: true });
            if (e.interrupted || e.name === 'AbortError' || e.code === 'ABORT_ERR' || e.signal || attempt === retries) throw e;
            console.error(`chapter ${chapter.id}: retry after ${e.message}`);
          }
        }
        if (!succeeded) throw new Error(`${chapter.id}: render failed`);
        report.rendered.push(chapter.id);
      }
      videoFiles.push(segment);
      if (chapterAudio) {
        const audioFile = path.join(cache, `${chapter.id}.wav`), audioMeta = audioFile + '.json';
        const audioHash = createHash('sha256').update(JSON.stringify({ duration: chapter.duration, format: 's16le-48000-stereo-v1' }));
        if (chapter.audio) await hashPaths(audioHash, [['audio', chapter.audio]], [], false);
        const key = audioHash.digest('hex');
        let valid = false;
        if (readJson(audioMeta)?.hash === key) { try { assertAudio(audioFile, chapter.duration, chapter.id, spec.fps); valid = true; } catch {} }
        if (!valid) {
          const temp = audioFile.replace(/\.wav$/, '.building.wav');
          const source = chapter.audio ? ['-i', chapter.audio] : ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', String(chapter.duration)];
          try {
            await run('ffmpeg', ['-v', 'error', '-y', ...source, '-vn', '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le', temp]);
            assertAudio(temp, chapter.duration, chapter.id, spec.fps);
            fs.renameSync(temp, audioFile); saveJson(audioMeta, { hash: key });
          } finally { fs.rmSync(temp, { force: true }); }
        }
        audioFiles.push(audioFile);
      }
    }
    const videoList = path.join(cache, 'video-concat.txt'); fs.writeFileSync(videoList, videoFiles.map(concatQuote).join('\n') + '\n');
    const ff = ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', videoList];
    if (audioFiles.length) {
      const audioList = path.join(cache, 'audio-concat.txt'); fs.writeFileSync(audioList, audioFiles.map(concatQuote).join('\n') + '\n');
      ff.push('-f', 'concat', '-safe', '0', '-i', audioList);
    } else if (spec.audio) ff.push('-i', spec.audio);
    ff.push('-map', '0:v:0', '-c:v', 'copy');
    if (audioFiles.length || spec.audio) ff.push('-map', '1:a:0', '-c:a', 'aac', '-b:a', '256k');
    else ff.push('-an');
    ff.push('-movflags', '+faststart', staging);
    await run('ffmpeg', ff);
    // Use the full film clock for QA even when each chapter uses its own local timeline.
    let t0 = 0;
    const timeline = path.join(cache, 'timeline.mjs');
    const shots = spec.chapters.map(c => { const shot = { id: c.id, t0, t1: t0 + c.duration }; t0 += c.duration; return shot; });
    fs.writeFileSync(timeline, `export const DUR=${spec.duration};\nexport const SHOTS=${JSON.stringify(shots)};\nexport const HOLDS=[];\nexport const DROPS=[];\n`);
    if (!options.skipQa) {
      await run(process.execPath, [path.join(SCRIPTS, 'inspect.mjs'), 'qa', staging, '--out', path.join(root, 'qa', 'final'), '--expect-size', spec.size, '--expect-fps', String(spec.fps), '--expect-duration', String(spec.duration), '--audio', audioFiles.length || spec.audio ? 'required' : 'none', '--timeline', timeline]);
      report.accepted = true;
    } else console.log('DRAFT ONLY: --skip-qa bypassed acceptance; this output is not ready for delivery.');
    fs.renameSync(staging, out); saveJson(path.join(cache, 'last-build.json'), { ...report, duration: spec.duration, chapters: shots });
    console.log(`${out}\n  ${report.rendered.length} chapter(s) rendered, ${report.reused.length} reused; ${report.accepted ? 'technical acceptance passed' : 'DRAFT, acceptance skipped'}`);
    return report;
  } finally {
    fs.rmSync(staging, { force: true }); fs.rmSync(lock, { force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const { pos, opt } = args(process.argv.slice(2));
  try {
    if (!pos[0]) throw new Error('usage: build-long.mjs <manifest.json> [--out …] [--cache …] [--retries 1] [--skip-qa]');
    for (const key of Object.keys(opt)) if (!['out', 'cache', 'retries', 'skip-qa'].includes(key)) throw new Error(`unknown option --${key}`);
    await buildLong(pos[0], { out: opt.out, cache: opt.cache, retries: opt.retries === undefined ? 1 : +opt.retries, skipQa: !!opt['skip-qa'] });
  } catch (e) { console.error(`chapter build failed: ${e.message}`); process.exitCode = 1; }
}
