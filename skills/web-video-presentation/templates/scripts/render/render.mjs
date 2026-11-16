#!/usr/bin/env node
/**
 * Phase 4 optional auto-render: Playwright records the ?auto=1 playback
 * and ffmpeg burns subtitles into the final mp4.
 *
 * Prerequisites:
 *   - npm run extract-narrations && npm run synthesize-audio (audio in public/audio/)
 *   - ffmpeg + ffprobe on PATH
 *   - npx playwright install chromium
 *
 * Usage:
 *   node scripts/render/render.mjs
 *   node scripts/render/render.mjs --keep-raw   # keep out/raw/*.webm
 */
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { buildTimeline } from './lib/timeline.mjs';
import { generateSubtitleFiles } from './lib/subtitles.mjs';
import { runFFmpeg, escapeFilterPath } from './lib/ffmpeg.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const OUT = {
  raw: path.join(PROJECT_ROOT, 'out', 'raw'),
  subtitles: path.join(PROJECT_ROOT, 'out', 'subtitles'),
  final: path.join(PROJECT_ROOT, 'out', 'final'),
};

function resolveExe(p) { return process.platform === 'win32' ? `${p}.exe` : p; }

function getFreePort(start = 5173) {
  return new Promise((resolve, reject) => {
    const srv = http.createServer();
    srv.listen(start, '127.0.0.1', () => {
      const p = srv.address().port;
      srv.close(() => resolve(p));
    });
    srv.on('error', (e) => {
      if (e.code === 'EADDRINUSE') resolve(getFreePort(start + 1));
      else reject(e);
    });
  });
}

function waitForServer(port, timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      if (Date.now() - start > timeout) return reject(new Error('server timeout'));
      http.get(`http://127.0.0.1:${port}/`, (res) => { res.resume(); resolve(true); })
        .on('error', () => setTimeout(check, 500));
    };
    check();
  });
}

function kill(proc) {
  try {
    if (process.platform === 'win32') spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t']);
    else { proc.kill('SIGTERM'); setTimeout(() => { try { proc.kill('SIGKILL'); } catch {} }, 2000); }
  } catch {}
}

async function main() {
  const keepRaw = process.argv.includes('--keep-raw');
  for (const d of Object.values(OUT)) fs.mkdirSync(d, { recursive: true });

  console.log('=== Phase 4 auto-render ===\n');

  // 1. Timeline + subtitles
  console.log('Step 1: building timeline from audio-segments.json ...');
  const timeline = await buildTimeline();
  const total = timeline[timeline.length - 1].end;
  console.log(`  ${timeline.length} segments, ${total.toFixed(1)}s total`);

  const { ass: assPath } = generateSubtitleFiles(timeline, OUT.subtitles);
  console.log(`  subtitles -> ${assPath}\n`);

  // 2. Start vite dev server
  console.log('Step 2: starting vite dev server ...');
  const port = await getFreePort();
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const server = spawn(npm, ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: PROJECT_ROOT, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, BROWSER: 'none' },
  });
  server.stdout.on('data', (d) => process.stdout.write(`  [vite] ${d}`));
  server.stderr.on('data', (d) => process.stderr.write(`  [vite] ${d}`));
  try {
    await waitForServer(port);
    console.log(`  server ready on http://127.0.0.1:${port}\n`);
  } catch (e) {
    kill(server);
    throw e;
  }

  // 3. Playwright record
  console.log('Step 3: recording with Playwright (1920x1080) ...');
  let browser;
  let rawPath;
  try {
    const { chromium } = await import('playwright');
    browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
    const ctx = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      screen: { width: 1920, height: 1080 },
      recordVideo: { dir: OUT.raw, size: { width: 1920, height: 1080 } },
    });
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${port}/?auto=1`, { waitUntil: 'load' });

    // Wait for the "Press SPACE to start" gate, then press SPACE to kick off.
    await page.waitForSelector('text=SPACE', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(800);
    await page.keyboard.press('Space');
    console.log(`  recording for ${(total + 5).toFixed(1)}s ...`);
    await page.waitForTimeout((total + 5) * 1000);

    rawPath = await page.video().path();
    await ctx.close();
    await browser.close();
    console.log(`  raw recording -> ${rawPath}\n`);
  } catch (e) {
    if (browser) await browser.close().catch(() => {});
    kill(server);
    throw e;
  }

  kill(server);

  // 4. ffmpeg: webm -> mp4, burn subtitles
  console.log('Step 4: composing mp4 with burned subtitles ...');
  const finalPath = path.join(OUT.final, 'video.mp4');
  const subFilter = `subtitles='${escapeFilterPath(assPath)}'`;
  await runFFmpeg([
    '-y', '-i', rawPath,
    '-vf', subFilter,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-c:a', 'aac', '-b:a', '192k',
    '-movflags', '+faststart',
    finalPath,
  ]);

  if (!keepRaw) {
    fs.rmSync(rawPath, { force: true });
  }

  console.log(`\n=== done ===`);
  console.log(`  video:      ${finalPath}`);
  console.log(`  subtitles:  ${OUT.subtitles}`);
}

main().catch((err) => {
  console.error('\n✗ render failed:', err.message);
  process.exit(1);
});
