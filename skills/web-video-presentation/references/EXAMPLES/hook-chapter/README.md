# Anchor: hook-chapter（钩子型开场）

> ⚠️ **这是结构示意，不是抄袭模板**。先走 [`../../CHAPTER-CRAFT.md`](../../CHAPTER-CRAFT.md)
> Part 0 五问。本 anchor 给的是"钩子型开场的结构骨架"——你要保留它的
> step 切分逻辑、字号关系、布局原则，**按本项目的主题 + 内容换动作
> 选型**。倒过来照抄 = [`../../CHAPTER-CRAFT.md`](../../CHAPTER-CRAFT.md)
> Part 5 第 8 条「整章只用一种入场动画」同质化反模式。

## 定位

视频开头最常用的章节类型：**抛 N 张可疑图 / 反例 / 截图 → 引出主题 →
切大字 hero takeover**。

## 适用场景

- 悬念型开头：先甩 3~4 张让人怀疑 / 困惑的图，再揭示原因
- "今天聊聊 X 的几个翻车现场"：先看翻车，再切主题
- 产品发布的"问题感"开场：先看痛点截图，再揭示新功能

## 假设的 outline.md 章节段（抽象）

```markdown
## 2. hook — <章节标题>（6 steps）

- **step 1** (~4s) — N 张可疑图片占位（虚线 ghost 卡片）
- **step 2** (~5s) — 第 1 张露出：<反例 1 描述>（独占视觉）
- **step 3** (~5s) — 第 2 张露出：<反例 2 描述>（独占视觉）
- **step 4** (~5s) — 第 3 张露出：<反例 3 描述>（独占视觉）
- **step 5** (~4s) — 三张图同时缩入侧栏，中间出 <主题大字> takeover
- **step 6** (~3s) — 切到下一句钩子（被 brush 划掉）
```

## 关键节奏决策

| step | 节奏意图 | 视觉 |
|---|---|---|
| 1 | 抛悬念 —— N 张未知 | 虚线 ghost 卡片，1/3 屏一张 |
| 2-N | **每张图独占视觉** —— 重点不是"凑数"，是让观众盯着每张图想"这是真的吗" | 大图占据 ~70% 屏幕，旁边小字标注图源 |
| N+1 | takeover —— 揭示主题 | 三张缩成左侧迷你卡，中间巨字 |
| 末 | 钩子收束 | brush 划掉旧概念，引下一章 |

## 为什么 2-N 不能 stagger 同时上

口播会**逐个念出来** —— 必须 1 项 = 1 step（[CHAPTER-CRAFT.md Part 0 原则 8](../../CHAPTER-CRAFT.md#8-多点内容必须逐个揭示绝不同时上)）。
同时 stagger 上 = 观众扫一眼看完，讲者还在念第一张 = PPT 直觉。

## 文件结构

```
hook-chapter/
├── README.md       ← 本文件
├── chapter.tsx     ← 完整章节示例 —— 默认绑 newsroom 主题
└── chapter.css
```

## 关键手段（地板线）

| 维度 | 这个 anchor 怎么实现 |
|---|---|
| 素材 | `<img src="/hook/<asset>.png" />` 真截图 |
| 字号 | hero = 144px serif (`var(--t-display-1)`) |
| 主导动作 | brush-stroke + 印章砸下（newsroom 气质） |
| 伴随动作 | accent 红条 scaleX + 副标 stagger 200ms |
| 持续微动 | accent 红条光晕 `infinite` 呼吸；图片 ken burns 缓推 |
| 卡片样式 | drop-shadow + 微旋转 1deg |
| takeover | 三张图缩入 + hero 巨字爆出 + accent 红条贯穿 |

> **新写章节时**：抄结构和字号关系，按本章内容 + 本主题气质自由
> 设计动画形式。**持续微动按需挂**，不强求 —— 详见
> [`../../CHAPTER-CRAFT.md`](../../CHAPTER-CRAFT.md)「避免 AI 味」一节
> 关于「每步都挂 ken burns / 持续闪烁」的反模式。

## 切到其它主题时

- `bauhaus-bold` → brush 划掉换 hard-cut 大色块；hero 字体换 Archivo Black
- `terminal-green` → 三张图换"FILE_001/002/003"占位框；hero 用打字机
- `chalk-garden` → 粉笔感虚线 + 慢速 wiggle 入场
- `midnight-press` → blur clear 慢镜入场 + ken burns + scanline；
  takeover 改"主标 blur 锐化 + 暖橙光晕呼吸"

**结构（N+2 步、独占节奏、takeover、收束）保持不变。**

## 想看具象题材应用

- 科技测评 / 实测对比类视频用这个 anchor 开场长什么样 →
  [`../case-tech-review/`](../case-tech-review/)
