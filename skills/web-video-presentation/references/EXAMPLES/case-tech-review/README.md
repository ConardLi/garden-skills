# Case: 科技测评类（tech review）

一篇 AI / 工具 / 产品**实测对比**类文章 → 7 章 36 步、6 分 30 秒视频
的真实案例。

> ## ⚠️ 这是结构示意 / 历史案例，不是抄袭模板
>
> 这个目录的角色是让 agent 看："**测评类视频章节怎么切、信息池怎么
> 抽、章长怎么定**"。**它包含的具体动画描述（如"慢速 blur clear
> 1.5s ease-out / 打字机每字 80~100ms"）属于历史版本** —— 新版
> outline 已经**不写动画 / 不写时长**（见 [`../../OUTLINE-FORMAT.md`](../../OUTLINE-FORMAT.md)）。
> 新写 outline 时只写"屏幕内容 + 关系名前缀 + 章节级信息池"，动画
> 选型留给章节实现阶段按 [`../../CHAPTER-CRAFT.md`](../../CHAPTER-CRAFT.md)
> Part 0 五问决定。
>
> **看这个 case 学的应该是**：
> 1. 测评类怎么切 7 章（钩子 → 优点 → 场景 → 进阶 → 收束）
> 2. 章长怎么定（每章 4~6 step 防疲劳）
> 3. 双源原则怎么落地（hero 来自 script / 数据角标来自 article）
>
> **不应该学**：动画选型、CSS 实现、时长数值（这些已下放到 chapter
> 阶段）。

## 适用场景

- AI 模型 / 产品 / 工具的实测体验文
- 多家产品对比（A vs B vs C）
- 跑分 / benchmark / 用户投票数据驱动的内容
- "强在哪 / 怎么用 / 怎么用得好"型结构

## 关键决策

| 维度 | 这个案例的选择 | 通用启发 |
|---|---|---|
| 主题 | `midnight-press`（电影感慢镜、blur clear、暖橙 accent、scanline） | 科技测评类适合"克制、有重量"的暗色调；避开俏皮 / 糖果色 |
| 章节切分 | 7 章：开场悬念 / 强在哪 / 哪能用 / 怎么用好 / Skill 介绍 / Skill 模式 / 收尾 | 测评类的标准结构：钩子 → 优点 → 场景 → 进阶 → 收束 |
| 章长 | 每章 4~6 step | 测评类信息密度高，每章不超过 6 step 防止观众疲劳 |
| 双源应用 | hero 标语来自 script、画面密度（具体分数 / 投票数 / 时间戳）来自 article | 测评类 article 数据极多 —— 用 mono cue / 角标 / 数据浮层挂出来 |
| 动画风格 | 慢速 blur clear / 打字机 / ken burns 缓推 | midnight-press 暗色印刷气质，章节实现时按主题氛围自由发挥 |

## 文件

- [`outline-snippet.md`](outline-snippet.md) —— 前 2 章完整节选（5 + 5 step），
  展示双源原则在 outline 里怎么落地

> 完整 7 章 outline 在调用此 Skill 的具体项目里（`gpt-image2-video/outline.md`），
> 不放进 Skill 仓库 —— 避免 Skill spec 被某一个项目内容污染。

## 不在这个 case 出现的情形

测评类**通常不需要**：
- 慢节奏长镜头（电影感片头 / 旅行 vlog 才需要）
- 手写温暖感（教育 / 亲子 / 食谱才需要）
- 大量插画（设计稿 / 工艺品类才需要）

→ 选别的 case anchor 或自由发挥。
