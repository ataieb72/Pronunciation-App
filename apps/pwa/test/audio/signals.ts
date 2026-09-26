/** Small synthetic signals for audio tests (48 kHz, like the Pixel's mic). */
export const MIC_RATE = 48_000;

export function tone(seconds: number, amplitude = 0.1, freq = 180, rate = MIC_RATE): Float32Array {
  return Float32Array.from({ length: Math.round(seconds * rate) }, (_, i) => amplitude * Math.sin((2 * Math.PI * freq * i) / rate));
}

/** Deterministic low noise floor (about −70 dBFS). */
export function hush(seconds: number, rate = MIC_RATE, seed = 1): Float32Array {
  let state = seed;
  return Float32Array.from({ length: Math.round(seconds * rate) }, () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return (state / 2147483648 - 0.5) * 0.001;
  });
}

export function join(...parts: Float32Array[]): Float32Array {
  const out = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

export function withFloor(signal: Float32Array, seed = 2): Float32Array {
  const floor = hush(signal.length / MIC_RATE, MIC_RATE, seed);
  return signal.map((v, i) => v + (floor[i] ?? 0));
}

/** Feeds a signal in AudioWorklet-sized batches (1024 samples) until the recorder stops. */
export function feed(push: (chunk: Float32Array) => unknown, signal: Float32Array, batch = 1024): void {
  for (let i = 0; i < signal.length; i += batch) {
    if (push(signal.subarray(i, i + batch)) !== null) return;
  }
}

/**
 * Speech-like bursts: 150 ms at full level, 100 ms 20 dB softer, repeated. Real speech dips
 * between syllables; a perfectly steady tone longer than about 3 s counts as background noise.
 */
export function syllables(seconds: number, amplitude = 0.1): Float32Array {
  const period = Math.round(0.25 * MIC_RATE);
  const loud = Math.round(0.15 * MIC_RATE);
  return Float32Array.from({ length: Math.round(seconds * MIC_RATE) }, (_, i) => {
    const gain = i % period < loud ? amplitude : amplitude / 10;
    return gain * Math.sin((2 * Math.PI * 180 * i) / MIC_RATE);
  });
}
