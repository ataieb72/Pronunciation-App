/**
 * A session as a list of steps, one screen each (product-design §2: one stage at a time).
 * Practice: warm-up takes → per block, for each sentence: usual take, clear take, judgement →
 * block summary → wrap. Baseline: all sentences the usual way, then all "big and clear", then wrap.
 */
import type { SentenceItem, SessionPlan } from '@pc/core';
import type { TakeRole } from '../data/database';

export type Step =
  | {
      readonly kind: 'take';
      readonly role: TakeRole;
      readonly item: SentenceItem;
      /** Block number; null for the warm-up. The baseline is one block. */
      readonly block: number | null;
      readonly index: number;
      readonly of: number;
    }
  | { readonly kind: 'judge'; readonly block: number; readonly index: number }
  | { readonly kind: 'summary'; readonly block: number }
  | { readonly kind: 'wrap' };

export function buildSteps(plan: SessionPlan): Step[] {
  const steps: Step[] = [];
  if (plan.kind === 'baseline') {
    const of = plan.items.length;
    for (const role of ['usual', 'clear'] as const) plan.items.forEach((item, index) => steps.push({ kind: 'take', role, item, block: 0, index, of }));
  } else {
    plan.warmUp.forEach((item, index) => steps.push({ kind: 'take', role: 'warm-up', item, block: null, index, of: plan.warmUp.length }));
    plan.blocks.forEach((items, block) => {
      items.forEach((item, index) => {
        steps.push({ kind: 'take', role: 'usual', item, block, index, of: items.length });
        steps.push({ kind: 'take', role: 'clear', item, block, index, of: items.length });
        steps.push({ kind: 'judge', block, index });
      });
      steps.push({ kind: 'summary', block });
    });
  }
  steps.push({ kind: 'wrap' });
  return steps;
}

/** Where "Skip this sentence" goes: past the pair's judgement in practice, else the next step. */
export function skipTo(steps: readonly Step[], current: number): number {
  const step = steps[current];
  if (step?.kind !== 'take' || step.role === 'warm-up') return current + 1;
  const judge = steps.findIndex((s, i) => i > current && s.kind === 'judge' && s.block === step.block && s.index === step.index);
  return judge === -1 ? current + 1 : judge + 1;
}
