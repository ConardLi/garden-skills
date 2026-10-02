// motion.js — pure, time-driven helpers for render(t). No state, no timers, no Math.random().
// Every function maps (t, parameters) → value, so any frame can be rendered alone, in any order.

export const TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const invlerp = (a, b, x) => (x - a) / (b - a);
export const remap = (x, a, b, c, d, ease = null) => { const k = clamp(invlerp(a, b, x)); return lerp(c, d, ease ? ease(k) : k); };
/** 0 → 1 progress of t through [a, b], clamped. Never NaN: an empty / infinite window acts as a step at a. */
export const seg = (t, a, b) => { const d = b - a; return d > 0 && Number.isFinite(d) ? clamp((t - a) / d) : (t >= a ? 1 : 0); };
/** 0 → 1 → 0 window: rises over [a, a+inD], falls over [b-outD, b] */
export const win = (t, a, b, inD = 0.25, outD = 0.25, e = ease.outCubic) => Math.min(e(seg(t, a, a + inD)), 1 - ease.inCubic(seg(t, b - outD, b)));

// ── easing (input and output on 0–1) ──
export const ease = {
  linear: x => x,
  inQuad: x => x * x, outQuad: x => 1 - (1 - x) ** 2,
  inCubic: x => x ** 3, outCubic: x => 1 - (1 - x) ** 3,
  inOutCubic: x => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2),
  outQuart: x => 1 - (1 - x) ** 4, inOutQuart: x => (x < 0.5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2),
  outQuint: x => 1 - (1 - x) ** 5, inOutQuint: x => (x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2),
  inExpo: x => (x <= 0 ? 0 : 2 ** (10 * x - 10)), outExpo: x => (x >= 1 ? 1 : 1 - 2 ** (-10 * x)),
  inOutExpo: x => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 2 ** (20 * x - 10) / 2 : (2 - 2 ** (-20 * x + 10)) / 2),
  inOutSine: x => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: (x, s = 1.70158) => 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2,
  inBack: (x, s = 1.70158) => (s + 1) * x ** 3 - s * x ** 2,
};
/** CSS-style cubic-bezier(x1, y1, x2, y2) → easing function */
export function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = u => ((ax * u + bx) * u + cx) * u, Y = u => ((ay * u + by) * u + cy) * u, dX = u => (3 * ax * u + 2 * bx) * u + cx;
  return x => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let u = x; for (let i = 0; i < 6; i++) { const d = dX(u); if (Math.abs(d) < 1e-6) break; u -= (X(u) - x) / d; }
    return Y(clamp(u));
  };
}
// Snappy "designed" curves worth reaching for instead of linear / inOutCubic everywhere
export const snap = bezier(0.7, 0, 0.2, 1);     // hard start, long glide — layout snaps, wipes
export const glide = bezier(0.16, 1, 0.3, 1);   // ≈ outExpo — arrivals, camera settles
export const whip = bezier(0.85, 0, 0.15, 1);   // whip-pan / smash transitions

// ── closed-form spring ──
/**
 * Spring step response 0 → 1 at time x (s) after the target changed. No integration, no state.
 * freq = natural frequency in Hz (higher = faster), damp = damping ratio (1 = no overshoot, 0.5 = bouncy).
 * Presets: UI edge {freq: 3.6, damp: 0.8} · cards/camera {2.4, 0.75} · hero type/logo {1.6, 0.95} · playful {2.8, 0.45}
 */
export function spring(x, { freq = 2.4, damp = 0.75 } = {}) {
  if (x <= 0) return 0;
  const w = TAU * freq;
  if (damp >= 1) return 1 - Math.exp(-w * x) * (1 + w * x);
  const wd = w * Math.sqrt(1 - damp * damp);
  return 1 - Math.exp(-damp * w * x) * (Math.cos(wd * x) + (damp * w / wd) * Math.sin(wd * x));
}
/**
 * A value that springs to new targets over time: keys = [[t0, v0], [t1, v1, opts?], ...].
 * v(t) = v0 + Σ (v_i − v_{i−1}) · spring(t − t_i). Retargets stay continuous; any frame is computable alone.
 * Values may be numbers or equal-length arrays.
 */
export function springTo(t, keys, opts) {
  const arr = Array.isArray(keys[0][1]);
  let v = arr ? keys[0][1].slice() : keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [ti, vi, o] = keys[i], s = spring(t - ti, o || opts), prev = keys[i - 1][1];
    if (arr) for (let k = 0; k < v.length; k++) v[k] += (vi[k] - prev[k]) * s; else v += (vi - prev) * s;
  }
  return v;
}
/** Keyframe tween: keys = [[t, value, ease?], ...]; the ease on a key shapes the segment arriving at it. Arrays OK. */
export function tween(t, keys, e = ease.inOutCubic) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1], k = (e1 || e)((t - t0) / (t1 - t0));
      return Array.isArray(v0) ? v0.map((a, j) => lerp(a, v1[j], k)) : lerp(v0, v1, k);
    }
  }
  return keys[keys.length - 1][1];
}
/** Start time of item i of n when a group spreads over `span` seconds (optionally from the centre) */
export const stagger = (i, n, span, { from = 'start' } = {}) => {
  if (n <= 1) return 0;
  const k = from === 'center' ? Math.abs(i - (n - 1) / 2) / ((n - 1) / 2) : from === 'end' ? (n - 1 - i) / (n - 1) : i / (n - 1);
  return k * span;
};
/** Quantise time for "on twos / threes" stepped animation (pixel, cel, stop-motion). Keep camera smooth! */
export const stepped = (t, fps = 12) => Math.floor(t * fps + 1e-6) / fps;
/** Decaying pulse after each hit time (for flashes, scale kicks, shake): sum of exp decays */
export function pulse(t, times, decay = 0.18, attack = 0.012) {
  let v = 0;
  for (const h of Array.isArray(times) ? times : [times]) { const d = t - h; if (d >= -attack && d < decay * 6) v += d < 0 ? 1 + d / attack : Math.exp(-d / decay); }
  return v;
}
/** Deterministic camera shake [dx, dy, rot] that decays after each hit */
export function shake(t, times, amp = 12, decay = 0.25, seed = 1) {
  const e = pulse(t, times, decay, 0.001) * amp;
  return [noise1(t * 28, seed) * 2 - 1, noise1(t * 28, seed + 7) * 2 - 1, (noise1(t * 21, seed + 13) * 2 - 1) * 0.01].map((v, i) => v * (i < 2 ? e : e / amp));
}

// ── deterministic randomness & noise ──
/** Seeded PRNG (mulberry32). Create it INSIDE render(t) from a fixed seed, never at module scope across frames. */
export function rng(seed = 1) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
/** Stateless hash of an integer (and seed) → [0, 1) */
export function hash(n, seed = 0) { let h = Math.imul((n | 0) ^ Math.imul(seed | 0, 0x9E3779B1), 0x85EBCA6B); h ^= h >>> 13; h = Math.imul(h, 0xC2B2AE35); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
const fade5 = x => x * x * x * (x * (x * 6 - 15) + 10);
/** Smooth 1-D value noise in [0, 1] */
export function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i; return lerp(hash(i, seed), hash(i + 1, seed), fade5(f)); }
/** Smooth 2-D value noise in [0, 1] */
export function noise2(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = fade5(x - xi), yf = fade5(y - yi), h = (a, b) => hash(a * 374761 + b * 668265, seed);
  return lerp(lerp(h(xi, yi), h(xi + 1, yi), xf), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), xf), yf);
}
export function fbm(x, y, oct = 4, seed = 0) { let v = 0, a = 0.5, f = 1; for (let i = 0; i < oct; i++) { v += a * noise2(x * f, y * f, seed + i); f *= 2; a /= 2; } return v / (1 - 0.5 ** oct); }

// ── colour ──
const hex2rgb = h => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); };
const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4), gam = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function toOklab([r, g, b]) { [r, g, b] = [r, g, b].map(lin); const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b); return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]; }
function fromOklab([L, A, B]) { const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3, m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3, s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3; return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(c => clamp(gam(c))); }
/** Perceptual (OKLab) mix of two hex colours → 'rgb(...)' string; alpha optional */
export function mix(a, b, k, alpha = 1) { const A = toOklab(hex2rgb(a)), B = toOklab(hex2rgb(b)); const c = fromOklab(A.map((v, i) => lerp(v, B[i], clamp(k)))).map(v => Math.round(v * 255)); return alpha < 1 ? `rgba(${c},${alpha})` : `rgb(${c})`; }
export const rgba = (h, a = 1) => `rgba(${hex2rgb(h).map(v => Math.round(v * 255))},${a})`;

// ── stage & canvas ──
/** Read the render size the tool asked for (?w=&h=), falling back to the window. */
export function stageSize() { const q = new URLSearchParams(location.search); return { W: +q.get('w') || innerWidth, H: +q.get('h') || innerHeight }; }
/** Size a canvas for the stage at device pixel ratio; returns its 2D context scaled to CSS pixels. */
export function setupCanvas(canvas, W, H, opts = {}) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d', opts); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
/** 2-D virtual camera: centre (cx, cy) in world units at zoom, rotation (rad). Call inside save/restore. */
export function camera(ctx, W, H, { x = W / 2, y = H / 2, zoom = 1, rot = 0 } = {}) {
  ctx.translate(W / 2, H / 2); ctx.rotate(rot); ctx.scale(zoom, zoom); ctx.translate(-x, -y);
}
/** Wait for named fonts before READY, e.g. await loadFonts(['800 120px "Archivo"', '400 32px "JetBrains Mono"']) */
export async function loadFonts(specs = []) { await Promise.all(specs.map(s => document.fonts.load(s))); await document.fonts.ready; }
/** Load an image and decode it before READY */
export const loadImage = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => i.decode().then(() => res(i), () => res(i)); i.onerror = rej; i.src = src; });
