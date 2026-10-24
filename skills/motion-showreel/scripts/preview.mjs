#!/usr/bin/env node
// Local preview server. Injects the optional controls in memory; project files stay untouched.
// node preview.mjs <project> --size 1920x1080 [--audio audio/final.wav] [--fps 30] [--port 0]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { serve, resolveTarget, args } from './lib/browser.mjs';

const STARTER = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'starter');
const AUDIO_TYPES = { '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg', '.flac': 'audio/flac', '.aac': 'audio/aac' };

export async function createPreviewServer(project, { size, audio, fps = 30, port = 0 } = {}) {
  if (!project || !fs.existsSync(path.resolve(project))) throw new Error('Supply an existing project directory or HTML file');
  const absolute = path.resolve(project), page = fs.statSync(absolute).isDirectory() ? path.join(absolute, 'index.html') : absolute;
  if (!fs.existsSync(page) || !fs.statSync(page).isFile()) throw new Error('Project needs an index.html file');
  const target = resolveTarget(project);
  if (typeof size !== 'string' || !/^\d+x\d+$/.test(size)) throw new Error('--size is required, e.g. 1920x1080');
  const [w, h] = size.split('x').map(Number);
  if (w < 2 || h < 2 || w % 2 || h % 2) throw new Error('--size needs positive, even dimensions');
  if (!Number.isFinite(+fps) || +fps <= 0 || +fps > 240) throw new Error('--fps must be within 0–240');
  if (+port !== 0) throw new Error('--port accepts 0 (automatically choose a free local port)');
  if (audio !== undefined) {
    if (typeof audio !== 'string' || !audio || audio.startsWith('/') || audio.includes('\\') || /^[a-z][a-z\d+.-]*:/i.test(audio) || audio.split('/').includes('..') || /[?#]/.test(audio)) throw new Error('--audio must be a project-relative file path');
    const file = path.resolve(target.root, audio);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`Audio not found: ${audio}`);
  }
  const { server, port: actualPort } = await serve(target.root, { '/__showreel-preview/': STARTER });
  // Reuse the existing local static server and mounts. Only the selected HTML page in
  // preview mode receives this extra module; render=1 gets the original file verbatim.
  const handlers = server.listeners('request'); server.removeAllListeners('request');
  server.on('request', (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400); res.end('Bad path'); return; }
    const audioPath = path.resolve(target.root, '.' + pathname), audioType = AUDIO_TYPES[path.extname(audioPath).toLowerCase()];
    if (['GET', 'HEAD'].includes(req.method) && audioType && audioPath.startsWith(target.root + path.sep) && fs.existsSync(audioPath) && fs.statSync(audioPath).isFile()) {
      // Range requests let a long WAV seek without downloading the entire soundtrack.
      const size = fs.statSync(audioPath).size; let start = 0, end = size - 1;
      const headers = { 'Content-Type': audioType, 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' };
      if (req.headers.range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if (!match || (!match[1] && !match[2])) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }); res.end(); return; }
        start = match[1] ? +match[1] : Math.max(0, size - +match[2]);
        end = match[1] && match[2] ? Math.min(+match[2], size - 1) : size - 1;
        if (start > end || start >= size) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }); res.end(); return; }
        headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
      }
      headers['Content-Length'] = String(Math.max(0, end - start + 1));
      res.writeHead(req.headers.range ? 206 : 200, headers);
      if (req.method === 'HEAD' || !size) res.end(); else fs.createReadStream(audioPath, { start, end }).pipe(res);
    } else if (req.method === 'GET' && [target.rel === 'index.html' ? '/' : null, `/${target.rel}`].includes(pathname) && url.searchParams.get('preview') === '1' && url.searchParams.get('render') !== '1') {
      const module = '<script type="module" src="/__showreel-preview/preview.js"></script>';
      const source = fs.readFileSync(target.page, 'utf8');
      const html = /<\/body\s*>/i.test(source) ? source.replace(/<\/body\s*>/i, `${module}</body>`) : `${source}\n${module}`;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(html);
    } else for (const handler of handlers) handler.call(server, req, res);
  });
  const query = new URLSearchParams({ preview: '1', w: String(w), h: String(h), fps: String(fps), ...(audio ? { audio } : {}) });
  const url = `http://127.0.0.1:${actualPort}/${encodeURIComponent(target.rel)}?${query}`;
  return { url, server, close: () => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const { pos, opt } = args(process.argv.slice(2));
  try {
    if (pos.length !== 1) throw new Error('usage: preview.mjs <project> --size WxH [--audio relative/path] [--fps 30] [--port 0]');
    for (const key of Object.keys(opt)) if (!['size', 'audio', 'fps', 'port'].includes(key)) throw new Error(`unknown option --${key}`);
    for (const [key, value] of Object.entries(opt)) if (value === true) throw new Error(`--${key} requires a value`);
    const preview = await createPreviewServer(pos[0], { size: opt.size, audio: opt.audio, fps: opt.fps === undefined ? 30 : +opt.fps, port: opt.port === undefined ? 0 : +opt.port });
    console.log(`Preview: ${preview.url}\nClick Play in the browser. Playback speed changes the preview only.\nPress Ctrl-C to stop the local server.`);
    for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.once(signal, () => { preview.close().then(() => process.exit(0), () => process.exit(1)); });
  } catch (error) { console.error(`preview failed: ${error.message}`); process.exitCode = 1; }
}
