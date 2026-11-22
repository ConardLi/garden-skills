import type { ComponentType } from "react";

export interface ChapterStepProps {
  step: number; // 0..(narrations.length - 1)
}

/**
 * One narration entry — the spoken text for that step.
 *
 * Empty string ("") means "no audio for this step" (e.g. silent transition
 * shot). Auto mode falls back to a short estimate when audio is missing or
 * the text is empty.
 */
export type Narration = string;

/* ─────────────────────────────────────────────────────────────
 * Slide data layer (generic editor / web viewer export).
 *
 * This skill now ships an OPTIONAL per-chapter `slides.ts` next to
 * `narrations.ts`. It declares, per step, the semantic slide type +
 * visual fields. The export script (`npm run export-slide-data`)
 * merges `slides.ts` + `narrations.ts` + chapter metadata into a
 * single `slide-data.json` consumable by the generic web viewer /
 * editor on the server.
 *
 * `slides` length MUST equal `narrations.length` (same drift guard as
 * narrations vs. .tsx). If a chapter has NO `slides.ts`, the export
 * script falls back to a coarse auto-inference so nothing breaks.
 * ───────────────────────────────────────────────────────────── */

/**
 * The 14 step types understood by the generic web viewer/editor.
 * `custom` is a catch-all: any slide whose visuals don't fit the
 * built-ins is still exported with type "custom" + its own fields.
 */
export type SlideStepType =
  | "hero"
  | "iarc"
  | "headline"
  | "study"
  | "dose"
  | "azad"
  | "timeline"
  | "fact"
  | "confounding"
  | "question"
  | "highlight"
  | "versus"
  | "pyramid"
  | "transition"
  | "custom";

/**
 * One slide's field bag. Fields are free-form `string | string[]`
 * so each step can carry exactly what its visuals need. Common keys:
 *
 *  kicker      — 顶部小标签 (e.g. "Nature · 2014")
 *  title       — 主标题 / 结论句
 *  titleAccent — hero 里的强调色大字
 *  subtitle    — 副标题 / 引导语
 *  content     — 一段正文 (fact / confounding / question / highlight)
 *  note / cite — 脚注 / 引用
 *  items       — string[] 列表项
 *  bigChars    — string[] 竖排/大字字符
 *  stamp       — 印章/角标文字 (e.g. "FAKE?")
 *  badge       — iarc 徽标 (e.g. "2B类")
 *  highlightItem — iarc 中高亮的项
 *  leftTitle / leftContent / rightTitle / rightContent — versus 左右栏
 *  leftNode / rightNode / biasText — azad 关联+混杂
 *  bar1Label / bar1Value / bar2Label / bar2Value — study 双柱
 *  dose1 / dose1Label / dose2 / dose2Label — dose 双卡
 *  level1 / level2 / level3 — pyramid 三层
 *  events — timeline 事件 (JSON 或 string[])
 *  conclusion — timeline 结语
 */
export interface SlideStepMeta {
  type: SlideStepType;
  [field: string]: string | string[] | SlideStepType | undefined;
}

/**
 * Optional per-chapter slide declaration. Export:
 *   import { slides } from "../chapters/<id>/slides";
 *   ...
 *   { id, title, slides, narrations, Component }
 */
export type ChapterSlidesSegment = SlideStepMeta[];

export interface ChapterDef {
  id: string;
  title: string;
  /**
   * Per-step narration text. **Length === total steps in this chapter.**
   * This is the single source of truth for step count and audio synthesis.
   */
  narrations: Narration[];
  /**
   * OPTIONAL per-step slide metadata (see SlideStepMeta). When present,
   * length MUST equal `narrations.length`. Used by `npm run
   * export-slide-data` to emit `slide-data.json`.
   */
  slides?: ChapterSlidesSegment;
  Component: ComponentType<ChapterStepProps>;
}

/** Slide data export — mirrors the server's slide-data.json shape. */
export interface SlideDataExport {
  title: string;
  subtitle: string;
  chapters: {
    id: string;
    title: string;
    steps: SlideStepMeta[];
    narrations: Narration[];
  }[];
}
