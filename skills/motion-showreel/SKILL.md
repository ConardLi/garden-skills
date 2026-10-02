---
name: motion-showreel
description: 用代码制作以图形、文字或界面动画为主的短视频（约 5–60 秒），输出 MP4 和可编辑源码：产品宣传短片、动效作品集、UI 动效演示、动态排版与金句卡点、Logo 演绎与片头、生成艺术循环。配乐可选：代码合成，或按用户提供的曲子卡点。用户想做这类短视频或动效时使用，例如「做个 15 秒动效视频」「做个 Logo 动画 / 片头」「做个产品宣传短片」「用代码做视频」。不用于：口播讲解类长视频（用 web-video-presentation）、网页与交互原型（用 web-design-engineer）、写实人物或实拍内容、剪辑已有视频。
---

# Motion Showreel

把一个想法做成一支以图形、文字或界面动画为主的短视频，交付 MP4 和能重建的源码。

**原理**：页面暴露确定性的 `render(t)`，脚本逐帧截图，再用 ffmpeg 合成 MP4。配乐和音效在代码里合成，和画面共用一张时间表 `timeline.js`，所以卡点可以精确到帧。

**好片子从哪来**：变化密度、运动质感、一个记忆点、音画关系，这四项通常决定观感。但具体怎么动、动多少，由**风格和内容**决定，不是每支片子都要多机位、弹簧和满屏音效。全局只守几条底线（见「底线」）。

---

## 适用范围

| 用户想要 | 用这个 Skill？ |
|---|---|
| 产品宣传短片、动效作品集、UI 动效、动态排版 / 卡点、Logo 演绎、片头、循环动图 | ✅ |
| 视频模型生成的绿幕人物 + 代码做的场景、大字、动效 | ✅ 人物由用户提供（`references/formats.md` H 类） |
| 有口播稿或文章、要逐句讲解的几分钟视频 | ❌ 用 `web-video-presentation` |
| 网页、落地页、交互原型、静态视觉稿 | ❌ 用 `web-design-engineer` |
| 写实人物表演、实拍质感、剪辑已有素材、用视频模型直接出画面 | ❌ |

超过 60 秒能做，但密度难以维持，渲染和审片成本也会成倍增加。先跟用户说清楚，建议拆成几支短片。

## Opus 的长处和默认坑

- **长处**：一个文件里能混用 Canvas、SVG/DOM、WebGL、Three.js；运动可以用公式精确计算（闭式弹簧、节拍网格、子帧运动模糊）；声音和画面读同一张时间表；能长时间自主「渲静帧 → 看图 → 修改」。
- **默认坑**：没有约束时，画面会落到深色背景、居中大字、所有元素一起淡入、紫蓝渐变加发光、机位不动。所以 brief 里要写清楚风格和禁止清单。
- **做不好的**：写实人物、复杂的手部 / 布料 / 毛发、需要真实物理精度的东西、照片级产品（除非用户提供模型或图片）。遇到这些就风格化处理，或者换成绿幕人物 + 代码场景的分工。

---

## 工作流

```
0 环境检查（一次）
1 一次问清 ──────── 能从请求里推断的就不问
2 brief.md ──────── 用途 + 风格 + Reel Read + 节拍网格 + 分镜 + 禁止清单
3 风格帧 ────────── 🛑 唯一的停顿点：2–3 张用真代码渲染的关键帧
4 制作 ──────────── timeline → 逐镜头 → 静帧自检 → 确定性检查 → 小样 → 正片
5 声音（可选）────── 代码合成 / 用户曲子 / 无声
6 验收 ──────────── 技术检查（程序判定，必须全过）+ 审片（看图列问题，交给用户终审）
7 交付
```

工作目录：在用户当前目录下建 `<slug>/`，所有文件都放在里面：`brief.md`、`index.html`、`motion.js`、`timeline.js`、`score.mjs`、`build.sh`、`fonts/`、`assets/`、`audio/`、`qa/`、`out/`。

### 第 0 步：环境

第一次使用时运行 `sh <skill>/scripts/setup.sh`：它会安装 Playwright 和 Chromium，再跑 `check-env.mjs`。需要 Node 18+ 和 ffmpeg；缺了就告诉用户怎么装，不要替用户装系统软件。工具自带测试：`cd <skill>/scripts && npm test`。

### 第 1 步：一次问清

**用一条消息**问，最多 5 个问题，请求里已经回答过的就跳过。用户说「你看着办」，就全部用默认值，并在 brief 里注明。

| 问什么 | 默认值 |
|---|---|
| 主题和素材：logo、产品截图、文案、品牌色、字体 | 只用用户给的事实，不编功能、数据和客户 |
| 观众看完要记住的一句话或一个画面 | 从主题里提炼 |
| 时长、画幅、平台 | 15 秒 · 1920×1080 · 30fps；竖屏平台用 1080×1920；UI 动效可以用 60fps |
| 风格：有参考视频或截图吗？还是让我推荐？ | 从 `references/styles.md` 推荐 2–3 个 |
| 声音：无声 / 代码合成 / 你提供曲子（需能商用） | 代码合成 |

- 用户给了参考视频：先跑 `inspect.mjs sheet <ref> --cells 30` 和 `inspect.mjs motion <ref>`，只学结构和手法，不搬素材。
- 用户给了曲子：先跑 `audio.mjs beats <track> --out <slug>/audio/beats.json`。
- 画面里要出现的产品、品牌或技术名词，不确定的先查证。

### 第 2 步：brief.md

**用途**和**风格**分开选：
- 用途（拍什么、按什么结构讲）看 `references/formats.md`，只读对应的那一节。
- 风格（长什么样、怎么动、什么声音）看 `references/styles.md`，只读选中的那一种。风格规则是固定的，故事、镜头和结构从用户的主题来，不要沿用别的片子。
- 再按需翻 `references/craft.md`（手法库）。

按 `references/brief-template.md` 写 brief，核心是：

```yaml
Reel Read:
  format: [用途，formats.md 里的类型]
  style: [风格，styles.md 里的一种，或者自定义并写明规则]
  takeaway: [观众记住的一句话或一个画面]
  hook: [前 1 秒发生什么]
  signature: [记忆点：第几秒、什么手法]
  palette / type / motion / camera / texture: [按所选风格写出具体值]
  sound: [无声 / 合成（BPM、配器）/ 用户曲子（BPM、drop）]
  forbidden: [这支片子的禁止清单]
```

接着在 brief 里写**节拍网格 + 分镜表**：先定 BPM 和小节数，每个镜头一行，写明 `拍号区间 | 画面（含原文文字）| 运动 | 镜头 | 声音 | 转场`。

用户只说了一句「全力以赴」，也要把它翻译成上面这份具体约束，否则结果就是抽卡。

### 第 3 步：风格帧（🛑 唯一停顿点）

1. 建项目：`sh <skill>/scripts/scaffold.sh <slug>`。starter 只用来验证管线能跑通，画面和文案都要换掉。
2. 先写 `timeline.js`，再用真代码搭出 hook 帧、记忆点帧、结尾帧。配色、字体、文案都用最终的。
3. 渲染：`render.mjs <slug> --still 0.6,7.2,14.5 --sheet`。自己先看一遍，明显的问题修完再给用户。如果记忆点靠运动，另出一段 2–3 秒的小样（`--start --duration`）。
4. 把 Reel Read 摘要、分镜概要、风格帧路径发给用户，问「方向对吗？」，**然后等回复**。用户事先说过不用确认的，就自查后继续。

### 第 4 步：制作

制作前先读 `references/stack.md`（页面契约、确定性、各技术的坑）。要现成写法时查 `references/recipes.md`。

1. 时间点全部写进 `timeline.js`，页面和 `score.mjs` 都从这里 import。
2. 逐个镜头做。每个镜头渲开头、中段、结尾 3 张静帧；快速动作用 `inspect.mjs strip` 看连续帧。
3. 跑确定性检查 `render.mjs <slug> --determinism`，不通过就先修。
4. 片长 30 秒以上或渲染慢的，先出低清小样：`--size 960x540 --out out/proxy.mp4`。
5. 出正片：`sh <slug>/build.sh`，或者直接调 `render.mjs`。`--subframes`、`--dpr`、`--grain` 按风格需要加。这些参数都会成倍增加耗时，开渲前先报预计时间。

**硬规则**：
- 画面只由 t 决定：不用 `Math.random`、`Date.now`、rAF、定时器、CSS 动画，帧和帧之间不保存状态。
- 字体和素材全部加载完，再设置 `READY = true`；字体放进项目自托管。
- 布局从 `stageSize()` 返回的宽高推导，不写死像素。

### 第 5 步：声音（可选）

看 `references/sound.md`。
- 代码合成：`audio.mjs build <slug>/score.mjs`，输出 −14 LUFS 的 `audio/music.wav`。
- 用户曲子：先用 beats 对齐，再在 score 里 `S.load()` 进来。
- 无声：跳过这一步。

你听不到声音，所以每次 build 之后都要跑 `audio.mjs check`，看数值和图。

### 第 6 步：验收

**技术检查**：由程序判定，失败就不能交付。

```bash
node <skill>/scripts/inspect.mjs qa <slug>/out/final.mp4 --out <slug>/qa/final \
  --expect-size 1920x1080 --expect-fps 30 --expect-duration 16 --audio required   # 无声片用 --audio none；循环片加 --loop
```

它检查文件能否解码、尺寸、帧率、时长、帧数、音轨、黑帧、响度、真峰值，以及循环接缝（需要时）。只要有一项 FAIL，退出码就是 1，必须修好。渲染工具本身也会拒绝发布帧数不对的文件。

**审片**：给人判断用，不是程序判定。看抽帧图、手机尺寸抽帧图、冻结段、切点、音频图，按 `references/review.md` 的审片表逐项写下观察和最严重的 3 个问题。修完只重渲有问题的那一段，再出整片，过程记到 `qa/review_log.md`。

审片结论是给用户的参考，**不能代替用户自己看片**。不适用的项标「不适用」，比如无声作品的音画同步，不要硬给分数。

### 第 7 步：交付

告诉用户：
- `out/final.mp4` 和 `out/poster.png` 的路径（poster 用 `render.mjs --still <t> --out out` 导出后重命名）。
- `brief.md`：完整的结构化提示词，可以复用。
- 技术检查结果（全部 PASS）、审片记录里还没解决的问题、渲染用时。
- 怎么重建（`sh build.sh`）、怎么只改一段。
- 第三方素材（字体、用户素材、曲子）的来源和授权；事实类内容提醒用户再核对一遍。

---

## 底线（所有风格都要守）

1. **事实准确**：产品功能、数字、名称只来自用户或可靠来源，不确定的标出来。
2. **文字可读**：字号在手机尺寸下看得清，停留时间够读完（见 craft.md 第 7 节）；文字不溢出、不重叠、不被遮挡。
3. **素材有授权**：logo、截图、字体、曲子都要能用，并在交付时列出来。
4. **技术正确**：确定性渲染，技术检查全部通过，没有黑帧，结尾不能戛然而止（落版定格或无缝循环）。
5. **风格一致**：选定的风格规则从头守到尾，不落入 brief 的禁止清单。

除此之外，镜头动多少、用不用弹簧、音效密度、节奏快慢，都按风格和内容来定（见 styles.md 和 craft.md）。

---

## 工具速查（`S=<skill>/scripts`）

| 目的 | 命令 |
|---|---|
| 装依赖 / 查环境 / 自测 | `sh $S/setup.sh` · `node $S/check-env.mjs` · `cd $S && npm test` |
| 建项目 | `sh $S/scaffold.sh <slug>` |
| 静帧 + 拼图 | `node $S/render.mjs <slug> --still 0.5,3,7.2 --sheet` · `--range 0:15:1 --sheet` |
| 确定性 | `node $S/render.mjs <slug> --determinism` |
| 小样 / 正片 / 分段 | `--size 960x540 --out out/proxy.mp4` · `--fps 60 --subframes 2 --grain 4 --audio audio/music.wav --out out/final.mp4` · `--start 6 --duration 3 --out out/seg.mp4` |
| 声音 | `node $S/audio.mjs build <slug>/score.mjs` · `beats <track> --out audio/beats.json` · `check audio/music.wav` |
| 验收与审片材料 | `node $S/inspect.mjs qa out/final.mp4 --expect-…` · `sheet` · `phone` · `strip --at 4.2` · `loop` · `motion` |

## 参考文件（按需读）

| 文件 | 什么时候读 |
|---|---|
| `references/formats.md` | 第 2 步：用途，比如宣传短片、作品集、UI 动效、排版卡点、Logo、数据爆点、绿幕合成 |
| `references/styles.md` | 第 2 步：风格规则，比如瑞士编辑、极简界面、像素 CRT、3D 材质、生成抽象、手绘笔触 |
| `references/craft.md` | 第 2 和第 4 步：节奏、运动、转场、镜头、排版、配色、质感、记忆点、默认味清单 |
| `references/brief-template.md` | 写 brief 时 |
| `references/stack.md` | 第 4 步：页面契约、确定性、各技术的坑、字体、素材、多画幅、性能 |
| `references/recipes.md` | 要现成写法时 |
| `references/sound.md` | 第 5 步 |
| `references/review.md` | 第 6 步：技术检查说明、审片表、常见问题、交付清单 |
