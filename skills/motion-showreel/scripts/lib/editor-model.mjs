// Optional editor state. Source files and render(t) are never rewritten.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { audioDuration } from './narration.mjs';

export const digest = value => createHash('sha256').update(value).digest('hex');
const copy = value => JSON.parse(JSON.stringify(value));
const number = (n, min, max) => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
export function localFile(root, relative, { exists = true } = {}) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').includes('..') || /[?#\0]/.test(relative)) throw new Error('Expected a project-relative path');
  const file = path.resolve(root, relative), base = fs.realpathSync(root);
  // Resolve symlinks as well as lexical ..; the editor can only expose project files.
  const real = exists ? fs.realpathSync(file) : fs.realpathSync(path.dirname(file));
  if (!real.startsWith(base + path.sep) && real !== base) throw new Error('File is outside the project');
  if (exists && !fs.statSync(file).isFile()) throw new Error('Expected a file');
  return file;
}
export function readJSON(file, fallback = null) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
export function atomicJSON(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  try { fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n'); fs.renameSync(tmp, file); }
  finally { fs.rmSync(tmp, { force: true }); }
}

export async function discoverEditorProject(root, { size, fps = 30, duration, audio, page = 'index.html' } = {}) {
  const config = readJSON(path.join(root, 'editor.json'), {});
  if (audio !== undefined) localFile(root, audio);
  size ||= config.size;
  if (typeof size !== 'string' || !/^\d+x\d+$/.test(size)) throw new Error('--size WxH is required (or editor.json size)');
  const [w, h] = size.split('x').map(Number);
  if (w < 2 || h < 2 || w > 8192 || h > 8192 || w % 2 || h % 2) throw new Error('Size needs even dimensions within 2–8192');
  if (!number(fps, 1, 240)) throw new Error('fps must be within 1–240');
  duration ??= config.duration;
  const timeline = fs.existsSync(path.join(root, 'timeline.js')) ? await import(pathToFileURL(path.join(root, 'timeline.js')).href) : {};
  duration ??= timeline.DUR;
  if (!number(duration, 0.001, 1200)) throw new Error('Supply --duration seconds, editor.json duration, or timeline.js DUR (up to 1200s)');
  if (Math.abs(duration * fps - Math.round(duration * fps)) > 0.001) throw new Error('Duration must fall on an export frame boundary');
  const mix = readJSON(path.join(root, 'audio/mix.json'));
  const narration = readJSON(path.join(root, 'audio/narration.json'));
  const sources = config.tracks || mix?.sources?.map(s => ({ id: s.role, kind: s.role, file: s.file, gain: mix.gains?.[s.role] ?? (s.role === 'bgm' ? 0.35 : s.role === 'sfx' ? 0.5 : 1) }));
  let files = sources;
  if (!files?.length) {
    // A complete existing mix is one locked track. Never pretend it can be unmixed.
    const found = [audio, config.audio, 'audio/final.wav', narration?.file, 'audio/narration.wav', 'audio/music.wav'].filter(Boolean).find(f => fs.existsSync(path.resolve(root, f)));
    files = found ? [{ id: 'mix', kind: 'mix', name: '原始混音', file: found, gain: 1 }] : [];
  }
  if (files.length > 32) throw new Error('At most 32 tracks');
  const ids = new Set();
  const tracks = files.map((s, i) => {
    const id = s.id || `track-${i + 1}`, kind = s.kind || 'sfx';
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(id) || ids.has(id) || !['voice', 'bgm', 'sfx', 'mix'].includes(kind)) throw new Error('Tracks need unique safe ids and voice/bgm/sfx/mix kind');
    ids.add(id);
    const file = localFile(root, s.file), sourceDuration = audioDuration(file);
    if ((kind === 'voice' || kind === 'mix') && sourceDuration > duration + 1.5 / fps) throw new Error(`${id}: audio exceeds the picture duration; resolve the duration first`);
    const gain = s.gain ?? 1;
    if (!number(gain, 0, 4)) throw new Error('Track gain must be within 0–4');
    return { id, kind, name: s.name || ({ voice: '口播', bgm: '背景音乐', sfx: '音效', mix: '原始混音' })[kind], file: s.file, sourceDuration,
      gain, mute: false, clips: [{ id: `${id}-1`, start: 0, in: 0, duration: Math.min(duration, sourceDuration), gain: 1, fadeIn: 0, fadeOut: 0 }] };
  });
  const baseline = [audio, config.audio, mix?.file, 'audio/final.wav'].filter(Boolean).find(f => fs.existsSync(path.resolve(root, f)));
  if (baseline) localFile(root, baseline);
  // A fallback single track is itself the baseline, including legacy music-only projects.
  const originalAudio = baseline || (tracks.length === 1 ? tracks[0].file : null);
  const intervals = mix?.intervals || [];
  if (!Array.isArray(intervals) || intervals.length > 10000 || intervals.some(i => !number(i.start, 0, duration) || !number(i.end, i.start, duration))) throw new Error('Invalid original ducking intervals');
  const project = { version: 1, name: path.basename(root), size, fps, duration, page, originalAudio, tracks,
    duckDb: mix?.duckDb ?? 0, intervals, notes: [],
    shots: (config.shots || timeline.SHOTS || [{ id: 'scene', t0: 0, t1: duration }]).filter(s => typeof s.id === 'string' && number(s.t0, 0, duration) && number(s.t1, s.t0, duration)).map(s => ({ id: s.id, t0: s.t0, t1: s.t1 })) };
  if (!number(project.duckDb, -80, 0)) throw new Error('Invalid ducking level');
  if (mix?.sources?.length && !mix.gains && !config.tracks) project.notes.push('旧混音未记录各轨增益。未编辑时保留原混音；编辑后使用界面显示的增益重新混音，可在 editor.json 指定原参数。');
  if (tracks.some(t => t.kind === 'mix')) project.notes.push('现有文件只有混音，按单轨显示。要独立编辑，请在 editor.json 提供真实 BGM、口播和音效文件。');
  project.sourceSignature = digest(JSON.stringify({ size, fps, duration, tracks: tracks.map(t => ({ ...t, sha: digest(fs.readFileSync(localFile(root, t.file))) })), original: originalAudio && digest(fs.readFileSync(localFile(root, originalAudio))), duckDb: project.duckDb, intervals }));
  return project;
}

export function initialSession(project) {
  return { version: 1, sourceSignature: project.sourceSignature, tracks: copy(project.tracks) };
}
export function validateSession(input, project) {
  if (!input || input.version !== 1 || input.sourceSignature !== project.sourceSignature || !Array.isArray(input.tracks) || input.tracks.length !== project.tracks.length) throw new Error('Session does not match the current source files; reload or reset the editor');
  const result = initialSession(project);
  let totalClips = 0;
  result.tracks = project.tracks.map((base, index) => {
    const track = input.tracks[index];
    if (!track || track.id !== base.id || track.file !== base.file || track.kind !== base.kind || !number(track.gain, 0, 4) || typeof track.mute !== 'boolean' || !Array.isArray(track.clips)) throw new Error('Invalid track');
    if (['voice', 'mix'].includes(base.kind) && JSON.stringify(track.clips) !== JSON.stringify(base.clips)) throw new Error('Narration and mixed audio timing is locked to the picture');
    const ids = new Set();
    const clips = track.clips.map(c => {
      if (!c || typeof c.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(c.id) || ids.has(c.id) || !number(c.start, 0, project.duration) || !number(c.in, 0, base.sourceDuration) || !number(c.duration, 0.001, project.duration) || c.start + c.duration > project.duration + 0.00001 || c.in + c.duration > base.sourceDuration + 0.00001 || !number(c.gain, 0, 4) || !number(c.fadeIn, 0, c.duration) || !number(c.fadeOut, 0, c.duration) || c.fadeIn + c.fadeOut > c.duration + 0.00001) throw new Error('Invalid clip range, gain or fades');
      ids.add(c.id); return { id: c.id, start: c.start, in: c.in, duration: c.duration, gain: c.gain, fadeIn: c.fadeIn, fadeOut: c.fadeOut };
    });
    totalClips += clips.length;
    return { ...base, gain: track.gain, mute: track.mute, clips };
  });
  if (totalClips > 256) throw new Error('At most 256 audio clips');
  return result;
}
export function isOriginalSession(session, project) { return JSON.stringify(validateSession(session, project)) === JSON.stringify(initialSession(project)); }
export function sessionKey(session, project) { return digest(JSON.stringify(validateSession(session, project))); }
