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
