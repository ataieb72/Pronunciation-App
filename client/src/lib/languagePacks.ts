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

const packs: Record<string, LanguagePack> = {
  'en-US': {
    locale: 'en-US',
    phonemes: {
      'θ': { ipa: 'θ', example: 'three', difficulty: 2, note: 'voiceless dental fricative' },
      'ð': { ipa: 'ð', example: 'this', difficulty: 2 },
      'ɪ': { ipa: 'ɪ', example: 'ship', difficulty: 1 },
      'iː': { ipa: 'iː', example: 'sheep', difficulty: 1 },
      'æ': { ipa: 'æ', example: 'bat', difficulty: 1 },
      'ʌ': { ipa: 'ʌ', example: 'but', difficulty: 1 },
    },
    exercises: [] // populated in F5-T03
  },
  'fr-FR': {
    locale: 'fr-FR',
    phonemes: {
      'ɑ̃': { ipa: 'ɑ̃', example: 'vin', difficulty: 2, note: 'nasal vowel' },
      'ɛ̃': { ipa: 'ɛ̃', example: 'vent', difficulty: 2 },
      'ɔ̃': { ipa: 'ɔ̃', example: 'bon', difficulty: 2 },
      'ʁ': { ipa: 'ʁ', example: 'rue', difficulty: 3, note: 'uvular R' },
      'y': { ipa: 'y', example: 'rue', difficulty: 2 },
      'u': { ipa: 'u', example: 'roue', difficulty: 1 },
    },
    exercises: [] // populated in F5-T02
  }
};

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
  pack.exercises.forEach((ex: any, i: number) => {
    if (!ex.track) {
      throw new PackValidatorError(`Missing track at exercises[${i}].track`, `exercises[${i}].track`);
    }
    if (!['phoneme', 'articulation', 'prosody'].includes(ex.track)) {
      throw new PackValidatorError(`Invalid track at exercises[${i}].track`, `exercises[${i}].track`);
    }
    // add more validation as needed
  });
}

export function loadPack(locale: string): LanguagePack {
  const pack = packs[locale];
  if (!pack) {
    throw new Error(`Unknown locale: ${locale}`);
  }
  // In real, would load from JSON files and validate
  validatePack(pack);
  return pack;
}

export function getPhoneme(locale: string, label: string): PhonemeInfo | undefined {
  const pack = loadPack(locale);
  return pack.phonemes[label];
}
