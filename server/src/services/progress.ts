export function articulationIndex(fixtures: Array<{ accuracy: number; tier: number }>): number {
  const multipliers = [0.9, 1.0, 1.15];
  let sum = 0;
  fixtures.forEach(f => {
    const m = multipliers[f.tier] || 1.0;
    sum += f.accuracy * m;
  });
  return fixtures.length ? sum / fixtures.length : 0;
}

export function progressAggregation(attempts: Array<{ created_at: string; overall_score: number; language: string }>) {
  const byDay: Record<string, Record<string, number[]>> = {};
  attempts.forEach(a => {
    const date = a.created_at.split('T')[0];
    if (!byDay[date]) byDay[date] = {};
    if (!byDay[date][a.language]) byDay[date][a.language] = [];
    byDay[date][a.language].push(a.overall_score);
  });
  return Object.keys(byDay).sort().map(date => {
    const entry: any = { date };
    Object.keys(byDay[date]).forEach(lang => {
      const scores = byDay[date][lang];
      entry[lang] = scores.reduce((s, v) => s + v, 0) / scores.length;
    });
    return entry;
  });
}
