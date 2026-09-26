/** Synthetic test signals. */
export function sine(freq: number, sampleRate: number, seconds: number, amplitude = 0.5): Float32Array {
  const n = Math.round(sampleRate * seconds);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = amplitude * Math.sin((2 * Math.PI * freq * i) / sampleRate);
  return out;
}

export function rms(x: Float32Array, from = 0, to = x.length): number {
  let sum = 0;
  for (let i = from; i < to; i++) sum += (x[i] ?? 0) ** 2;
  return Math.sqrt(sum / Math.max(1, to - from));
}

/**
 * Frequency estimate from positive-going zero crossings in the middle half of the signal.
 * Crossing positions are linearly interpolated between samples for sub-sample accuracy.
 */
export function zeroCrossingFreq(x: Float32Array, sampleRate: number): number {
  const from = Math.floor(x.length / 4);
  const to = Math.floor((3 * x.length) / 4);
  let first = -1;
  let last = -1;
  let count = 0;
  for (let i = from + 1; i < to; i++) {
    const a = x[i - 1] ?? 0;
    const b = x[i] ?? 0;
    if (a < 0 && b >= 0) {
      const crossing = i - 1 + a / (a - b);
      if (first < 0) first = crossing;
      last = crossing;
      count++;
    }
  }
  return ((count - 1) * sampleRate) / (last - first);
}
