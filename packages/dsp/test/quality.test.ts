import { describe, expect, it } from 'vitest';
import { checkQuality } from '../src/quality';
import { loadGolden } from './golden';
import { concat, mix, noise, sine } from './signals';

const SR = 16_000;
const floor = (seconds: number, seed = 1) => noise(SR, seconds, -70, seed);
const voice = (seconds: number, amplitude = 0.1, seed = 2) => mix(sine(200, SR, seconds, amplitude), floor(seconds, seed));

describe('quality gate', () => {
  it('Gate_CleanTake_Passes', () => {
    const verdict = checkQuality(concat(floor(0.4), voice(1), floor(0.4, 3)), SR);
    expect(verdict.ok).toBe(true);
    expect(verdict.reasons).toEqual([]);
    expect(verdict.speechMs).toBeGreaterThan(900);
    expect(verdict.snrDb).toBeGreaterThan(40);
  });

  it('Gate_Clipped_Retake', () => {
    // A 1.2-amplitude tone clipped at full scale: far more than 0.1% of samples at the limit.
    const clipped = sine(200, SR, 1, 1.2).map((v) => Math.max(-1, Math.min(1, v)));
    const verdict = checkQuality(concat(floor(0.4), clipped, floor(0.4, 3)), SR);
    expect(verdict.reasons).toContain('clipped');
    expect(verdict.ok).toBe(false);
  });

  it('Gate_TooQuiet_Retake', () => {
    // Peak about −41 dBFS: below the −35 dBFS limit.
    const verdict = checkQuality(concat(floor(0.4), voice(1, 0.009), floor(0.4, 3)), SR);
    expect(verdict.reasons).toContain('too-quiet');
  });

  it('Gate_LowSnr_Retake', () => {
    // Tone at about −23 dBFS RMS in noise at −35 dBFS RMS: about 12 dB SNR. (Below about 10 dB the
    // detector hears no speech at all, and the verdict is "too-short".)
    const room = (seconds: number, seed: number) => noise(SR, seconds, -35, seed);
    const verdict = checkQuality(concat(room(0.5, 4), mix(sine(200, SR, 1, 0.1), room(1, 5)), room(0.5, 6)), SR);
    expect(verdict.reasons).toContain('noisy');
    expect(verdict.snrDb).toBeLessThan(15);
  });

  it('Gate_TooShort_Retake', () => {
    const verdict = checkQuality(concat(floor(0.4), voice(0.15), floor(0.4, 3)), SR);
    expect(verdict.reasons).toContain('too-short');
  });

  it('Gate_NoSpeech_TooShort', () => {
    const verdict = checkQuality(floor(1.5), SR);
    expect(verdict.reasons).toContain('too-short');
    expect(verdict.speechMs).toBe(0);
  });
});

describe('quality gate on golden fixtures', () => {
  const golden = loadGolden();

  it.each(golden.filter((f) => f.expected.variant !== 'noise10'))('Gate_Passes ($name)', ({ samples, sampleRate }) => {
    expect(checkQuality(samples, sampleRate).reasons).toEqual([]);
  });

  it.each(golden.filter((f) => f.expected.variant === 'noise10'))('Gate_TenDbSnr_Noisy ($name)', ({ samples, sampleRate }) => {
    expect(checkQuality(samples, sampleRate).reasons).toEqual(['noisy']);
  });
});
