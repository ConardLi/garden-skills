import type { ChapterDef } from "./types";
import ExampleChapter from "../chapters/01-example/Example";

/**
 * Order = order of presentation.
 * Each `step` corresponds to one voiceover beat (see SKILL.md Phase 1).
 *
 * Visual styling (color, surface, accent) comes entirely from the active
 * theme — chapters should never hard-code palette values. See THEMES.md.
 */
export const CHAPTERS: ChapterDef[] = [
  {
    id: "example",
    title: "示例章节",
    totalSteps: 3,
    Component: ExampleChapter,
  },
];
