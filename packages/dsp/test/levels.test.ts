import { describe, expect, it } from 'vitest';
import { clippedRatio, peakDbfs, rmsDbfs } from '../src/levels';
import { sine } from './signals';

describe('levels', () => {
  it('Peak_HalfScale_IsMinus6dB', () => {
    expect(peakDbfs(new Float32Array([0, 0.5, -0.25]))).toBeCloseTo(-6.02, 2);
  });

  it('Rms_FullScaleSine_IsMinus3dB', () => {
    expect(rmsDbfs(sine(1_000, 16_000, 1, 1))).toBeCloseTo(-3.01, 1);
  });

  it('Levels_Silence_IsMinusInfinity', () => {
    expect(peakDbfs(new Float32Array(10))).toBe(Number.NEGATIVE_INFINITY);
    expect(rmsDbfs(new Float32Array(10))).toBe(Number.NEGATIVE_INFINITY);
    expect(rmsDbfs(new Float32Array(0))).toBe(Number.NEGATIVE_INFINITY);
  });

  it('Clipped_CountsSamplesAtFullScale', () => {
    expect(clippedRatio(new Float32Array([1, -1, 0.5, 0.9995]))).toBeCloseTo(0.75, 5);
    expect(clippedRatio(new Float32Array(0))).toBe(0);
  });
});
