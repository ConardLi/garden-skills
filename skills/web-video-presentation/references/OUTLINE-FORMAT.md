# `outline.md` 格式 spec

视频章节规划的产出文件。**用户可以直接编辑**，所以格式必须人类友好
（用 markdown 不用 JSON / YAML）。

!重要：阅读此文件后必须继续阅读 [`CHAPTER-CRAFT.md`](CHAPTER-CRAFT.md) 的全部内容，了解对网页效果的真实需求，然后再开始编写 outline

> ## ⚠️ outline 是开发计划，不是视觉规划
>
> outline 只规划**节奏 + 内容 + 信息密度**：
>
> - 章节切分 / 每章 step 数 / 每步估时
> - 每步屏幕内容（hero / 标语 / 数据 / 列表项）
> - 章节级**信息池**（从 article 抽的数字 / 引用 / 案例 / 标签）

> **写 outline 前必读**（双源原则，[CHAPTER-CRAFT.md Part 0 原则 10](CHAPTER-CRAFT.md#10-双源原则scriptmd-定节拍--articlemd-定画面密度)）：
>
> - **`script.md`** —— 决定**节拍**：按 `---` 切节拍，每节拍 1~2 step、估时
> - **`article.md`**（如有）—— 决定**画面信息密度**：每章首段抽**信息池**

---

## 抽象示例（看格式）

````markdown
# Video Outline

> **主题**：`<theme-id>`（Checkpoint Plan 已选定）—— <一句话风格描述>
> **总时长**：约 <T> 分 <S> 秒（口播 ~<X> 字 ÷ 4 字/秒）
> **章节数**：<N> 章 / <M> 步

---

## 1. <chapter-id> — <章节标题>（<S> steps · ~<T>s）

**信息池**（chapter agent 按需挂角标 / 副标 / pull-quote / mono cue）：
- <类型：数字 / 引用 / 出处 / 案例 / 词义 / 时间 / 对比 / ...>：<内容> —— <来源 article §X / Lxx>
- ...

**开发计划**：

- step 1 (~Ts) — <屏幕内容>
- step 2 (~Ts) — <关系名前缀，可选>：<屏幕内容>
- ...

口播节选：
> <1~3 句节选，对应到 script.md 完整文本>

---

## 2. <chapter-id> — ...
````

> **关于时长**：outline 里**只**写 step 的 `(~Ts)` 口播估时（音画对齐
> 用），**绝对不写**动画时长 / 错峰量 / keyframe 数值。这些都在章节开发
> 阶段决定（[`CHAPTER-CRAFT.md`](CHAPTER-CRAFT.md) Part 3 时长参考）。

> **想看具象示例**：
> - 钩子型开场结构 → [`EXAMPLES/hook-chapter/`](EXAMPLES/hook-chapter/)
> - 列举型章节结构 → [`EXAMPLES/list-reveal/`](EXAMPLES/list-reveal/)
> - 科技测评类（实测 / 对比 / 跑分） → [`EXAMPLES/case-tech-review/`](EXAMPLES/case-tech-review/)

---

## 字段约定

### 顶部 metadata block

用引用块（`>`）形式，方便扫一眼整体规模：

| 字段 | 必填 | 说明 |
|---|---|---|
| **主题** | ✓ | Checkpoint Plan 必须已选定。chapter agent 实现时按主题颜色 / 字体 token 走，动画 / 节奏 / 视觉演示由章节自由发挥 |
| **总时长** | ✓ | 估算口播时长（中文 ~ 250 字 / 分钟） |
| **章节数** | ✓ | `N 章 / M 步` |

### 章节标题：`## N. <id> — <title>（<S> steps · ~<T>s）`

| 部分 | 规则 |
|---|---|
| `N` | 1-indexed 顺序，对齐 `chapters.ts` 的注册顺序 |
| `<id>` | **小写 + 连字符**。会成为 React `key` / 文件夹名 (`src/chapters/0N-<id>/`) / 音频子目录 (`public/audio/<id>/`) |
| `<title>` | 给人看的中文标题。**不会**进 React 代码 |
| `<S> steps` | 该章 step 总数 |
| `~<T>s` | 该章口播总估时（中文 ~ 4 字/秒） |

合法 id：`coldopen`、`hook`、`why-good`、`why-good-text-render`。
不合法：`why_good`（用连字符）、`Hook`（小写）、`第一章`（拉丁字符）。

### 章节首段「信息池」（**双源原则核心落地**）

每章独立列出从 `article.md` 抽的细节集合，**让 chapter agent 实现每步
画面时按需取用**——可能挂成右下角 mono 角标 / 副标小字 /
pull-quote 引用 / 数据浮层。

> **关键设计变化**：旧版 outline 把 article 补放在**每个 step**下。
> 这导致 chapter agent 机械地给每步右下角都挂 mono 角标 → 装饰过度。
> 新版降级为**章节级信息池** —— agent 在该章实现时根据每步是否真的
> 需要才挂，**不是每步必挂**。

#### 信息池条目格式

```
- <类型>：<具体内容> —— <来源 article §X / Lxx 或简注>
```

> **没 article（用户直接给 script）**：信息池退化为"主动设计画面信息
> 密度"——靠数字 / 对比 / 元数据等让画面比口播信息密。可以列"画面
> 装饰元素池"而非"article 抽取池"。

### Step 列表：每步 **1 行**

```
- step N (~Ts) — [关系名前缀（可选）]：<屏幕内容>
```

| 规则 | 原因 |
|---|---|
| `step N` 1-indexed | agent 实现时 `if (step === N - 1) ...`（注意零基偏移） |
| **`(~Ts)`** 必填 | 按 script.md 本步对应口播段字数 ÷ 4 估算（中文 ~ 4 字/秒）。范围 3~10s |
| **关系名前缀**（可选） | 让 chapter agent 知道这步内容的"语义类型"，在 CHAPTER-CRAFT.md 决策树里查推荐动作。屏幕内容里"动作 / 关系"明显时可以省略 |
| **屏幕内容** | 一句话讲清楚这一步舞台上有什么：hero / 标语 / 数据 / 装饰元素。**≤ 1 行**，再多就该拆 step |
| **不写动画** | 写死 = 翻译机化（详见本文件顶部框） |
| **不写时长数值 / 错峰量** | 这些在章节开发阶段决定 |
| **不写实现手段** | filter / SVG / Canvas 选型留给 chapter agent |

### 关系名前缀清单（**可选 hint**）

chapter agent 看到关系名前缀，会回 [`CHAPTER-CRAFT.md`](CHAPTER-CRAFT.md)
Part 1「关系→动作决策树」查推荐动作类型。

| 关系名 | 例 | 触发的 chapter 动作类型 |
|---|---|---|
| **反差对照** | 70% vs 95% / before vs after / Prompt vs Context | wipe / 双数字 ticker / 左右镜像揭示 |
| **递进列表** | 1→2→3 / step1→step2→step3 | 节点依次点亮 / SVG path 接力 |
| **金句** | pull-quote / 一句重磅结论 | 衬线大字停留 / 引号 stroke + 整体 ken burns |
| **数字赛跑** | 多个数据比较 | 多 ticker 同时滚 + 横条 scaleX 同步 |
| **流程 / 流水线** | 6 层架构 / 5 步流程 | SVG 节点 + 连线 stroke-dashoffset |
| **否定 / 划掉** | "这不再是答案" | 红色横条 wipe / FAKE 印章 / brush stroke |
| **揭示 / 反转** | 隐藏内容露出 / 答案揭晓 | mask reveal / 聚光灯 / brand takeover |
| **桥接 / 转场** | A → B / 章节衔接 | 箭头 path stroke + 沿路 motion dot |
| **铺垫 / 旁白** | 一行陪衬 / 设问 | typewriter 慢速 / 整体 fade |
| **chip / 标识** | 章节小标 / section badge | 小标签 fade-up + 下划线 stroke |
| **品牌 / takeover** | "答案就是 X" / 巨字落下 | 字符 stagger 缩入 + accent 横条 |
| **总结 / 收束** | 一句结论 / 章末小结 | 主导动作慢落定 + 微微 ken burns（可选） |

> **没合适的关系名**：直接省略前缀，把内容描述清楚就行。chapter agent
> 在 [`CHAPTER-CRAFT.md`](CHAPTER-CRAFT.md) 的"开工 5 问"里会自己识别
> 内容关系。**不要**强行硬塞关系名。

### Step 描述抽象示例

**正例 1**（关系明确，关系名前缀帮 agent 选动作类型）：

```
- step 5 (~9s) — 反差对照：左侧 <70%（v1.x）/ 中线贯穿 / 右侧 95%+（v2.x），底部脚注「同样的模型 同样的提示词」
```

→ chapter agent 看到"反差对照"会回决策树查 → 推荐 wipe / 双数字 ticker
/ 左右镜像揭示。具体选哪个由 agent 在主题禁区内决定。

**正例 2**（无明确关系，纯 hero step，省略关系名）：

```
- step 1 (~5s) — 中央巨字 "HARNESS"，下方 small caps 副标 "ENGINEERING"，左下 mono cue "n. 缰绳·马具·约束装置"
```

→ 这是 takeover 类，chapter agent 在 [`CHAPTER-CRAFT.md`](CHAPTER-CRAFT.md)
（含原则 + 决策树 + 反 AI 味反模式）约束下自由设计字符入场效果。

**正例 3**（多元素 step，描述清晰但留实现空间）：

```
- step 3 (~7s) — 三个名词水平展开：Prompt → Context → Harness，每词下方 mono 标年份
```

→ 描述了"三个词水平展开"和"每词下方挂年份"。具体如何"展开"（依次
blur clear？还是 typewriter？还是 stagger 缩入？）由 chapter agent 决定。

**反例 1**（违反"outline 不写动画"）：

```
- step 5 — 反差画面
  · 动画：左 70% blur clear → 中线 stroke 描边 → 右 95%+ filter blur 转为 drop-shadow
  · 手段：filter blur transition + SVG stroke-dashoffset
```

→ ❌ 把 CSS 实现搬进 outline。chapter agent 会照搬，失去思考机会。
**移到章节开发阶段决定**。

**反例 2**（动画行写了具体时长 —— 不可接受）：

```
- step 1 (~6s) — hero 进场（blur clear ~2.5s + 副标错峰 0.5s）
```

→ ❌ 写死 ms 数字会让实现僵化。**outline 只写口播估时 (~Ts)，不写动画
时长**。

**反例 3**（屏幕内容太抽象）：

```
- step 1 (~6s) — 标题入场
```

→ ❌ 是什么标题？hero 文案是什么？信息池要不要挂角标？这种 step
chapter agent 不知道画什么，**一定做成 PPT**。

**反例 4**（多个想法塞同一 step）：

```
- step 1 (~6s) — hero 进场 + 三个特性 stagger + 数据浮出
```

→ ❌ 违反 [CHAPTER-CRAFT.md Part 0 原则 8](CHAPTER-CRAFT.md#8-多点内容必须逐个揭示绝不同时上)（多点逐个揭示）。每个并列项 1 step。

### 口播节选（每章末尾，可选但推荐）

精炼 1~3 句，**不是完整稿子**，仅供章节规划阶段对照"这章在讲什么"。
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
| 章节 CSS 类前缀 | 章节缩写（避免跨章冲突） | `.cd-` / `.wg-` / `.mg-` |
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

---

## 自检（写完 outline 必过）

- [ ] 每个 step 都是**单一句屏幕内容描述**，没有"动画"行 / "手段"行
- [ ] 没有任何 step 写了具体毫秒 / 秒数（除 `(~Ts)` 口播估时）
- [ ] 每章首段都有「信息池」block，至少 3 条 article 抽取项
- [ ] 章节切分符合"每章 3~8 步 / 30~60s 一聚焦主题"经验
- [ ] 末尾「素材清单」分章节列出，✓ / ⚠️ 标注清楚
- [ ] 关系名前缀（如有）来自上方清单，没造新词

写完看一眼：**outline 是不是干净到 chapter agent 看了能立刻开工 + 还有
设计空间**？是 = 合格。如果你看了都觉得"太空，agent 不知道动画选什么"
