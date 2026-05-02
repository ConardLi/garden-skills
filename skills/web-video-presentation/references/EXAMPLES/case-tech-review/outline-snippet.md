# Outline 节选 · 科技测评类 case

> **节选**：前 2 章（10 step），用来展示 outline 在科技测评题材里的
> 形状。完整版 7 章 36 步在调用此 Skill 的具体项目里，不进 spec。

> **主题**：`midnight-press`（电影感慢镜、blur clear、暖橙 accent、
> scanline；克制有重量。**禁**砸下 shake / 弹簧 / emoji）
>
> **总时长**：约 6 分 30 秒

---

## 1. coldopen — 登顶悬念（5 steps · ~30s）

- **step 1** (~5s) — 暗场远景粒子云 + 钩子字幕"我刷到一张图，愣了三秒"
  · 动画：屏幕从纯黑慢速 fade 到暗暖底（1.5s ease-out）→ 远景光尘粒子云慢漂浮入（1.0s 错峰）→ 字幕 mono 打字机逐字打出（每字 100ms）；持续微动：粒子云永不停 brownian 漂移 + 暖橙暗角光晕 6s 周期慢呼吸 + ken burns 缓推
  · 手段：CSS background 慢 fade + Canvas 粒子云慢漂 + JS typewriter + filter: drop-shadow 暖橙呼吸 + transform: scale 永动 ken burns

- **step 2** (~7s) — 排行榜慢镜景深聚焦 + 主分数 hero 数字 blur clear 浮出
  · 动画：截图从 blur(12px) + scale(1.05) 慢速景深聚焦（1.5s ease-out）→ 主分数从 blur(20px) 慢慢锐化（1.2s 错峰 400ms）→ 王冠 SVG 沿数字外圈慢速 mask reveal（1.5s）；持续微动：主分数暖橙光晕 5s 呼吸 + ken burns 缓推
  · 手段：filter: blur 反向 + transform scale 慢推 + clip-path 沿 path mask reveal + filter: drop-shadow 呼吸
  · article 补：主分数（来自 article §1，具体数字）+ 测评窗口（"X 月 N 日 ~ Y 日"）+ 投票数（mono cue 角标）—— 口播只说"换榜首"，画面把"领先多少 / 多少票投出来的"全挂上

- **step 3** (~6s) — 第 2 名对比横条 + "+差距分"慢浮锐化
  · 动画：第一条从左向右慢速 mask reveal 拉到 100%（1.2s ease-out）→ 第二条同向 mask reveal 但只到 ~70%（错峰 600ms）→ 中间空缺区差距分从 blur(15px) 慢慢锐化进场（错峰）；持续微动：差距区暖橙光晕慢呼吸 + accent 横线 8s 缓延展永动 + scanline 极淡 overlay 慢移
  · 手段：clip-path inset 慢 reveal + filter: blur 反向 + linear-gradient 暖光晕 + linear-gradient scanline 永动
  · article 补：第 2 名具体名字（article §1）+ 差距分（具体数字 vs 模糊"低很多"）+ 趋势注释（"过去 N 周首次反超"）

- **step 4** (~6s) — 官方原话 pull-quote 慢镜入场（电影感引文）
  · 动画：左右两枚巨大引号 SVG 从 opacity 0 + blur(15px) 慢速锐化进场（1.0s 错峰 200ms，**无砸下**）→ 引文文字 mono 打字机逐字打出（每字 80ms）→ 落款慢速 blur clear 浮出（0.8s）；持续微动：引号暖橙慢光晕呼吸 + 镜头 ken burns 缓推
  · 手段：filter: blur 反向锐化 + JS typewriter + transform translateY 慢推 + filter: drop-shadow 呼吸
  · article 补：原话直引（来自 article §1，1~2 句）+ 落款来源（"— 出处.AI"）—— 引文是 article 里口播完全省略的"权威背书"

- **step 5** (~5s) — 主持人介绍 + 4 件事预告速览
  · 动画：第一行自我介绍 blur clear 慢入场（1.2s ease-out）→ 4 张占位卡分别从 blur(15px) 慢速景深聚焦 stagger 出现（每张 250ms 错峰，每张 1.0s 慢镜），卡内 mono 数字 01/02/03/04 + 关键词；持续微动：每张卡暖橙边线慢光晕呼吸（错峰 400ms）+ 远景粒子永漂
  · 手段：filter: blur 反向 + opacity 慢 fade + transform scale 慢推 + filter: drop-shadow 多 instance 错峰呼吸
  · article 补：4 件事的关键词（来自 article 章节标题，简化）

口播节选：
> 我刷到一张图，愣了三秒……今天讲清楚四件事。

---

## 2. why-strong — 强在哪（5 steps · ~80s）

- **step 1** (~6s) — hero"强在哪 · 四个方向" + 4 个 ghost 占位卡
  · 动画：hero 字符整体从 blur(20px) + opacity 0 慢速景深聚焦（1.5s ease-out）→ 下方暖橙长横线从中心向两侧慢延展（0.8s）→ 4 张 ghost 卡片同步从 blur 慢镜出现（保持 opacity 0.3 占位状态）；持续微动：暖橙下划线 8s 周期慢光晕脉冲 + ghost 卡片暖暗边线慢闪
  · 手段：filter: blur 反向 + transform scaleX 慢延展 + opacity 阶梯填充 + filter: drop-shadow 永动呼吸
  · article 补：4 个方向各自的关键词（mono cue 标签，"01 X / 02 Y / 03 Z / 04 W"）

- **step 2** (~16s) — 第 1/4 项填实 + 大图慢镜 takeover
  · 动画：卡片 1 从 ghost 状态慢速 mask 填实（0.8s 暖暗底色 + 边线慢光晕亮起）→ 中央 hero 大图从 blur(15px) 慢速景深聚焦（1.5s ease-out）→ mono cue 标签从暗角慢速 blur clear 入场（0.8s）→ 副标打字机逐字打出（每字 80ms）；持续微动：暖橙 accent 高亮条永动呼吸 + 大图 ken burns 缓推（0.5% scale 12s 周期）+ scanline 慢移
  · 手段：filter: blur 反向 + clip-path 慢 reveal + JS typewriter + transform scale 永动 ken burns + linear-gradient scanline 永动
  · article 补：本项的具体表现（article §2 抽 1~2 个数据点 / 案例标签）—— 口播只说"它强在 X"，画面挂"具体强到 N% / 跑赢 M / 测评分数 K"

- **step 3** (~16s) — 第 2/4 项填实 + 列表/演示
  · 动画：卡片 2 慢速 mask 填实（0.8s）→ mono cue 标签 blur clear 慢入场（0.8s）→ 4 行具体细则 typewriter 逐行打出（每行 0.8s 错峰 350ms）→ 每行末尾 mono 光标闪烁后追加暖橙对勾 SVG path stroke 慢绘制；持续微动：mono 光标永闪烁（800ms blink）+ scanline 慢移
  · 手段：JS typewriter + opacity blink 光标 + SVG path stroke-dashoffset 慢绘 + linear-gradient scanline overlay 永动
  · article 补：4 行细则的具体内容（来自 article §2 第 N 段子列表）—— 口播只说"指令遵循好"，画面把 article 列出来的 4 个具体维度"主体放哪 / 背景怎么搭 / ..."逐行打出来

- **step 4** (~16s) — 第 3/4 项填实 + before/after 慢镜对照 + 永动 cross-fade
- **step 5** (~16s) — 第 4/4 项填实 + 多参数预览 + redacted 注释

口播节选：
> 实测下来强在四个方向 ……

---

> **观察**：每个 step 的画面都做到"口播说一件事，画面挂多件事"。比如
> step 2 口播只是"第一项很强"，画面同时呈现：本项关键词 / 大图实例 /
> 具体数据点 / 副标补充 —— 这是双源原则的具象落地。
