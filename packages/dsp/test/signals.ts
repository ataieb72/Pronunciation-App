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

/** Joins signals end to end. */
export function concat(...parts: Float32Array[]): Float32Array {
  const out = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

/** Deterministic white Gaussian noise at a given RMS level (dBFS). */
export function noise(sampleRate: number, seconds: number, rmsDbfs: number, seed = 1): Float32Array {
  let state = seed >>> 0;
  const uniform = () => {
    // mulberry32
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const sigma = 10 ** (rmsDbfs / 20);
  const n = Math.round(sampleRate * seconds);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const u = Math.max(uniform(), 1e-12);
    out[i] = sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * uniform());
  }
  return out;
}

/** Adds b onto a (same length or shorter), returning a new signal. */
export function mix(a: Float32Array, b: Float32Array): Float32Array {
  const out = Float32Array.from(a);
  for (let i = 0; i < Math.min(a.length, b.length); i++) out[i] = (out[i] ?? 0) + (b[i] ?? 0);
  return out;
}
