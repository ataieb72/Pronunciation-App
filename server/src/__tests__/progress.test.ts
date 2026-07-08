import { describe, it, expect } from 'vitest';
import { articulationIndex, progressAggregation } from '../services/progress';

describe('F6-T04 Progress (TDD)', () => {
  it('articulationIndex(fixtures) exact values', () => {
    const fixtures = [
      { accuracy: 90, tier: 0 },
      { accuracy: 85, tier: 1 },
      { accuracy: 80, tier: 2 },
    ];
    // multipliers 0.9/1.0/1.15
    const result = articulationIndex(fixtures);
    expect(result).toBeCloseTo( (90*0.9 + 85*1.0 + 80*1.15) / 3 );
  });

  it('progressAggregation_GroupsByDay', () => {
    const attempts = [
      { created_at: '2026-07-07', overall_score: 80, language: 'en-US' },
      { created_at: '2026-07-07', overall_score: 90, language: 'en-US' },
      { created_at: '2026-07-08', overall_score: 85, language: 'fr-FR' },
    ];
    const daily = progressAggregation(attempts);
    expect(daily).toEqual([
      { date: '2026-07-07', 'en-US': 85 },
      { date: '2026-07-08', 'fr-FR': 85 },
    ]);
  });
});
