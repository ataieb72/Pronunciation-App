import { describe, expect, it } from 'vitest';
import { intensityTrack, intensityQuantile, intensityValueAt, minimumBetween } from '../src/intensity';
import { loadGolden } from './golden';
import { sine } from './signals';

const SR = 16_000;

describe('intensity (Praat "To Intensity")', () => {
  it('Intensity_Sine_KnownLevel', () => {
    // A 0.1-amplitude sine has a mean square of 0.005: −23.0 dBFS.
    const track = intensityTrack(sine(200, SR, 1, 0.1), SR, { minPitchHz: 50 });
    const middle = track.db[Math.floor(track.db.length / 2)] ?? 0;
    expect(middle).toBeCloseTo(10 * Math.log10(0.005), 1);
  });

  it('Intensity_ValueAt_CubicBetweenFrames', () => {
    const track = { timeStep: 0.01, t0: 0, db: Float32Array.from([0, 1, 2, 3, 4]) };
    expect(intensityValueAt(track, 0.025)).toBeCloseTo(2.5, 10); // a straight line stays straight
    expect(intensityValueAt(track, 0.02)).toBe(2);
  });

  it('Intensity_MinimumBetween_FramesInRange', () => {
    const track = { timeStep: 0.01, t0: 0, db: Float32Array.from([5, 3, 4, 1, 6]) };
    expect(minimumBetween(track, 0.005, 0.025)).toBe(3);
    expect(minimumBetween(track, 0, 0.04)).toBe(1);
  });

  it('Intensity_Quantile_MatchesPraat', () => {
    const track = { timeStep: 0.01, t0: 0, db: Float32Array.from([1, 2, 3, 4]) };
    // Praat's NUMquantile: place = q·n + 0.5, linear between neighbours; near the ends it
    // extrapolates from the last pair (checked against Praat on the golden files).
    expect(intensityQuantile(track, 0.5)).toBeCloseTo(2.5, 10);
    expect(intensityQuantile(track, 0.99)).toBeCloseTo(4.46, 10);
  });

  it.each(loadGolden())('Intensity_FramesMatchPraat ($name)', ({ samples, sampleRate, expected }) => {
    const track = intensityTrack(samples, sampleRate, { minPitchHz: 50, subtractMean: false });
    expect(track.db).toHaveLength(expected.intensity.dbfs.length);
    expect(track.t0).toBeCloseTo(expected.intensity.t0, 4);
    expected.intensity.dbfs.forEach((praat, i) => {
      expect(Math.abs((track.db[i] ?? 0) - praat)).toBeLessThanOrEqual(0.05);
    });
  });
});
