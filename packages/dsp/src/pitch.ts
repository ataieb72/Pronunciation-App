/**
 * Pitch (F0) by autocorrelation, following Praat's "To Pitch (ac)" (Boersma 1993), so the app's
 * numbers can be checked against Praat frame by frame (packages/dsp/golden).
 *
 * Per frame: a Hanning window of 3 periods of the pitch floor, the local mean removed; its
 * autocorrelation divided by the window's own autocorrelation; the strongest peaks become
 * candidates, next to one "unvoiced" candidate. A Viterbi path then picks one candidate per
 * frame, with costs for octave jumps and for voiced/unvoiced changes.
 */
import { fft } from './fft';

export interface PitchOptions {
  readonly timeStep?: number;
  readonly floorHz?: number;
  readonly ceilingHz?: number;
}

export interface PitchTrack {
  readonly timeStep: number;
  /** Time of the first frame's centre, in seconds (Praat's frame grid). */
  readonly t0: number;
  /** F0 per frame in Hz; 0 means unvoiced. */
  readonly f0: Float32Array;
}

export interface PitchSummary {
  readonly voicedFrames: number;
  readonly medianHz: number;
  readonly p10Hz: number;
  readonly p90Hz: number;
  /** 12·log2(P90/P10) of the voiced frames. */
  readonly rangeSemitones: number;
}

// Praat's standard settings for "To Pitch (ac)" (not "very accurate").
const PERIODS_PER_WINDOW = 3;
const MAX_CANDIDATES = 15;
const SILENCE_THRESHOLD = 0.03;
const VOICING_THRESHOLD = 0.45;
const OCTAVE_COST = 0.01;
const OCTAVE_JUMP_COST = 0.35;
const VOICED_UNVOICED_COST = 0.14;
const INTERPOLATION_DEPTH = 0.5;

interface Candidate {
  frequency: number; // 0 = unvoiced
  strength: number;
}

interface Frame {
  intensity: number; // local peak / global peak
  candidates: Candidate[];
}

const log2 = Math.log2;

export function trackPitch(samples: Float32Array, sampleRate: number, options: PitchOptions = {}): PitchTrack {
  const timeStep = options.timeStep ?? 0.01;
  const floorHz = options.floorHz ?? 75;
  const ceilingHz = Math.min(options.ceilingHz ?? 600, sampleRate / 2);
  const dx = 1 / sampleRate;
  const duration = samples.length * dx;

  // Frame grid, as in Praat's Sampled_shortTermAnalysis.
  const windowDuration = PERIODS_PER_WINDOW / floorHz;
  const frameCount = duration >= windowDuration ? Math.floor((duration - windowDuration) / timeStep) + 1 : 0;
  const t0 = duration / 2 - (frameCount * timeStep) / 2 + timeStep / 2;
  if (frameCount === 0) return { timeStep, t0, f0: new Float32Array(0) };

  const halfWindow = Math.floor(Math.floor(windowDuration / dx) / 2) - 1;
  const windowLength = halfWindow * 2;
  const halfPeriod = Math.floor(Math.floor(1 / dx / floorHz) / 2) + 1;
  const maximumLag = Math.min(Math.floor(windowLength / PERIODS_PER_WINDOW) + 2, windowLength);
  const brentMax = Math.floor(windowLength * INTERPOLATION_DEPTH);
  let fftSize = 1;
  while (fftSize < windowLength * (1 + INTERPOLATION_DEPTH)) fftSize *= 2;

  // Hanning window and its normalised autocorrelation.
  const window = new Float64Array(windowLength);
  for (let j = 0; j < windowLength; j++) window[j] = 0.5 - 0.5 * Math.cos(((j + 1) * 2 * Math.PI) / (windowLength + 1));
  const windowR = autocorrelation(window, fftSize);
  const w0 = windowR[0] ?? 1;
  for (let i = 0; i < fftSize; i++) windowR[i] = (windowR[i] ?? 0) / w0;

  let mean = 0;
  for (const s of samples) mean += s;
  mean /= samples.length;
  let globalPeak = 0;
  for (const s of samples) globalPeak = Math.max(globalPeak, Math.abs(s - mean));

  const at = (i: number) => (i >= 0 && i < samples.length ? (samples[i] ?? 0) : 0);
  const frames: Frame[] = [];
  const frame = new Float64Array(windowLength);
  const r = new Float64Array(brentMax + 2);

  for (let k = 0; k < frameCount; k++) {
    const t = t0 + k * timeStep;
    const left = Math.floor((t - 0.5 * dx) / dx);
    const right = left + 1;

    let localMean = 0;
    for (let i = right - halfPeriod; i <= left + halfPeriod; i++) localMean += at(i);
    localMean /= 2 * halfPeriod;

    const start = right - halfWindow;
    for (let j = 0; j < windowLength; j++) frame[j] = (at(start + j) - localMean) * (window[j] ?? 0);

    let localPeak = 0;
    for (let j = Math.max(0, halfWindow - halfPeriod); j < Math.min(windowLength, halfWindow + halfPeriod); j++) {
      localPeak = Math.max(localPeak, Math.abs(frame[j] ?? 0));
    }
    const intensity = globalPeak > 0 ? Math.min(1, localPeak / globalPeak) : 0;
    const candidates: Candidate[] = [{ frequency: 0, strength: 0 }];

    const ac = autocorrelation(frame, fftSize);
    const ac0 = ac[0] ?? 0;
    if (ac0 > 0) {
      r[0] = 1;
      for (let i = 1; i <= brentMax + 1; i++) r[i] = (ac[i] ?? 0) / (ac0 * (windowR[i] ?? 1));
      for (let i = 2; i < maximumLag && i < brentMax; i++) {
        const ri = r[i] ?? 0;
        const prev = r[i - 1] ?? 0;
        const next = r[i + 1] ?? 0;
        if (!(ri > 0.5 * VOICING_THRESHOLD && ri > prev && ri >= next)) continue;
        const dr = 0.5 * (next - prev);
        const d2r = 2 * ri - prev - next;
        const lag = i + dr / d2r;
        const frequency = 1 / dx / lag;
        let strength = ri + (0.5 * dr * dr) / d2r;
        if (strength > 1) strength = 1 / strength;
        insertCandidate(candidates, { frequency, strength }, floorHz);
      }
    }
    frames.push({ intensity, candidates });
  }

  const path = viterbi(frames, ceilingHz, 0.01 / timeStep);
  const f0 = new Float32Array(frameCount);
  path.forEach((c, k) => {
    f0[k] = c.frequency > 0 && c.frequency < ceilingHz ? c.frequency : 0;
  });
  return { timeStep, t0, f0 };
}

/** Autocorrelation through the FFT of a zero-padded copy (lags up to fftSize − length are exact). */
function autocorrelation(signal: Float64Array, fftSize: number): Float64Array {
  const re = new Float64Array(fftSize);
  const im = new Float64Array(fftSize);
  re.set(signal);
  fft(re, im);
  for (let i = 0; i < fftSize; i++) {
    re[i] = (re[i] ?? 0) ** 2 + (im[i] ?? 0) ** 2;
    im[i] = 0;
  }
  fft(re, im, true);
  return re;
}

/** Keeps the strongest candidates; high frequencies get a small bonus (Praat's octave cost). */
function insertCandidate(candidates: Candidate[], candidate: Candidate, floorHz: number): void {
  const score = (c: Candidate) => c.strength - OCTAVE_COST * log2(floorHz / c.frequency);
  if (candidates.length < MAX_CANDIDATES) {
    candidates.push(candidate);
    return;
  }
  let weakest = 1;
  for (let i = 2; i < candidates.length; i++) {
    const candidateAt = candidates[i];
    const weakestAt = candidates[weakest];
    if (candidateAt && weakestAt && score(candidateAt) < score(weakestAt)) weakest = i;
  }
  const weakestAt = candidates[weakest];
  if (weakestAt && score(candidate) > score(weakestAt)) candidates[weakest] = candidate;
}

/** Praat's Pitch_pathFinder: the most probable candidate sequence. */
function viterbi(frames: readonly Frame[], ceilingHz: number, timeStepCorrection: number): Candidate[] {
  const jumpCost = OCTAVE_JUMP_COST * timeStepCorrection;
  const switchCost = VOICED_UNVOICED_COST * timeStepCorrection;
  const voiced = (f: number) => f > 0 && f < ceilingHz;

  const score: number[][] = frames.map((frame) => {
    const unvoiced = VOICING_THRESHOLD + Math.max(0, 2 - frame.intensity / (SILENCE_THRESHOLD / (1 + VOICING_THRESHOLD)));
    return frame.candidates.map((c) => (voiced(c.frequency) ? c.strength - OCTAVE_COST * log2(ceilingHz / c.frequency) : unvoiced));
  });
  const back: number[][] = frames.map((frame) => frame.candidates.map(() => 0));

  for (let k = 1; k < frames.length; k++) {
    const previous = frames[k - 1]?.candidates ?? [];
    const current = frames[k]?.candidates ?? [];
    const prevScore = score[k - 1] ?? [];
    const curScore = score[k] ?? [];
    current.forEach((c2, j) => {
      let best = -Infinity;
      let place = 0;
      previous.forEach((c1, i) => {
        const v1 = voiced(c1.frequency);
        const v2 = voiced(c2.frequency);
        const transition = !v2 ? (v1 ? switchCost : 0) : !v1 ? switchCost : jumpCost * Math.abs(log2(c1.frequency / c2.frequency));
        const value = (prevScore[i] ?? -Infinity) - transition;
        if (value > best) {
          best = value;
          place = i;
        }
      });
      curScore[j] = best + (curScore[j] ?? 0);
      const row = back[k];
      if (row) row[j] = place;
    });
  }

  const last = score[frames.length - 1] ?? [];
  let place = last.indexOf(Math.max(...last));
  const path: Candidate[] = new Array<Candidate>(frames.length);
  for (let k = frames.length - 1; k >= 0; k--) {
    path[k] = frames[k]?.candidates[place] ?? { frequency: 0, strength: 0 };
    place = back[k]?.[place] ?? 0;
  }
  return path;
}

/** Percentile with linear interpolation between closest ranks (NumPy's default). */
export function percentile(values: readonly number[], q: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const position = ((sorted.length - 1) * q) / 100;
  const low = Math.floor(position);
  const high = Math.ceil(position);
  const a = sorted[low] ?? Number.NaN;
  const b = sorted[high] ?? Number.NaN;
  return a + (b - a) * (position - low);
}

export function summarizePitch(track: PitchTrack): PitchSummary | null {
  const voiced = Array.from(track.f0).filter((f) => f > 0);
  if (voiced.length === 0) return null;
  const p10Hz = percentile(voiced, 10);
  const p90Hz = percentile(voiced, 90);
  return { voicedFrames: voiced.length, medianHz: percentile(voiced, 50), p10Hz, p90Hz, rangeSemitones: 12 * log2(p90Hz / p10Hz) };
}
