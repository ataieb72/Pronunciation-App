const toDb = (ratio: number) => (ratio > 0 ? 20 * Math.log10(ratio) : Number.NEGATIVE_INFINITY);

/** Peak level in dB relative to full scale (0 dBFS = ±1). */
export function peakDbfs(samples: Float32Array): number {
  let peak = 0;
  for (const s of samples) peak = Math.max(peak, Math.abs(s));
  return toDb(peak);
}

export function rmsDbfs(samples: Float32Array): number {
  if (samples.length === 0) return Number.NEGATIVE_INFINITY;
  let sum = 0;
  for (const s of samples) sum += s * s;
  return toDb(Math.sqrt(sum / samples.length));
}

/** Share of samples at or near full scale (|x| ≥ 0.999). */
export function clippedRatio(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  let clipped = 0;
  for (const s of samples) if (Math.abs(s) >= 0.999) clipped++;
  return clipped / samples.length;
}
