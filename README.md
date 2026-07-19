<div align="center">

# Garden Skills

**A curated collection of production-ready [Agent Skills](https://support.claude.com/en/articles/12512176-what-are-skills) for Claude Code, Cursor, Codex, and other AI coding agents.**

<a id="skills-gallery"></a>

<table>
<tr>
<td width="50%" valign="top">
<a href="#web-video-presentation"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video-presentation-skill.webp" alt="Web Video Presentation Skill" width="100%"></a>
<br/><a href="#web-video-presentation"><strong>web-video-presentation</strong></a>
<br/><sub>Web video / presentation</sub>
</td>
<td width="50%" valign="top">
<a href="#web-design-engineer"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design-skill.webp" alt="Web Design Skill" width="100%"></a>
<br/><a href="#web-design-engineer"><strong>web-design-engineer</strong></a>
<br/><sub>Design / frontend</sub>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<a href="#gpt-image-2"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/gpt-image-2-skill.webp" alt="GPT Image 2 Skill" width="100%"></a>
<br/><a href="#gpt-image-2"><strong>gpt-image-2</strong></a>
<br/><sub>Image generation / prompting</sub>
</td>
<td width="50%" valign="top">
<a href="#beautiful-article"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/banner.webp" alt="Beautiful Article Skill" width="100%"></a>
<br/><a href="#beautiful-article"><strong>beautiful-article</strong></a>
<br/><sub>Any source → beautiful article</sub>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<a href="#xquik-social-data"><img src="https://xquik.com/icon.svg" alt="Xquik Social Data Skill" width="100%"></a>
<br/><a href="#xquik-social-data"><strong>xquik-social-data</strong></a>
<br/><sub>X/Twitter data / automation</sub>
</td>
<td width="50%" valign="top">
<a href="#kb-retriever"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/kb-retriever-skill.webp" alt="Kb Retriever Skill" width="100%"></a>
<br/><a href="#kb-retriever"><strong>kb-retriever</strong></a>
<br/><sub>Retrieval / local knowledge base</sub>
</td>
</tr>
</table>

[![License: MIT](https://img.shields.io/github/license/ConardLi/garden-skills?style=flat-square&color=blue)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/ConardLi/garden-skills?style=flat-square)](https://github.com/ConardLi/garden-skills/stargazers)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](#contributing)
[![Skills count](https://img.shields.io/badge/skills-6-orange?style=flat-square)](#skills-gallery)
[![Spec](https://img.shields.io/badge/spec-SKILL.md-black?style=flat-square)](https://agentskills.io)

[English](./README.md) · [中文文档](./README.zh-CN.md) · [日本語](./README.ja-JP.md)

</div>

---

## Table of contents

| Install | Use | Contribute |
|---|---|---|
| [Install](#install)<br>[`skills` CLI (npx)](#option-a--skills-cli-npx)<br>[Claude Code plugin marketplace](#option-b--claude-code-plugin-marketplace)<br>[Pinned `.zip` from Releases](#option-c--pinned-zip-from-releases)<br>[Manual copy](#option-d--manual-copy-into-your-project)<br>[Git submodule](#option-e--git-submodule) | [Compatibility](#compatibility)<br>[What is a Skill?](#what-is-a-skill) | [Contributing](#contributing)<br>[Acknowledgments](#acknowledgments)<br>[License](#license) |

---

### [`web-video-presentation`](./skills/web-video-presentation)

![Web Video Presentation Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video-presentation-skill.webp)

**Category:** Web Video / Presentation Engineering  
**Best for:** turning scripts, articles, lessons, product demos, and talks into click-driven 16:9 web presentations that can be screen-recorded as cinematic videos.

`web-video-presentation` builds record-ready Vite + React + TypeScript presentations that behave like video production surfaces. The workflow turns raw articles into narration scripts, maps script beats to full-screen scenes, pauses at required checkpoints, and can optionally synthesize narration audio after the visual outline is approved.

Highlights:

- Fixed 1920×1080 stage that scales to the viewport for stable screen recording
- Click / keyboard driven `(chapter, step)` cursor, with one narration beat per visual step
- Hard collaboration checkpoints for script, theme, outline, implementation mode, and optional audio
- Hidden hover-only progress controls so the stage stays clean while recording
- Theme-token architecture with **23 built-in themes**, each with its own design signature - editorial, terminal, engineering, Swiss International, and more
- **Pluggable TTS** - provider-agnostic audio runner; ships **two built-in providers** (MiniMax `mmx-cli` + OpenAI TTS via curl) plus a contract + ready-to-paste snippets for ElevenLabs / edge-tts / Azure / Google Cloud / macOS `say`
- Scaffolded Vite + React + TypeScript project with reusable stage primitives and recording guidance

<table>
<tr>
<td align="center" width="25%"><a href="./skills/web-video-presentation/README.md#theme-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/creative-voltage.webp" alt="creative-voltage preview" /></a><br /><sub><code>creative-voltage</code><br />creative talks</sub></td>
<td align="center" width="25%"><a href="./skills/web-video-presentation/README.md#theme-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/blueprint.webp" alt="blueprint preview" /></a><br /><sub><code>blueprint</code><br />tech architecture</sub></td>
<td align="center" width="25%"><a href="./skills/web-video-presentation/README.md#theme-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/swiss-ikb.webp" alt="swiss-ikb preview" /></a><br /><sub><code>swiss-ikb</code><br />data reports</sub></td>
<td align="center" width="25%"><a href="./skills/web-video-presentation/README.md#theme-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/chalk-garden.webp" alt="chalk-garden preview" /></a><br /><sub><code>chalk-garden</code><br />popular science</sub></td>
</tr>
</table>

<a href="./skills/web-video-presentation/README.md#theme-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/gallery.webp" alt="Theme gallery - 23 built-in themes for web-video-presentation" /></a>

<sub>↑ All 23 themes at a glance - <a href="./skills/web-video-presentation/README.md#theme-gallery"><b>open the full gallery</b></a> for live 16:9 previews, design signatures, and best-for tags.</sub>

Links: [README](./skills/web-video-presentation/README.md) · [SKILL.md](./skills/web-video-presentation/SKILL.md) · <!-- DOWNLOAD:web-video-presentation:start -->[Download v1.2.2 .zip](https://github.com/ConardLi/garden-skills/releases/download/web-video-presentation-v1.2.2/web-video-presentation-1.2.2.zip)<!-- DOWNLOAD:web-video-presentation:end -->

---

### [`web-design-engineer`](./skills/web-design-engineer)

![Web Design Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design-skill.webp)

**Category:** Design / Frontend  
**Best for:** web pages, landing pages, dashboards, interactive prototypes, HTML slide decks, animations, UI mockups, data visualizations, and design-system explorations.

`web-design-engineer` turns AI-generated web artifacts from merely functional into polished, deliberate, and visually memorable front-end work. It treats the agent as a design engineer: first understanding product context, then declaring a design system, showing an early v0, building the full experience, and verifying the result.

Highlights:

- Converts the brief into a five-dial Design Read covering variance, motion, density, asset dependence, and brand fidelity
- Distinguishes extension, preserve, and overhaul redesign modes before changing an existing product
- Runs executable browser acceptance only when the user explicitly requests acceptance, QA, or browser testing
- Pushes beyond generic AI UI patterns with an anti-cliché blocklist and stronger visual judgment
- Ships a **Design Direction Advisor (six differentiated schools) + 25 anchored style recipes** (Linear / Aesop / Pentagram / Bloomberg / Stripe Press / Mid-Century, etc.) - each recipe carries concrete palette, typography, signature moves, and anti-patterns ready to paste into the design-system declaration
- Covers HTML / CSS / JavaScript / React prototypes, with guidance for responsive layout, motion, and interaction polish
- Includes practical implementation rules for inline React + Babel, CSS tokens, `oklch()` color work, container queries, and reduced-motion handling
- Ships an advanced patterns reference for device frames, slide engines, animation timelines, dashboards, and other reusable web artifacts

<table>
<tr>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/aesop.webp" alt="aesop preview" /></a><br /><sub><code>aesop</code><br />apothecary pages</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/muji-kenya-hara.webp" alt="muji-kenya-hara preview" /></a><br /><sub><code>muji-kenya-hara</code><br />object catalogues</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/monocle-magazine.webp" alt="monocle-magazine preview" /></a><br /><sub><code>monocle-magazine</code><br />magazine contents</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/stripe-press.webp" alt="stripe-press preview" /></a><br /><sub><code>stripe-press</code><br />book detail</sub></td>
</tr>
<tr>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-terminal.webp" alt="bloomberg-terminal preview" /></a><br /><sub><code>bloomberg-terminal</code><br />trading dashboards</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/linear.webp" alt="linear preview" /></a><br /><sub><code>linear</code><br />dev tool landing</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/vercel-mesh.webp" alt="vercel-mesh preview" /></a><br /><sub><code>vercel-mesh</code><br />deploy hero</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/tufte-dataink.webp" alt="tufte-dataink preview" /></a><br /><sub><code>tufte-dataink</code><br />data narratives</sub></td>
</tr>
<tr>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/mid-century-modern.webp" alt="mid-century-modern preview" /></a><br /><sub><code>mid-century-modern</code><br />poster homage</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/y2k-retrofuturism.webp" alt="y2k-retrofuturism preview" /></a><br /><sub><code>y2k-retrofuturism</code><br />Y2K portal</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-businessweek-turley.webp" alt="bloomberg-businessweek-turley preview" /></a><br /><sub><code>businessweek-turley</code><br />editorial covers</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/active-theory.webp" alt="active-theory preview" /></a><br /><sub><code>active-theory</code><br />cinematic launch</sub></td>
</tr>
</table>

<sub>↑ 12 of 25 anchored recipes - <a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><b>open the full gallery</b></a> for all 25 working artefacts (apothecary pages, trading workstations, magazine covers, Y2K portals, mid-century posters …) with signature moves and best-for tags.</sub>

Links: [README](./skills/web-design-engineer/README.md) · [SKILL.md](./skills/web-design-engineer/SKILL.md) · [Website](./website/web-design-website) · [Demo](./demo/web-design-demo) · <!-- DOWNLOAD:web-design-engineer:start -->[Download v1.3.0 .zip](https://github.com/ConardLi/garden-skills/releases/download/web-design-engineer-v1.3.0/web-design-engineer-1.3.0.zip)<!-- DOWNLOAD:web-design-engineer:end -->

---

### [`gpt-image-2`](./skills/gpt-image-2)

![GPT Image 2 Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/gpt-image-2-skill.webp)

**Category:** Image Generation / Prompt Engineering  
**Best for:** posters, UI mockups, product visuals, infographics, academic figures, technical diagrams, comics, avatars, storyboards, branding boards, and image-editing workflows.

`gpt-image-2` is a focused image-generation skill for GPT Image 2 and OpenAI-compatible image APIs. It is designed to work across different agent environments: fully local Garden generation, host-native image-tool delegation, or prompt-only advisor mode when no image tool is available.

Highlights:

- Supports three runtime modes: **Mode A Garden local**, **Mode B host-native delegation**, and **Mode C advisor-only prompt writing**
- Starts every task with mode detection so the skill does not silently choose the wrong execution path
- Provides 18 visual categories and 79 structured prompt templates under `references/`
- Covers both image generation and image editing through dedicated workflows and scripts
- Saves prompts and generated images under `garden-gpt-image-2/` in Garden mode for reuse, review, and versioning

#### Selected live cases

<table>
  <tr>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/editing-workflows%2Fbackground-replacement%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/editing-workflows/background-replacement/1-thumb.webp" alt="Background replacement case" width="100%"></a><br/>
      <strong><code>background-replacement</code></strong><br/>
      <sub>Portrait edit with Times Square relighting.</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/ui-mockups%2Fchat-interface-scene%2F3"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/ui-mockups/chat-interface-scene/3-thumb.webp" alt="AI assistant UI mockup case" width="100%"></a><br/>
      <strong><code>chat-interface-scene</code></strong><br/>
      <sub>Claude-style assistant product screenshot.</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/ui-mockups%2Flive-commerce-ui%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/ui-mockups/live-commerce-ui/1-thumb.webp" alt="Live commerce UI case" width="100%"></a><br/>
      <strong><code>live-commerce-ui</code></strong><br/>
      <sub>Celebrity livestream commerce interface.</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/ui-mockups%2Fproduct-card-overlay%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/ui-mockups/product-card-overlay/1-thumb.webp" alt="Product card overlay case" width="100%"></a><br/>
      <strong><code>product-card-overlay</code></strong><br/>
      <sub>Skincare landing-page hero.</sub>
    </td>
  </tr>
  <tr>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/infographics%2Fbento-grid-infographic%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/infographics/bento-grid-infographic/1-thumb.webp" alt="Bento grid infographic case" width="100%"></a><br/>
      <strong><code>bento-grid-infographic</code></strong><br/>
      <sub>High-density iPhone 16 Pro explainer.</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/technical-diagrams%2Fsystem-architecture%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/technical-diagrams/system-architecture/1-thumb.webp" alt="System architecture diagram case" width="100%"></a><br/>
      <strong><code>system-architecture</code></strong><br/>
      <sub>Multi-tenant AI SaaS production diagram.</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/slides-and-visual-docs%2Fdense-explainer-slides%2F2"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/slides-and-visual-docs/dense-explainer-slides/2-thumb.webp" alt="Dense explainer slide case" width="100%"></a><br/>
      <strong><code>dense-explainer-slides</code></strong><br/>
      <sub>AI Agent mechanism in one page.</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/maps%2Ffood-map%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/maps/food-map/1-thumb.webp" alt="Food map case" width="100%"></a><br/>
      <strong><code>food-map</code></strong><br/>
      <sub>City-walk editorial food guide.</sub>
    </td>
  </tr>
  <tr>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/product-visuals%2Fexploded-view-poster%2F2"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/product-visuals/exploded-view-poster/2-thumb.webp" alt="Exploded product poster case" width="100%"></a><br/>
      <strong><code>exploded-view-poster</code></strong><br/>
      <sub>Vision Pro 2 optical and compute teardown.</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/academic-figures%2Fneural-network-architecture%2F2"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/academic-figures/neural-network-architecture/2-thumb.webp" alt="Neural network architecture case" width="100%"></a><br/>
      <strong><code>neural-network-architecture</code></strong><br/>
      <sub>ViT-B/16 model figure for papers.</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/branding-and-packaging%2Fcosmetic-packaging%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/branding-and-packaging/cosmetic-packaging/1-thumb.webp" alt="Cosmetic packaging case" width="100%"></a><br/>
      <strong><code>cosmetic-packaging</code></strong><br/>
      <sub>Premium skincare gift-box composition.</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/storyboards-and-sequences%2Fanime-key-visual%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/storyboards-and-sequences/anime-key-visual/1-thumb.webp" alt="Anime key visual case" width="100%"></a><br/>
      <strong><code>anime-key-visual</code></strong><br/>
      <sub>Game-launch key art with crop-safe layout.</sub>
    </td>
  </tr>
</table>

<sub>↑ 12 selected cases from the 160+ public case library - <a href="./skills/gpt-image-2/README.md#case-gallery"><b>open the skill gallery</b></a> for more templates, or browse the <a href="https://gpt-image2.mmh1.top/#/case">live website</a>.</sub>

Links: [README](./skills/gpt-image-2/README.md) · [SKILL.md](./skills/gpt-image-2/SKILL.md) · [Website](./website/gpt-image2-website) · <!-- DOWNLOAD:gpt-image-2:start -->[Download v1.0.4 .zip](https://github.com/ConardLi/garden-skills/releases/download/gpt-image-2-v1.0.4/gpt-image-2-1.0.4.zip)<!-- DOWNLOAD:gpt-image-2:end -->

---

### [`xquik-social-data`](./skills/xquik-social-data)

![Xquik Social Data Skill](https://xquik.com/icon.svg)

**Category:** Social Data / Automation
**Best for:** building Xquik-backed X/Twitter data workflows with REST, MCP, SDKs, extraction jobs, monitors, webhooks, and confirmation-gated write actions.

`xquik-social-data` helps agents choose the right Xquik integration path while keeping credentials, untrusted X content, and write approvals under control. It is useful when a task needs bounded X data reads, larger exports, agent or IDE MCP setup, webhook delivery, monitoring, or carefully confirmed X actions.

Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.

Highlights:

- Starts from current Xquik docs, API reference, MCP guide, and the official skill repository
- Guides one-off REST and MCP reads, extraction jobs, monitors, HMAC webhooks, SDK use, and write-action planning
- Keeps API keys in host secret or environment systems and out of chat, logs, examples, and commits
- Treats tweets, bios, DMs, articles, display names, and API errors as untrusted data
- Requires explicit approval before private reads, persistent resources, webhook destinations, writes, deletes, DMs, profile updates, or account changes

Links: [README](./skills/xquik-social-data/README.md) · [SKILL.md](./skills/xquik-social-data/SKILL.md) · [Docs](https://docs.xquik.com) · <!-- DOWNLOAD:xquik-social-data:start -->_(no release yet - coming soon)_<!-- DOWNLOAD:xquik-social-data:end -->

---

### [`kb-retriever`](./skills/kb-retriever)

![Kb Retriever Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/kb-retriever-skill.webp)

**Category:** Retrieval / Local Knowledge Base  
**Best for:** answering questions from a local `knowledge/` directory, searching structured documentation, and extracting evidence from Markdown, text, PDF, and Excel files without flooding the agent context.

`kb-retriever` is a local knowledge-base retriever built around careful, progressive search. Instead of loading whole files, it navigates hierarchical index files, narrows the candidate set, processes complex file types correctly, and answers with sources.

Highlights:

- Uses layered `data_structure.md` files to navigate the knowledge base before searching content
- Enforces a **learn-before-process** rule for PDF and Excel files, using the included reference docs before extraction or analysis
- Combines precise keyword search, local windowed reads, synonyms, and iterative refinement
- Bounds retrieval to at most 5 search rounds so exploration stays controlled
- Includes workflows for `grep`, `pdftotext`, `pdfplumber`, and `pandas`, with source-aware answer formatting

Links: [README](./skills/kb-retriever/README.md) · [SKILL.md](./skills/kb-retriever/SKILL.md) · <!-- DOWNLOAD:kb-retriever:start -->[Download v1.0.1 .zip](https://github.com/ConardLi/garden-skills/releases/download/kb-retriever-v1.0.1/kb-retriever-1.0.1.zip)<!-- DOWNLOAD:kb-retriever:end -->

---

### [`beautiful-article`](./skills/beautiful-article)

![Beautiful Article Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/banner.webp)

**Category:** Editorial · Any source → beautiful article  
**Best for:** turning URLs, PDFs, DOCX, Markdown, plain text, screenshots, and pasted notes into a **polished, share-ready article** - long-form, briefings, explainers, tutorials, post-mortems, visual essays, dialogue transcripts.

`beautiful-article` is an editorial harness skill: it does not just "make a webpage", it edits and designs the source material into a polished article that is easier to read, share, and archive than the original. The skill flows through a small `source → plan → double-confirmation → build → final review → repair` loop and pauses at three hard checkpoints so the user keeps editorial control over article type, theme, layout, image strategy, cover, and delivery format.

Highlights:

- **Article first** - the focus is the *article*: better reading, better pacing, better aesthetics. Delivery is a self-contained file (HTML, optional PDF), but that's a delivery detail, not the goal
- **Reacticle component protocol** - prose-first semantic components (Hero / Lead / Section / Quote / Callout / Image / Formula / CodeBlock / Table…) plus a theme-token-only `Raw` free layer; the underlying React library lives at [`ConardLi/reacticle`](https://github.com/ConardLi/reacticle)
- **10 article types with bundled retention ratios** - `longform · ~100%` / `tutorial · ~90%` / `full-report · ~80%` / `explainer · ~80%` / `dialogue · ~80%` / `review · ~70%` / `essay · ~70%` / `briefing · ~50%` / `visual-essay · ~40%` / `interactive-explainer · ~25% excerpt + 75% AI-rebuild`
- **11 authoring theme profiles** (`tufte`, `press`, `bayer`, `bodoni`, `vignelli`, `sottsass`, `freddie`, `andy`, `fuller`, `knuth`, `shannon`) - each is a Markdown contract for the agent rather than a CSS file
- **Hard collaboration checkpoints** with item-by-item decision capture (no silent defaults), plus a 3:4 book-style cover, default-on TOC, and language-aware translation step
- **Per-node quality protocol** - main-agent inline checks for plan, sub-agent reviewers for first spread / sections / final review, repair as minimal slices

#### Theme gallery

<table>
<tr>
<td width="25%" align="center"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/tufte.webp" alt="tufte" width="100%"><br/><sub><b>tufte</b></sub></td>
<td width="25%" align="center"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/press.webp" alt="press" width="100%"><br/><sub><b>press</b></sub></td>
<td width="25%" align="center"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/bayer.webp" alt="bayer" width="100%"><br/><sub><b>bayer</b></sub></td>
<td width="25%" align="center"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/bodoni.webp" alt="bodoni" width="100%"><br/><sub><b>bodoni</b></sub></td>
</tr>
<tr>
<td width="25%" align="center"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/vignell.webp" alt="vignelli" width="100%"><br/><sub><b>vignelli</b></sub></td>
<td width="25%" align="center"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/sottsass.webp" alt="sottsass" width="100%"><br/><sub><b>sottsass</b></sub></td>
<td width="25%" align="center"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/freddie.webp" alt="freddie" width="100%"><br/><sub><b>freddie</b></sub></td>
<td width="25%" align="center"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/andy.webp" alt="andy" width="100%"><br/><sub><b>andy</b></sub></td>
</tr>
</table>

Links: [README](./skills/beautiful-article/README.md) · [SKILL.md](./skills/beautiful-article/SKILL.md) · <!-- DOWNLOAD:beautiful-article:start -->[Download v0.1.0 .zip](https://github.com/ConardLi/garden-skills/releases/download/beautiful-article-v0.1.0/beautiful-article-0.1.0.zip)<!-- DOWNLOAD:beautiful-article:end -->

---

## Install

There are five supported install paths. Pick the one that fits your stack:

| # | Method | Best for | Pinned version? |
|---|---|---|---|
| A | [`skills` CLI (`npx skills add`)](#option-a--skills-cli-npx) | Any agent, one-line install, pick & choose skills | ✅ via tag URL |
| B | [Claude Code plugin marketplace](#option-b--claude-code-plugin-marketplace) | Claude Code users who want to subscribe to plugin packs | ✅ via marketplace version |
| C | [Pinned `.zip` from GitHub Releases](#option-c--pinned-zip-from-releases) | CI / air-gapped envs / reproducible installs | ✅ ✅ (immutable) |
| D | [Manual copy after `git clone`](#option-d--manual-copy-into-your-project) | Local hacking on the skill itself | ❌ (tracks `main`) |
| E | [Git submodule](#option-e--git-submodule) | Vendored into a larger project, want upstream updates | ✅ via submodule SHA |

> Each skill section above also has a **`Download v<version> .zip`** link in
> its "Links:" row that points at the current pinned release artifact. Those
> URLs are auto-rewritten by [`scripts/release/update-readme.mjs`](./scripts/release/update-readme.mjs)
> on every release, so they always advertise the latest immutable version.

### Option A · `skills` CLI (npx)

The fastest agent-agnostic path. Uses the standard [`npx skills` CLI](https://www.npmjs.com/package/skills),
which auto-detects your agent (Claude Code, Cursor, Codex, etc.) and drops the
skill into the right directory.

```bash
# Install all skills (latest)
npx skills add ConardLi/garden-skills

# Install just one skill (latest)
npx skills add ConardLi/garden-skills -s web-design-engineer

# Install the Xquik social-data workflow skill
npx skills add ConardLi/garden-skills -s xquik-social-data

# Install globally (~/.skills) instead of per-project (./.skills)
npx skills add ConardLi/garden-skills -s gpt-image-2 --global

# Target a specific agent
npx skills add ConardLi/garden-skills -s kb-retriever -a claude-code
```

> **Defaults to the latest commit on `main`.** That's what you want 95% of the
> time - the CLI tracks each skill's most recent published `SKILL.md` straight
> from the source tree.

**Want a pinned version? (CI / production)** Use a tag-scoped `tree/` URL -
this points at the exact commit a release was cut from:

```bash
# Pin one skill to a specific release
npx skills add ConardLi/garden-skills/tree/web-design-engineer-v1.0.0/skills/web-design-engineer
```

For each skill, the current pinned `.zip` URL is also shown inline in its
"Links:" row above (the `Download v<version> .zip` link).

Useful sub-commands:

```bash
npx skills list                 # what's installed
npx skills find web-design      # search registries
npx skills update               # bump everything
npx skills remove kb-retriever  # uninstall
```

### Option B · Claude Code plugin marketplace

If you use [Claude Code](https://docs.anthropic.com/en/docs/claude-code), you
can subscribe to the marketplace and install plugin packs that bundle one or
more skills together:

```bash
/plugin marketplace add ConardLi/garden-skills
/plugin install presentation-skills@garden-skills
/plugin install web-design-skills@garden-skills
/plugin install knowledge-base-skills@garden-skills
/plugin install image-generation-skills@garden-skills
/plugin install social-data-skills@garden-skills
```

Plugin packs are declared in [`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json):

| Plugin pack | Skills included |
|---|---|
| `presentation-skills` | `web-video-presentation` |
| `web-design-skills` | `web-design-engineer` |
| `knowledge-base-skills` | `kb-retriever` |
| `image-generation-skills` | `gpt-image-2` |
| `social-data-skills` | `xquik-social-data` |

### Option C · Pinned `.zip` from Releases

Every formal release publishes an immutable `.zip` (with a SHA-256 checksum) to
[GitHub Releases](https://github.com/ConardLi/garden-skills/releases). Pin to
this from CI, Dockerfiles, or air-gapped installers when you need the exact
bytes to never move under you.

```bash
# Replace <skill> and <version> with the version you want.
SKILL=web-design-engineer
VERSION=1.0.0

curl -fsSL -o "${SKILL}.zip" \
  "https://github.com/ConardLi/garden-skills/releases/download/${SKILL}-v${VERSION}/${SKILL}-${VERSION}.zip"

# Verify the checksum (highly recommended for unattended installs)
curl -fsSL -o "${SKILL}.zip.sha256" \
  "https://github.com/ConardLi/garden-skills/releases/download/${SKILL}-v${VERSION}/${SKILL}-${VERSION}.zip.sha256"
shasum -a 256 -c "${SKILL}.zip.sha256"

# Drop the folder into the agent's skills directory
unzip -q "${SKILL}.zip" -d .claude/skills/   # or .agents/skills/, .codex/skills/, ...
```

A floating "always-latest" URL is also available - useful for one-off installs:

```bash
https://github.com/ConardLi/garden-skills/releases/latest/download/<skill>-<version>.zip
```

> **Pinned URLs for every skill are listed inline in this README** - see the
> "Download" line under each skill's "Links" entry above. They are kept in sync
> automatically by the release pipeline.

### Option D · Manual copy into your project

Clone the repo and copy the skill folder you want - handy if you want to fork
or hack on the skill itself.

```bash
git clone https://github.com/ConardLi/garden-skills.git
cp -r garden-skills/skills/web-design-engineer  your-project/.claude/skills/
# Cursor / generic agent:
cp -r garden-skills/skills/web-design-engineer  your-project/.agents/skills/
```

The agent discovers the skill the next time it scans the workspace.

### Option E · Git submodule

For vendoring into a larger project where you want to track upstream updates:

```bash
git submodule add https://github.com/ConardLi/garden-skills.git vendor/garden-skills
ln -s ../../vendor/garden-skills/skills/web-design-engineer .claude/skills/web-design-engineer
```

Pin to a release tag for reproducibility:

```bash
cd vendor/garden-skills
git checkout web-design-engineer-v1.0.0
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

> The `SKILL.md` format is portable by design - if your agent supports skills, copy the folder into the directory it scans, and it should work. PRs welcome to extend this matrix.

---

## What is a Skill?

A **Skill** is a self-contained folder the agent can load on-demand. It's
just a `SKILL.md` (YAML frontmatter + instructions), optionally accompanied
by reference docs, scripts, and assets:

```text
<skill-name>/
├── SKILL.md      ← required: when to use it + how to do it
├── README.md     ← human-facing docs
├── references/   ← optional: extended docs the agent loads on demand
├── scripts/      ← optional: deterministic executable helpers
└── assets/       ← optional: templates, fonts, icons
```

The agent decides whether to activate the skill from the `description` line
in the frontmatter - so the description is the contract between you and the
agent. For the full spec, see [agentskills.io](https://agentskills.io) and
[Anthropic's reference repository](https://github.com/anthropics/skills).

---

## Contributing

Bug reports, new skills, and tooling improvements are all welcome.

The maintainer-facing docs - repository layout, release process, version
rules, CI workflow, troubleshooting - live in
[**`CONTRIBUTING.md`**](./CONTRIBUTING.md) ([中文](./CONTRIBUTING.zh-CN.md)).
Read that first if you want to add a skill or cut a release.

Quick orientation:

```bash
git clone https://github.com/ConardLi/garden-skills.git
cd garden-skills
npm run list      # show all skills + manifest status
npm run validate  # the same check CI runs on every PR
```

---

## Acknowledgments

This collection stands on the shoulders of:

- **[Anthropic](https://www.anthropic.com)** for the [Agent Skills spec](https://agentskills.io) and the [`anthropics/skills`](https://github.com/anthropics/skills) reference repository.
- **[Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs)** - the system prompt that inspired `web-design-engineer`. The original is preserved in [`dist/prompts/claude-design-system-prompt.md`](./dist/prompts/claude-design-system-prompt.md) for reference.
- The broader OSS skill community - see [`travisvn/awesome-claude-skills`](https://github.com/travisvn/awesome-claude-skills) and [`obra/superpowers`](https://github.com/obra/superpowers) for further discovery.

---

## Connect

| 平台 | 账号名称 | 链接 |
| --- | --- | --- |
| X/Twitter | code秘密花园 | https://x.com/GardenConardLi  |
| B 站 | code秘密花园 | https://space.bilibili.com/474921808 |
| 抖音 | code秘密花园 | https://v.douyin.com/i5b33Xfv/ |
| YouTube | code秘密花园 | https://www.youtube.com/@garden-conard |
| 小红书 | code秘密花园 | https://www.xiaohongshu.com/user/profile/5af45e78f7e8b903d6e04618 |
| 公众号 | code秘密花园 | https://cdn.jsdelivr.net/gh/ConardLi/easy-dataset@main/public/imgs/weichat.jpg |
| GitHub | ConardLi | https://github.com/ConardLi |
| 个人网站 | Easy AI | https://mmh1.top |

---


## License

[MIT](./LICENSE) © [ConardLi](https://github.com/ConardLi)
