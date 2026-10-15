// Tier-2 audio: render a Tone.js score offline (OfflineAudioContext) inside the headless browser.
// Score file:  <name>.tone.js  — a browser ES module next to timeline.js:
//   export const DUR = 16;
//   export default async function (Tone, kit) { ... schedule on kit.transport / absolute times ... }
// kit = { DUR, transport, sample(pack, file?) → URL, salamander() → Sampler urls map, baseUrl(pack), loaded: Tone.loaded }
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadChromium, launch, serve, die } from './browser.mjs';

const SCRIPTS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SAMPLES_DIR = process.env.SHOWREEL_SAMPLES || path.join(SCRIPTS_DIR, 'samples');

function findTone(projectDir) {
  for (const base of [SCRIPTS_DIR, projectDir, process.cwd()]) {
    const f = path.join(base, 'node_modules', 'tone', 'build', 'Tone.js');
    if (fs.existsSync(f)) return f;
  }
  die('Tone.js is not installed. Run: sh <skill>/scripts/setup.sh   (or: cd <skill>/scripts && npm install)');
}

const RUNNER = `<!doctype html><meta charset="utf-8"><script src="/__msr/tone/Tone.js"></script>
<script type="module">
const q = new URLSearchParams(location.search);
try {
  const mod = await import('/' + q.get('score'));
  const DUR = +q.get('dur') || mod.DUR;
  if (!(DUR > 0)) throw new Error('score needs export const DUR (or --dur)');
  const SAL = ['A0','C1','Ds1','Fs1','A1','C2','Ds2','Fs2','A2','C3','Ds3','Fs3','A3','C4','Ds4','Fs4','A4','C5','Ds5','Fs5','A5','C6','Ds6','Fs6','A6','C7','Ds7','Fs7','A7','C8'];
  const buf = await Tone.Offline(async ({ transport }) => {
    const kit = {
      DUR, transport, loaded: () => Tone.loaded(),
      baseUrl: pack => '/__msr/samples/' + pack + '/',
      sample: (pack, file) => '/__msr/samples/' + pack + '/' + (file || ''),
      salamander: () => Object.fromEntries(SAL.map(n => [n.replace('s', '#'), n + '.mp3'])),
    };
    await (mod.default || mod.score)(Tone, kit);
    await Tone.loaded();
  }, DUR, 2, 48000);
  const ab = buf.get();
  window.__out = [ab.getChannelData(0), ab.numberOfChannels > 1 ? ab.getChannelData(1) : ab.getChannelData(0)];
  window.__chunk = (ch, start, n) => {
    const a = window.__out[ch].subarray(start, start + n), u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
    let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
    return btoa(s);
  };
  window.__done = { len: window.__out[0].length };
} catch (e) { window.__done = { error: String(e && e.stack || e) }; }
</script>`;

export async function renderTone(scoreFile, { dur } = {}) {
  const root = path.dirname(path.resolve(scoreFile));
  const tone = findTone(root);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'msr-tone-'));
  fs.writeFileSync(path.join(tmp, 'index.html'), RUNNER);
  fs.mkdirSync(SAMPLES_DIR, { recursive: true });
  const chromium = await loadChromium(root);
  const { server, port } = await serve(root, { '/__msr/tone/': path.dirname(tone), '/__msr/samples/': SAMPLES_DIR, '/__msr/run/': tmp });
  const browser = await launch(chromium);
  try {
    const page = await browser.newPage();
    page.on('console', m => { if (m.type() === 'error') console.error('[tone page] ' + m.text().slice(0, 300)); });
    page.on('response', r => { if (r.status() >= 400) console.error(`[tone page] ${r.status()} ${new URL(r.url()).pathname} (a sample or module path is wrong?)`); });
    const qs = new URLSearchParams({ score: path.basename(scoreFile), ...(dur ? { dur: String(dur) } : {}) });
    await page.goto(`http://127.0.0.1:${port}/__msr/run/index.html?${qs}`);
    await page.waitForFunction(() => window.__done, null, { timeout: 600000 });
    const done = await page.evaluate(() => window.__done);
    if (done.error) die('Tone score failed:\n' + done.error);
    const out = [new Float32Array(done.len), new Float32Array(done.len)], step = 1 << 18;
    for (let ch = 0; ch < 2; ch++) for (let s = 0; s < done.len; s += step) {
      const b64 = await page.evaluate(([c, a, n]) => window.__chunk(c, a, n), [ch, s, Math.min(step, done.len - s)]);
      const bytes = Buffer.from(b64, 'base64');
      out[ch].set(new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4), s);
    }
    return { L: out[0], R: out[1] };
  } finally {
    await browser.close().catch(() => {}); server.close(); fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// Sample packs that can be fetched on demand. Only packs with a clear licence and a verified source.
export const PACKS = {
  salamander: {
    licence: 'Salamander Grand Piano V3 by Alexander Holm — CC BY 3.0 (credit required)',
    base: 'https://tonejs.github.io/audio/salamander/',
    files: ['A0', 'C1', 'Ds1', 'Fs1', 'A1', 'C2', 'Ds2', 'Fs2', 'A2', 'C3', 'Ds3', 'Fs3', 'A3', 'C4', 'Ds4', 'Fs4', 'A4', 'C5', 'Ds5', 'Fs5', 'A5', 'C6', 'Ds6', 'Fs6', 'A6', 'C7', 'Ds7', 'Fs7', 'A7', 'C8'].map(n => n + '.mp3'),
  },
};
export async function fetchPack(name) {
  const p = PACKS[name]; if (!p) die(`unknown pack ${name}; available: ${Object.keys(PACKS).join(', ')}. Any CC0 / licensed samples can also go in ${SAMPLES_DIR}/<pack>/ or the project's samples/ folder.`);
  const dir = path.join(SAMPLES_DIR, name); fs.mkdirSync(dir, { recursive: true });
  let got = 0;
  for (const f of p.files) {
    const dst = path.join(dir, f);
    if (fs.existsSync(dst) && fs.statSync(dst).size > 0) { got++; continue; }
    const r = await fetch(p.base + f);
    if (!r.ok) die(`download failed: ${p.base + f} (${r.status})`);
    fs.writeFileSync(dst, Buffer.from(await r.arrayBuffer())); got++;
  }
  fs.writeFileSync(path.join(dir, 'LICENCE.txt'), p.licence + '\nSource: ' + p.base + '\n');
  return { dir, count: got, licence: p.licence };
}
