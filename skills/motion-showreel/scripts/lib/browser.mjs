// Shared browser plumbing: resolve Playwright, serve the project over HTTP, open a page that
// exposes the render(t) contract and wait until it is READY.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';

const SCRIPTS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Playwright can live next to this skill (scripts/node_modules), in the project, or globally.
export async function loadChromium(projectDir) {
  const pick = m => m.chromium || m.default?.chromium;
  const bases = [SCRIPTS_DIR, projectDir, process.cwd()].filter(Boolean);
  for (const base of bases) {
    const req = createRequire(path.join(path.resolve(base), 'package.json'));
    for (const name of ['playwright', 'playwright-core']) {
      try { const c = pick(await import(pathToFileURL(req.resolve(name)).href)); if (c) return c; } catch {}
    }
  }
  for (const name of ['playwright', 'playwright-core']) {
    try { const c = pick(await import(name)); if (c) return c; } catch {}
  }
  die('Playwright is not installed. Run:  sh <skill>/scripts/setup.sh   (or: npm i -D playwright && npx playwright install chromium)');
}

// macOS: force Metal, otherwise new headless shells may fall back to SwiftShader (≈6× slower WebGL).
const angle = process.env.SHOWREEL_ANGLE || (process.platform === 'darwin' ? 'metal' : '');
export const ARGS = [
  ...(angle && angle !== 'default' ? [`--use-angle=${angle}`] : []),
  '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader',
  '--font-render-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars',
  '--autoplay-policy=no-user-gesture-required',
];

export async function launch(chromium) {
  const tries = process.env.CHROME_PATH ? [{ executablePath: process.env.CHROME_PATH }] : [{}, { channel: 'chrome' }, { channel: 'msedge' }];
  const errors = [];
  for (const opt of tries) {
    try { return await chromium.launch({ headless: true, args: ARGS, ...opt }); }
    catch (e) { errors.push(`${opt.channel || opt.executablePath || 'bundled chromium'}: ${String(e.message).split('\n')[0]}`); }
  }
  die('No usable headless browser.\n  ' + errors.join('\n  ') + '\nFix: npx playwright install chromium   (or install Google Chrome, or set CHROME_PATH)');
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream', '.hdr': 'application/octet-stream', '.exr': 'application/octet-stream',
  '.wasm': 'application/wasm', '.txt': 'text/plain; charset=utf-8',
};

// mounts: { '/__msr/': '/abs/dir' } serve extra folders (tool assets, shared samples) next to the project root
export function serve(root, mounts = {}) {
  root = path.resolve(root);
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      let base = root, rel = p;
      for (const [prefix, dir] of Object.entries(mounts)) if (p.startsWith(prefix)) { base = path.resolve(dir); rel = '/' + p.slice(prefix.length); break; }
      const file = path.resolve(base, '.' + rel);
      if (!file.startsWith(base) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

// target = project folder (with index.html) or an .html file inside it
export function resolveTarget(target) {
  if (!target) die('missing <project-dir | page.html>');
  const abs = path.resolve(target);
  if (!fs.existsSync(abs)) die(`not found: ${target}`);
  const isDir = fs.statSync(abs).isDirectory();
  const page = isDir ? path.join(abs, 'index.html') : abs;
  if (!fs.existsSync(page)) die(`no index.html in ${target}`);
  return { root: isDir ? abs : path.dirname(abs), page, rel: path.basename(page) };
}

export async function openPage(browser, { port, rel, w, h, dpr = 1, query = '' }) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  const recent = [];
  page.on('console', m => { if (m.type() === 'error') { const s = '[page] ' + m.text().slice(0, 300); recent.push(s); if (recent.length > 6) recent.shift(); console.error(s); } });
  page.on('pageerror', e => die(`[pageerror] ${e.message}\n(render(t) threw or a module failed; fix the page and retry)`));
  page.on('response', r => {
    if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) {
      const type = r.request().resourceType();
      const msg = `[page] ${r.status()} ${new URL(r.url()).pathname} (${type})`;
      if (type === 'script' || type === 'document') die(msg + ' — a required script/page is missing; paths are relative to the project folder');
      console.error(msg);
    }
  });
  const qs = new URLSearchParams(query); qs.set('w', w); qs.set('h', h); qs.set('render', '1');
  await page.goto(`http://127.0.0.1:${port}/${rel}?${qs}`);
  const t0 = Date.now();
  const hint = setTimeout(() => console.error('… still waiting for window.READY = true (20 s). ' + (recent.length ? 'Recent errors:\n  ' + recent.join('\n  ') : 'No errors yet; does the page ever set READY?')), 20000);
  try {
    await page.waitForFunction(() => typeof window.render === 'function' && (window.READY === true || window.READY === undefined), null, { timeout: 180000 });
    await page.evaluate(() => document.fonts ? document.fonts.ready.then(() => true) : true);
  } catch (e) { die(`window.READY never became true after ${((Date.now() - t0) / 1000) | 0}s: ${e.message.split('\n')[0]}`); }
  finally { clearTimeout(hint); }
  return page;
}

let glChecked = false;
export async function warnSoftwareGL(page) {
  if (glChecked) return; glChecked = true;
  const r = await page.evaluate(() => {
    const c = document.createElement('canvas'), g = c.getContext('webgl2') || c.getContext('webgl');
    if (!g) return 'none';
    const e = g.getExtension('WEBGL_debug_renderer_info');
    return e ? String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)) : 'unknown';
  }).catch(() => 'unknown');
  if (r === 'none') console.error('[note] WebGL is unavailable in this browser: shader / three.js pages will fail.');
  else if (/swiftshader|llvmpipe|software/i.test(r)) console.error(`[note] WebGL runs in software (${r.slice(0, 60)}): shader/3D renders will be slow.`);
  return r;
}

export function parseSize(s = '1920x1080') {
  const m = /^(\d+)x(\d+)$/.exec(s);
  if (!m) die(`bad --size ${s} (use WxH, e.g. 1080x1920)`);
  const w = +m[1], h = +m[2];
  if (w % 2 || h % 2) die('--size needs even numbers (H.264 yuv420p)');
  return { w, h };
}

export function args(argv) {
  const pos = [], opt = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('='), k = eq < 0 ? a.slice(2) : a.slice(2, eq), v = eq < 0 ? undefined : a.slice(eq + 1);   // split at the FIRST "=" only
      if (v !== undefined) opt[k] = v;
      else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) opt[k] = argv[++i];
      else opt[k] = true;
    } else pos.push(a);
  }
  return { pos, opt };
}

export function die(msg) { console.error(msg); process.exit(1); }
