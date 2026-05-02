---
name: web-video-presentation
description: 把一篇文章或口播稿，做成"看起来像视频"的点击驱动 16:9 网页演示，可选合成口播音频。完整流程包含：原始文章 → B 站风格口播稿 → 章节规划 → 用户确认（选主题 / 选开发模式）→ 网页开发（增量或一次性）→ 可选音频合成（默认 MiniMax CLI mmx-cli）。每次点击推进口播稿的一个节拍，每一步独占整屏，进度条平时隐藏只在悬浮时出现。适用场景：用网页做视频（动态 PPT 但不像 PPT）、把口播稿 / 文章变成可交互的解说、为 B 站 / YouTube / 视频号录屏教程、做有电影感的产品 / talk demo。本 Skill 沉淀的是设计方法论 + 协作流程 —— 不绑定任何特定样式 / 字体 / 颜色 —— 因此能复用到任意主题与美学。
---

# Web Video Presentation

把一篇文章或口播稿，一步步做成可录屏的"伪装成网页的视频"，可选合成
口播音频。产出物 = Vite + React + TS 项目 + 按章节切分的音频。

**对话式协作流程**：分 4 阶段，阶段之间有**必须停下来的 checkpoint**。
agent 不能一头扎到底，关键节点必须等用户对齐再推进。

## 适用场景

- "我有口播稿 / 一篇文章，帮我做成视频" —— 口播驱动的内容
- 想做"动态 PPT，但不要像 PPT"
- 16:9 横屏录屏，大字、留白、每屏都要有动效
- 教学 / 产品演示 / keynote 想要电影感
- B 站 / YouTube / 视频号录屏类内容

本 Skill **以方法论 + 协作流程为核心**。脚手架模板提供 token 和原语，
但每个美学决策（配色、字型、动效气质）都应该针对你的主题重新设计 ——
不要照搬。

---

## 工作流总览

```
Phase 1.1  识别用户输入
Phase 1.2  文章 → 口播稿（如果用户给的是文章）
   ▼
[Checkpoint A1]           ←  必须停。稿子 + 选主题 + 素材清单
   ▼
Phase 1.3  口播稿 + 文章 → outline.md（动画选型扣所选主题气质）
   ▼
[Checkpoint A2]           ←  必须停。outline 对齐 + 选开发模式
   ▼
Phase 2  网页开发         按所选模式推进（增量 / 一次性）
   ▼
[Checkpoint B]            ←  必须停。问是否合成音频
   ▼
Phase 3  音频合成（可选）  按 step 切分，默认 MiniMax CLI（mmx-cli）
   ▼
Phase 4  录屏 + 后期      参考 references/RECORDING.md
```

> **为什么把内容阶段切成两个 checkpoint**：outline 里每步动画选型
> **强依赖主题的 `motionHints`**。先选主题再写 outline，动画选型可以
> 直接锁死气质；倒过来 outline 在前主题在后，动画描述只能写得很"通
> 用"，开发阶段又得大量返工。

工作目录约定（agent 在用户当前目录下创建 / 编辑）：

```
my-video/
├── article.md          # 用户给原文时必有 —— 不删！开发阶段画面信息源
├── script.md           # 必有：B 站风格口播稿（决定节拍）
├── outline.md          # 必有：章节规划（决定 step / 动画 / 画面）
└── presentation/       # 脚手架产出的 Vite + React + TS 项目
    └── public/audio/   # 可选：合成的音频
```

> **`article.md` 不是临时文件**。它是后续 outline 写动画 / 章节代码
> 实现画面时的**画面信息密度来源**（详见 PRINCIPLES.md 原则 10「双源
> 原则」）。

---

## 各阶段文件读取指南

不同阶段读不同的文件。**长会话里 agent 容易遗忘原则**，特别是
Phase 2.4 的"实现单章"会重复 N 次 —— 每次都要回看核心约束。

| 阶段 | 必读（每次都看） | 一次性看完 / 按需查 |
|---|---|---|
| Phase 1.2 文章 → 口播稿 | `references/SCRIPT-STYLE.md` + `article.md`（用户原文） | —— |
| **Checkpoint A1 选主题** | —— | `themes/*/theme.json`（动态读全部，列清单 + `bestFor` 推荐 + `motionHints`）；`references/THEMES.md`（用户想了解主题系统时） |
| **Phase 1.3 写 outline** | `script.md` + `article.md` 全文 + `references/OUTLINE-FORMAT.md` + 选定主题的 `themes/<id>/theme.json` | —— |
| Checkpoint A2 / Phase 2.1-2.3 | —— | SKILL.md 本节看一次 |
| **Phase 2.4 实现单章（×N 次）** | **`references/PRINCIPLES.md`**（十条原则）+ **`references/CHAPTER-CRAFT.md`**（代码硬规则 + 视觉法则 + checklist）+ 当前主题的 `themes/<id>/theme.json` + 当前章节的 outline.md 段落 + **`article.md` 本章对应段落** + 素材清单 | `references/EXAMPLES/`（卡壳时翻 anchor）；`references/THEMES.md` 完整 token 契约 |
| Phase 3 音频合成 | `references/AUDIO.md` | —— |
| Phase 4 录屏 + 后期 | `references/RECORDING.md` | —— |
| 选 / 造 / 切主题 | —— | `references/THEMES.md` |
| 卡壳找视觉灵感 | —— | `references/PATTERNS.md` **完全可选**，不需要从中选 |

> **写章节时主要看 `CHAPTER-CRAFT.md`，原则速查回 `PRINCIPLES.md`**。
> 不要去翻 THEMES.md 找 token —— CHAPTER-CRAFT.md Part 1 抄了精简版。

---

## Phase 1 —— 内容编写

> Phase 1 切成 **三步 + 两个 checkpoint**：1.1 / 1.2 → **A1**（稿子 +
> 主题 + 素材） → 1.3 → **A2**（outline + 模式）。

### 1.1 识别用户输入

| 用户给的东西 | 该做的 |
|---|---|
| 原始文章（书面语 / 公众号 / 论文 / 博客） | 先转口播稿（1.2），过 A1，再生成 outline（1.3），过 A2 |
| 直接的口播稿 / 视频脚本 | 落盘成 `script.md`，**直接进 A1**，过 1.3，过 A2 |
| 啥都没有，只说"帮我做个 X 主题的视频" | **反问**：先给一段素材或大纲。Skill 不替用户构思内容 |

### 1.2 文章 → 口播稿

按 [`references/SCRIPT-STYLE.md`](references/SCRIPT-STYLE.md) 的规则
转写。落盘到 `script.md`，**原文保留为 `article.md`**（千万别删 ——
开发阶段画面密度要靠它，详见原则 10）。

落盘后**进入 Checkpoint A1**。

---

## Checkpoint A1 —— 稿子 + 主题 + 素材（**硬节点**）

`script.md` 写完后必须停下来。**outline 还没生成**，因为 outline 里
的动画选型要等主题定了才能锁死气质。

> **agent 此时要做的预备工作**：
> 1. 读所有 `themes/*/theme.json` 拿 `nameZh` / `descriptionZh` /
>    `bestFor` / `motionHints` —— **不要硬编码清单**
> 2. 根据 `script.md` 的内容类型 / 关键词 / 语气，**主动**从主题里
>    挑 2~3 套**最匹配的推荐**（匹配 `bestFor` 字段）
> 3. 扫一遍 `script.md` 估算粗略素材清单（精确版到 A2 再给）

### 总结模板（骨架，agent 按情况填充）

```
口播稿写完，产出文件：article.md（如有）+ script.md（{X} 字 / ~{T} 分钟）。

按 `---` 切的节拍块速览：
  • <节拍 1 主题>
  • <节拍 2 主题>
  • ...

接下来对齐 3 件事（outline 等你选完主题再写，动画选型要扣主题气质）：

  1. 稿子要不要改？（直接改 script.md 或口头告诉我）
  2. 选哪个主题？我的推荐：
     ★ <推荐 1：nameZh (id)> — 因为 <bestFor 命中>；motionHints: <摘要>
     ★ <推荐 2 / 推荐 3 同上>
     其它可选：<剩余主题，nameZh + 一句话>
     也可以让我帮你做新主题。
  3. 真素材怎么准备？粗看本视频要的图：<列粗略清单>
     a) 我从 <现有素材路径> 帮你挑   b) 你自己提供   c) 全部 placeholder
```

收到反馈后：
- 稿子要改：直接编辑文件，编辑完 ping 一次
- **主题选定**：记录下来，1.3 写 outline 时打开对应 `theme.json`
- 素材选定：开发阶段按这个策略走

**主题必须明确**才进入 1.3。用户说"主题你帮我选" → 取你推荐的第 1 个，
**告诉用户你选了什么、为什么**，给个反悔机会。

---

### 1.3 口播稿 + 文章 → outline.md

> **前置条件**：A1 已选定主题。**没有主题就不要写 outline**。
> **同时打开** `script.md` 和 `article.md`（如有）—— 双源对照写
> （原则 10）。

**双源工作法**（核心）：

| 源 | 用来决定 |
|---|---|
| `script.md` | 节拍切分（`---` 切节拍）/ 估时 / hero 标语 |
| `article.md` | 每个 step 的**画面信息密度**：数字 / 引用 / 对比 / 案例细节 / 图表数据点 |

> 每个 step 的画面要**比口播节选信息密**。如果画面只是把口播搬到屏幕
> 上 → 信息密度 = 0 → PPT 警报，重新去 article 抽细节挂上去。

**写每个 step 的动画描述时**，打开 `themes/<id>/theme.json` 看
`motionHints` —— 所有动作选型必须扣这条线（见 OUTLINE-FORMAT.md 的
「写动画的核心心法」节）。

通读 `script.md` → 按 `---` 切节拍 → 切分章节（每章 3~8 step，可被
慢节奏主题覆盖）→ **对每个 step 翻 article 抽信息点** → 按
[`references/OUTLINE-FORMAT.md`](references/OUTLINE-FORMAT.md) spec
落盘到 `outline.md`。

**outline 阶段就要规划动画**，每个 step 必须写：
1. 屏幕内容
2. 动画描述（主导 + 伴随 + 持续微动，扣主题 motionHints）
3. 实现手段（SVG / Canvas / filter / 自绘 ...）
4. article 补（双源原则 —— 从原文抽来的具体细节）

末尾列**精确素材清单**。详见 OUTLINE-FORMAT.md。

落盘后**进入 Checkpoint A2**。

---

## Checkpoint A2 —— outline + 开发模式（**硬节点**）

outline 写完后必须停下来，让用户**精读 outline 是否扣住主题气质 +
节奏 + 章节切分**，再选开发模式。

### 总结模板

```
outline 写完了，基于主题 <theme nameZh>：

  📄 outline.md     {N} 章 / {M} 步 + 精确素材清单

章节速览：
  1. <id>     <章节标题>    <S> 步 ~<T>s
  2. ...

接下来对齐 2 件事：

  1. outline 要不要改？重点看：
     - 每步 3 行（屏幕内容 + 动画 + 手段）+ article 补
       的动画选型是否扣 <theme> 的 motionHints
     - 章节切分 / step 数 / 估时是否合理
     - 末尾素材清单是否完整
     可以直接编辑 outline.md，或口头告诉我。

  2. 开发模式选哪个？
     每章 = 完整版本一次到位（节奏 + 视觉 + 真素材 + 3 层动作齐全）。
     第 1 章是后续章节的视觉锚点。

     A) 增量：每章做完都暂停验收。**推荐** —— 风险可控
     B) 一次性：第 1 章做完暂停（样板对齐）→ 剩余章节一起做完再统一对齐
```

收到反馈后：outline 要改 → 编辑文件再 ping；模式选定 → 进 Phase 2。

---

## Phase 2 —— 网页开发

### 2.1 脚手架

```bash
bash .cursor/skills/web-video-presentation/scripts/scaffold.sh \
  ./presentation \
  --theme=<用户选的主题 id>

bash .cursor/skills/web-video-presentation/scripts/scaffold.sh --list-themes
```

> 自定义主题 → 先按 [`references/THEMES.md`](references/THEMES.md)
> "创作新主题"流程做一个 `themes/<my-theme>/`，再 `--theme=<my-theme>`。

### 2.2 删除示例章节

脚手架带一个 `01-example` demo。在写第一章真实内容前**删掉**：

```bash
rm -rf presentation/src/chapters/01-example
```

并把 `presentation/src/registry/chapters.ts` 里 `EXAMPLE_CHAPTER`
的 import 和数组项移除。

### 2.3 按所选模式推进

**核心**：每章 = 完整版本一次到位（节奏 + 视觉 + 真素材 + 3 层动作
全部到位）。**没有"骨架版"概念** —— 第一章就要做出**用户能直接验收
并作为后续锚点**的样板。

#### 增量模式（默认推荐）

1. 实现第 1 章 = 完整版本 → 暂停 → 用户在 localhost 验收**节奏 +
   视觉气质**（这一步对齐量最大，第 1 章是后续所有章的视觉锚点）
2. 用户 OK → 实现第 2 章 = 完整版本 → 暂停 → 验收
3. 重复直到所有章完成
4. Checkpoint B

#### 一次性模式

1. 实现第 1 章（样板）→ 暂停 → 对齐节奏 + 视觉气质
2. 用户 OK → 一次性实现剩余所有章节 → 暂停 → 整体对齐
3. Checkpoint B（只对齐 2 次）

> **为什么不分骨架 / 精修两步**：骨架版根本看不出节奏对不对（画面是
> 死的），用户也不知道视觉气质走哪个方向。第一章一次到位反而更清晰。
> 代价是第 1 章会写得稍久 —— 值得。

### 2.4 实现单章

详细流程见 [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md)
（开工 checklist + 视觉法则 + 完工自检 + 反馈速查）。

**简版要点**：

1. 走 CHAPTER-CRAFT.md 开工 checklist（重读 PRINCIPLES.md）
2. 抄 outline.md 中本章 step 清单 + 翻 article 本章段抽信息点
3. 核对真素材是否到位；缺的用 `[image: 16:9 描述]` 占位卡
4. 按当前主题 `theme.json` 的 `motionHints` / `motionDuration` /
   `typeScale` 选动画与字号
5. **每步 3 层动作齐全**（主导 + 伴随 + 持续微动 —— 缺哪个都是 PPT，
   见 PRINCIPLES.md 原则 7）
6. CSS 100% 用语义 token；`if (step === N) return <SceneN />`，
   `key={step}` 重挂动画
7. 在 `src/registry/chapters.ts` 注册章节
8. 跑 `npm run dev` 浏览器点一遍，做完工自检
9. 暂停 → 让用户在 localhost 验收

### 2.5 大改后 bump STORAGE_KEY

改动 `chapters.ts`（增加 / 删除 / 重排章节，或某章 totalSteps 变化）
后，**bump** `presentation/src/hooks/useStepper.ts` 的 `STORAGE_KEY`
（如 `v3` → `v4`），避免持久化游标落到不存在的 step 上。

---

## Checkpoint B —— 是否合成音频（**硬节点**）

Phase 2 结束后必须停下来，问用户：

```
网页做完，{N} 章 {M} 步，dev server 在 localhost:5173 跑着。

要不要把口播稿合成音频？
  ✓ 合成 → 我会按 outline.md 切分，每步一个 mp3 到 public/audio/。
           默认 MiniMax CLI（mmx-cli）；本机没装会问你用什么 TTS。
  ✗ 不合成 → 流程结束，后期你自己配音 / 用别的工具。
```

要合成 → Phase 3。不合成 → 进入 Phase 4 录屏指引。

---

## Phase 3 —— 音频合成（可选）

详见 [`references/AUDIO.md`](references/AUDIO.md)（MiniMax CLI 检测 /
调用、按 step 切分、用户自带 TTS 退化路径、故障排查）。

合成完后告诉用户：输出位置 / 总时长 / 哪些 step 稿子可能太长太短 ——
给最后一次校准节奏的机会。然后进入 Phase 4。

---

## Phase 4 —— 录屏 + 后期

完整自动化合成 mp4 当前未实现，标作 roadmap。手动录屏 + 后期对音频
的标准路径详见 [`references/RECORDING.md`](references/RECORDING.md)。

> agent 应主动告诉用户这条路径，让用户知道下一步怎么把网页变成 mp4。

---

## 十条原则（一句话清单）

完整展开见 [`references/PRINCIPLES.md`](references/PRINCIPLES.md) ——
**写章节时回那里查**，下面只是索引。

| # | 原则 | 一句话 |
|---|---|---|
| 1 | 16:9 固定舞台 | 内容 1920×1080 + transform scale，没有响应式 |
| 2 | 全局 step 计数器 | 章节是 step 的纯函数，无定时器 |
| 3 | 每步独占整屏 | `if (step === N) return <FullScene />` |
| 4 | 口播节拍 = step | 一节拍 = 一 step = 一聚焦想法 |
| 5 | 隐藏的边角控件 | 进度条 / 翻页器默认 opacity 0 |
| 6 | 舞台无 chrome | 没有 header / footer / 页码 / 品牌条 |
| 7 | 每步 3 层动作 | 主导 + 伴随 + **持续微动**，缺哪层都是 PPT |
| 8 | 多点逐个揭示 | 1 项 = 1 step，禁同步 stagger 上 N 项 |
| 9 | 整片同一主题 | 章节间不翻表面色；CSS 全 token |
| 10 | 双源原则 | script 定节拍，**article 定画面密度** |

---

## 常见用户反馈速查

简化表见 [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md)
Part 6「常见反馈速查」。**关键**：先定位是哪一层（节奏 / 视觉 / 内容
/ 代码），再改最小切片，**不要重做整章**。

---

## 相关资源

按"何时读"标注，避免一次性全读：

| 文件 | 何时读 | 内容 |
|---|---|---|
| [`references/PRINCIPLES.md`](references/PRINCIPLES.md) | **十条原则唯一展开点**，章节开发时查 | 完整十条原则 + 派生约束 |
| [`references/SCRIPT-STYLE.md`](references/SCRIPT-STYLE.md) | Phase 1.2 必读 | 文章 → 口播稿规则、平台变体 |
| [`references/OUTLINE-FORMAT.md`](references/OUTLINE-FORMAT.md) | Phase 1.3 必读 | outline.md 字段 spec、命名约定、章节切分 |
| [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) | Phase 2.4 每章必读 | 代码硬规则、视觉法则、token 速查、checklist、反馈速查 |
| [`references/EXAMPLES/`](references/EXAMPLES/) | Phase 2.4 卡壳时翻 | 章节 anchor（hook 钩子型 / list 列举型）+ 题材 case（科技测评） |
| [`references/THEMES.md`](references/THEMES.md) | 选 / 造 / 切主题时 | 完整 token 契约 + 内置主题清单 + 创作流程 |
| [`references/AUDIO.md`](references/AUDIO.md) | Phase 3 才读 | MiniMax CLI、TTS 退化路径、故障排查 |
| [`references/RECORDING.md`](references/RECORDING.md) | Phase 4 才读 | 录屏工具 + 后期合成 |
| [`references/PATTERNS.md`](references/PATTERNS.md) | 可选灵感库 | 11 个常用视觉原语，**不是必选清单** |
| [`themes/`](themes) | A1 / 1.3 时翻 | 内置主题（每个含 `theme.json` + `tokens.css`） |
| [`scripts/scaffold.sh`](scripts/scaffold.sh) | Phase 2.1 跑一次 | 一键项目脚手架 |
