import { BASELINE_SENTENCES, PRACTICE_SENTENCES, type SessionPlan } from '@pc/core';
import { describe, expect, it } from 'vitest';
import { buildSteps, skipTo } from '../../src/session/flow';

const items = PRACTICE_SENTENCES.en;
const practice: SessionPlan = { kind: 'practice', language: 'en', length: 10, warmUp: items.slice(0, 2), blocks: [items.slice(2, 6), items.slice(6, 10)] };
const baseline: SessionPlan = { kind: 'baseline', language: 'fr', items: BASELINE_SENTENCES.fr };

const label = (plan: SessionPlan) =>
  buildSteps(plan).map((s) => (s.kind === 'take' ? `${s.role}:${s.item.id}` : s.kind === 'judge' ? `judge:${String(s.block)}.${String(s.index)}` : s.kind === 'summary' ? `summary:${String(s.block)}` : s.kind));

describe('session steps', () => {
  it('Steps_Practice_WarmUpThenPairsThenSummaryThenWrap', () => {
    const steps = label(practice);
    expect(steps.slice(0, 6)).toEqual(['warm-up:en-p01', 'warm-up:en-p02', 'usual:en-p03', 'clear:en-p03', 'judge:0.0', 'usual:en-p04']);
    expect(steps.filter((s) => s.startsWith('summary'))).toEqual(['summary:0', 'summary:1']);
    expect(steps.indexOf('summary:0')).toBe(2 + 4 * 3);
    expect(steps.at(-1)).toBe('wrap');
    expect(steps).toHaveLength(2 + 2 * (4 * 3 + 1) + 1);
  });

  it('Steps_Baseline_UsualAllThenClearAll_NoJudgeNoSummary', () => {
    const steps = label(baseline);
    expect(steps.slice(0, 8).every((s) => s.startsWith('usual:'))).toBe(true);
    expect(steps.slice(8, 16).every((s) => s.startsWith('clear:'))).toBe(true);
    expect(steps.slice(16)).toEqual(['wrap']);
  });

  it('Steps_TakeKnowsItsPlace', () => {
    const steps = buildSteps(practice);
    expect(steps[0]).toMatchObject({ kind: 'take', role: 'warm-up', block: null, index: 0, of: 2 });
    expect(steps[9]).toMatchObject({ kind: 'take', role: 'clear', block: 0, index: 2, of: 4 });
    expect(buildSteps(baseline)[10]).toMatchObject({ kind: 'take', role: 'clear', block: 0, index: 2, of: 8 });
  });

  it('Skip_InPair_JumpsPastTheJudge', () => {
    const steps = buildSteps(practice);
    expect(label(practice)[skipTo(steps, 3)]).toBe('usual:en-p04');
    expect(label(practice)[skipTo(steps, 14 - 3)]).toBe('summary:0');
  });

  it('Skip_WarmUpOrBaseline_NextStep', () => {
    expect(skipTo(buildSteps(practice), 0)).toBe(1);
    expect(skipTo(buildSteps(baseline), 5)).toBe(6);
  });
});
