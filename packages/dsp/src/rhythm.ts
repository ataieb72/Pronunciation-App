/**
 * Pauses, syllable nuclei and articulation rate, following de Jong & Wempe (2009) as run in
 * packages/dsp/golden/make_golden.py (with a 10 ms step and a 250 ms minimum pause):
 *
 * 1. Intensity (minimum pitch 50 Hz, mean removed). Threshold: 25 dB below the 99th percentile,
 *    but not below the minimum.
 * 2. Sounding and silent stretches, as Praat's "To TextGrid (silences)".
 * 3. Intensity peaks above the threshold. A peak is a nucleus if the intensity dips more than
 *    2 dB before the next peak, and the peak is voiced and inside a sounding stretch. As in the
 *    published script, the last peak is never counted.
 * 4. Articulation rate = nuclei ÷ phonation time (the total of sounding stretches).
 */
import { intensityQuantile, intensityTrack, intensityValueAt, minimumBetween, type IntensityTrack } from './intensity';
import { pitchValueAt, trackPitch } from './pitch';

export interface Interval {
  readonly start: number;
  readonly end: number;
}

export interface IntensityPeak {
  readonly time: number;
  readonly db: number;
  /** Voiced (Praat pitch defined) and inside a sounding stretch. */
  readonly voicedAndSounding: boolean;
}

export interface RhythmResult {
  readonly intensity: IntensityTrack;
  readonly thresholdDb: number;
  readonly sounding: readonly Interval[];
  /** Silent stretches of at least 250 ms between the first and last sounding stretch. */
  readonly pauses: readonly Interval[];
  /** All intensity peaks above the threshold. */
  readonly peaks: readonly IntensityPeak[];
  /** Nucleus times, in seconds. */
  readonly nuclei: readonly number[];
  readonly count: number;
  readonly phonationTime: number;
  /** Nuclei per second of phonation, or null when nothing is sounding. */
  readonly articulationRate: number | null;
}

export const RHYTHM_SETTINGS = {
  silenceDb: -25,
  minDipDb: 2,
  minPause: 0.25,
  minSounding: 0.1,
} as const;

type Label = 'silent' | 'sounding';
interface Labelled {
  start: number;
  end: number;
  label: Label;
}

function merge(intervals: Labelled[]): Labelled[] {
  const out: Labelled[] = [];
  for (const interval of intervals) {
    const last = out.at(-1);
    if (last?.label === interval.label) last.end = interval.end;
    else out.push({ ...interval });
  }
  return out;
}

/**
 * Praat's "To TextGrid (silences)" on an intensity track: frames below (maximum + threshold) are
 * silent; then sounding stretches shorter than minSounding become silent, and after that silent
 * stretches shorter than minSilent become sounding.
 */
export function detectSilences(
  track: IntensityTrack,
  silenceThresholdDb: number,
  minSilent: number,
  minSounding: number,
  duration: number,
): { sounding: Interval[]; silent: Interval[] } {
  const db = track.db;
  if (db.length === 0) return { sounding: [], silent: [] };
  const max = Math.max(...db);
  const min = Math.min(...db);
  const threshold = max - Math.abs(silenceThresholdDb);
  // Nothing quiet enough to be silence: Praat 6.1.38 labels the whole take as sounding.
  if (minSilent > duration || threshold < min) return { sounding: [{ start: 0, end: duration }], silent: [] };

  let intervals: Labelled[] = [];
  let label: Label = (db[0] ?? 0) < threshold ? 'silent' : 'sounding';
  let start = 0;
  for (let i = 1; i < db.length; i++) {
    const now: Label = (db[i] ?? 0) < threshold ? 'silent' : 'sounding';
    if (now !== label) {
      const boundary = track.t0 + i * track.timeStep;
      intervals.push({ start, end: boundary, label });
      start = boundary;
      label = now;
    }
  }
  intervals.push({ start, end: duration, label });

  const relabel = (from: Label, to: Label, shorterThan: number) => {
    if (intervals.length > 1) {
      intervals = merge(intervals.map((iv) => (iv.label === from && iv.end - iv.start < shorterThan ? { ...iv, label: to } : iv)));
    }
  };
  relabel('sounding', 'silent', minSounding);
  relabel('silent', 'sounding', minSilent);

  const pick = (wanted: Label) => intervals.filter((iv) => iv.label === wanted).map(({ start: s, end: e }) => ({ start: s, end: e }));
  return { sounding: pick('sounding'), silent: pick('silent') };
}

/** Local maxima of the intensity contour, with parabolic refinement of their times. */
function contourPeaks(track: IntensityTrack): number[] {
  const y = track.db;
  const times: number[] = [];
  for (let i = 1; i < y.length - 1; i++) {
    const a = y[i - 1] ?? 0;
    const b = y[i] ?? 0;
    const c = y[i + 1] ?? 0;
    if (!(b > a && b >= c)) continue;
    const denominator = a - 2 * b + c;
    const offset = denominator === 0 ? 0 : (0.5 * (a - c)) / denominator;
    times.push(track.t0 + (i + offset) * track.timeStep);
  }
  return times;
}

export function syllableNuclei(samples: Float32Array, sampleRate: number): RhythmResult {
  const { silenceDb, minDipDb, minPause, minSounding } = RHYTHM_SETTINGS;
  const duration = samples.length / sampleRate;
  const intensity = intensityTrack(samples, sampleRate, { minPitchHz: 50, timeStep: 0.01, subtractMean: true });
  const empty: RhythmResult = { intensity, thresholdDb: Number.NaN, sounding: [], pauses: [], peaks: [], nuclei: [], count: 0, phonationTime: 0, articulationRate: null };
  if (intensity.db.length < 3) return empty;

  const max = Math.max(...intensity.db);
  const min = Math.min(...intensity.db);
  const q99 = intensityQuantile(intensity, 0.99);
  const thresholdDb = Math.max(q99 + silenceDb, min);
  const { sounding, silent } = detectSilences(intensity, silenceDb - (max - q99), minPause, minSounding, duration);

  // Voicing, with the pitch settings of the published script.
  const voicing = trackPitch(samples, sampleRate, {
    timeStep: 0.02,
    floorHz: 30,
    ceilingHz: 450,
    maxCandidates: 4,
    silenceThreshold: 0.03,
    voicingThreshold: 0.25,
    octaveCost: 0.01,
    octaveJumpCost: 0.35,
    voicedUnvoicedCost: 0.25,
  });
  const inSounding = (t: number) => sounding.some((s) => t >= s.start && t < s.end);
  const peaks: IntensityPeak[] = contourPeaks(intensity)
    .map((time) => ({ time, db: intensityValueAt(intensity, time) }))
    .filter((p) => p.db > thresholdDb)
    .map((p) => ({ ...p, voicedAndSounding: inSounding(p.time) && !Number.isNaN(pitchValueAt(voicing, p.time)) }));

  const nuclei: number[] = [];
  for (let i = 0; i + 1 < peaks.length; i++) {
    const peak = peaks[i];
    const next = peaks[i + 1];
    if (!peak || !next) continue;
    const dip = minimumBetween(intensity, peak.time, next.time);
    if (Math.abs(peak.db - dip) > minDipDb && peak.voicedAndSounding) nuclei.push(peak.time);
  }

  const phonationTime = sounding.reduce((sum, s) => sum + (s.end - s.start), 0);
  const first = sounding[0]?.start ?? 0;
  const last = sounding.at(-1)?.end ?? 0;
  return {
    intensity,
    thresholdDb,
    sounding,
    pauses: silent.filter((s) => s.start >= first && s.end <= last),
    peaks,
    nuclei,
    count: nuclei.length,
    phonationTime,
    articulationRate: phonationTime > 0 ? nuclei.length / phonationTime : null,
  };
}
