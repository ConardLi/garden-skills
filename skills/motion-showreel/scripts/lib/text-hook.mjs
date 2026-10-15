// Runs inside the page (render.mjs --text-check installs it before any page script). Self-contained: it is
// serialised into the page, so it may not use anything from this module's scope.
//
// Records where text lands on screen, for the framing check:
//   • Canvas 2D fillText / strokeText: the measured glyph box, through the current transform, stored on the canvas
//     it was drawn on. drawImage() of a canvas carries its boxes along (text drawn into an offscreen buffer or a
//     sprite cache, then pasted and moved, is still found). Text drawn while a clip is active is marked `clip`.
//   • DOM / SVG text nodes: their client rects (transforms included), skipping invisible / transparent ones.
// Blind spots: text inside WebGL textures, text baked into images, text hidden behind other drawings.
export function textHook() {
  const boxes = new WeakMap();
  const list = c => { let l = boxes.get(c); if (!l) boxes.set(c, (l = [])); return l; };
  const isCanvas = s => (typeof HTMLCanvasElement !== 'undefined' && s instanceof HTMLCanvasElement) || (typeof OffscreenCanvas !== 'undefined' && s instanceof OffscreenCanvas);
  const protos = [self.CanvasRenderingContext2D, self.OffscreenCanvasRenderingContext2D].filter(Boolean).map(k => k.prototype);
  for (const P of protos) {
    const o = { save: P.save, restore: P.restore, clip: P.clip, fillText: P.fillText, strokeText: P.strokeText, drawImage: P.drawImage, clearRect: P.clearRect, fillRect: P.fillRect };
    P.save = function () { (this.__cs || (this.__cs = [])).push(!!this.__clip); return o.save.apply(this, arguments); };
    P.restore = function () { if (this.__cs && this.__cs.length) this.__clip = this.__cs.pop(); return o.restore.apply(this, arguments); };
    P.clip = function () { this.__clip = true; return o.clip.apply(this, arguments); };
    const rec = function (text, x, y, maxW) {
      const s = String(text); if (!s.trim()) return;
      const m = this.measureText(s);
      let l = x - m.actualBoundingBoxLeft, r = x + m.actualBoundingBoxRight;
      const t = y - m.actualBoundingBoxAscent, b = y + m.actualBoundingBoxDescent;
      if (maxW !== undefined && m.width > maxW && m.width > 0) { const k = maxW / m.width; l = x + (l - x) * k; r = x + (r - x) * k; }
      const M = this.getTransform(), pt = (px, py) => [M.a * px + M.c * py + M.e, M.b * px + M.d * py + M.f];
      const px = parseFloat((/(\d*\.?\d+)px/.exec(this.font) || [])[1]) || 10;
      list(this.canvas).push({ q: [pt(l, t), pt(r, t), pt(r, b), pt(l, b)], text: s, clip: !!this.__clip, size: px * Math.sqrt(Math.abs(M.a * M.d - M.b * M.c)), alpha: this.globalAlpha });
    };
    P.fillText = function (...a) { rec.apply(this, a); return o.fillText.apply(this, a); };
    P.strokeText = function (...a) { rec.apply(this, a); return o.strokeText.apply(this, a); };
    P.drawImage = function (src, ...a) {
      const from = isCanvas(src) && boxes.get(src);
      if (from && from.length && src.width && src.height) {
        let sx = 0, sy = 0, sw = src.width, sh = src.height, dx, dy, dw, dh;
        if (a.length === 2) { [dx, dy] = a; dw = sw; dh = sh; } else if (a.length === 4) [dx, dy, dw, dh] = a; else [sx, sy, sw, sh, dx, dy, dw, dh] = a;
        const M = this.getTransform(), kx = dw / sw, ky = dh / sh;
        const map = ([x, y]) => { const u = dx + (x - sx) * kx, v = dy + (y - sy) * ky; return [M.a * u + M.c * v + M.e, M.b * u + M.d * v + M.f]; };
        const sc = Math.sqrt(Math.abs((M.a * M.d - M.b * M.c) * kx * ky));
        const cropped = a.length === 8 && (sx > 0 || sy > 0 || sw < src.width || sh < src.height);
        const dst = list(this.canvas);
        for (const bx of from) dst.push({ q: bx.q.map(map), text: bx.text, clip: bx.clip || !!this.__clip || cropped, size: bx.size * sc, alpha: bx.alpha * this.globalAlpha });
      }
      return o.drawImage.call(this, src, ...a);
    };
    // painting over the whole canvas with an opaque operation forgets the text that was on it (reused buffers)
    const wipes = function (x, y, w, h, kind) {
      if (kind !== 'clear' && (!kind || this.globalAlpha < 1 || this.globalCompositeOperation !== 'source-over')) return;
      const M = this.getTransform(), c = this.canvas;
      const xs = [x, x + w], ys = [y, y + h], pts = xs.flatMap(u => ys.map(v => [M.a * u + M.c * v + M.e, M.b * u + M.d * v + M.f]));
      if (Math.min(...pts.map(p => p[0])) <= 1 && Math.min(...pts.map(p => p[1])) <= 1 && Math.max(...pts.map(p => p[0])) >= c.width - 1 && Math.max(...pts.map(p => p[1])) >= c.height - 1) boxes.set(c, []);
    };
    P.clearRect = function (...a) { wipes.call(this, ...a, 'clear'); return o.clearRect.apply(this, a); };
    P.fillRect = function (...a) { wipes.call(this, ...a, typeof this.fillStyle === 'string' && !/(rgba|hsla)\([^)]*,\s*(0|0?\.\d+)\s*\)|transparent|^#[0-9a-f]{8}$/i.test(this.fillStyle)); return o.fillRect.apply(this, a); };
  }
  if (typeof document === 'undefined') return;
  self.__msrText = {
    // every on-screen canvas is redrawn by render(t): forget what was on it before the frame
    reset() { for (const c of document.querySelectorAll('canvas')) boxes.set(c, []); },
    collect() {
      const opac = new Map(), clipC = new Map();
      const opacity = el => { if (!el || el === document.documentElement) return 1; if (opac.has(el)) return opac.get(el); const v = (parseFloat(getComputedStyle(el).opacity) || 0) * opacity(el.parentElement); opac.set(el, v); return v; };
      const clipped = el => { if (!el || el === document.body) return false; if (clipC.has(el)) return clipC.get(el); const s = getComputedStyle(el); const v = s.overflow !== 'visible' || (s.clipPath && s.clipPath !== 'none') || (s.maskImage && s.maskImage !== 'none') || clipped(el.parentElement); clipC.set(el, v); return v; };
      const out = [];
      for (const c of document.querySelectorAll('canvas')) {
        const l = boxes.get(c); if (!l || !l.length) continue;
        const R = c.getBoundingClientRect(); if (!R.width || !c.width) continue;
        const kx = R.width / c.width, ky = R.height / c.height, op = opacity(c);
        if (op < 0.05) continue;
        for (const b of l) {
          const xs = b.q.map(p => R.left + p[0] * kx), ys = b.q.map(p => R.top + p[1] * ky);
          out.push({ src: 'canvas', text: b.text.slice(0, 60), x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys), clip: b.clip, size: b.size * ky, alpha: b.alpha * op });
        }
      }
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n; (n = walk.nextNode());) {
        const s = n.nodeValue; if (!s.trim()) continue;
        const el = n.parentElement; if (!el || el.closest('script,style,noscript,canvas,title')) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || /rgba\([^)]*,\s*0\)$/.test(cs.color)) continue;
        const op = opacity(el); if (op < 0.05) continue;
        const r = document.createRange(); r.selectNodeContents(n);
        for (const q of r.getClientRects()) {
          if (q.width < 1 || q.height < 1) continue;
          out.push({ src: 'dom', text: s.trim().slice(0, 60), x0: q.left, y0: q.top, x1: q.right, y1: q.bottom, clip: clipped(el), size: q.height / 1.2, alpha: op });
        }
      }
      return out;
    },
  };
}
