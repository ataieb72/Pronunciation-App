/**
 * Band-limited resampling with a Blackman-windowed sinc kernel.
 * The low-pass cutoff sits at 45% of the lower rate, so tones above the
 * new Nyquist frequency are removed instead of folding back as distortion.
 */

const ZERO_CROSSINGS = 16; // kernel length, in zero crossings of the low-pass sinc
const TABLE_RESOLUTION = 256; // kernel samples per input sample

function blackman(u: number): number {
  return 0.42 + 0.5 * Math.cos(Math.PI * u) + 0.08 * Math.cos(2 * Math.PI * u);
}

function kernelTable(cutoff: number, halfWidth: number): Float32Array {
  const size = halfWidth * TABLE_RESOLUTION + 2;
  const table = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    const d = i / TABLE_RESOLUTION;
    if (d > halfWidth) continue;
    const x = 2 * cutoff * d;
    const sinc = x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
    table[i] = 2 * cutoff * sinc * blackman(d / halfWidth);
  }
  return table;
}

function lookup(table: Float32Array, distance: number): number {
  const pos = Math.abs(distance) * TABLE_RESOLUTION;
  const i = Math.floor(pos);
  const frac = pos - i;
  const a = table[i] ?? 0;
  const b = table[i + 1] ?? 0;
  return a + (b - a) * frac;
}

export function resample(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (!(fromRate > 0 && Number.isFinite(fromRate)) || !(toRate > 0 && Number.isFinite(toRate))) {
    throw new RangeError('sample rates must be positive numbers');
  }
  if (fromRate === toRate) return input.slice();

  const step = fromRate / toRate; // input samples per output sample
  const outLength = Math.round(input.length / step);
  const out = new Float32Array(outLength);
  if (outLength === 0) return out;

  const cutoff = (0.45 * Math.min(fromRate, toRate)) / fromRate; // cycles per input sample
  const halfWidth = Math.ceil(ZERO_CROSSINGS / (2 * cutoff));
  const table = kernelTable(cutoff, halfWidth);

  for (let j = 0; j < outLength; j++) {
    const t = j * step;
    const first = Math.max(0, Math.ceil(t - halfWidth));
    const last = Math.min(input.length - 1, Math.floor(t + halfWidth));
    let sum = 0;
    let weights = 0;
    for (let k = first; k <= last; k++) {
      const w = lookup(table, t - k);
      sum += (input[k] ?? 0) * w;
      weights += w;
    }
    // Normalising by the weight sum keeps DC gain at 1, including near the edges.
    out[j] = weights > 0 ? sum / weights : 0;
  }
  return out;
}
