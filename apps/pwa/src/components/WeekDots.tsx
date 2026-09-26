import type { WeekProgress } from '@pc/core';

/** Practice days this week against the target, as dots. A missed day changes nothing: no streaks. */
export function WeekDots({ week }: { week: WeekProgress }) {
  const done = Math.min(week.practiceDays, week.target);
  const extra = week.practiceDays - done;
  return (
    <p className="dots" aria-label={`${String(week.practiceDays)} of ${String(week.target)} practice days this week`}>
      {'●'.repeat(done)}
      {'○'.repeat(week.target - done)}
      {extra > 0 ? ` +${String(extra)}` : ''}
    </p>
  );
}
