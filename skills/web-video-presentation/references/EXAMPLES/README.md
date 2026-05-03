# EXAMPLES —— 完整章节 / 题材 anchor

> ## ⚠️ 这是**结构示意**，不是抄袭模板
>
> 这些 example **不是给你照抄的**。它们的角色是"看一个完整章节大概
> 什么形状、动画怎么分层、CSS 用了哪些 token、outline 长什么样"。
>
> **正确使用流程**：
>
> 1. 走完 [`../CHAPTER-CRAFT.md`](../CHAPTER-CRAFT.md) Part 0 五问
> 2. 实在卡壳"我这一章的整体结构应该是什么"才翻 EXAMPLES
> 3. **保留它的"形"**（step 切分逻辑、字号关系、布局原则），**按本
>    项目的主题 + 内容换动作选型**
>
> 倒过来——先翻 EXAMPLES 选一个照搬到底 = [`../CHAPTER-CRAFT.md`](../CHAPTER-CRAFT.md)
> Part 5 第 8 条「整章只用一种入场动画」同质化反模式（每个用户的视频
> 看起来像同一个模板的 N 个变奏）。

两类参考资源，让 agent 在写章节时**有具体形状可参考**，不用从零设计。

> **不是必须按这个写**。卡壳时翻一翻；用力发挥时大胆偏离。

## 目录

### A. 章节结构 anchor（与题材无关）

| 例子 | 适用场景 | 文件 |
|---|---|---|
| [`hook-chapter/`](hook-chapter/) | **钩子型开场** —— 多张图片逐张揭示后 hero takeover | `chapter.tsx` + `chapter.css` |
| [`list-reveal/`](list-reveal/) | **列举型** —— 口播说"三件事 / N 个特性"，每项 1 step | `chapter.tsx` + `chapter.css` |

每个 example 都是**完整章节**：**内容驱动主导动作** + 必要的伴随动作
（**不强求挂持续微动**，按 [`../CHAPTER-CRAFT.md`](../CHAPTER-CRAFT.md)
Part 0 原则 7 节制使用）、真素材（不是占位卡）、字号狠对比、绑了
`newsroom` 主题作为示范。

### B. 题材 case anchor（与题材相关）

| 例子 | 题材 | 文件 |
|---|---|---|
| [`case-tech-review/`](case-tech-review/) | 科技测评 / 实测对比 / 跑分类视频 | README + outline 节选 |

> 题材 case 展示**真实 outline 的样子**（含 article 补字段如何填、
> 章节切分如何决策）。拿到与某个 case 题材相似的需求时，先翻它再
> 写自己的 outline。

## 怎么用

### 写章节卡壳时

1. 看哪个 anchor 跟你这一章**结构最像**（钩子型 vs 列举型 vs 其它）
2. 翻 `README.md` 看这个例子的设计思路 + 节奏
3. 翻 `chapter.tsx` 看实现：JSX 结构、`step` 切分、用了哪些组件 / 类名
4. 翻 `chapter.css` 看动画用了哪些 keyframes、token、`infinite` 持续
   微动写在哪
5. 写自己这一章时**保留 anchor 的"形"，按本章内容 + 本主题气质换动画选型**

### 切换主题时

每个 example 的 README 末尾有"切到其它主题怎么换"的提示 —— 通常只需要
**换主导动作的形式**（newsroom 印章砸下 → terminal 打字机 → chalk
粉笔自绘），**结构、step 切分、字号关系不动**。

---

## ⚠️ 这两个 anchor 是"地板"，不是"天花板"

这两个例子已经引入印章砸下、stagger、accent 红条 —— 但**仍然是相对克
制的版本**。**鼓励你做得更狂、更"视频感"**：

### 进阶玩法（任选搭配）

| 维度 | 这俩 anchor 给的（地板） | 可以升级到（无上限） |
|---|---|---|
| 背景层 | 纯色 surface | + SVG turbulence filter 纸纹永不停斜向漂移 |
| 主导动作 | mask reveal + 印章砸下 | + Canvas 粒子从屏幕外汇聚成 hero 字 |
| 伴随动作 | accent 红条 scaleX | + SVG path stroke-dashoffset 自绘下划线 / 装饰花纹 |
| 持续微动 | accent 光晕呼吸 | + 多层粒子漂移 / scanline / ken burns 缓推 |
| 数字 hero | 直接显示 | + JS 数字滚动（`requestAnimationFrame` + easeOutQuart） |
| 流程 / 架构 | 仅文字列 | + SVG path 自绘流程图（每条线 stroke-dashoffset 错峰） |
| 对比图 | 两段文字 | + SVG 双柱图自绘 + 差值数字滚动 |
| 转场 | 章节边界硬切 | + clip-path inset 横向擦除转场 |

→ 详细工具箱见 [`../CHAPTER-CRAFT.md`](../CHAPTER-CRAFT.md) Part 2
"视觉手段全栈工具箱"（CSS / SVG / Canvas / JS 四层）。

### 实测原则

写章节时，**先实现 anchor 同等的地板版本**（按 [`../CHAPTER-CRAFT.md`](../CHAPTER-CRAFT.md)
Part 0 五问选好主导动作），跑起来确认气质对，**再决定要不要加伴随
动作 / 持续微动**。

**判断标准**：
- 如果不同 step 的主导动作够多样（PPT 警报通过 [`../CHAPTER-CRAFT.md`](../CHAPTER-CRAFT.md)
  Part 0 原则 7 自检）= 不需要再加持续微动
- 如果整章主导动作太单一 = 不要靠"加持续微动"补救，**回 [`../CHAPTER-CRAFT.md`](../CHAPTER-CRAFT.md)
  Part 1 五问换主导动作**才是正解（参 Part 5 第 8 条「整章只用一种入场动画」）

## 不在 EXAMPLES 里出现的章节类型

- **数字型 hero**（"+47%"  → "几乎快了一倍"）
- **对比型**（前后对照 / 双柱图）
- **链接卡片收尾**

这些场景的视觉原语已经在 [`../CHAPTER-CRAFT.md`](../CHAPTER-CRAFT.md)
Part 3 视觉工具箱（CSS / SVG / Canvas / JS 全栈）里覆盖了；按 anchor
的"形"组合即可。
