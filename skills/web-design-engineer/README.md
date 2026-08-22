# Web Design Engineer Skill

**An AI agent skill that transforms AI-generated web pages from "functional" to "stunning."**

[中文文档](./README.zh-CN.md) · [Back to collection root](../../README.md)

![Web Design Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design-skill.webp)

---

## What Is This?

This is a reusable **Skill** (structured system prompt) for AI coding agents — such as [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Cursor](https://cursor.com), and other tools that support the `SKILL.md` format — that dramatically improves the design quality of AI-generated HTML/CSS/JavaScript artifacts.

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
- **Five-dial Design Read** — turns audience, artifact, brand, and constraints into visible variance / motion / density / asset / fidelity decisions
- **Preservation-aware redesigns** — separates extension, preserve, and overhaul modes before touching an existing product
- **Contextual failure patterns** — detects recurring layout, content, imagery, motion, and dashboard failures without turning taste into universal bans
- **Structured workflow** — requirements → context → calibrated design system → v0 draft → full build → verification
- **Opt-in browser acceptance** — executable responsive / interaction / runtime QA only when the user explicitly requests acceptance or browser testing

---

## Quick Start

### For Claude Code / Cursor / AI Agents

Copy this skill folder into your project:

```
your-project/
├── .agents/skills/web-design-engineer/   # or .claude/skills/web-design-engineer/
│   ├── SKILL.md                          # Main skill file
│   ├── agents/openai.yaml                # Host-facing display metadata and default prompt
│   └── references/
│       ├── advanced-patterns.md          # Code template library (slide engine, device frames, motion timelines, data viz)
│       ├── block-library.md               # Index of implemented reusable blocks
│       ├── browser-acceptance.md          # Explicit-request-only executable browser QA harness
│       ├── design-calibration.md          # Design Read + five dials + optional image-first branch
│       ├── design-directions.md          # Design Direction Advisor (6 schools, differentiated 3-pick recommendation)
│       ├── failure-patterns.md            # Contextual AI-design failure taxonomy and repairs
│       ├── redesign-protocol.md           # Extension / Preserve / Overhaul audit and protected contracts
│       ├── style-recipes/                # 25 anchored style recipes — one .md file per anchor, loaded on demand
│       │   ├── INDEX.md                   #   Catalog index + 3 cross-indexes + cross-cutting anti-patterns
│       │   ├── linear.md / aesop.md / pentagram.md / ...    #   25 single-recipe files
│       └── critique-guide.md             # 5-dimension scoring rubric + common issues catalog
└── ...
```

Or use the Claude Code plugin marketplace from the collection root — see the [top-level README](../../README.md#install).

The agent will automatically pick up the skill when your request involves visual/interactive front-end work.

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

### The Calibrated Workflow

```
1. Understand requirements  →  Ask only when information is insufficient
2. Gather design context    →  Code > screenshots; classify existing-work mode
3. Produce a Design Read    →  Five dials connect the brief to visible decisions
4. Declare design system    →  Colors, fonts, spacing, motion — in Markdown, before code
5. Show v0 draft early      →  Placeholders + layout + tokens; let the user course-correct
6. Full build               →  Components, states, motion; pause at key decision points
7. Verify                   →  Lightweight self-check; browser harness only on explicit request
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

**Anchored style-recipe library (25 named recipes, progressively loaded).** When the user names an anchor ("Linear-style", "Aesop feeling", "Pentagram-grade type"), the agent reads **only the matching file** at `references/style-recipes/<anchor>.md` (~50 lines). The catalog index, 3 cross-indexes, and cross-cutting anti-patterns live in `references/style-recipes/INDEX.md` (~150 lines). The full catalog is never loaded at once. The 25 recipes are spread across 7 schools (the 6 Direction-Advisor schools plus a *Specialty / Genre* school reachable only via direct anchor names):

| School | Recipes |
|---|---|
| Editorial / Minimalist | `apple-hig` · `muji-kenya-hara` · `aesop` · `dieter-rams-braun` · `monocle-magazine` |
| Information Architecture | `pentagram` · `vignelli-swiss-helvetica` · `bloomberg-terminal` · `tufte-dataink` · `nyt-the-daily` |
| Modern Tool / Builder SaaS | `linear` · `vercel-mesh` · `raycast` · `notion-pre-ai` |
| Motion / Experimental | `field-io` · `active-theory` · `resn-storytelling` |
| Brutalist / Raw | `are-na` · `bloomberg-businessweek-turley` · `balenciaga-post-2017` |
| Warm Humanist | `mailchimp-freddie` · `stripe-press` · `headspace-meditation` |
| Specialty / Genre | `y2k-retrofuturism` · `mid-century-modern` |

---

## Style Recipe Gallery

The skill ships **25 named recipes**, each tied to a real brand, studio, or designer. Every recipe has a working, full-page artefact in the demo gallery — not a shared template, not a thumbnail mood-board, but the form each recipe was actually designed for: an apothecary product page for Aesop, a trading workstation for Bloomberg Terminal, a Saul-Bass poster for Mid-Century, a Y2K portal for Retrofuturism. Browse by school below, pick the one whose vibe matches your brief, or read the spec file at `references/style-recipes/<recipe>.md`. Click any preview to open the full-resolution 2:1 frame.

> Frames are real artefacts rendered by the live React + Vite gallery at [`demo/web-design-engineer-demo`](../../demo/web-design-engineer-demo/) — same fonts, same palettes, same signature moves as the recipe spec. Each demo is in `src/recipes/<id>.tsx`.

### Editorial / Minimalist · 5 recipes

> Whitespace, refined typography, quiet luxury — the apothecary, the museum catalogue, the hardware product page.

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/apple-hig.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/apple-hig.webp" alt="apple-hig preview" /></a>
<br /><strong><code>apple-hig</code></strong>
<br /><sub>SF Pro Display, generous whitespace, soft elevation — the Apple Store voice</sub>
<br /><sub><b>Best for</b> · hardware product pages · device launches · premium consumer tech</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/muji-kenya-hara.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/muji-kenya-hara.webp" alt="muji-kenya-hara preview" /></a>
<br /><strong><code>muji-kenya-hara</code></strong>
<br /><sub>Emptiness as canvas, ash &amp; paper, every object photographed in air</sub>
<br /><sub><b>Best for</b> · object catalogues · houseware brands · slow-living storefronts</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/aesop.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/aesop.webp" alt="aesop preview" /></a>
<br /><strong><code>aesop</code></strong>
<br /><sub>Warm chamois, sage &amp; amber, serif copy that reads like a literary magazine</sub>
<br /><sub><b>Best for</b> · apothecary product pages · beauty &amp; wellness · independent retailers</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/dieter-rams-braun.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/dieter-rams-braun.webp" alt="dieter-rams-braun preview" /></a>
<br /><strong><code>dieter-rams-braun</code></strong>
<br /><sub>Ten principles, monochrome grids, technical orthographics — function as form</sub>
<br /><sub><b>Best for</b> · industrial-design archives · hardware specs · brand-principle pages</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/monocle-magazine.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/monocle-magazine.webp" alt="monocle-magazine preview" /></a>
<br /><strong><code>monocle-magazine</code></strong>
<br /><sub>Cosmopolitan briefings, navy &amp; coral, footnoted curiosity</sub>
<br /><sub><b>Best for</b> · magazine contents · city &amp; travel briefings · lifestyle journals</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>Best when the brief says</strong>
<br /><sub>"refined" · "premium" · "quiet" · "editorial" · "less is more"</sub>
<br /><br />
<sub>See specs in <a href="./references/style-recipes/">style-recipes/</a></sub>
<br /><br />
</td>
</tr>
</table>

### Information Architecture · 5 recipes

> Rational, data-driven, restrained — wayfinding, terminals, footnoted essays, the newspaper of record.

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/pentagram.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/pentagram.webp" alt="pentagram preview" /></a>
<br /><strong><code>pentagram</code></strong>
<br /><sub>One bold typeface used as artwork, grid as scaffold, ink + ground only</sub>
<br /><sub><b>Best for</b> · identity specimens · type-led portfolios · gallery announcements</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/vignelli-swiss-helvetica.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/vignelli-swiss-helvetica.webp" alt="vignelli-swiss-helvetica preview" /></a>
<br /><strong><code>vignelli-swiss-helvetica</code></strong>
<br /><sub>Helvetica at every size, six primary colours, the NYC Subway diagram</sub>
<br /><sub><b>Best for</b> · wayfinding &amp; transit · public-info posters · brand-system specimens</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-terminal.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-terminal.webp" alt="bloomberg-terminal preview" /></a>
<br /><strong><code>bloomberg-terminal</code></strong>
<br /><sub>Amber on navy-black, mono everywhere, density over comfort</sub>
<br /><sub><b>Best for</b> · trading dashboards · ops consoles · power-user dense tools</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/tufte-dataink.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/tufte-dataink.webp" alt="tufte-dataink preview" /></a>
<br /><strong><code>tufte-dataink</code></strong>
<br /><sub>Sparklines in body copy, small multiples, no chartjunk</sub>
<br /><sub><b>Best for</b> · data narratives · research write-ups · academic essays</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/nyt-the-daily.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/nyt-the-daily.webp" alt="nyt-the-daily preview" /></a>
<br /><strong><code>nyt-the-daily</code></strong>
<br /><sub>Cheltenham over Imperial, dateline above all, the gravity of the broadsheet</sub>
<br /><sub><b>Best for</b> · news features · podcast hubs · long-form journalism</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>Best when the brief says</strong>
<br /><sub>"data-heavy" · "wayfinding" · "dense" · "rational" · "of record"</sub>
<br /><br />
<sub>See specs in <a href="./references/style-recipes/">style-recipes/</a></sub>
<br /><br />
</td>
</tr>
</table>

### Modern Tool / Builder SaaS · 4 recipes

> Hairline detail, warm dark, single accent — the developer-tool aesthetic of the late 2020s.

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/linear.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/linear.webp" alt="linear preview" /></a>
<br /><strong><code>linear</code></strong>
<br /><sub>Warm dark, hairline borders, purple flicks of accent, shortcut chips</sub>
<br /><sub><b>Best for</b> · dev-tool landing pages · issue / project SaaS · API &amp; infra products</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/vercel-mesh.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/vercel-mesh.webp" alt="vercel-mesh preview" /></a>
<br /><strong><code>vercel-mesh</code></strong>
<br /><sub>Pure black, geometric mesh gradient, Geist Sans, command-line clarity</sub>
<br /><sub><b>Best for</b> · deploy / runtime tools · framework launches · technical hero pages</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/raycast.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/raycast.webp" alt="raycast preview" /></a>
<br /><strong><code>raycast</code></strong>
<br /><sub>Glass card on red-tinted void, keyboard-first, condensed list cells</sub>
<br /><sub><b>Best for</b> · command palettes · launcher apps · keyboard-driven tooling</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/notion-pre-ai.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/notion-pre-ai.webp" alt="notion-pre-ai preview" /></a>
<br /><strong><code>notion-pre-ai</code></strong>
<br /><sub>Off-white pages, drag-handle dots, casual emoji headings, callouts everywhere</sub>
<br /><sub><b>Best for</b> · workspace docs · internal wikis · friendly productivity apps</sub>
</td>
</tr>
</table>

### Motion / Experimental · 3 recipes

> Bold, generative, sensory — when the brief asks for "cinematic", "WebGL", or "award-bait".

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/field-io.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/field-io.webp" alt="field-io preview" /></a>
<br /><strong><code>field-io</code></strong>
<br /><sub>Particle systems behind editorial type, code-art aesthetic, dark studio</sub>
<br /><sub><b>Best for</b> · creative-tech studios · generative-art case studies · WebGL portfolios</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/active-theory.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/active-theory.webp" alt="active-theory preview" /></a>
<br /><strong><code>active-theory</code></strong>
<br /><sub>WebGL ambitions, full-bleed type, candy colours over deep black</sub>
<br /><sub><b>Best for</b> · cinematic product launches · campaign sites · award-bait microsites</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/resn-storytelling.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/resn-storytelling.webp" alt="resn-storytelling preview" /></a>
<br /><strong><code>resn-storytelling</code></strong>
<br /><sub>Surreal, lush, every frame a tableau, headlines on textured noise</sub>
<br /><sub><b>Best for</b> · narrative scrolls · entertainment / IP sites · agency reels</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>Best when the brief says</strong>
<br /><sub>"cinematic" · "WebGL" · "experiential" · "Awwwards-grade"</sub>
<br /><br />
<sub>See specs in <a href="./references/style-recipes/">style-recipes/</a></sub>
<br /><br />
</td>
</tr>
</table>

### Brutalist / Raw · 3 recipes

> Anti-design, honest, unpolished — the system-default web, tabloid covers, anti-luxury luxury.

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/are-na.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/are-na.webp" alt="are-na preview" /></a>
<br /><strong><code>are-na</code></strong>
<br /><sub>System fonts on purpose, browser-default blue links, the honest web</sub>
<br /><sub><b>Best for</b> · research channels · indie communities · anti-design content tools</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-businessweek-turley.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-businessweek-turley.webp" alt="bloomberg-businessweek-turley preview" /></a>
<br /><strong><code>bloomberg-businessweek-turley</code></strong>
<br /><sub>Yellow caution + black ink, type as collage, hand-cut headlines</sub>
<br /><sub><b>Best for</b> · editorial covers · opinion pieces · campaign posters</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/balenciaga-post-2017.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/balenciaga-post-2017.webp" alt="balenciaga-post-2017 preview" /></a>
<br /><strong><code>balenciaga-post-2017</code></strong>
<br /><sub>All caps, broken grids, deadpan product on white, anti-luxury luxury</sub>
<br /><sub><b>Best for</b> · fashion collections · drop announcements · contrarian luxury</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>Best when the brief says</strong>
<br /><sub>"raw" · "honest" · "anti-design" · "tabloid" · "uncomfortable"</sub>
<br /><br />
<sub>See specs in <a href="./references/style-recipes/">style-recipes/</a></sub>
<br /><br />
</td>
</tr>
</table>

### Warm Humanist · 3 recipes

> Approachable, organic, hand-touched — small-business cheerleader, hand-bound book, daily reset.

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/mailchimp-freddie.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/mailchimp-freddie.webp" alt="mailchimp-freddie preview" /></a>
<br /><strong><code>mailchimp-freddie</code></strong>
<br /><sub>Cavendish yellow, hand-drawn doodles, conversational copy, the SMB cheerleader</sub>
<br /><sub><b>Best for</b> · onboarding flows · SMB marketing tools · friendly consumer apps</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/stripe-press.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/stripe-press.webp" alt="stripe-press preview" /></a>
<br /><strong><code>stripe-press</code></strong>
<br /><sub>Cream paper, GT Super, hand-bound luxury, ideas as objects</sub>
<br /><sub><b>Best for</b> · book detail pages · long-form essays · publisher / press sites</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/headspace-meditation.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/headspace-meditation.webp" alt="headspace-meditation preview" /></a>
<br /><strong><code>headspace-meditation</code></strong>
<br /><sub>Orange suns, rounded blobs, hand-illustrated calm, a daily reset</sub>
<br /><sub><b>Best for</b> · meditation &amp; wellness · habit / mood apps · cosy consumer cards</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>Best when the brief says</strong>
<br /><sub>"friendly" · "approachable" · "human" · "cosy" · "hand-touched"</sub>
<br /><br />
<sub>See specs in <a href="./references/style-recipes/">style-recipes/</a></sub>
<br /><br />
</td>
</tr>
</table>

### Specialty / Genre · 2 recipes

> Period-coded, decade-coded, theme-coded — only reachable by direct anchor name.

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/y2k-retrofuturism.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/y2k-retrofuturism.webp" alt="y2k-retrofuturism preview" /></a>
<br /><strong><code>y2k-retrofuturism</code></strong>
<br /><sub>Chrome bevels, frosted glass, lava blobs, MSN-blue everywhere</sub>
<br /><sub><b>Best for</b> · Y2K nostalgia · early-web portals · gen-Z brand stunts</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/mid-century-modern.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/mid-century-modern.webp" alt="mid-century-modern preview" /></a>
<br /><strong><code>mid-century-modern</code></strong>
<br /><sub>Mustard, brick, cyan; cut-paper geometry; the optimism of 1957</sub>
<br /><sub><b>Best for</b> · poster homages · cultural events · vintage-print brand voice</sub>
</td>
</tr>
</table>

### Run the gallery yourself

```bash
cd demo/web-design-engineer-demo
npm install && npm run dev    # http://localhost:5181/
```

Hash-routed URLs (`#/linear`, `#/aesop`, …) deep-link to any recipe. Press `H` to toggle the recipe HUD, `Esc` to return to the gallery. See the demo's own [README](../../demo/web-design-engineer-demo/README.md) for layout details.

---

## Before & after: skill on / off

The repository's [`demo/web-design-demo/`](../../demo/web-design-demo) directory contains side-by-side comparisons of pages generated with and without this skill, using identical prompts. Open [`demo/web-design-demo/demo2/index.html`](../../demo/web-design-demo/demo2/index.html) for a side-by-side viewer.

### Demo 1: Space Exploration Museum

**Prompt:** *"Build a homepage for a fictional 'Space Exploration Museum' — full-screen hero, 4 exhibition sections, a timeline with 6+ milestones, a booking CTA, and a footer. Deep, immersive, cosmic feel."*

| | Without Skill | With Skill |
|---|---|---|
| **File** | `demo/web-design-demo/demo2/demo1.html` | `demo/web-design-demo/demo2/demo1-with-skill.html` |
| **Color system** | Hardcoded hex values (#7cf0ff, #b388ff) | oklch-based token system with CSS custom properties |
| **Typography** | Orbitron + Noto Serif SC | Instrument Serif + Space Grotesk + JetBrains Mono |
| **Layout** | Standard landing-page structure | Editorial magazine-style layout with grid compositions |
| **Details** | Heavy glow effects, neon gradients | Restrained palette, typographic hierarchy, decorative data elements |
| **Overall feel** | Enthusiastic junior designer | Experienced design director |

### Demo 2: Photographer Portfolio

**Prompt:** *"Build a homepage for an independent photographer's portfolio."*

| | With Skill |
|---|---|
| **File** | `demo/web-design-demo/demo2/demo2-with-skill.html` |
| **Character** | Creates a fictional Nordic photographer "Mira Høst" with a complete visual identity |
| **Color** | Paper-warm light (#f2efe8) + ink-dark (#161513) — extremely restrained two-tone palette |
| **Typography** | Instrument Serif (display) + Space Grotesk (UI) with extensive italic usage |
| **Layout** | Magazine-editorial structure with numbered sections, asymmetric grids, side rails |
| **Motion** | Slow Ken Burns on hero image (24s cycle), film-grain texture overlay |
| **Navigation** | `mix-blend-mode: difference` masthead — seamless across light/dark sections |

> The original Claude Design system prompt that inspired this skill is preserved at [`dist/prompt/claude-design-system-prompt.md`](../../dist/prompt/claude-design-system-prompt.md).

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
- **Design Direction Advisor** — six-school conversational tool for vague requests, with explicit handoff to the recipe library
- **25-recipe anchored style library** — each recipe tied to a real brand / studio / designer with concrete copy-able values; defends against AI-default mush
- **Advanced pattern library** — ready-to-use code templates for common UI patterns

---

## License

MIT
