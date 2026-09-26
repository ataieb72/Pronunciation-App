/**
 * Intensity (loudness over time), following Praat's "To Intensity": a Kaiser–Bessel window of
 * 6.4 / (minimum pitch) seconds on Praat's frame grid, mean pressure optionally removed.
 * Values are in dBFS (Praat's dB values minus 93.98 dB).
 */

export interface IntensityTrack {
  readonly timeStep: number;
  /** Time of the first frame, in seconds. */
  readonly t0: number;
  /** dBFS per frame. */
  readonly db: Float32Array;
}

export interface IntensityOptions {
  readonly minPitchHz?: number;
  readonly timeStep?: number;
  readonly subtractMean?: boolean;
}

/** Modified Bessel function of the first kind, order 0 (power series). */
function besselI0(x: number): number {
  let sum = 1;
  let term = 1;
  const q = (x * x) / 4;
  for (let k = 1; k < 200; k++) {
    term *= q / (k * k);
    sum += term;
    if (term < sum * 1e-16) break;
  }
  return sum;
}

export function intensityTrack(samples: Float32Array, sampleRate: number, options: IntensityOptions = {}): IntensityTrack {
  const minPitch = options.minPitchHz ?? 100;
  const timeStep = options.timeStep ?? 0.01; // R2 tracks all use 10 ms (Praat's default would be 0.8 / minPitch)
  const subtractMean = options.subtractMean ?? true;
  const dx = 1 / sampleRate;
  const duration = samples.length * dx;
  const windowDuration = 6.4 / minPitch;
  const halfWindowDuration = windowDuration / 2;
  const halfWindow = Math.floor(halfWindowDuration / dx);

  const window = new Float64Array(2 * halfWindow + 1);
  for (let i = -halfWindow; i <= halfWindow; i++) {
    const x = (i * dx) / halfWindowDuration;
    const root = 1 - x * x;
    window[i + halfWindow] = root <= 0 ? 0 : besselI0((2 * Math.PI * Math.PI + 0.5) * Math.sqrt(root));
  }

  const frameCount = duration >= windowDuration ? Math.floor((duration - windowDuration) / timeStep) + 1 : 0;
  const t0 = duration / 2 - (frameCount * timeStep) / 2 + timeStep / 2;
  const db = new Float32Array(frameCount);

  for (let k = 0; k < frameCount; k++) {
    const t = t0 + k * timeStep;
    const mid = Math.round((t - 0.5 * dx) / dx);
    const left = Math.max(0, mid - halfWindow);
    const right = Math.min(samples.length - 1, mid + halfWindow);
    let mean = 0;
    if (subtractMean) {
      for (let i = left; i <= right; i++) mean += samples[i] ?? 0;
      mean /= right - left + 1;
    }
    let sumxw = 0;
    let sumw = 0;
    for (let i = left; i <= right; i++) {
      const w = window[i - mid + halfWindow] ?? 0;
      sumxw += ((samples[i] ?? 0) - mean) ** 2 * w;
      sumw += w;
    }
    const meanSquare = sumxw / sumw;
    db[k] = meanSquare < 1e-30 * 4e-10 ? -300 : 10 * Math.log10(meanSquare);
  }
  return { timeStep, t0, db };
}

/** Praat's cubic interpolation between frames ("Get value at time … cubic"). */
export function intensityValueAt(track: IntensityTrack, time: number): number {
  const y = track.db;
  const n = y.length;
  const x = (time - track.t0) / track.timeStep; // 0-based
  if (n === 0) return Number.NaN;
  if (x >= n - 1) return y[n - 1] ?? Number.NaN;
  if (x <= 0) return y[0] ?? Number.NaN;
  const left = Math.floor(x);
  const right = left + 1;
  if (x === left) return y[left] ?? Number.NaN;
  const yl = y[left] ?? 0;
  const yr = y[right] ?? 0;
  if (left < 1 || right > n - 2) return yl + (x - left) * (yr - yl); // not enough neighbours: linear
  const dyl = 0.5 * (yr - (y[left - 1] ?? 0));
  const dyr = 0.5 * ((y[right + 1] ?? 0) - yl);
  const fil = x - left;
  const fir = right - x;
  return yl * fir + yr * fil - fil * fir * (0.5 * (dyr - dyl) + (fil - 0.5) * (dyl + dyr - 2 * (yr - yl)));
}

/** Lowest frame value with its time in [from, to] ("Get minimum … none"). */
export function minimumBetween(track: IntensityTrack, from: number, to: number): number {
  const first = Math.max(0, Math.ceil((from - track.t0) / track.timeStep - 1e-9));
  const last = Math.min(track.db.length - 1, Math.floor((to - track.t0) / track.timeStep + 1e-9));
  if (first > last) return Math.min(intensityValueAt(track, from), intensityValueAt(track, to));
  let minimum = Infinity;
  for (let i = first; i <= last; i++) minimum = Math.min(minimum, track.db[i] ?? Infinity);
  return minimum;
}

/** Praat's quantile of the frame values: place = q·n + 0.5, linear, clamped. */
export function intensityQuantile(track: IntensityTrack, q: number): number {
  const sorted = Array.from(track.db).sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return Number.NaN;
  if (n === 1) return sorted[0] ?? Number.NaN;
  const place = q * n + 0.5;
  const left = Math.min(Math.max(Math.floor(place), 1), n - 1); // 1-based
  const a = sorted[left - 1] ?? 0;
  const b = sorted[left] ?? 0;
  return a === b ? a : a + (place - left) * (b - a);
}
