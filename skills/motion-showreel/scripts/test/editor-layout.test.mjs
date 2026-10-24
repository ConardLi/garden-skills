import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEditorServer } from '../editor.mjs';
import { createProgressServer, publishPreview } from '../lib/editor-progress.mjs';
import { loadChromium, launch } from '../lib/browser.mjs';

const S = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let browser;
before(async () => { browser = await launch(await loadChromium(S)); });
after(async () => { await browser?.close(); });

function makeScene(root, tracks = 0) {
  if (tracks) {
    const samples = 8000, wav = Buffer.alloc(44 + samples * 2);
    wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
    wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
    wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28);
    wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(samples * 2, 40);
    for (let i = 0; i < samples; i++) wav.writeInt16LE(Math.round(Math.sin(i * Math.PI * 440 / 4000) * 3000), 44 + i * 2);
    fs.writeFileSync(path.join(root, 'tone.wav'), wav);
  }
  fs.writeFileSync(path.join(root, 'editor.json'), JSON.stringify({ duration: 1, size: '320x180', ...(tracks ? {
    audio: 'tone.wav', tracks: Array.from({ length: tracks }, (_, i) => ({ id: `sound-${i}`, kind: i ? 'sfx' : 'bgm', name: `声音 ${i + 1}`, file: 'tone.wav' })),
  } : {}) }));
  fs.writeFileSync(path.join(root, 'index.html'), `<!doctype html><style>body{margin:0}canvas{display:block}</style><canvas width="320" height="180"></canvas><script>
    window.DUR=1;window.READY=true;window.render=t=>{window.lastRendered=t;const g=document.querySelector('canvas').getContext('2d');g.fillStyle='#487a9e';g.fillRect(0,0,320,180);g.fillStyle='#ffffff';g.fillRect(30+t*50,40,40,40)};window.render(0);
  </script>`);
}
function assertSourcesPreserved(root, sources) {
  for (const [name, bytes] of sources) assert.deepEqual(fs.readFileSync(path.join(root, name)), bytes, `${name} must remain unchanged`);
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [entry.name]);
  assert.equal(walk(root).some(file => /\.mp4$/i.test(file)), false, 'preview controls must not start a video render');
}
async function fixture(t, { tracks = 0, progress = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'showreel-layout-'));
  makeScene(root, tracks);
  const sources = fs.readdirSync(root).map(name => [name, fs.readFileSync(path.join(root, name))]);
  const app = progress ? await createProgressServer(root) : await createEditorServer(root, { fps: 10 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  t.after(async () => {
    await page.close({ runBeforeUnload: false }); await app.close();
    try { assertSourcesPreserved(root, sources); }
    finally { fs.rmSync(root, { recursive: true, force: true }); }
  });
  await page.goto(app.url);
  if (!progress) await page.waitForFunction(() => window.__showreelEditor?.ready);
  return { root, app, page };
}
async function geometry(page) {
  return page.evaluate(() => {
    const rect = id => { const { x, y, width, height } = document.getElementById(id).getBoundingClientRect(); return { x, y, width, height }; };
    return { viewer: rect('viewer'), scene: rect('scene'), timeline: document.querySelector('.timeline-panel').getBoundingClientRect().height };
  });
}
async function settle(page) { await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))); }
async function assertWithinViewport(page, selector) {
  const viewport = page.viewportSize(), box = await page.locator(selector).boundingBox();
  assert.ok(box && box.width > 0 && box.height > 0, `${selector} must be visible`);
  assert.ok(box.x >= -1 && box.x + box.width <= viewport.width + 1 && box.y >= -1 && box.y + box.height <= viewport.height + 1, `${selector} must remain reachable inside the viewport`);
}

test('viewer fitting and explicit zoom use the available canvas without changing the scene viewport or rendering pixels', async t => {
  const { page } = await fixture(t);
  assert.equal(await page.locator('.brand').count(), 1);
  assert.equal(await page.locator('iframe').count(), 1, 'the workspace contains only the original scene, not another editor');
  const fit = await geometry(page), horizontalGap = fit.viewer.width - fit.scene.width, verticalGap = fit.viewer.height - fit.scene.height;
  assert.ok(Math.min(horizontalGap, verticalGap) <= 64, 'fit should fill the available preview in at least one axis');
  assert.ok(fit.scene.width <= fit.viewer.width + 1 && fit.scene.height <= fit.viewer.height + 1);
  assert.ok(Math.abs(fit.scene.width / fit.scene.height - 16 / 9) < 0.01);
  const before = await page.evaluate(() => [...window.__showreelEditor.picture.document.querySelector('canvas').getContext('2d').getImageData(0, 0, 320, 180).data]);
  for (const percent of [25, 50, 100, 200]) {
    await page.locator('#viewer-zoom').selectOption(String(percent)); await settle(page);
    const { scene } = await geometry(page);
    assert.ok(Math.abs(scene.width - 320 * percent / 100) <= 1, `${percent}% should scale the visible scene width`);
    assert.ok(Math.abs(scene.height - 180 * percent / 100) <= 1);
    assert.deepEqual(await page.evaluate(() => [window.__showreelEditor.picture.innerWidth, window.__showreelEditor.picture.innerHeight]), [320, 180]);
  }
  await page.locator('#viewer-zoom').selectOption('50'); await settle(page);
  const small = (await geometry(page)).scene.width;
  await page.locator('#zoom-in').click(); await settle(page);
  assert.ok((await geometry(page)).scene.width > small);
  await page.locator('#zoom-out').click(); await settle(page);
  assert.ok((await geometry(page)).scene.width <= small + 1);
  await page.locator('#fit-view').click(); await settle(page);
  assert.equal(await page.locator('#viewer-zoom').inputValue(), 'fit');
  assert.ok(Math.abs((await geometry(page)).scene.width - fit.scene.width) <= 1);
  assert.deepEqual(await page.evaluate(() => [...window.__showreelEditor.picture.document.querySelector('canvas').getContext('2d').getImageData(0, 0, 320, 180).data]), before, 'zoom is presentation-only');
});

test('timeline divider makes room for the picture with pointer and keyboard while compact tracks remain scrollable', async t => {
  const { page } = await fixture(t, { tracks: 6 });
  const divider = page.locator('#panel-divider'), before = await geometry(page), box = await divider.boundingBox();
  assert.equal(await divider.getAttribute('role'), 'separator');
  assert.equal(await divider.getAttribute('aria-orientation'), 'horizontal');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 100, { steps: 10 }); await page.mouse.up(); await settle(page);
  const after = await geometry(page);
  assert.ok(after.viewer.height >= before.viewer.height + 60, 'dragging down must enlarge the picture area');
  assert.ok(after.timeline <= before.timeline - 60, 'the timeline must give that space back');
  const scrollable = await page.locator('#timeline-scroll').evaluate(el => { el.scrollTop = el.scrollHeight; return { height: el.clientHeight, content: el.scrollHeight, top: el.scrollTop }; });
  assert.ok(scrollable.content > scrollable.height && scrollable.top > 0, 'compact tracks remain vertically scrollable');
  await divider.focus(); await page.keyboard.press('ArrowUp'); await settle(page);
  const up = await geometry(page); assert.ok(up.viewer.height < after.viewer.height, 'keyboard up expands the timeline');
  await page.keyboard.press('ArrowDown'); await settle(page);
  assert.ok((await geometry(page)).viewer.height > up.viewer.height, 'keyboard down expands the picture');
  await page.evaluate(() => window.__showreelEditor.seek(0.6));
  assert.equal(await page.evaluate(() => window.__showreelEditor.picture.lastRendered), 0.6, 'resizing does not disturb seeking');
});

test('maximized viewing restores with Escape and narrow screens keep essential controls inside the viewport', async t => {
  const { page } = await fixture(t);
  const before = await geometry(page);
  await page.locator('#maximize-view').click(); await settle(page);
  assert.equal(await page.locator('.timeline-panel').isVisible(), false);
  assert.ok((await geometry(page)).viewer.height > before.viewer.height + 100);
  await page.keyboard.press('Escape'); await settle(page);
  assert.equal(await page.locator('.timeline-panel').isVisible(), true);
  assert.ok(Math.abs((await geometry(page)).viewer.height - before.viewer.height) <= 2, 'Escape restores the previous panel split');
  await page.setViewportSize({ width: 474, height: 800 }); await settle(page);
  await page.locator('#fit-view').click(); await settle(page);
  for (const selector of ['#export', '#viewer-zoom', '#zoom-in', '#zoom-out', '#maximize-view', '#play', '#panel-divider']) await assertWithinViewport(page, selector);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'the application must not horizontally overflow on mobile');
  const fit = await geometry(page);
  assert.ok(fit.scene.x >= fit.viewer.x - 1 && fit.scene.x + fit.scene.width <= fit.viewer.x + fit.viewer.width + 1);
  await page.locator('#viewer-zoom').selectOption('200'); await settle(page);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'an enlarged preview scrolls inside its own viewer');
  assert.deepEqual(await page.evaluate(() => [window.__showreelEditor.picture.innerWidth, window.__showreelEditor.picture.innerHeight]), [320, 180]);
});

test('production progress uses the same workspace and a dismissible drawer rather than an embedded editor', async t => {
  const { page, root } = await fixture(t, { progress: true });
  await page.locator('#toggle-progress').waitFor();
  await publishPreview(root, '.', { stage: 'scenes', fps: 10 });
  await page.waitForFunction(() => window.__showreelEditor?.ready, null, { timeout: 30000 });
  assert.equal(await page.locator('.brand').count(), 1);
  assert.equal(await page.locator('iframe').count(), 1);
  assert.equal(await page.locator('#scene').count(), 1);
  assert.equal(page.frames().filter(frame => frame.parentFrame() && /\/editor(?:\?|$)/.test(frame.url())).length, 0, 'no nested editor document is loaded');
  assert.equal(await page.locator('#export').isDisabled(), true, 'intermediate production previews remain read-only');
  const toggle = page.locator('#toggle-progress');
  await toggle.click();
  const expanded = await toggle.getAttribute('aria-expanded');
  assert.ok(expanded === 'true' || expanded === 'false', 'the progress drawer exposes its open state');
  await toggle.click();
  assert.notEqual(await toggle.getAttribute('aria-expanded'), expanded);
  await page.setViewportSize({ width: 474, height: 800 }); await settle(page);
  await assertWithinViewport(page, '#toggle-progress');
  await toggle.click();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.__showreelEditor.seek(0.5));
  assert.equal(await page.evaluate(() => window.__showreelEditor.picture.lastRendered), 0.5);
});
