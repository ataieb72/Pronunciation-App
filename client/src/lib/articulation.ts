export function rateDelta(attemptMs: number, refMs: number): string {
  const delta = ((attemptMs - refMs) / refMs) * 100;
  const rounded = Math.round(delta);
  const sign = rounded >= 0 ? '+' : '';
  return `${sign}${rounded}%`;
}

interface Pause {
  start: number;
  end: number;
  duration: number;
}

export function extractPauses(azureResult: any): Pause[] {
  const words = azureResult?.NBest?.[0]?.Words || [];
  const pauses: Pause[] = [];
  let prevEnd = 0;
  for (const word of words) {
    const start = word.Offset || 0;
    const duration = word.Duration || 0;
    const end = start + duration;
    if (start > prevEnd) {
      const gap = start - prevEnd;
      if (gap > 2000000) { // > 200ms as unexpected pause threshold (in 100ns units)
        pauses.push({
          start: prevEnd,
          end: start,
          duration: gap,
        });
      }
    }
    prevEnd = end;
  }
  return pauses;
}
