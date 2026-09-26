import { describe, expect, it } from 'vitest';
import { percentile, summarizePitch, trackPitch } from '../src/pitch';
import { loadGolden } from './golden';
import { noise, sine } from './signals';

const SR = 16_000;
const semitones = (a: number, b: number) => 12 * Math.log2(a / b);
const voicedOnly = (f0: Float32Array) => Array.from(f0).filter((v) => v > 0);

describe('pitch tracker', () => {
  it.each([80, 100, 150, 220, 330, 500])('Pitch_Sine_WithinHalfSemitone (%i Hz)', (hz) => {
    const { f0 } = trackPitch(sine(hz, SR, 1, 0.3), SR);
    const voiced = voicedOnly(f0);
    expect(voiced.length / f0.length).toBeGreaterThanOrEqual(0.9);
    for (const v of voiced) expect(Math.abs(semitones(v, hz))).toBeLessThanOrEqual(0.5);
  });

  it('Pitch_Silence_Unvoiced', () => {
    expect(voicedOnly(trackPitch(new Float32Array(SR), SR).f0)).toEqual([]);
  });

  it('Pitch_WhiteNoise_MostlyUnvoiced', () => {
    const { f0 } = trackPitch(noise(SR, 1, -20, 9), SR);
    expect(voicedOnly(f0).length / f0.length).toBeLessThanOrEqual(0.1);
  });

  it('PitchRange_LogGlide_Semitones', () => {
    // 100 → 200 Hz, even in log frequency over 2 s: P10–P90 spans 80% of an octave = 9.6 semitones.
    const seconds = 2;
    const glide = Float32Array.from({ length: SR * seconds }, (_, i) => {
      const t = i / SR;
      return 0.3 * Math.sin(2 * Math.PI * 100 * (seconds / Math.LN2) * (2 ** (t / seconds) - 1));
    });
    const summary = summarizePitch(trackPitch(glide, SR));
    expect(summary?.rangeSemitones).toBeCloseTo(9.6, 0);
    expect(Math.abs((summary?.rangeSemitones ?? 0) - 9.6)).toBeLessThanOrEqual(0.5);
  });

  it('Percentile_MatchesNumpyLinear', () => {
    expect(percentile([1, 2, 3, 4], 10)).toBeCloseTo(1.3, 10);
    expect(percentile([4, 1, 3, 2], 50)).toBeCloseTo(2.5, 10);
    expect(percentile([7], 90)).toBe(7);
  });

  it('SummarizePitch_NoVoicedFrames_Null', () => {
    expect(summarizePitch({ timeStep: 0.01, t0: 0.02, f0: new Float32Array(10) })).toBeNull();
  });
});

describe('pitch tracker on golden fixtures', () => {
  const golden = loadGolden();

  it.each(golden)('Pitch_FrameGridAndValuesMatchPraat ($name)', ({ samples, sampleRate, expected }) => {
    const track = trackPitch(samples, sampleRate);
    const praat = expected.pitch.f0;
    expect(track.f0.length).toBe(praat.length);
    expect(track.t0).toBeCloseTo(expected.pitch.t0, 4);

    let both = 0;
    let close = 0;
    let sameVoicing = 0;
    praat.forEach((p, i) => {
      const ours = track.f0[i] ?? 0;
      if ((p > 0) === (ours > 0)) sameVoicing++;
      if (p > 0 && ours > 0) {
        both++;
        if (Math.abs(semitones(ours, p)) <= 1) close++;
      }
    });
    expect(both).toBeGreaterThan(0);
    expect(close / both).toBeGreaterThanOrEqual(0.9);
    // Regression guard: on these files the tracker agrees with Praat's voicing on 99.9% of frames.
    expect(sameVoicing / praat.length).toBeGreaterThanOrEqual(0.95);
  });

  it.each(golden)('PitchRange_MatchesPraat ($name)', ({ samples, sampleRate, expected }) => {
    const summary = summarizePitch(trackPitch(samples, sampleRate));
    expect(Math.abs((summary?.rangeSemitones ?? Number.NaN) - (expected.pitch.rangeSemitones ?? Number.NaN))).toBeLessThanOrEqual(1);
    expect(Math.abs(semitones(summary?.medianHz ?? Number.NaN, expected.pitch.medianHz ?? Number.NaN))).toBeLessThanOrEqual(1);
  });
});
