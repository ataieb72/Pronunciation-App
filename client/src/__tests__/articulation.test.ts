import { describe, it, expect } from 'vitest';
import { rateDelta, extractPauses } from '../lib/articulation';

const fixture = {
  NBest: [{
    Words: [
      { Word: "the", Offset: 0, Duration: 3000000 },
      { Word: "quick", Offset: 6000000, Duration: 4500000 } // 3M gap > 2M for pause test
    ]
  }]
};

describe('F4-T02 Articulation (TDD)', () => {
  it('rateDelta(attempt=5.6s, ref=5.0s)="+12%"', () => {
    expect(rateDelta(5600, 5000)).toBe('+12%');
  });

  it('rateDelta(attempt=4.5s, ref=5.0s)="-10%"', () => {
    expect(rateDelta(4500, 5000)).toBe('-10%');
  });

  it('extractPauses(fixture) finds gap', () => {
    const pauses = extractPauses(fixture);
    expect(pauses.length).toBeGreaterThan(0);
    expect(pauses[0].duration).toBeGreaterThan(2000000);
  });
});
