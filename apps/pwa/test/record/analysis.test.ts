import { describe, expect, it } from 'vitest';
import { analyzeTake } from '../../src/record/analysis';

const RATE = 16_000;

/** Tone "syllables" at 16 kHz: 150 ms loud, 100 ms 20 dB softer; optional silent gap in the middle. */
function speech(syllableCount: number, gapS = 0): Float32Array {
  const parts: number[] = [];
  const push = (seconds: number, amplitude: number) => {
    for (let i = 0; i < Math.round(seconds * RATE); i++) parts.push(amplitude * Math.sin((2 * Math.PI * 180 * parts.length) / RATE) + (Math.random() - 0.5) * 1e-4);
  };
  push(0.4, 0);
  for (let s = 0; s < syllableCount; s++) {
    push(0.15, 0.1);
    push(0.1, 0.01);
    if (gapS > 0 && s === Math.floor(syllableCount / 2) - 1) push(gapS, 0);
  }
  push(0.4, 0);
  return Float32Array.from(parts);
}

describe('take analysis', () => {
  it('Analysis_GoodTake_HasVerdictAndReadings', () => {
    const readings = analyzeTake(speech(10, 0.5), RATE);
    expect(readings.quality.ok).toBe(true);
    expect(readings.speechLevelDbfs).toBeLessThan(0);
    expect(readings.pitch?.medianHz).toBeCloseTo(180, -1);
    expect(readings.pauses.count).toBe(1);
    // The 128 ms intensity window blurs pause edges a little (Praat gives the same).
    expect(Math.abs(readings.pauses.totalS - 0.5)).toBeLessThanOrEqual(0.1);
    expect(readings.syllables).toBeGreaterThanOrEqual(8);
    expect(readings.articulationRate).toBeGreaterThan(2);
    expect(readings.fadeDb).not.toBeNull();
  });

  it('Analysis_BadTake_StillReportsQuality', () => {
    const quiet = speech(6).map((v) => v * 0.05); // peak about −46 dBFS
    const readings = analyzeTake(quiet, RATE);
    expect(readings.quality.ok).toBe(false);
    expect(readings.quality.reasons).toContain('too-quiet');
  });

  it('Analysis_Silence_NoPitchNoRate', () => {
    const readings = analyzeTake(new Float32Array(RATE), RATE);
    expect(readings.quality.reasons).toContain('too-short');
    expect(readings.pitch).toBeNull();
  });
});
