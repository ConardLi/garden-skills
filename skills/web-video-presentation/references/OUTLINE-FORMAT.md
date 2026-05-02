# `outline.md` 格式 spec

视频章节规划的产出文件。**用户可以直接编辑**，所以格式必须人类友好
（用 markdown 不用 JSON / YAML）。

> **写 outline 前必读两份源**（双源原则，PRINCIPLES.md 原则 10）：
> - **`script.md`** —— 决定**节拍**：按 `---` 切节拍，每节拍 1~2 step、
>   估时、hero 标语
> - **`article.md`** —— 决定**画面信息密度**：找到当前节拍**对应的
>   article 段落**，抽口播省略的细节（数字 / 引用 / 对比 / 案例标签
>   / 引用原话），挂到 step 的画面里

---

## 抽象示例（看格式）

````markdown
# Video Outline

> **主题**：`<theme-id>`（A1 已选定）—— <motionHints 摘要>。**禁** <主题禁忌摘要>
> **总时长**：约 <T> 分 <S> 秒（口播 ~<X> 字 ÷ 4 字/秒）
> **章节数**：<N> 章 / <M> 步

---

## 1. <chapter-id> — <章节标题>（<S> steps · ~<T>s）

- **step 1** (~<t>s) — <屏幕上有什么>
  · 动画：<主导动作> → <伴随动作和顺序关系>；持续微动：<永不停的微动>
  · 手段：<CSS / SVG / Canvas / filter / JS 实现要点>
  · article 补：<从原文抽来的 1~3 个口播省略的细节 —— 数字 / 引用 / 对比 / 标签>

- **step 2** (~<t>s) — <屏幕上有什么>
  · 动画：...
  · 手段：...
  · article 补：...

口播节选：
> <1~3 句节选，对应到 script.md 完整文本>

---

## 2. <chapter-id> — <章节标题>（<S> steps · ~<T>s）
...
````

> **关于时长**：outline 里**只**写 step 的 `(~Ts)` 口播估时（音画对齐
> 用），动画行**不写**具体毫秒 / 秒数。**也不写**"错峰 0.5s"这种具体
> 错峰量。原因 —— 一旦写死，实现时会被当成强制硬指标照抄，节奏就僵
> 了。outline 阶段只描述**动作类型 + 顺序关系**（"先 A 再 B 同步 C"），
> 时长由实现阶段（`CHAPTER-CRAFT.md` Part 2 时长参考）按主题 +
> 估时综合决定。

> **想看具象示例**：
> - 科技测评类（实测 / 对比 / 跑分） → [`EXAMPLES/case-tech-review/outline-snippet.md`](EXAMPLES/case-tech-review/outline-snippet.md)
> - 钩子型开场结构 → [`EXAMPLES/hook-chapter/`](EXAMPLES/hook-chapter/)
> - 列举型章节结构 → [`EXAMPLES/list-reveal/`](EXAMPLES/list-reveal/)

---

## 字段约定

### 顶部 metadata block

用引用块（`>`）形式，方便扫一眼整体规模：

| 字段 | 必填 | 说明 |
|---|---|---|
| **主题** | ✓ | A1 必须已选定。outline 里每步动画选型都要扣这个主题的 `motionHints` |
| **总时长** | ✓ | 估算口播时长（中文 ~ 250 字 / 分钟） |
| **章节数** | ✓ | `N 章 / M 步` |

### 章节标题：`## N. <id> — <title>（<S> steps）`

| 部分 | 规则 |
|---|---|
| `N` | 1-indexed 顺序，对齐 `chapters.ts` 的注册顺序 |
| `<id>` | **小写 + 连字符**。会成为 React `key` / 文件夹名 (`src/chapters/0N-<id>/`) / 音频子目录 (`public/audio/<id>/`) |
| `<title>` | 给人看的中文标题。**不会**进 React 代码 |
| `<S> steps` | 该章 step 总数 |

合法 id：`coldopen`、`hook`、`why-good`、`why-good-text-render`。
不合法：`why_good`（用连字符）、`Hook`（小写）、`第一章`（拉丁字符）。

### Step 列表：每步 **3 行 + 1 行可选**

```
- **step N** (~Ts) — <屏幕上有什么>
  · **动画**：<内容驱动的主动作 + 顺序关系>
  · **手段**：<SVG / Canvas / CSS filter / 自绘 / 粒子 ...>
  · **article 补**：<从原文抽来的 1~3 个具体细节>
```

| 规则 | 原因 |
|---|---|
| `step N` 1-indexed | agent 实现时 `if (step === N - 1) ...`（注意零基偏移） |
| **`(~Ts)`** 必填 | 按 script.md 本步对应口播段字数 ÷ 4 估算（中文 ~ 4 字/秒）。范围 3~10s |
| 第 1 行（屏幕内容）≤ 30 字 | 提醒"这一步要做什么"，不是文案 |
| **第 2 行（动画）必填** | 不写动画 = 默认做成 PPT。**先找内容内在动作**（数字增、对比、流程、变形 ...），找不到才退化为入场动画。详见 PRINCIPLES.md 原则 7。**只描述动作类型 + 顺序，禁写具体 ms / s 时长**（实现阶段决定，见 CHAPTER-CRAFT.md Part 2） |
| 第 3 行（手段）建议填 | 写明用什么技术，逼自己跳出"只会用 mask reveal"的舒适区 |
| **第 4 行（article 补）有原文时强烈建议** | **双源原则**（PRINCIPLES.md 原则 10）。从 article 当前节拍对应段抽 1~3 个口播没念但画面能挂的细节。**没有 article**（用户直接给 script）时这一行可省，但要在第 1 行**主动设计**画面信息密度 |

**判断画面够不够密的快捷自检**：

```
口播节选 + 画面屏幕内容 = ?

A) 画面 = 口播原文打印                              → ❌ 信息密度 0，PPT 警报
B) 画面 = 口播标语 + article 抽来的具体数字 / 引用  → ✓ 视频感
C) 画面 = 完全和口播无关的素材                       → ❌ 看不懂，对不上
```

### 写动画的核心心法

> 详细原则在 [`PRINCIPLES.md`](PRINCIPLES.md) 原则 7（内容驱动动画）。
> 这里给 outline 阶段的**思考流程**。

每写一个 step，按这个顺序思考：

**1. 先问"这一步的内容里，有什么本身就是动作 / 变化 / 关系 / 比较，
我可以把它演出来"**：

| 内容 → 动作 | 例子 |
|---|---|
| 有数字 / 分数 / 排名 → **数字 ticker 递增** | "1512 分" → 数字从 0 滚到 1512 |
| 有比较 → **横条 / 散点 racing** 或 **wipe 切开** | "1512 vs 1270" → 双横条赛跑 |
| 有公式 / 计算 → **真的演出加减** | "1512 − 1270 = 242" → 旧字符飞走、新字符落入 |
| 有流程 / 步骤 → **节点依次点亮 + 连线生长** | 5 节点流水线 → SVG path 接力描边 |
| 有 before / after → **slider drag 或 wipe 切换** | "上一代 vs GPT-Image-2" → clip-path 推进 |
| 有转换 / 变形 → **morph** | 形状 A → B |
| 有揭示 → **mask reveal / 聚光灯** | 隐藏的截图 → radial mask 扫开 |
| 有引用 / 标语 → **typewriter / split-char** | pull-quote → 逐字浮入 |

**2. 找不到内在动作（slug 元数据 / 章节 chip / 品牌名 reveal 等
"信息很轻"的步骤），才退化用入场动画**（blur clear / fade-up / 
slide-in）。这种 step 全片**不能超过 30%**。

**3. 主题 `motionHints` 决定动作的"质感"**（运动曲线、颜色、装饰
搭配），但**不决定动作的"类型"**。例如同一个"数字 ticker"，
`bauhaus-bold` 里数字 hard-cut 翻屏、`midnight-press` 里数字 blur
clear 锁定，是同一种内容动作的两种主题质感。

**4. 持续微动**（ken burns / breath / pulse / sweep）**不是必填**。
不要每步无脑挂 —— 装饰过度比 PPT 化更糟。只在该步**停留很久且确实
画面太静**时，挂**一层**低强度的（详见 PRINCIPLES.md 原则 7 反模式）。

> **主题动画词速查**（仅作风格定调，不替代上面"内容动作"的优先级）：
>
> | 主题 | 风格关键词 |
> |---|---|
> | `newsroom` | 印刷盖章 / 报头平移 / pull-quote 砸下 |
> | `chalk-garden` | 粉笔自绘 / 手写擦除 / 慢速 stagger |
> | `terminal-green` | 打字机 / 光标 blink / 扫描线 |
> | `bauhaus-bold` | hard-cut / 巨字 overshoot / 几何位移 |
> | `blueprint` | SVG 蓝图自绘 / 网格点亮 |
> | `midnight-press` | blur clear / 慢 fade / 聚光灯 mask |
>
> **禁止**：拿一个主题的动画词描述另一个主题（`bauhaus-bold` 里出现
> "粉笔自绘" = 主题不一致警报）。

> **outline 不写时长**：动作具体跑多少 ms / 错峰多少 ms 都在
> [`CHAPTER-CRAFT.md`](CHAPTER-CRAFT.md) Part 2 决定。outline 只写
> "数字 ticker 滚到 1512"、"先 A 再 B 同步 C"这种**类型 + 顺序**描述。

### Step 描述抽象示例

```
- **step 1** (~6s) — <hero 内容>，<装饰元素>
  · 动画：<主导动作类型，符合主题气质> → <伴随动作和顺序关系>；持续微动：<永不停的层>
  · 手段：<具体技术 stack：CSS filter / SVG path / Canvas / JS ...>
  · article 补：<左下角 mono cue / 角标 / pull-quote 内容，来自 article §X>
```

**正例（内容驱动）**：

```
- **step 1** (~5s) — 双数字对照：1512（GPT-Image-2）vs 1270（Nano-Banana 2）
  · 动画：两个数字同时从 0 ticker 递增，1512 跑得更快更远 → 收尾时 1512 下方一道 accent 横线短促 stroke 描边标记胜者
  · 手段：rAF 数字 ticker / 横条 scaleX 同步 / SVG stroke-dashoffset
  · article 补：1512 上方 "#1"、1270 上方 "#2"；底部 mono "Source: arena.ai/leaderboard"
```

→ 这一步内容里**自带"分数对比"动作**，所以演**数字 ticker + 横条
赛跑**，不用 blur clear。

**反例 1**（无脑套入场动画 + 装饰微动）：

```
- **step 1** (~5s) — 双数字 1512 vs 1270
  · 动画：1512 blur clear 入场 → 1270 错峰 blur clear 入场；持续微动：1512 下方 accent 横线呼吸
```

→ 内容明明是"分数对比"，应该把比较演出来，而不是把两个数字"出场"
就完事。"持续微动"是装饰，无意义堆叠。

**反例 2**（动画行写了具体时长 —— 不可接受）：

```
- **step 1** (~6s) — hero 进场
  · 动画：blur clear（~2.5s）→ 副标错峰 0.5s 浮入（~1.2s）；持续微动：4s loop
```

→ 写死 ms 数字会强制实现时按这个跑，节奏僵。**outline 只描述类型 +
顺序，不描述时长**。

**反例 3**（屏幕内容 / 动画 / 手段全部太抽象）：

```
- **step 1** (~6s) — 标题入场
  · 动画：fade in
  · 手段：CSS
```

→ 屏幕内容太抽象（"标题"是什么标题？）；动画只有 fade；手段没说清。
**这种 step 实现时一定做成 PPT**。

### 口播节选（每章末尾，可选但推荐）

精炼 1~3 句，**不是完整稿子**，仅供视觉规划阶段对照"这章在讲什么"。
完整文本回 `script.md`。`outline.md` 章节 = `script.md` 中两个明显
主题切换之间的段落。

> 音频合成（[`AUDIO.md`](AUDIO.md)）会**回到 `script.md`** 切分完整
> 文本，**不**用 outline 节选。

---

## 命名规则速查

| 对象 | 规则 | 示例 |
|---|---|---|
| 章节 id | 小写 + 连字符 | `coldopen`, `why-good` |
| 章节文件夹 | `0N-<id>` | `src/chapters/01-coldopen/` |
| 章节组件 | PascalCase | `Coldopen.tsx`, `WhyGood.tsx` |
| 音频子目录 | `<id>/` | `public/audio/coldopen/` |
| 音频文件 | `<step-N>.mp3` (1-indexed) | `public/audio/coldopen/1.mp3` |

---

## 章节切分的经验法则

- **每章 3~8 步**。少于 3 步太薄；多于 8 步观众会忘记这章在讲啥
- **总时长 ÷ 30 秒** ≈ 章节数（一章约 30~60 秒讲完）
- **每章 = 一个聚焦主题**。"为什么强 + 怎么用" 是两章，不是一章
- **章节边界 = 口播稿里讲者会换语气 / 换主题的位置**。读 `script.md`
  时哪里你下意识想"咳一声接下一段"，那里就是章节边界
- **慢节奏 / 长镜头风主题**（midnight-press / 电影感片头）每章可少到
  2~3 step；**信息密集型**（科技测评 / 对比表）每章可放宽到 8~10 step

---

## 素材清单（outline.md 末尾）

```markdown
## 素材清单

### 1. coldopen
- ✓ <资源 1 描述> （<已就位路径>）
- ⚠️ <资源 2 描述>（待提供）
- ⚠️ <资源 3 描述>（待提供）

### 2. <chapter-id>
...
```

| 标记 | 含义 |
|---|---|
| ✓ | 素材已在 `presentation/public/<chapter>/` 里 |
| ⚠️ | 待用户提供 —— 章节实现时用 `[image: 16:9 描述]` 占位卡 |

> **不要**用 SVG 画假图、不要用 emoji 凑、不要拿不相关的图凑。
> Placeholder 是 "需要真材料" 的信号，fake 是 "我偷懒" 的信号。

## 反例（拒绝 PPT 化的 outline）

❌ **每 step 只写一行屏幕内容，没写动画 / 没写 article 补**：
```
- step 1 — 标题入场
- step 2 — 三个特性
```
→ 实现时一定做成 PPT。

❌ **动画词跨主题混用**（`bauhaus-bold` 里出现"粉笔自绘"）：
→ 主题不一致，气质会撕裂。

❌ **多个想法塞同一 step**："hero 进场 + 三个特性 stagger + 数据浮出"：
→ 违反原则 8（多点逐个揭示）。每个并列项 1 step。

❌ **画面内容 = 口播原文照抄**：
→ 违反原则 10（双源）。回 article 抽细节挂上去。
