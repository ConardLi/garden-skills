# Patterns —— 视觉灵感库（**完全可选**）

> ⚠️ **这是灵感参考，不是限制清单。**
>
> 写章节时的正确顺序是：
> 1. 先看口播稿 + outline，问"这一刻要表达什么情绪 / 信息？"
> 2. 根据**主题气质**（杂志？终端？黑板？keynote？）和**节奏**自由
>    设计动画 —— 你不需要先来这里翻菜单
> 3. 卡壳时再到这里翻翻有没有现成原语能直接用 / 改一下用
> 4. 没合适的就**大胆发明新的** —— 只要符合 SKILL.md 的十条原则就好
>
> 鼓励 Agent 根据具体场景**创造**视觉表达。下面 11 个只是用得多的
> 备选，不是必须从中选。

每条只讲三件事：**它是什么 / 关键技术 / 常见陷阱**。具体怎么写代码
按上下文自由发挥，`templates/` 已经把 token / keyframes / 布局原语
备齐了。

> 写章节 CSS 时**永远引用主题 token**（`--accent`、`--text-mute`、
> `--ease-quart` ...），别写死颜色。完整 token 契约见
> [`THEMES.md`](THEMES.md)。

---

## 1. MaskReveal —— `clip-path` 文字擦除

**用在哪**：任何"出现"而不是"淡入"的文字。比 `opacity` 干净得多，
拉丁文和 CJK 都吃。

**机制**：包一层 `<MaskReveal show delay duration>`，内部用
`clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)` 动画。组件已经在
[`templates/src/components/MaskReveal.tsx`](../templates/src/components/MaskReveal.tsx)
里，直接 import 用。

**陷阱**：父级 `key={step}` 重挂时擦除会重播。不想重播就把
`MaskReveal` 提到带 key 的容器**外面**。

---

## 2. Typewriter Terminal —— 逐行打字带光标

**用在哪**：终端演示、代码逐行露出、"系统正在做事"的节奏感。

**机制**：每行 `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`
（同 MaskReveal 但每行独立）。延时**预先累加算好**：
`start = Σ(prev_dur + gap)`，每行约 `6ms/字符`，封顶 ~360ms。

行尾 `▌` caret 用 `::after` + 一个**有界 keyframe**实现：
`opacity` 在该行打字窗口内 4-8 次脉冲，`100%` 时归 0 永久消失。

**⚠️ 关键陷阱**：**不要**用 `infinite caret-blink` + 单独的
`caret-on/off` 动画叠在一起。`infinite` 会在 off 之后继续把 opacity
拉回来，于是屏幕上常驻 N 个光标。**始终用一个有界 keyframe，时长
等于该行打字窗口**。

---

## 3. Brand Takeover —— 巨字逐字错峰带模糊

**用在哪**：品牌亮相、产品名落下、"答案就是 X"式揭示。

**机制**：把字符串 `.split("")` 成 `<span>` 数组，每个
`animationDelay = base + i * 70ms`。每个字符从
`translateY(40px) rotate(-3deg) blur(10px) opacity:0` 缓动到归位。
缓动用 `var(--ease-expo)` 出戏剧感。

字号用 `clamp(96px, 11vw, 188px)`、`letter-spacing: -0.04em`、
`line-height: 0.96`。字体用主题的 `--font-display-en`。

---

## 4. Pull Quote —— 杂志风巨大衬线带饰线

**用在哪**：突出一句重磅结论；口播里的戏剧停顿。

**机制**：三层堆叠 —— 顶上一条 `2px × 120px` 的 `--accent` 横线
（`scaleX(0)→1` 入场）、上方 mono 小字 META 标签、下方三行渐次放大
的衬线巨字（80→96→110+px）。最关键句子下面再做一个 `::after`
下划线，延迟 ~1700ms 出，制造"重音"。

---

## 5. Image Rain / Grid —— 网格错峰入场

**用在哪**：展示体量 / "很多例子"，又不想做成条目列表观感。

**机制**：8 列 grid，每格 `aspect-ratio: 1/1`，
`animationDelay = (i % 8) * 60 + floor(i / 8) * 100`，形成对角线
扫过效果。每格从 `translateY(30px) scale(0.85) rotate(-3deg)` 弹回。

---

## 6. FAKE Stamp —— 带过冲的橡皮章砸落

**用在哪**：驳斥某说法、对比"前后"、钉死真伪感。

**机制**：绝对定位 + `rotate(-12deg)`，两段动画叠加：
- `stamp-slam`：`scale(2.6) rotate(-30deg) blur(10px)` →
  `scale(0.95)` → `scale(1)`，缓动用
  `cubic-bezier(0.34, 1.56, 0.64, 1)`（**这是关键** —— 弹性
  overshoot 的"过冲再稳住"手感）
- `stamp-jitter`：`steps(2)` 微抖，模拟手按章后的余震

**陷阱**：印章颜色**故意写死**饱和红 `rgba(255, 74, 43, 0.94)`，
不走主题 token —— 它是视觉物件，不是文字。深色主题里也保持那个红
就对了。

---

## 7. Strikethrough Reveal —— 文字上动画红色横条

**用在哪**：否定先前说法（"不太对"）、表现弃用、"被揭穿"瞬间。

**机制**：`::after` 绝对定位横条，`top: 56%`、`height: 3px`，
`scaleX(0)→1`，`transform-origin: left`，用 `--accent` 上色，
`box-shadow: 0 0 10px var(--accent-glow)` 制造发光余韵。

---

## 8. Progressive Pipeline —— 顶条状态 + 底部 demo 面板

**用在哪**：多步流程，每次点击前进一步。顶条常驻（随状态变化），
底部面板随 step 切换实时 demo。

**机制**：
- 顶条每个 step 三态 `done | active | future`，CSS 类切换边框 / 透明度
- `active` 加一个右上角 10px 圆点 + `box-shadow` 脉冲（`ps2-pulse`
  keyframe，`0 → 14px transparent`）
- 底部 demo 容器 `<div key={stageIdx}>` —— 重挂 key 让动画重播

**⚠️ 陷阱**：忘记给底部 demo 写 `key={stageIdx}` = 入场动画只播一次，
后续点击没反应。

---

## 9. Phone Frame —— 边框 + 刘海 + 指示条

**用在哪**：展示手机截图（聊天、社媒、移动应用）。比裸图编辑感强得多。

**机制**：三层嵌套 `bezel > screen > img + overlay`：
- `.phone-bezel`：`background: #000`、`border-radius: 38px`、
  `padding: 9px`、**`aspect-ratio` 必须等于截图实际宽高比**，
  否则裁切翻车
- `.phone-screen`：`border-radius: 30px`、`overflow: hidden`、
  `img { object-fit: cover }`
- `.phone-notch` / `.phone-bar`：刘海和 home indicator，
  `position: absolute`，z-index 高于截图

阴影别省 —— 三层叠加（投影 + 1px 描边 + inset 高光）才出"实物"质感。

---

## 10. Tilt Card —— 鼠标视差带阻尼

**用在哪**：主视觉卡片 / 产品图需要"有活力"又不想抢戏。

**机制**：`useMouseParallax(strength, damping)` hook，
`mousemove` 算目标位移，`requestAnimationFrame` 做指数平滑
（`cx += (tx - cx) * 0.12`），输出到 CSS 变量 `--px / --py`。
CSS 上 `rotateX/Y` 各乘 ~0.4deg，`perspective: 1000px` 给父级。

**⚠️ 陷阱**：**不要**把视差 transform 和入场动画 transform 写在
同一元素上 —— 会互相覆盖。用**嵌套包装**：外层负责入场，内层
负责视差。

---

## 11. Brush Strike —— SVG 手绘删除线

**用在哪**：戏剧化删除线，像墨水划过 —— "这不再是答案"。

**机制**：内联 SVG `<path d="M2,10 Q50,4 100,12 T198,8">`（贝塞尔曲线
故意不平直，模拟手抖），`stroke-dasharray` + `stroke-dashoffset`
从全长动画到 0 = 笔画绘制效果。`stroke-linecap: round` 让端点像
真笔触。

---

## 鼓励发明新原语

如果你为某个章节发明了一个**新的、有效果**的视觉表达 —— 太好了，
那才是这个 Skill 的目标。

什么时候**考虑**回流到这个文件（不是必须）：
- 它简单到一两个 `keyframes` + 一段 CSS 就能讲清楚
- 它在多种内容主题下都通用（不只服务于你这一章的特定场景）
- 它有清晰的视觉语义，将来别人能一看就懂

否则就在你的章节里实现一次完事，**不要**污染共享词典。这个文件应该
保持精炼。

## 真正的限制只来自 SKILL.md

记住：本文件的所有原语都是**可选**的。**不可妥协**的是 SKILL.md
里的十条原则（每步独占整屏、动画优先、逐个揭示、语义 token、双源
原则等）。按十条原则自由发挥，比照搬这里的任何一条都更重要。
