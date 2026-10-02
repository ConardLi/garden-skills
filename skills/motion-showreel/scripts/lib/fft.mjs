// In-place iterative radix-2 complex FFT. re/im are Float64Array of power-of-two length.
export function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
}

// Magnitude spectrogram frames of a mono signal.
export function stft(x, nfft = 1024, hop = 256) {
  const win = new Float64Array(nfft).map((_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (nfft - 1)));
  const frames = Math.max(0, 1 + Math.floor((x.length - nfft) / hop)), out = [];
  const re = new Float64Array(nfft), im = new Float64Array(nfft);
  for (let f = 0; f < frames; f++) {
    for (let i = 0; i < nfft; i++) { re[i] = x[f * hop + i] * win[i]; im[i] = 0; }
    fft(re, im);
    const mag = new Float32Array(nfft / 2 + 1);
    for (let k = 0; k <= nfft / 2; k++) mag[k] = Math.hypot(re[k], im[k]);
    out.push(mag);
  }
  return out;
}
