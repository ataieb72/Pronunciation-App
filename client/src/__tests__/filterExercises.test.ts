import { describe, it, expect } from 'vitest';
import { filterExercises } from '../lib/filterExercises';
import type { Exercise } from '../lib/languagePacks';

const mockExercises: Exercise[] = [
  { id: 'e1', track: 'phoneme', text: 't1', focus: ['θ'], difficulty: 1, level: 'word' },
  { id: 'e2', track: 'phoneme', text: 't2', focus: ['θ'], difficulty: 2, level: 'sentence' },
  { id: 'e3', track: 'articulation', text: 't3', focus: ['s'], difficulty: 2, level: 'sentence' },
  { id: 'e4', track: 'prosody', text: 't4', focus: ['stress'], difficulty: 3, level: 'passage' },
];

describe('F5-T04 filterExercises (TDD)', () => {
  it('no filters returns all', () => {
    expect(filterExercises(mockExercises, {})).toHaveLength(4);
  });

  it('filters by track', () => {
    const res = filterExercises(mockExercises, { track: 'phoneme' });
    expect(res).toHaveLength(2);
    expect(res.every(e => e.track === 'phoneme')).toBe(true);
  });

  it('filters by difficulty', () => {
    const res = filterExercises(mockExercises, { difficulty: 2 });
    expect(res).toHaveLength(2);
  });

  it('filters by focus', () => {
    const res = filterExercises(mockExercises, { focus: 'θ' });
    expect(res).toHaveLength(2);
  });

  it('filters by level', () => {
    const res = filterExercises(mockExercises, { level: 'sentence' });
    expect(res).toHaveLength(2);
  });

  it('composes filters (track + difficulty)', () => {
    const res = filterExercises(mockExercises, { track: 'phoneme', difficulty: 2 });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('e2');
  });
});
