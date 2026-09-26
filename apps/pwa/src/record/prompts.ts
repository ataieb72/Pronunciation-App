/** Test prompts for the record screen: everyday sentences with word endings mumblers drop (product-design §4). */
export type Language = 'en' | 'fr';

export const SENTENCES: Record<Language, readonly string[]> = {
  en: ['I asked her to help me with the world map.', 'The ship left the harbour at eight.', 'Please text me when you get home.'],
  fr: ['Le ministre a pris la table du fond.', 'Je voudrais un café, s’il vous plaît.', 'Il faut prendre le train de huit heures.'],
};

/** Held vowels for the pitch check (R2-T08). Longer held sounds count as background (R2-T06). */
export const VOWEL_PROMPTS: Record<Language, string> = {
  en: 'Say “aah” steadily for about 2 seconds.',
  fr: 'Dites « aah » de façon régulière, environ 2 secondes.',
};

export const TALK_PROMPTS: Record<Language, string> = {
  en: 'Say what you did this morning.',
  fr: 'Racontez ce que vous avez fait ce matin.',
};
