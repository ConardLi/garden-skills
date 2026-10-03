# Motion Showreel Skill

**Stunning short videos made entirely in code: motion showreels, product films, UI motion, kinetic typography, logo stings, generative loops and era-spanning retrospectives, with optional music.**

[中文](./README.zh-CN.md) · [Back to collection](../../README.md)

- **Picture = a function of time.** The page exposes a deterministic `window.render(t)`; Playwright captures every frame; ffmpeg encodes the MP4 (motion blur, supersampling and grain are flags).
- **One timeline for picture and sound.** Music and SFX are written in code against the same `timeline.js`, so every hit lands on its frame. Two audio tiers: a zero-dependency built-in synth (drums and hand percussion, bass, pads, plucks, mallets, organ, formant choir, ambience beds, swing / step rhythms, lo-fi bitcrush and tape wow), and Tone.js rendered offline in the headless browser (sampled piano, convolution reverb). Sound gets its own direction in the brief (benchmark, groove, harmony, palette, dramatic arc) plus a list of audio defaults to avoid, so pieces don't all end up with the same song. Bring-your-own tracks get beat / drop detection (librosa when available).
- **A style library that is a starting point, not a menu.** 22 styles in `references/styles/`, one file each (look, palette, type, motion, camera grammar, sound palette, native moves, pitfalls). Use, adapt, mix or write your own from the template.
- **One checkpoint, then all-out.** Benchmark + three candidate structures → brief → style frames (or three directions with one key frame each when no style is given) → autonomous build → programmatic technical checks (must pass) + review notes for the user. A "free mode" leaves taste entirely to the model.

Requirements: Node 18+, ffmpeg. Run `sh scripts/setup.sh` once (Playwright + Chromium + Tone.js). Tests: `cd scripts && npm test`.
