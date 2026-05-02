# Case: 科技测评类（tech review）

一篇 AI / 工具 / 产品**实测对比**类文章 → 7 章 36 步、6 分 30 秒视频
的真实案例。

> **这个目录的角色**：让 agent 在面对类似题材时**有具体形状参考**，
> 包括完整 outline 长什么样、article 补字段怎么填、章节怎么切分。
> **不是要 agent 照抄它的内容**。

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
| 动画风格 | 慢速 blur clear（1.5s ease-out）/ 打字机（每字 80~100ms）/ ken burns 缓推 | midnight-press motionHints 锁死，全片同一气质 |

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
