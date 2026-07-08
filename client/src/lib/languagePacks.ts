import enPhonemes from '../languages/en-US/phonemes.json' with { type: 'json' };
import enExercises from '../languages/en-US/exercises.json' with { type: 'json' };
import frPhonemes from '../languages/fr-FR/phonemes.json' with { type: 'json' };
import frExercises from '../languages/fr-FR/exercises.json' with { type: 'json' };

export interface PhonemeInfo {
  ipa: string;
  example: string;
  difficulty: number;
  note?: string;
}

export interface Exercise {
  id: string;
  track: 'phoneme' | 'articulation' | 'prosody';
  text: string;
  focus: string[];
  difficulty: number;
  level: 'word' | 'sentence' | 'passage';
  speedLadder?: boolean;
  shadowing?: boolean;
}

export interface LanguagePack {
  locale: string;
  phonemes: Record<string, PhonemeInfo>;
  exercises: Exercise[];
}

export class PackValidatorError extends Error {
  path?: string;
  constructor(message: string, path?: string) {
    super(message);
    this.name = 'PackValidatorError';
    this.path = path;
  }
}

export function validatePack(pack: any): void {
  if (!pack.exercises || !Array.isArray(pack.exercises)) {
    throw new PackValidatorError('exercises must be an array');
  }
  if (!pack.phonemes || typeof pack.phonemes !== 'object') {
    throw new PackValidatorError('phonemes must be an object');
  }
  pack.exercises.forEach((ex: any, i: number) => {
    const pathPrefix = `exercises[${i}]`;
    if (!ex.track) {
      throw new PackValidatorError(`Missing track at ${pathPrefix}.track`, `${pathPrefix}.track`);
    }
    if (!['phoneme', 'articulation', 'prosody'].includes(ex.track)) {
      throw new PackValidatorError(`Invalid track`, `${pathPrefix}.track`);
    }
    if (!ex.text || typeof ex.text !== 'string') {
      throw new PackValidatorError(`Missing or invalid text`, `${pathPrefix}.text`);
    }
    if (!Array.isArray(ex.focus) || ex.focus.length === 0) {
      throw new PackValidatorError(`Missing or invalid focus`, `${pathPrefix}.focus`);
    }
    if (typeof ex.difficulty !== 'number' || ex.difficulty < 1 || ex.difficulty > 3) {
      throw new PackValidatorError(`Invalid difficulty`, `${pathPrefix}.difficulty`);
    }
    if (!['word', 'sentence', 'passage'].includes(ex.level)) {
      throw new PackValidatorError(`Invalid level`, `${pathPrefix}.level`);
    }
    // Validate focus phonemes exist
    ex.focus.forEach((f: string) => {
      if (!pack.phonemes[f]) {
        throw new PackValidatorError(`Unknown focus phoneme "${f}"`, `${pathPrefix}.focus`);
      }
    });
  });
}

const rawPacks: Record<string, { phonemes: any; exercises: any; locale: string }> = {
  'en-US': { phonemes: enPhonemes, exercises: enExercises, locale: 'en-US' },
  'fr-FR': { phonemes: frPhonemes, exercises: frExercises, locale: 'fr-FR' },
};

export function loadPack(locale: string): LanguagePack {
  const raw = rawPacks[locale];
  if (!raw) {
    throw new Error(`Unknown locale: ${locale}`);
  }
  const pack: LanguagePack = {
    locale: raw.locale,
    phonemes: raw.phonemes,
    exercises: raw.exercises,
  };
  validatePack(pack);
  return pack;
}

export function getPhoneme(locale: string, label: string): PhonemeInfo | undefined {
  const pack = loadPack(locale);
  return pack.phonemes[label];
}
