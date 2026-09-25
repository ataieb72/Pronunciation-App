import { describe, expect, it } from 'vitest';
import { resample } from '../src/resample';
import { rms, sine, zeroCrossingFreq } from './signals';

const db = (ratio: number) => 20 * Math.log10(ratio);

describe('resample', () => {
  it('Resample_48kTo16k_LengthScales', () => {
    const out = resample(new Float32Array(48_000), 48_000, 16_000);
    expect(out.length).toBe(16_000);
  });

  it('Resample_44k1To16k_LengthScales', () => {
    const out = resample(new Float32Array(44_100), 44_100, 16_000);
    expect(out.length).toBe(16_000);
  });

  it('Resample_SameRate_ReturnsEqualCopy', () => {
    const x = sine(440, 16_000, 0.1);
    const out = resample(x, 16_000, 16_000);
    expect(out).not.toBe(x);
    expect(Array.from(out)).toEqual(Array.from(x));
  });

  it.each([
    [48_000, 440],
    [48_000, 3_000],
    [44_100, 1_000],
  ])('Resample_%iHz_KeepsPitchAndLevel (%i Hz tone)', (rate, freq) => {
    const x = sine(freq, rate, 0.5);
    const out = resample(x, rate, 16_000);
    expect(zeroCrossingFreq(out, 16_000)).toBeCloseTo(freq, 0);
    const mid = [Math.floor(out.length / 4), Math.floor((3 * out.length) / 4)] as const;
    expect(Math.abs(db(rms(out, ...mid) / rms(x)))).toBeLessThan(0.5);
  });

  it.each([12_000, 9_500, 20_000])('Resample_ToneAboveNyquist_AttenuatedBy40dB (%i Hz)', (freq) => {
    const x = sine(freq, 48_000, 0.5);
    const out = resample(x, 48_000, 16_000);
    const mid = [Math.floor(out.length / 4), Math.floor((3 * out.length) / 4)] as const;
    expect(db(rms(out, ...mid) / rms(x))).toBeLessThan(-40);
  });

  it('Resample_Dc_StaysDc', () => {
    const x = new Float32Array(4_800).fill(0.25);
    const out = resample(x, 48_000, 16_000);
    const middle = out[Math.floor(out.length / 2)] ?? 0;
    expect(middle).toBeCloseTo(0.25, 3);
  });

  it('Resample_Empty_ReturnsEmpty', () => {
    expect(resample(new Float32Array(0), 48_000, 16_000).length).toBe(0);
  });

  it('Resample_InvalidRates_Throw', () => {
    expect(() => resample(new Float32Array(10), 0, 16_000)).toThrow(RangeError);
    expect(() => resample(new Float32Array(10), 48_000, -1)).toThrow(RangeError);
  });
});
