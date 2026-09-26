/** A short, typed summary of one Azure JSON result, for the phone-test report. */
export interface AzureSummary {
  readonly text: string;
  readonly scores: {
    readonly accuracy: number | null;
    readonly fluency: number | null;
    readonly completeness: number | null;
    readonly pron: number | null;
    readonly prosody: number | null;
  };
  readonly words: number;
  readonly phonemes: number;
  /** False when Azure returns phoneme scores without names (expected for fr-FR). */
  readonly phonemesNamed: boolean;
}

type Obj = Record<string, unknown>;

const asObj = (v: unknown): Obj | null => (typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Obj) : null);
const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? (v as unknown[]) : []);
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Reads a score from the SDK shape (nested under PronunciationAssessment) or the flat REST shape. */
function score(holder: Obj, name: string): number | null {
  return num(asObj(holder['PronunciationAssessment'])?.[name]) ?? num(holder[name]);
}

export function summarizeAzureJson(json: string): AzureSummary | null {
  let root: Obj | null;
  try {
    root = asObj(JSON.parse(json));
  } catch {
    return null;
  }
  const best = asObj(asArray(root?.['NBest'])[0]);
  if (root === null || best === null) return null;

  const words = asArray(best['Words']).map(asObj).filter((w): w is Obj => w !== null);
  const phonemes = words.flatMap((w) => asArray(w['Phonemes']).map(asObj)).filter((p): p is Obj => p !== null);
  const displayText = root['DisplayText'] ?? best['Display'];

  return {
    text: typeof displayText === 'string' ? displayText : '',
    scores: {
      accuracy: score(best, 'AccuracyScore'),
      fluency: score(best, 'FluencyScore'),
      completeness: score(best, 'CompletenessScore'),
      pron: score(best, 'PronScore'),
      prosody: score(best, 'ProsodyScore'),
    },
    words: words.length,
    phonemes: phonemes.length,
    phonemesNamed: phonemes.length > 0 && phonemes.every((p) => typeof p['Phoneme'] === 'string' && p['Phoneme'] !== ''),
  };
}
