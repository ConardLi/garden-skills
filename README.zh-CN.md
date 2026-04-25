<div align="center">

# Agent Skills

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

<table>
<tr>
<th width="22%">Skill</th>
<th width="14%">类别</th>
<th>亮点</th>
<th width="14%">文档</th>
</tr>

<tr>
<td>

**[`web-design-engineer`](./skills/web-design-engineer)**

</td>
<td>

设计&nbsp;/&nbsp;前端

</td>
<td>

把 AI 生成的网页从"能用"升级到"惊艳"。

- 反 AI 俗套清单（紫粉渐变、Inter、emoji 当图标都禁用）
- `oklch` 色彩理论 + 6 套精选配色 × 字体组合
- 六步工作流：需求 → 上下文 → 设计系统 → v0 → 完整构建 → 验证
- ~520 行的高级模式库

</td>
<td>

[README](./skills/web-design-engineer/README.zh-CN.md) · [SKILL](./skills/web-design-engineer/SKILL.md) · [Demo](./demo/web-design-demo)

</td>
</tr>

<tr>
<td>

**[`rag-skill`](./skills/rag-skill)**
<br/><sub>frontmatter `name: kb-retriever`</sub>

</td>
<td>

检索&nbsp;/&nbsp;文档

</td>
<td>

本地知识库检索 Skill，永远不会把整文件塞进 context。

- 分层 `data_structure.md` 索引导航
- PDF / Excel **强制先学习再处理**
- 渐进式 `grep` + 窗口读取，最多 5 轮迭代
- 自带 `pdftotext` / `pdfplumber` / `pandas` 工作流的参考文档

</td>
<td>

[README](./skills/rag-skill/README.zh-CN.md) · [SKILL](./skills/rag-skill/SKILL.md)

</td>
</tr>

<tr>
<td>

**[`gpt-image-2`](./skills/gpt-image-2)**

</td>
<td>

图像生成&nbsp;/&nbsp;Prompt

</td>
<td>

聚焦的 GPT Image 2 图像生成 / 编辑 Skill，兼容 OpenAI 兼容图像 API。

- **三种运行模式**：A&nbsp;Garden 本地直出 · B&nbsp;委托宿主出图 · C&nbsp;纯提示词顾问
- 18 大类、70+ 个结构化提示词模板
- 自动归档 prompt + image 到 `garden-gpt-image-2/`
- 自带模式探测脚本，永不静默失败

</td>
<td>

[README](./skills/gpt-image-2/README.zh-CN.md) · [SKILL](./skills/gpt-image-2/SKILL.md)

</td>
</tr>
</table>

---

## 安装

### 方式 A · Claude Code 插件市场

如果你用 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)，这是最快的路径：

```bash
/plugin marketplace add ConardLi/web-design-skill
/plugin install web-design-skills@agent-skills
/plugin install knowledge-base-skills@agent-skills
/plugin install image-generation-skills@agent-skills
```

插件包定义在 [`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json)：

| 插件包 | 包含的 Skills |
|---|---|
| `web-design-skills` | `web-design-engineer` |
| `knowledge-base-skills` | `rag-skill` |
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
git submodule add https://github.com/ConardLi/web-design-skill.git vendor/agent-skills
ln -s ../../vendor/agent-skills/skills/web-design-engineer .claude/skills/web-design-engineer
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
│   ├── rag-skill/                       ← frontmatter name: kb-retriever
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
├── dist/                                ← 参考资料与展示站
│   ├── prompt/
│   │   └── claude-design-system-prompt.md   （Claude Design 原始系统提示词）
│   └── web/                             （Vite + React 展示站，可选）
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
