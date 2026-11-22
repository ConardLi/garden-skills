/**
 * slides.ts — OPTIONAL per-step slide metadata for this chapter.
 *
 * Export a `slides: SlideStepMeta[]` array whose length MUST equal
 * `narrations.length`. Each entry describes one step's semantic slide
 * type + visual fields, consumed by `npm run export-slide-data` to
 * emit the server-editable `slide-data.json`.
 *
 * If a chapter has NO slides.ts, the export script auto-infers a coarse
 * `type` per step so nothing breaks (but hand-written slides.ts gives the
 * web viewer/editor the real visual structure).
 *
 * Supported `type` values (see registry/types.ts SlideStepType):
 *   hero / iarc / headline / study / dose / azad / timeline / fact /
 *   confounding / question / highlight / versus / pyramid / transition / custom
 */
import type { SlideStepMeta } from "../../registry/types";

export const slides: SlideStepMeta[] = [
  // step 0 — magazine cover
  { type: "hero", kicker: "Chapter 01 — Example", title: "这是一个示例", titleAccent: "hero 标题", subtitle: "点任意位置推进" },
  // step 1 — split layout
  { type: "fact", kicker: "每一步", title: "独占整个屏幕", content: "主题 token 控制所有视觉细节，章节代码与主题解耦。" },
  // step 2 — pull-quote close
  { type: "highlight", kicker: "Now", title: "换成你自己的章节", content: "See SKILL.md / CHAPTER-CRAFT.md / THEMES.md" },
];
