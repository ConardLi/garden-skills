// timeline.js — the single source of truth for time. Imported by the page (picture) AND score.mjs (sound),
// so every cut, hit and sound effect lands on the same number. Plain ES module: no DOM, no Node APIs.

export const BPM = 120;
export const BEAT = 60 / BPM;
export const BAR = BEAT * 4;
/** beat number → seconds (fractions allowed: b(4.5) is the "and" of beat 5) */
export const b = n => n * BEAT;

export const DUR = b(16); // 8 s — set the real length here (whole bars keep loops and music tidy)

// Shots / sections on the grid. Replace with your shot list.
export const SHOTS = [
  { id: 'hook', t0: b(0), t1: b(4) },
  { id: 'word', t0: b(4), t1: b(11) },
  { id: 'resolve', t0: b(11), t1: b(16) },
];

// Picture events that need a sound. The page reads them for flashes / kicks, the score for SFX.
export const CUES = [
  { t: b(0.5), sfx: 'pop' },
  { t: b(4), sfx: 'whoosh' },
  ...[0, 1, 2, 3, 4, 5].map(i => ({ t: b(4.5) + i * BEAT / 2, sfx: 'tick' })),
  { t: b(11), sfx: 'impact' },
  { t: b(14), sfx: 'shimmer' },
];

// What the QA tools should know you meant (inspect.mjs / audio.mjs read these from this file):
// deliberate still moments, e.g. the end card [[b(28), DUR]]: reported as intended holds, not dead air
export const HOLDS = [];
// the big hits that should follow a breath, e.g. [b(24)]: audio check measures the dip before each and the lift on it
export const DROPS = [];
