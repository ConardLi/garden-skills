// A small offline synthesizer for motion-graphics scores and sound design.
// Everything renders at 48 kHz into Float32Arrays; a "session" collects sounds on buses,
// applies sidechain ducking, reverb / delay sends, then masters to a loudness target.
//
// Score modules receive a session `S` (see audio.mjs build). Quick tour:
//   S.tempo(120)                         S.beat(n) / S.bar(n) → seconds
//   const drums = S.bus('drums', { gain: 0.9 })
//   const music = S.bus('music', { gain: 0.5, reverb: 0.25, duck: 0.6 })
//   drums.add(S.kick(), S.beat(0)); S.duck(S.beat(0))
//   music.add(S.pad(S.chord('A3', 'min7'), S.bar(2)), S.bar(0))
//   sfx.add(S.whoosh(0.6), cutTime - 0.6 * 0.7)   // whoosh peaks at 70 % of its length
//   S.steps('x..x..x.') / S.swing(n, 1/3) / S.humanize(t)   rhythm helpers; S.space({ room, damp }) sets the reverb
//   mallet / organ / vox / shaker / rim / cowbell / ambience   more instrument families; bus { crush, wow } for lo-fi
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

export const SR = 48000;
const TAU = Math.PI * 2;
const N = s => Math.max(1, Math.round(s * SR));

// ─────────────────────────── notes & harmony ───────────────────────────
const NOTE = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
export function midi(n) {
  if (typeof n === 'number') return n;
  const m = /^([a-gA-G])([#b]*)(-?\d+)$/.exec(String(n).trim());
  if (!m) throw new Error(`bad note "${n}" (use e.g. A3, C#4, Eb2 or a MIDI number)`);
  let v = NOTE[m[1].toLowerCase()] + (+m[3] + 1) * 12;
  for (const c of m[2]) v += c === '#' ? 1 : -1;
  return v;
}
export const hz = n => 440 * Math.pow(2, (midi(n) - 69) / 12);
const CHORDS = {
  maj: [0, 4, 7], min: [0, 3, 7], sus2: [0, 2, 7], sus4: [0, 5, 7], dim: [0, 3, 6], aug: [0, 4, 8], '5': [0, 7, 12],
  maj7: [0, 4, 7, 11], min7: [0, 3, 7, 10], '7': [0, 4, 7, 10], m9: [0, 3, 7, 10, 14], maj9: [0, 4, 7, 11, 14],
  add9: [0, 4, 7, 14], madd9: [0, 3, 7, 14], min11: [0, 3, 7, 10, 14, 17],
  '6': [0, 4, 7, 9], m6: [0, 3, 7, 9], '9': [0, 4, 7, 10, 14], '7b9': [0, 4, 7, 10, 13], '7sus4': [0, 5, 7, 10],
  m7b5: [0, 3, 6, 10], dim7: [0, 3, 6, 9], 'maj7#11': [0, 4, 7, 11, 18],
  quartal: [0, 5, 10], quartal4: [0, 5, 10, 15], cluster: [0, 1, 2],
};
export function chord(root, quality = 'maj', inversion = 0) {
  const ivs = CHORDS[quality]; if (!ivs) throw new Error(`unknown chord quality ${quality}; use ${Object.keys(CHORDS).join(', ')}`);
  const notes = ivs.map(i => midi(root) + i);
  for (let k = 0; k < inversion; k++) notes.push(notes.shift() + 12);
  return notes;
}
const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10], lydian: [0, 2, 4, 6, 7, 9, 11], mixolydian: [0, 2, 4, 5, 7, 9, 10], locrian: [0, 1, 3, 5, 6, 8, 10],
  harmonic: [0, 2, 3, 5, 7, 8, 11], melodic: [0, 2, 3, 5, 7, 9, 11], hijaz: [0, 1, 4, 5, 7, 8, 10], wholetone: [0, 2, 4, 6, 8, 10], blues: [0, 3, 5, 6, 7, 10],
  penta: [0, 2, 4, 7, 9], minpenta: [0, 3, 5, 7, 10], hirajoshi: [0, 2, 3, 7, 8], insen: [0, 1, 5, 7, 10],
  // Chinese pentatonic modes (宫 商 角 徵 羽): gong = penta, yu = minpenta
  gong: [0, 2, 4, 7, 9], shang: [0, 2, 5, 7, 10], jue: [0, 3, 5, 8, 10], zhi: [0, 2, 5, 7, 9], yu: [0, 3, 5, 7, 10],
};
// degree → MIDI note in a scale (degree may be negative or exceed 7)
export function scale(root, name = 'minor') {
  const s = SCALES[name]; if (!s) throw new Error(`unknown scale ${name}; use ${Object.keys(SCALES).join(', ')}`);
  return deg => { const o = Math.floor(deg / s.length); return midi(root) + 12 * o + s[((deg % s.length) + s.length) % s.length]; };
}

// ─────────────────────────────── basics ───────────────────────────────
export function rng(seed = 1) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function noise(sec, seed = 7) { const r = rng(seed), b = new Float32Array(N(sec)); for (let i = 0; i < b.length; i++) b[i] = r() * 2 - 1; return b; }
const polyblep = (t, dt) => t < dt ? (t /= dt, t + t - t * t - 1) : t > 1 - dt ? (t = (t - 1) / dt, t * t + t + t + 1) : 0;
// oscillator with a frequency function f(i) (Hz) → band-limited-ish waveform
export function osc(len, freq, wave = 'sine', phase = 0) {
  const b = new Float32Array(len), fn = typeof freq === 'function' ? freq : () => freq;
  let p = phase % 1;
  for (let i = 0; i < len; i++) {
    const dt = fn(i) / SR; let v;
    switch (wave) {
      case 'saw': v = 2 * p - 1 - polyblep(p, dt); break;
      case 'square': v = (p < 0.5 ? 1 : -1) + polyblep(p, dt) - polyblep((p + 0.5) % 1, dt); break;
      case 'tri': v = 1 - 4 * Math.abs(Math.round(p - 0.25) - (p - 0.25)); break;
      default: v = Math.sin(TAU * p);
    }
    b[i] = v; p += dt; if (p >= 1) p -= 1;
  }
  return b;
}
// amplitude envelope: attack, decay, sustain level, release, gate length (s)
export function adsr(len, a = 0.005, d = 0.1, s = 0.7, r = 0.1, gate = len / SR) {
  const e = new Float32Array(len), A = N(a), D = N(d), G = N(gate), R = N(r);
  let rel = s;
  for (let i = 0; i < len; i++) {
    let v;
    if (i < G) { v = i < A ? i / A : i < A + D ? 1 - (1 - s) * (i - A) / D : s; rel = v; }
    else v = rel * Math.max(0, 1 - (i - G) / R);
    e[i] = v;
  }
  return e;
}
export const expEnv = (len, decay, attack = 0.002) => { const e = new Float32Array(len), A = N(attack); for (let i = 0; i < len; i++) e[i] = Math.min(1, i / A) * Math.exp(-i / SR / decay); return e; };
export const mul = (a, b) => { for (let i = 0; i < a.length; i++) a[i] *= typeof b === 'number' ? b : (b[i] ?? 0); return a; };
export const addInto = (dst, src, at = 0, g = 1) => { const o = Math.round(at); for (let i = 0; i < src.length; i++) { const k = o + i; if (k >= 0 && k < dst.length) dst[k] += src[i] * g; } return dst; };
export const drive = (b, amt = 0.5) => { const k = 1 + amt * 6, n = Math.tanh(k); for (let i = 0; i < b.length; i++) b[i] = Math.tanh(b[i] * k) / n; return b; };
export const reverse = b => Float32Array.from(b).reverse();
export const fade = (b, inS = 0.005, outS = 0.01) => { const I = N(inS), O = N(outS); for (let i = 0; i < I && i < b.length; i++) b[i] *= i / I; for (let i = 0; i < O && i < b.length; i++) b[b.length - 1 - i] *= i / O; return b; };
export const peakNorm = (b, peak = 1) => { let m = 0; for (const v of b) m = Math.max(m, Math.abs(v)); return m ? mul(b, peak / m) : b; };

// RBJ biquad; cutoff may be a function of the sample index (re-evaluated every 16 samples)
export function biquad(b, type = 'lowpass', cutoff = 1000, q = 0.707, gainDb = 0) {
  const out = new Float32Array(b.length), cf = typeof cutoff === 'function' ? cutoff : () => cutoff;
  let b0, b1, b2, a1, a2, x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  const coef = f => {
    f = Math.min(Math.max(f, 10), SR * 0.45);
    const w = TAU * f / SR, cw = Math.cos(w), sw = Math.sin(w), al = sw / (2 * q), A = Math.pow(10, gainDb / 40);
    let n0, n1, n2, d0, d1, d2;
    switch (type) {
      case 'highpass': n0 = (1 + cw) / 2; n1 = -(1 + cw); n2 = n0; d0 = 1 + al; d1 = -2 * cw; d2 = 1 - al; break;
      case 'bandpass': n0 = al; n1 = 0; n2 = -al; d0 = 1 + al; d1 = -2 * cw; d2 = 1 - al; break;
      case 'peak': n0 = 1 + al * A; n1 = -2 * cw; n2 = 1 - al * A; d0 = 1 + al / A; d1 = -2 * cw; d2 = 1 - al / A; break;
      case 'lowshelf': { const s = 2 * Math.sqrt(A) * al; n0 = A * ((A + 1) - (A - 1) * cw + s); n1 = 2 * A * ((A - 1) - (A + 1) * cw); n2 = A * ((A + 1) - (A - 1) * cw - s); d0 = (A + 1) + (A - 1) * cw + s; d1 = -2 * ((A - 1) + (A + 1) * cw); d2 = (A + 1) + (A - 1) * cw - s; break; }
      case 'highshelf': { const s = 2 * Math.sqrt(A) * al; n0 = A * ((A + 1) + (A - 1) * cw + s); n1 = -2 * A * ((A - 1) + (A + 1) * cw); n2 = A * ((A + 1) + (A - 1) * cw - s); d0 = (A + 1) - (A - 1) * cw + s; d1 = 2 * ((A - 1) - (A + 1) * cw); d2 = (A + 1) - (A - 1) * cw - s; break; }
      default: n0 = (1 - cw) / 2; n1 = 1 - cw; n2 = n0; d0 = 1 + al; d1 = -2 * cw; d2 = 1 - al;
    }
    b0 = n0 / d0; b1 = n1 / d0; b2 = n2 / d0; a1 = d1 / d0; a2 = d2 / d0;
  };
  for (let i = 0; i < b.length; i++) {
    if (i % 16 === 0) coef(cf(i));
    const x = b[i], y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y; out[i] = y;
  }
  return out;
}
export const lowpass = (b, f, q) => biquad(b, 'lowpass', f, q);
export const highpass = (b, f, q) => biquad(b, 'highpass', f, q);
export const bandpass = (b, f, q = 1) => biquad(b, 'bandpass', f, q);

// ─────────────────────────────── drums ───────────────────────────────
export function kick({ tone = 48, start = 165, pitchDecay = 0.045, decay = 0.42, click = 0.5, drive: dr = 0.35 } = {}) {
  const len = N(decay * 3), b = osc(len, i => tone + (start - tone) * Math.exp(-i / SR / pitchDecay));
  mul(b, expEnv(len, decay, 0.001));
  if (click > 0) addInto(b, mul(highpass(noise(0.012, 3), 2500), expEnv(N(0.012), 0.003, 0.0005)), 0, click * 0.6);
  return fade(drive(b, dr), 0.0005, 0.02);
}
export function snare({ tone = 185, decay = 0.18, snappy = 0.75, seed = 11 } = {}) {
  const len = N(decay * 3);
  const body = osc(len, i => tone * (1 + 0.5 * Math.exp(-i / SR / 0.01)));
  addInto(body, osc(len, tone * 1.6), 0, 0.5);
  mul(body, expEnv(len, 0.07));
  const nz = mul(bandpass(highpass(noise(len / SR, seed), 1200), 5200, 0.6), expEnv(len, decay));
  addInto(body, nz, 0, snappy * 2.2);
  return fade(drive(body, 0.2), 0.0005, 0.02);
}
export function clap({ decay = 0.22, seed = 5 } = {}) {
  const len = N(decay * 3 + 0.03), nz = bandpass(noise(len / SR, seed), 1300, 0.9), e = new Float32Array(len);
  for (const o of [0, 0.011, 0.022]) { const s = N(o); for (let i = s; i < len; i++) e[i] = Math.max(e[i], Math.exp(-(i - s) / SR / 0.007)); }
  const s = N(0.03); for (let i = s; i < len; i++) e[i] = Math.max(e[i], 0.6 * Math.exp(-(i - s) / SR / decay));
  return fade(mul(nz, e).map(v => v * 3), 0.0005, 0.02);
}
export function hat({ open = false, decay = open ? 0.32 : 0.045, tone = 1, seed = 9 } = {}) {
  const len = N(decay * 3 + 0.01), metal = new Float32Array(len);
  for (const r of [2, 3, 4.16, 5.43, 6.79, 8.21]) addInto(metal, osc(len, 40 * tone * r * 10.3, 'square'), 0, 1 / 6);
  addInto(metal, noise(len / SR, seed), 0, 0.6);
  return fade(mul(highpass(bandpass(metal, 10000, 0.8), 7000), expEnv(len, decay, 0.0005)).map(v => v * 2.2), 0.0003, 0.01);
}
export function crash({ dur = 2.4, seed = 13 } = {}) {
  const len = N(dur), b = highpass(noise(dur, seed), 3500);
  for (const r of [3.1, 4.7, 6.3, 8.9]) addInto(b, osc(len, 420 * r, 'square'), 0, 0.08);
  return fade(mul(lowpass(b, 12000), expEnv(len, dur / 3.5, 0.001)), 0.0005, 0.1);
}
export function tom(note = 'A2', { decay = 0.35 } = {}) {
  const f = hz(note), len = N(decay * 3), b = osc(len, i => f * (1 + 0.6 * Math.exp(-i / SR / 0.03)));
  return fade(mul(b, expEnv(len, decay)), 0.0005, 0.02);
}
// shaker: soft-attack high noise (shakers swell for a few ms instead of clicking)
export function shaker({ decay = 0.06, attack = 0.008, tone = 1, seed = 15 } = {}) {
  const len = N(attack + decay * 3), b = bandpass(highpass(noise(len / SR, seed), 4000 * tone), 7500 * tone, 0.7);
  return fade(mul(b, expEnv(len, decay, attack)), 0.0005, 0.01);
}
// side-stick / rim: a woody knock, much shorter and drier than a snare
export function rim({ tone = 1, decay = 0.018, seed = 17 } = {}) {
  const len = N(decay * 4 + 0.005), b = mul(osc(len, 1750 * tone, 'tri'), expEnv(len, decay, 0.0002));
  addInto(b, mul(bandpass(noise(len / SR, seed), 3200 * tone, 1.4), expEnv(len, decay * 0.5, 0.0002)), 0, 1.2);
  return fade(b, 0.0002, 0.005);
}
// 808-style cowbell: two detuned squares through a band-pass
export function cowbell({ tone = 1, decay = 0.22 } = {}) {
  const len = N(decay * 3), b = osc(len, 540 * tone, 'square'); addInto(b, osc(len, 800 * tone, 'square'), 0, 1);
  const e = new Float32Array(len); for (let i = 0; i < len; i++) { const t = i / SR; e[i] = Math.min(1, t / 0.0005) * (0.65 * Math.exp(-t / 0.015) + 0.35 * Math.exp(-t / decay)); }
  return fade(mul(bandpass(b, 2600 * tone, 1.1), e).map(v => v * 0.8), 0.0003, 0.01);
}

// ───────────────────────────── tonal voices ─────────────────────────────
export function bass(note, dur, { wave = 'saw', cutoff = 600, q = 1.2, envAmt = 3, envDecay = 0.16, drive: dr = 0.45, sub = 0.6, glideFrom, glide = 0.06, release = 0.04 } = {}) {
  const f = hz(note), f0 = glideFrom != null ? hz(glideFrom) : f, len = N(dur + release);
  const fr = i => f + (f0 - f) * Math.exp(-i / SR / glide);
  const b = osc(len, fr, wave);
  if (sub) addInto(b, osc(len, i => fr(i) / 2), 0, sub);
  const out = biquad(b, 'lowpass', i => cutoff * (1 + envAmt * Math.exp(-i / SR / envDecay)), q);
  return drive(mul(out, adsr(len, 0.003, 0.1, 0.85, release, dur)), dr);
}
export function sub(note, dur, { release = 0.08, harm = 0.15 } = {}) {
  const f = hz(note), len = N(dur + release), b = osc(len, f);
  if (harm) { addInto(b, osc(len, f * 2), 0, harm); addInto(b, osc(len, f * 3), 0, harm / 2); }
  return mul(b, adsr(len, 0.01, 0.05, 0.95, release, dur));
}
// stereo detuned-saw pad: returns {L, R}
export function pad(notes, dur, { voices = 5, cents = 14, cutoff = 1800, q = 0.6, attack = 0.5, release = 1.2, wave = 'saw', seed = 21, wobble = 0.15 } = {}) {
  notes = (Array.isArray(notes) ? notes : [notes]).map(midi);
  const len = N(dur + release), L = new Float32Array(len), R = new Float32Array(len), r = rng(seed);
  for (const n of notes) for (let v = 0; v < voices; v++) {
    const det = voices > 1 ? (v / (voices - 1) - 0.5) * 2 * cents : 0, f = hz(n) * Math.pow(2, det / 1200);
    const o = osc(len, f, wave, r()), p = voices > 1 ? v / (voices - 1) : 0.5;
    addInto(L, o, 0, Math.cos(p * Math.PI / 2)); addInto(R, o, 0, Math.sin(p * Math.PI / 2));
  }
  const g = 1 / Math.sqrt(notes.length * voices) * 0.9, env = adsr(len, attack, 0.3, 0.9, release, dur);
  const cf = i => cutoff * (1 + wobble * Math.sin(TAU * 0.13 * i / SR));
  return { L: mul(mul(biquad(L, 'lowpass', cf, q), env), g), R: mul(mul(biquad(R, 'lowpass', cf, q), env), g) };
}
export function pluck(note, dur, { bright = 0.55, damp = 0.996, seed = 3 } = {}) {
  const f = hz(note), len = N(dur), D = SR / f, n = Math.max(2, Math.floor(D)), frac = D - n;
  const line = lowpass(noise(n / SR + 0.001, seed), 800 + bright * 9000).subarray(0, n);
  const out = new Float32Array(len), buf = Float32Array.from(line);
  let idx = 0, prev = 0;
  for (let i = 0; i < len; i++) {
    const a = buf[idx], b2 = buf[(idx + 1) % n], s = a + (b2 - a) * frac;
    out[i] = s; const nv = damp * 0.5 * (s + prev); prev = s; buf[idx] = nv; idx = (idx + 1) % n;
  }
  return fade(peakNorm(out, 0.8), 0.001, Math.min(0.1, dur / 4));
}
export function keys(notes, dur, { decay = 1.4, index = 2.5, release = 0.25 } = {}) {
  notes = (Array.isArray(notes) ? notes : [notes]).map(midi);
  const len = N(dur + release), out = new Float32Array(len);
  for (const n of notes) {
    const f = hz(n), b = new Float32Array(len);
    for (let i = 0; i < len; i++) { const t = i / SR, I = index * Math.exp(-t / 0.4) + 0.3; b[i] = Math.sin(TAU * f * t + I * Math.sin(TAU * f * t)) + 0.15 * Math.sin(TAU * f * 14 * t) * Math.exp(-t / 0.02); }
    addInto(out, mul(b, expEnv(len, decay, 0.002)), 0, 1 / notes.length);
  }
  return mul(out, adsr(len, 0.001, 0.01, 1, release, dur));
}
export function bell(note, dur = 2, { ratio = 3.5, index = 4, decay = 1.2 } = {}) {
  const f = hz(note), len = N(dur), b = new Float32Array(len);
  for (let i = 0; i < len; i++) { const t = i / SR; b[i] = Math.sin(TAU * f * t + index * Math.exp(-t / (decay * 0.4)) * Math.sin(TAU * f * ratio * t)); }
  return fade(mul(b, expEnv(len, decay, 0.001)), 0.0005, 0.05);
}
export function lead(note, dur, { wave = 'saw', cutoff = 3200, q = 0.9, vibrato = 0.12, rate = 5.5, glideFrom, glide = 0.05, detune = 7, release = 0.12 } = {}) {
  const f = hz(note), f0 = glideFrom != null ? hz(glideFrom) : f, len = N(dur + release);
  const fr = c => i => { const t = i / SR, base = f + (f0 - f) * Math.exp(-t / glide), vib = vibrato * Math.min(1, Math.max(0, (t - 0.2) / 0.3)) * Math.sin(TAU * rate * t); return base * Math.pow(2, (vib + c / 100) / 12); };
  const b = osc(len, fr(detune / 2), wave); addInto(b, osc(len, fr(-detune / 2), wave, 0.37), 0, 1);
  return mul(biquad(mul(b, 0.5), 'lowpass', cutoff, q), adsr(len, 0.01, 0.15, 0.8, release, dur));
}
// struck bars and tines by modal synthesis: each material is a set of [frequency ratio, level, decay scale] partials
const MALLETS = {
  marimba: { decay: 0.5, strike: 0.25, partials: [[1, 1, 1], [3.99, 0.35, 0.25], [10.65, 0.12, 0.08]] },
  xylo: { decay: 0.28, strike: 0.4, partials: [[1, 1, 1], [3, 0.5, 0.45], [6, 0.2, 0.2]] },
  vibes: { decay: 1.6, strike: 0.15, trem: 5.5, partials: [[1, 1, 1], [4, 0.3, 0.35], [10.2, 0.08, 0.12]] },
  glock: { decay: 1.3, strike: 0.2, partials: [[1, 1, 1], [2.76, 0.45, 0.5], [5.4, 0.25, 0.3], [8.93, 0.12, 0.18]] },
  kalimba: { decay: 0.9, strike: 0.3, partials: [[1, 1, 1], [6.27, 0.22, 0.12], [17.55, 0.06, 0.04]] },
  steel: { decay: 0.9, strike: 0.2, partials: [[1, 1, 1], [2, 0.55, 0.7], [3, 0.3, 0.5], [4.02, 0.16, 0.35]] },
  wood: { decay: 0.06, strike: 0.6, partials: [[1, 1, 1], [2.63, 0.45, 0.6], [4.4, 0.2, 0.4]] },
};
export function mallet(note, dur = 1.2, { material = 'marimba', decay, bright = 0.5, seed = 101 } = {}) {
  const m = MALLETS[material]; if (!m) throw new Error(`unknown mallet material ${material}; use ${Object.keys(MALLETS).join(', ')}`);
  const f = hz(note), D = decay ?? m.decay, len = N(dur), out = new Float32Array(len), r = rng(seed);
  for (const [ratio, level, ds] of m.partials) {
    const fr = f * ratio; if (fr > SR * 0.45) continue;
    addInto(out, mul(osc(len, fr, 'sine', r()), expEnv(len, D * ds, 0.0008)), 0, ratio === 1 ? level : level * (0.4 + 1.2 * bright));
  }
  if (m.strike) { const s = N(0.02); addInto(out, mul(bandpass(noise(0.02, seed), Math.min(f * 4, 9000), 1.5), expEnv(s, 0.004, 0.0003)), 0, m.strike * bright * 2); }
  if (m.trem) for (let i = 0; i < len; i++) out[i] *= 1 - 0.35 * (0.5 + 0.5 * Math.sin(TAU * m.trem * i / SR));
  return fade(peakNorm(out, 0.8), 0.0003, Math.min(0.05, dur / 4));
}
// tonewheel organ: drawbars as a 9-digit string (16' 5⅓' 8' 4' 2⅔' 2' 1⅗' 1⅓' 1'), key click, leslie as a rotating pan; returns {L, R}
export function organ(notes, dur, { drawbars = '888000000', click = 0.3, leslie = 0.4, rate = 6.2, release = 0.06, seed = 111 } = {}) {
  notes = (Array.isArray(notes) ? notes : [notes]).map(midi);
  const RATIO = [0.5, 1.5, 1, 2, 3, 4, 5, 6, 8], lv = String(drawbars).padEnd(9, '0').slice(0, 9).split('').map(d => (+d || 0) / 8);
  const len = N(dur + release), b = new Float32Array(len), r = rng(seed), norm = 0.6 / Math.max(0.5, lv.reduce((s, v) => s + v, 0)) / Math.sqrt(notes.length);
  for (const n of notes) RATIO.forEach((ratio, k) => { const fr = hz(n) * ratio; if (lv[k] && fr < SR * 0.45) addInto(b, osc(len, fr, 'sine', r()), 0, lv[k] * norm); });
  mul(b, adsr(len, 0.004, 0.01, 1, release, dur));
  if (click) addInto(b, mul(highpass(noise(0.01, seed), 1800), expEnv(N(0.01), 0.002, 0.0002)), 0, click * 0.5);
  const L = new Float32Array(len), R = new Float32Array(len);
  for (let i = 0; i < len; i++) { const s = Math.sin(TAU * rate * i / SR); L[i] = b[i] * (1 - leslie * 0.5 * (1 + s)); R[i] = b[i] * (1 - leslie * 0.5 * (1 - s)); }
  return { L, R };
}
// formant "choir": detuned saws through three vowel formants, with vibrato and breath; returns {L, R}
const VOWELS = { a: [[800, 1], [1150, 0.5], [2900, 0.25]], e: [[400, 1], [1700, 0.35], [2600, 0.25]], i: [[300, 1], [2300, 0.3], [3000, 0.2]], o: [[450, 1], [800, 0.45], [2830, 0.15]], u: [[325, 1], [700, 0.3], [2530, 0.1]] };
export function vox(notes, dur, { vowel = 'a', voices = 3, cents = 12, attack = 0.35, release = 0.8, vibrato = 0.1, breath = 0.12, seed = 121 } = {}) {
  const F = VOWELS[vowel]; if (!F) throw new Error(`unknown vowel ${vowel}; use ${Object.keys(VOWELS).join(', ')}`);
  notes = (Array.isArray(notes) ? notes : [notes]).map(midi);
  const len = N(dur + release), sL = new Float32Array(len), sR = new Float32Array(len), r = rng(seed);
  for (const n of notes) for (let v = 0; v < voices; v++) {
    const det = voices > 1 ? (v / (voices - 1) - 0.5) * 2 * cents : 0, f = hz(n) * Math.pow(2, det / 1200), ph = r() * TAU, rt = 4.6 + r() * 1.2;
    const o = osc(len, i => f * Math.pow(2, vibrato * Math.min(1, i / SR / 0.6) * Math.sin(rt * TAU * i / SR + ph) / 12), 'saw', r());
    const p = voices > 1 ? v / (voices - 1) : 0.5; addInto(sL, o, 0, Math.cos(p * Math.PI / 2)); addInto(sR, o, 0, Math.sin(p * Math.PI / 2));
  }
  if (breath) { addInto(sL, noise(len / SR, seed), 0, breath); addInto(sR, noise(len / SR, seed + 1), 0, breath); }
  const env = adsr(len, attack, 0.2, 0.9, release, dur);
  const shape = x => { const y = new Float32Array(len); for (const [fc, a] of F) addInto(y, bandpass(x, fc, fc / 90), 0, a); return mul(y, env); };
  const L = shape(sL), R = shape(sR), G = Math.min(len, N(dur));
  let e = 0; for (let i = 0; i < G; i++) e += L[i] * L[i] + R[i] * R[i];
  const g = e > 0 ? 0.25 / Math.sqrt(e / (2 * G)) : 1;                  // same loudness whatever the vowel / voicing
  return { L: mul(L, g), R: mul(R, g) };
}

// ───────────────────────────── sound design ─────────────────────────────
export function riser(dur = 2, { from = 150, to = 3200, noise: nAmt = 0.6, seed = 31 } = {}) {
  const len = N(dur), k = i => Math.pow(i / len, 2);
  const sw = osc(len, i => from * Math.pow(to / from, i / len), 'saw');
  const nz = biquad(noise(dur, seed), 'bandpass', i => 400 * Math.pow(30, i / len), 1.2);
  const b = new Float32Array(len); for (let i = 0; i < len; i++) b[i] = (sw[i] * 0.35 + nz[i] * nAmt * 2) * k(i);
  return fade(highpass(b, 120), 0.01, 0.005);
}
export function downlifter(dur = 1.5, { from = 2500, to = 80, seed = 33 } = {}) {
  const len = N(dur), sw = osc(len, i => from * Math.pow(to / from, i / len)), nz = biquad(noise(dur, seed), 'lowpass', i => 6000 * Math.pow(0.02, i / len), 0.8);
  const b = new Float32Array(len); for (let i = 0; i < len; i++) { const e = Math.pow(1 - i / len, 1.6); b[i] = (sw[i] * 0.4 + nz[i] * 0.9) * e; }
  return fade(b, 0.002, 0.05);
}
// stereo whoosh; loudest at `peak` (fraction of dur) → place it at cut - peak*dur
export function whoosh(dur = 0.6, { from = 350, to = 4500, peak = 0.7, pan = 0.8, seed = 41 } = {}) {
  const len = N(dur), P = peak * len;
  const bp = biquad(noise(dur, seed), 'bandpass', i => i < P ? from * Math.pow(to / from, i / P) : to * Math.pow(from / to, (i - P) / (len - P)) , 1.4);
  const L = new Float32Array(len), R = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const x = i < P ? i / P : 1 - (i - P) / (len - P), e = Math.pow(Math.sin(Math.PI / 2 * x), 2.2) * 2.5, p = (i / len - 0.5) * pan;
    L[i] = bp[i] * e * Math.cos((p + 1) * Math.PI / 4); R[i] = bp[i] * e * Math.sin((p + 1) * Math.PI / 4);
  }
  return { L, R };
}
export function impact({ size = 1, seed = 51 } = {}) {
  const dur = 1.6 * size, len = N(dur);
  const boom = mul(osc(len, i => 30 + 40 * Math.exp(-i / SR / 0.09)), expEnv(len, 0.55 * size, 0.001));
  addInto(boom, mul(osc(len, i => 110 + 80 * Math.exp(-i / SR / 0.02)), expEnv(len, 0.09, 0.0005)), 0, 0.5);
  addInto(boom, mul(lowpass(noise(dur, seed), 3500), expEnv(len, 0.18 * size, 0.0005)), 0, 0.7);
  return fade(drive(boom, 0.5), 0.0005, 0.1);
}
export const boom = (o = {}) => { const b = impact(o); return lowpass(b, 180); };
export function reverseCymbal(dur = 1.5, o = {}) { const c = crash({ dur: dur * 1.3, ...o }); return fade(reverse(c).slice(c.length - N(dur)), 0.05, 0.003); }
export function click({ tone = 1, seed = 61 } = {}) {
  const len = N(0.03), b = mul(highpass(noise(0.03, seed), 2000), expEnv(len, 0.0018, 0.0002));
  addInto(b, mul(osc(len, 2600 * tone), expEnv(len, 0.004, 0.0002)), 0, 0.7);
  return fade(b, 0.0001, 0.005);
}
export function tick({ tone = 1 } = {}) { const len = N(0.03); return fade(mul(osc(len, 4400 * tone), expEnv(len, 0.006, 0.0002)), 0.0001, 0.005); }
export function pop(note = 'C6', { decay = 0.07 } = {}) {
  const f = hz(note), len = N(decay * 4); return fade(mul(osc(len, i => f * (1 - 0.4 * Math.exp(-i / SR / 0.012))), expEnv(len, decay, 0.001)), 0.0005, 0.01);
}
export function blip(note = 'E6', dur = 0.06) { const len = N(dur + 0.02); return fade(mul(lowpass(osc(len, hz(note), 'square'), 5000), adsr(len, 0.001, 0.02, 0.6, 0.02, dur)), 0.0005, 0.005); }
export function swipe(dur = 0.22, { up = true, seed = 71 } = {}) {
  const len = N(dur), b = biquad(noise(dur, seed), 'bandpass', i => up ? 1500 * Math.pow(5, i / len) : 7500 * Math.pow(0.2, i / len), 2);
  for (let i = 0; i < len; i++) b[i] *= Math.sin(Math.PI * i / len) * 2;
  return b;
}
export function glitch(dur = 0.25, { seed = 81, bits = 4 } = {}) {
  const r = rng(seed), len = N(dur), b = new Float32Array(len), step = N(1 / 64);
  const q = Math.pow(2, bits);
  for (let s = 0; s < len; s += step) {
    if (r() < 0.35) continue;
    const kind = r(), f = 200 + r() * 3000;
    for (let i = s; i < Math.min(len, s + step); i++) { const t = (i - s) / SR; let v = kind < 0.5 ? Math.sign(Math.sin(TAU * f * t)) : r() * 2 - 1; b[i] = Math.round(v * q) / q * 0.6; }
  }
  return fade(b, 0.0005, 0.005);
}
export function shimmer(dur = 1.5, { root = 'E6', seed = 91, count = 9 } = {}) {
  const r = rng(seed), len = N(dur), b = new Float32Array(len), base = midi(root), steps = [0, 2, 4, 7, 9, 12, 14, 16, 19];
  for (let k = 0; k < count; k++) {
    const st = N(r() * dur * 0.6), f = hz(base + steps[(r() * steps.length) | 0]), l = len - st;
    addInto(b, mul(osc(l, f), expEnv(l, 0.25 + r() * 0.4, 0.004)), st, 0.25);
  }
  return b;
}
// a bed of place / medium: tape hiss, vinyl crackle, wind, rain, room tone; returns {L, R}
export function ambience(dur, { kind = 'tape', amount = 1, seed = 131 } = {}) {
  const len = N(dur), side = s => {
    const r = rng(s), nz = noise(dur, s);
    switch (kind) {
      case 'tape': { const h = lowpass(highpass(nz, 2500), 12000); for (let i = 0; i < len; i++) h[i] *= 0.3 * (1 + 0.15 * Math.sin(TAU * 0.7 * i / SR)); return h; }
      case 'vinyl': {
        const b = mul(lowpass(highpass(nz, 3000), 9000), 0.06), c = new Float32Array(len);
        for (let i = 0; i < len; i++) if (r() < 18 / SR) { const a = (0.3 + r() * 0.7) * (r() < 0.5 ? -1 : 1); for (let k = 0; k < 24 && i + k < len; k++) c[i + k] += a * Math.exp(-k / 4); }
        addInto(b, highpass(c, 900), 0, 0.9); addInto(b, lowpass(noise(dur, s + 7), 45), 0, 0.5); return b;
      }
      case 'wind': { const p = [r(), r(), r()].map(v => v * TAU); return biquad(nz, 'bandpass', i => { const t = i / SR; return 500 * Math.pow(2, 0.9 * Math.sin(0.13 * TAU * t + p[0]) + 0.5 * Math.sin(0.31 * TAU * t + p[1])); }, 1.1).map((v, i) => v * 0.85 * (0.6 + 0.4 * Math.sin(0.09 * TAU * i / SR + p[2]))); }
      case 'rain': {
        const b = mul(lowpass(highpass(nz, 600), 7000), 0.25), d = new Float32Array(len);
        for (let i = 0; i < len; i++) if (r() < 400 / SR) { const a = (0.2 + r() * 0.8) * (r() < 0.5 ? -1 : 1); for (let k = 0; k < 60 && i + k < len; k++) d[i + k] += a * Math.exp(-k / 9); }
        addInto(b, bandpass(d, 3500, 0.8), 0, 0.8); return b;
      }
      case 'room': { const b = lowpass(nz, 350); addInto(b, highpass(noise(dur, s + 3), 6000), 0, 0.03); return mul(b, 1.3); }
      default: throw new Error(`unknown ambience ${kind}; use tape, vinyl, wind, rain, room`);
    }
  };
  return { L: fade(mul(side(seed), amount), 0.3, 0.3), R: fade(mul(side(seed + 1000), amount), 0.3, 0.3) };
}

// ─────────────────────────────── effects ───────────────────────────────
// Freeverb-style stereo reverb. in: {L,R}; returns wet {L,R}
export function reverb({ L, R }, { room = 0.84, damp = 0.3, width = 1 } = {}) {
  const k = SR / 44100, combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], alls = [556, 441, 341, 225];
  const run = (x, spread) => {
    const out = new Float32Array(x.length);
    for (const c of combs) {
      const n = Math.round((c + spread) * k), buf = new Float32Array(n); let idx = 0, store = 0;
      for (let i = 0; i < x.length; i++) { const y = buf[idx]; store = y * (1 - damp) + store * damp; buf[idx] = x[i] * 0.015 + store * room; out[i] += y; idx = (idx + 1) % n; }
    }
    for (const a of alls) {
      const n = Math.round((a + spread) * k), buf = new Float32Array(n); let idx = 0;
      for (let i = 0; i < out.length; i++) { const bo = buf[idx], v = out[i]; out[i] = -v + bo; buf[idx] = v + bo * 0.5; idx = (idx + 1) % n; }
    }
    return out;
  };
  const wl = run(L, 0), wr = run(R, 23), a = (1 + width) / 2, b = (1 - width) / 2;
  return { L: wl.map((v, i) => v * a + wr[i] * b), R: wr.map((v, i) => v * a + wl[i] * b) };
}
export function pingpong({ L, R }, { time = 0.25, feedback = 0.38, tone = 4500 } = {}) {
  const d = N(time), oL = new Float32Array(L.length), oR = new Float32Array(R.length), bL = new Float32Array(d), bR = new Float32Array(d);
  let idx = 0, lpL = 0, lpR = 0; const a = Math.exp(-TAU * tone / SR);
  for (let i = 0; i < L.length; i++) {
    const yL = bL[idx], yR = bR[idx]; lpL = (1 - a) * yL + a * lpL; lpR = (1 - a) * yR + a * lpR;
    oL[i] = yL; oR[i] = yR; bL[idx] = (L[i] + R[i]) * 0.5 + lpR * feedback; bR[idx] = lpL * feedback; idx = (idx + 1) % d;
  }
  return { L: oL, R: oR };
}
// bit-crush (in place): quantise to `bits`, optionally sample-and-hold down to `rate` Hz
export function crush(b, bits = 8, rate = SR) {
  const q = Math.pow(2, Math.max(1, bits) - 1), hold = Math.max(1, SR / Math.min(SR, rate));
  let v = 0, next = 0;
  for (let i = 0; i < b.length; i++) { if (i >= next) { v = Math.round(b[i] * q) / q; next += hold; } b[i] = v; }
  return b;
}
// tape wow (slow) + flutter (fast) as a modulated read position centred on "now" (offline, so no added latency);
// amt 0–1, applied identically to both channels
export function wow({ L, R }, amt = 0.5, { seed = 141 } = {}) {
  const r = rng(seed), p1 = r() * TAU, p2 = r() * TAU, n = L.length, oL = new Float32Array(n), oR = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR, d = amt * SR * (0.0028 * Math.sin(TAU * 0.55 * t + p1) + 0.00025 * Math.sin(TAU * 6.8 * t + p2)), x = i - d, k = Math.floor(x), f = x - k;
    if (k >= 0 && k + 1 < n) { oL[i] = L[k] * (1 - f) + L[k + 1] * f; oR[i] = R[k] * (1 - f) + R[k + 1] * f; }
  }
  return { L: oL, R: oR };
}

// ─────────────────────────── loudness & limiting ───────────────────────────
// ITU-R BS.1770 integrated loudness (LUFS) of a 48 kHz stereo signal
export function lufs(L, R) {
  const kw = x => {
    const s1 = biq(x, [1.53512485958697, -2.69169618940638, 1.19839281085285], [-1.69065929318241, 0.73248077421585]);
    return biq(s1, [1, -2, 1], [-1.99004745483398, 0.99007225036621]);
  };
  const a = kw(L), b = kw(R), blk = N(0.4), hop = N(0.1), z = [];
  for (let s = 0; s + blk <= a.length; s += hop) { let m = 0; for (let i = s; i < s + blk; i++) m += a[i] * a[i] + b[i] * b[i]; z.push(m / blk); }
  const ld = m => -0.691 + 10 * Math.log10(m);
  const g1 = z.filter(m => ld(m) > -70); if (!g1.length) return -Infinity;
  const rel = ld(g1.reduce((s, v) => s + v, 0) / g1.length) - 10;
  const g2 = g1.filter(m => ld(m) > rel);
  return ld(g2.reduce((s, v) => s + v, 0) / g2.length);
}
function biq(x, [b0, b1, b2], [a1, a2]) { const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; }
// look-ahead brickwall limiter on a stereo pair (in place)
export function limit(L, R, { ceilingDb = -1.5, lookahead = 0.005, release = 0.12 } = {}) {
  const c = Math.pow(10, ceilingDb / 20), n = L.length, la = N(lookahead), need = new Float32Array(n);
  for (let i = 0; i < n; i++) { const p = Math.max(Math.abs(L[i]), Math.abs(R[i])); need[i] = p > c ? c / p : 1; }
  const held = new Float32Array(n), dq = [];               // sliding min over [i, i+la]
  for (let i = n - 1; i >= 0; i--) {
    while (dq.length && need[dq[dq.length - 1]] >= need[i]) dq.pop();
    dq.push(i); while (dq[0] > i + la) dq.shift();
    held[i] = need[dq[0]];
  }
  const rc = 1 - Math.exp(-1 / (release * SR)); let acc = la, y = 1;   // acc starts as la virtual "1"s
  for (let i = 0; i < n; i++) {
    acc += held[i] - (i >= la ? held[i - la] : 1);
    y = Math.min(acc / la, y + (1 - y) * rc);
    L[i] = Math.max(-c, Math.min(c, L[i] * y)); R[i] = Math.max(-c, Math.min(c, R[i] * y));
  }
}
export function master(L, R, { target = -14, ceilingDb = -1.5 } = {}) {
  const hpL = highpass(L, 24, 0.7), hpR = highpass(R, 24, 0.7);
  let cur = lufs(hpL, hpR);
  if (!isFinite(cur)) return { L: hpL, R: hpR, lufs: cur };
  for (let k = 0; k < 5 && Math.abs(cur - target) > 0.2; k++) {
    const g = Math.pow(10, (target - cur) / 20); mul(hpL, g); mul(hpR, g);
    limit(hpL, hpR, { ceilingDb }); cur = lufs(hpL, hpR);
  }
  limit(hpL, hpR, { ceilingDb });
  return { L: hpL, R: hpR, lufs: lufs(hpL, hpR) };
}

// ─────────────────────────────── file io ───────────────────────────────
export function writeWav(file, L, R, bits = 24) {
  const n = L.length, bps = bits / 8, data = Buffer.alloc(n * 2 * bps), max = Math.pow(2, bits - 1) - 1;
  for (let i = 0; i < n; i++) for (const [c, ch] of [[0, L], [1, R]]) {
    const v = Math.round(Math.max(-1, Math.min(1, ch[i])) * max), o = (i * 2 + c) * bps;
    if (bits === 16) data.writeInt16LE(v, o); else data.writeIntLE(v, o, 3);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2 * bps, 28); h.writeUInt16LE(2 * bps, 32); h.writeUInt16LE(bits, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
}
// decode any audio file with ffmpeg → {L, R} at 48 kHz
export function loadAudio(file, channels = 2) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'f32le', '-ac', String(channels), '-ar', String(SR), '-'], { maxBuffer: 1 << 30 });
  const f = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  if (channels === 1) return Float32Array.from(f);
  const n = f.length / 2, L = new Float32Array(n), R = new Float32Array(n);
  for (let i = 0; i < n; i++) { L[i] = f[2 * i]; R[i] = f[2 * i + 1]; }
  return { L, R };
}

// ─────────────────────────────── session ───────────────────────────────
const VOICES = { kick, snare, clap, hat, crash, tom, shaker, rim, cowbell, bass, sub, pad, pluck, keys, bell, lead, mallet, organ, vox, riser, downlifter, whoosh, impact, boom, reverseCymbal, click, tick, pop, blip, swipe, glitch, shimmer, ambience };
const FX = { noise, osc, adsr, expEnv, mul, drive, reverse, fade, peakNorm, biquad, lowpass, highpass, bandpass, crush, midi, hz, chord, scale, rng };

// step pattern → beat positions: 'x..x..x.' with `step` beats per character ('x' / 'X' = hit, anything else = rest, spaces ignored)
export function steps(pattern, step = 0.25, from = 0) {
  const out = []; let k = 0;
  for (const c of String(pattern)) { if (c === ' ' || c === '|') continue; if (c === 'x' || c === 'X') out.push(from + k * step); k++; }
  return out;
}

export function session({ dur }) {
  if (!(dur > 0)) throw new Error('session needs a positive duration (export const DUR from the score or pass --dur)');
  const len = N(dur), buses = new Map(), ducks = [], space = { room: 0.84, damp: 0.3, width: 1 };
  const S = { SR, dur, bpm: 120, offset: 0, bpb: 4, ...VOICES, ...FX, steps };
  S.tempo = (bpm, { offset = 0, beatsPerBar = 4 } = {}) => { Object.assign(S, { bpm, offset, bpb: beatsPerBar }); return S; };
  S.beat = n => S.offset + n * 60 / S.bpm;
  S.bar = n => S.beat(n * S.bpb);
  // swing: beat position → seconds, with every second `grid` (in beats) pushed late by amount × grid (⅓ ≈ triplet feel)
  S.swing = (n, amount = 1 / 3, grid = 0.5) => {
    const pair = 2 * grid, k = Math.floor(n / pair), x = n - k * pair, m = grid * (1 + amount);
    return S.beat(k * pair + (x < grid ? x * m / grid : m + (x - grid) * (pair - m) / grid));
  };
  // deterministic timing jitter (± ms), seeded by the time itself, for parts that should not sound quantised
  S.humanize = (t, ms = 8, seed = 0) => t + (rng(Math.round(t * 1e4) * 31 + seed)() * 2 - 1) * ms / 1000;
  // the character of the shared reverb: room 0.3 (small room) … 0.95 (huge hall), damp 0 (bright) … 0.9 (dark), width 0–1
  S.space = (o = {}) => { Object.assign(space, o); space.room = Math.min(0.95, Math.max(0.1, space.room)); return S; };
  S.load = file => loadAudio(file);
  S.duck = (t, depth = 1) => { ducks.push([t, depth]); };
  // bus options: gain, pan, reverb (send 0–1), delay (send 0–1), delayTime (s), duck (0–1 sidechain depth),
  //              duckRelease (s), lowpass, highpass (Hz), drive (0–1), crush (bits, 0 = off), crushRate (Hz),
  //              wow (0–1 tape wow & flutter), width (0–1, 0 = mono)
  S.bus = (name, o = {}) => {
    if (buses.has(name)) return buses.get(name);
    const bus = { name, o: { gain: 1, pan: 0, reverb: 0, delay: 0, delayTime: 60 / S.bpm * 0.75, duck: 0, duckRelease: 0.2, width: 1, ...o }, L: new Float32Array(len), R: new Float32Array(len) };
    bus.add = (snd, t, { gain = 1, pan = 0 } = {}) => {
      if (t >= dur || snd == null) return bus;
      const at = Math.round(t * SR);
      const p = Math.max(-1, Math.min(1, pan + bus.o.pan)), gl = Math.cos((p + 1) * Math.PI / 4) * Math.SQRT2, gr = Math.sin((p + 1) * Math.PI / 4) * Math.SQRT2;
      if (snd.L) { addInto(bus.L, snd.L, at, gain * Math.min(1, gl)); addInto(bus.R, snd.R, at, gain * Math.min(1, gr)); }
      else { addInto(bus.L, snd, at, gain * gl * 0.7071); addInto(bus.R, snd, at, gain * gr * 0.7071); }
      return bus;
    };
    buses.set(name, bus); return bus;
  };
  S.render = ({ target = -14, stems = null } = {}) => {
    const L = new Float32Array(len), R = new Float32Array(len), rvL = new Float32Array(len), rvR = new Float32Array(len), dlL = new Float32Array(len), dlR = new Float32Array(len);
    for (const bus of buses.values()) {
      let { L: bl, R: br } = bus; const o = bus.o;
      if (o.highpass) { bl = highpass(bl, o.highpass); br = highpass(br, o.highpass); }
      if (o.lowpass) { bl = lowpass(bl, o.lowpass); br = lowpass(br, o.lowpass); }
      if (o.drive) { drive(bl, o.drive); drive(br, o.drive); }
      if (o.crush) { crush(bl, o.crush, o.crushRate || SR); crush(br, o.crush, o.crushRate || SR); }
      if (o.wow) ({ L: bl, R: br } = wow({ L: bl, R: br }, o.wow));
      if (o.width < 1) for (let i = 0; i < len; i++) { const m = (bl[i] + br[i]) / 2, s = (bl[i] - br[i]) / 2 * o.width; bl[i] = m + s; br[i] = m - s; }
      if (o.duck > 0 && ducks.length) {
        const env = new Float32Array(len), A = N(0.004);
        for (const [t, d] of ducks) { const s = N(t); for (let i = Math.max(0, s - A); i < Math.min(len, s + N(o.duckRelease * 5)); i++) { const x = i < s ? (i - s + A) / A : Math.exp(-(i - s) / SR / o.duckRelease); env[i] = Math.max(env[i], x * d); } }
        for (let i = 0; i < len; i++) { const g = 1 - o.duck * Math.min(1, env[i]); bl[i] *= g; br[i] *= g; }
      }
      for (let i = 0; i < len; i++) {
        const l = bl[i] * o.gain, r = br[i] * o.gain;
        L[i] += l; R[i] += r; rvL[i] += l * o.reverb; rvR[i] += r * o.reverb; dlL[i] += l * o.delay; dlR[i] += r * o.delay;
      }
      if (stems) writeWav(`${stems}/${bus.name}.wav`, bl.map(v => v * o.gain), br.map(v => v * o.gain));
    }
    if (rvL.some(v => v !== 0)) { const w = reverb({ L: rvL, R: rvR }, space); addInto(L, w.L); addInto(R, w.R); }
    if (dlL.some(v => v !== 0)) { const t = [...buses.values()].find(b => b.o.delay > 0)?.o.delayTime || 0.375; const w = pingpong({ L: dlL, R: dlR }, { time: t }); addInto(L, w.L); addInto(R, w.R); }
    return master(L, R, { target });
  };
  return S;
}
