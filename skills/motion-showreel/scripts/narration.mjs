#!/usr/bin/env node
// New opt-in narration pipeline; does not change audio.mjs or short-film scores.
import { args } from './lib/browser.mjs';
import { synthesizeNarration, importNarration, mixNarration, checkNarration } from './lib/narration.mjs';

const HELP = `Narration: user script/audio → actual segment timings → voice-led pictures → mix
  node narration.mjs tts <project> --script user.txt --source user --provider gemini|minimax|/absolute/custom.mjs --model MODEL --voice VOICE
  node narration.mjs import <project> --audio voice.wav [--timestamps voice.srt|segments.json | --transcriber /absolute/asr.mjs]
  node narration.mjs mix <project> --bgm music.wav --bgm-source ai|user --sfx fx.wav --sfx-source ai|user [--duration SECONDS]
  node narration.mjs check <project> [--duration SECONDS --audio audio/final.wav]
  Disable tracks: --bgm none --bgm-source none --sfx none --sfx-source none --narration none
  Optional: tts --duration SECONDS --max-chars 500 --retries 2; mix --bgm-gain 0.35 --sfx-gain 0.5 --duck-db -16 --out audio/final.wav
  Credentials: GEMINI_API_KEY / MINIMAX_API_KEY (environment only).
  TTS only speaks user-provided text. Missing sentence timestamps are explicitly unresolved.
  Outputs: audio/narration.wav, audio/narration.json; mix → audio/final.wav, audio/mix.json.`;
const { pos, opt } = args(process.argv.slice(2));
const [command, root] = pos;
const number = (name, fallback) => opt[name] === undefined ? fallback : Number(opt[name]);
try {
  if (opt.help || !command || command === 'help') console.log(HELP);
  else {
    if (!root || pos.length !== 2) throw new Error('Supply exactly one project directory after tts, import, mix, or check');
    const allowed = {
      tts: ['script', 'source', 'provider', 'model', 'voice', 'duration', 'max-chars', 'retries'],
      import: ['audio', 'timestamps', 'transcriber'],
      mix: ['bgm', 'bgm-source', 'sfx', 'sfx-source', 'narration', 'duration', 'bgm-gain', 'sfx-gain', 'duck-db', 'out'],
      check: ['duration', 'audio'],
    }[command];
    if (!allowed) throw new Error('Unknown command; use tts, import, mix, or check');
    for (const [key, value] of Object.entries(opt)) {
      if (!allowed.includes(key)) throw new Error(`Unknown option --${key}`);
      if (value === true) throw new Error(`--${key} requires a value`);
    }
    let result;
    if (command === 'tts') {
      if (!opt.script || !opt.provider) throw new Error('tts requires --script, --source user, and --provider');
      const retries = number('retries', 2);
      if (!Number.isInteger(retries) || retries < 0 || retries > 5) throw new Error('--retries must be an integer from 0 to 5');
      result = await synthesizeNarration({ root, script: opt.script, source: opt.source, provider: opt.provider, model: opt.model, voice: opt.voice, duration: number('duration'), maxChars: number('max-chars', 500), retries });
    } else if (command === 'import') {
      if (!opt.audio) throw new Error('import requires --audio');
      result = await importNarration({ root, audio: opt.audio, timestamps: opt.timestamps, transcriber: opt.transcriber });
    } else if (command === 'check') {
      result = checkNarration({ root, duration: number('duration'), audio: opt.audio });
      for (const check of result.checks) console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}: ${check.detail}`);
      if (!result.pass) process.exitCode = 1;
    } else result = await mixNarration({ root, bgm: opt.bgm, bgmSource: opt['bgm-source'], sfx: opt.sfx, sfxSource: opt['sfx-source'], narration: opt.narration, duration: number('duration'), bgmGain: number('bgm-gain', 0.35), sfxGain: number('sfx-gain', 0.5), duckDb: number('duck-db', -16), out: opt.out });
    console.log(`${result.file || 'audio/narration.wav'} · ${result.duration.toFixed(3)}s${result.alignment ? ` · alignment=${result.alignment}` : ''}`);
    if (result.missing?.length) console.log(`Missing: ${result.missing.join(', ')}`);
  }
} catch (error) { console.error(`✗ ${error.message}`); process.exitCode = 1; }
