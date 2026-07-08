import { describe, it, expect } from 'vitest';
import { buildDrillSession, levelGate } from '../services/drills';

interface DrillExercise {
  id: string;
  track: string;
  text: string;
  focus: string[];
  difficulty: number;
  level: string;
}

const mockPack: { exercises: DrillExercise[] } = {
  exercises: [
    { id: 'p1', track: 'phoneme', text: 'pair1', focus: ['θ'], difficulty: 1, level: 'word' },
    { id: 'p2', track: 'phoneme', text: 'pair2', focus: ['θ'], difficulty: 1, level: 'word' },
    { id: 's1', track: 'phoneme', text: 'sent1', focus: ['θ'], difficulty: 2, level: 'sentence' },
    { id: 'pa1', track: 'phoneme', text: 'pass1', focus: ['θ'], difficulty: 3, level: 'passage' },
    { id: 'other', track: 'phoneme', text: 'other', focus: ['s'], difficulty: 1, level: 'word' },
  ]
};

describe('F6-T01 Drills (TDD)', () => {
  it('SessionBuilder_WeakSet_OrdersPairsFirst', () => {
    const weak = ['θ'];
    const session = buildDrillSession(weak, mockPack);
    expect(session[0].level).toBe('word');
    expect(session.some(e => e.level === 'sentence')).toBe(true);
    expect(session.some(e => e.level === 'passage')).toBe(true);
  });

  it('LevelGate_At84_HoldsLevel', () => {
    expect(levelGate(84)).toBe(false);
  });

  it('LevelGate_At85_Advances', () => {
    expect(levelGate(85)).toBe(true);
  });
});
