import type { ChapterDef } from "./types";
import ExampleChapter from "../chapters/01-example/Example";
import { narrations as exampleNarrations } from "../chapters/01-example/narrations";
import { slides as exampleSlides } from "../chapters/01-example/slides";

/**
 * Order = order of presentation.
 *
 * Each chapter MUST provide a `narrations: Narration[]` array. Its length
 * is the chapter's step count — there is no `totalSteps` to maintain
 * separately. This guarantees the audio synthesis pipeline, the runtime
 * stepper, and the chapter `.tsx` switch on `step` cannot drift apart.
 *
 * Each chapter MAY provide an OPTIONAL `slides: SlideStepMeta[]` array
 * whose length must equal `narrations.length`. It feeds
 * `npm run export-slide-data` → `slide-data.json`, consumed by the
 * server-side generic web viewer/editor. If a chapter omits `slides`,
 * the export script auto-infers a coarse step type so nothing breaks.
 *
 * Visual styling (color, fonts) comes entirely from the active theme —
 * chapters never hard-code palette / font names. See THEMES.md.
 */
export const CHAPTERS: ChapterDef[] = [
  {
    id: "example",
    title: "示例章节",
    narrations: exampleNarrations,
    slides: exampleSlides,
    Component: ExampleChapter,
  },
];
