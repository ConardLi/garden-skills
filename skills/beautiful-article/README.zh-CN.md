# Beautiful Article Skill —— 把任意素材编辑成一篇精美的文章

> 一个面向 AI Agent 的 Skill：把任意素材（URL / PDF / DOCX / Markdown / 纯文本 / 截图 / 粘贴材料）**编辑、设计**成一篇**比原文更易读、更便于分享和归档的精美文章**。

[English](./README.md) · [返回集合首页](../../README.zh-CN.md)

![Beautiful Article Skill](../../dist/imgs/covers/beautiful-article.webp)

---

### 由 [ReActicle](https://github.com/ConardLi/reacticle) 驱动

`beautiful-article` 是编辑型 **harness**（方法论、checkpoint、主题选型、sub-agent reviewer）；[`reacticle`](https://github.com/ConardLi/reacticle) 是 Skill 在运行时调用的**底层组件协议** —— prose-first 的 React 语义组件 + 基于主题 token 的 `Raw` 自由层，统一接到同一套主题系统上。

```
beautiful-article  （本 Skill · 方法论 + harness）
        │  调用
        ▼
reacticle          （npm 包 · 组件 / 主题 / Raw / 导出）
```

| 层级 | 负责什么 | 仓库 / 文档 |
|---|---|---|
| `beautiful-article`（本 Skill） | **怎么** 让 Agent 从任意素材出发，规划、撰写、审阅、交付一篇文章 —— 6 阶段流程、3 个硬 checkpoint、主题选型、sub-agent reviewer | 当前目录 |
| `reacticle` | Skill 实际拼装出的组件词表 + 11 套 authoring 主题 —— `Article` / `Hero` / `Lead` / `Section` / `Quote` / `Image` / `Formula` / `CodeBlock` / `Raw` …，每套主题 = 一份 `.css` token 包 + 一份 `.md` authoring profile | [`ConardLi/reacticle`](https://github.com/ConardLi/reacticle) · [npm `reacticle`](https://www.npmjs.com/package/reacticle) · [文档站](https://rearticle.mmh1.top/) |

二者搭配最佳但相互独立：Skill 因为有 ReActicle 这个稳定目标层才能跑通；ReActicle 单独作为 React 组件库使用也完全立得住。

---

### [文章实例](https://mmh1.top/#/ai-article) —— 用 `beautiful-article` + ReActicle 写出来的真实文章

每一篇都是 AI Agent 用本 Skill 调用 [`reacticle`](https://www.npmjs.com/package/reacticle) 组件协议端到端写完的真实长文。点封面即可在线打开单文件 HTML 版本。

<table>
<tr>
<td width="50%" valign="top" align="center">
<a href="https://mmh1.top/#/ai-article/tools">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/tools.webp" alt="Agent Tools 设计的最佳实践" width="320">
<br><b>Agent Tools 设计的最佳实践</b>
</a>
<br><sub>Theme · Freddie · 长文 · 21 min</sub>
<br><sup>Anthropic 工程团队关于 Tools 的五条原则，与一套评测驱动的方法。</sup>
</td>
<td width="50%" valign="top" align="center">
<a href="https://mmh1.top/#/ai-article/skill">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/skill.webp" alt="Agent Skill 是如何进化的？" width="320">
<br><b>Agent Skill 是如何进化的？</b>
</a>
<br><sub>Theme · Freddie · 解释文 · 8 min</sub>
<br><sup>把 Skill 文档当成被训练的对象，而不是被复制粘贴的 prompt。</sup>
</td>
</tr>
<tr>
<td width="50%" valign="top" align="center">
<a href="https://mmh1.top/#/ai-article/harness">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/harness.webp" alt="Agent Harness 的解剖图" width="320">
<br><b>Agent Harness 的解剖图</b>
</a>
<br><sub>Theme · Vignelli · 长文 · 12 min</sub>
<br><sup>智能在模型里；让智能变得有用的，是它周围的那套系统。</sup>
</td>
<td width="50%" valign="top" align="center">
<a href="https://mmh1.top/#/ai-article/prompt-cache">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/prompt-cache.webp" alt="提示词缓存对 Agent 有多重要？" width="320">
<br><b>提示词缓存对 Agent 有多重要？</b>
</a>
<br><sub>Theme · Bayer · 长文 · 15 min</sub>
<br><sup>缓存命中率是 Agent 的 SLO，Claude Code 团队的反直觉经验。</sup>
</td>
</tr>
<tr>
<td width="50%" valign="top" align="center">
<a href="https://mmh1.top/#/ai-article/context">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/context.webp" alt="面向 Agent 的高效上下文工程" width="320">
<br><b>面向 Agent 的高效上下文工程</b>
</a>
<br><sub>Theme · Tufte · 长文 · 16 min</sub>
<br><sup>本文探讨如何高效地筛选与管理驱动 AI Agent 运转的上下文。</sup>
</td>
<td width="50%" valign="top" align="center">
<a href="https://mmh1.top/#/ai-article/transformer">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/transformer.webp" alt="Attention Is All You Need" width="320">
<br><b>Attention Is All You Need</b>
</a>
<br><sub>Theme · Tufte · 长文 · 30 min</sub>
<br><sup>一篇重塑现代 AI 的论文，逐层拆给你看。</sup>
</td>
</tr>
<tr>
<td width="50%" valign="top" align="center">
<a href="https://mmh1.top/#/ai-article/agent-eval">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/agent-eval.webp" alt="把 AI Agent 的评测讲清楚" width="320">
<br><b>把 AI Agent 的评测讲清楚</b>
</a>
<br><sub>Theme · Tufte · 长文 · 25 min</sub>
<br><sup>让 Agent 有用的那些能力，恰恰让它难以评测 —— 来自 Anthropic 的指南。</sup>
</td>
<td width="50%" valign="top" align="center">
<a href="https://mmh1.top/#/ai-article/agent-loop-codex">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/agent-loop-codex.webp" alt="Codex 的 Agent Loop 是怎么做的？" width="320">
<br><b>Codex 的 Agent Loop 是怎么做的？</b>
</a>
<br><sub>Theme · Sottsass · 长文 · 18 min</sub>
<br><sup>OpenAI 官方分享：在 Responses API 之上，一条对话是如何被反复"展开"的。</sup>
</td>
</tr>
</table>

---

### [主题概览](https://rearticle.mmh1.top/#/gallery) —— 每套主题一篇样品文章

> 11 套主题已上架。每套主题的完整契约（`.css` token 包 + `.md` authoring profile、anti-patterns、code/media style）见 [Theming](https://rearticle.mmh1.top/#/theming)。

每套主题都附一篇**样品长文**，从字体到摄影、代码、公式、Raw 块通通走一遍。点封面在线阅读，点主题名跳到该主题在文档站的章节。

<table>
<tr>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/caffeine-half-life">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-tufte.webp" alt="Tufte · Data-Ink" width="260">
<br><b>Tufte</b> · Data-Ink
</a>
<br><sub>咖啡因与睡眠 · 数据笔记</sub>
<br><sup>Edward Tufte 数据墨水，证据优先，发丝级图表与最朴素的版式。</sup>
</td>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/movable-type">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-press.webp" alt="Press · 书卷" width="260">
<br><b>Press</b> · 书卷
</a>
<br><sub>活字之后 · 随笔</sub>
<br><sup>Stripe Press 式书卷长读物：会落定的标题、氧化血红首字母、纯正文之美。</sup>
</td>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/pool-exhaustion">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-shannon.webp" alt="Shannon · 工程暗色" width="260">
<br><b>Shannon</b> · 工程暗色
</a>
<br><sub>连接池耗尽 · 故障复盘</sub>
<br><sup>贝尔实验室技术论文血统，暗底黄金信号、回压依赖、夜间作战气质。</sup>
</td>
</tr>
<tr>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/orbit-spec">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-vignelli.webp" alt="Vignelli · 瑞士" width="260">
<br><b>Vignelli</b> · 瑞士网格
</a>
<br><sub>Orbit 设计系统规格 · 规格</sub>
<br><sup>Massimo Vignelli 网格至上、grotesque 字族、瑞士红只承载结构。</sup>
</td>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/linear-attention">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/knuth.png" alt="Knuth · 学术" width="260">
<br><b>Knuth</b> · 学术
</a>
<br><sub>线性化自注意力 · 预印本</sub>
<br><sup>Donald Knuth / Computer Modern，编号小节、命题与证明、arXiv 草稿气质。</sup>
</td>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/first-newsletter">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-freddie.webp" alt="Freddie · 暖黄" width="260">
<br><b>Freddie</b> · 暖黄
</a>
<br><sub>第一封 Newsletter · 上手指南</sub>
<br><sup>Mailchimp Freddie 黑字荧光，亲和插画 + 不端着的产品上手语气。</sup>
</td>
</tr>
<tr>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/slow-breathing">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-andy.webp" alt="Andy · 静谧" width="260">
<br><b>Andy</b> · 静谧
</a>
<br><sub>把呼吸放慢 · 练习</sub>
<br><sup>柔软圆润、呼吸-神经跷跷板，让人慢下来的练习气质。</sup>
</td>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/front-page">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-bodoni.webp" alt="Bodoni · 报刊" width="260">
<br><b>Bodoni</b> · 报刊
</a>
<br><sub>头版的消亡 · 特稿</sub>
<br><sup>高对比 Didone 报刊气质，黑白大报、对折线之上的分量。</sup>
</td>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/geometry-of-meaning">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-bayer.webp" alt="Bayer · 包豪斯" width="260">
<br><b>Bayer</b> · 包豪斯
</a>
<br><sub>形、色、网格 · 教学</sub>
<br><sup>Herbert Bayer 包豪斯三原色几何，形有性格、色有重量。</sup>
</td>
</tr>
<tr>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/rate-limiter-spec">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-fuller.webp" alt="Fuller · 蓝图" width="260">
<br><b>Fuller</b> · 蓝图
</a>
<br><sub>限流器设计规格 · 系统设计</sub>
<br><sup>Buckminster Fuller 工程蓝图，方格纸拓扑、令牌桶模拟，可照着实现。</sup>
</td>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/color-clash">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-sottsass.webp" alt="Sottsass · 孟菲斯" width="260">
<br><b>Sottsass</b> · 孟菲斯
</a>
<br><sub>撞色不翻车 · 设计随笔</sub>
<br><sup>Memphis 80s 撞色，黑描边、硬投影、轻微旋转的不正经语法。</sup>
</td>
<td width="33%" valign="top" align="center">
&nbsp;
</td>
</tr>
</table>

> 完整的 11 套主题样品（含主题切换、搜索与筛选）在线 gallery：<https://rearticle.mmh1.top/#/gallery>。

---

## 这个 Skill 干什么

`beautiful-article` 把原本枯燥、线性、难以消化的文字材料变成视觉体验更漂亮、阅读节奏更清晰、也更便于审阅和分享的**文章**。它**不是**网页应用生成器 —— 注意力永远在"文章"本身：更好的阅读、更好的节奏、更好的美学。最终交付物是一份自包含、可离线打开的文件（可选随附 PDF），但那是交付细节、不是目标。

适合的场景：

- 把一篇长 URL / PDF / DOCX / Markdown 编辑成一篇**网页长文**
- 决策摘要 briefing、概念解释 explainer、教学步骤 tutorial、复盘 review、方案分析
- 视觉随笔 visual essay、对话 / 访谈 / 播客转写、交互式学习解释器
- 任何时候你希望**比 Markdown 更好的阅读载体** —— 表格、SVG、代码、公式、复制 / 导出按钮一条龙

Skill 本质上是一个**方法论 + 协作 harness**。它附带一个 Vite + React + TypeScript 脚手架，基于 [`reacticle`](https://www.npmjs.com/package/reacticle) 组件协议 —— Agent 不手写裸 HTML / CSS，而是用 prose-first 的语义组件 + 主题约束的 `Raw` 自由层来组合。

---

## 核心思想

- **首先是一篇文章，不是应用** —— 注意力永远在文章。Raw 自由层、SVG、小工具必须服务阅读 / 解释 / 节奏 / 审美，不能喧宾夺主。
- **Source → Plan → Build → Review 小型 harness** —— 每个项目走 6 个有编号的 phase，中间有 3 个硬 checkpoint。
- **`reacticle` 组件协议** —— 语义化的 prose 组件（Hero / Lead / Section / Quote / Callout / Image / Formula / CodeBlock / Table …）+ 一个必须用主题 token（`--ra-*`）的 `Raw` 自由层。
- **主题驱动设计** —— 内置 11 套 authoring profile（`tufte` / `press` / `bayer` / `bodoni` / `vignelli` / `sottsass` / `freddie` / `andy` / `fuller` / `knuth` / `shannon`），每套是给 Agent 看的 Markdown 契约，不是 CSS 文件。
- **默认 100% 信息保留** —— 文章类型自带推荐保留比例（longform `~100%` / briefing `~50%` / visual-essay `~40%` …），用户可一句话覆盖。
- **硬协作 checkpoint** —— Plan、首屏样张、最终交付前 Agent 必须停下来；**每个决策必须逐项独立确认，不允许打包一个"全部 OK 吗"**。
- **默认带封面** —— 一个 3:4 书封式题图位于 TOC 之上，外壳锁死、只能用主题 token、不允许远程图片。
- **PDF 导出可选** —— 主交付物是一份自包含的 HTML 文件；PDF 只在用户在 Checkpoint 3 主动选择时通过零依赖的 `html-to-pdf.sh` 生成。

---

## 工作流

```text
Phase 0  Intake
   │
Phase 1  Source → Markdown      （URL / PDF / DOCX / MD / 文本 → source.md）
   │
Phase 2  Editorial Planning     （一份 plan.md：Brief / Outline / Theme / Assets）
   │
★ Checkpoint 1  Plan            （5 个独立决策逐项确认）
   │
Phase 4  First Spread           （封面 + Hero + 第一节 + 一个代表性视觉块）
   │
★ Checkpoint 2  First Spread    （验收 + 后续开发模式 A/B）
   │
Phase 5  Full Article Build     （单 Agent 顺序 / 多 Agent 并行）
   │
Phase 6  Final Review           （Editorial / Visual / Technical 三视角）
   │
Phase 7  Repair                 （只允许最小切片修复）
   │
★ Checkpoint 3  Delivery        （HTML，或 HTML + PDF，或暂停修订）
   │
Phase 8  Delivery               （article.html，可选 article.pdf）
```

每个项目都有自己的工作区目录，作为 Agent 的**长期记忆**：

```text
<workspace>/
  source/   original.*   source.md   source.<lang>.md（需翻译时）   extraction-notes.md
  plan/     plan.md
  article/  Cover.tsx   Article.tsx   sections/   raw-blocks/   assets/   article.html（产物）
  review/   first-spread-review.md   final-review.md
            （source-review.md 仅复杂源；repair-log.md 仅有修复时）
  index.html  package.json  vite.config.ts  tsconfig*.json   （构建工装）
```

---

## Skill 目录结构

公开 URL 可选用 [Parallel Search MCP 抽取脚本](./references/parallel-search-mcp.md)，
无需账号或 API key 即可抓取正文 Markdown；用户要求补充研究时也可搜索来源。
原有抽取路径和素材完整性自检仍适用；匿名使用有速率限制。安装与命令见参考文档。

```text
skills/beautiful-article/
├── SKILL.md                            主 Skill 文件（frontmatter name: beautiful-article）
├── manifest.json                       发布清单
├── README.md  /  README.zh-CN.md       本文档
├── references/
│   ├── article-types.md                文章类型路由
│   ├── article-types/                  briefing / dialogue / essay / explainer / full-report
│   │                                    interactive-explainer / longform / review / tutorial / visual-essay
│   ├── information-density.md          保留比例与组件 / 视觉比例的关系
│   ├── plan-template.md                单一 plan.md 模板（Brief / Outline / Theme / Assets）
│   ├── theme-selection.md              主题选择，density 与 theme 解耦
│   ├── layout.md                       版式宽度、TOC 默认值
│   ├── cover.md                        3:4 书封封面指南（5 条自检 + 5 个构图模板）
│   ├── asset-policy.md                 配图策略（none / user-assets / placeholders / ai-generated）
│   ├── component-policy.md             Reacticle 组件契约、prose-first
│   ├── raw-policy.md                   Raw 允许 / 禁止表、token 驱动、自检
│   ├── section-build.md                一节一文件铁律、subagent prompt 模板
│   ├── source-to-markdown.md           各类输入抽取规则 + 5 条自检
│   ├── scaffold.md                     脚手架行为、工作区结构
│   ├── html-output.md                  dev / build / 单文件 HTML 命令
│   ├── pdf-output.md                   html-to-pdf.sh 用法 + print CSS 覆盖
│   ├── review-checklist.md             各阶段 reviewer 清单与 sub-agent prompt
│   ├── repair-policy.md                最小切片修复对照表
│   └── harness.md                      Skill-as-harness 视角
├── theme-profiles/
│   ├── index.json                      主题注册表
│   └── andy / bayer / bodoni / freddie / fuller / knuth / press / shannon / sottsass / tufte / vignelli
├── scripts/
│   ├── scaffold.sh                     一键创建工作区
│   ├── html-to-pdf.sh                  可选 HTML → PDF（headless 浏览器，零 npm 依赖）
│   ├── pdf-print-overrides.css         注入 HTML 的 @media print 覆盖
│   ├── source-to-markdown-markitdown.py  主路径抽取（PDF / DOCX / HTML）
│   └── source-to-markdown.py           轻量 fallback（Markdown / TXT / 简单 HTML）
└── assets/
    └── scaffold-template/              脚手架脚本拷贝的 Vite + React + TS 模板
```

---

## 它是怎么工作的（要点）

### 1. 各节点的质检协议

不同 phase 用不同的质检方式 —— 滥开 SubAgent、滥写 review 文件是首要性能问题，所以 Skill 把规则写明：

| 节点 | 怎么检 | 产物 |
|---|---|---|
| Phase 1 Source（默认） | 主 Agent 内联 5 条 checklist | 无文件 |
| Phase 1 Source（仅复杂 / 低置信源） | Source Reviewer SubAgent（对照 `original.*` diff） | `review/source-review.md` |
| Phase 2 Plan / Checkpoint 1 前 | **主 Agent 内联自查（禁开 SubAgent、禁写文件）** | 无文件 |
| Phase 4 First Spread / Checkpoint 2 前 | First Spread Reviewer SubAgent | `review/first-spread-review.md` |
| Phase 5 每个 Section | Section Reviewer SubAgent —— 以消息返回 pass/fail | 无（不写每节文件） |
| Phase 6 终审 / Checkpoint 3 前 | Editorial + Visual + Technical Reviewer SubAgent | `review/final-review.md` |

### 2. 禁止静默替用户选择

每个 Checkpoint 的每一项决策必须**独立**问 —— Agent 可以推荐，但不能"我已经替你定了 X，不对再说"。Plan Checkpoint 5 项独立决策：文章类型（含推荐保留比例）/ 主题 / 版式宽度 / 配图模式 / 封面开关。

### 3. 文章类型 → 保留比例打包

10 种文章类型都自带推荐保留比例：`longform · ~100%` / `tutorial · ~90%` / `full-report · ~80%` / `explainer · ~80%` / `dialogue · ~80%` / `review · ~70%` / `essay · ~70%` / `briefing · ~50%` / `visual-essay · ~40%` / `interactive-explainer · ~25% 摘录 + 75% AI 重构`。用户可一句话覆盖。

### 4. 一节一文件铁律

每个 Section 都是 `article/sections/NN-*.tsx` 单文件组件。`Article.tsx` 只是 assembler —— 由主 Agent 拥有，负责 import 与排序、跑 typecheck / build、解决主题漂移。这是后续多 Agent 并行的前提。

### 5. 全程主题 token

`Raw` 块必须只用 `--ra-*` 主题 token —— 不允许野生颜色 / 字体。换主题时所有 Raw 块一处生效。每个主题都有一份 Markdown authoring profile，告诉 Agent 在该主题下怎么写、怎么排版。

---

## 创建一个项目

Skill 不预先创建工作区 —— 每个项目自己开。来自 Phase 4 的命令：

```bash
# 默认开封面
bash <path-to-skill>/scripts/scaffold.sh ./my-article --theme=tufte

# 关闭封面
bash <path-to-skill>/scripts/scaffold.sh ./my-article --theme=press --no-cover

# 查看可用主题
bash <path-to-skill>/scripts/scaffold.sh --list-themes
```

脚手架会拉起 Vite + React + TS 工作区，从 npm 装最新 `reacticle`，并放好 `source/ plan/ review/` 三个目录 + `article/Article.tsx` / `article/Cover.tsx` / `article/sections/01-opening.tsx` 三份起点文件。

Phase 5 完成后 Agent 跑构建产出单文件 HTML：

```bash
npm run build           # → article/article.html（CSS + JS 全内联）
```

可选 PDF 导出（仅当 Checkpoint 3 用户选了 HTML + PDF）：

```bash
bash <path-to-skill>/scripts/html-to-pdf.sh
```

---

## 最佳实践

### 推荐

1. **先定文章类型** —— 它的保留比例锚定整个 plan。
2. **信任 harness 的 phase** —— 不要因为"答案显而易见"就跳过 Plan checkpoint。
3. **Raw 块只用主题 token** —— `--ra-*`，禁止裸颜色 / 字体名。
4. **一节一文件** —— 哪怕这一节很短，也要隔离。review 与修复阶段会回报这点投入。
5. **封面要呼应主题 + 文章主旨** —— 不是一个占位渐变。

### 避免

1. ❌ 把 Skill 当成"帮我做个 HTML 页面" —— 交付物是**文章**。
2. ❌ 把多个 Checkpoint 决策打包成一个 yes/no。
3. ❌ Raw 块自带颜色 / 字体（主题漂移）。
4. ❌ 把所有 Section 都写进 `Article.tsx`（杀死 sub-agent 并行）。
5. ❌ 删除 colophon / 封面外壳（这些是契约的一部分）。

---

## 常见问题

**Q1：什么时候不应该用这个 Skill？**
当用户其实想要的是网页应用 / dashboard / 表单 / 原型 / 通用 landing page —— 这些去找 `web-design-engineer`，不是这里。不确定时 Skill 会停下来澄清，而不是默默生成错的产物。

**Q2：是不是总是 100% 信息保留？**
不是 —— 那只是 `longform` 类型的默认值。文章类型决定推荐比例，用户可以在 Checkpoint 1 覆盖。

**Q3：文章语言可以与源材料不同吗？**
可以。如果用户指定的目标语言与源不一致，Phase 1 会先产出地道翻译版 `source/source.<lang>.md`，Phase 2+ 据此编写。

**Q4：如果 Agent 运行时没有 SubAgent / Task 工具怎么办？**
Skill 显式照顾了这种情况：主 Agent 兜底承担 SubAgent 的工作，并在 review 文件首注明"无 SubAgent 环境，主 Agent 兜底"。

**Q5：为什么用 React + Vite + reacticle 而不是裸 HTML？**
因为 Agent 需要一个稳定的、prose-first 的组件契约 —— 它要扛住多 Section 并行写作、主题切换、Raw 自由层这些场景。`npm run build` 时所有依赖会全部内联回单文件 HTML 交付。

---

## 工具要求

Skill 假设 Agent 运行时可以：

- 启动 shell 命令（用于 `scaffold.sh` / `html-to-pdf.sh` / `npm` 构建）
- 在工作区读写文件
- （可选）开启 sub-agent 来跑 First Spread / Section / Final review
- （可选）调用 `MarkItDown`（Python）做高保真 PDF / DOCX / HTML 抽取；不可用时由轻量 fallback 脚本处理 Markdown / TXT / 简单 HTML

---

## 许可证

MIT
