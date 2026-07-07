export type ScoreColor = 'green' | 'amber' | 'red';

export function scoreColor(score: number): ScoreColor {
  if (score >= 85) return 'green';
  if (score >= 60) return 'amber';
  return 'red';
}
