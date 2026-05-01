<div align="center">

# Garden Skills

**花园老师的开源 [Agent Skills](https://support.claude.com/en/articles/12512176-what-are-skills) 集合，面向 Claude Code、Cursor、Codex 等所有支持 `SKILL.md` 格式的 AI 编程代理。**

[![License: MIT](https://img.shields.io/github/license/ConardLi/web-design-skill?style=flat-square&color=blue)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/ConardLi/web-design-skill?style=flat-square)](https://github.com/ConardLi/web-design-skill/stargazers)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](#贡献)
[![Skills count](https://img.shields.io/badge/skills-3-orange?style=flat-square)](#集合内的-skills)
[![Spec](https://img.shields.io/badge/spec-SKILL.md-black?style=flat-square)](https://agentskills.io)

[English](./README.md) · [中文文档](./README.zh-CN.md)

</div>

---

## 目录

- [集合内的 Skills](#集合内的-skills)
  - [web-design-engineer（设计 / 前端）](#web-design-engineer)
  - [gpt-image-2（图像生成 / Prompt）](#gpt-image-2)
  - [web-video-presentation（即将上线）](#web-video-presentation)
  - [kb-retriever（本地知识库检索）](#kb-retriever)
- [安装](#安装)
  - [方式 A · Claude Code 插件市场](#方式-a--claude-code-插件市场)
  - [方式 B · 手动拷贝到项目](#方式-b--手动拷贝到项目)
  - [方式 C · Git Submodule](#方式-c--git-submodule)
- [兼容性](#兼容性)
- [Skill 的标准结构](#skill-的标准结构)
- [仓库结构](#仓库结构)
- [致谢](#致谢)
- [许可证](#许可证)

---

## 集合内的 Skills

### [`web-design-engineer`](./skills/web-design-engineer)

![Web Design Skill](./dist/imgs/web-design-skill.png)

**类别：** 设计 / 前端  
**适合：** 网页、落地页、仪表盘、交互原型、HTML 幻灯片、动画、UI 样机、数据可视化和设计系统探索。

`web-design-engineer` 把 AI 生成的 Web 产物从“能用”推进到“精致、克制、真正有设计判断”。它把 Agent 当作设计工程师来约束：先理解产品上下文，再声明设计系统，尽早展示 v0，然后完整构建并验证结果。

亮点：

- 定义六步设计工作流：需求 → 上下文 → 设计系统 → v0 → 完整构建 → 验证
- 用反 AI 俗套清单和更强的视觉判断，避免千篇一律的生成式 UI
- 覆盖 HTML / CSS / JavaScript / React 原型，以及响应式布局、动效和交互细节
- 包含 inline React + Babel、CSS tokens、`oklch()` 配色、container queries、reduced-motion 等实现规则
- 提供高级模式参考，覆盖设备框、幻灯片引擎、动画时间线、仪表盘等常见 Web 产物

链接：[README](./skills/web-design-engineer/README.zh-CN.md) · [SKILL.md](./skills/web-design-engineer/SKILL.md) · [Website](./website/web-design-website) · [Demo](./demo/web-design-demo)

---

### [`gpt-image-2`](./skills/gpt-image-2)

![GPT Image 2 Skill](./dist/imgs/gpt-image-2-skill.png)

**类别：** 图像生成 / Prompt 工程  
**适合：** 海报、UI 样机、产品图、信息图、学术图、技术架构图、漫画、头像、分镜、品牌板和图像编辑工作流。

`gpt-image-2` 是面向 GPT Image 2 与 OpenAI 兼容图像接口的聚焦型图像生成 Skill。它能适配不同 Agent 环境：Garden 本地完整出图、委托宿主原生图像工具、或在没有图像工具时退化为纯提示词顾问。

亮点：

- 支持三种运行模式：**Mode A Garden 本地生图**、**Mode B 委托宿主出图**、**Mode C 纯提示词顾问**
- 每次任务先做模式探测，避免静默走错执行路径
- 在 `references/` 下提供 18 大类、80+ 个结构化提示词模板
- 同时覆盖图像生成和图像编辑，并配套专门工作流与脚本
- Garden 模式下会把 prompt 与生成图片保存到 `garden-gpt-image-2/`，方便复用、审查和版本管理

链接：[README](./skills/gpt-image-2/README.zh-CN.md) · [SKILL.md](./skills/gpt-image-2/SKILL.md) · [Website](./website/gpt-image2-website)

---

### `web-video-presentation`

![Web Video Presentation Skill](./dist/imgs/web-video-presentation-skill.png)

**状态：** 即将上线  
**类别：** 网页视频 / 演示工程  
**适合：** 把口播稿、文章、课程、产品演示和 talk 做成点击驱动的 16:9 网页演示，再通过录屏产出有电影感的视频。

`web-video-presentation` 是一个方法论驱动的 Skill，用于构建适合录屏的 Vite + React + TypeScript 演示。每次点击推进一个口播节拍，每一步独占 1920×1080 舞台，常驻 UI 尽量隐藏，让录屏画面保持干净。

预告亮点：

- 固定 16:9 舞台，并按视口缩放
- 全局 `(chapter, step)` 游标，支持点击和键盘推进
- 口播节拍与视觉 step 一一对应
- 悬浮才出现的进度控制，适合干净录屏
- 基于主题 token 的视觉架构，支持多种设计语言
- 动效优先，每一屏更像视频而不是幻灯片

这个 Skill 正在整理进入集合，等文档、模板和打包方式稳定后会正式发布。

---

### [`kb-retriever`](./skills/kb-retriever)

![Kb Retriever Skill](./dist/imgs/kb-retriever-skill.png)

**类别：** 检索 / 本地知识库  
**适合：** 从本地 `knowledge/` 目录回答问题，检索结构化文档，并在不撑爆上下文的前提下从 Markdown、文本、PDF、Excel 中提取证据。

`kb-retriever` 是一个本地知识库检索 Skill，核心是谨慎、渐进、可溯源。它不会直接加载整文件，而是先走分层索引，缩小候选范围，按文件类型正确处理，再带来源回答问题。

亮点：

- 通过分层 `data_structure.md` 文件先导航知识库，再进入内容检索
- 对 PDF 和 Excel 强制执行 **先学习再处理**，必须先阅读内置 reference 文档
- 组合关键词检索、局部窗口读取、同义词扩展和多轮迭代
- 最多 5 轮检索，让探索过程有边界
- 内置 `grep`、`pdftotext`、`pdfplumber`、`pandas` 工作流，并强调答案来源

链接：[README](./skills/kb-retriever/README.zh-CN.md) · [SKILL.md](./skills/kb-retriever/SKILL.md)

---

## 安装

### 方式 A · Claude Code 插件市场

如果你用 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)，这是最快的路径：

```bash
/plugin marketplace add ConardLi/garden-skills
/plugin install web-design-skills@garden-skills
/plugin install knowledge-base-skills@garden-skills
/plugin install image-generation-skills@garden-skills
```

插件包定义在 [`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json)：

| 插件包 | 包含的 Skills |
|---|---|
| `web-design-skills` | `web-design-engineer` |
| `knowledge-base-skills` | `kb-retriever` |
| `image-generation-skills` | `gpt-image-2` |

### 方式 B · 手动拷贝到项目

每个 Skill 文件夹都是自包含的，挑你要的拷过去即可：

```bash
# Claude Code / Claude.ai
cp -r skills/web-design-engineer  your-project/.claude/skills/

# Cursor / 通用 Agent
cp -r skills/web-design-engineer  your-project/.agents/skills/
```

Agent 在下次扫描工作区时会自动发现。

### 方式 C · Git Submodule

如果你想在更大的项目里跟踪上游更新：

```bash
git submodule add https://github.com/ConardLi/web-design-skill.git vendor/garden-skills
ln -s ../../vendor/garden-skills/skills/web-design-engineer .claude/skills/web-design-engineer
```

---

## 兼容性

| Agent / Runtime | Skill 路径 | 状态 |
|---|---|---|
| **Claude Code** | `.claude/skills/<name>/` 或走插件市场 | ✅ 已验证 |
| **Claude.ai**（网页端） | Settings → Capabilities → Skills | ✅ 已验证 |
| **Cursor** | `.agents/skills/<name>/` | ✅ 已验证 |
| **Codex CLI** | `.codex/skills/<name>/` | ✅ 已验证 |
| **Gemini CLI** | extension manifest | ✅ 已验证 |
| **OpenCode** | `.opencode/skills/<name>/` | ✅ 已验证 |

> `SKILL.md` 格式本身是可移植的——只要你的 Agent 支持 Skill 体系，把文件夹放进它扫描的目录就行。欢迎 PR 扩充这张表。

---

## Skill 的标准结构

本仓库每个 Skill 都遵循同一种最简结构：

```text
<skill-name>/
├── SKILL.md            ← 必需：YAML frontmatter + 给 Agent 看的指令
├── README.md           ← 给人看的英文文档（GitHub 渲染的就是它）
├── README.zh-CN.md     ← 给人看的中文文档
├── references/         ← 可选：Agent 按需加载的扩展文档
├── scripts/            ← 可选：确定性的可执行代码
└── assets/             ← 可选：模板、字体、图标等输出物素材
```

frontmatter 是 Agent 判断"什么时候该用这个 Skill"的契约：

```markdown
---
name: my-skill
description: 用一句话清楚说明这个 Skill 是干什么的、什么时候应该用。
              Agent 会用这段话判断是否激活本 Skill。
---

# My Skill

详细指令、示例与约束写在这里。
```

完整规范见 [agentskills.io](https://agentskills.io) 与 [Anthropic 官方示例仓库](https://github.com/anthropics/skills)。

---

## 仓库结构

```text
.
├── skills/                              ← 所有 Skill 都在这里，每个一个文件夹
│   ├── web-design-engineer/
│   │   ├── SKILL.md
│   │   ├── README.md  /  README.zh-CN.md
│   │   └── references/advanced-patterns.md
│   │
│   ├── kb-retriever/
│   │   ├── SKILL.md
│   │   ├── README.md  /  README.zh-CN.md
│   │   ├── references/  (pdf_reading.md、excel_reading.md、excel_analysis.md)
│   │   └── scripts/convert_pdf_to_images.py
│   │
│   └── gpt-image-2/
│       ├── SKILL.md
│       ├── README.md  /  README.zh-CN.md
│       ├── references/  (18 大类、70+ 个提示词模板)
│       └── scripts/     (check-mode.js、generate.js、edit.js、shared.js)
│
├── .claude-plugin/
│   └── marketplace.json                 ← Claude Code 插件市场清单
│
├── demo/                                ← 可直接打开的演示
│   └── web-design-demo/
│       └── demo2/                       ← web-design-engineer 的有/无 Skill 对比展示
│           ├── index.html
│           ├── demo1.html  /  demo1-with-skill.html
│           └── demo2-with-skill.html
│
├── dist/                                ← 共享展示素材
│   ├── imgs/                            ← README Skill 海报
│   │   ├── web-design-skill.png
│   │   ├── gpt-image-2-skill.png
│   │   ├── kb-retriever-skill.png
│   │   └── web-video-presentation-skill.png
│   ├── prompt/
│   │   └── claude-design-system-prompt.md   （Claude Design 原始系统提示词）
│
├── website/                             ← 独立展示网站
│   ├── gpt-image2-website/              ← GPT Image 2 Skill 展示站
│   └── web-design-website/              ← web-design-engineer Skill 展示站
│
├── README.md  /  README.zh-CN.md        ← 集合首页（本文件）
├── LICENSE
└── .gitignore
```

---

## 致谢

本集合站在以下工作的肩膀上：

- **[Anthropic](https://www.anthropic.com)** —— [Agent Skills 规范](https://agentskills.io) 和 [`anthropics/skills`](https://github.com/anthropics/skills) 参考仓库。
- **[Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs)** —— `web-design-engineer` 的灵感来源，原系统提示词保留在 [`dist/prompt/claude-design-system-prompt.md`](./dist/prompt/claude-design-system-prompt.md) 供参考。
- 更广义的 OSS Skill 社区——延伸阅读：[`travisvn/awesome-claude-skills`](https://github.com/travisvn/awesome-claude-skills) 和 [`obra/superpowers`](https://github.com/obra/superpowers)。

---

## 许可证

[MIT](./LICENSE) © [ConardLi](https://github.com/ConardLi)
