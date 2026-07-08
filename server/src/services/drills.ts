interface DrillExercise {
  id: string;
  track: string;
  text: string;
  focus: string[];
  difficulty: number;
  level: string;
}

export function buildDrillSession(weakPhonemes: string[], pack: { exercises: DrillExercise[] }): DrillExercise[] {
  const relevant = pack.exercises.filter(ex =>
    ex.track === 'phoneme' && ex.focus.some((f: string) => weakPhonemes.includes(f))
  );

  const words = relevant.filter(e => e.level === 'word').sort((a, b) => a.difficulty - b.difficulty);
  const sentences = relevant.filter(e => e.level === 'sentence').sort((a, b) => a.difficulty - b.difficulty);
  const passages = relevant.filter(e => e.level === 'passage').sort((a, b) => a.difficulty - b.difficulty);

  return [...words, ...sentences, ...passages];
}

export function levelGate(avgScore: number): boolean {
  return avgScore >= 85;
}

export interface LadderResult {
  newTier: number;
  advanced: boolean;
}

/**
 * Determine if ladder should advance based on accuracy at current tier.
 * Max tier 2.
 */
export function applyLadderRule(currentTier: number, accuracy: number): LadderResult {
  if (currentTier >= 2) {
    return { newTier: 2, advanced: false };
  }
  if (accuracy >= 85) {
    return { newTier: currentTier + 1, advanced: true };
  }
  return { newTier: currentTier, advanced: false };
}
