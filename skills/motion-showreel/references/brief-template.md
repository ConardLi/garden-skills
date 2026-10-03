# brief.md 模板

`brief.md` 有两个用途：这次制作严格按它来；以后换主题、换工具复用时，它就是一份完整的结构化提示词。用 XML 标签分块，Claude 能更准确地分清哪部分是要求、哪部分是素材、哪部分是约束。

填写要求：已经确认的内容写实，不留【】；用了默认值的，标注「默认」。

```text
<role>
你是一位动态设计师兼创意程序员，用代码做出可以直接发布的、一眼惊艳的短视频。
</role>

<inputs>
主题：……
观众记住的一句话 / 一个画面：……
素材：……（文件路径；参考视频只学结构和手法；用户的曲子写明授权）
规格：…秒 · …×… · …fps
品牌：主色 #…，强调色 #…，字体 …（文件在 fonts/）
声音：无声 / 代码合成（BPM …，配器 …）/ 用户曲子（BPM …，drop @ …s）
</inputs>

<direction>
Reel Read:
  format: …（用途，formats.md）
  benchmark: …（对标作品 · 学什么 · 不学什么）
  structure: …（三个候选结构 → 选中的那个和理由）
  style: …（styles/<slug>.md，写明改造点；或混搭方案；或按 _template.md 写的自定义规则）
  hook: …
  signature: …（记忆点：第几秒，什么手法）
  visual-language: …
  palette: 背景 #… / 主色 #… / 强调色 #…（只给主角用）
  type: 展示 … / 辅助 …
  motion: 弹簧 {freq …, damp …}（大字）/ {…}（UI）；缓动 …；是否步进
  camera: …（至少 3 种运动）
  texture: …
  sound: …（无声；或者：声音对标 · 角色 · 律动 · 和声 · 配器 · 曲线 · 动机 · 混音，能推出来的写一个词即可，见 sound.md 第 2 节；用户曲子写 BPM 和 drop）
整片只用一套视觉系统；同一个元素在每个镜头里的样子保持一致。
每个镜头只讲一件事；一屏最多一句话，停留到能读完。
运动方式按所选风格（弹簧、snap、步进或周期运动）；转场从画面内容里长出来，不用默认的淡入淡出。
禁止：……（针对这支片子写具体的，比如：深色背景 + 居中大字 + 渐变；所有元素同时淡入；紫蓝渐变和发光；角落里的 HUD 标签；匀速平移；Inter 做展示字体；有声片也可以写声音的，比如 Am–F–C–G 循环、每个重拍都 impact + crash，见 sound.md 第 12 节）
</direction>

<structure>
节拍网格：BPM …，共 … 小节（… 秒）；重拍 = 大变化，拍点 = 中变化，八分音符 = 微变化
| 小节.拍 | 段落 | 画面（含原文文字） | 运动 | 镜头 | 声音 | 转场 |
|---|---|---|---|---|---|---|
| 1.1–2.4 | Hook | … | … | … | … | … |
| … | … | … | … | … | … | … |
签名时刻：…（小节.拍，以及具体怎么做）
结尾：落版 … / 无缝循环
</structure>

<build>
1. 单个 HTML 文件（或说明为什么需要 Three.js / p5），内容层：…，质感层：…。
2. 页面暴露 window.DUR / window.render(t) / window.READY；画面只由 t 决定，随机数带固定种子，不用计时器，不用 CSS 动画，帧和帧之间不保存状态。
3. 所有时间点写在 timeline.js，页面和 score.mjs 都从它 import。
4. 渲染：render.mjs 逐帧截图 → ffmpeg；参数：--fps … --size … [--subframes 4] [--dpr 2] [--grain …]。
5. 声音：第 1 档 score.mjs / 第 2 档 score.tone.js → audio.mjs build（−14 LUFS，真峰值 < −1 dBTP）；音效密度按风格来，有音效的动作要落在动作那一帧。无声作品写「无声」。
6. 每个镜头做完渲 3 张静帧检查；全部完成后跑 --determinism，出低清小样确认节奏，再出正片。
7. 验收：sh build.sh（FPS / SIZE / AUDIO / LOOP 写在 build.sh 顶部，时长取 timeline.js 的 DUR），等价于 inspect.mjs qa --expect-size … --expect-fps … --expect-duration … --audio required|none [--loop]；技术检查全部 PASS，且没有 NOT CHECKED。timeline.js 里声明 HOLDS（刻意的停留）和 DROPS（要留呼吸的重拍）。
</build>

<gotchas>
……（这支片子特有的坑，比如：字体加载完再 READY；WebGL 先渲一帧确认生效；中文字体要子集化；循环片首尾帧完全一致；被缩放的文字不加 will-change）
</gotchas>

<start>
（按情况只保留下面一段）
【要确认 · 默认】已定风格：先出 hook、记忆点、结尾三张风格帧给我确认；未定风格：先给 3 个拉开差距的方向，各一张关键帧（render.mjs --directions）让我选。等我回复后再制作。
【不用确认 · 用户说过「你决定 / 不用问我」】仍然先出风格帧（未定风格时仍是 3 个方向），自己看图选一个，把选择和理由写进 brief，然后直接继续，不停下来等。
之后：按镜头顺序制作，每个镜头完成后自检；正片用 build.sh 渲（它带着规格跑 inspect qa），技术检查全部 PASS、没有 NOT CHECKED 后，附上审片记录（已知问题如实列出）交付，由我终审。
</start>
```
