#!/usr/bin/env node
// Frame-accurate renderer for pages that expose the render(t) contract:
//   window.DUR = 15;              // seconds (optional if --duration is given)
//   window.render = (t) => {...}; // draw the frame at t seconds; deterministic; may return a Promise
//   window.READY = true;          // set once fonts / images / models are loaded
// Optional: window.RENDER_CONTEXT = true lets render(t, { frameTime, fps }) keep
// discrete copy/cuts on the output frame while motion uses sub-sample time t.
//
// Video
//   node render.mjs <project> [--out out/video.mp4] [--size 1920x1080] [--fps 30] [--workers 3]
//                   [--start 0] [--duration D] [--subframes 1] [--shutter 0.5] [--dpr 1]
//                   [--audio audio/music.wav] [--grain 0] [--crf 16] [--png] [--q "k=v&k2=v2"]
// Stills (review frames, PNG) and contact sheet
//   node render.mjs <project> --still 0.5,2,7.25 [--out qa/stills] [--sheet]
//   node render.mjs <project> --range 0:15:1 [--out qa/stills] [--sheet]
// Poster frame (step 7)
//   node render.mjs <project> --poster 14.5 [--out out/poster.png]
// Style-frame directions (step 3): one key frame per ?dir=<name>, side by side with labels
//   node render.mjs <project> --directions a,b,c --at 14.5,2,0 [--out qa/directions.png] [--dir-param dir]
//   (--at: one time per direction, or one time for all; singles go next to the sheet in qa/directions/)
// Determinism check (same t rendered in different orders must be pixel-identical)
//   node render.mjs <project> --determinism
// Text framing (review material, never pass/fail): text cut by the frame edge, two different strings on top of each
// other, text in the platform safe zone, text too small for a phone. Canvas 2D and DOM/SVG text; issues that last ≥ 0.3 s.
//   node render.mjs <project> --text-check [--every 0.2] [--safe auto|none|T,R,B,L] [--out qa/text]
//   (--safe: fractions of the frame (0.12) or pixels; auto = 12 % top and bottom on vertical frames, none on landscape)
//
// --subframes N blends N samples per frame (motion blur; render time × N). --shutter 0.5 = 180°.
// --dpr 2 supersamples (renders 2× and downsizes with lanczos): crisper hairlines / 3D edges, ~3× slower.
// --grain N adds temporal film grain in ffmpeg (keeps page frames compressible). 0 = none.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { loadChromium, launch, serve, resolveTarget, openPage, warnSoftwareGL, parseSize, args, die } from './lib/browser.mjs';
import { textHook } from './lib/text-hook.mjs';

// Anything that must be undone on failure or interruption (ffmpeg children, temp dirs, output lock).
const cleanups = [];
const runCleanups = () => { while (cleanups.length) { try { cleanups.pop()(); } catch {} } };
const fail = msg => { console.error(msg); runCleanups(); process.exit(1); };
process.on('exit', runCleanups);
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => fail(`interrupted (${sig}); partial output removed`));
process.on('unhandledRejection', e => fail(`render failed: ${String(e?.message || e).split('\n')[0]}`));

const { pos, opt } = args(process.argv.slice(2));
const target = resolveTarget(pos[0]);
const { w: W, h: H } = parseSize(opt.size);
const FPS = +(opt.fps || 30);
const DPR = +(opt.dpr || 1);
if (!(FPS > 0 && FPS <= 240)) die(`bad --fps ${opt.fps}`);
if (!(DPR >= 1 && DPR <= 4)) die(`bad --dpr ${opt.dpr} (1–4)`);
const QUERY = typeof opt.q === 'string' ? opt.q : '';
const fmt = opt.png ? 'png' : 'jpeg';

const chromium = await loadChromium(target.root);
const { server, port } = await serve(target.root);
const browser = await launch(chromium);
const open = (query = QUERY, init = null) => openPage(browser, { port, rel: target.rel, w: W, h: H, dpr: DPR, query, init });
const finish = async code => { await browser.close().catch(() => {}); server.close(); process.exit(code); };
cleanups.push(() => server.close());

async function shoot(page, t, type = fmt, frameTime = t) {
  await page.evaluate(({ t, frameTime, fps }) => window.RENDER_CONTEXT === true
    ? window.render(t, { frameTime, fps })
    : window.render(t), { t, frameTime, fps: FPS });
  return await page.screenshot({ type, ...(type === 'jpeg' ? { quality: 95 } : {}), clip: { x: 0, y: 0, width: W, height: H } });
}

if (opt.poster !== undefined) await poster();
else if (opt.directions !== undefined) await directions();
else if (opt.still || opt.range) await stills();
else if (opt.determinism) await determinism();
else if (opt['text-check']) await textCheck();
else await video();
await finish(0);

// ───────────────────────────── text framing ─────────────────────────────
function safeZone() {
  const v = opt.safe === undefined || opt.safe === true ? 'auto' : String(opt.safe);
  if (v === 'none') return null;
  if (v === 'auto') return H > W ? { t: 0.12 * H, r: 0, b: 0.12 * H, l: 0 } : null;
  const n = v.split(',').map(Number);
  if (n.length !== 4 || n.some(x => !(x >= 0))) die(`bad --safe ${v}: auto | none | top,right,bottom,left (fractions like 0.12, or pixels)`);
  const px = (x, d) => (x < 1 ? x * d : x);
  return { t: px(n[0], H), r: px(n[1], W), b: px(n[2], H), l: px(n[3], W) };
}
async function textCheck() {
  const every = +(opt.every || 0.2);
  if (!(every > 0)) die(`bad --every ${opt.every}`);
  const out = path.resolve(typeof opt.out === 'string' ? opt.out.replace(/\.json$/, '') : path.join(target.root, 'qa', 'text'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const page = await open(QUERY, textHook);
  if (!(await page.evaluate(() => !!window.__msrText))) die('the text hook did not load in the page');
  const dur = +(opt.duration || await page.evaluate(() => window.DUR));
  if (!(dur > 0)) die('window.DUR is missing; pass --duration');
  const safe = safeZone(), BLEED = 0.12 * H, TINY = 0.016 * H;
  const area = b => Math.max(0, b.x1 - b.x0) * Math.max(0, b.y1 - b.y0);
  const inter = (a, b) => ({ x0: Math.max(a.x0, b.x0), y0: Math.max(a.y0, b.y0), x1: Math.min(a.x1, b.x1), y1: Math.min(a.y1, b.y1) });
  const frame = { x0: 0, y0: 0, x1: W, y1: H };
  const same = (a, b) => a.text.replace(/\s+/g, '') === b.text.replace(/\s+/g, '');
  const issues = new Map();                       // key → { kind, what, times: [], boxes: { t: [box] } }
  const note = (key, kind, what, t, bxs) => { let e = issues.get(key); if (!e) issues.set(key, (e = { kind, what, times: [], boxes: {} })); e.times.push(t); e.boxes[t] = bxs; };
  const times = []; for (let t = 0; t < dur - 1e-6; t += every) times.push(+t.toFixed(4));
  for (const t of times) {
    const boxes = await page.evaluate(t => { window.__msrText.reset(); return Promise.resolve(window.render(t)).then(() => window.__msrText.collect()); }, t);
    const seen = boxes.filter(b => area(b) > 1 && area(inter(b, frame)) > 0 && b.alpha >= 0.15);
    for (const b of seen) {
      const vis = area(inter(b, frame)) / area(b), q = JSON.stringify(b.text);
      if (vis < 0.98 && Math.max(-b.x0, -b.y0, b.x1 - W, b.y1 - H) > 2) {
        if (b.size >= BLEED) note(`bleed ${b.text}`, 'bleed', `${q} runs off the frame edge (display size: fine if it is a deliberate bleed)`, t, [b]);
        else note(`cut ${b.text}`, 'cut', `${q} is cut by the frame edge`, t, [b]);
      }
      if (safe && b.size < BLEED) {
        const zone = safe.t && b.y0 < safe.t ? 'top' : safe.b && b.y1 > H - safe.b ? 'bottom' : safe.l && b.x0 < safe.l ? 'left' : safe.r && b.x1 > W - safe.r ? 'right' : null;
        if (zone) note(`safe ${b.text}`, 'safe', `${q} sits in the ${zone} safe zone (platform UI covers it)`, t, [b]);
      }
      if (b.size < TINY) note(`tiny ${b.text}`, 'tiny', `${q} is ${b.size.toFixed(0)}px (${(100 * b.size / H).toFixed(1)}% of the frame height): unreadable on a phone unless it is a deliberate micro-annotation`, t, [b]);
    }
    const solid = seen.filter(b => !b.clip && b.alpha >= 0.3);
    for (let i = 0; i < solid.length; i++) for (let j = i + 1; j < solid.length; j++) {
      const a = solid[i], c = solid[j];
      if (same(a, c)) continue;
      if (area(inter(a, c)) >= 0.3 * Math.min(area(a), area(c))) {
        const [p, s] = [a.text, c.text].sort();
        note(`overlap ${p}|${s}`, 'overlap', `${JSON.stringify(p)} and ${JSON.stringify(s)} are drawn on top of each other`, t, [a, c]);
      }
    }
  }
  // keep what lasts: consecutive samples, ≥ 0.3 s (a single sample counts when samples are that far apart)
  const minRun = every >= 0.3 ? 1 : Math.ceil(0.3 / every) + 1;
  const found = [];
  for (const e of issues.values()) {
    let run = [e.times[0]];
    const flush = () => { if (run.length >= minRun) found.push({ kind: e.kind, what: e.what, t0: run[0], t1: +(run.at(-1) + every).toFixed(3), boxes: e.boxes[run[0]] }); };
    for (const t of e.times.slice(1)) { if (t - run.at(-1) <= every * 1.5) run.push(t); else { flush(); run = [t]; } }
    flush();
  }
  found.sort((a, b) => a.t0 - b.t0);
  // one picture per moment, with the boxes drawn in
  const shots = [...new Set(found.map(f => f.t0))].slice(0, 12);
  const files = [];
  for (const t of shots) {
    const marks = found.filter(f => f.t0 === t).flatMap(f => f.boxes.map(b => ({ ...b, kind: f.kind })));
    await page.evaluate(async ([t, marks, safe, W, H]) => {
      window.__msrText.reset(); await window.render(t);
      const d = document.createElement('div'); d.id = '__msr_marks';
      d.style.cssText = `position:fixed;left:0;top:0;width:${W}px;height:${H}px;pointer-events:none;z-index:2147483647`;
      const col = { cut: '#ff2d2d', overlap: '#ff2df0', safe: '#ffb000', tiny: '#2dd4ff', bleed: '#9aa0a6' };
      if (safe) for (const [y, h] of [[0, safe.t], [H - safe.b, safe.b]]) if (h) d.insertAdjacentHTML('beforeend', `<div style="position:absolute;left:0;top:${y}px;width:${W}px;height:${h}px;background:rgba(255,176,0,.18)"></div>`);
      for (const m of marks) d.insertAdjacentHTML('beforeend', `<div style="position:absolute;left:${m.x0}px;top:${m.y0}px;width:${m.x1 - m.x0}px;height:${m.y1 - m.y0}px;outline:3px solid ${col[m.kind]};outline-offset:2px"></div>`);
      document.body.appendChild(d);
    }, [t, marks, safe, W, H]);
    const file = `${out}-t${t.toFixed(2)}.png`;
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: W, height: H } });
    await page.evaluate(() => document.getElementById('__msr_marks')?.remove());
    files.push(file);
  }
  fs.writeFileSync(`${out}.json`, JSON.stringify({ size: `${W}x${H}`, every, safe, issues: found.map(({ boxes, ...f }) => f) }, null, 1));
  console.log(`text framing · ${times.length} frames every ${every}s · safe zone: ${safe ? `top ${safe.t.toFixed(0)} / bottom ${safe.b.toFixed(0)} / left ${safe.l.toFixed(0)} / right ${safe.r.toFixed(0)} px` : 'not checked'}`);
  if (!found.length) console.log('  no lasting text-framing problems found (WebGL / image text is not seen: look at those frames yourself)');
  for (const f of found) console.log(`  [${f.t0.toFixed(2)}–${f.t1.toFixed(2)}s] ${f.kind.toUpperCase().padEnd(7)} ${f.what}`);
  if (files.length) console.log(`  marked frames: ${files.join(', ')}${shots.length < new Set(found.map(f => f.t0)).size ? ' (first 12)' : ''}`);
  console.log(`  ${out}.json  (review material: look at each marked frame and decide; deliberate bleeds and micro-annotations are fine)`);
}

// ───────────────────────────── poster / directions ─────────────────────────────
function writePng(file, buf) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
  if (!fs.statSync(file).size) fail(`empty image written: ${file}`);
  console.log(file);
}
async function poster() {
  const t = +opt.poster;
  if (opt.poster === true || !Number.isFinite(t) || t < 0) die('--poster needs a time in seconds, e.g. --poster 14.5');
  const out = path.resolve(typeof opt.out === 'string' ? (opt.out.endsWith('.png') ? opt.out : path.join(opt.out, 'poster.png')) : path.join(target.root, 'out', 'poster.png'));
  const page = await open();
  await warnSoftwareGL(page);
  writePng(out, await shoot(page, t, 'png'));
}
async function directions() {
  const names = String(opt.directions === true ? '' : opt.directions).split(',').map(s => s.trim()).filter(Boolean);
  if (!names.length) die('--directions needs names, e.g. --directions a,b,c --at 14.5,2,0');
  if (opt.at === undefined || opt.at === true) die('--directions needs --at <seconds>: one per direction (--at 14.5,2,0) or one for all (--at 3)');
  const ats = String(opt.at).split(',').map(Number);
  if (ats.some(v => !Number.isFinite(v) || v < 0)) die(`bad --at ${opt.at}`);
  if (ats.length !== 1 && ats.length !== names.length) die(`--at has ${ats.length} times for ${names.length} directions (give one per direction, or one for all)`);
  const key = typeof opt['dir-param'] === 'string' ? opt['dir-param'] : 'dir';
  const sheet = path.resolve(typeof opt.out === 'string' ? (opt.out.endsWith('.png') ? opt.out : opt.out + '.png') : path.join(target.root, 'qa', 'directions.png'));
  const singles = sheet.replace(/\.png$/, '');
  const shots = [];
  for (const [i, name] of names.entries()) {
    const q = new URLSearchParams(QUERY); q.set(key, name);
    const page = await open(q.toString());                 // a fresh page per direction: no state shared between them
    await warnSoftwareGL(page);
    const t = ats.length === 1 ? ats[0] : ats[i], buf = await shoot(page, t, 'png');
    await page.close();
    writePng(path.join(singles, `${name}_t${t.toFixed(2)}.png`), buf);
    shots.push({ t, buf, label: `${name.toUpperCase()} · ${t.toFixed(2)}s` });
  }
  fs.mkdirSync(path.dirname(sheet), { recursive: true });
  await contactSheet(shots, sheet, { below: true });
  console.log(`${sheet}  (${names.length} directions side by side: send this one image and ask which to take, or how to mix)`);
}

// ───────────────────────────────── stills ─────────────────────────────────
async function stills() {
  let times = [];
  if (opt.still) times = String(opt.still).split(',').map(Number);
  if (opt.range) {
    const [a, b, s] = String(opt.range).split(':').map(Number);
    if (!(s > 0)) die('--range a:b:step needs a positive step');
    for (let t = a; t <= b + 1e-9; t += s) times.push(+t.toFixed(4));
  }
  if (times.some(Number.isNaN)) die('bad --still / --range values');
  const out = path.resolve(typeof opt.out === 'string' ? opt.out : path.join(target.root, 'qa', 'stills'));
  fs.mkdirSync(out, { recursive: true });
  const page = await open();
  await warnSoftwareGL(page);
  const shots = [];
  for (const t of times) {
    const buf = await shoot(page, t, 'png');
    const file = path.join(out, `t_${t.toFixed(2).padStart(6, '0')}.png`);
    fs.writeFileSync(file, buf);
    if (!fs.statSync(file).size) fail(`empty still written: ${file}`);
    shots.push({ t, file, buf });
    console.log(file);
  }
  if (opt.sheet) {
    const file = path.join(out, 'sheet.png');
    await contactSheet(shots, file);
    console.log(file);
  }
}

// below: captions in a strip under each cell instead of over its top-left corner (keeps the whole frame visible)
async function contactSheet(shots, file, { below = false } = {}) {
  const cols = shots.length <= 4 ? shots.length : shots.length <= 9 ? 3 : 4;
  const cw = Math.round(1600 / cols), ch = Math.round(cw * H / W);
  const cells = shots.map(s => `<figure><img src="data:image/png;base64,${s.buf.toString('base64')}"><figcaption>${s.label ?? s.t.toFixed(2) + 's'}</figcaption></figure>`).join('');
  const page = await browser.newPage({ viewport: { width: cols * (cw + 8) + 8, height: 200 } });
  const cap = below ? 'padding:8px 2px 2px;font-size:16px' : 'position:absolute;left:6px;top:6px;background:#000c;padding:4px 6px;border-radius:3px';
  await page.setContent(`<style>body{margin:0;background:#111;font:600 14px/1 ui-monospace,Menlo,monospace;color:#ddd}
    main{display:grid;grid-template-columns:repeat(${cols},${cw}px);gap:8px;padding:8px}figure{margin:0;position:relative}
    img{width:${cw}px;height:${ch}px;display:block;object-fit:cover;background:#000}
    figcaption{${cap}}</style><main>${cells}</main>`);
  await page.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
}

// ───────────────────────────── determinism ─────────────────────────────
async function determinism() {
  const probe = await open();
  const start = +(opt.start || 0);
  const dur = +(opt.duration || ((await probe.evaluate(() => window.DUR)) - start));
  if (!(dur > 0)) die('window.DUR is missing; pass --duration');
  const ts = [0.11, 0.37, 0.5, 0.73, 0.93].map(k => +(start + k * dur).toFixed(3)).concat(+(start + Math.max(0, dur - 1 / FPS)).toFixed(3));
  const a = [];
  for (const t of ts) a.push(await shoot(probe, t, 'png'));
  const fresh = await open();
  const b = new Array(ts.length);
  for (const i of [...ts.keys()].reverse()) {
    await fresh.evaluate(t => window.render(t), start + ((ts[i] - start) * 0.61 + 0.17) % dur); // render something unrelated first
    b[i] = await shoot(fresh, ts[i], 'png');
  }
  // GPU canvas rasterisation may differ by a level or two on antialiased edges between pages: tolerate that.
  const cmp = await browser.newPage();
  const bad = [];
  for (let i = 0; i < ts.length; i++) {
    if (a[i].equals(b[i])) continue;
    const d = await cmp.evaluate(async ([x, y]) => {
      const load = s => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = 'data:image/png;base64,' + s; });
      const [A, B] = await Promise.all([load(x), load(y)]), c = document.createElement('canvas');
      c.width = A.width; c.height = A.height; const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(A, 0, 0); const pa = g.getImageData(0, 0, c.width, c.height).data;
      g.clearRect(0, 0, c.width, c.height); g.drawImage(B, 0, 0); const pb = g.getImageData(0, 0, c.width, c.height).data;
      let n = 0; for (let k = 0; k < pa.length; k += 4) if (Math.max(Math.abs(pa[k] - pb[k]), Math.abs(pa[k + 1] - pb[k + 1]), Math.abs(pa[k + 2] - pb[k + 2])) > 24) n++;
      return n / (pa.length / 4);
    }, [a[i].toString('base64'), b[i].toString('base64')]);
    if (d > 0.0005) bad.push(`${ts[i]}s (${(d * 100).toFixed(2)}% pixels differ)`);
  }
  if (bad.length) {
    console.error(`NOT deterministic at ${bad.join(', ')}.\nSomething depends on render order: state carried between frames, Math.random()/Date.now()/performance.now(), CSS transitions/animations, requestAnimationFrame, or async loads finishing late.`);
    await finish(1);
  }
  console.log(`deterministic: ${ts.length} frames match across render orders (${ts.join(', ')} s)`);
}

// ───────────────────────────────── video ─────────────────────────────────
async function video() {
  const probe = await open();
  await warnSoftwareGL(probe);
  const start = +(opt.start || 0);
  const pageDur = await probe.evaluate(() => window.DUR);
  const dur = +(opt.duration || (pageDur ? pageDur - start : NaN));
  await probe.close();
  if (!(dur > 0)) die('window.DUR is missing; set it in the page or pass --duration');
  const SUB = Math.max(1, +(opt.subframes || 1) | 0);
  const SHUTTER = Math.min(1, Math.max(0, +(opt.shutter ?? 0.5)));
  const WK = +(opt.workers || 3);
  if (!(Number.isInteger(WK) && WK >= 1 && WK <= 16)) fail(`bad --workers ${opt.workers} (integer 1–16)`);
  const CRF = +(opt.crf ?? 16);
  if (!(CRF >= 0 && CRF <= 51)) fail(`bad --crf ${opt.crf} (0–51)`);
  const GRAIN = +(opt.grain || 0);
  const audio = typeof opt.audio === 'string' ? path.resolve(opt.audio) : null;
  if (audio && !fs.existsSync(audio)) die(`audio not found: ${audio}`);
  const out = path.resolve(typeof opt.out === 'string' ? opt.out : path.join(target.root, 'out', 'video.mp4'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  // one writer per output file: a second render to the same --out is refused (stale locks from dead pids are taken over)
  const lock = out + '.lock';
  const alive = pid => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
  try { fs.writeFileSync(lock, String(process.pid), { flag: 'wx' }); }
  catch {
    const other = +fs.readFileSync(lock, 'utf8');
    if (other && other !== process.pid && alive(other)) die(`another render (pid ${other}) is writing ${out}. Use a different --out, or wait for it.`);
    fs.writeFileSync(lock, String(process.pid));
  }
  cleanups.push(() => fs.rmSync(lock, { force: true }));
  const tmp = fs.mkdtempSync(path.join(path.dirname(out), '.segs-'));
  cleanups.push(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const procs = new Set();
  cleanups.push(() => { for (const p of procs) p.kill('SIGKILL'); });
  let aborted = null;

  const TOTAL = Math.round(dur * FPS), per = Math.ceil(TOTAL / WK), t0 = Date.now();
  // sample time of sub-sample j of frame f, centred on the frame time
  const sampleT = (f, j) => start + (f + (SUB > 1 ? SHUTTER * ((j + 0.5) / SUB - 0.5) : 0)) / FPS;
  const vf = [];
  if (SUB > 1) vf.push(`tmix=frames=${SUB}:weights=${Array(SUB).fill(1).join(' ')}`, `select='eq(mod(n\\,${SUB})\\,${SUB - 1})'`);
  vf.push(`setpts=N/(${FPS}*TB)`);
  if (DPR !== 1) vf.push(`scale=${W}:${H}:flags=lanczos`);
  if (GRAIN > 0) vf.push(`noise=c0s=${GRAIN}:allf=t`);
  vf.push('scale=out_color_matrix=bt709:out_range=tv', 'format=yuv420p');
  let done = 0;
  console.log(`rendering ${TOTAL} frames × ${SUB} sample(s) @ ${W}x${H} ${FPS}fps with ${WK} worker(s)…`);

  await Promise.all([...Array(WK)].map(async (_, k) => {
    const a = k * per, b = Math.min(TOTAL, a + per);
    if (a >= b) return;
    const page = await open();
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', fmt === 'png' ? 'png' : 'mjpeg', '-framerate', String(FPS * SUB), '-i', '-',
      '-vf', vf.join(','), '-r', String(FPS), '-c:v', 'libx264', '-preset', 'medium', '-crf', String(CRF),
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', `seg_${k}.mp4`], { cwd: tmp, stdio: ['pipe', 'inherit', 'inherit'] });
    procs.add(ff);
    let failed = null, exited = false;
    const closed = new Promise(r => ff.on('close', code => { exited = true; procs.delete(ff); if (code !== 0) failed ??= `ffmpeg exited with code ${code}`; r(code); }));
    ff.on('error', e => { failed = e.code === 'ENOENT' ? 'ffmpeg not found on PATH' : e.message; });
    ff.stdin.on('error', () => { failed ??= 'ffmpeg closed its input early'; });
    for (let f = a; f < b && !failed && !aborted; f++) {
      for (let j = 0; j < SUB && !failed && !exited; j++) {
        const buf = await shoot(page, sampleT(f, j), fmt, start + f / FPS);
        if (!ff.stdin.write(buf)) await Promise.race([new Promise(r => ff.stdin.once('drain', r)), closed]);
      }
      if (exited && f < b - 1) failed ??= 'ffmpeg stopped before all frames were written';
      if (++done % Math.max(1, Math.round(TOTAL / 10)) === 0) console.log(`  ${done}/${TOTAL} frames  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    const code = await closed;
    await page.close().catch(() => {});
    if (failed || code !== 0) aborted ??= `encoder failed in worker ${k}: ${failed || 'exit ' + code}`;   // stops the other workers too
  }));
  if (aborted) fail(aborted + ' (nothing written)');

  const segs = [...Array(WK).keys()].filter(k => k * per < TOTAL).map(k => `file 'seg_${k}.mp4'`).join('\n');
  fs.writeFileSync(path.join(tmp, 'list.txt'), segs);
  const cmd = ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'list.txt'];
  if (audio) cmd.push('-ss', String(start), '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-af', 'apad', '-t', String(TOTAL / FPS));
  else cmd.push('-c', 'copy');
  cmd.push('-movflags', '+faststart', 'joined.mp4');
  try { execFileSync('ffmpeg', cmd, { cwd: tmp, stdio: ['ignore', 'inherit', 'inherit'] }); }
  catch { fail('ffmpeg could not join the segments'); }
  // verify before publishing: frame count and duration must match what was asked for
  const joined = path.join(tmp, 'joined.mp4');
  let got = 0;
  try { got = parseInt(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', joined]).toString(), 10); } catch {}
  if (!Number.isFinite(got) || Math.abs(got - TOTAL) > 1) fail(`output has ${got} frames, expected ${TOTAL}; not published`);
  fs.renameSync(joined, out);
  const secs = (Date.now() - t0) / 1000;
  console.log(`done ${out}\n  ${TOTAL} frames, ${(TOTAL / FPS).toFixed(2)}s, ${secs.toFixed(1)}s wall (${(secs * 1000 / TOTAL / SUB).toFixed(0)} ms/sample)${audio ? ', audio muxed' : ''}`);
}
