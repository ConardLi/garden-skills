import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createPreviewServer } from '../preview.mjs';
import { loadChromium, launch } from '../lib/browser.mjs';

const S = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let browser;
before(async () => { browser = await launch(await loadChromium(S)); });
after(async () => { await browser?.close(); });

async function fixture(t, { tracks = [], importPreview = false, audio } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'showreel-preview-'));
  fs.mkdirSync(path.join(root, 'audio'));
  for (const name of tracks) execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=4', path.join(root, 'audio', name)], { stdio: 'ignore' });
  if (importPreview) fs.copyFileSync(path.join(S, '..', 'assets', 'starter', 'preview.js'), path.join(root, 'preview.js'));
  fs.writeFileSync(path.join(root, 'index.html'), `<!doctype html><canvas width="64" height="36"></canvas><script>
    window.DUR=4;window.READY=true;window.render=t=>{window.lastRendered=t;const g=document.querySelector('canvas').getContext('2d');g.fillStyle='rgb('+Math.floor(t*30)+',100,100)';g.fillRect(0,0,64,36);};window.render(0);
    </script>${importPreview ? '<script type="module" src="./preview.js"></script>' : ''}`);
  const preview = await createPreviewServer(root, { size: '64x36', fps: 10, port: 0, audio });
  const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
  t.after(async () => { await page.close(); await preview.close(); fs.rmSync(root, { recursive: true, force: true }); });
  await page.goto(preview.url);
  await page.waitForFunction(() => window.__showreelPreview?.ready || window.__showreelPreview?.error);
  return { root, preview, page };
}

test('preview is injected without source changes, audio is the master clock, and nothing autoplays', async t => {
  const { page, root, preview } = await fixture(t, { tracks: ['final.wav', 'narration.wav', 'music.wav'] });
  const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.doesNotMatch(source, /preview\.js/);
  const initial = await page.evaluate(() => ({ playing: window.__showreelPreview.playing, paused: window.__showreelPreview.audio.paused, current: window.__showreelPreview.audio.currentTime, src: window.__showreelPreview.audio.src }));
  assert.equal(initial.playing, false); assert.equal(initial.paused, true); assert.equal(initial.current, 0); assert.match(initial.src, /audio\/final\.wav$/);
  const range = await fetch(new URL('audio/final.wav', preview.url), { headers: { Range: 'bytes=0-15' } });
  assert.equal(range.status, 206); assert.match(range.headers.get('content-range'), /^bytes 0-15\//); assert.equal((await range.arrayBuffer()).byteLength, 16);
  await page.getByRole('button', { name: 'Play preview' }).click();
  await page.waitForFunction(() => window.__showreelPreview.currentTime > 0.1);
  await page.evaluate(() => { window.__showreelPreview.audio.currentTime = 1.8; });
  await page.waitForFunction(() => window.__showreelPreview.currentTime >= 1.8);
  await page.getByRole('button', { name: 'Pause preview' }).click();
  const stopped = await page.evaluate(() => ({ t: window.__showreelPreview.currentTime, audio: window.__showreelPreview.audio.currentTime, paused: window.__showreelPreview.audio.paused }));
  assert.equal(stopped.paused, true); assert.ok(Math.abs(stopped.t - stopped.audio) < 0.1);
});

test('dragging, frame buttons, keyboard stepping and speed affect only the preview', async t => {
  const { page } = await fixture(t, { tracks: ['voice take.wav'], audio: 'audio/voice take.wav' });
  await page.getByRole('slider', { name: 'Preview time' }).evaluate(input => { input.value = '2'; input.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.waitForFunction(() => Math.abs(window.lastRendered - 2) < 0.001);
  assert.ok(Math.abs(await page.evaluate(() => window.__showreelPreview.audio.currentTime) - 2) < 0.001);
  await page.getByRole('button', { name: 'Next frame' }).click();
  assert.ok(Math.abs(await page.evaluate(() => window.lastRendered) - 2.1) < 0.001);
  await page.getByRole('button', { name: 'Previous frame' }).click();
  assert.ok(Math.abs(await page.evaluate(() => window.lastRendered) - 2) < 0.001);
  // Arrow keys still step when a transport button retains focus.
  await page.keyboard.press('ArrowRight');
  assert.ok(Math.abs(await page.evaluate(() => window.lastRendered) - 2.1) < 0.001);
  await page.getByRole('combobox', { name: 'Preview speed' }).selectOption('2');
  const speed = await page.evaluate(() => ({ rate: window.__showreelPreview.rate, audio: window.__showreelPreview.audio.playbackRate, duration: window.DUR, playing: window.__showreelPreview.playing }));
  assert.deepEqual(speed, { rate: 2, audio: 2, duration: 4, playing: false });
});

test('silent preview advances using its own clock, pauses, and clamps endpoint drawing to the last frame', async t => {
  const { page } = await fixture(t);
  assert.equal(await page.evaluate(() => window.__showreelPreview.audio), null);
  await page.getByRole('combobox', { name: 'Preview speed' }).selectOption('2');
  await page.getByRole('button', { name: 'Play preview' }).click();
  await page.waitForFunction(() => window.__showreelPreview.currentTime > 0.15);
  await page.getByRole('button', { name: 'Pause preview' }).click();
  const paused = await page.evaluate(() => ({ t: window.__showreelPreview.currentTime, playing: window.__showreelPreview.playing }));
  assert.ok(paused.t > 0); assert.equal(paused.playing, false);
  await page.evaluate(() => window.__showreelPreview.seek(4));
  const end = await page.evaluate(() => ({ t: window.__showreelPreview.currentTime, draw: window.lastRendered }));
  assert.deepEqual(end, { t: 4, draw: 3.9 });
});

test('audio fallback order is narration before music, and music before silence', async t => {
  const first = await fixture(t, { tracks: ['narration.wav', 'music.wav'] });
  assert.match(await first.page.evaluate(() => window.__showreelPreview.audio.src), /audio\/narration\.wav$/);
  const second = await fixture(t, { tracks: ['music.wav'] });
  assert.match(await second.page.evaluate(() => window.__showreelPreview.audio.src), /audio\/music\.wav$/);
});

test('render mode never creates preview UI, even when the page imports the module itself', async t => {
  const { page, preview } = await fixture(t, { importPreview: true });
  assert.equal(await page.locator('showreel-preview').count(), 1, 'page import and server injection share one UI');
  const url = new URL(preview.url); url.searchParams.set('render', '1');
  const response = await page.goto(url.href); const source = await response.text();
  assert.doesNotMatch(source, /__showreel-preview\/preview\.js/);
  await page.waitForFunction(() => window.READY === true);
  assert.equal(await page.locator('showreel-preview').count(), 0);
  assert.equal(await page.evaluate(() => window.__showreelPreview), undefined);
  assert.equal(await page.locator('#showreel-preview-fit').count(), 0);
  assert.equal(await page.locator('body').getAttribute('data-showreel-preview-stage'), null);
  await page.evaluate(() => { window.render(2.5); window.render(0.5); window.render(2.5); });
  assert.equal(await page.evaluate(() => window.lastRendered), 2.5);
});

test('portrait preview fits the complete stage above controls, including fixed DOM and SVG, and refits on resize', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'showreel-preview-portrait-'));
  const source = `<!doctype html><style>html,body{margin:0;overflow:hidden}body>canvas{display:block}#caption{position:fixed;left:80px;bottom:80px;width:920px;height:80px;background:#f00}#vector{position:fixed;right:40px;top:40px;width:120px;height:120px}</style>
    <body style="background:#f8f8f8;transform:translate3d(0px,0px,0px)"><canvas id="picture" width="1080" height="1920" style="width:1080px;height:1920px"></canvas>
    <canvas id="glview" width="160" height="90" style="position:absolute;left:0;top:0;width:160px;height:90px"></canvas>
    <div id="caption">Bottom caption</div><svg id="vector" viewBox="0 0 120 120"><rect width="120" height="120" fill="blue"/></svg>
    <script>window.gl=glview.getContext('webgl',{preserveDrawingBuffer:true});window.gl.clearColor(1,0,0,1);window.gl.clear(window.gl.COLOR_BUFFER_BIT);window.DUR=4;window.READY=true;window.draws=0;window.render=t=>{window.draws++;window.lastRendered=t;const g=picture.getContext('2d');g.fillStyle='#f8f8f8';g.fillRect(0,0,1080,1920);};window.render(0);</script></body>`;
  fs.writeFileSync(path.join(root, 'index.html'), source);
  const preview = await createPreviewServer(root, { size: '1080x1920', fps: 30 });
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  t.after(async () => { await page.close(); await preview.close(); fs.rmSync(root, { recursive: true, force: true }); });
  await page.goto(preview.url); await page.waitForFunction(() => window.__showreelPreview?.ready);
  const geometry = () => page.evaluate(() => {
    const rect = element => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; };
    const canvas = document.getElementById('picture');
    const pixel = new Uint8Array(4); window.gl.readPixels(0, 0, 1, 1, window.gl.RGBA, window.gl.UNSIGNED_BYTE, pixel);
    return { stage: rect(canvas), controls: rect(document.getElementById('showreel-preview')), caption: rect(document.getElementById('caption')), vector: rect(document.getElementById('vector')), backing: [canvas.width, canvas.height], css: [canvas.offsetWidth, canvas.offsetHeight], bodyChild: canvas.parentElement === document.body, bodyStyle: document.body.getAttribute('style'), webgl: { same: document.getElementById('glview').getContext('webgl') === window.gl, size: [window.gl.drawingBufferWidth, window.gl.drawingBufferHeight], pixel: [...pixel] }, draws: window.draws, time: window.lastRendered, viewport: [innerWidth, innerHeight] };
  });
  const check = data => {
    assert.ok(data.stage.x >= 0 && data.stage.y >= 0);
    assert.ok(data.stage.right <= data.viewport[0] + 0.1);
    assert.ok(data.stage.bottom <= data.controls.y - 10, 'complete portrait remains above the transport bar');
    assert.ok(Math.abs(data.stage.width / data.stage.height - 1080 / 1920) < 0.0001);
    const scale = data.stage.width / 1080;
    assert.ok(Math.abs(data.caption.x - data.stage.x - 80 * scale) < 0.1);
    assert.ok(Math.abs(data.caption.bottom - data.stage.bottom + 80 * scale) < 0.1, 'fixed bottom caption follows the logical frame');
    assert.ok(Math.abs(data.vector.right - data.stage.right + 40 * scale) < 0.1, 'fixed SVG follows the same scale');
    assert.deepEqual(data.backing, [1080, 1920]); assert.deepEqual(data.css, [1080, 1920]); assert.equal(data.bodyChild, true);
    assert.deepEqual(data.webgl, { same: true, size: [160, 90], pixel: [255, 0, 0, 255] });
  };
  const first = await geometry(); check(first);
  await page.setViewportSize({ width: 520, height: 820 });
  await page.waitForFunction(width => Math.abs(document.getElementById('picture').getBoundingClientRect().width - width) > 1, first.stage.width);
  const second = await geometry(); check(second);
  assert.equal(second.draws, first.draws, 'fitting only changes preview CSS, without re-rendering or changing scene state');
  assert.equal(second.time, first.time);
  assert.equal(second.bodyStyle, first.bodyStyle);
  assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), source);
  await page.evaluate(() => window.__showreelPreview.destroy());
  assert.equal(await page.locator('#showreel-preview-fit').count(), 0);
  assert.equal(await page.locator('body').getAttribute('data-showreel-preview-stage'), null);
  assert.equal(await page.locator('body').getAttribute('style'), first.bodyStyle, 'destroy preserves the authored body styles');
});

test('a missing explicit audio path shows an error instead of silently choosing another track', async t => {
  const { page, preview } = await fixture(t, { tracks: ['music.wav'] });
  const url = new URL(preview.url); url.searchParams.set('audio', 'audio/missing.wav');
  await page.goto(url.href); await page.waitForFunction(() => window.__showreelPreview?.error);
  assert.match(await page.getByRole('status').textContent(), /Audio file not found/);
  assert.equal(await page.getByRole('button', { name: 'Play preview' }).isDisabled(), true);
  assert.equal(await page.evaluate(() => window.__showreelPreview.audio), null);
});

test('async picture rendering stays serial and seeking waits for the latest requested frame', async t => {
  const { page } = await fixture(t);
  await page.evaluate(() => {
    window.drawActive = 0; window.maxDrawActive = 0;
    window.render = async t => {
      window.drawActive++; window.maxDrawActive = Math.max(window.maxDrawActive, window.drawActive);
      await new Promise(resolve => setTimeout(resolve, 30)); window.lastRendered = t; window.drawActive--;
    };
    window.__showreelPreview.play();
  });
  await page.waitForFunction(() => window.drawActive > 0);
  await page.evaluate(async () => { window.__showreelPreview.pause(); await window.__showreelPreview.seek(3); });
  assert.deepEqual(await page.evaluate(() => ({ active: window.maxDrawActive, t: window.lastRendered })), { active: 1, t: 3 });
});

test('CLI rejects external audio and missing explicit audio without starting a server', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'showreel-preview-invalid-')); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'index.html'), '<canvas></canvas>');
  await assert.rejects(createPreviewServer(root, { size: '64x36', audio: 'https://example.com/voice.wav' }), /project-relative/);
  await assert.rejects(createPreviewServer(root, { size: '64x36', audio: '../voice.wav' }), /project-relative/);
  await assert.rejects(createPreviewServer(root, { size: '64x36', audio: 'audio/does-not-exist.wav' }), /Audio not found/);
});
