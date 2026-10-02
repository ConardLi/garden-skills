# Motion Showreel Skill

**Stunning 5–60 s short videos made entirely in code: showreels, product teasers, UI morphs, kinetic typography, logo stings and generative loops, with optional music.**

[中文](./README.zh-CN.md) · [Back to collection](../../README.md)

- **Picture = a function of time.** The page exposes `window.render(t)`; Playwright captures every frame; ffmpeg encodes the MP4 (motion blur, supersampling, grain as flags).
- **One timeline for picture and sound.** `score.mjs` synthesizes music and SFX from the same `timeline.js`, so every hit lands on its frame. You can also bring your own track (beat / drop detection included).
- **One checkpoint, then all-out.** One round of questions → Reel Read + brief → style frames for approval → autonomous build → programmatic technical checks (must pass) + review notes for the user → delivery.
- **Differs from `web-video-presentation`**: visual-impact and beat-driven, short, rendered straight to MP4 rather than narration-driven click-through pages.

Requirements: Node 18+, ffmpeg. Run `sh scripts/setup.sh` once (installs Playwright + Chromium).
