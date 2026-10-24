// Provider adapters use server-side environment credentials. No API response body,
// credential or endpoint is copied into project metadata or error messages.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const hash = value => createHash('sha256').update(value).digest('hex');
export class ProviderError extends Error {
  constructor(message, retryable = false) { super(message); this.retryable = retryable; }
}

export async function retry(operation, { retries = 2, delayMs = 500, sleep = ms => new Promise(r => setTimeout(r, ms)), onRetry = () => {} } = {}) {
  for (let attempt = 0; ; attempt++) {
    try { return await operation(attempt); }
    catch (error) {
      if (attempt >= retries || error.retryable === false) throw error;
      onRetry(attempt + 1);
      await sleep(Math.min(30000, delayMs * 2 ** attempt));
    }
  }
}

function endpoint(value) {
  const u = new URL(value);
  if (u.username || u.password || !['https:', 'http:'].includes(u.protocol)) throw new Error('TTS endpoint must be an HTTP(S) URL without embedded credentials');
  // HTTP is useful for local mock servers; production credentials require HTTPS.
  if (u.protocol === 'http:' && !['127.0.0.1', 'localhost', '[::1]'].includes(u.hostname)) throw new Error('Remote TTS endpoints must use HTTPS');
  return u;
}

async function post(url, headers, payload, { fetchImpl, timeoutMs }) {
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(payload), signal: controller.signal });
    if (!response.ok) throw new ProviderError(`TTS HTTP ${response.status} (response omitted to protect credentials)`, response.status === 429 || response.status >= 500);
    try { return await response.json(); }
    catch { throw new ProviderError('TTS returned invalid JSON or an incomplete body', true); }
  }
  catch (error) { if (error instanceof ProviderError) throw error; throw new ProviderError('TTS request failed or timed out (check endpoint and connectivity)', true); }
  finally { clearTimeout(timer); }
}

// Older Gemini TTS models return headerless mono s16le PCM at 24 kHz.
export function pcmWav(bytes, rate = 24000) {
  if (!bytes.length || bytes.length % 2 || !Number.isInteger(rate) || rate < 8000 || rate > 192000) throw new ProviderError('Invalid Gemini PCM audio', false);
  const header = Buffer.alloc(44);
  header.write('RIFF'); header.writeUInt32LE(bytes.length + 36, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24); header.writeUInt32LE(rate * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write('data', 36); header.writeUInt32LE(bytes.length, 40);
  return Buffer.concat([header, bytes]);
}

export async function createProvider({ name, model, voice, env = process.env, fetchImpl = globalThis.fetch } = {}) {
  const timeoutMs = Number(env.SHOWREEL_TTS_TIMEOUT_MS || 90000);
  if (!(timeoutMs > 0 && Number.isFinite(timeoutMs))) throw new Error('SHOWREEL_TTS_TIMEOUT_MS must be positive');
  if (name === 'gemini') {
    model ||= env.GEMINI_TTS_MODEL;
    voice ||= env.GEMINI_TTS_VOICE;
    if (!model || !voice) throw new Error('Gemini TTS needs --model/--voice or GEMINI_TTS_MODEL/GEMINI_TTS_VOICE');
    if (!env.GEMINI_API_KEY) throw new Error('Set GEMINI_API_KEY in the environment');
    const base = (env.GEMINI_TTS_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
    const url = endpoint(`${base}/models/${encodeURIComponent(model)}:generateContent`);
    // 2.5 / 3.1 use prebuiltVoiceConfig; newer documented models use voiceConfig.voice.
    const schema = env.GEMINI_TTS_SCHEMA || (/^gemini-(2\.|3\.1)/.test(model) ? 'legacy' : 'voice');
    if (!['legacy', 'voice'].includes(schema)) throw new Error('GEMINI_TTS_SCHEMA must be legacy or voice');
    return {
      id: 'gemini', model, voice, cacheKey: hash(JSON.stringify({ provider: 'gemini-v1', model, voice, url: url.href, schema })),
      async synthesize({ text, outFile }) {
        const voiceConfig = schema === 'legacy' ? { prebuiltVoiceConfig: { voiceName: voice } } : { voice };
        const data = await post(url, { 'x-goog-api-key': env.GEMINI_API_KEY }, {
          contents: [{ role: 'user', parts: [{ text }] }],
          generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig } },
        }, { fetchImpl, timeoutMs });
        const parts = data.candidates?.[0]?.content?.parts?.filter(p => p.inlineData?.data) || [];
        if (!parts.length) throw new ProviderError('Gemini returned no audio (check model, voice or safety response)', false);
        const mime = parts[0].inlineData.mimeType || '';
        if (parts.some(p => (p.inlineData.mimeType || '') !== mime)) throw new ProviderError('Gemini returned mixed audio formats', false);
        let bytes = Buffer.concat(parts.map(p => Buffer.from(p.inlineData.data, 'base64')));
        if (/audio\/(?:l16|pcm)/i.test(mime)) bytes = pcmWav(bytes, Number(/rate=(\d+)/.exec(mime)?.[1] || 24000));
        else if (parts.length > 1) throw new ProviderError('Gemini returned multiple container audio blocks; use a shorter script segment', false);
        if (!bytes.length) throw new ProviderError('Gemini returned empty audio', true);
        fs.writeFileSync(outFile, bytes);
      },
    };
  }
  if (name === 'minimax') {
    model ||= env.MINIMAX_TTS_MODEL;
    voice ||= env.MINIMAX_TTS_VOICE;
    if (!model || !voice) throw new Error('MiniMax TTS needs --model/--voice or MINIMAX_TTS_MODEL/MINIMAX_TTS_VOICE');
    if (!env.MINIMAX_API_KEY) throw new Error('Set MINIMAX_API_KEY in the environment');
    const url = endpoint(env.MINIMAX_TTS_URL || 'https://api.minimax.io/v1/t2a_v2');
    const speed = Number(env.MINIMAX_TTS_SPEED || 1);
    if (!(speed >= 0.5 && speed <= 2)) throw new Error('MINIMAX_TTS_SPEED must be between 0.5 and 2');
    return {
      id: 'minimax', model, voice, cacheKey: hash(JSON.stringify({ provider: 'minimax-v1', model, voice, url: url.href, speed })),
      async synthesize({ text, outFile }) {
        const data = await post(url, { Authorization: `Bearer ${env.MINIMAX_API_KEY}` }, {
          model, text, stream: false, output_format: 'hex', language_boost: 'auto',
          voice_setting: { voice_id: voice, speed, vol: 1, pitch: 0 },
          audio_setting: { sample_rate: 32000, bitrate: 128000, format: 'mp3', channel: 1 },
        }, { fetchImpl, timeoutMs });
        const code = data.base_resp?.status_code;
        if (code !== undefined && Number(code) !== 0) throw new ProviderError(`MiniMax API status ${Number(code)} (details omitted)`, [1001, 1002, 1039].includes(Number(code)));
        const audio = data.data?.audio;
        if (typeof audio !== 'string' || !/^(?:[a-f\d]{2})+$/i.test(audio)) throw new ProviderError('MiniMax returned no valid hex audio', false);
        fs.writeFileSync(outFile, Buffer.from(audio, 'hex'));
      },
    };
  }
  if (!name) throw new Error('Choose --provider gemini|minimax|/absolute/custom.mjs');
  const file = path.resolve(name);
  if (!fs.existsSync(file)) throw new Error('Unknown TTS provider; use gemini, minimax, or an existing local .mjs adapter');
  const mod = await import(pathToFileURL(file).href);
  if (typeof mod.synthesize !== 'function') throw new Error('Custom TTS adapter must export synthesize({text,outFile,model,voice})');
  return {
    id: 'custom', model: model || null, voice: voice || null,
    cacheKey: hash(JSON.stringify({ module: hash(fs.readFileSync(file)), model, voice, version: env.SHOWREEL_TTS_CACHE_VERSION || '' })),
    async synthesize({ text, outFile }) {
      // Custom adapters are trusted local code and read their own credentials from env.
      try { await mod.synthesize({ text, outFile, model, voice }); }
      catch (error) { throw new ProviderError(`Custom TTS adapter failed${error.retryable === false ? ' permanently' : ''} (inspect the local adapter; error details omitted)`, error.retryable !== false); }
    },
  };
}
