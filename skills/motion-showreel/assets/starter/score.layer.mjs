// score.mjs (layer mode) — the Tone.js music from score.tone.js + tier-1 sound design on top, mastered once.
// build.sh (AUDIO=layer) first renders score.tone.js raw → audio/tone.wav, then builds this file → audio/music.wav.
// The music lives in score.tone.js; keep this file for SFX that must land on picture events (whooshes, impacts, ticks).
import { fileURLToPath } from 'node:url';
import { DUR, BPM, CUES } from './timeline.js';
export { DUR };

const TONE = fileURLToPath(new URL('./audio/tone.wav', import.meta.url));   // relative to this file, not to the cwd

export default function score(S) {
  S.tempo(BPM);
  // the Tone layer: already a finished mix, so unity gain and no extra processing (sound.md §9)
  S.bus('tone', { gain: 1 }).add(S.load(TONE), 0);
  const sfx = S.bus('sfx', { gain: 0.8, reverb: 0.18 });
  const hit = CUES.find(c => c.sfx === 'impact')?.t;
  if (hit) sfx.add(S.riser(S.bar(1)), hit - S.bar(1), { gain: 0.4 });
  for (const c of CUES) {
    if (c.sfx === 'pop') sfx.add(S.pop('C6'), c.t, { gain: 0.6 });
    if (c.sfx === 'tick') sfx.add(S.tick(), c.t, { gain: 0.35, pan: Math.sin(c.t * 7) * 0.5 });
    if (c.sfx === 'whoosh') sfx.add(S.whoosh(0.6), c.t - 0.6 * 0.7, { gain: 0.7 });
    if (c.sfx === 'impact') { sfx.add(S.impact(), c.t, { gain: 0.9 }); S.duck(c.t, 1); }
    if (c.sfx === 'shimmer') sfx.add(S.shimmer(1.6), c.t, { gain: 0.5 });
  }
}
