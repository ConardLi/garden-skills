// Progress is explicitly published by the producer, never inferred from half-written files.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { localFile, readJSON, atomicJSON, discoverEditorProject, digest } from './editor-model.mjs';
import { newJob, runProcess } from './editor-media.mjs';

const SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.resolve(SCRIPTS, '../assets/editor');
export const STAGES = [
  ['brief', '需求与脚本'], ['style', '风格与画面'], ['narration', '口播样例'],
  ['scenes', '镜头制作'], ['audio', '配乐与音效'], ['review', '最终预览'],
];
const statuses = new Set(['pending', 'running', 'ready', 'failed', 'skipped', 'waiting']);
const stateFile = root => path.join(root, '.showreel-progress', 'status.json');
const blank = () => ({ version: 1, stages: STAGES.map(([id, name]) => ({ id, name, status: 'pending', message: '', done: null, total: null })), current: 'brief', preview: null, previews: [], shots: [], artifacts: [] });
const exclusions = new Set(['.git', '.showreel-progress', '.showreel-editor', '.showreel-cache', 'out', 'qa', '__pycache__']);

export function updateProgress(root, { stage, status = 'running', message = '', done, total, reopen = false } = {}, extra = {}) {
  if (!STAGES.some(([id]) => id === stage) || !statuses.has(status)) throw new Error('Use a known stage and pending/running/ready/failed/skipped/waiting status');
  if (typeof message !== 'string' || message.length > 2000) throw new Error('Progress message must be at most 2000 characters');
  if ((done !== undefined || total !== undefined) && (!Number.isInteger(done) || !Number.isInteger(total) || done < 0 || total < 1 || done > total)) throw new Error('Progress counts need integers 0 <= done <= total');
  fs.mkdirSync(root, { recursive: true });
  const state = readJSON(stateFile(root), blank());
  if (state.version !== 1 || !Array.isArray(state.stages)) throw new Error('Invalid progress state');
  const item = state.stages.find(s => s.id === stage);
  if (reopen && status !== 'waiting') throw new Error('--reopen requires status waiting');
  if (status === 'waiting' && item.confirmedAt && !reopen) throw new Error('This stage was confirmed; use --reopen to request feedback on a revised result');
  if (reopen) delete item.confirmedAt;
  Object.assign(item, { status, message, ...(done === undefined ? {} : { done, total }), updatedAt: new Date().toISOString() });
  // Attaching an old result must not take focus from work already in progress.
  const behind = STAGES.findIndex(([id]) => id === stage) < STAGES.findIndex(([id]) => id === state.current);
  const keepCurrent = behind && ['ready', 'skipped', 'pending'].includes(status);
  Object.assign(state, extra, { current: keepCurrent ? state.current : stage, updatedAt: item.updatedAt });
  atomicJSON(stateFile(root), state); return state;
}

// Only the producer, after receiving real user feedback, may call this transition.
// Confirming requirements resumes brief work; it does not claim the brief is done.
export function confirmProgress(root, { stage, next, message } = {}) {
  const index = STAGES.findIndex(([id]) => id === stage), nextIndex = STAGES.findIndex(([id]) => id === next);
  if (index < 0 || (next !== undefined && nextIndex <= index)) throw new Error('Confirmation needs a known stage and an optional later --next stage');
  if (message !== undefined && (typeof message !== 'string' || message.length > 2000)) throw new Error('Progress message must be at most 2000 characters');
  const state = readJSON(stateFile(root), blank());
  if (state.version !== 1 || !Array.isArray(state.stages)) throw new Error('Invalid progress state');
  const item = state.stages.find(s => s.id === stage);
  if (!item.confirmedAt && item.status !== 'waiting') throw new Error('Only a stage awaiting feedback can be confirmed');
  if (item.confirmedAt && (!next || STAGES.findIndex(([id]) => id === state.current) >= nextIndex)) return state;
  const now = new Date().toISOString();
  Object.assign(item, { confirmedAt: item.confirmedAt || now, updatedAt: now, status: next ? 'ready' : 'running', message: next ? '已确认' : message || '已收到确认，继续制作' });
  if (next) Object.assign(state.stages.find(s => s.id === next), { status: 'running', updatedAt: now, message: message || '已收到上一阶段确认，开始制作' });
  Object.assign(state, { current: next || stage, updatedAt: now });
  atomicJSON(stateFile(root), state); return state;
}

// A diagnostic only: edits never approve requirements or publish unfinished work.
function syncWarning(root, state) {
  const active = state.stages.find(s => s.id === state.current);
  const updated = Date.parse(active?.updatedAt || state.updatedAt);
  if (active?.status !== 'waiting' || !Number.isFinite(updated)) return null;
  const inputs = fs.readdirSync(root, { withFileTypes: true }).filter(entry =>
    entry.isFile() && /\.(?:html|[cm]?js|json|md)$/.test(entry.name) || entry.isDirectory() && ['fonts', 'assets', 'audio', 'shots'].includes(entry.name));
  const changed = inputs.some(entry => {
    try { return fs.statSync(path.join(root, entry.name)).mtimeMs > updated + 2000; } catch { return false; }
  });
  return changed ? '制作文件已更新，但进度仍停在待确认；制作端可能尚未同步状态。' : null;
}

export async function publishArtifact(root, file, options) {
  const source = localFile(root, file), ext = path.extname(source).toLowerCase();
  const type = ['.png', '.jpg', '.jpeg', '.webp', '.avif'].includes(ext) ? 'image' : ['.wav', '.mp3', '.m4a', '.ogg', '.flac'].includes(ext) ? 'audio' : ['.md', '.txt', '.json'].includes(ext) ? 'document' : null;
  if (!type) throw new Error('Stage artifacts must be an image, audio or text document');
  if (!STAGES.some(([id]) => id === options.stage)) throw new Error('Unknown stage');
  const dir = path.join(root, '.showreel-progress', 'artifacts'); fs.mkdirSync(dir, { recursive: true });
  const name = digest(fs.readFileSync(source)) + ext;
  fs.copyFileSync(source, path.join(dir, name), fs.constants.COPYFILE_FICLONE);
  const state = readJSON(stateFile(root), blank());
  const artifact = { id: `${options.stage}-${name}`, stage: options.stage, type, name: options.name || path.basename(file), url: `/artifact/${name}` };
  const artifacts = [...state.artifacts.filter(a => a.id !== artifact.id), artifact];
  return updateProgress(root, { ...options, status: options.status || 'ready' }, { artifacts });
}

export async function publishPreview(root, sourceDirectory, options = {}) {
  if (!STAGES.some(([id]) => id === options.stage)) throw new Error('Unknown stage');
  if (options.final && options.stage !== 'review') throw new Error('--final is only valid for the review stage');
  const requestedStatus = options.status || (options.final ? 'waiting' : 'running');
  if (options.reopen && requestedStatus !== 'waiting') throw new Error('--reopen requires status waiting');
  if (requestedStatus === 'waiting' && readJSON(stateFile(root), blank()).stages.find(s => s.id === options.stage)?.confirmedAt && !options.reopen) throw new Error('This stage was confirmed; use --reopen to request feedback on a revised result');
  const quality = options.quality || {}, limits = { workers: [1, 16], subframes: [1, 16], shutter: [0, 1], dpr: [1, 4], grain: [0, 100], crf: [0, 51] };
  for (const [key, value] of Object.entries(quality)) if (!limits[key] || !Number.isFinite(value) || value < limits[key][0] || value > limits[key][1] || (['workers', 'subframes'].includes(key) && !Number.isInteger(value))) throw new Error(`Invalid quality option ${key}`);
  if (options.shot && (options.stage !== 'scenes' || options.final || !/^[a-zA-Z0-9_-]{1,64}$/.test(options.shot) || !Number.isInteger(options.total) || options.total < 1)) throw new Error('--shot needs stage scenes, --total, and a safe unique shot id; it cannot be final');
  const source = fs.realpathSync(path.resolve(root, sourceDirectory));
  if (!fs.statSync(source).isDirectory() || !fs.existsSync(path.join(source, 'index.html'))) throw new Error('Publish a completed project directory with index.html');
  const id = `${Date.now()}-${randomBytes(4).toString('hex')}`;
  const revision = path.join(root, '.showreel-progress', 'revisions', id), snapshot = path.join(revision, 'project');
  fs.mkdirSync(revision, { recursive: true });
  try {
    // Copy-on-write on APFS where possible. Runtime dependencies, fonts and audio
    // stay inside the snapshot; caches, old renders and credentials are not copied.
    fs.mkdirSync(snapshot);
    const filter = file => !path.relative(source, file).split(path.sep).some(part => exclusions.has(part) || /^\.env(?:\.|$)/.test(part) || /\.(?:pem|key)$/.test(part));
    for (const entry of fs.readdirSync(source)) {
      const file = path.join(source, entry);
      if (filter(file)) fs.cpSync(file, path.join(snapshot, entry), { recursive: true, dereference: true, mode: fs.constants.COPYFILE_FICLONE, filter });
    }
    const spec = await discoverEditorProject(snapshot, options);
    const job = newJob('progress-validation');
    await runProcess(process.execPath, [path.join(SCRIPTS, 'render.mjs'), snapshot, '--size', spec.size, '--fps', String(spec.fps), '--determinism'], job);
    const preview = { id, stage: options.stage, final: !!options.final, directory: path.relative(root, snapshot).split(path.sep).join('/'),
      name: options.name || (options.shot ? options.shot : options.message) || '阶段预览', shot: options.shot || null, quality, options: { size: spec.size, fps: spec.fps, duration: spec.duration, ...(options.audio ? { audio: options.audio } : {}) }, message: options.message || '阶段预览已准备好', publishedAt: new Date().toISOString() };
    const state = readJSON(stateFile(root), blank());
    const previews = [...(state.previews || []).filter(p => p.id !== preview.id), preview];
    let shots = state.shots || [];
    if (options.shot) {
      const shot = { id: options.shot, name: preview.name, preview, updatedAt: preview.publishedAt };
      shots = shots.some(s => s.id === shot.id) ? shots.map(s => s.id === shot.id ? shot : s) : [...shots, shot];
      if (shots.length > options.total) throw new Error('--total cannot be smaller than the published shot count');
    }
    return updateProgress(root, { ...options, ...(options.shot ? { done: shots.length, total: options.total } : {}),
      status: options.status || (options.final ? 'waiting' : options.shot && shots.length === options.total ? 'ready' : 'running') }, { preview, previews, shots });
  } catch (error) {
    fs.rmSync(revision, { recursive: true, force: true });
    updateProgress(root, { stage: options.stage, status: 'failed', message: `新版未发布，保留上一版预览：${error.message.slice(0, 500)}` });
    throw error;
  }
}

export async function createProgressServer(directory, options = {}, createChild) {
  const root = path.resolve(directory); fs.mkdirSync(root, { recursive: true });
  if (!fs.existsSync(stateFile(root))) atomicJSON(stateFile(root), blank());
  createChild ||= (await import('../editor.mjs')).createEditorServer;
  const children = new Map(), openings = new Map(); let activation = Promise.resolve(), activePreview = null, activationError = '', closed = false;
  const openPreview = async preview => {
    if (!preview || !/^[\d]+-[a-f0-9]{8}$/.test(preview.id) || preview.directory !== `.showreel-progress/revisions/${preview.id}/project`) throw new Error('Invalid published revision');
    const snapshot = path.join(root, preview.directory), real = fs.realpathSync(snapshot);
    if (!real.startsWith(fs.realpathSync(root) + path.sep)) throw new Error('Revision is outside the project');
    if (!children.has(preview.id)) {
      if (!openings.has(preview.id)) openings.set(preview.id, (async () => {
        const child = await createChild(snapshot, { ...preview.options, quality: { ...options.quality, ...preview.quality }, allowExport: preview.final, readOnly: !preview.final,
          progressURL: `http://127.0.0.1:${server.address().port}/api/progress`, progressRevision: { id: preview.id, final: preview.final, stage: preview.stage, shot: preview.shot, name: preview.name } });
        if (closed) { await child.close(); throw new Error('Progress server closed'); }
        children.set(preview.id, child); return child;
      })().finally(() => openings.delete(preview.id)));
      await openings.get(preview.id);
    }
    return { ...preview, url: children.get(preview.id).url };
  };
  const refresh = () => {
    activation = activation.catch(() => {}).then(async () => {
      if (closed) return;
      const state = readJSON(stateFile(root), blank()), preview = state.preview;
      if (preview && activePreview?.id !== preview.id) {
        try { activePreview = await openPreview(preview); activationError = ''; }
        catch (error) { activationError = error.message; }
      }
      return { ...state, preview: activePreview, error: activationError, syncWarning: syncWarning(root, state) };
    }); return activation;
  };
  const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg', '.flac': 'audio/flac', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json; charset=utf-8' };
  const server = http.createServer(async (req, res) => {
    try {
      const host = `127.0.0.1:${server.address().port}`;
      if (req.headers.host !== host && req.headers.host !== host.replace('127.0.0.1', 'localhost')) { res.writeHead(403); res.end(); return; }
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
      const url = new URL(req.url, `http://${host}`);
      const ownOrigins = [`http://${host}`, `http://${host.replace('127.0.0.1', 'localhost')}`];
      const childOrigin = [...children.values()].some(child => new URL(child.url).origin === req.headers.origin);
      if (req.headers.origin && !ownOrigins.includes(req.headers.origin) && !childOrigin) { res.writeHead(403); res.end(); return; }
      if (url.pathname === '/api/progress') {
        const state = await refresh(); res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...(childOrigin ? { 'Access-Control-Allow-Origin': req.headers.origin, Vary: 'Origin' } : {}) }); res.end(JSON.stringify(state)); return;
      }
      if (/^\/api\/preview\/[\d]+-[a-f0-9]{8}$/.test(url.pathname)) {
        const state = readJSON(stateFile(root), blank()), id = url.pathname.split('/').at(-1);
        const preview = [state.preview, ...(state.previews || []), ...(state.shots || []).map(s => s.preview)].find(p => p?.id === id);
        if (!preview) { res.writeHead(404); res.end(); return; }
        const result = await openPreview(preview);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...(childOrigin ? { 'Access-Control-Allow-Origin': req.headers.origin, Vary: 'Origin' } : {}) });
        res.end(JSON.stringify(result)); return;
      }
      if (url.pathname === '/api/project') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify({ project: null, progressURL: `http://${host}/api/progress`, progressRevision: null })); return;
      }
      let file;
      if (url.pathname === '/' || url.pathname === '/progress') file = path.join(ASSETS, 'index.html');
      else if (url.pathname.startsWith('/__showreel-editor/')) file = localFile(ASSETS, decodeURIComponent(url.pathname.slice('/__showreel-editor/'.length)));
      else if (/^\/artifact\/[a-f0-9]{64}\.(png|jpe?g|webp|avif|wav|mp3|m4a|ogg|flac|md|txt|json)$/.test(url.pathname)) file = localFile(root, `.showreel-progress/artifacts/${url.pathname.split('/').at(-1)}`);
      else { res.writeHead(404); res.end(); return; }
      const stat = fs.statSync(file), headers = { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes', ...(childOrigin ? { 'Access-Control-Allow-Origin': req.headers.origin, Vary: 'Origin' } : {}) };
      let start = 0, end = stat.size - 1;
      if (req.headers.range) {
        const m = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
        if (!m || +m[1] >= stat.size || (m[2] && +m[2] < +m[1])) { res.writeHead(416); res.end(); return; }
        start = +m[1]; end = m[2] ? Math.min(+m[2], end) : end; headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
      }
      headers['Content-Length'] = end - start + 1; res.writeHead(req.headers.range ? 206 : 200, headers);
      if (req.method === 'HEAD') res.end(); else { const stream = fs.createReadStream(file, { start, end }); stream.on('error', () => res.destroy()); stream.pipe(res); }
    } catch (error) { if (!res.headersSent) res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(error.message); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return { url: `http://127.0.0.1:${server.address().port}/progress`, server,
    async close() { closed = true; server.closeAllConnections(); await new Promise(r => server.close(r)); await activation.catch(() => {}); await Promise.allSettled([...openings.values()]); await Promise.all([...children.values()].map(child => child.close())); } };
}
