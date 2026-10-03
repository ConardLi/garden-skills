// score.tone.js — tier-2 audio: Tone.js rendered offline in the headless browser.
// Use it when the piece needs real instruments (sampled piano), convolution reverb or richer synths/effects.
// Build: node <skill>/scripts/audio.mjs build score.tone.js      (first: node <skill>/scripts/audio.mjs samples salamander)
// You get this file from `scaffold.sh --audio tone` (or `--audio layer`); build.sh builds whichever score its AUDIO= names.
// The progression, groove and instruments below are placeholders that prove the pipeline: write the music from the
// brief's sound direction (sound.md §2), not by editing these numbers.
import { DUR, BPM, CUES, b } from './timeline.js';
export { DUR };

export default async function score(Tone, kit) {
  const { transport } = kit;
  transport.bpm.value = BPM;

  // master chain: gentle glue compression → room reverb → out
  const verb = new Tone.Reverb({ decay: 2.8, wet: 0.22 }).toDestination();
  const bus = new Tone.Compressor({ threshold: -18, ratio: 3, attack: 0.01, release: 0.2 }).connect(verb);

  // sampled piano (Salamander, CC BY 3.0) — needs `audio.mjs samples salamander`
  const piano = new Tone.Sampler({ urls: kit.salamander(), baseUrl: kit.baseUrl('salamander'), release: 1.2 }).connect(bus);
  // warm pad and a soft sub
  const pad = new Tone.PolySynth(Tone.FMSynth, { harmonicity: 1.5, modulationIndex: 2, envelope: { attack: 0.6, release: 1.8 }, volume: -20 }).connect(bus);
  const sub = new Tone.MonoSynth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, release: 0.4 }, volume: -17 }).connect(bus);
  const kick = new Tone.MembraneSynth({ volume: -8 }).connect(bus);
  const hat = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.04, sustain: 0 }, volume: -19 }).connect(bus);
  await kit.loaded();                                   // samples must be decoded before scheduling

  const prog = [['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['C4', 'E4', 'G4', 'B4'], ['G3', 'C4', 'D4', 'G4']];
  const bars = Math.round(DUR / b(4));
  for (let bar = 0; bar < bars; bar++) {
    const t = b(bar * 4), chord = prog[bar % 4];
    pad.triggerAttackRelease(chord, b(4) * 0.95, t, 0.5);
    sub.triggerAttackRelease(Tone.Frequency(chord[0]).transpose(-12), b(3.5), t);
    chord.forEach((n, i) => piano.triggerAttackRelease(Tone.Frequency(n).transpose(12), b(1), t + b(i * 0.5 + 0.5), 0.55));
    for (let k = 0; k < 4; k++) {
      if (bar >= 2) kick.triggerAttackRelease('C1', '8n', t + b(k));
      hat.triggerAttackRelease('16n', t + b(k + 0.5));
    }
  }
  // one-shot accents from the shared timeline
  for (const c of CUES) if (c.sfx === 'impact') { kick.triggerAttackRelease('A0', '2n', c.t, 1); piano.triggerAttackRelease(['A1', 'A2'], 2, c.t, 0.9); }
}
