import { describe, expect, it } from 'vitest';
import { detectSilences, syllableNuclei } from '../src/rhythm';
import { loadGolden } from './golden';
import { concat, mix, noise, sine } from './signals';

const SR = 16_000;
const floor = (seconds: number, seed = 1) => noise(SR, seconds, -70, seed);
const tone = (seconds: number, amplitude = 0.1, seed = 2) => mix(sine(180, SR, seconds, amplitude), floor(seconds, seed));

/** Tone "syllables": 150 ms loud, 100 ms 20 dB softer, so each has a clear intensity peak and dip. */
function syllables(count: number): Float32Array {
  const parts: Float32Array[] = [floor(0.4)];
  for (let i = 0; i < count; i++) parts.push(tone(0.15, 0.1, 10 + i), tone(0.1, 0.01, 30 + i));
  parts.push(floor(0.4, 3));
  return concat(...parts);
}

describe('silences (Praat "To TextGrid (silences)")', () => {
  it('Silences_KnownGap_FoundWithin50ms', () => {
    const { pauses } = syllableNuclei(concat(floor(0.4), tone(0.5), floor(0.4, 3), tone(0.5, 0.1, 4), floor(0.4, 5)), SR);
    expect(pauses).toHaveLength(1);
    expect(Math.abs((pauses[0]?.start ?? 0) - 0.9)).toBeLessThanOrEqual(0.05);
    expect(Math.abs((pauses[0]?.end ?? 0) - 1.3)).toBeLessThanOrEqual(0.05);
  });

  it('Silences_ShortGap_Ignored', () => {
    const { pauses } = syllableNuclei(concat(floor(0.4), tone(0.5), floor(0.15, 3), tone(0.5, 0.1, 4), floor(0.4, 5)), SR);
    expect(pauses).toEqual([]);
  });

  it('Silences_ShortSoundingBlip_Removed', () => {
    const db = Float32Array.from([...Array<number>(30).fill(0), ...Array<number>(5).fill(60), ...Array<number>(30).fill(0), ...Array<number>(40).fill(60)]);
    const { sounding } = detectSilences({ timeStep: 0.01, t0: 0, db }, -25, 0.25, 0.1, 1.05);
    expect(sounding).toHaveLength(1);
    expect(sounding[0]?.start).toBeCloseTo(0.65, 5);
  });

  it('Silences_NothingBelowThreshold_AllSounding', () => {
    // Checked in Praat 6.1.38: with no frame below the threshold, the whole take is sounding.
    const db = Float32Array.from({ length: 50 }, (_, i) => 60 + (i % 5));
    expect(detectSilences({ timeStep: 0.01, t0: 0.05, db }, -25, 0.25, 0.1, 0.6)).toEqual({ sounding: [{ start: 0, end: 0.6 }], silent: [] });
  });
});

describe('syllable nuclei (de Jong & Wempe 2009)', () => {
  it('Nuclei_SyntheticSyllables_LastPeakNotCounted', () => {
    // As published, the last intensity peak is never counted: 6 syllables give 5 nuclei.
    expect(syllableNuclei(syllables(6), SR).count).toBe(5);
  });

  it('Nuclei_RoomNoiseOnly_NoNuclei', () => {
    // Like Praat, a take of steady room noise counts as all sounding with no nuclei (rate 0).
    // The quality gate rejects such takes ("too-short") before anything is measured.
    const result = syllableNuclei(floor(2), SR);
    expect(result.count).toBe(0);
    expect(result.articulationRate).toBe(0);
  });
});

describe('pauses, nuclei and rate on golden fixtures', () => {
  const golden = loadGolden();

  it.each(golden)('Rhythm_MatchesPraat ($name)', ({ samples, sampleRate, expected }) => {
    const result = syllableNuclei(samples, sampleRate);
    const praat = expected.silences;
    expect(result.sounding).toHaveLength(praat.sounding.length);
    // Target ±50 ms; the rebuild matches Praat within one 10 ms frame, so guard at 20 ms.
    result.sounding.forEach((s, i) => {
      expect(Math.abs(s.start - (praat.sounding[i]?.[0] ?? Number.NaN))).toBeLessThanOrEqual(0.02);
      expect(Math.abs(s.end - (praat.sounding[i]?.[1] ?? Number.NaN))).toBeLessThanOrEqual(0.02);
    });
    expect(result.pauses).toHaveLength(praat.pauses.length);
    // Target ±10%; the counts match exactly on every golden file, so guard at exact.
    expect(result.count).toBe(expected.nuclei.count);
    result.nuclei.forEach((t, i) => {
      expect(Math.abs(t - (expected.nuclei.times[i] ?? Number.NaN))).toBeLessThanOrEqual(0.01);
    });
    expect(Math.abs((result.articulationRate ?? 0) - (expected.nuclei.articulationRate ?? 0))).toBeLessThanOrEqual(0.1 * (expected.nuclei.articulationRate ?? 0));
  });

  it.each(['en1', 'fr1'])('Rate_SlowNormalFast_Ordered (%s)', (sentence) => {
    const rate = (variant: string) => {
      const f = golden.find((g) => g.name === `${sentence}-${variant}`);
      return f ? (syllableNuclei(f.samples, f.sampleRate).articulationRate ?? 0) : Number.NaN;
    };
    expect(rate('slow')).toBeLessThan(rate('normal'));
    expect(rate('normal')).toBeLessThan(rate('fast'));
  });
});
