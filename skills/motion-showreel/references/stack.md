# 技术栈：页面契约、确定性和各技术的坑

目录：1 页面契约 · 2 确定性 · 3 按画面选技术 · 4 Canvas 2D · 5 DOM / SVG · 6 WebGL 后期 · 7 Three.js · 8 p5.js · 9 字体 · 10 素材 · 11 多画幅 · 12 性能与渲染时间

---

## 1. 页面契约

```js
window.DUR = 16;                  // 秒，render.mjs 用它算总帧数（timeline.js 导出）
window.render = (t) => { ... };   // 画出第 t 秒；确定性；可以返回 Promise（比如要等视频帧解码）
window.READY = true;              // 字体、图片、模型、纹理全部加载完以后再设置
```

- 渲染工具用 HTTP 服务项目目录（这样 ES module、字体、glTF 都能加载），视口 = `--size`，DPR = `--dpr`。页面通过 `stageSize()` 读 `?w=&h=`，按这个尺寸排版。
- 页面里的 JS 报错、必需的脚本 404，工具都会立刻退出并打印错误；可选文件 404 只会警告。
- 预览：`npx serve <slug>` 或任意静态服务，打开 `index.html?w=1920&h=1080`，在控制台调用 `render(3.2)` 就能看第 3.2 秒。也可以临时加一个 `?play=1` 分支，用 rAF 驱动 `render(performance.now()/1000 % DUR)` 方便调试，但**渲染时这个分支不能运行**。

### 带声音预览

`preview.mjs` 在内存中加入控件，不修改项目源文件，旧项目可直接使用。新脚手架也包含 `preview.js`，便于通过普通静态服务预览；手动接入时复制该文件，并在 `body` 中加入 `<script type="module" src="./preview.js"></script>`。控件只在 `?preview=1` 且不是 `render=1` 时运行，不改变页面的 `render(t)`。

```bash
node <skill>/scripts/preview.mjs <slug> --size 1920x1080 --fps 30
# 指定项目内音轨（路径相对项目）：
node <skill>/scripts/preview.mjs <slug> --size 1080x1920 --audio audio/final.wav
```

打开打印的本机地址，点击播放。支持暂停、拖动、左右逐帧和预览倍速；有音轨时以 `audio.currentTime` 驱动画面，无音轨时用预览时钟。未指定音轨时按 `audio/final.wav`、`audio/narration.wav`、`audio/music.wav` 查找。音轨尚未生成就做无声动作预演，不能据此宣称音画已对齐。

画面按指定宽高等比适配窗口，并给控件留出空间；缩放窗口不改变取帧尺寸。场景布局仍按页面契约使用 `stageSize()`，不要依赖预览窗口的 `innerWidth` 或 `vw/vh`。

预览控件与实时状态只负责调用 `render(t)`，正式渲染仍按确定性时间取帧；`?render=1` 时不创建播放器、控件或动画循环。倍速只影响预览，不改变原稿、音频文件或导出规格。用代表性连续片段检查主体状态、镜头承接与关键词事件，不以帧率数字代替观感审查。

## 2. 确定性

渲染器会按任意顺序、任意次数调用 `render(t)`：多个 worker 分段并行、单帧预览、只重渲一段、运动模糊的子帧。只要有一点状态藏在上一帧里，重渲出来的画面就会不一样。

| 禁止 | 改成 |
|---|---|
| `Math.random()` | `rng(seed)`（在 render 里按固定种子新建）或 `hash(i, seed)` |
| `Date.now()` / `performance.now()` / rAF / `setTimeout` | 只用参数 t |
| CSS `transition` / `animation` / Web Animations | 在 render(t) 里直接写样式（transform、opacity、clip-path…） |
| 逐帧累加的位置、速度（`x += v`） | 解析式 `x(t)`；弹簧用 `spring` / `springTo` |
| 物理 / 流体等必须累积的模拟 | 从 0 固定步长推到 t（可以缓存，但单帧也必须能算对），或者预先烘焙成数组 |
| `<video>` 元素自然播放 | 设置 `video.currentTime = t` 并等 `seeked` 事件（render 返回 Promise），或者先用 ffmpeg 拆成图片序列 |
| 视口相关的随机布局 | 种子化，并且只依赖 W/H |

每次大改后跑一次 `render.mjs <slug> --determinism`。

## 3. 按画面选技术

**先定画面风格，再选能做出这种风格的最简单的技术。**能用一种做完就不要混三种；要混时按「内容层 → 质感层」叠，每一层都能单独跑、单独检查。

| 技术 | 擅长 | 不擅长 |
|---|---|---|
| Canvas 2D | 像素、扁平图形、几何、排版、粒子（几千个以内）、手绘线条；规则网格的伪 3D 体块（`camera3d` + `drawBoxes`，recipes.md 第 15 节） | 上万个粒子、逐像素的质感、互相穿插的 3D 物体 |
| DOM / CSS / SVG | 界面动效、真实的文字排版、SVG 描边、产品截图卡片 | 成千上万个元素、复杂质感 |
| WebGL 片元着色器 | CRT、颗粒、色差、半调、液态、噪声场、SDF 图形 | 直接画内容和文字（一般先用 Canvas 画，再当纹理送进着色器） |
| Three.js | 3D 场景、挤出文字、实例化阵列、玻璃金属材质、空间镜头 | 写实人物 |
| p5.js + p5.brush | 彩铅、水彩、蜡笔笔触 | 渲染速度（笔刷很慢，先测单帧耗时） |
| Remotion / HyperFrames | 多场景长片，用户已经在用或者点名要用 | 十几秒的短片（单 HTML 更快），不要主动引入 |

## 4. Canvas 2D

- `setupCanvas(canvas, W, H)` 按 DPR 设置画布尺寸，并把上下文缩放到 CSS 像素。**每一帧用 `ctx.save()` / `ctx.restore()` 包起来，不要 `setTransform(1,0,0,1,0,0)`**，否则 `--dpr 2` 时只会画满左上角四分之一。
- 每一帧先把背景整个填满（不要依赖 `clearRect` 后的透明背景）。
- 文字：先 `await loadFonts([...])`，`ctx.font` 里的字号单位是 CSS 像素。`measureText` 可以拿到字宽来排字距。
- 像素风：离屏画布 + `imageSmoothingEnabled = false` + 整数倍放大 + 坐标取整。
- 模糊、发光：`ctx.filter = 'blur(8px)'` 能用但慢，大面积的光晕放到 WebGL 里做。
- 合成模式（`globalCompositeOperation`：`multiply`、`screen`、`destination-in` 做遮罩）是排版遮罩的利器。
- **文字禁入区**：大字和繁忙的内容（3D 体块、粒子、拼贴、阵列）同屏时，先用 `measureText` 算出字的矩形（含升部 / 降部，再外扩约 0.15 个字号），把它当成内容不能进入的区域：用相机的取景中心（`cx / cy`）、主体的轮廓（圆形岛、遮罩）或图层顺序把内容挡在外面。字压在同色的繁忙图形上，缩略图里会读成乱码，自查时容易误判成字体或代码错误。每个有大字的镜头至少渲一张静帧，专门看字的边缘。

## 5. DOM / SVG

- 所有样式在 render(t) 里直接写：`el.style.transform = ...`。不要依赖 CSS 过渡。
- **会被缩放、包含文字的元素不要加 `will-change: transform`**，否则文字会被栅格化后再缩放，变糊。
- SVG 描边动画：`pathLength="1"` + `stroke-dasharray="1"` + 在 render 里设置 `stroke-dashoffset = 1 - k`。
- 形状变形：同一个 `<div>` 改 `width`、`height`、`border-radius`、`background`（形变容器内部的内容另外安排进场和出场）。
- DOM 里的文字排版质量最好（连字、字距、中文标点挤压），适合大量文字。
- 截图类素材用 `<img>`，提前 `decode()`。

## 6. WebGL 后期

做法：内容画在一块 2D 画布上 → 每帧作为纹理上传 → 全屏三角形跑片元着色器 → 输出到显示画布。完整模板见 recipes.md 的「WebGL 后期」。

- `getContext('webgl2', { preserveDrawingBuffer: true, antialias: false })`，每帧画完调用 `gl.finish()`。
- 时间相关的效果把 `t` 作为 uniform 传进去，噪声用 `hash(uv + floor(t * fps))` 这类确定性写法。
- **先渲一帧确认着色器真的生效了**（编译失败时画面是黑的或者只显示原始内容），再渲整片。
- 软件渲染（SwiftShader）下很慢；macOS 上渲染工具默认使用 Metal。

## 7. Three.js

- 安装到项目里：`cd <slug> && npm i three`，在 `index.html` 里用 importmap：
  ```html
  <script type="importmap">{ "imports": { "three": "./node_modules/three/build/three.module.js", "three/addons/": "./node_modules/three/examples/jsm/" } }</script>
  ```
  不要在渲染时依赖 CDN。
- `new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })`，`setPixelRatio(devicePixelRatio)`，`setSize(W, H)`。
- `render(t)` 里：设置相机位置和朝向、物体变换、材质参数、灯光 → `renderer.render(scene, camera)`。不用 `THREE.Clock`；动画剪辑用 `mixer.setTime(t)`。
- 后期（EffectComposer、bloom、景深）可以用，但每加一层都要确认帧时间。
- 加载 glTF / 纹理 / HDRI 时，全部 `await` 完成后再设置 READY。

## 8. p5.js

- 用实例模式 + `noLoop()`，在 `window.render = t => { T = t; p.redraw(); }` 里驱动；`draw()` 只读 `T`。`randomSeed`、`noiseSeed` 每帧按固定值重设。
- p5.brush 很慢，先测单帧耗时再决定时长和帧率；笔触的随机种子用 `floor(t * 12)`，笔触每秒只变 12 次，看起来像手绘动画，镜头仍然每帧平滑。

## 9. 字体

- **自托管**：把 `.woff2` 放进 `fonts/`，用 `@font-face` 声明，`loadFonts()` 等它加载完再 READY。渲染时不要链接 Google Fonts。
- 拉取开源字体：`https://github.com/google/fonts/tree/main/ofl/<family>`（OFL 授权）。
- **中文**：完整的 CJK 字体有几 MB 到十几 MB。可以按用到的字做子集：Google Fonts CSS API 带 `&text=` 参数，只返回这些字的字形，例如 `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@900&text=<URL 编码的文字>`，把它指向的字体文件下载到 `fonts/` 再本地加载。文案改了要重新做子集。没有网络时用系统字体兜底：`"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`（不同机器渲染结果会不一样，在交付说明里写明）。
- 数字跳动用 `font-variant-numeric: tabular-nums`（Canvas 里选等宽数字的字体）。

## 10. 素材

- 用户给的 logo、截图、产品图、字体：复制到 `assets/`，用相对路径引用，不要热链。
- **品牌任务必须用真实的 logo**，拿不到就停下来问，不要用一个色块写上品牌名冒充。
- 产品界面要用真实截图（可以用 Playwright 截用户给的网址，2× DPR），不要用 CSS 画一个假界面冒充真实产品。
- 只用自己有权使用的素材，交付时把来源和授权写清楚。

## 11. 多画幅

- 所有布局都从 `W`、`H` 推导：单位 `U = Math.min(W, H) / 1080`，位置用比例或网格。
- 9:16 和 16:9 不是简单的裁切：竖屏的字要更大、排成纵向，安全区上下各留约 12%（平台 UI 会盖住）。要出多个画幅时，用同一条时间轴，每个画幅单独调版式，然后分别渲染（`--size 1080x1920`）。
- 不要把 16:9 的成片直接裁成竖屏。

## 12. 性能与渲染时间

超过 2 分钟使用 `long-form.md` 的分章构建器，最大 1200 秒。原 `render.mjs --start --duration` 保留为取帧工具；`build-long.mjs` 在其上提供持久缓存、重试和断点恢复。音频合成也按章，不能让多个整片 PCM bus 耗尽内存。有口播时先按 `narration.md` 准备真实音频和句段时间，再写镜头时间轴。

- 渲染工具会打印每个样本的毫秒数。预估：**总时间 ≈ 单帧耗时 × 帧数 × 子帧数 ÷ worker 数 × 1.2**。
- 参考量级（Apple Silicon、1080p）：Canvas 2D 简单场景 15–40 毫秒/帧，DOM 排版 30–60 毫秒，WebGL 后期 +20–80 毫秒，Three.js 带后期 80–300 毫秒。
- worker 默认 3 个，CPU 核多可以开到 4–6 个；WebGL 重的页面 worker 太多反而更慢。
- 先低清小样（960×540、无运动模糊）定节奏，最后一遍再上 `--subframes`、`--dpr`、60fps。
- 渲染出错时只重渲那一段：`--start 6 --duration 3 --out out/seg.mp4`，确认没问题再出整片。
