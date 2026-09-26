/**
 * In-place radix-2 complex FFT. `inverse` computes the inverse transform, scaled by 1/n,
 * so that fft then inverse fft returns the input.
 */
export function fft(re: Float64Array, im: Float64Array, inverse = false): void {
  const n = re.length;
  if (n !== im.length || n === 0 || (n & (n - 1)) !== 0) throw new RangeError('FFT size must be a power of two');

  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j] ?? 0, re[i] ?? 0];
      [im[i], im[j]] = [im[j] ?? 0, im[i] ?? 0];
    }
  }

  for (let size = 2; size <= n; size <<= 1) {
    const angle = ((inverse ? 2 : -2) * Math.PI) / size;
    const wRe = Math.cos(angle);
    const wIm = Math.sin(angle);
    for (let start = 0; start < n; start += size) {
      let uRe = 1;
      let uIm = 0;
      for (let k = 0; k < size / 2; k++) {
        const a = start + k;
        const b = a + size / 2;
        const tRe = (re[b] ?? 0) * uRe - (im[b] ?? 0) * uIm;
        const tIm = (re[b] ?? 0) * uIm + (im[b] ?? 0) * uRe;
        re[b] = (re[a] ?? 0) - tRe;
        im[b] = (im[a] ?? 0) - tIm;
        re[a] = (re[a] ?? 0) + tRe;
        im[a] = (im[a] ?? 0) + tIm;
        const next = uRe * wRe - uIm * wIm;
        uIm = uRe * wIm + uIm * wRe;
        uRe = next;
      }
    }
  }

  if (inverse) {
    for (let i = 0; i < n; i++) {
      re[i] = (re[i] ?? 0) / n;
      im[i] = (im[i] ?? 0) / n;
    }
  }
}
