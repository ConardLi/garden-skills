#!/usr/bin/env node
/**
 * Environment check for the optional Phase 4 auto-render pipeline.
 * Run before `npm run render`.
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const checks = [];
function check(name, fn) {
  try { fn(); checks.push([true, name, '']); }
  catch (e) { checks.push([false, name, e.message]); }
}
function need(cmd, args = ['-version']) {
  const exe = process.platform === 'win32' ? `${cmd}.exe` : cmd;
  execFileSync(exe, args, { stdio: 'ignore' });
}

check('node >= 18', () => {
  const [maj] = process.versions.node.split('.').map(Number);
  if (maj < 18) throw new Error(`got node ${process.versions.node}`);
});
check('ffmpeg on PATH', () => need('ffmpeg'));
check('ffprobe on PATH', () => need('ffprobe'));
check('playwright installed', () => {
  if (!fs.existsSync(path.join(PROJECT_ROOT, 'node_modules', 'playwright'))) {
    throw new Error('run `npm install --save-dev playwright`');
  }
});
check('chromium installed', () => {
  // Best-effort: playwright install chromium must have been run.
  if (!process.env.LOCALAPPDATA && !process.env.HOME) {
    throw new Error('cannot locate playwright browser cache');
  }
});
check('audio-segments.json exists', () => {
  if (!fs.existsSync(path.join(PROJECT_ROOT, 'audio-segments.json'))) {
    throw new Error('run `npm run extract-narrations`');
  }
});
check('public/audio/ exists', () => {
  const d = path.join(PROJECT_ROOT, 'public', 'audio');
  if (!fs.existsSync(d)) throw new Error('run `npm run synthesize-audio`');
});

let fail = 0;
for (const [ok, name, msg] of checks) {
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : ` — ${msg}`}`);
  if (!ok) fail++;
}
console.log(fail ? `\n${fail} check(s) failed` : '\nAll checks passed — ready to render.');
process.exit(fail ? 1 : 0);
