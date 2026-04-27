<div align="center">

# Agent Skills

**A curated collection of production-ready [Agent Skills](https://support.claude.com/en/articles/12512176-what-are-skills) for Claude Code, Cursor, Codex, and other AI coding agents.**

[![License: MIT](https://img.shields.io/github/license/ConardLi/web-design-skill?style=flat-square&color=blue)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/ConardLi/web-design-skill?style=flat-square)](https://github.com/ConardLi/web-design-skill/stargazers)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](#contributing)
[![Skills count](https://img.shields.io/badge/skills-3-orange?style=flat-square)](#whats-inside)
[![Spec](https://img.shields.io/badge/spec-SKILL.md-black?style=flat-square)](https://agentskills.io)

[English](./README.md) · [中文文档](./README.zh-CN.md)

</div>

---

## Table of contents

- [What's inside](#whats-inside)
- [Install](#install)
  - [Option A · Claude Code plugin marketplace](#option-a--claude-code-plugin-marketplace)
  - [Option B · Manual copy into your project](#option-b--manual-copy-into-your-project)
  - [Option C · Git submodule](#option-c--git-submodule)
- [Compatibility](#compatibility)
- [Anatomy of a Skill](#anatomy-of-a-skill)
- [Repository layout](#repository-layout)
- [Acknowledgments](#acknowledgments)
- [License](#license)

---

## What's inside

<table>
<tr>
<th width="22%">Skill</th>
<th width="14%">Category</th>
<th>Highlights</th>
<th width="14%">Docs</th>
</tr>

<tr>
<td>

**[`web-design-engineer`](./skills/web-design-engineer)**

</td>
<td>

Design&nbsp;/&nbsp;Frontend

</td>
<td>

Turns AI-generated web pages from "functional" into "stunning."

- Anti-cliché blocklist (no purple-pink gradients, no Inter, no emoji icons)
- `oklch` color theory + 6 curated color × font pairings
- Six-step workflow: requirements → context → design system → v0 → build → verify
- ~520-line advanced patterns library

</td>
<td>

[README](./skills/web-design-engineer/README.md) · [SKILL](./skills/web-design-engineer/SKILL.md) · [Demo](./demo/web-design-demo)

</td>
</tr>

<tr>
<td>

**[`rag-skill`](./skills/rag-skill)**
<br/><sub>frontmatter `name: kb-retriever`</sub>

</td>
<td>

Retrieval&nbsp;/&nbsp;Docs

</td>
<td>

A local knowledge-base retriever that never loads whole files into context.

- Hierarchical `data_structure.md` index navigation
- Mandatory **learn-before-process** for PDF / Excel
- Progressive `grep` + windowed reads, bounded to 5 rounds
- Reference docs for `pdftotext` / `pdfplumber` / `pandas` workflows

</td>
<td>

[README](./skills/rag-skill/README.md) · [SKILL](./skills/rag-skill/SKILL.md)

</td>
</tr>

<tr>
<td>

**[`gpt-image-2`](./skills/gpt-image-2)**

</td>
<td>

Image&nbsp;Gen&nbsp;/&nbsp;Prompting

</td>
<td>

A focused image-gen skill for GPT Image 2 (and OpenAI-compatible image APIs).

- **Three runtime modes**: A&nbsp;Garden local · B&nbsp;Host-native delegate · C&nbsp;Advisor-only
- 18 categories, 70+ structured prompt templates
- Auto prompt + image archival under `garden-gpt-image-2/`
- Mode-detection script so the skill never silently fails

</td>
<td>

[README](./skills/gpt-image-2/README.md) · [SKILL](./skills/gpt-image-2/SKILL.md)

</td>
</tr>
</table>

---

## Install

### Option A · Claude Code plugin marketplace

The fastest path if you use [Claude Code](https://docs.anthropic.com/en/docs/claude-code):

```bash
/plugin marketplace add ConardLi/garden-skills
/plugin install web-design-skills@garden-skills
/plugin install knowledge-base-skills@garden-skills
/plugin install image-generation-skills@garden-skills
```

Plugin packs are declared in [`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json):

| Plugin pack | Skills included |
|---|---|
| `web-design-skills` | `web-design-engineer` |
| `knowledge-base-skills` | `rag-skill` |
| `image-generation-skills` | `gpt-image-2` |

### Option B · Manual copy into your project

Each skill folder is self-contained — copy the one(s) you want into your project's skills directory:

```bash
# Claude Code / Claude.ai
cp -r skills/web-design-engineer  your-project/.claude/skills/

# Cursor / generic agent
cp -r skills/web-design-engineer  your-project/.agents/skills/
```

The agent will discover the skill the next time it scans the workspace.

### Option C · Git submodule

If you want to track upstream updates inside a larger project:

```bash
git submodule add https://github.com/ConardLi/web-design-skill.git vendor/garden-skills
ln -s ../../vendor/garden-skills/skills/web-design-engineer .claude/skills/web-design-engineer
```

---

## Compatibility

| Agent / Runtime | Skill location | Status |
|---|---|---|
| **Claude Code** | `.claude/skills/<name>/` or via plugin marketplace | ✅ Tested |
| **Claude.ai** (web) | Settings → Capabilities → Skills | ✅ Tested |
| **Cursor** | `.agents/skills/<name>/` | ✅ Tested |
| **Codex CLI** | `.codex/skills/<name>/` | ✅ Tested |
| **Gemini CLI** | extension manifest | ✅ Tested |
| **OpenCode** | `.opencode/skills/<name>/` | ✅ Tested |

> The `SKILL.md` format is portable by design — if your agent supports skills, copy the folder into the directory it scans, and it should work. PRs welcome to extend this matrix.

---

## Anatomy of a Skill

Every skill in this repo follows the same minimal shape:

```text
<skill-name>/
├── SKILL.md            ← required: YAML frontmatter + instructions for the agent
├── README.md           ← English docs for humans (this is what GitHub renders)
├── README.zh-CN.md     ← Chinese docs for humans
├── references/         ← optional: docs the agent loads on-demand
├── scripts/            ← optional: deterministic executable code
└── assets/             ← optional: templates, fonts, icons used in outputs
```

Frontmatter is the contract that tells the agent *when* to use the skill:

```markdown
---
name: my-skill
description: A clear sentence about what this skill does and when to use it.
              The agent uses this to decide whether to load the skill.
---

# My Skill

Detailed instructions, examples, and constraints go here.
```

For the full spec, see [agentskills.io](https://agentskills.io) and the [official examples from Anthropic](https://github.com/anthropics/skills).

---

## Repository layout

```text
.
├── skills/                              ← all skills live here, one folder each
│   ├── web-design-engineer/
│   │   ├── SKILL.md
│   │   ├── README.md  /  README.zh-CN.md
│   │   └── references/advanced-patterns.md
│   │
│   ├── rag-skill/                       ← frontmatter name: kb-retriever
│   │   ├── SKILL.md
│   │   ├── README.md  /  README.zh-CN.md
│   │   ├── references/  (pdf_reading.md, excel_reading.md, excel_analysis.md)
│   │   └── scripts/convert_pdf_to_images.py
│   │
│   └── gpt-image-2/
│       ├── SKILL.md
│       ├── README.md  /  README.zh-CN.md
│       ├── references/  (18 categories, 70+ prompt templates)
│       └── scripts/     (check-mode.js, generate.js, edit.js, shared.js)
│
├── .claude-plugin/
│   └── marketplace.json                 ← Claude Code plugin marketplace manifest
│
├── demo/                                ← live, openable demos
│   └── web-design-demo/
│       └── demo2/                       ← side-by-side viewer for web-design-engineer
│           ├── index.html
│           ├── demo1.html  /  demo1-with-skill.html
│           └── demo2-with-skill.html
│
├── dist/                                ← reference assets and showcase site
│   ├── prompt/
│   │   └── claude-design-system-prompt.md   (original Claude Design system prompt)
│   └── web/                             (Vite + React showcase site, optional)
│
├── README.md  /  README.zh-CN.md        ← collection index (this file)
├── LICENSE
└── .gitignore
```

---


## Acknowledgments

This collection stands on the shoulders of:

- **[Anthropic](https://www.anthropic.com)** for the [Agent Skills spec](https://agentskills.io) and the [`anthropics/skills`](https://github.com/anthropics/skills) reference repository.
- **[Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs)** — the system prompt that inspired `web-design-engineer`. The original is preserved in [`dist/prompt/claude-design-system-prompt.md`](./dist/prompt/claude-design-system-prompt.md) for reference.
- The broader OSS skill community — see [`travisvn/awesome-claude-skills`](https://github.com/travisvn/awesome-claude-skills) and [`obra/superpowers`](https://github.com/obra/superpowers) for further discovery.

---

## License

[MIT](./LICENSE) © [ConardLi](https://github.com/ConardLi)
