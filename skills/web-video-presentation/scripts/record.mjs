/**
 * Headless screenshot recorder for web-video-presentation.
 *
 * ── 为什么需要它（已踩坑，写进 skill 防止复发）────────────────────────────
 * 无头 Chrome 录 webm 时，每一帧的时间戳相对页面事件本身会随机抖 ±0.9s
 * （无净漂移）。无论重定时 / 改 CFR / 压动画都救不回来——问题在「录制帧的
 * 采样点」不在事件上，后期重映射无解。
 *
 * FIX：不靠录制帧时序，改为在每一步切换后 ~200ms（入场动画已定格）截取一张
 * 图。该图抓取时刻是已知页面时钟、内容绝对对应「第 i 步」。后期由
 * build_from_shots.py 按每步音频时长把图定格、并用「干净累积时长」重建音轨，
 * 二者共用同一时间轴 → 逐帧对齐，零录制抖动。
 *
 * ── 配置（全部可选，缺省自动探测）──────────────────────────────────────
 *   PROJECT_ROOT     default = 进程 cwd
 *   PORT             default = 5174            （vite dev server 端口）
 *   RAW_DIR          default = $PROJECT_ROOT/raw
 *   STORAGE_KEY      default = 读 src/hooks/useStepper.ts
 *   STAGE_W / STAGE_H default = 读 src/stage.config.ts
 *   CHROME           default = 自动探测系统 Chrome
 *   PLAYWRIGHT_CORE  default = $PROJECT_ROOT/node_modules/playwright-core
 *
 * 依赖：playwright-core（需先 `npm i -D playwright-core` 并装浏览器：
 *       `npx playwright-core install chromium`，或设 CHROME 指向系统 Chrome）
 *
 * 输出：
 *   $RAW_DIR/video.webm    静音捕获（仅供对照，成片不用它）
 *   $RAW_DIR/marks.json    { t0, start, marks:[{id, t}], total }
 *                          id = "<chapterSlug>:<step 1-based>"，与 beats.json 的
 *                          step_id 完全一致（下游 check.ps1 C5 / build_from_shots /
 *                          shots-review 均按此口径消费）
 *   $RAW_DIR/shots/step-<chapterSlug>-<step>.png   每步定格截图（成片真正素材）
 */
import { createRequire } from "module";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);

const PROJECT_ROOT = path.resolve(process.env.PROJECT_ROOT || process.cwd());
const PORT = process.env.PORT || "5174";
const RAW_DIR = process.env.RAW_DIR || path.join(PROJECT_ROOT, "raw");
const SRC = path.join(PROJECT_ROOT, "src");

// ── 自动探测 STORAGE_KEY / STAGE ────────────────────────────────────────
function detect(reFile, re, fallback, label) {
  try {
    const txt = require("fs").readFileSync(reFile, "utf8");
    const m = txt.match(re);
    if (m) return m[1];
  } catch { /* ignore */ }
  console.warn(`⚠ 未探测到 ${label}，用默认值`);
  return fallback;
}
const STORAGE_KEY = process.env.STORAGE_KEY ||
  detect(
    path.join(SRC, "hooks/useStepper.ts"),
    /STORAGE_KEY\s*=\s*["']([^"']+)["']/,
    "presentation-cursor-v4",
    "STORAGE_KEY (useStepper.ts)",
  );
const STAGE_W = Number(process.env.STAGE_W) ||
  Number(detect(
    path.join(SRC, "stage.config.ts"),
    /export const STAGE_W\s*=\s*(\d+)/,
    "1920",
    "STAGE_W (stage.config.ts)",
  ));
const STAGE_H = Number(process.env.STAGE_H) ||
  Number(detect(
    path.join(SRC, "stage.config.ts"),
    /export const STAGE_H\s*=\s*(\d+)/,
    "1080",
    "STAGE_H (stage.config.ts)",
  ));

// ── 章节 slug 列表 ───────────────────────────────────────────────────────
// 写 marks 的 id 用「章 slug + 1 基步号」（如 hook:1），与 beats.json 的
// step_id 对齐 —— 免得每篇出片后手工改 marks id（ep06/ep08 都踩过）。
// 顺序即 registry/chapters.ts 的声明顺序（= useStepper 的 chapter 序号），
// 用与 extract-narrations / build_from_shots 相同的正则提取 `id:` 字段。
const CHAPTER_SLUGS = (() => {
  try {
    const txt = require("fs").readFileSync(
      path.join(SRC, "registry/chapters.ts"), "utf8");
    const ids = [...txt.matchAll(/id:\s*["']([^"']+)["']/g)].map((m) => m[1]);
    if (ids.length) return ids;
  } catch { /* ignore */ }
  console.warn("⚠ 未探测到章节 slug（src/registry/chapters.ts），marks id 退化为数字章节号");
  return [];
})();

// ── 自动探测 Chrome ──────────────────────────────────────────────────────
function detectChrome() {
  if (process.env.CHROME && existsSync(process.env.CHROME)) return process.env.CHROME;
  const candidates = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  for (const c of candidates) if (existsSync(c)) return c;
  // 让 playwright 用自带 chromium
  return null;
}
const CHROME = detectChrome();

// ── 解析 playwright-core ─────────────────────────────────────────────────
let chromium;
try {
  const pc = process.env.PLAYWRIGHT_CORE
    ? require.resolve(process.env.PLAYWRIGHT_CORE)
    : require.resolve("playwright-core", { paths: [PROJECT_ROOT] });
  ({ chromium } = require(pc));
} catch (e) {
  console.error(
    "✗ 找不到 playwright-core。无头录制需要先装：\n" +
    "    cd " + PROJECT_ROOT + "\n" +
    "    npm i -D playwright-core\n" +
    "    npx playwright-core install chromium   # 或设 CHROME=系统Chrome路径\n",
  );
  process.exit(1);
}

const URL = `http://localhost:${PORT}/?auto=1`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(`[${new Date().toISOString()}]`, ...a);

await mkdir(RAW_DIR, { recursive: true });
const SHOTS = path.join(RAW_DIR, "shots");
await mkdir(SHOTS, { recursive: true });

const launchOpts = {
  headless: true,
  args: [
    "--autoplay-policy=no-user-gesture-required",
    "--force-device-scale-factor=1",
    "--hide-scrollbars",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--disable-backgrounding-occluded-windows",
  ],
};
if (CHROME) launchOpts.executablePath = CHROME;

const browser = await chromium.launch(launchOpts);
const context = await browser.newContext({
  viewport: { width: STAGE_W, height: STAGE_H },
  deviceScaleFactor: 1,
  recordVideo: { dir: RAW_DIR, size: { width: STAGE_W, height: STAGE_H } },
});
const page = await context.newPage();
page.on("console", (m) => {
  const t = m.text();
  if (t.includes("audio play failed") || m.type() === "error") log("PAGE:", t);
});

log("goto", URL);
await page.goto(URL, { waitUntil: "load" });

// 强制从第一步干净起步，再 reload 让 stepper + audio player 从 step 0 挂载
await page.evaluate(
  (key) => localStorage.setItem(key, JSON.stringify({ chapter: 0, step: 0 })),
  STORAGE_KEY,
);
await page.reload({ waitUntil: "load" });

await page.evaluate(() => document.fonts.ready);
await sleep(1200);
log("fonts ready");

// 成片不要出现编辑态 UI：进度条 / 模式切换按钮
await page.addStyleTag({ content: ".pb-hover, .at-hover { display: none !important; }" });

// ── instrumentation：记录每步切换的真实页面时钟 ──────────────────────────
await page.evaluate(({ key, slugs }) => {
  const w = window;
  w.__t0 = performance.now();
  w.__start = null;
  w.__marks = [];
  w.addEventListener("keydown", (e) => {
    if (e.key === " " && w.__start === null) w.__start = performance.now();
  }, true);
  let last = null;
  w.__timer = setInterval(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const c = JSON.parse(raw);
      const id = `${slugs[c.chapter] ?? c.chapter}:${c.step + 1}`;
      if (id !== last) {
        last = id;
        w.__marks.push({ id, t: performance.now() });
      }
    } catch { /* ignore */ }
  }, 16);
}, { key: STORAGE_KEY, slugs: CHAPTER_SLUGS });

const gate = await page.$(".auto-gate");
if (!gate) throw new Error("Auto start gate 未找到 —— ?auto=1 生效了吗？");

log("按 Space 启动自动播放");
await page.keyboard.press("Space");
const press_node = Date.now();

// ── 逐步截图（根治音画不同步的核心）──────────────────────────────────────
let lastShot = "none";
const shotTimer = setInterval(async () => {
  try {
    const cur = await page.evaluate(({ k, slugs }) => {
      const c = JSON.parse(localStorage.getItem(k) || "null");
      return c ? `${slugs[c.chapter] ?? c.chapter}:${c.step + 1}` : null;
    }, { k: STORAGE_KEY, slugs: CHAPTER_SLUGS });
    if (cur && cur !== lastShot) {
      lastShot = cur;
      setTimeout(async () => {
        try {
          await page.screenshot({
            path: path.join(SHOTS, `step-${cur.replace(/:/g, "-")}.png`),
          });
        } catch { /* ignore */ }
      }, 200);
    }
  } catch { /* ignore */ }
}, 120);
await sleep(400);

// ── 等运行结束：marks 不再增长即收工 ─────────────────────────────────────
const startedAt = Date.now();
const HARD_TIMEOUT_MS = 20 * 60 * 1000;
let lastCount = -1;
let stableSince = Date.now();
let snapshot = { marks: [], start: null, t0: null };

while (Date.now() - startedAt < HARD_TIMEOUT_MS) {
  await sleep(2000);
  let snap;
  try {
    snap = await page.evaluate(() => ({
      marks: window.__marks,
      start: window.__start,
      t0: window.__t0,
    }));
  } catch (err) {
    log("!! 页面崩溃:", err.message);
    break;
  }
  snapshot = snap;
  await writeFile(
    path.join(RAW_DIR, "marks.json"),
    JSON.stringify(snapshot, null, 2),
    "utf-8",
  );
  const marks = snap.marks;
  if (marks.length !== lastCount) {
    lastCount = marks.length;
    stableSince = Date.now();
    log(`step ${marks.length} — ${marks.at(-1)?.id}`);
    continue;
  }
  if (marks.length > 0 && Date.now() - stableSince > 12000) {
    log(`idle ${Date.now() - stableSince}ms @ ${marks.length} marks — 收工`);
    break;
  }
  if (Date.now() - stableSince > 60000) {
    log(`卡在 ${marks.length} marks — 中止`);
    break;
  }
}

try { clearInterval(shotTimer); } catch { /* ignore */ }
try { await context.close(); } catch { /* ignore */ }
try { await browser.close(); } catch { /* ignore */ }

const files = await readdir(RAW_DIR);
const webm = files.find((f) => f.endsWith(".webm"));
if (webm) {
  await (await import("node:fs/promises")).rename(
    path.join(RAW_DIR, webm),
    path.join(RAW_DIR, "video.webm"),
  );
  log("video →", path.join(RAW_DIR, "video.webm"));
} else {
  log("!! 未生成 webm（不影响成片，成片用 shots）");
}
log("done — 截图:", (await readdir(SHOTS)).length, "张; marks:", snapshot.marks.length);
