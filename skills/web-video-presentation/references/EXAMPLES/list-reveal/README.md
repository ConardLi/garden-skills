# Anchor: list-reveal（列举型逐个揭示）

> ⚠️ **这是结构示意，不是抄袭模板**。先走 [`../../CHAPTER-CRAFT.md`](../../CHAPTER-CRAFT.md)
> Part 0 五问。本 anchor 给的是"列举型章节的结构骨架"（单网格 N 槽位 +
> 每 step 只填一个槽位 + 位置不重排）——保留这个**结构**，**按本项目的
> 主题 + 内容换动作选型**。倒过来照抄 = [`../../CHAPTER-CRAFT.md`](../../CHAPTER-CRAFT.md)
> Part 5 第 8 条「整章只用一种入场动画」同质化反模式。

## 定位

口播说"三件事 / 四个原因 / N 个特性"时，**每项 1 step 逐个揭示**。
视频中段最常用的章节类型，**最容易翻车成 PPT** —— 这是为什么需要 anchor。

## 适用场景

- "<主体> 强在哪 → 三件事"
- "选购 <X> → 四个角度"
- "为什么我喜欢 <X> → 五个理由"
- 任何"主题 + N 个并列子项"的结构

## 假设的 outline.md 章节段（抽象）

```markdown
## 4. <chapter-id> — <主题 N 件事>（N+1 steps）

- **step 1** (~3s) — masthead 引子"<N 件事>"
- **step 2** (~6s) — 第 1 件：<标题> + <article 抽来的细节>
- **step 3** (~6s) — 第 2 件：<标题>
- ...
- **step N+1** (~6s) — 第 N 件：<标题>
```

## 关键节奏决策

| step | 视觉布局 |
|---|---|
| 1 | 中心引子大字 + 序号 01/02/.../N 占位（**不显示内容**，纯占位） |
| 2 | "01" 槽位填充：标题 + 简短说明 + accent 编号；其余仍是 ghost |
| 3 | "02" 填充；01 已激活变次级；其余仍 ghost |
| ... | 当前槽位填充；之前的激活降级；之后的 ghost |

## CHAPTER-CRAFT.md Part 0 原则 8 的核心实现

> "布局不重排，只是单元格内容变化"

整个章节只有**一个网格布局**，N 个槽位的 React 节点位置完全不变。
变的只是每个槽位的内容状态（ghost / active / past）。这样：
- 单元格不会重排 → 视觉稳
- 每点一次只有"一个槽位变化" → 观众视线明确锁定新揭示的项

**反模式**：每点一次重新渲染整个布局 → 已揭示的项也跟着抖动 / 重新
入场 → 观众不知道该看哪。

## 文件结构

```
list-reveal/
├── README.md
├── chapter.tsx     ← 完整章节示例 —— 默认绑 newsroom 主题
└── chapter.css
```

## 关键手段（地板线）

| 维度 | 这个 anchor 怎么实现 |
|---|---|
| 字号 | 标题 64px / 巨号 144px serif |
| 槽位状态 | dashed → 巨号红色高亮 → 灰化数字（**位置不重排**） |
| 序号 | hero-num 字体（衬线大数字） |
| 主导动作 | mask reveal（标题）+ 数字砸下（accent 红） |
| 伴随动作 | 副标 stagger 200ms + accent 横线 scaleX |
| 持续微动 | active 槽位的数字 accent 光晕 `infinite` 呼吸 |
| 引子 | masthead 双线规则 + serif 大字 |

> **新写章节时**：抄结构（单网格 N 槽位、每 step 只填一个槽位、位置
> 不重排），按本章内容 + 本主题气质自由设计主导动作的形式。

## 切到其它主题时

- `bauhaus-bold` → 序号换 Archivo Black + 大色块；用 hard-cut 砸下
- `terminal-green` → 序号 `[01]` `[02]` `[03]` 风格；打字机入场
- `chalk-garden` → 粉笔下划线手绘 + wiggle 入场
- `midnight-press` → 数字 blur clear 慢锐化 + 暖橙光晕慢呼吸

**结构不变**：N+1 step、单网格 N 槽位、每 step 只填一个槽位。

## 想看具象题材应用

- 科技测评 / 实测对比类视频用这个 anchor 长什么样 →
  [`../case-tech-review/outline-snippet.md`](../case-tech-review/outline-snippet.md)
  里 `## 2. why-strong` 章节
