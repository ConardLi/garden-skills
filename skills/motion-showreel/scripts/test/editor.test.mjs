import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createEditorServer } from '../editor.mjs';
import { loadChromium, launch } from '../lib/browser.mjs';

const S = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let browser;
before(async () => { browser = await launch(await loadChromium(S)); });
after(async () => { await browser?.close(); });

async function fixture(t, { audio = true, duration = 4 } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'showreel-editor-ui-'));
  fs.mkdirSync(path.join(root, 'audio'));
  fs.mkdirSync(path.join(root, 'assets')); fs.writeFileSync(path.join(root, 'assets/helper.js'), 'window.rootAssetLoaded=true;');
  if (audio) {
    for (const [name, frequency] of [['voice', 440], ['music', 880], ['fx', 220]]) execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `sine=frequency=${frequency}:duration=${duration}`, path.join(root, 'audio', `${name}.wav`)]);
    fs.copyFileSync(path.join(root, 'audio/voice.wav'), path.join(root, 'audio/final.wav'));
  }
  fs.writeFileSync(path.join(root, 'editor.json'), JSON.stringify({ duration, size: '320x180', ...(audio ? { audio: 'audio/final.wav', tracks: ['voice', 'bgm', 'sfx'].map((kind, i) => ({ id: kind, kind, file: `audio/${['voice', 'music', 'fx'][i]}.wav`, gain: kind === 'voice' ? 1 : 0.25 })) } : {}) }));
  fs.writeFileSync(path.join(root, 'index.html'), `<!doctype html><script src="/assets/helper.js"></script><style>body{margin:0}canvas{display:block}</style><canvas width="320" height="180"></canvas><script>
    window.DUR=${duration};window.READY=true;window.render=t=>{window.lastRendered=t;const g=document.querySelector('canvas').getContext('2d');g.fillStyle='rgb('+Math.floor(t*20+70)+',140,180)';g.fillRect(0,0,320,180);g.fillStyle='#ffffff';g.fillRect(20+t*20,30,40,40);};window.render(0);
  </script>`);
  const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const app = await createEditorServer(root, { fps: 10 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  t.after(async () => { await page.close({ runBeforeUnload: false }); await app.close(); fs.rmSync(root, { recursive: true, force: true }); });
  await page.goto(app.url); await page.waitForFunction(() => window.__showreelEditor?.ready, { timeout: 30000 });
  return { root, source, app, page };
}

test('workspace isolates the scene, displays real tracks, seeks to export frames and preserves the original sound', async t => {
  const { page, root, source, app } = await fixture(t);
  assert.equal(await page.locator('.track-row').count(), 4);
  const initial = await page.evaluate(() => ({ src: window.__showreelEditor.audio.src, scene: window.__showreelEditor.picture.location.href, width: window.__showreelEditor.picture.innerWidth, height: window.__showreelEditor.picture.innerHeight }));
  assert.match(initial.src, /audio\/final.wav$/); assert.match(initial.scene, /render=1/); assert.equal(initial.width, 320); assert.equal(initial.height, 180);
  assert.equal(await page.evaluate(() => window.__showreelEditor.picture.rootAssetLoaded), true, 'root-relative scene assets retain their original URLs');
  await page.evaluate(() => window.__showreelEditor.seek(1.28));
  assert.ok(Math.abs(await page.evaluate(() => window.__showreelEditor.picture.lastRendered) - 1.2) < 0.0001);
  const pixels = await page.evaluate(() => [...window.__showreelEditor.picture.document.querySelector('canvas').getContext('2d').getImageData(0, 0, 320, 180).data]);
  const direct = await browser.newPage({ viewport: { width: 320, height: 180 } });
  try {
    await direct.goto(new URL(initial.scene, app.url).href); await direct.evaluate(() => window.render(1.2));
    assert.deepEqual(await direct.evaluate(() => [...document.querySelector('canvas').getContext('2d').getImageData(0, 0, 320, 180).data]), pixels);
  } finally { await direct.close(); }
  assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), source);
  assert.deepEqual(fs.existsSync(path.join(root, 'out')) ? fs.readdirSync(path.join(root, 'out')).filter(f => f.endsWith('.mp4')) : [], []);
});

test('narrow windows retain the complete frame and reachable export, timeline and sound inspector', async t => {
  const { page } = await fixture(t);
  await page.setViewportSize({ width: 478, height: 735 });
  const button = await page.locator('#export').boundingBox();
  assert.ok(button.x >= 0 && button.x + button.width <= 478);
  const frame = await page.locator('#frame-wrap').boundingBox();
  assert.ok(frame.x >= 0 && frame.x + frame.width <= 478);
  assert.equal(await page.locator('.inspector').isVisible(), false);
  await page.getByRole('button', { name: '调音', exact: true }).click();
  assert.equal(await page.locator('.inspector').isVisible(), true);
  await page.getByRole('button', { name: '调音', exact: true }).click();
  assert.equal(await page.locator('.inspector').isVisible(), false);
  assert.equal(await page.evaluate(() => window.__showreelEditor.picture.innerWidth), 320);
});

test('edited audio is auditioned once and the exact same cached WAV is used by the accepted export', async t => {
  const { page, root } = await fixture(t);
  await page.evaluate(() => window.__showreelEditor.edit(s => { s.tracks[1].gain = 0.1; s.tracks[2].clips[0].duration = 1; s.tracks[2].clips[0].start = 2; }));
  const result = await page.evaluate(() => window.__showreelEditor.applyAudio());
  assert.match(result.file, /\.showreel-editor\/audio\//);
  const before = fs.readFileSync(path.join(root, result.file));
  await page.getByRole('button', { name: /导出视频/ }).click();
  await page.waitForFunction(() => !window.__showreelEditor.busy && !document.getElementById('download').hidden, null, { timeout: 90000 });
  const task = fs.readdirSync(path.join(root, '.showreel-editor/exports'))[0];
  const receipt = JSON.parse(fs.readFileSync(path.join(root, '.showreel-editor/exports', task, 'receipt.json')));
  assert.equal(receipt.audio, result.file); assert.deepEqual(fs.readFileSync(path.join(root, receipt.audio)), before);
  assert.equal(fs.existsSync(path.join(root, 'audio/final.wav')), true);
});

test('split, dragging, gain, mute, undo, save and restore affect independent audio edits only', async t => {
  const { page, root } = await fixture(t);
  await page.evaluate(async () => { window.__showreelEditor.select('bgm', 'bgm-1'); await window.__showreelEditor.seek(2); });
  await page.getByRole('button', { name: /切分/ }).click();
  assert.equal(await page.locator('.clip[data-track="bgm"]').count(), 2);
  await page.getByRole('button', { name: '撤销', exact: true }).click();
  assert.equal(await page.locator('.clip[data-track="bgm"]').count(), 1);
  await page.getByRole('button', { name: '重做', exact: true }).click();
  const right = page.locator('.clip[data-track="bgm"]').nth(1), box = await right.boundingBox();
  await page.mouse.move(box.x + 30, box.y + 28); await page.mouse.down(); await page.mouse.move(box.x - 80, box.y + 28, { steps: 5 }); await page.mouse.up();
  assert.ok(await page.evaluate(() => window.__showreelEditor.session.tracks[1].clips[1].start < 2));
  await page.getByRole('button', { name: '调音', exact: true }).click();
  await page.locator('#track-gain').fill('0.5'); await page.locator('#track-gain').dispatchEvent('change');
  await page.locator('#track-mute').check();
  await page.evaluate(() => window.__showreelEditor.save());
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, '.showreel-editor/session.json'))).tracks[1].mute, true);
  await page.reload(); await page.waitForFunction(() => window.__showreelEditor?.ready);
  assert.equal(await page.evaluate(() => window.__showreelEditor.session.tracks[1].clips.length), 2);
  assert.equal(await page.evaluate(() => window.__showreelEditor.session.tracks[1].mute), true);
  await page.getByRole('button', { name: '调音', exact: true }).click();
  await page.getByRole('button', { name: '恢复原版' }).click();
  assert.equal(await page.evaluate(() => window.__showreelEditor.session.tracks[1].mute), false);
  assert.equal(await page.evaluate(() => window.__showreelEditor.session.tracks[1].clips.length), 1);
  await page.getByRole('button', { name: '撤销', exact: true }).click();
  assert.equal(await page.evaluate(() => window.__showreelEditor.session.tracks[1].mute), true);
  await page.evaluate(() => window.__showreelEditor.select('voice', 'voice-1'));
  assert.equal(await page.getByRole('button', { name: /切分/ }).isDisabled(), true);
  assert.deepEqual(fs.existsSync(path.join(root, 'out')) ? fs.readdirSync(path.join(root, 'out')).filter(f => f.endsWith('.mp4')) : [], []);
});

test('export button renders the original page through the existing renderer and acceptance, never the workspace', async t => {
  const { page, root, source } = await fixture(t, { audio: false, duration: 1 });
  await page.getByRole('button', { name: /导出视频/ }).click();
  await page.waitForFunction(() => !window.__showreelEditor.busy && !document.getElementById('download').hidden, null, { timeout: 90000 });
  const url = await page.locator('#download').getAttribute('href');
  const file = path.join(root, decodeURIComponent(url.slice('/project/'.length)));
  assert.ok(fs.existsSync(file));
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height,codec_type,r_frame_rate:format=duration', '-of', 'json', file]));
  assert.equal(probe.streams[0].width, 320); assert.equal(probe.streams[0].height, 180); assert.equal(probe.streams[0].r_frame_rate, '10/1');
  assert.equal(probe.streams.some(s => s.codec_type === 'audio'), false);
  assert.ok(Math.abs(Number(probe.format.duration) - 1) < 0.01);
  assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), source);
  assert.equal(fs.existsSync(path.join(root, 'out/final.mp4')), false);
});

test('cancelled and failed exports never publish a video and leave the workspace usable', async t => {
  const { page, root } = await fixture(t, { audio: false, duration: 1 });
  const file = path.join(root, 'index.html'), original = fs.readFileSync(file, 'utf8');
  // The original page still draws the same pixels, but takes time per frame.
  fs.writeFileSync(file, original.replace('window.render=t=>{', 'window.render=async t=>{await new Promise(r=>setTimeout(r,2000));'));
  await page.getByRole('button', { name: /导出视频/ }).click();
  await page.waitForFunction(() => document.getElementById('job-phase').textContent === '确定性检查');
  await page.getByRole('button', { name: '取消任务' }).click();
  await page.waitForFunction(() => !window.__showreelEditor.busy, null, { timeout: 15000 });
  assert.deepEqual(fs.existsSync(path.join(root, 'out')) ? fs.readdirSync(path.join(root, 'out')).filter(f => f.endsWith('.mp4')) : [], []);
  assert.equal(await page.locator('#download').isVisible(), false);
  assert.equal(await page.getByRole('button', { name: /导出视频/ }).isEnabled(), true);
  fs.writeFileSync(file, original.replace('window.render=t=>{', 'window.render=t=>{if(t>0.1)throw new Error("injected scene failure");'));
  await page.getByRole('button', { name: /导出视频/ }).click();
  await page.waitForFunction(() => !window.__showreelEditor.busy && document.getElementById('job-phase').textContent === '失败', null, { timeout: 15000 });
  assert.deepEqual(fs.existsSync(path.join(root, 'out')) ? fs.readdirSync(path.join(root, 'out')).filter(f => f.endsWith('.mp4')) : [], []);
  assert.equal(await page.locator('#download').isVisible(), false);
  await page.evaluate(() => window.__showreelEditor.seek(0.5));
  assert.equal(await page.evaluate(() => window.__showreelEditor.picture.lastRendered), 0.5, 'loaded preview remains usable after an external scene export fails');
});
