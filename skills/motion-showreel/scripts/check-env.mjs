#!/usr/bin/env node
// Check what motion-showreel needs: Node 18+, ffmpeg/ffprobe (+ filters), Playwright, a headless browser, WebGL.
//   node check-env.mjs [project-dir]
import { execFileSync } from 'node:child_process';
import { loadChromium, launch, warnSoftwareGL } from './lib/browser.mjs';

let ok = true;
const line = (good, name, fix = '') => { ok &&= good; console.log(`[${good ? 'ok' : 'missing'}] ${name}${good || !fix ? '' : '  →  ' + fix}`); };
const has = (bin, a = ['-version']) => { try { return execFileSync(bin, a, { stdio: ['ignore', 'pipe', 'ignore'] }).toString(); } catch { return null; } };

line(+process.versions.node.split('.')[0] >= 18, `node ${process.versions.node} (need 18+)`, 'install Node 18+');
const ffv = has('ffmpeg');
line(!!ffv, 'ffmpeg', 'macOS: brew install ffmpeg · Windows: winget install ffmpeg · Linux: apt install ffmpeg');
line(!!has('ffprobe'), 'ffprobe', 'ships with ffmpeg');
if (ffv) {
  const filters = has('ffmpeg', ['-hide_banner', '-filters']) || '';
  for (const f of ['tmix', 'loudnorm', 'ebur128', 'showspectrumpic', 'freezedetect', 'chromakey']) if (!filters.includes(` ${f} `)) console.log(`[warn] ffmpeg lacks the ${f} filter (a fuller ffmpeg build is recommended)`);
  if (!filters.includes(' drawtext ')) console.log('[info] ffmpeg has no drawtext: contact sheets will have no timestamps (harmless)');
}

const chromium = await loadChromium(process.argv[2]).catch(() => null);
if (chromium) {
  const browser = await launch(chromium);
  const page = await browser.newPage();
  const gl = await warnSoftwareGL(page);
  console.log(`[ok] headless browser ${browser.version()} · WebGL renderer: ${gl}`);
  await browser.close();
}
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const toneOk = [here, process.argv[2] || '', process.cwd()].some(b => b && fs.existsSync(`${b}/node_modules/tone/build/Tone.js`));
console.log(`[${toneOk ? 'ok' : 'optional'}] tone.js (tier-2 audio)${toneOk ? '' : '  →  sh setup.sh'}`);
console.log(`[${has('python3', ['-c', 'import librosa']) !== null ? 'ok' : 'optional'}] librosa (more robust beat tracking for user tracks)`);
console.log(ok ? '\nready' : '\nsome tools are missing (see above)');
process.exit(ok ? 0 : 1);
