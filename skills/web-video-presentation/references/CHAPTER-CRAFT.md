# 章节开发圣经（Phase 2.4 必读）

> 原则源：[`PRINCIPLES.md`](PRINCIPLES.md)（十条原则唯一展开点）。
> 本文聚焦**章节开发实操** —— 代码硬规则、视觉手段、checklist、反馈
> 速查。不重复 narrate 原则，看到"原则 N"就回 PRINCIPLES.md 查。
>
> **每章开工前过一遍。**

---

## Part 0 · 开工前两件先行事

### 0.1 素材清单先行

写章节前**先核对**本章要的真材料是否到位（截图、产品图、人物照、
logo、表情包）。**视频感的来源是真材料，不是动画文字 / SVG 假插画**。

工作流：

1. 打开 `outline.md` 末尾的"素材清单"，找到本章 id 对应的列表
2. 对每个素材：
   - **✓ 已就位**（在 `presentation/public/<chapter>/` 下） → 用真材料
   - **⚠️ 待提供** → 用 `[image: 16:9 描述]` 占位卡，**不要**用 SVG 画假图、
     不要用 emoji 替代、不要拿不相关的图凑
3. 缺的素材在章节交付时写到给用户的反馈里："这章还缺 X 张图"

**Placeholder 是"这里需要真材料"的信号，fake 是"我偷懒"的信号。**

### 0.2 按主题气质选动画 / 字号 / 文字密度

打开当前主题的 `theme.json`，**至少看 4 个字段**：

| 字段 | 决定什么 | 章节里怎么用 |
|---|---|---|
| `motionHints` | 该用 / 禁用什么动效 | 主导动作选型必须扣这条线 |
| `motionDuration` | 主导动作时长 | 默认 0.8~1.5s；慢镜主题可放 3~4s；砸下主题可压 0.4~0.8s |
| `typeScale` | hero / body 字号节奏 | `loud`（hero 144px）/ `default`（hero ≥ 80px）/ `quiet`（hero 60px 起） |
| `allowEmoji` | 是否允许装饰性 emoji | 默认 `false`；vlog / 梗视频类主题可设 `true` |

**示例主题映射**（看 `themes/*/theme.json` 拿真值）：

| 主题样例 | motionHints 摘要 | 该这样做 | 禁这样做 |
|---|---|---|---|
| `bauhaus-bold` | 几何位移、巨字砸下、hard-cut | slide / scale / cut | 弹簧 / 花体 / 柔光 |
| `chalk-garden` | 粉笔自绘、慢速 stagger、亲切 | 手写擦除 / wiggle / 慢淡入 | 冷峻几何 / 企业渐变 |
| `terminal-green` | 打字机、prompt 闪烁、扫描线 | typewriter / blink / 残影 | 衬线字体 / 温暖滤镜 / emoji |
| `newsroom` | 印刷盖章、masthead 平移、pull-quote | 砸下 / 平移 / 揭示 | 渐变 / 玻璃 / 弹簧 |

token 用对了 + 气质走偏 = 仍然丑（"`bauhaus-bold` + 花体淡入" =
灾难）。**写每个动画前问一句**："这个动作配得上这套主题吗？"

> 不知道当前主题：`cat presentation/.theme` 看 id，再去翻 theme.json。

### 0.3 回看 article 抽信息点（双源原则）

PRINCIPLES.md 原则 10 要求**画面信息密度 > 口播**。开发时回到
`article.md` 抽 outline 里 `article 补` 字段提到的细节：

1. 找到本章对应的 article 段落
2. 列出**口播没念但画面能挂**的内容：
   - 具体数字 / 百分比 / 排名 / 票数
   - 引用原话（一句金句做 pull-quote）
   - 对比项 / 参数表 / 时间线
   - 案例标签 / 来源 / 时间戳
3. 把这些细节**显式映射到 step**：
   - 哪个数字挂在哪一步的角标 / mono cue / 数据浮层？
   - 哪句引用做哪一步的 pull-quote？

**反检验**：写完一步后回头看，画面里有没有"口播稿里没说但 article 里
有的东西"？没有 = 信息密度太薄 = 那一步会变 PPT。

> 用户**没给 article**（直接给 script）时这一步退化为"主动设计画面
> 信息密度"—— 用数字滚动、对比图、mono cue 元数据等让画面比口播信息密。

---

## Part 1 · 代码硬规则

### 必须做

| 规则 | 怎么做 |
|---|---|
| 章节是 `step` 的纯函数 | `if (step === N) return <SceneN />`，**不要** useState 追踪 step |
| 子组件需要重播动画 | 加 `key={step}` 强制重挂 |
| 章节内可交互元素 | 加 `data-no-advance` —— 否则点了会被 Stage 误推进 step |
| 每章一个文件夹 | `src/chapters/NN-<id>/{Component.tsx, Component.css}` |
| CSS 里 100% 用语义 token | 颜色 / 字号 / 间距 / 半径 / 字体 / 动效全部 `var(--…)` |

### 必须避免

| ❌ | 原因 |
|---|---|
| `setTimeout` / `setInterval` 驱动动画 | 用 CSS `keyframes + animation-delay` |
| 章节根写 `onClick` 拦截 step++ | Stage 已处理，再拦会破规则 |
| 跨章节 import CSS / 子组件 | 删某章会破其它章 |
| 动画 `top` / `left` / `width` / `margin` | 触发 reflow，卡顿。**只动画** `transform / opacity / clip-path / filter` |
| 硬编码 `#fff` / `48px` / `Inter` / `0.4s` | 换主题就废 |
| `scrollIntoView` | iframe 预览会破滚动。用 `el.scrollTop = ...` |

### 语义 token 速查（写 CSS 时直接抄）

| 类别 | 常用 token |
|---|---|
| 颜色 | `--text` / `--text-2` / `--text-mute` / `--text-faint` / `--accent` / `--accent-soft` / `--accent-glow` / `--surface` / `--surface-2` / `--surface-3` / `--rule` |
| 字号 | `--t-display-1` / `--t-display-2` / `--t-h1` / `--t-h2` / `--t-h3` / `--t-body` / `--t-cue` |
| 字体 | `--font-display-cn` / `--font-display-en` / `--font-body` / `--font-mono` |
| 间距 | `--space-1` ... `--space-7` / `--stage-pad-x` / `--stage-pad-y` |
| 形状 | `--r-card` / `--r-stage` / `--rule-w` / `--rule-style` |
| 动效 | `--ease-quart` / `--ease-expo` / `--ease-out` / `--dur-fast` / `--dur-base` / `--dur-slow` |
| 阴影 | `--shadow-stage` / `--shadow-card` / `--card-glass-bg` |
| 数字 | `--hero-num-font` / `--hero-num-style` / `--hero-num-weight` / `--hero-num-track` |

token 不够用 → **不是硬编码的理由**。回 [`THEMES.md`](THEMES.md)
看完整契约，要么找到对应 token，要么提议新增（提议时让所有主题都补
上）。

---

## Part 2 · 视觉手段全栈工具箱

> **写动画的优先级** 见 PRINCIPLES.md 原则 7（**先找内容内在动作，
> 找不到才用入场动画**）。本节只讲**实现工具**。主题 token 是底色，
> **不是天花板** —— 在 token 之上**任意叠加**全栈视觉手段。

### CSS 层

| 工具 | 视频感场景 |
|---|---|
| `clip-path` / `mask-image` | 文字逐字擦出、形状揭示、reveal、wipe transition |
| `backdrop-filter: blur(...)` | 玻璃 panel、景深 hero、聚焦层 |
| `mix-blend-mode` | 文字 / 元素与背景图层叠，杂志级高级感 |
| `filter: blur / saturate / drop-shadow` | 失焦→聚焦电影感、霓虹光晕、立体阴影 |
| `conic-gradient` / `radial-gradient` | 雷达扫描、聚光灯、转场遮罩 |
| `text-shadow` 多重 | accent 字加发光，hero takeover 焦点 |
| `transform` 复合（perspective + rotate3d） | 卡片翻转、纸张倾斜、isometric 透视 |
| `@property` + 自定义属性 | 复杂渐变 / 角度的过渡 |
| 永不停 keyframes（`infinite`） | **持续微动层（不是必填，慎用）**：只在该步停留时间长且画面太静时挂一层；**反例**：每步无脑给文字加"光晕呼吸 / ken burns / scanline"会显得 AI 味重 |

### SVG 层

| 工具 | 视频感场景 |
|---|---|
| `stroke-dasharray` + `stroke-dashoffset` 动画 | 自绘线条 / 圆 / 下划线 / 流程图 / 柱状图 |
| `<filter>` + `feTurbulence` + `feDisplacementMap` | 纸面噪点、水波扰动、电视雪花、墨水扩散 |
| `<filter>` + `feGaussianBlur` + `feColorMatrix` | 高级发光、墨水溢出、像素化 |
| `<mask>` + 形状渐变 | 文字渐隐、聚光灯、reveal |
| `<animateMotion>` / `<animateTransform>` | 沿路径运动、复杂旋转 |
| 自绘 path 系统图 | 流程图 / 架构图 / 时序图 / 关系图 —— **不要用文字代替** |

### Canvas 层（**动用，别怕**）

| 工具 | 视频感场景 |
|---|---|
| 粒子系统 | 粒子聚拢成形、爆破、星空、光点流 |
| 噪声纹理（Perlin / Simplex） | 流体感背景、烟雾、电视雪花、有机扰动 |
| 实时绘制（`requestAnimationFrame`） | 动态柱图、波纹、字符雨（Matrix） |
| 离屏 canvas | 复杂图形预渲染后变换，性能友好 |

> 何时用 Canvas：**当 SVG 的 path / filter 力不从心**（粒子数 > 50、
> 流体、复杂噪声）。一章 1~2 个 Canvas hero 元素是合理的，不用全场都上。

### JS / 微交互层

| 工具 | 视频感场景 |
|---|---|
| Typewriter（自定义 hook） | 终端打字、口播稿伪同步打字 |
| 数字滚动（`requestAnimationFrame` + `easeOutQuart`） | 数字 hero 从 0 滚到目标值 |
| `IntersectionObserver` | 滚动触发 / 进入视口动画 |
| Web Animations API（`element.animate()`） | 复杂 timeline 编排 |

### 动作时长参考（**outline 不写时长，时长在这里决定**）

> **重要前提**：**讲者录制时按口播节奏点击翻页**。所以你不需要精算
> "动画刚好 X 秒讲完" —— 动画**跑完后停在原地**等下一次点击。目标
> 是"出现得干净利落、停下来不抢戏"，**不是**"卡到 N 秒"。
>
> **outline 不写时长**（见 OUTLINE-FORMAT.md 反例 2）。outline 只描述
> 动作类型 + 顺序关系，具体时长在这里决定。

| 层 | 默认（普通节奏主题） | 慢镜主题（midnight-press 等） | 砸下主题（bauhaus-bold 等） |
|---|---|---|---|
| 主导动作 | 0.6~1.0s | **0.8~1.4s**（电影感来自 motion 选型，**不是把 lead 拖到 3 秒**） | 0.3~0.6s 硬切 |
| 伴随动作 | 0.4~0.7s 错峰 100~250ms | 0.5~0.9s 错峰 150~300ms | 0.2~0.5s 错峰 60~150ms |
| 持续微动（**非必填**） | 偶尔挂 1 层，4~10s 周期 | 偶尔挂 1 层，8~12s 周期 | 偶尔挂 1 层，2~4s 周期 |

**整步主要内容应在 ≤ 1.5s 内入场完毕**（讲者敲键之前就能出来）。
不要靠 `delay: 1500ms` 这种长延迟做"接力" —— 接力用 `200ms` 错峰
就够了，太长就显得拖。

**stagger** 多元素入场时每个错峰 50~150ms。
**overshoot** 戏剧化时机用 `cubic-bezier(0.34, 1.56, 0.64, 1)`，**禁
全场弹簧**。

**用 token 不写裸数字**：CSS 里写 `var(--dur-base)` / `var(--dur-slow)`
/ `var(--dur-cinematic)` 而非 `1100ms`。token 由主题定义，换主题时长
自动跟着改 —— 见基础设施在 `src/styles/base.css` `--dur-*` 区块。

### 持续微动 ≠ 视频感（重要）

**持续微动**（ken burns / 光晕呼吸 / dot pulse / 流光 sweep / 扫描
线）**不是必填项，不是"画面在动"的证明**。无脑挂一堆持续微动，反而
会让画面显得**装饰过度、AI 味重**。

**判断要不要加持续微动**：

1. 该步的内容**自身有内在动作**（数字 ticker / 比较 / 演示流程）→
   **不需要**持续微动，内容动作就是画面在动
2. 该步**就是个静态 hero**（品牌名、章节 chip、标语）+ 讲者会在这
   停留 5 秒以上 → **可以**挂一层低强度（透明度 ≤ 0.15、scale ≤ 0.015）
3. 任何情况下，整片**不超过 30~40% 的 step**有持续微动

**反模式**（"AI 味"翻车点）：

- ❌ 每步给所有 hero 文字加"字符光晕呼吸"
- ❌ 每步背景挂"扫描线 sweep"
- ❌ 每个 chip / 卡片都有"边框流光"
- ❌ 把"持续微动"当成"画面在动"的兜底

---

## Part 3 · 视觉法则与内容原则

### 避免 AI 味的反模式

这些是"AI 生成"的视觉指纹。即使主题没明确禁止，也**别做**：

- ❌ **紫粉蓝渐变 background** —— 最强烈的 AI 味
- ❌ **圆角卡片 + 彩色左边框装饰** —— 90% 的 ChatGPT-prompt 起手式
- ❌ **千篇一律的"渐变按钮 + 大圆角卡"组合**
- ❌ **拿 SVG 画复杂插画 / 人物 / 场景** —— 用 placeholder
- ❌ **图标 / 数字 / 装饰 spam**（"data slop"）
- ❌ **假 logo 墙** / 假客户测评 / 假"X 万用户"
- ❌ **Inter / Roboto / Arial / system-ui** —— 主题已经用了对的字体
- ❌ **emoji 用作图标 / 装饰**（除非 `theme.json.allowEmoji = true`）

### Placeholder 哲学

**没有的东西就承认没有，用 placeholder 标出来，不要造假。**

| 缺的 | 怎么做 |
|---|---|
| 图标 | `[icon]` 文字标签 / 简单几何方块 |
| 头像 | 首字母圆形 + 主题色填充 |
| 图片 | 一张写着 `image · 16:9` 的占位卡（按真实比例留位） |
| 数据 / 数字 | **问用户拿真实的**，绝不编 |
| 公司 logo | 公司名 + 简单几何形状 |
| 截图 | phone-frame 包着的 placeholder 卡 |

观众看不出来 placeholder 丑（默认是开发中），但能看出来 fake 假
（伤害可信度）。

### 内容原则

- **不堆砌内容** —— 每个元素都得"挣到"自己的位置
- **不擅自加 section** —— 觉得不够，**先问用户**
- **placeholder > fabricated data** —— 假数据伤可信度比承认空白更狠
- **数字翻译成感受** —— 除非数字本身是冲击点，否则"47%" → "几乎快了
  一倍"

### 节奏与留白

- **页面看起来空 = 布局问题，不是内容问题**。解法是 composition + 字号
  节奏 + 留白对比，**不是**"再加点东西"
- 单屏内容塞不下 → **拆成两步**，不是缩字号
- 留白 ≥ 元素 30%
- 主题已经预设 `--stage-pad-x` / `--stage-pad-y`，**直接用**

---

## Part 4 · 章节开工 mini-checklist（每章必走）

```
□ 重读 PRINCIPLES.md 「十条不可妥协的原则」
□ 重读 outline.md 中本章的 step 描述（注意每步 (~Ts) 估时和 article 补字段）
□ 翻 article.md 本章对应段，抽口播没念但画面能挂的细节
□ 核对 outline.md 末尾本章的素材清单 —— ✓ 用真的，⚠️ 用 placeholder
□ 打开 themes/<id>/theme.json：看 motionHints / motionDuration / typeScale / allowEmoji
□ 扫一眼本文 Part 1（代码硬规则）+ Part 2（视觉工具箱）
□ 在 token 速查表里挑这一章要用的 token；不够再翻 THEMES.md
□ 每步先问"内容里什么是动作 / 变化 / 关系 / 比较，能演给观众看？"（PRINCIPLES.md 原则 7）
□ 找不到内在动作的步骤（slug / chip / 品牌 reveal）才用入场动画兜底
□ 整章持续微动（ken burns / 光晕呼吸 / sweep）数量 ≤ 30% 的 step；不要每步都挂
□ 决定每步动画 —— 自由设计；卡壳再翻 PATTERNS.md 找灵感
```

---

## Part 5 · 单章完工自检

写完一章 + 浏览器点完后，**逐项过**。任一未过 → 回去改，**不要**
"先放着以后修"。

### 代码层

- [ ] CSS 里 0 个硬编码 hex / px / 字体名 / duration
- [ ] 0 个 `setTimeout` / `setInterval` / `scrollIntoView`
- [ ] 子组件需要重播动画都有 `key={step}`
- [ ] 章节内可交互元素都有 `data-no-advance`
- [ ] 没 import 别的章节的 CSS / 组件
- [ ] 动画属性只有 `transform / opacity / clip-path / filter`

### 视觉层

- [ ] 没 AI 味反模式（紫粉渐变 / 彩色左边框 / 渐变按钮大圆角 / 假插画）
- [ ] emoji 使用符合主题 `allowEmoji` 设置
- [ ] 没假数据 / 假 logo / 假测评
- [ ] 字号节奏符合主题 `typeScale`（默认 hero ≥ 80px、对比 ≥ 4×）
- [ ] 没 5+ 项小字号项目列表
- [ ] 一屏一个想法，不堆叠
- [ ] 缺资源的地方都是 placeholder，不是 fake
- [ ] 用 1~2 个用力的特效，不是三个叠一起
- [ ] **动画选型符合当前主题 `motionHints`**（不该弹簧的没弹簧）

### 节奏层

- [ ] 主导动作时长在主题 `motionDuration` 范围内（**整步入场 ≤ 1.5s**）
- [ ] 没靠 `delay: 1500ms+` 这种长延迟做接力（讲者会等到不耐烦）
- [ ] 多元素入场有 stagger，不是同步

### 视频感层（**最关键**）

- [ ] **内容驱动动画**（PRINCIPLES.md 原则 7）：每步先看内容能不能演（数字 ticker / 比较 / 流程 / 变形），不能才退化为入场动画
- [ ] **不同 step 用不同主导动作** —— 全片只用 fade / blur clear = PPT 警报
- [ ] **持续微动慎用**：整章 ≤ 30% 的 step 挂；**不**每步都加 ken burns / 字符光晕呼吸 / sweep
- [ ] **背景层有纹理**：噪点 / 网格 / turbulence / conic-gradient 之一（这是底色，不算"持续微动"）
- [ ] **至少用 1 处 SVG 自绘**（stroke-dashoffset）：下划线 / 流程图 / 柱图
- [ ] **数字 hero**（如有）用 ticker 滚动 / 粒子聚拢 / 砸下，**禁直接显示**
- [ ] 流程图 / 架构图 / 关系图用 SVG 自绘，**禁文字列代替**
- [ ] **每步画面里有"口播没念但 article 里有"的细节**（双源原则，原则 10）

### 录制前自检（章节交付时统一过）

- [ ] 视口高度 720 / 900 / 1080 / 1440 都正确缩放
- [ ] 没有内容被截断 —— 舞台四边都至少留 80px
- [ ] 每次点击恰好推进一步，键盘 ←/→ 能用
- [ ] 鼠标移到底部 → 进度条渐入；点 pip → 跳转 + 干净重挂载
- [ ] 刷新能恢复游标（或已 bump 过 `STORAGE_KEY`）
- [ ] 整片演示一个主题（没有表面色翻转）
- [ ] 章节 CSS 里所有视觉属性都是 `var(--…)` 语义 token
- [ ] 舞台上没有 header / footer / 页码 / 品牌条 / 面包屑

### 「看一眼就知道是不是 PPT」自检

**点完一遍后**问自己：

- 这一章里有几个 step 是**真的演示了内容动作**（数字递增 / 比较 / 流程 / 变形 / 揭示）？
- 几个 step 只是**入场动画 + 持续微动**？

理想比例：**内容动作 ≥ 60%，入场动画 ≤ 30%，纯静态 ≤ 10%**。
反过来 = AI 味重 + PPT 感。

---

## Part 6 · 常见反馈速查

视频开发阶段用户最常说的几句反馈，对应该改什么。**先定位反馈层级**
（节奏 / 视觉 / 内容 / 代码），再改最小切片 —— **不要重做整章**。

| 用户说的话 | 真问题 | 改在哪 |
|---|---|---|
| "这一段太快了" | 单步动画完成时间过长 / 或步太少没节奏 | 缩短 keyframes duration；或拆成 2 步 |
| "这一段太慢了" | 单步内容太单薄，撑不住估时 | 把两步合并 / 加内容 / 缩估时 |
| "动画方向不对" | 没遵守主题 motionHints | 重读 `theme.json`，照气质重做 |
| "看起来还是像 PPT" | 静态文字太多 / 缺主导动作 / 章节有 header 导航 | Part 2 视觉工具箱 + PRINCIPLES.md 原则 6/7 |
| "画面太空 / 信息太薄" / "嘴上说啥屏幕就写啥" | 只跟 script 写画面，没回 article 抽细节 | 翻 `article.md` 当章对应段，把数字 / 引用 / 对比 / 标签挂进画面（违反原则 10） |
| "对不上音频" | step 数量与口播节拍不一致 | 重读 script.md 数节拍，调整 outline 切分 |
| "字太小" / "看不清" | 字号没拉到 hero 级别 | 用 `--t-display-1` / `--t-display-2`，对照主题 `typeScale` |
| "视觉单薄" | 一屏只有文字，没有真素材 | 补素材清单交给用户；Part 2 选 1 个特效 |
| "AI 味太重" | 紫粉渐变 / 彩色左边框 / 假插画 / emoji | Part 3「避免 AI 味反模式」逐项检查 |
| "颜色不对" | 章节里硬编码了非主题色 | 全章节搜 `#` 找硬编码，全换语义 token |
| "节奏跳跃" | 章节间表面色 / 字体翻转 | 整片必须同主题（PRINCIPLES.md 原则 9） |
| "我刷新就重置了进度" | 改了 chapters.ts 但没 bump STORAGE_KEY | `useStepper.ts` `STORAGE_KEY` 末尾版本号 +1 |
| "点击没反应 / 跳两步" | 章内有可交互元素没加 `data-no-advance` | 给章内按钮 / 自定义控件加 `data-no-advance` |
