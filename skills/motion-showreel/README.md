# Motion Showreel Skill

**Stunning short videos made entirely in code: motion showreels, product films, UI motion, kinetic typography, logo stings, generative loops and era-spanning retrospectives, with optional beat-synced music.**

[中文文档](./README.zh-CN.md) · [Back to collection root](../../README.md)

![Motion Showreel Skill: 22 styles running at once](../../dist/imgs/motion-showreel/banner.webp)

<sub>↑ One frame of the skill's own trailer: 22 styles running live in one page, all driven by the same `render(t)`.</sub>

---

## What Is This?

`motion-showreel` turns one sentence into a finished short video (MP4 plus editable source). The kind of video it makes is mostly graphics, type or interface animation. The agent writes a web page whose picture is a pure function of time, renders it frame by frame, scores it on the same timeline and checks the result before handing it over.

It is designed for:

- Motion showreels and portfolio pieces
- Product teasers and launch films (from the user's own facts and screenshots)
- UI motion demos: morph chains, micro-interactions
- Kinetic typography and beat-synced quote cards
- Logo stings, title sequences and channel bumpers
- Generative-art loops and data "number drops"
- Era-spanning retrospectives that change medium as they go (pixel → vector → 3D …)

Typical length is 5–60 s; music-driven pieces without narration can run to about 2 minutes. Out of scope: narrated explainers (use [`web-video-presentation`](../web-video-presentation)), web pages and prototypes (use [`web-design-engineer`](../web-design-engineer)), photoreal people, live footage and editing existing video.

---

## Showcase

Every clip below was made by an agent with this skill from a short request. For most of them the request was just a style and "the rest is up to you". These previews are 4-second, 12 fps excerpts; the real renders are 1920×1080 at 30 fps with sound.

<table>
<tr>
<td width="50%" valign="top"><img src="../../dist/imgs/motion-showreel/promo.webp" alt="Motion Showreel trailer: a new medium every beat" width="100%"><br/><strong>Motion Showreel trailer</strong> · 80 s<br/><sub>The skill's own trailer. One orange dot is redrawn in a new medium every beat (ink, paper, risograph, CRT, collage, glass, clay …), then bursts into a wall of 22 live styles. The synthesized score changes instruments with the medium.</sub></td>
<td width="50%" valign="top"><img src="../../dist/imgs/motion-showreel/afterglow.webp" alt="AFTERGLOW synthwave title" width="100%"><br/><strong>AFTERGLOW</strong> · 19 s · <code>synthwave-neon</code><br/><sub>Title sequence for a fictional album. The camera drives through neon gates; after the last gate there is half a beat of black, then the chrome title springs up from the horizon on the drop.</sub></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="../../dist/imgs/motion-showreel/boink.webp" alt="boink soft 3D chain reaction" width="100%"><br/><strong>boink</strong> · 18 s · <code>soft-3d-toy</code><br/><sub>A one-take chain reaction (after Honda's "Cog"). Every domino plays a marimba note; the jelly's slam sends a squash wave through the world, and the opening ball lands as the dot of the <i>i</i>.</sub></td>
<td width="50%" valign="top"><img src="../../dist/imgs/motion-showreel/last-stroke.webp" alt="LAST STROKE ink stick-figure game trailer" width="100%"><br/><strong>LAST STROKE</strong> · 30 s · custom "stick ink" style<br/><sub>Trailer for a fictional game where every line you draw becomes real. The single stroke through 40 enemies is followed by the film's only beat of total silence; then the enemies burst into ink and the stroke becomes the title.</sub></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="../../dist/imgs/motion-showreel/umbra.webp" alt="UMBRA cinematic eclipse title" width="100%"><br/><strong>UMBRA</strong> · 27 s · <code>cinematic-title</code><br/><sub>Opening titles for a fictional film about a total eclipse, letterboxed at 2.39:1. A beat of absolute silence, then the last Baily's bead flares into the diamond ring and the title develops inside the moon. The piano is a sampled Salamander grand (tier 2) with synthesized trailer sound design (booms, braam) layered on top.</sub></td>
<td width="50%" valign="top"><br/><strong>What you get for every piece</strong><br/><sub>
<code>out/final.mp4</code> + <code>out/poster.png</code><br/>
<code>brief.md</code>: a reusable structured prompt<br/>
<code>index.html</code> / <code>timeline.js</code> / <code>score.mjs</code>: editable source<br/>
<code>sh build.sh</code>: rebuild everything, or one segment<br/>
<code>qa/</code>: contact sheets, phone-size check, waveform and spectrum<br/>
Technical checks (all PASS) and an honest review log
</sub></td>
</tr>
</table>

---

## Core Ideas

- **Picture = a function of time.** The page exposes a deterministic `window.render(t)` (no `Math.random`, timers, rAF or CSS animation). Playwright captures every frame and ffmpeg encodes the MP4. Motion blur (`--subframes`), supersampling (`--dpr`) and film grain (`--grain`) are render flags, not page code.
- **One timeline for picture and sound.** `timeline.js` holds every cut, hit and cue; the page and the score both import it, so hits land on the exact frame.
- **Benchmark first, then three structures.** Before anything is drawn, the agent picks 1–2 reference works (what to learn, what not to copy) and writes down three candidate structures. The first idea that comes to mind is usually the style's cliché.
- **A style library that is a starting point, not a menu.** 22 styles, each with fixed rules for look, palette, type, motion, camera grammar, sound palette, native moves and pitfalls. Use one, adapt it, mix two, or write your own from the template.
- **Sound gets its own direction.** The brief covers sound too: a reference, groove, harmony, palette and dramatic arc. A list of audio defaults keeps pieces from all ending up with the same song.
- **One checkpoint, then all-out.** The only stop is the style-frame review. If no style was given, the agent offers three deliberately different directions, one key frame each. After that it builds autonomously.
- **Technical acceptance is separate from taste.** Programmatic checks (size, fps, duration, frame count, black frames, loudness, true peak, loop seams, determinism) must all pass. The agent's review notes help the user watch faster; they never replace the user's own viewing.
- **Free mode.** Say "go all out" or "surprise me" and the agent keeps only the baseline rules and the technical pipeline. Style, structure and technique are left to the model.

---

## Workflow

```text
0  Environment check (once)
1  Ask once ─────────── max 5 questions; anything inferable is not asked
2  brief.md ─────────── benchmark → format + style → Reel Read → beat grid + shot list + forbidden list
3  Style frames ─────── 🛑 the only checkpoint: style given → 3 frames; no style → 3 directions × 1 frame
4  Build ────────────── timeline → shot by shot → stills → determinism → proxy → master
5  Sound (optional) ─── synthesized / user's track / silent
6  Acceptance ───────── technical checks (must PASS) + review notes for the user
7  Delivery
```

---

## Style Library

22 styles in 7 groups: graphics & type, interface & product, retro & screens, 3D & material, generative & abstract, handmade, cinematic. A few of them, rendered by the skill:

<table>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-swiss-editorial.webp" alt="swiss-editorial" /><br /><sub><code>swiss-editorial</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-ink-wash.webp" alt="ink-wash" /><br /><sub><code>ink-wash</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-risograph-print.webp" alt="risograph-print" /><br /><sub><code>risograph-print</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-editorial-collage.webp" alt="editorial-collage" /><br /><sub><code>editorial-collage</code></sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-isometric-infographic.webp" alt="isometric-infographic" /><br /><sub><code>isometric-infographic</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-liquid-shader.webp" alt="liquid-shader" /><br /><sub><code>liquid-shader</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-data-motion.webp" alt="data-motion" /><br /><sub><code>data-motion</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-generative-geometry.webp" alt="generative-geometry" /><br /><sub><code>generative-geometry</code></sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-pixel-game.webp" alt="pixel-game" /><br /><sub><code>pixel-game</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-synthwave-neon.webp" alt="synthwave-neon" /><br /><sub><code>synthwave-neon</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-paper-cut.webp" alt="paper-cut" /><br /><sub><code>paper-cut</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-minimal-ui.webp" alt="minimal-ui" /><br /><sub><code>minimal-ui</code></sub></td>
</tr>
</table>

<sub>Also in the library: <code>kinetic-brutalist</code> · <code>dark-keynote</code> · <code>glass-material</code> · <code>soft-3d-toy</code> · <code>particle-field</code> · <code>crt-vhs</code> · <code>terminal-ascii</code> · <code>crayon-storybook</code> · <code>cinematic-title</code> · <code>mixed-media-era</code>. See <a href="./references/styles/INDEX.md"><code>references/styles/INDEX.md</code></a> for the directory, the three-direction rule and how to mix styles.</sub>

---

## Sound

| Tier | Engine | Good for |
|---|---|---|
| 1 · built-in synth (default) | `score.mjs`, zero-dependency and fully deterministic. Drums and hand percussion, bass, pads, plucks, mallets (marimba / glockenspiel / kalimba / steel pan), organ, formant choir, FM bells, ambience beds (tape, vinyl, wind, rain), swing / step rhythms, sidechain, bitcrush and tape wow | Electronic, UI, retro, abstract, handmade, lo-fi |
| 2 · Tone.js | `score.tone.js`, rendered offline in headless Chromium. Sampled instruments (Salamander grand piano, CC BY), convolution reverb, chorus / phaser / distortion | Cinematic, premium product, anything that needs a real instrument and space |
| Your track | `audio.mjs beats` detects BPM, beats, downbeats and drops (librosa when available); SFX are layered on top | Existing music |

The two tiers can be layered (Tone.js music underneath, synthesized SFX on top, mastered once). Every mix is mastered to −14 LUFS / −1 dBTP. The agent can't hear, so `audio.mjs check` reports loudness, band balance and silences, measures the "breath" before each declared drop, and draws a waveform and spectrum for the agent to look at.

---

## What It Ships

```text
skills/motion-showreel/
├── SKILL.md                 workflow, baseline rules, tool cheat sheet
├── README.md / README.zh-CN.md
├── manifest.json
├── references/
│   ├── formats.md           9 formats (showreel, product film, UI motion, kinetic type, logo, loop, data, era, green-screen)
│   ├── styles/              INDEX.md + _template.md + 22 style files
│   ├── craft.md             rhythm, motion, transitions, camera, type, colour, texture, signature moments, default-look blocklist
│   ├── sound.md             sound direction, synth API, Tone.js, arcs, groove / harmony vocabulary, mixing, audio defaults
│   ├── stack.md             page contract, determinism, per-tech pitfalls, fonts, multi-format, performance
│   ├── recipes.md           ready-made snippets (masked type, morph chains, particle type, seamless loops, WebGL post, canvas pseudo-3-D …)
│   ├── brief-template.md    the structured prompt every piece starts from
│   └── review.md            technical checks, review sheet, common problems, delivery checklist
├── scripts/
│   ├── setup.sh · check-env.mjs · scaffold.sh
│   ├── render.mjs           stills, sheets, three directions, poster, determinism, proxy, master
│   ├── audio.mjs            build · check · beats · samples · mux
│   ├── inspect.mjs          qa · sheet · phone · strip · frames · motion · loop
│   ├── lib/                 synth, Tone.js renderer, FFT, browser, project helpers
│   └── test/                regression tests (npm test)
└── assets/starter/          index.html · motion.js · timeline.js · score.mjs · score.tone.js · score.layer.mjs · build.sh
```

---

## Quick Start

Install the skill (see the [collection README](../../README.md#install)), then run the one-time setup from the skill folder:

```bash
sh scripts/setup.sh        # Playwright + Chromium + Tone.js, then an environment check
```

Requirements: **Node 18+** and **ffmpeg** on `PATH`. The setup script never installs system software for you.

Then just ask:

```text
Make a 15-second motion piece for our launch. Go all out.
Make a logo sting for "Garden", swiss-editorial style.
Turn these three screenshots into a 20-second product teaser, with music.
A 6-second seamless generative loop, no sound.
```

The agent scaffolds `<slug>/`, shows you style frames once, then builds, scores, checks and delivers. To rebuild or tweak later:

```bash
sh <slug>/build.sh                                   # full rebuild with the spec at the top of build.sh
node scripts/render.mjs <slug> --start 6 --duration 3 --out out/seg.mp4   # re-render one segment
```

Tools ship with their own regression tests: `cd scripts && npm test`.
