// Narration preparation and mixing are independent of the existing music tools.
// ffmpeg handles complete audio streams; no multi-minute Float32Array allocation.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { createProvider, retry } from './narration-providers.mjs';
import { narrationClock } from '../../assets/starter/narration.js';

const sha = value => createHash('sha256').update(value).digest('hex');
const json = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const rel = (root, file) => path.relative(root, path.resolve(file)).split(path.sep).join('/');
const round = n => +n.toFixed(6);
const present = file => fs.existsSync(file) && fs.statSync(file).size > 0;
export function ffmpeg(argv) {
  try { return execFileSync('ffmpeg', ['-v', 'error', '-nostdin', '-y', ...argv], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1024 * 1024 }); }
  catch { throw new Error('ffmpeg audio processing failed; check that the input is decodable and ffmpeg is installed'); }
}
export function audioDuration(file) {
  if (!present(file)) throw new Error(`Missing or empty audio file: ${file}`);
  let result;
  try { result = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=codec_type:format=duration', '-of', 'json', file], { encoding: 'utf8' })); }
  catch { throw new Error('Cannot inspect audio; check ffprobe and the input format'); }
  const duration = Number(result.format?.duration);
  if (!result.streams?.length || !(duration > 0 && Number.isFinite(duration))) throw new Error('Input has no decodable audio with a positive duration');
  return duration;
}

function project(root) {
  root = path.resolve(root);
  const audio = path.join(root, 'audio'); fs.mkdirSync(audio, { recursive: true });
  return { root, audio };
}
function tempFile(dir, suffix) { return path.join(dir, `.narration-${process.pid}-${Math.random().toString(36).slice(2)}${suffix}`); }
function normalized(input, out) { ffmpeg(['-i', input, '-map', '0:a:0', '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le', out]); return audioDuration(out); }

export function splitScript(text, maxChars = 500) {
  if (!Number.isInteger(maxChars) || maxChars < 20 || maxChars > 3000) throw new Error('--max-chars must be an integer from 20 to 3000');
  // Split only; never summarize, translate, add words, or generate a script.
  const units = String(text).match(/[^。！？!?\n]+[。！？!?]*|[。！？!?]+/gu) || [];
  const result = [];
  for (let unit of units) {
    unit = unit.trim();
    while (Array.from(unit).length > maxChars) {
      const chars = Array.from(unit), head = chars.slice(0, maxChars).join('');
      const boundary = Math.max(head.lastIndexOf(' '), head.lastIndexOf('，'), head.lastIndexOf(','), head.lastIndexOf('；'), head.lastIndexOf(';'), head.lastIndexOf('. '));
      const cut = boundary > head.length / 2 ? Array.from(head.slice(0, boundary + 1)).length : maxChars;
      result.push(chars.slice(0, cut).join('').trim()); unit = chars.slice(cut).join('').trim();
    }
    if (unit) result.push(unit);
  }
  return result.map((text, i) => ({ id: `n${String(i + 1).padStart(4, '0')}`, text }));
}

export function loadUserScript(file, source, maxChars = 500) {
  if (source !== 'user') throw new Error('TTS requires --source user and a user-provided script; AI-written or rewritten narration is not accepted');
  const content = fs.readFileSync(file, 'utf8');
  let segments;
  if (path.extname(file).toLowerCase() === '.json') {
    const data = JSON.parse(content);
    if (data.source !== 'user' || !Array.isArray(data.segments)) throw new Error('Script JSON needs {source:"user",segments:[{id,text}]}');
    segments = data.segments.map((s, i) => ({ id: String(s.id || `n${String(i + 1).padStart(4, '0')}`), text: s.text }));
    if (segments.some(s => typeof s.text !== 'string' || !s.text.trim() || Array.from(s.text).length > maxChars)) throw new Error('Script JSON segments must contain nonempty text within --max-chars; split long segments without rewriting');
  } else segments = splitScript(content, maxChars);
  if (!segments.length) throw new Error('User script is empty');
  if (new Set(segments.map(s => s.id)).size !== segments.length) throw new Error('Narration segment ids must be unique');
  return { segments, hash: sha(content) };
}

export async function synthesizeNarration({ root, script, source, provider: name, model, voice, duration, maxChars = 500, retries = 2, retryDelayMs = 500, log = console.log, env, fetchImpl } = {}) {
  const p = project(root);
  const input = loadUserScript(script, source, maxChars);
  const limit = duration === undefined ? 1200 : Number(duration);
  if (!(Number.isFinite(limit) && limit > 0 && limit <= 1200)) throw new Error('TTS --duration must be positive and at most 1200 seconds');
  const provider = await createProvider({ name, model, voice, env, fetchImpl });
  const cache = path.join(p.audio, 'narration-cache'); fs.mkdirSync(cache, { recursive: true });
  const segments = []; let clock = 0;
  for (const [i, segment] of input.segments.entries()) {
    const key = sha(JSON.stringify({ text: segment.text, provider: provider.cacheKey, format: 's16le-48000-stereo-v1' }));
    const file = path.join(cache, `${key}.wav`), meta = `${file}.json`;
    let duration, valid = false;
    if (present(file) && present(meta)) {
      try { const saved = JSON.parse(fs.readFileSync(meta)); valid = saved.sha256 === sha(fs.readFileSync(file)); if (valid) duration = audioDuration(file); }
      catch { valid = false; }
    }
    if (!valid) {
      await retry(async () => {
        const raw = tempFile(cache, '.bin'), wav = tempFile(cache, '.wav');
        try {
          await provider.synthesize({ text: segment.text, outFile: raw });
          duration = normalized(raw, wav);
          fs.renameSync(wav, file); json(meta, { sha256: sha(fs.readFileSync(file)), duration });
        } finally { fs.rmSync(raw, { force: true }); fs.rmSync(wav, { force: true }); }
      }, { retries, delayMs: retryDelayMs, onRetry: attempt => log(`narration ${i + 1}/${input.segments.length}: retry ${attempt}`) });
    }
    segments.push({ ...segment, start: round(clock), end: round(clock + duration), file: rel(p.root, file) });
    clock += duration;
    if (clock > limit + 0.002 || (clock >= limit - 0.000001 && i < input.segments.length - 1)) throw new Error(`Narration exceeds the ${limit}s target or leaves no time for remaining script. No further TTS calls will be made; confirm script/duration with the user. Cached segments are retained`);
    log(`narration ${i + 1}/${input.segments.length}: ${valid ? 'cached' : 'built'}, ${duration.toFixed(3)}s`);
  }
  const out = path.join(p.audio, 'narration.wav'), tmp = tempFile(p.audio, '.wav'), list = tempFile(p.audio, '.concat');
  try {
    fs.writeFileSync(list, segments.map(s => `file '${path.resolve(p.root, s.file).replace(/'/g, "'\\''")}'`).join('\n'));
    ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le', tmp]);
    const duration = audioDuration(tmp);
    if (Math.abs(duration - clock) > 0.002) throw new Error('Narration assembly duration does not match its segment timeline');
    fs.renameSync(tmp, out);
    const data = { version: 1, source: { type: 'user-script', provenance: 'user-provided', file: rel(p.root, script), sha256: input.hash }, provider: { id: provider.id, model: provider.model, voice: provider.voice }, alignment: 'tts-segments', duration, file: rel(p.root, out), audioSha256: sha(fs.readFileSync(out)), segments, missing: [] };
    json(path.join(p.audio, 'narration.json'), data); return data;
  } finally { fs.rmSync(tmp, { force: true }); fs.rmSync(list, { force: true }); }
}

export function parseTimestamps(content, extension = '.json') {
  if (extension.toLowerCase() !== '.srt') {
    const data = typeof content === 'string' ? JSON.parse(content) : content;
    return Array.isArray(data) ? data : data.segments;
  }
  const time = value => { const [h, m, s] = value.replace(',', '.').split(':').map(Number); return h * 3600 + m * 60 + s; };
  return content.replace(/\r/g, '').trim().split(/\n\s*\n/).filter(Boolean).map((block, i) => {
    const lines = block.split('\n'), at = lines.findIndex(l => l.includes('-->'));
    const match = /^(\d{2}:\d{2}:\d{2}[,.]\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2}[,.]\d{3})/.exec(lines[at] || '');
    if (!match) throw new Error(`Invalid SRT timestamp in block ${i + 1}`);
    return { id: `n${String(i + 1).padStart(4, '0')}`, start: time(match[1]), end: time(match[2]), text: lines.slice(at + 1).join('\n') };
  });
}
export function validateSegments(segments, duration) {
  if (!Array.isArray(segments) || !segments.length) throw new Error('Timestamps must contain a nonempty segments array');
  let last = 0;
  const ids = new Set();
  const result = segments.map((s, i) => {
    const id = String(s.id || `n${String(i + 1).padStart(4, '0')}`), start = s.start, end = s.end;
    if (ids.has(id) || !Number.isFinite(start) || !Number.isFinite(end) || start < last - 0.000001 || end <= start || end > duration + 0.002 || typeof s.text !== 'string' || !s.text.trim()) throw new Error(`Invalid narration segment ${i + 1}: need unique id, text, ordered nonoverlapping start/end seconds within the audio`);
    ids.add(id); last = end;
    return {
      id, text: s.text, start: round(start), end: round(Math.min(end, duration)),
      ...(s.wordTimingSource !== undefined ? { wordTimingSource: s.wordTimingSource } : {}),
      ...(s.words !== undefined ? { words: Array.isArray(s.words) ? s.words.map(w => ({ text: w?.text, start: w?.start, end: w?.end })) : s.words } : {}),
      ...(s.anchors !== undefined ? { anchors: Array.isArray(s.anchors) ? s.anchors.map(a => ({ text: a?.text, start: a?.start, end: a?.end, ...(a?.occurrence !== undefined ? { occurrence: a.occurrence } : {}) })) : s.anchors } : {}),
    };
  });
  // Optional precise timings survive JSON/ASR import, but never become fabricated
  // word timing. The same pure validator is used by browser and score code.
  if (result.some(s => s.words !== undefined || s.wordTimingSource !== undefined || s.anchors !== undefined)) narrationClock({ duration, segments: result });
  return result;
}

export async function importNarration({ root, audio, timestamps, transcriber, log = console.log } = {}) {
  if (timestamps && transcriber) throw new Error('Use --timestamps or --transcriber, not both');
  const p = project(root), tmp = tempFile(p.audio, '.wav'), out = path.join(p.audio, 'narration.wav');
  const inputHash = sha(fs.readFileSync(audio));
  try {
    const duration = normalized(audio, tmp);
    if (duration > 1200.002) throw new Error('User narration exceeds the 20-minute limit; confirm a shorter recording or revised scope');
    let segments, alignment, timingSource;
    if (!timestamps && !transcriber) {
      const base = audio.slice(0, audio.length - path.extname(audio).length);
      timestamps = [`${base}.segments.json`, `${base}.srt`].find(present);
    }
    if (timestamps) {
      segments = validateSegments(parseTimestamps(fs.readFileSync(timestamps, 'utf8'), path.extname(timestamps)), duration);
      alignment = 'provided-timestamps'; timingSource = { type: 'user-timestamps', file: rel(p.root, timestamps), sha256: sha(fs.readFileSync(timestamps)) };
    } else if (transcriber) {
      const mod = await import(pathToFileURL(path.resolve(transcriber)).href);
      if (typeof mod.transcribe !== 'function') throw new Error('ASR adapter must export transcribe({file}); return {segments:[{id,text,start,end}]} with real timestamps in seconds');
      let result;
      try { result = await mod.transcribe({ file: tmp }); }
      catch { throw new Error('ASR adapter failed (details omitted); supply real timestamp JSON/SRT or inspect the local adapter'); }
      segments = validateSegments(Array.isArray(result) ? result : result?.segments, duration);
      alignment = 'asr-timestamps'; timingSource = { type: 'asr-adapter', file: rel(p.root, transcriber) };
    } else {
      segments = [{ id: 'unresolved', text: '', start: 0, end: duration }]; alignment = 'unresolved';
      log('NEEDS ALIGNMENT: audio imported, but sentence timing is unavailable. Supply --timestamps segments.json|voice.srt or --transcriber /absolute/asr.mjs before narration-driven picture production. No sentence times were guessed.');
    }
    fs.renameSync(tmp, out);
    const data = { version: 1, source: { type: 'user-audio', provenance: 'user-provided', file: rel(p.root, audio), sha256: inputHash }, alignment, ...(timingSource ? { timingSource } : {}), duration, file: rel(p.root, out), audioSha256: sha(fs.readFileSync(out)), segments, missing: alignment === 'unresolved' ? ['sentence-timestamps'] : [] };
    json(path.join(p.audio, 'narration.json'), data); return data;
  } finally { fs.rmSync(tmp, { force: true }); }
}

function sourceTrack(file, source, label) {
  if (!['ai', 'user', 'none'].includes(source)) throw new Error(`--${label}-source must be ai, user, or none`);
  if (!file || file === 'none') {
    if (source !== 'none') throw new Error(`--${label} none requires --${label}-source none`);
    return null;
  }
  if (source === 'none') throw new Error(`--${label} file requires --${label}-source ai|user`);
  audioDuration(file); return path.resolve(file);
}

export async function mixNarration({ root, bgm = 'none', bgmSource = 'none', sfx = 'none', sfxSource = 'none', narration, duration, bgmGain = 0.35, sfxGain = 0.5, duckDb = -16, out, log = console.log } = {}) {
  const p = project(root);
  const music = sourceTrack(bgm, bgmSource, 'bgm'), effects = sourceTrack(sfx, sfxSource, 'sfx');
  const metadataFile = path.join(p.audio, 'narration.json');
  const metadata = present(metadataFile) ? JSON.parse(fs.readFileSync(metadataFile)) : null;
  const voice = narration === 'none' ? null : narration ? path.resolve(narration) : metadata?.file ? path.resolve(p.root, metadata.file) : null;
  const voiceDuration = voice ? audioDuration(voice) : 0;
  if (!(Number.isFinite(bgmGain) && bgmGain >= 0 && Number.isFinite(sfxGain) && sfxGain >= 0 && Number.isFinite(duckDb) && duckDb <= 0)) throw new Error('Track gains must be nonnegative and --duck-db must be zero or negative');
  const maxDuration = Math.max(voiceDuration, music ? audioDuration(music) : 0, effects ? audioDuration(effects) : 0);
  duration = duration === undefined ? maxDuration : Number(duration);
  if (!(Number.isFinite(duration) && duration > 0 && duration <= 1200)) throw new Error('Mix needs a positive --duration of at most 1200 seconds (or audio from which to read it)');
  if (voiceDuration > duration + 0.002) throw new Error('Narration is longer than the requested video. Resolve duration/script/audio with the user; narration will not be cut or sped up automatically');
  let intervals = [];
  if (voice) {
    const matches = metadata?.file && path.resolve(p.root, metadata.file) === voice && Math.abs(metadata.duration - voiceDuration) <= 0.002 && (!metadata.audioSha256 || metadata.audioSha256 === sha(fs.readFileSync(voice)));
    intervals = matches && metadata.alignment !== 'unresolved' ? validateSegments(metadata.segments, voiceDuration).map(s => [Math.max(0, s.start - 0.08), Math.min(duration, s.end + 0.15)]) : [[0, voiceDuration]];
    if (!matches || metadata.alignment === 'unresolved') log('Voice timing unresolved: BGM/SFX are conservatively reduced throughout the narration, without claiming sentence alignment.');
  }
  // Merge neighboring intervals to keep long-film filters compact and avoid pumping.
  intervals = intervals.reduce((a, v) => { if (a.length && v[0] <= a.at(-1)[1] + 0.1) a.at(-1)[1] = Math.max(a.at(-1)[1], v[1]); else a.push(v); return a; }, []);
  const args = [], filters = [], labels = [], sources = [];
  const add = (file, label, source, gain, shouldDuck) => {
    const i = sources.length; sources.push({ role: label, source, file: rel(p.root, file), sha256: sha(fs.readFileSync(file)) }); args.push('-i', file);
    let volume = String(gain);
    if (shouldDuck && intervals.length && duckDb < 0) {
      const mask = intervals.map(([a, b]) => `between(t,${round(a)},${round(b)})`).join('+');
      volume = `'${gain}*if(gt(${mask},0),${10 ** (duckDb / 20)},1)'`;
    }
    filters.push(`[${i}:a:0]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,apad,atrim=duration=${duration},volume=${volume}:eval=frame[${label}]`);
    labels.push(`[${label}]`);
  };
  if (voice) add(voice, 'voice', metadata?.source?.type === 'user-script' ? 'ai-from-user-script' : 'user', 1, false);
  if (music) add(music, 'bgm', bgmSource, bgmGain, true);
  if (effects) add(effects, 'sfx', sfxSource, sfxGain, true);
  if (!sources.length) { args.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo'); filters.push(`[0:a]atrim=duration=${duration}[silence]`); labels.push('[silence]'); }
  filters.push(`${labels.join('')}amix=inputs=${labels.length}:duration=longest:normalize=0,alimiter=limit=0.84:level=0:latency=1,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,atrim=duration=${duration}[final]`);
  out = path.resolve(out || path.join(p.audio, 'final.wav'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const tmp = tempFile(path.dirname(out), '.wav');
  try {
    // Passed as one argv value, never shell code. Adjacent speech ranges are merged
    // above, keeping the expression compact even for a twenty-minute film.
    ffmpeg([...args, '-filter_complex', filters.join(';'), '-map', '[final]', '-t', String(duration), '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le', tmp]);
    const actual = audioDuration(tmp);
    if (Math.abs(actual - duration) > 0.003) throw new Error('Mixed audio duration does not match the requested timeline');
    fs.renameSync(tmp, out);
    const data = { version: 1, duration: actual, file: rel(p.root, out), audioSha256: sha(fs.readFileSync(out)), narration: voice ? 'enabled' : 'none', sources, duckDb, intervals: intervals.map(([start, end]) => ({ start: round(start), end: round(end) })) };
    json(path.join(p.audio, 'mix.json'), data);
    if (!metadata && !voice) json(metadataFile, { version: 1, source: { type: 'none' }, alignment: 'none', duration, segments: [], missing: [] });
    return data;
  } finally { fs.rmSync(tmp, { force: true }); }
}

export function checkNarration({ root, duration, audio } = {}) {
  const p = project(root), metadataFile = path.join(p.audio, 'narration.json');
  if (!present(metadataFile)) throw new Error('Missing audio/narration.json; synthesize/import narration before checking');
  const data = JSON.parse(fs.readFileSync(metadataFile)), checks = [];
  const mixFile = path.join(p.audio, 'mix.json');
  const mix = audio && present(mixFile) ? JSON.parse(fs.readFileSync(mixFile)) : null;
  const record = (name, pass, detail) => checks.push({ name, pass: Boolean(pass), detail });
  // An explicit muted mix can retain prepared narration for later re-enabling.
  // Without --audio, check still validates the prepared narration on its own.
  const hasVoice = data.source?.type !== 'none' && mix?.narration !== 'none';
  record('duration', Number.isFinite(data.duration) && data.duration > 0 && data.duration <= 1200.002, `recorded ${data.duration}s; maximum 1200s`);
  if (hasVoice) {
    record('source', ['user-script', 'user-audio'].includes(data.source?.type) && data.source?.provenance === 'user-provided', 'TTS must use user-provided text; recordings must come from the user');
    record('alignment', ['tts-segments', 'provided-timestamps', 'asr-timestamps'].includes(data.alignment) && Array.isArray(data.missing) && data.missing.length === 0, 'Need real segment timestamps. Supply --timestamps SRT/JSON or an available --transcriber; guessed sentence times are not accepted');
    try { const segments = validateSegments(data.segments, data.duration); record('segments', true, `${segments.length} ordered text segments within the audio`); }
    catch (error) { record('segments', false, error.message); }
    try {
      if (!data.file) throw new Error('Missing narration audio path');
      const file = path.resolve(p.root, data.file), actual = audioDuration(file);
      record('audio-duration', Math.abs(actual - data.duration) <= 0.002, `actual ${actual}s, recorded ${data.duration}s`);
      record('audio-hash', typeof data.audioSha256 === 'string' && data.audioSha256 === sha(fs.readFileSync(file)), 'Narration file must match the audio used to derive the segment timeline');
    } catch (error) { record('audio-file', false, error.message); }
  } else record('alignment', mix?.narration === 'none' || (data.alignment === 'none' && Array.isArray(data.segments) && data.segments.length === 0), 'Explicitly no narration in the checked mix');
  if (duration !== undefined) {
    duration = Number(duration);
    record('target-duration', Number.isFinite(duration) && duration > 0 && duration <= 1200 && (!hasVoice || data.duration <= duration + 0.002), 'Target must be at most 1200 seconds and must not truncate narration');
  }
  if (audio) {
    try {
      const actual = audioDuration(audio), target = duration === undefined ? data.duration : duration;
      record('final-audio-duration', Math.abs(actual - target) <= 0.003, `final ${actual}s, target ${target}s`);
      if (mix) {
        const usedVoice = mix.sources?.find(s => s.role === 'voice');
        record('mixed-voice', hasVoice ? usedVoice && path.resolve(p.root, usedVoice.file) === path.resolve(p.root, data.file || '') && usedVoice.sha256 === data.audioSha256 : !usedVoice, 'Prepared mix must use the checked narration path and audio hash, or explicitly contain no voice');
        record('mixed-output', typeof mix.audioSha256 === 'string' && path.resolve(p.root, mix.file || '') === path.resolve(audio) && mix.audioSha256 === sha(fs.readFileSync(audio)), 'Final audio path/hash must match the current mix record; rebuild after changing any narration');
      } else record('mixed-output', false, 'Missing audio/mix.json; prepare the final mix before checking final audio');
    } catch (error) { record('final-audio-file', false, error.message); }
  }
  const report = { version: 1, pass: checks.every(c => c.pass), duration: hasVoice ? data.duration : (mix?.duration ?? data.duration), alignment: hasVoice ? data.alignment : 'none', checks };
  json(path.join(p.audio, 'narration-qa.json'), report);
  return report;
}
