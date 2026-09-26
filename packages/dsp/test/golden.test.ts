import { describe, expect, it } from 'vitest';
import { peakDbfs, rmsDbfs } from '../src/levels';
import { loadGolden } from './golden';

const fixtures = loadGolden();

describe('golden fixtures (Praat reference)', () => {
  it('Golden_AllFixturesLoad_InBothLanguages', () => {
    expect(fixtures).toHaveLength(24);
    expect(new Set(fixtures.map((f) => f.expected.language))).toEqual(new Set(['en', 'fr']));
  });

  it.each(fixtures)('Golden_$name_LevelsMatchPraat', ({ expected, samples, sampleRate }) => {
    expect(sampleRate).toBe(16_000);
    expect(samples.length / sampleRate).toBeCloseTo(expected.duration, 3);
    expect(Math.abs(peakDbfs(samples) - expected.peakDbfs)).toBeLessThan(0.1);
    expect(Math.abs(rmsDbfs(samples) - expected.rmsDbfs)).toBeLessThan(0.1);
  });
});
