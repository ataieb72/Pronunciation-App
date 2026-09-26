import { describe, expect, it } from 'vitest';
import { median, percentile } from '../../src/spike/stats';

describe('spike stats', () => {
  it('Median_OddAndEven', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it('Percentile90_NearestRank', () => {
    const values = Array.from({ length: 20 }, (_, i) => i + 1); // 1..20
    expect(percentile(values, 90)).toBe(18);
    expect(percentile([5], 90)).toBe(5);
  });

  it('Stats_Empty_IsNull', () => {
    expect(median([])).toBeNull();
    expect(percentile([], 90)).toBeNull();
  });
});
