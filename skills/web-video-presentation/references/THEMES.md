# 主题系统

每个演示从头到尾跑**一个主题**。我们**不**在章节间翻转明暗 —— 那会
打断视频的视觉连贯性，录屏时看起来像很硬的剪辑。如果想要"暗一点的氛围"
段落，请在**同一调色板内**降对比、收聚光，而不是翻转表面色。

主题是一个 CSS 文件量的设计 token 集合。章节用**语义名**引用 token
（`--surface`、`--text`、`--accent`、`--t-h1`、`--space-5`、`--r-card` …），
绝不写硬编码值。换主题就是覆盖 `tokens.css`，章节代码一行不动。

主题**不只是**颜色和字体。它管：

| 维度                       | 例子                                                              |
| -------------------------- | ----------------------------------------------------------------- |
| **调色板**                 | shell / surface 阶梯、text 阶梯、accent + 透明度衍生              |
| **字型**                   | 中文 / 英文 / 等宽家族、OpenType 特性集                            |
| **字号尺度覆盖**           | 每个主题可以重调 `--t-display-1` 等，匹配自己的气质                |
| **字距预设**               | tight / snug / normal / loose / caps                              |
| **舞台 padding 密度**      | 精炼主题用 140×100，密集主题用 80×60                              |
| **圆角性格**               | sharp (0) / refined (4) / soft (16) / keynote (32)                |
| **分割线性格**             | 细 / 粗 × 实 / 虚 —— 屏幕上每条 rule 都在说主题的语言             |
| **hero 数字风格**          | 编辑级斜体 / 终端等宽 / 粗黑 / 手写                                |
| **阴影配方**               | 纸质浮起 / 卡片 / 发光 / 硬偏移（Bauhaus）/ 内阴影（terminal）     |
| **装饰层**                 | grid / 纸纹 / scanlines / vignette / 干净                         |
| **动效气质**               | 电影感慢 / 弹簧 / 利落 / 安静                                      |

合起来每个主题约 50 个 token。完整契约见下方"完整 token 契约"。

---

## 内置主题

10 套初始主题，每个都有**独立的设计 DNA** —— 不是简单的换色版。挑一个
匹配你主题情绪的，或者作为你自己主题的起点。

### 深色主题

| id                | 性格                                                                                                                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `midnight-press`  | 电影感编辑级深色。暖色 espresso（不是纯黑）+ 火热橙。Instrument Serif italic 英文 vs Noto Serif SC 中文。hero 数字：斜体衬线。慢速电影感节奏（1.6s 揭示）。140×100 padding。只有 vignette，没有颗粒。            |
| `chalk-garden`    | 深石板黑板。Patrick Hand 全场手写，粉笔黄 accent。**2px 虚线 rule** 是签名。film grain（overlay）+ vignette。衬线带 chalk text-shadow。手绘节奏。                                                                |
| `terminal-green`  | 80 年代磷光终端。纯黑 + JetBrains Mono only + 0px 直角。**CRT 扫描线**贴在舞台上。文字带磷光 text-shadow。利落线性动效（180/400/650ms）。hero 数字：等宽带发光。                                                  |
| `blueprint`       | 工程蓝图。深海军蓝 + 绘图青 + IBM Plex Mono。**2px 虚线青色 rule + 60px 制图网格**是签名。hero 数字：等宽青色。等宽配对营造技术 / 蓝图感。                                                                       |

### 浅色主题

| id                  | 性格                                                                                                                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `paper-press`       | midnight-press 的白天孪生兄弟。暖奶油 + 纸纹（multiply blend）。火热橙。hero 数字：斜体编辑级衬线。慢速电影感节奏。140×100 padding。                                                                              |
| `warm-keynote`      | 现代 SaaS keynote。奶油 + 棕褐墨 + 青绿 + Inter。**大圆角（32px）glass slab** 配 backdrop blur。**粗黑 font-black hero 数字**。舞台上 40px 暖色网格。弹簧动效。                                                  |
| `newsroom`          | NYT 报刊。报纸奶油 + 墨黑衬线 + 旗红。Playfair Display + Noto Serif SC。**0 圆角**（报纸不会圆角）。hero 数字：超大斜体显示衬线。安静的印刷节奏。淡纸纹。                                                        |
| `bauhaus-bold`      | 现代主义宣言。米白 + 墨黑 + 原色蓝。Archivo Black + Inter。**0 圆角 + 4px 实色厚边 + 4px 黑色画框包住舞台 + 偏移实色阴影**。hero 数字：font-weight 900 巨字。利落快速动效。无装饰。                              |
| `sunset-zine`       | 独立 risograph zine。暖桃 + riso 洋红 + Fraunces。**虚线剪贴线 + 偏移桃色阴影**。hero 数字：斜体 Fraunces。粗 riso 纸纹。弹簧 overshoot 动效。                                                                  |
| `monochrome-print`  | 安静精炼的印刷杂志 —— Monocle / Wallpaper / MIT Press。米白 + 墨黑衬线 + 墨蓝 accent。Source Serif。**只有 1px 实线发丝、4px 精炼圆角**。hero 数字：斜体 tabular figures。**无装饰** —— 极简纯粹。极静节奏（1.7s 揭示）。 |

随时列出可用主题：

```bash
bash .cursor/skills/web-video-presentation/scripts/scaffold.sh --list-themes
```

---

## 脚手架时挑一个主题

```bash
# 默认（midnight-press）
bash scripts/scaffold.sh ./presentation

# 显式指定
bash scripts/scaffold.sh ./talk --theme=newsroom
```

脚手架会把所选主题的 `tokens.css` 拷到 `<project>/src/styles/tokens.css`，
并把主题 id 写到 `<project>/.theme`，方便以后看是从哪个主题开始的。

---

## 之后切换主题

切换 = 一次文件覆盖：

```bash
cp .cursor/skills/web-video-presentation/themes/newsroom/tokens.css \
   presentation/src/styles/tokens.css
```

刷新 dev server。完成。章节代码一行没动。

如果切换后某章节看起来有问题，那是该章节在某处硬编码了颜色 / 字体 /
尺寸，而不是用语义 token。去找出来 —— bug 在章节里，不在主题里。

---

## 完整 token 契约

`base.css` 给**每个 token 都准备了合理的默认值**。主题的 `tokens.css`
只需要覆盖与众不同的那部分。间距尺度、字号尺度这种东西很少在主题间变化；
**性格 token**（`--r-card`、`--rule-style`、`--hero-num-*`）才是主题
赚到性格的地方。

### 必填（主题必须定义）

#### 表面色（4 个）

| token         | 作用                                                |
| ------------- | --------------------------------------------------- |
| `--shell`     | letterbox / 舞台外的页面背景                        |
| `--surface`   | 舞台主背景                                          |
| `--surface-2` | 凸起 —— 卡片、代码块、嵌入面板                      |
| `--surface-3` | 最里层 —— surface-2 里再嵌一层时用                  |

#### 文字（4 个）

| token          | 作用                                  |
| -------------- | ------------------------------------- |
| `--text`       | 主                                    |
| `--text-2`     | 次（副标题、正文）                    |
| `--text-mute`  | 静音 —— 标签 / 元数据                 |
| `--text-faint` | 三级 —— 提示 / 禁用                   |

#### 线条（1 个）

| token    | 作用              |
| -------- | ----------------- |
| `--rule` | 发丝分割线颜色    |

#### Accent（3 个）

| token           | 作用                                          |
| --------------- | --------------------------------------------- |
| `--accent`      | accent 本体（一个品牌强色）                   |
| `--accent-soft` | 低透明度叠层 —— pill 背景、悬浮光晕            |
| `--accent-glow` | 中透明度叠层 —— text shadow、圆点发光          |

#### 字型家族（4 个）

| token               | 作用                                       |
| ------------------- | ------------------------------------------ |
| `--font-display-cn` | 中文显示家族                               |
| `--font-display-en` | 拉丁显示家族（斜体强调声音）               |
| `--font-body`       | 正文 / 段落家族                            |
| `--font-mono`       | 等宽家族（终端、mono caps、badge）          |

### 可选的性格覆盖（主题应该定义来表达自己的性格）

这些有 base 默认值；主题重新定义来表达性格。

| token              | base 默认           | 作用                                                  |
| ------------------ | ------------------- | ----------------------------------------------------- |
| `--font-features`  | `"tnum","ss01"`     | body 上的 OpenType 特性栈                             |
| `--r-card`         | `--r-md`            | 默认卡片圆角（sharp / refined / keynote）              |
| `--r-stage`        | `0`                 | 直接加在舞台本身的圆角                                 |
| `--rule-w`         | `1px`               | rule 粗细（1=发丝，2=中等，4=厚重）                    |
| `--rule-style`     | `solid`             | rule 样式（`solid` / `dashed` / `dotted`）             |
| `--hero-num-font`  | `--font-display-en` | `.hero-num` 用什么字体（主题决定性格）                 |
| `--hero-num-style` | `italic`            | `italic` / `normal`                                   |
| `--hero-num-weight`| `400`               | 400（编辑级）/ 500（等宽）/ 900（粗黑）                |
| `--hero-num-track` | `--track-tight`     | hero 数字的字距                                       |
| `--stage-pad-x`    | `96px`              | 舞台横向内边距（密度旋钮）                            |
| `--stage-pad-y`    | `80px`              | 舞台纵向内边距                                        |
| `--card-shadow`    | none                | `.card` 的 box-shadow                                 |
| `--card-glass-bg`  | `rgba(255,255,255,0.06)` | `.card-glass` 的背景                            |
| `--card-glass-border` | `rgba(255,255,255,0.12)` | `.card-glass` 的边框                            |
| `--shadow-stage`   | dark drop           | 舞台的 box-shadow                                     |
| `--stage-border`   | `none`              | 舞台的可选边框（Bauhaus 用 `4px solid black`）         |

### 可选的装饰层（主题可选用，给质感加签名）

这些默认是 no-op；主题选择性启用。装饰画**在舞台上**（pattern 用
`stage-frame::after`，vignette 用 `stage-frame::before`），所以会被屏幕
录制器捕捉到。

| token                        | 作用                                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `--surface-pattern`          | 叠在舞台上的 `background-image`。SVG 噪声 / 网格 / 扫描线。                                                |
| `--surface-pattern-size`     | 配套的 `background-size`。可平铺渐变必填。                                                                  |
| `--surface-pattern-blend`    | pattern 层的 `mix-blend-mode`（`normal` / `multiply` / `overlay`）。                                       |
| `--surface-pattern-opacity`  | pattern 层的整体透明度乘子。                                                                                |
| `--surface-pattern-repeat`   | `background-repeat`（默认 `repeat`）。                                                                      |
| `--surface-vignette`         | vignette 叠层的 `background`（黑板 / 电影感边角的径向渐变）。                                              |
| `--shell-pattern`            | 舞台外 letterbox 区域的 `background-image`。                                                               |
| `--shell-pattern-size`       | 配套 `--shell-pattern` 的 size。                                                                            |
| `--shell-pattern-attachment` | `--shell-pattern` 的 `background-attachment`。                                                              |
| `--text-shadow`              | 应用在 `.serif-cn` / `.serif-it` 上。如粉笔晕 / 磷光辉。                                                    |
| `--stage-filter`             | 舞台 fitter 上的 `filter`。很少用；如轻微 `contrast()` 微调。                                              |

如果你需要的装饰找不到对应槽位，那就跨过"主题契约"边界进入"章节自定义
CSS"领域 —— 在那里解决，别扩主题契约。

---

## 创作新主题

### 1. 复制一个最接近的作为起点

挑一个**最接近**你目标气质的：

| 目标情绪                            | 起点               |
| ----------------------------------- | ------------------ |
| 阴郁、电影感、编辑级                | `midnight-press`   |
| 编辑级 - 浅色                       | `paper-press`      |
| 现代 keynote / SaaS                 | `warm-keynote`     |
| 教室 / 解说                         | `chalk-garden`     |
| 终端 / 黑客 / 赛博                  | `terminal-green`   |
| 纪录片 / 严肃 / 新闻                | `newsroom`         |
| 工程 / 蓝图 / 技术                  | `blueprint`        |
| 现代主义 / 布鲁塔利斯特 / 宣言      | `bauhaus-bold`     |
| 独立 / 玩味 / zine                  | `sunset-zine`      |
| 精炼 / 安静 / 印刷                  | `monochrome-print` |

```bash
cd .cursor/skills/web-video-presentation/themes
cp -r monochrome-print my-theme
```

### 2. 改 `my-theme/tokens.css`

按契约自上而下走一遍：调色板 → 字体 → 动效 → 性格 → 装饰。**不要**碰
间距和字号尺度，除非你有特别理由 —— 默认值已经在所有主题上验证过了。

**几条不那么显而易见的规则：**

- 深色主题里 `--shell` **比 `--surface` 更深 / 更饱和**；浅色主题里
  `--shell` **比 `--surface` 略灰一点** —— 这样舞台读起来是"主体"，
  外围会退后。
- 维持 `--text` 与 `--surface` **至少 4.5:1 对比度**。96px+ 的标题
  可以放宽到 3:1，body / cue 必须 ≥ 4.5:1。
- `--accent` 是**唯一的**饱和色。第二个饱和色会跟第一个打架。
- `--accent-glow` 和 `--accent-soft` 是 `--accent` **同色相的透明度
  叠层**，永远不要用别的色相。
- `--text-faint` 在 `--surface` 上 13px 大写时**仍然要可读**。
- 挑**一个设计签名**重重发力：虚线 rule、粗黑边、扫描线、纸纹、glass
  slab。别同时叠三个。

### 3. 改 `my-theme/theme.json`

```json
{
  "id": "my-theme",
  "name": "My Theme",
  "nameZh": "我的主题",
  "description": "一句英文描述它的气质。",
  "descriptionZh": "一句中文描述它的气质。",
  "mood": ["dark", "moody", "futuristic"],
  "bestFor": ["<匹配场景 1>", "<匹配场景 2>"],
  "motionHints": "<动效气质摘要 + 禁用动作>",
  "motionDuration": "default",
  "typeScale": "default",
  "allowEmoji": false,
  "preview": {
    "shell": "#080808",
    "surface": "#101010",
    "text": "#f0f0f0",
    "accent": "#ffd54a"
  }
}
```

`id` 必须等于目录名。

### 主题元数据字段说明

| 字段 | 必填 | 取值 | 决定什么 |
|---|---|---|---|
| `id` / `name` / `nameZh` | ✓ | 字符串 | 主题标识 |
| `description` / `descriptionZh` | ✓ | 一句话 | A1 列清单时的简介 |
| `mood` | ✓ | 标签数组 | 模糊匹配用 |
| `bestFor` | ✓ | 场景数组 | A1 智能推荐时的命中点 |
| `motionHints` | ✓ | 一段文字 | 动效该 / 禁用什么 —— **outline 阶段动画选型必须扣这条** |
| `motionDuration` | ✓ | `slow` / `default` / `fast` | 主导动作时长。`slow` = 3~4s（电影感）/ `default` = 0.8~1.5s / `fast` = 0.4~0.8s（砸下、终端） |
| `typeScale` | ✓ | `loud` / `default` / `quiet` | hero 字号节奏。`loud` = hero 144px+（报头 / 包豪斯）/ `default` = ≥ 80px / `quiet` = 60px 起（极简印刷） |
| `allowEmoji` | ✓ | bool | 装饰性 emoji 是否允许。默认 `false`；vlog / zine 风可设 `true` |
| `preview` | ✓ | 4 色对象 | A1 列清单时的视觉预览 |

> **agent 在 Phase 2.4 写章节时会读这 4 个气质字段**（`motionHints` /
> `motionDuration` / `typeScale` / `allowEmoji`），决定动作选型 + 时长
> + 字号 + emoji 是否允许。**4 个字段都必填**，不要给空值。

### 4. 用所有 demo 章节测试一遍

```bash
bash scripts/scaffold.sh /tmp/test-theme --theme=my-theme
cd /tmp/test-theme
npm run dev
```

把 demo 每一步点完。检查：

- 标题衬线在舞台上很清晰。
- accent 圆点在发光但不爆。
- 斜体强调有可读的背景。
- 进度条（悬浮底边）能看到，是 accent 色。
- masthead 行（`.masthead`）读起来像编辑 chrome，不像 navbar。
- hero 数字（`.hero-num`）感觉**和整体字型同源**，不像贴上去的。
- 卡片（`.card`）感觉是合适的材质（纸 / 玻璃 / cell）。
- 装饰**被注意到一次然后被忘掉** —— 永远不打扰。

哪里不对就改 `tokens.css`，刷新即可。无需重新构建。

### 5. 加到文档里

在本文件顶部"内置主题"表里追加一行。

---

## 反模式

- **章节 CSS 硬编码 hex / px / 字体名** —— 缺哪个 token 就在契约里
  补一个，给所有主题加上
- **演示中途切换主题** —— 选一个，一以贯之
- **第二个 accent 色** —— 只能有一个。用尺度 + 字重做层级
- **在组件层 override token** —— 只在 `:root` 里覆盖。一次性的颜色
  需求 = 提一个派生 token，让所有主题都提供自己的值
- **依赖主题的 TSX 条件分支** —— 章节必须主题无关。布局依赖明 vs 暗
  = 布局脆弱，修布局
- **一个主题叠三个设计签名** —— 选 ONE 个（虚线 rule / 扫描线 /
  glass slab / 纸纹 / 粗边），三个会自己打架
