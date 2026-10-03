// score.mjs — music + sound design from the same timeline as the picture.
// Build: node <skill>/scripts/audio.mjs build score.mjs   →  audio/music.wav (−14 LUFS)
// The session S has every instrument / effect of scripts/lib/synth.mjs (see references/sound.md).
// This file only proves the pipeline. Its key, progression, four-on-the-floor groove, instruments and riser → impact arc
// are placeholders: write the music from the brief's sound direction (sound.md §2), not by editing these numbers.
import { DUR, BPM, CUES } from './timeline.js';
export { DUR };

export default function score(S) {
  S.tempo(BPM);
  const drums = S.bus('drums', { gain: 0.9 });
  const bass = S.bus('bass', { gain: 0.7, duck: 0.55 });
  const music = S.bus('music', { gain: 0.45, reverb: 0.3, duck: 0.6, highpass: 180 });
  const sfx = S.bus('sfx', { gain: 0.8, reverb: 0.18 });

  const bars = Math.round(DUR / S.bar(1));
  const prog = [['A2', 'min7'], ['F2', 'maj7'], ['C3', 'maj7'], ['G2', 'sus4']];

  for (let bar = 0; bar < bars; bar++) {
    const [root, q] = prog[bar % prog.length], t = S.bar(bar);
    const intro = bar < 2;                       // thin intro, full groove after the first section
    music.add(S.pad(S.chord(S.midi(root) + 12, q), S.bar(1) * 0.98, { cutoff: intro ? 900 : 2200 }), t);
    for (let k = 0; k < 4; k++) {
      const bt = t + S.beat(k);
      if (!intro) { drums.add(S.kick({ decay: 0.3 }), bt, { gain: 0.7 }); S.duck(bt); }
      drums.add(S.hat({ decay: 0.035 }), bt + S.beat(0.5), { gain: intro ? 0.25 : 0.5, pan: 0.2 });
      if (!intro && k % 2 === 1) drums.add(S.clap(), bt, { gain: 0.6 });
      if (!intro) bass.add(S.bass(root, S.beat(0.45), { cutoff: 520, sub: 0.3 }), bt + S.beat(0.5));
    }
  }
  // the bar before the big hit: lift the energy
  const hit = CUES.find(c => c.sfx === 'impact')?.t;
  if (hit) sfx.add(S.riser(S.bar(1)), hit - S.bar(1), { gain: 0.5 });

  for (const c of CUES) {
    if (c.sfx === 'pop') sfx.add(S.pop('C6'), c.t, { gain: 0.6 });
    if (c.sfx === 'tick') sfx.add(S.tick(), c.t, { gain: 0.35, pan: Math.sin(c.t * 7) * 0.5 });
    if (c.sfx === 'whoosh') sfx.add(S.whoosh(0.6), c.t - 0.6 * 0.7, { gain: 0.7 });
    if (c.sfx === 'impact') { sfx.add(S.impact(), c.t, { gain: 0.9 }); drums.add(S.crash(), c.t, { gain: 0.35 }); S.duck(c.t, 1); }
    if (c.sfx === 'shimmer') sfx.add(S.shimmer(1.6), c.t, { gain: 0.5 });
  }
}
