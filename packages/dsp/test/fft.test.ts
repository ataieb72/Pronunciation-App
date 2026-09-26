import { describe, expect, it } from 'vitest';
import { fft } from '../src/fft';

describe('fft', () => {
  it('Fft_Impulse_IsFlat', () => {
    const re = new Float64Array(8);
    const im = new Float64Array(8);
    re[0] = 1;
    fft(re, im);
    expect(Array.from(re)).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
    im.forEach((v) => {
      expect(v).toBeCloseTo(0, 12);
    });
  });

  it('Fft_Cosine_PeaksAtItsBin', () => {
    const n = 64;
    const re = Float64Array.from({ length: n }, (_, i) => Math.cos((2 * Math.PI * 5 * i) / n));
    const im = new Float64Array(n);
    fft(re, im);
    expect(re[5]).toBeCloseTo(n / 2, 9);
    expect(re[n - 5]).toBeCloseTo(n / 2, 9);
    expect(Math.hypot(re[6] ?? 0, im[6] ?? 0)).toBeCloseTo(0, 9);
  });

  it('Fft_InverseRoundTrips', () => {
    const n = 32;
    const original = Float64Array.from({ length: n }, (_, i) => Math.sin(i) + 0.3 * Math.cos(3 * i));
    const re = Float64Array.from(original);
    const im = new Float64Array(n);
    fft(re, im);
    fft(re, im, true);
    re.forEach((v, i) => {
      expect(v).toBeCloseTo(original[i] ?? 0, 12);
    });
  });

  it('Fft_NotPowerOfTwo_Throws', () => {
    expect(() => {
      fft(new Float64Array(6), new Float64Array(6));
    }).toThrow(RangeError);
  });
});
