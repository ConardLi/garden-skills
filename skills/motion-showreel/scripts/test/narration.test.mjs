// Run: node --test test/narration.test.mjs (real ffmpeg, mock TTS/ASR; no paid requests).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createProvider, pcmWav, ProviderError, retry } from '../lib/narration-providers.mjs';
import { audioDuration, splitScript, loadUserScript, synthesizeNarration, importNarration, parseTimestamps, validateSegments, mixNarration, checkNarration } from '../lib/narration.mjs';

const SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspace = t => { const p = fs.mkdtempSync(path.join(os.tmpdir(), 'msr-narration-')); t.after(() => fs.rmSync(p, { recursive: true, force: true })); return p; };
const sine = (file, duration = 1, frequency = 440) => execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `sine=frequency=${frequency}:duration=${duration}:sample_rate=48000`, '-ac', '2', '-c:a', 'pcm_s16le', file]);
const quiet = () => {};

test('TTS only accepts declared user script and splits without adding words', t => {
  const root = workspace(t), script = path.join(root, 'script.txt');
  fs.writeFileSync(script, '第一句。\n第二句！');
  assert.throws(() => loadUserScript(script, 'ai'), /user-provided script/);
  assert.deepEqual(loadUserScript(script, 'user').segments.map(s => s.text), ['第一句。', '第二句！']);
  assert.equal(splitScript('a '.repeat(70), 20).map(s => s.text).join(' ').replace(/\s/g, ''), 'a'.repeat(70));
  const json = path.join(root, 'script.json'); fs.writeFileSync(json, JSON.stringify({ source: 'ai', segments: [{ text: 'x' }] }));
  assert.throws(() => loadUserScript(json, 'user'), /source/);
});

test('Gemini adapter preserves transcript, decodes legacy PCM and current WAV', async t => {
  const root = workspace(t), outFile = path.join(root, 'out.bin'), pcm = Buffer.alloc(4800, 0);
  for (const legacy of [true, false]) {
    let request;
    const wav = pcmWav(pcm);
    const provider = await createProvider({ name: 'gemini', model: legacy ? 'gemini-2.5-flash-preview-tts' : 'gemini-3.8-flash-tts', voice: 'Kore', env: { GEMINI_API_KEY: 'test-secret' }, fetchImpl: async (url, options) => {
      request = JSON.parse(options.body);
      assert.equal(options.headers['x-goog-api-key'], 'test-secret');
      assert.match(url.href, /:generateContent$/);
      return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ inlineData: { data: (legacy ? pcm : wav).toString('base64'), mimeType: legacy ? 'audio/L16;rate=24000' : 'audio/wav' } }] } }] }) };
    } });
    await provider.synthesize({ text: '用户原文，不得改写。', outFile });
    assert.equal(request.contents[0].parts[0].text, '用户原文，不得改写。');
    assert.deepEqual(request.generationConfig.speechConfig.voiceConfig, legacy ? { prebuiltVoiceConfig: { voiceName: 'Kore' } } : { voice: 'Kore' });
    assert.equal(fs.readFileSync(outFile).subarray(0, 4).toString(), 'RIFF');
    assert.ok(Math.abs(audioDuration(outFile) - 0.1) < 0.001);
  }
});

test('MiniMax adapter uses configurable endpoint, hex output, model and voice', async t => {
  const root = workspace(t), outFile = path.join(root, 'out.bin'), wav = pcmWav(Buffer.alloc(4800));
  const provider = await createProvider({ name: 'minimax', model: 'speech-2.8-hd', voice: 'user-voice', env: { MINIMAX_API_KEY: 'test-secret', MINIMAX_TTS_URL: 'https://api.minimaxi.com/v1/t2a_v2' }, fetchImpl: async (url, options) => {
    assert.equal(url.hostname, 'api.minimaxi.com');
    const body = JSON.parse(options.body);
    assert.equal(body.voice_setting.voice_id, 'user-voice'); assert.equal(body.text, '原文'); assert.equal(body.output_format, 'hex'); assert.equal(body.stream, false);
    return { ok: true, json: async () => ({ base_resp: { status_code: 0 }, data: { audio: wav.toString('hex') } }) };
  } });
  await provider.synthesize({ text: '原文', outFile });
  assert.equal(audioDuration(outFile), 0.1);
});

test('HTTP errors are safe and permanent failures are not retried', async () => {
  const provider = await createProvider({ name: 'minimax', model: 'm', voice: 'v', env: { MINIMAX_API_KEY: 'secret-that-must-not-print' }, fetchImpl: async () => ({ ok: false, status: 401, json: async () => ({ error: 'secret-that-must-not-print' }) }) });
  await assert.rejects(provider.synthesize({ text: 'x', outFile: '/unused' }), error => error.retryable === false && !error.message.includes('secret-that'));
  let calls = 0;
  await assert.rejects(retry(async () => { calls++; throw new ProviderError('permanent', false); }, { sleep: async () => {} }));
  assert.equal(calls, 1);
  calls = 0;
  assert.equal(await retry(async () => { if (++calls < 3) throw new ProviderError('temporary', true); return 7; }, { sleep: async () => {} }), 7);
  assert.equal(calls, 3);
});

test('TTS retry/cache uses text+voice+adapter and actual audio durations', async t => {
  const root = workspace(t), script = path.join(root, 'user.txt'), calls = path.join(root, 'calls.txt'), adapter = path.join(root, 'mock.mjs');
  fs.writeFileSync(script, '第一句。\n第二句。');
  fs.writeFileSync(adapter, `import fs from 'node:fs'; import {execFileSync} from 'node:child_process';
    export async function synthesize({text,outFile}) {
      fs.appendFileSync(${JSON.stringify(calls)}, text+'\\n');
      if (!fs.existsSync(${JSON.stringify(path.join(root, 'once'))})) { fs.writeFileSync(${JSON.stringify(path.join(root, 'once'))}, 'yes'); throw new Error('retry once'); }
      execFileSync('ffmpeg',['-v','error','-y','-f','lavfi','-i','sine=frequency=440:duration=0.25:sample_rate=48000','-c:a','pcm_s16le','-f','wav',outFile]);
    }`);
  const options = { root, script, source: 'user', provider: adapter, voice: 'v1', retryDelayMs: 0, log: quiet };
  const first = await synthesizeNarration(options);
  assert.equal(first.duration, 0.5); assert.equal(first.segments[1].start, 0.25); assert.equal(first.segments[1].end, 0.5);
  const count = () => fs.readFileSync(calls, 'utf8').trim().split('\n').length;
  assert.equal(count(), 3);
  await synthesizeNarration(options); assert.equal(count(), 3, 'rerun should use cache');
  fs.writeFileSync(script, '第一句。\n改第二句。');
  await synthesizeNarration(options); assert.equal(count(), 4, 'only changed text rebuilds');
  await synthesizeNarration({ ...options, voice: 'v2' }); assert.equal(count(), 6, 'voice changes invalidate cache');
  fs.writeFileSync(path.resolve(root, first.segments[0].file), 'corrupt');
  await synthesizeNarration(options); assert.equal(count(), 7, 'corrupt cache rebuilds');
  fs.writeFileSync(script, '新第一句。\n新第二句。\n新第三句。');
  await assert.rejects(synthesizeNarration({ ...options, duration: 0.3 }), /No further TTS calls/);
  assert.equal(count(), 9, 'stop after first overrun, before paying for the third segment');
  const leftovers = fs.readdirSync(path.join(root, 'audio')).filter(x => x.startsWith('.narration-'));
  assert.deepEqual(leftovers, []);
});

test('user audio without real timestamps is explicitly unresolved, never guessed', async t => {
  const root = workspace(t), file = path.join(root, 'voice.wav'); sine(file, 1.2);
  const logs = [], data = await importNarration({ root, audio: file, log: x => logs.push(x) });
  assert.equal(data.alignment, 'unresolved'); assert.deepEqual(data.missing, ['sentence-timestamps']);
  assert.equal(data.segments[0].text, ''); assert.equal(data.duration, 1.2); assert.match(logs[0], /No sentence times were guessed/);
  assert.equal(checkNarration({ root }).pass, false, 'unresolved timing cannot pass narration QA');
});

test('SRT/JSON and ASR import preserve real segment timing and reject invalid ranges', async t => {
  const root = workspace(t), file = path.join(root, 'voice.wav'), srt = path.join(root, 'voice.srt'); sine(file, 2);
  fs.writeFileSync(srt, '1\n00:00:00,200 --> 00:00:00,800\n第一句\n\n2\n00:00:01,200 --> 00:00:01,800\n第二句\n');
  const data = await importNarration({ root, audio: file, log: quiet });
  assert.equal(data.alignment, 'provided-timestamps'); assert.equal(data.segments[1].start, 1.2);
  assert.throws(() => validateSegments([{ start: 1, end: 3, text: 'bad' }], 2), /Invalid/);
  assert.throws(() => validateSegments([{ start: null, end: 1, text: 'bad' }], 2), /Invalid/);
  assert.equal(parseTimestamps(JSON.stringify({ segments: data.segments }))[0].text, '第一句');
  const asr = path.join(root, 'asr.mjs'); fs.writeFileSync(asr, 'export async function transcribe({file}) { return {segments:[{id:"a",text:"实际转录",start:0.2,end:1.5}]}; }');
  const result = await importNarration({ root, audio: file, transcriber: asr, log: quiet });
  assert.equal(result.alignment, 'asr-timestamps'); assert.equal(result.segments[0].end, 1.5);
  assert.equal(checkNarration({ root, duration: 2 }).pass, true);
  sine(path.join(root, 'audio/narration.wav'), 2, 660);
  assert.equal(checkNarration({ root, duration: 2 }).pass, false, 'same-duration audio changes must invalidate timestamps');
});

function samples(file, start, end, frequency) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-ss', String(start), '-t', String(end - start), '-i', file, '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], { maxBuffer: 1 << 24 });
  const data = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  let a = 0, b = 0;
  for (let i = 0; i < data.length; i++) { const angle = 2 * Math.PI * frequency * i / 48000; a += data[i] * Math.cos(angle); b += data[i] * Math.sin(angle); }
  return Math.hypot(a, b) / data.length;
}

test('real ffmpeg mix independently tracks provenance and ducks BGM/SFX under voice', async t => {
  const root = workspace(t), voice = path.join(root, 'voice.wav'), bgm = path.join(root, 'music.wav'), sfx = path.join(root, 'fx.wav'), stamps = path.join(root, 'segments.json');
  // Silence outside a declared spoken segment keeps the frequency measurement honest.
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=880:duration=4:sample_rate=48000', '-af', "volume=enable='not(between(t,1,2))':volume=0", voice]);
  sine(bgm, 4, 220); sine(sfx, 4, 330);
  fs.writeFileSync(stamps, JSON.stringify([{ id: 'spoken', text: 'spoken', start: 1, end: 2 }]));
  await importNarration({ root, audio: voice, timestamps: stamps, log: quiet });
  const mix = await mixNarration({ root, bgm, bgmSource: 'ai', sfx, sfxSource: 'user', duration: 4, log: quiet });
  assert.equal(mix.duration, 4); assert.deepEqual(mix.sources.map(s => s.source), ['user', 'ai', 'user']);
  const out = path.resolve(root, mix.file);
  assert.equal(checkNarration({ root, duration: 4, audio: out }).pass, true);
  for (const frequency of [220, 330]) assert.ok(samples(out, 1.3, 1.7, frequency) < samples(out, 2.8, 3.2, frequency) * 0.3, `${frequency} Hz should duck under voice`);
  await assert.rejects(mixNarration({ root, bgm, bgmSource: 'none', duration: 4, log: quiet }), /requires/);
  await assert.rejects(mixNarration({ root, duration: 2, log: quiet }), /longer/);
});

test('tracks can be independently disabled, and a silent final is a valid explicit choice', async t => {
  const root = workspace(t);
  const result = await mixNarration({ root, narration: 'none', bgm: 'none', sfx: 'none', duration: 0.3, log: quiet });
  assert.equal(result.duration, 0.3); assert.deepEqual(result.sources, []);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'audio/narration.json'))).source.type, 'none');
  const voice = path.join(root, 'voice.wav'); sine(voice, 1);
  await importNarration({ root, audio: voice, log: quiet });
  assert.equal(checkNarration({ root }).pass, false, 'prepared narration is still unresolved');
  const muted = await mixNarration({ root, narration: 'none', duration: 0.3, log: quiet });
  assert.equal(checkNarration({ root, duration: 0.3, audio: path.resolve(root, muted.file) }).pass, true, 'explicit mute checks the mix mode, without requiring unused voice alignment');
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'audio/narration.json'))).source.type, 'user-audio', 'retain narration for future re-enabling');
});

test('same-duration narration replacement invalidates an old mix; remix refreshes hashes', async t => {
  const root = workspace(t), voice = path.join(root, 'voice.wav'), stamps = path.join(root, 'segments.json');
  fs.writeFileSync(stamps, JSON.stringify([{ id: 'a', text: 'user recording', start: 0, end: 1 }]));
  sine(voice, 1, 440);
  await importNarration({ root, audio: voice, timestamps: stamps, log: quiet });
  const first = await mixNarration({ root, duration: 1, log: quiet }), final = path.resolve(root, first.file);
  assert.ok(first.sources[0].sha256); assert.ok(first.audioSha256);
  assert.equal(checkNarration({ root, duration: 1, audio: final }).pass, true);
  sine(voice, 1, 880);
  await importNarration({ root, audio: voice, timestamps: stamps, log: quiet });
  const stale = checkNarration({ root, duration: 1, audio: final });
  assert.equal(stale.pass, false);
  assert.equal(stale.checks.find(c => c.name === 'mixed-voice').pass, false, 'same-path input must be bound by content hash');
  await mixNarration({ root, duration: 1, log: quiet });
  assert.equal(checkNarration({ root, duration: 1, audio: final }).pass, true, 'a fresh remix restores validity');
  sine(final, 1, 660);
  const tampered = checkNarration({ root, duration: 1, audio: final });
  assert.equal(tampered.pass, false);
  assert.equal(tampered.checks.find(c => c.name === 'mixed-output').pass, false, 'same-duration final audio replacement must invalidate the mix record');
});

test('CLI rejects missing source/unknown flags without making a request', t => {
  const root = workspace(t), script = path.join(root, 'script.txt'); fs.writeFileSync(script, 'user');
  const r = spawnSync(process.execPath, [path.join(SCRIPTS, 'narration.mjs'), 'tts', root, '--script', script, '--provider', 'gemini'], { encoding: 'utf8' });
  assert.equal(r.status, 1); assert.match(r.stderr, /--source user/);
});
