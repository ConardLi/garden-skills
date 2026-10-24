# Motion Showreel Skill

**Code-rendered motion videos, from logo stings to chapter-based films up to 20 minutes, with independent music/SFX sources, supplied narration or TTS, and editable source.**

[中文文档](./README.zh-CN.md) · [Back to collection root](../../README.md)

![Motion Showreel Skill](../../dist/imgs/covers/motion-showreel.webp)

---

## What Is This?

`motion-showreel` turns an idea into a finished video (MP4 plus editable source), mostly graphics, type or interface animation. After confirming the requirements and style frames, the agent renders a deterministic web page frame by frame. Picture and sound share one timeline; narrated films follow the actual speech timings.

It is designed for:

- Motion showreels and portfolio pieces
- Product teasers and launch films (from the user's own facts and screenshots)
- UI motion demos: morph chains, micro-interactions
- Kinetic typography and beat-synced quote cards
- Logo stings, title sequences and channel bumpers
- Generative-art loops and data "number drops"
- Era-spanning retrospectives that change medium as they go (pixel → vector → 3D …)

Short pieces typically run 5–60 s; chapter-based videos can run up to **20 minutes**, with or without narration. Use [`web-video-presentation`](../web-video-presentation) for click-driven talks or article-to-script work, and [`web-design-engineer`](../web-design-engineer) for websites/prototypes. Photoreal people, filming and general video editing remain outside this skill.

Required before production: **topic/content, duration, landscape or portrait, music source, SFX source, and narration mode**. Music and SFX independently use AI synthesis, user files or an explicit off choice. Narration can be absent, user audio, or TTS; **TTS must read a script supplied by the user**, with a configured API (Gemini, MiniMax or a custom adapter). Duration conflicts require confirmation; speech is never silently cut, sped up or rewritten.

Supporting material, audience/platform and style are optional. Specific user instructions or the supplied script can provide the content; otherwise request concrete material or research the topic, preserving factual sources. With no style specified, offer three distinct directions.

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
The exported MP4 (<code>out/editor-&lt;task-id&gt;.mp4</code> from the workspace) + <code>out/poster.png</code><br/>
<code>brief.md</code>: a reusable structured prompt<br/>
<code>index.html</code> / <code>timeline.js</code> / <code>score.mjs</code>: editable source<br/>
<code>sh build.sh</code>: rebuild everything, or one segment<br/>
<code>qa/</code>: contact sheets, phone-size check, per-shot motion, text-framing marks, waveform and spectrum<br/>
Technical checks (all PASS) and an honest review log
</sub></td>
</tr>
</table>

---

## Core Ideas

- **Picture = a function of time.** The page exposes a deterministic `window.render(t)` (no `Math.random`, timers, rAF or CSS animation). Playwright captures every frame and ffmpeg encodes the MP4. Motion blur (`--subframes`), supersampling (`--dpr`) and film grain (`--grain`) are render flags, not page code.
- **One timeline for picture and sound.** `timeline.js` holds every cut, hit and cue; the page and the score both import it, so hits land on the exact frame.
- **Benchmark first, then three structures.** Before anything is drawn, the agent picks 1–2 reference works (what to learn, what not to copy) and writes down three candidate structures. A reference video can be measured: `inspect.mjs grid` finds its cuts and the beat grid they sit on, `heat` shows where each segment moves. The first idea that comes to mind is usually the style's cliché.
- **A style library that is a starting point, not a menu.** 43 styles, each with fixed rules for look, palette, type, motion, camera grammar, sound palette, native moves and pitfalls. Every style also lists 8–12 recognition signals to pick 2–3 from and spells out its own cliché, so choosing "synthwave" does not mean the same grid-and-sunset every time. Use one, adapt it, mix two, or write your own from the template.
- **Sound gets its own direction.** The brief covers sound too: a reference, groove, harmony, palette and dramatic arc. A list of audio defaults keeps pieces from all ending up with the same song.
- **Watch production when requested.** If the initial feedback asks to watch progress, the agent opens a stable progress page early and publishes checked style frames, voice samples, scenes and mixes. Final preview and export stay in the same page, with the existing production and acceptance checks. See [`references/progress.md`](./references/progress.md).
- **Approve requirements, style and the finished preview.** Confirm the completed requirements and style frames, then review the finished scenes in the workspace before exporting MP4. With no style specified, offer three distinct directions. Creative freedom does not silently choose missing production specifications.
- **Voice-led timing and chapter builds.** TTS reads the user's script; imported recordings use real segment timestamps. Pictures follow speech, music/SFX yield during narration, and long builds reuse persistent chapter caches after failures.
- **Continuous scenes.** Storyboards track object states and spatial continuity across sentences. Keyword events use measured word timestamps or manual anchors; audio preview supports scrubbing and frame stepping. Representative motion samples accompany style confirmation when the direction depends on movement.
- **Technical acceptance is separate from taste.** Programmatic checks (size, fps, duration, frame count, black frames, loudness, true peak, loop seams, determinism) must all pass. Measured review material sits next to them without blocking anything: per-shot motion with sudden jumps and one-frame flashes, and a text-framing pass (text cut by the frame, overlapping, in the safe zone, too small). The agent's review notes help the user watch faster; they never replace the user's own viewing.
- **Free mode.** Say "go all out" or "surprise me" and the agent keeps only the baseline rules and the technical pipeline. Style, structure and technique are left to the model.

---

## Workflow

```text
0  Environment check (once)
1  Requirements ─────── fill missing required choices, summarize; 🛑 wait for confirmation
2  brief.md ─────────── benchmark → format + style → Reel Read → shot list + audio plan
3  Style frames ─────── style given → 3 frames; no style → 3 directions × 1 frame; 🛑 wait for confirmation
4  Create ───────────── prepare real narration timings if used → timeline → shots → web checks
5  Music / SFX / mix ── independent sources; voice has priority
6  Workspace preview ─ open the editor, review and revise; 🛑 wait for export approval
7  Export / acceptance  encode MP4 → technical checks (must PASS) + final review
8  Delivery
```

See [`references/editor.md`](./references/editor.md) for the default review workspace and export approval; [`references/narration.md`](./references/narration.md) for TTS, recording timestamps and independent-track mixing; [`references/long-form.md`](./references/long-form.md) for chapter caching, recovery and audio preparation over two minutes. All existing styles, audio engines, beat tools, loops and rendering controls remain available.

---

## Style Library

43 styles in 8 groups: graphics & type, interface & product, retro & screens, 3D & material, generative & abstract, illustration & comics, handmade, cinematic. Rendered style previews (the final three are 4-second seamless loops at 20 fps):

<table>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-ukiyo-e.webp" alt="ukiyo-e" /><br /><sub><code>ukiyo-e</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-glass-material.webp" alt="glass-material" /><br /><sub><code>glass-material</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-kinetic-brutalist.webp" alt="kinetic-brutalist" /><br /><sub><code>kinetic-brutalist</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-swiss-editorial.webp" alt="swiss-editorial" /><br /><sub><code>swiss-editorial</code></sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-ink-wash.webp" alt="ink-wash" /><br /><sub><code>ink-wash</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-risograph-print.webp" alt="risograph-print" /><br /><sub><code>risograph-print</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-editorial-collage.webp" alt="editorial-collage" /><br /><sub><code>editorial-collage</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-isometric-infographic.webp" alt="isometric-infographic" /><br /><sub><code>isometric-infographic</code></sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-liquid-shader.webp" alt="liquid-shader" /><br /><sub><code>liquid-shader</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-data-motion.webp" alt="data-motion" /><br /><sub><code>data-motion</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-generative-geometry.webp" alt="generative-geometry" /><br /><sub><code>generative-geometry</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-pixel-game.webp" alt="pixel-game" /><br /><sub><code>pixel-game</code></sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-synthwave-neon.webp" alt="synthwave-neon" /><br /><sub><code>synthwave-neon</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-paper-cut.webp" alt="paper-cut" /><br /><sub><code>paper-cut</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-minimal-ui.webp" alt="minimal-ui" /><br /><sub><code>minimal-ui</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-comic-pop.webp" alt="comic-pop" /><br /><sub><code>comic-pop</code></sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-flat-vector.webp" alt="flat-vector" /><br /><sub><code>flat-vector</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-guochao.webp" alt="guochao" /><br /><sub><code>guochao</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-painterly.webp" alt="painterly" /><br /><sub><code>painterly</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-glitch-digital.webp" alt="glitch-digital" /><br /><sub><code>glitch-digital</code></sub></td>
</tr>
<tr>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-soft-organic.webp" alt="soft-organic" /><br /><sub><code>soft-organic</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-hologram-hud.webp" alt="hologram-hud" /><br /><sub><code>hologram-hud</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-particle-field.webp" alt="particle-field" /><br /><sub><code>particle-field</code></sub></td>
<td align="center" width="25%"><img src="../../dist/imgs/motion-showreel/style-art-deco.webp" alt="art-deco" /><br /><sub><code>art-deco</code></sub></td>
</tr>
</table>

<sub>Also in the library: <code>dark-keynote</code> · <code>soft-3d-toy</code> · <code>crt-vhs</code> · <code>terminal-ascii</code> · <code>crayon-storybook</code> · <code>copperplate-engraving</code> · <code>cinematic-title</code> · <code>mixed-media-era</code>. See <a href="./references/styles/INDEX.md"><code>references/styles/INDEX.md</code></a> for the directory, the three-direction rule and how to mix styles.</sub>

More style guides: [Art Deco](./references/styles/art-deco.md), [One-Line](./references/styles/one-line.md), [Blueprint](./references/styles/blueprint.md), [Hologram HUD](./references/styles/hologram-hud.md), [Stained Glass](./references/styles/stained-glass.md), [Tilt-Shift Miniature](./references/styles/tilt-shift-miniature.md), [Pixel Diorama](./references/styles/pixel-diorama.md), [80s Cel Animation](./references/styles/cel-anime-80s.md), [Rubber Hose](./references/styles/rubber-hose.md), and [Shadow Puppet](./references/styles/shadow-puppet.md). Each follows the same template, with material and motion rules plus optional implementation directions.

You can also use: [Whiteboard Explainer](./references/styles/whiteboard-explainer.md), [Math / Concept Morph](./references/styles/concept-morph.md), and [Illuminated Manuscript](./references/styles/illuminated-manuscript.md).

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
│   ├── formats.md           Formats, including narration and chapter-based films
│   ├── styles/              INDEX.md + _template.md + 40 style files
│   ├── craft.md             rhythm, motion, transitions, camera, type, colour, texture, signature moments, default-look blocklist
│   ├── sound.md             sound direction, synth API, Tone.js, arcs, groove / harmony vocabulary, mixing, audio defaults
│   ├── narration.md         user-script TTS, recording timestamps, keyword events and voice-first mixing
│   ├── long-form.md         up to 20 minutes, chapter manifests, caching and recovery
│   ├── stack.md             page contract, determinism, per-tech pitfalls, fonts, multi-format, performance
│   ├── recipes.md           ready-made snippets (masked type, morph chains, particle type, seamless loops, WebGL post, canvas pseudo-3-D …)
│   ├── brief-template.md    the structured prompt every piece starts from
│   └── review.md            technical checks, review sheet, independent review, common problems, delivery checklist
├── scripts/
│   ├── setup.sh · check-env.mjs · scaffold.sh
│   ├── render.mjs           stills, sheets, three directions, poster, determinism, text framing, proxy, master
│   ├── audio.mjs            build · check · beats · samples · mux
│   ├── narration.mjs        tts · import · mix · check
│   ├── progress.mjs         Optional stage updates, image/audio artifacts and stable previews
│   ├── editor.mjs           default review workspace, track edits, saves and approved exports
│   ├── preview.mjs          lightweight audio playback, scrubbing, frame stepping and speed
│   ├── build-long.mjs       Persistent chapter cache, retry, assembly and acceptance
│   ├── inspect.mjs          qa · sheet · phone · strip · frames · motion · loop · grid · heat
│   ├── lib/                 synth, Tone.js renderer, FFT, browser, project, frame analysis, text hook
│   └── test/                regression tests (npm test)
└── assets/starter/          page, motion/timeline/narration helpers, preview controls, scores and build.sh
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

The agent first confirms the completed requirements, then scaffolds `<slug>/` and shows the style frames. After style approval it creates the scenes and sound, then opens the editing workspace by default. MP4 rendering starts only after you click Export or approve the current preview in chat. Silent pieces and loops follow the same sequence; multi-page films are previewed chapter by chapter. Short requests above start the conversation; missing production choices are asked instead of silently defaulted. To rebuild or tweak later:

```bash
node scripts/editor.mjs <slug> --size 1920x1080 --fps 30   # default: review in the workspace before Export
sh <slug>/build.sh                                   # approved rebuild; does not apply workspace audio edits
node scripts/preview.mjs <slug> --size 1920x1080 --fps 30   # lightweight debugging
node scripts/render.mjs <slug> --start 6 --duration 3 --out out/seg.mp4   # re-render one segment
node scripts/build-long.mjs <slug>/chapters.json       # persistent chapter rebuild
```

Tools ship with their own regression tests: `cd scripts && npm test`.
