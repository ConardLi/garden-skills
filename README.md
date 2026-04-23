# Web Design Engineer Skill

**An AI agent skill that transforms AI-generated web pages from "functional" to "stunning."**

[中文文档](./README.zh-CN.md)

---

## What Is This?

This is a reusable **Skill** (structured system prompt) for AI coding agents — such as [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Cursor](https://cursor.com), Google DeepMind's Antigravity, and other tools that support the `SKILL.md` format — that dramatically improves the design quality of AI-generated HTML/CSS/JavaScript artifacts.

It distills the core design philosophy from [Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs)'s system prompt into an open, portable, and customizable skill file that you can drop into any project.

### The Problem

Modern LLMs can already produce functional web pages from simple prompts. But their output tends to converge on the same aesthetic: Inter font, blue primary buttons, purple-pink gradients, large-radius cards, emoji as icons, fabricated testimonials. Technically correct, visually generic.

### The Solution

This skill injects **design taste** into the AI's decision-making process through:

- **Anti-cliché rules** — an explicit blocklist of overused AI design patterns
- **Design system declaration** — forces the AI to articulate color, typography, spacing, and motion choices *before writing code*
- **oklch color theory** — perceptually uniform color derivation instead of random hex guessing
- **Curated font & color pairings** — high-quality starting points that replace the default Inter + #3b82f6
- **Placeholder philosophy** — honest `[icon]` markers instead of poorly drawn SVG fakes
- **Structured workflow** — six-step process from requirements → context → design system → v0 draft → full build → verification

---

## Quick Start

### For Claude Code / Cursor / Antigravity / AI Agents

Copy the skill directory into your project:

```
your-project/
├── .agents/skills/web-design-engineer/
│   ├── SKILL.md                          # Main skill file (~400 lines)
│   └── references/
│       └── advanced-patterns.md          # Code template library (~520 lines)
├── .gemini/antigravity/skills/web-design-engineer/
│   ├── SKILL.md                          # Main skill file for Antigravity
│   └── references/
│       └── advanced-patterns.md          # Code template library
└── ...
```

The agent will automatically pick up the skill when your request involves visual/interactive front-end work.

> **Note**: Some tools use `.claude/skills/` or `.gemini/antigravity/skills/` instead of `.agents/skills/`. Place the files in whichever directory your tool expects. The content is identical.

### What It Covers

| Output Type | Examples |
|---|---|
| Web pages & landing pages | Marketing sites, product pages, portfolios |
| Interactive prototypes | Clickable app mockups with device frames |
| Slide decks | HTML presentations (1920×1080, keyboard nav) |
| Data visualizations | Dashboards with Chart.js or D3.js |
| Animations | CSS/JS motion design, timeline-driven demos |
| Design systems | Token exploration, component variants |

---

## How It Works

### The Six-Step Workflow

```
1. Understand requirements  →  Ask only when information is insufficient
2. Gather design context    →  Code > screenshots; never start from nothing
3. Declare design system    →  Colors, fonts, spacing, motion — in Markdown, before code
4. Show v0 draft early      →  Placeholders + layout + tokens; let the user course-correct
5. Full build               →  Components, states, motion; pause at key decision points
6. Verify                   →  Pre-delivery checklist; no console errors, no rogue hues
```

### Key Design Principles

**Anti-AI-cliché checklist.** The skill explicitly bans:
- Purple-pink-blue gradient backgrounds
- Left-border accent cards
- Inter / Roboto / Arial / Fraunces / system-ui fonts
- Emoji as icon substitutes
- Fabricated stats, fake logo walls, dummy testimonials

**oklch color system.** Colors are derived in the perceptually uniform oklch space. Same lightness values actually *look* the same brightness to the human eye — unlike HSL, where yellow-at-50% looks much brighter than blue-at-50%.

**Curated starting points.** Six pre-validated color × font pairings for common use cases:

| Style | Color | Fonts | Use Case |
|---|---|---|---|
| Modern tech | Blue-violet | Space Grotesk + Inter | SaaS, dev tools |
| Elegant editorial | Warm brown | Newsreader + Outfit | Content, blogs |
| Premium brand | Near-black | Sora + Plus Jakarta Sans | Luxury, finance |
| Lively consumer | Coral | Plus Jakarta Sans + Outfit | E-commerce, social |
| Minimal professional | Teal-blue | Outfit + Space Grotesk | Dashboards, B2B |
| Artisan warmth | Caramel | Caveat + Newsreader | Food, education |

---

## Demos

The `demo/` directory contains side-by-side comparisons of pages generated with and without the skill, using identical prompts.

### Demo 1: Space Exploration Museum

**Prompt:** *"Build a homepage for a fictional 'Space Exploration Museum' — full-screen hero, 4 exhibition sections, a timeline with 6+ milestones, a booking CTA, and a footer. Deep, immersive, cosmic feel."*

| | Without Skill | With Skill |
|---|---|---|
| **File** | `demo/demo1.html` | `demo/demo1-with-skill.html` |
| **Color system** | Hardcoded hex values (#7cf0ff, #b388ff) | oklch-based token system with CSS custom properties |
| **Typography** | Orbitron + Noto Serif SC | Instrument Serif + Space Grotesk + JetBrains Mono |
| **Layout** | Standard landing-page structure | Editorial magazine-style layout with grid compositions |
| **Details** | Heavy glow effects, neon gradients | Restrained palette, typographic hierarchy, decorative data elements |
| **Overall feel** | Enthusiastic junior designer | Experienced design director |

### Demo 2: Photographer Portfolio

**Prompt:** *"Build a homepage for an independent photographer's portfolio."*

| | With Skill |
|---|---|
| **File** | `demo/demo2-with-skill.html` |
| **Character** | Creates a fictional Nordic photographer "Mira Høst" with a complete visual identity |
| **Color** | Paper-warm light (#f2efe8) + ink-dark (#161513) — extremely restrained two-tone palette |
| **Typography** | Instrument Serif (display) + Space Grotesk (UI) with extensive italic usage |
| **Layout** | Magazine-editorial structure with numbered sections, asymmetric grids, side rails |
| **Motion** | Slow Ken Burns on hero image (24s cycle), film-grain texture overlay |
| **Navigation** | `mix-blend-mode: difference` masthead — seamless across light/dark sections |

---

## File Structure

```
.
├── README.md                                    # This file (English)
├── README.zh-CN.md                              # Chinese documentation
├── .agents/skills/web-design-engineer/
│   ├── SKILL.md                                 # Main skill definition
│   └── references/
│       └── advanced-patterns.md                 # Code templates & patterns
├── .gemini/antigravity/skills/web-design-engineer/
│   ├── SKILL.md                                 # Main skill for Antigravity
│   └── references/
│       └── advanced-patterns.md                 # Code templates & patterns
├── demo/
│   ├── demo1.html                               # Space museum — without skill
│   ├── demo1-with-skill.html                    # Space museum — with skill
│   └── demo2-with-skill.html                    # Photographer portfolio — with skill
└── prompt/
    └── system.md                                # Claude Design system prompt (reference)
```

---

## Background

This skill is inspired by the system prompt of [Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs), Anthropic's visual design product launched in April 2026. Claude Design's system prompt (~420 lines) encodes a sophisticated set of design principles, anti-patterns, and workflow constraints that make its output consistently high-quality.

This project extracts and refines those core ideas into a portable skill that works with any AI coding agent — giving you Claude-Design-level design taste without the product lock-in or usage limits.

Key additions beyond the original Claude Design prompt:
- **Design system declaration step** — forces the AI to articulate design tokens in natural language before coding
- **v0 draft strategy** — a concrete methodology for showing work-in-progress early
- **Extended anti-cliché list** — additional patterns identified from real-world AI output
- **Placeholder philosophy** — a complete framework for handling missing assets professionally
- **Color × font pairing table** — six validated visual system starting points
- **Advanced pattern library** — ready-to-use code templates for common UI patterns

---

## License

MIT
