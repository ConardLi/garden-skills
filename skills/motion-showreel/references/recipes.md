# 现成写法

全部是**只依赖 t 的纯函数写法**，可以直接搬进 `render(t)`。示例默认已经从 `motion.js` 引入了需要的函数，`ctx` 是 `setupCanvas` 返回的 2D 上下文，`U = Math.min(W, H) / 1080`。这些是手法的骨架，配色、尺寸和节奏要按 brief 重新设计。

目录：1 遮罩逐字 · 2 前后沿拉伸 · 3 形状变形链 · 4 光标驱动 · 5 穿越转场 · 6 遮罩擦除 · 7 粒子组字 · 8 无状态发射器 · 9 计数器 · 10 SVG 描边 · 11 无缝循环 · 12 WebGL 后期 · 13 拖影 · 14 节拍驱动 · 15 Canvas 伪 3D 体块

---

## 1. 遮罩逐字（字从基线下面弹上来）

```js
function maskedWord(word, x, baseY, size, tIn, { gap = 0.045, tOut = null, color = '#111' } = {}) {   // tOut = null: never leaves
  ctx.font = `800 ${size}px Display`;
  const glyphs = [...word], w = glyphs.map(g => ctx.measureText(g).width);
  let cx = x;
  glyphs.forEach((g, i) => {
    const kIn = spring(t - tIn - i * gap, { freq: 2.6, damp: 0.72 });
    const kOut = tOut == null ? 0 : ease.inCubic(seg(t, tOut + i * gap * 0.6, tOut + i * gap * 0.6 + 0.25));
    ctx.save();
    ctx.beginPath(); ctx.rect(cx - 2, baseY - size * 0.9, w[i] + 4, size * 1.02); ctx.clip();   // 窗口：大写字母高度 + 一点余量
    ctx.fillStyle = color;
    ctx.fillText(g, cx, baseY + (1 - kIn) * size * 1.05 - kOut * size * 1.05);
    ctx.restore();
    cx += w[i];
  });
  return cx - x;   // 整词宽度，方便排后面的元素
}
```
中文按字拆就行；词组整体进场时把 `glyphs` 换成词数组。窗口的上下边界要按字体实际的字高调整，先渲一帧看有没有被裁掉。

## 2. 前后沿拉伸（指示条、进度条、点变线）

```js
// 指示条从 a 移到 b：前沿快、后沿慢，移动中被拉长，落定时恢复
const moves = [[0, 100], [2.0, 620], [3.0, 300]];             // [时间, 目标 x]
const fast = { freq: 3.6, damp: 0.8 }, slow = { freq: 2.2, damp: 0.85 };
const towardRight = (i) => i === 0 || moves[i][1] >= moves[i - 1][1];
// 向右移时右边是前沿；向左移时左边是前沿
const right = springTo(t, moves.map(([tt, x], i) => [tt, x + 80, towardRight(i) ? fast : slow]));
const left  = springTo(t, moves.map(([tt, x], i) => [tt, x,      towardRight(i) ? slow : fast]));
ctx.fillRect(left, y, right - left, 6 * U);
```

## 3. 形状变形链（一个元素变成一串界面状态）

```js
// 每个状态：[x, y, w, h, radius]，颜色单独插值
const S = [
  [W/2 - 160, H/2 - 40, 320, 80, 40],     // 按钮
  [W/2 - 40,  H/2 - 40, 80,  80, 40],     // 加载圈
  [W/2 - 300, H/2 - 60, 600, 120, 60],    // 灵动岛
  [W/2 - 360, H/2 - 220, 720, 440, 36],   // 卡片
];
const T = [0, b(2), b(4), b(6)];
const box = springTo(t, S.map((s, i) => [T[i], s]), { freq: 2.4, damp: 0.78 });
const k = T.findLastIndex(x => t >= x);                     // 当前状态序号
const col = mix(COLORS[Math.max(0, k - 1)], COLORS[k], spring(t - T[k]));
ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(...box.slice(0, 4), box[4]); ctx.fill();
// 容器里的内容：每个状态自己的进场（T[k] + 0.12s 之后淡入并上移）和出场（下一个 T 之前 0.1s 模糊淡出）
```
内容切换时在旧内容上加 `ctx.filter = 'blur(6px)'` 并淡出 0.1 秒，新内容延后 0.08 秒进场，这样新旧文字不会叠在一起。

## 4. 光标驱动

```js
// 光标路径：关键帧 + 每段的缓动；按下状态由区间决定
const cur = tween(t, [[0, [W*0.7, H*0.8]], [b(1.5), [W/2, H/2], glide], [b(3.5), [W/2 + 240, H/2], ease.inOutCubic]]);
const down = (t > b(1.8) && t < b(2.0)) || (t > b(2.5) && t < b(3.6));     // 点击 + 拖拽
const press = down ? 0.88 : 1;                                             // 按下时光标缩小
// 拖拽：拖动期间数值由光标位置算出来，松手后用弹簧回到吸附值
const raw = clamp((cur[0] - trackX) / trackW);
const value = t < b(3.6) ? raw : springTo(t, [[b(3.6), raw], [b(3.6) + 0.001, Math.round(raw * 4) / 4]]);
```
点击的那一帧放一个 `click` 音效（写进 timeline 的 CUES）。光标本身用简单的矢量箭头，按下时加一个扩散的圆环。

## 5. 穿越转场（镜头冲进一个点，里面是下一镜）

```js
// p: 0→1 的转场进度；target: 场景 A 里要冲进去的点（比如字母 O 的中心）；Z: 冲进去时的总放大倍数
function zoomThrough(p, target, drawA, drawB, Z = 60) {
  const e = ease.inOutExpo(p);
  if (e < 0.5) {                                   // 前半段：A 绕 target 指数放大
    const z = Math.pow(Z, e * 2);
    ctx.save(); camera(ctx, W, H, { x: target[0], y: target[1], zoom: z }); drawA(); ctx.restore();
  } else {                                         // 后半段：B 从很小放大到 1，B 的中心就是那个点
    const z = Math.pow(Z, (e - 0.5) * 2) / Z;
    ctx.save(); camera(ctx, W, H, { x: W / 2, y: H / 2, zoom: z }); drawB(); ctx.restore();
  }
}
```
要点：A 的「孔」里填上 B 的主色，这样中点交接时颜色是连续的；在 p ≈ 0.5 那一帧放一个 whoosh 的峰值，加 `--subframes 4` 效果会好很多。

## 6. 遮罩擦除（用场景里的形状露出下一镜）

```js
const p = snap(seg(t, t0, t0 + 0.6));
drawA();
ctx.save();
ctx.beginPath();
// 斜切擦除：一条平行四边形从左扫到右
const x = lerp(-W * 0.4, W * 1.2, p), slant = H * 0.35;
ctx.moveTo(-W, 0); ctx.lineTo(x + slant, 0); ctx.lineTo(x, H); ctx.lineTo(-W, H); ctx.closePath();
ctx.clip(); drawB(); ctx.restore();
```
把路径换成一个巨大的字（`ctx.font` + `ctx.fillText` 配合 `globalCompositeOperation = 'destination-in'`），就是「文字即窗口」。

## 7. 粒子组字（无状态写法）

```js
// 初始化（READY 之前，只做一次，结果固定）：在离屏画布上写字，按网格采样得到目标点
function sampleText(text, font, w, h, step) {
  const c = new OffscreenCanvas(w, h), g = c.getContext('2d');
  g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2);
  const d = g.getImageData(0, 0, w, h).data, pts = [];
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (d[(y * w + x) * 4 + 3] > 128) pts.push([x, y]);
  return pts;
}
const TARGETS = sampleText('MOTION', `900 ${300 * U}px Display`, W, H, Math.round(6 * U));   // 字体加载完以后再调用

// render(t) 里：每个粒子 i 的位置只由 i 和 t 决定
TARGETS.forEach(([tx, ty], i) => {
  const r = rng(i + 1), sx = r() * W, sy = r() * H, delay = r() * 0.6;   // 起点和延迟由序号决定
  const k = spring(t - tForm - delay, { freq: 1.8, damp: 0.8 });        // 聚合
  const boom = ease.outExpo(seg(t, tBurst, tBurst + 0.8));              // 炸开
  const ang = r() * TAU, dist = (200 + r() * 600) * U;
  const drift = (noise1(t * 0.7 + i * 0.13) - 0.5) * 30 * U * (1 - k);  // 聚合前的漂浮
  const x = lerp(sx, tx, k) + drift + Math.cos(ang) * dist * boom;
  const y = lerp(sy, ty, k) + drift + Math.sin(ang) * dist * boom;
  ctx.fillRect(x, y, 3 * U, 3 * U);
});
```
几千个粒子 Canvas 能撑住；上万个时改用 WebGL 的点精灵，或者 Three.js 的 `InstancedMesh`（同样把公式写在顶点着色器里，uniform 传 t）。

## 8. 无状态发射器（火花、尾迹、彩纸）

```js
// 粒子 i 在 born = i / rate 出生，寿命 life；位置是解析式，不需要上一帧
function emitter(t, { rate = 120, life = 1.2, origin, speed = 600, gravity = 900, seed = 3, tStart = 0, tEnd = Infinity }) {
  const first = Math.max(0, Math.floor((t - life - tStart) * rate)), last = Math.floor((Math.min(t, tEnd) - tStart) * rate);
  for (let i = first; i <= last; i++) {
    const born = tStart + i / rate, age = t - born; if (age < 0 || age > life) continue;
    const a = -Math.PI / 2 + (hash(i, seed) - 0.5) * 1.2, v = speed * (0.5 + hash(i, seed + 1));
    const x = origin[0] + Math.cos(a) * v * age, y = origin[1] + Math.sin(a) * v * age + 0.5 * gravity * age * age;
    ctx.globalAlpha = 1 - age / life; ctx.fillRect(x, y, 4 * U, 4 * U);
  }
  ctx.globalAlpha = 1;
}
```

## 9. 计数器

```js
const v = Math.round(lerp(0, 12800, ease.outExpo(seg(t, t0, t0 + 2.0))));
const land = pulse(t, t0 + 2.0, 0.15);                         // 落定时砸一下
ctx.save(); ctx.translate(cx, cy); ctx.scale(1 + land * 0.08, 1 + land * 0.08);
ctx.font = `800 ${220 * U}px Display`; ctx.textAlign = 'center';
ctx.fillText(v.toLocaleString('en-US'), 0, 0); ctx.restore();
// 声音：滚动期间按数值变化放 tick（越来越稀），落定放 impact
```

## 10. SVG 描边（logo、手写标注）

```html
<svg viewBox="0 0 400 200"><path id="p" pathLength="1" d="..." fill="none" stroke="#111" stroke-width="6" stroke-dasharray="1"/></svg>
```
```js
const k = ease.inOutCubic(seg(t, t0, t0 + 1.2));
document.getElementById('p').style.strokeDashoffset = 1 - k;
```
多条路径错峰：每条路径的起点 `t0 + i * 0.08`。描完以后再用弹簧把填充色铺上去。

## 11. 无缝循环

```js
const th = TAU * (t % DUR) / DUR;                          // 所有运动都写成 th 的函数
const x = Math.cos(th * 2 + i * 0.3) * R;                  // 整数倍频率 → 首尾天然衔接
const n = noise2(Math.cos(th) * 1.5 + 10, Math.sin(th) * 1.5 + 10, i);   // 在圆上采样噪声 = 周期噪声
```
用 `inspect.mjs loop out/final.mp4` 看接缝：它比较「最后一帧 → 第一帧」这一步和两侧普通帧间步的相似度（不是要求首尾帧完全一样：`render(DUR) = render(0)`，最后一帧比第一帧早一帧）。再连播两遍看接缝。

## 12. WebGL 后期（CRT / 色差 / 暗角 / 半调都在这一层）

```html
<canvas id="src" style="display:none"></canvas><canvas id="out"></canvas>
```
```js
const src = document.getElementById('src'), out = document.getElementById('out');
const ctx = setupCanvas(src, W, H);                                  // 内容照常画在 src 上
out.width = src.width; out.height = src.height; out.style.width = W + 'px'; out.style.height = H + 'px';
const gl = out.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
const vs = `#version 300 es
in vec2 p; out vec2 uv; void main(){ uv = p * 0.5 + 0.5; uv.y = 1.0 - uv.y; gl_Position = vec4(p, 0, 1); }`;
const fs = `#version 300 es
precision highp float; in vec2 uv; out vec4 o; uniform sampler2D tex; uniform float t, hit; uniform vec2 res;
vec2 curve(vec2 u){ u = u * 2.0 - 1.0; u *= 1.0 + 0.06 * dot(u.yx, u.yx); return u * 0.5 + 0.5; }   // 显像管弧面
void main(){
  vec2 u = curve(uv);
  if (u.x < 0.0 || u.x > 1.0 || u.y < 0.0 || u.y > 1.0) { o = vec4(0, 0, 0, 1); return; }
  float ca = 0.0015 + hit * 0.008;                                   // 色差：撞击时加强
  vec3 c = vec3(texture(tex, u + vec2(ca, 0)).r, texture(tex, u).g, texture(tex, u - vec2(ca, 0)).b);
  c *= 0.82 + 0.18 * sin(u.y * res.y * 3.14159);                     // 扫描线
  c *= 1.0 - 0.35 * pow(length(uv - 0.5) * 1.3, 2.0);                // 暗角
  o = vec4(c, 1);
}`;
const prog = gl.createProgram();
for (const [type, s] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
  const sh = gl.createShader(type); gl.shaderSource(sh, s); gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));   // 编译失败要大声报错
  gl.attachShader(prog, sh);
}
gl.linkProgram(prog); gl.useProgram(prog);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

function post(t, hit = 0) {                                          // 在 render(t) 末尾调用
  gl.viewport(0, 0, out.width, out.height);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  gl.uniform1f(gl.getUniformLocation(prog, 't'), t);
  gl.uniform1f(gl.getUniformLocation(prog, 'hit'), hit);
  gl.uniform2f(gl.getUniformLocation(prog, 'res'), H, H);            // 扫描线密度按画面高度
  gl.drawArrays(gl.TRIANGLES, 0, 3); gl.finish();
}
```
像素风：`src` 用低分辨率的逻辑画布，纹理过滤改成 `gl.NEAREST`。半调：在片元着色器里按亮度画网格圆点。颗粒不要在这里加，用 `--grain`。

## 13. 拖影（不开运动模糊时的快速运动）

```js
// 沿时间往回采样几次，透明度递减：得到方向正确的拖影
for (let k = 4; k >= 0; k--) {
  const tt = t - k * 0.012;                 // 往回 12ms 一份
  ctx.globalAlpha = k === 0 ? 1 : 0.18 * (1 - k / 5);
  drawMover(tt);                            // 只画快速运动的那个元素
}
ctx.globalAlpha = 1;
```

## 14. 节拍驱动

```js
import { b, CUES, BEAT } from './timeline.js';
const hits = CUES.filter(c => c.sfx === 'kick').map(c => c.t);
const kick = pulse(t, hits, 0.14);                // 每个重拍：缩放 / 亮度脉冲
const beatIndex = Math.floor(t / BEAT);           // 当前第几拍，可以用来轮换颜色、版式
const onBeat = (t % BEAT) / BEAT;                 // 拍内进度 0→1，可以驱动拍内的小动作
```
用户给了曲子：把 `beats.json` 的 `beats` / `downbeats` / `drops` 复制进 `timeline.js`（作为数组导出），画面和 `score.mjs` 都从这里读。

## 15. Canvas 伪 3D 体块（平面网格立成空间，不用 Three.js）

规则网格上的方块、柱子、楼群、柱状图，用 `motion.js` 的 `camera3d` + `drawBoxes` 就够了：透视投影 + 画家算法，几百个体块一帧几毫秒，和 2D 画面共用同一张画布，所以「平面 → 立体」可以是连续的一个镜头。

```js
import { camera3d, drawBoxes, glide, seg, spring, lerp, mix, TAU } from './motion.js';
import { BAR } from './timeline.js';
const S = 96 * U, F = 1400 * U;                                     // 网格间距；焦距固定，推近靠缩短 dist
const INK = { top: '#F8F7F3', px: '#8E8B85', nx: '#D2CFC8', pz: '#111', nz: '#3A3936' };   // 每个朝向一个颜色 = 光照
const tilt = glide(seg(t, t0, t0 + 1.6));
const cam = camera3d({ W, H, focal: F, dist: F * lerp(1, 0.92, tilt),
  pitch: lerp(Math.PI / 2, 35 * Math.PI / 180, tilt),               // π/2 = 正俯视：和 2D 版式完全重合
  yaw: lerp(0, 0.5, tilt), cx: W / 2 + W * 0.16 * tilt, cy: H / 2 + H * 0.2 * tilt });   // 主体让出位置给大字
const boxes = [];
for (let i = -7; i <= 7; i++) for (let j = -7; j <= 7; j++) {
  const d = Math.hypot(i, j); if (d > 6.5) continue;                // 圆形岛：轮廓干净，留出天空放字
  const h = S * spring(t - t0, { freq: 1, damp: 0.95 }) * (0.4 + 2.4 * (0.5 + 0.5 * Math.cos(0.6 * d - TAU * (t - t0) / BAR)));
  const top = mix('#111', INK.top, Math.min(1, h / (S * 0.4)));    // 高度 0 时顶面是墨色方块，长高后变亮：没有颜色跳变
  boxes.push({ x: i * S, z: j * S, w: S * 0.5, h, color: { ...INK, top } });
}
drawBoxes(ctx, cam, boxes);
```

要点：
- **正俯视 = 平面**：`pitch = π/2`、高度为 0 时，体块就是 2D 网格上的方块（`focal = dist` 时比例 1:1）。从 2D 段切进来时，让 2D 的最后一帧和这一帧对齐，再开始俯仰，观众看到的是「平面立起来」，不是切镜头。
- 相机基向量直接由 pitch / yaw 构造，正俯视不会像 `lookAt(cross(forward, worldUp))` 那样退化。
- 画家算法按到相机的水平距离从远到近排序，适合互相分开的体块；体块互相穿插或者要真实光影、阴影时，换 Three.js。
- 世界坐标里 y 朝上、地面 y = 0；yaw = 0 时相机在 +z 一侧，`pz` 是正面。
- 大字和体块同屏时先定「文字禁入区」（stack.md 第 4 节），用 `cx / cy` 和岛的半径把体块挡在外面，渲几张静帧确认。
