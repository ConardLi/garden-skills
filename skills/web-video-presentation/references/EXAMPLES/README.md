# EXAMPLES —— 完整章节 / 题材 anchor

两类参考资源，让 agent 在写章节时**有具体形状可抄**，不用从零设计。

> **不是必须按这个写**。是给你看"一个完整章节大概什么形状、动画怎么
> 分层、CSS 用了哪些 token"，以及"特定题材的 outline 长什么样"。卡壳
> 时翻一翻；用力发挥时大胆偏离。

## 目录

### A. 章节结构 anchor（与题材无关）

| 例子 | 适用场景 | 文件 |
|---|---|---|
| [`hook-chapter/`](hook-chapter/) | **钩子型开场** —— 多张图片逐张揭示后 hero takeover | `chapter.tsx` + `chapter.css` |
| [`list-reveal/`](list-reveal/) | **列举型** —— 口播说"三件事 / N 个特性"，每项 1 step | `chapter.tsx` + `chapter.css` |

每个 example 都是**完整章节**：3 层动作齐全（主导 + 伴随 + 持续微动）、
真素材（不是占位卡）、字号狠对比、绑了 `newsroom` 主题作为示范。

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
5. 写自己这一章时**保留 anchor 的"形"，按本主题 motionHints 换动画选型**

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

写章节时，**先实现 anchor 同等的地板版本**（3 层动作齐全），跑起来确
认气质对，**再加进阶动画层**，每加一层在浏览器盯 5 秒 —— **静止 = PPT
警报**，立刻补持续微动。

## 不在 EXAMPLES 里出现的章节类型

- **数字型 hero**（"+47%"  → "几乎快了一倍"）
- **对比型**（前后对照 / 双柱图）
- **链接卡片收尾**

这些 PATTERNS.md 已经覆盖了原语；按 anchor 的"形"组合即可。
