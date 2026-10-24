#!/usr/bin/env node
// Default review workspace. Does not change preview.mjs, build.sh or project scenes.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { args, resolveTarget } from './lib/browser.mjs';
import { discoverEditorProject, localFile, readJSON, atomicJSON, initialSession, validateSession, sessionKey, isOriginalSession } from './lib/editor-model.mjs';
import { waveform, prepareEditorAudio, exportEditor, newJob, stopProcess } from './lib/editor-media.mjs';

const ASSETS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/editor');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg', '.flac': 'audio/flac', '.mp4': 'video/mp4', '.webm': 'video/webm', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream', '.hdr': 'application/octet-stream' };
function send(res, status, data) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); }
async function body(req) {
  let text = '';
  for await (const chunk of req) { text += chunk; if (Buffer.byteLength(text) > 512 * 1024) throw new Error('Request is too large'); }
  return text ? JSON.parse(text) : {};
}
function serveFile(req, res, file) {
  const stat = fs.statSync(file), size = stat.size;
  let start = 0, end = size - 1, status = 200;
  const headers = { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff' };
  if (req.headers.range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!m || (!m[1] && !m[2])) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }); res.end(); return; }
    start = m[1] ? +m[1] : Math.max(0, size - +m[2]); end = m[1] && m[2] ? Math.min(size - 1, +m[2]) : size - 1;
    if (start > end || start >= size) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }); res.end(); return; }
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`; status = 206;
  }
  headers['Content-Length'] = Math.max(0, end - start + 1); res.writeHead(status, headers);
  if (req.method === 'HEAD' || !size) res.end(); else { const stream = fs.createReadStream(file, { start, end }); stream.on('error', () => res.destroy()); stream.pipe(res); }
}
export async function createEditorServer(target, options = {}) {
  const resolved = resolveTarget(target), root = resolved.root;
  const projectOptions = { ...options, page: resolved.rel };
  const project = await discoverEditorProject(root, projectOptions), token = randomBytes(24).toString('hex');
  project.canExport = options.allowExport !== false; project.readOnly = !!options.readOnly;
  const stateFile = path.join(root, '.showreel-editor', 'session.json');
  let session = initialSession(project), restoreWarning = '';
  try { const saved = readJSON(stateFile); if (saved) session = validateSession(saved, project); }
  catch { restoreWarning = '源音频或规格已变化，旧编辑未自动套用。已载入原始状态；旧记录仍在磁盘。'; }
  let active = null; const jobs = new Map(), waves = new Map();
  const quality = options.quality || {};
  const limits = { workers: [1, 16], subframes: [1, 16], shutter: [0, 1], dpr: [1, 4], grain: [0, 100], crf: [0, 51] };
  for (const [key, value] of Object.entries(quality)) if (!limits[key] || !Number.isFinite(value) || value < limits[key][0] || value > limits[key][1] || (['workers', 'subframes'].includes(key) && !Number.isInteger(value))) throw new Error(`Invalid quality option ${key}`);
  const publicJob = j => {
    const frameProgress = [...j.log.matchAll(/(\d+)\/(\d+) frames/g)].at(-1);
    const progress = j.phase === '渲染画面' && frameProgress ? 0.15 + 0.73 * Number(frameProgress[1]) / Number(frameProgress[2]) : j.progress;
    return { id: j.id, type: j.type, status: j.status, phase: j.phase, progress, log: j.log, result: j.result, error: j.error };
  };
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost'), pathname = decodeURIComponent(url.pathname);
      if (req.headers.host !== `127.0.0.1:${server.address().port}` && req.headers.host !== `localhost:${server.address().port}`) { send(res, 403, { error: 'Invalid host' }); return; }
      if (req.headers.origin && ![`http://127.0.0.1:${server.address().port}`, `http://localhost:${server.address().port}`].includes(req.headers.origin)) { send(res, 403, { error: 'Invalid origin' }); return; }
      if (!['GET', 'HEAD', 'POST'].includes(req.method)) { send(res, 405, { error: 'Unsupported method' }); return; }
      if (req.method === 'POST' && req.headers['x-showreel-token'] !== token) { send(res, 403, { error: 'Missing editor token' }); return; }
      if (pathname === '/api/project' && req.method === 'GET') {
        send(res, 200, { project, session, token, restoreWarning, quality, activeJob: active && publicJob(active), progressURL: options.progressURL || null, progressRevision: options.progressRevision || null }); return;
      }
      if (pathname === '/api/session' && req.method === 'POST') {
        const next = validateSession(await body(req), project);
        if (project.readOnly && !isOriginalSession(next, project)) { send(res, 403, { error: '阶段预览只读，最终预览时可调整声音' }); return; }
        session = next; atomicJSON(stateFile, session); send(res, 200, { session }); return;
      }
      if (pathname === '/api/jobs' && req.method === 'POST') {
        if (active?.status === 'running') { send(res, 409, { error: '已有任务正在进行', job: publicJob(active) }); return; }
        const data = await body(req);
        if (!['mix', 'export'].includes(data.type)) throw new Error('Unknown task type');
        if (data.type === 'export' && !project.canExport) { send(res, 403, { error: '制作中的阶段预览不能导出，请等待最终预览' }); return; }
        const snapshot = validateSession(data.session, project);
        if (project.readOnly && !isOriginalSession(snapshot, project)) { send(res, 403, { error: '阶段预览只读' }); return; }
        const current = await discoverEditorProject(root, projectOptions);
        if (current.sourceSignature !== project.sourceSignature) throw new Error('源音频已变化，请重启工作区后重试');
        const job = newJob(data.type); active = job; jobs.set(job.id, job);
        while (jobs.size > 20) jobs.delete(jobs.keys().next().value);
        send(res, 202, publicJob(job));
        (async () => {
          try {
            job.result = data.type === 'mix' ? await prepareEditorAudio(root, project, snapshot, job) : await exportEditor(root, project, snapshot, job, quality);
            if (job.result.file) job.result.url = '/project/' + job.result.file.split('/').map(encodeURIComponent).join('/');
            job.result.key = sessionKey(snapshot, project);
            job.status = job.cancelled ? 'cancelled' : 'complete'; job.progress = 1; job.phase = job.cancelled ? '已取消' : '完成';
          } catch (error) { job.error = error.message; job.status = job.cancelled ? 'cancelled' : 'failed'; job.phase = job.cancelled ? '已取消' : '失败'; }
        })(); return;
      }
      if (pathname.startsWith('/api/jobs/')) {
        const id = pathname.split('/')[3], job = jobs.get(id);
        if (!job) { send(res, 404, { error: 'Task not found' }); return; }
        if (req.method === 'POST' && pathname.endsWith('/cancel')) { job.cancelled = true; stopProcess(job.child); send(res, 200, publicJob(job)); return; }
        if (req.method === 'GET') { send(res, 200, publicJob(job)); return; }
      }
      if (pathname.startsWith('/api/wave/') && req.method === 'GET') {
        const track = project.tracks.find(t => t.id === pathname.slice('/api/wave/'.length));
        if (!track) throw new Error('Unknown track');
        if (!waves.has(track.id)) waves.set(track.id, waveform(root, track).catch(error => { waves.delete(track.id); throw error; }));
        send(res, 200, await waves.get(track.id)); return;
      }
      if (['GET', 'HEAD'].includes(req.method)) {
        if (pathname === '/' || pathname === '/editor') { serveFile(req, res, path.join(ASSETS, 'index.html')); return; }
        if (pathname.startsWith('/__showreel-editor/')) { serveFile(req, res, localFile(ASSETS, pathname.slice('/__showreel-editor/'.length))); return; }
        if (pathname.startsWith('/project/')) { serveFile(req, res, localFile(root, pathname.slice(9))); return; }
        // Preserve root-relative imports/assets used by existing scenes. The
        // editor's own assets live under a reserved prefix to avoid collisions.
        if (!pathname.startsWith('/api/')) { serveFile(req, res, localFile(root, pathname.slice(1))); return; }
      }
      send(res, 404, { error: 'Not found' });
    } catch (error) { if (!res.headersSent) send(res, 400, { error: error.message }); else res.destroy(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return { url: `http://127.0.0.1:${server.address().port}/editor`, server, project,
    async close() { if (active?.status === 'running') { active.cancelled = true; stopProcess(active.child); } server.closeAllConnections(); await new Promise(r => server.close(r)); } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const { pos, opt } = args(process.argv.slice(2));
  try {
    if (opt.help) { console.log('node editor.mjs <project|page.html> --size WxH [--fps 30] [--duration seconds] [--audio audio/final.wav]\nWatch production from an empty project: node editor.mjs <project> --progress\nOptional render quality: --workers --subframes --shutter --dpr --grain --crf\nNo MP4 is rendered until Export is clicked.'); }
    else {
      if (pos.length !== 1) throw new Error('Supply one project directory or HTML file');
      const qualityKeys = ['workers', 'subframes', 'shutter', 'dpr', 'grain', 'crf'];
      for (const [key, value] of Object.entries(opt)) if (!['size', 'fps', 'duration', 'audio', 'progress', ...qualityKeys].includes(key) || (value === true && key !== 'progress')) throw new Error(`Invalid option --${key}`);
      if (opt.progress !== undefined && opt.progress !== true) throw new Error('--progress is a flag');
      const quality = Object.fromEntries(qualityKeys.filter(k => opt[k] !== undefined).map(k => [k, +opt[k]]));
      const options = { size: opt.size, fps: opt.fps === undefined ? 30 : +opt.fps, duration: opt.duration === undefined ? undefined : +opt.duration, audio: opt.audio, quality };
      const app = opt.progress ? await (await import('./lib/editor-progress.mjs')).createProgressServer(pos[0], options, createEditorServer) : await createEditorServer(pos[0], options);
      console.log(`Editor: ${app.url}\n先在工作区预览，确认后点击导出；原始场景与 build.sh 保持不变。按 Ctrl-C 关闭。`);
      for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.once(signal, () => app.close().then(() => process.exit(0)));
    }
  } catch (error) { console.error(`editor failed: ${error.message}`); process.exitCode = 1; }
}
