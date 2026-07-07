interface Word {
  word: string;
  score: number;
  phonemes: { phoneme: string; score: number }[];
}

export function parseAssessmentWords(assessment: any): Word[] {
  if (!assessment) return [];

  // If we have direct words
  if (assessment.words) return assessment.words;

  // Try to parse from phonemeJson or the detail
  let detail = assessment.phonemeJson ? JSON.parse(assessment.phonemeJson) : assessment;

  // Common shape from Azure: detail has Words or from NBest
  const wordsData = detail.Words || detail.words || (detail.NBest && detail.NBest[0] && detail.NBest[0].Words) || [];

  return wordsData.map((w: any) => ({
    word: w.Word || w.word || '',
    score: w.AccuracyScore || w.score || 0,
    phonemes: (w.Phonemes || w.phonemes || []).map((p: any) => ({
      phoneme: p.Phoneme || p.phoneme || '',
      score: p.AccuracyScore || p.score || 0,
    })),
  }));
}
