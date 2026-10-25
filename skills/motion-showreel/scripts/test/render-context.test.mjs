import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scripts = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = 160, H = 96;

function fixture(t, optIn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'showreel-frame-context-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'index.html'), `<!doctype html>
    <style>body{margin:0}canvas{display:block}</style><canvas width="${W}" height="${H}"></canvas><script>
    ${optIn ? 'window.RENDER_CONTEXT=true;' : ''}
    const ctx=document.querySelector('canvas').getContext('2d');
    const cut=Number(new URLSearchParams(location.search).get('cut')||0.5);
    window.DUR=1;
    window.render=function(t,frame){
      ${optIn ? '' : 'if(arguments.length!==1)throw new Error("legacy render received extra arguments");'}
      const copyTime=frame?.frameTime??t;
      ctx.fillStyle='#000';ctx.fillRect(0,0,${W},${H});
      ctx.fillStyle=copyTime>=cut?'#fff':'#000';ctx.fillRect(0,0,${W},48);
      ctx.fillStyle=copyTime>=cut?'#000':'#fff';ctx.font='18px sans-serif';
      ctx.fillText(copyTime>=cut?'AFTER':'BEFORE',16,34);
      ctx.fillStyle='#fff';ctx.fillRect(t*120,64,8,24);
    };
    window.render(0);window.READY=true;
    </script>`);
  return root;
}

function render(root, name, ...args) {
  const output = path.join(root, name + '.mp4');
  const r = spawnSync(process.execPath, [path.join(scripts, 'render.mjs'), root,
    '--size', `${W}x${H}`, '--fps', '10', '--workers', '1', '--png', '--crf', '0', '--shutter', '1',
    '--out', output, ...args], { encoding: 'utf8', timeout: 30000 });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  return output;
}

function frame(file, time) {
  return execFileSync('ffmpeg', ['-v', 'error', '-ss', String(time), '-i', file,
    '-frames:v', '1', '-pix_fmt', 'gray', '-f', 'rawvideo', '-']);
}

test('opt-in frame context prevents mixed copy while continuous motion keeps its shutter blur', t => {
  const legacy = fixture(t, false), aware = fixture(t, true);
  const oldFrame = frame(render(legacy, 'legacy', '--subframes', '2'), 0.5);
  const fixed = frame(render(aware, 'aware', '--subframes', '2'), 0.5);
  assert.ok(oldFrame[4 * W + 4] > 90 && oldFrame[4 * W + 4] < 170, 'old sampling blends the two copy states at the cut');
  assert.ok(fixed[4 * W + 4] > 245, 'both subframes use the output frame copy state');
  assert.deepEqual(fixed.subarray(64 * W), oldFrame.subarray(64 * W), 'moving geometry is still rendered at the original sub-sample times');
  assert.ok([...fixed.subarray(80 * W, 81 * W)].some(v => v > 80 && v < 190), 'the moving bar retains partially covered blur pixels');

  const oldSingle = frame(render(legacy, 'legacy-single', '--subframes', '1'), 0.5);
  const awareSingle = frame(render(aware, 'aware-single', '--subframes', '1'), 0.5);
  assert.deepEqual(awareSingle, oldSingle, 'single-sample output is unchanged');
});

test('frame context follows the actual segment clock, including a non-grid start', t => {
  const root = fixture(t, true);
  const video = render(root, 'segment', '--subframes', '2', '--start', '0.125', '--duration', '0.5', '--q', 'cut=0.525');
  const pixels = frame(video, 0.4); // Source frame centre is 0.125 + 4/10 = 0.525.
  assert.ok(pixels[4 * W + 4] > 245, 'frameTime is the real frame centre, not a rounded global FPS grid');
});
