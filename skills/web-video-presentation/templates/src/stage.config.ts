/**
 * Stage base resolution — the design canvas size, in CSS pixels, BEFORE
 * any responsive scaling.
 *
 * Default 1920×1080 (16:9) targets B站 / YouTube / 抖音 screen-recording.
 * For 小红书 portrait, scaffold with `--ratio=3:4` and this becomes
 * 1080×1440; set your recorder viewport to the same numbers.
 *
 * SINGLE SOURCE OF TRUTH for stage size. `useStageScale` and `Stage`
 * read these constants — do not hardcode dimensions anywhere else.
 */
export const STAGE_W = 1920;
export const STAGE_H = 1080;
