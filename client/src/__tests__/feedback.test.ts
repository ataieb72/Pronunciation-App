import { describe, it, expect } from 'vitest';
import { scoreColor } from '../lib/scoreColor';

describe('F4-T01 Feedback (TDD)', () => {
  it('scoreColor(85)=green', () => {
    expect(scoreColor(85)).toBe('green');
  });

  it('scoreColor(84)=amber', () => {
    expect(scoreColor(84)).toBe('amber');
  });

  it('scoreColor(60)=amber', () => {
    expect(scoreColor(60)).toBe('amber');
  });

  it('scoreColor(59)=red', () => {
    expect(scoreColor(59)).toBe('red');
  });

  it('scoreColor(100)=green', () => {
    expect(scoreColor(100)).toBe('green');
  });

  it('scoreColor(0)=red', () => {
    expect(scoreColor(0)).toBe('red');
  });
});
