import { describe, expect, it } from 'vitest';
import { BASELINE_SENTENCES, hasTargetEnding, PRACTICE_SENTENCES, pickSentences, wordsOf, type SentenceItem } from '../src';

const LANGUAGES = ['en', 'fr'] as const;

function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe.each(LANGUAGES)('sentence bank (%s)', (language) => {
  const practice = PRACTICE_SENTENCES[language];
  const baseline = BASELINE_SENTENCES[language];
  const all: SentenceItem[] = [...practice, ...baseline];

  it('Bank_Sizes_40PracticeAnd8Baseline', () => {
    expect(practice).toHaveLength(40);
    expect(baseline).toHaveLength(8);
    expect(all.every((item) => item.language === language)).toBe(true);
  });

  it('Bank_Ids_Unique', () => {
    expect(new Set(all.map((item) => item.id)).size).toBe(all.length);
    expect(all.every((item) => item.id.startsWith(`${language}-`))).toBe(true);
  });

  it.each(all.map((item) => [item.id, item] as const))('Bank_Targets_InSentenceWithEnding (%s)', (_id, item) => {
    const words = wordsOf(item.text);
    expect(item.targets.length).toBeGreaterThanOrEqual(2);
    for (const target of item.targets) {
      expect(words).toContain(target);
      expect(hasTargetEnding(language, target)).toBe(true);
    }
  });

  it('Bank_Length_6to14Words', () => {
    for (const item of all) {
      const count = wordsOf(item.text).length;
      expect(count, item.text).toBeGreaterThanOrEqual(6);
      expect(count, item.text).toBeLessThanOrEqual(14);
    }
  });

  it('Bank_BaselineHeldOut', () => {
    const texts = new Set(practice.map((item) => item.text.toLowerCase()));
    expect(baseline.filter((item) => texts.has(item.text.toLowerCase()))).toEqual([]);
    expect(baseline.every((item) => item.id.includes('-base-'))).toBe(true);
  });
});

describe('word endings', () => {
  it('Ending_English_FinalStopsAndClusters', () => {
    for (const word of ['asked', 'help', 'world', 'texts', 'six', 'friends', 'night']) expect(hasTargetEnding('en', word), word).toBe(true);
    for (const word of ['home', 'see', 'call', 'phone', 'month']) expect(hasTargetEnding('en', word), word).toBe(false);
  });

  it('Ending_French_ConsonantPlusLiquid', () => {
    for (const word of ['table', 'ministre', 'prendre', 'propre', 'cercle', 'chambre', 'livres', 'fenêtre']) expect(hasTargetEnding('fr', word), word).toBe(true);
    for (const word of ['café', 'maison', 'frère', 'heure', 'train']) expect(hasTargetEnding('fr', word), word).toBe(false);
  });

  it('Words_SplitOnApostrophesAndPunctuation', () => {
    expect(wordsOf("C'est l'autre table, s'il te plaît ?")).toEqual(['c', 'est', 'l', 'autre', 'table', 's', 'il', 'te', 'plaît']);
  });
});

describe('pickSentences', () => {
  const bank = PRACTICE_SENTENCES.en;

  it('Pick_NoRepeatInSession', () => {
    const picked = pickSentences(bank, 8, [], seeded(1));
    expect(picked).toHaveLength(8);
    expect(new Set(picked.map((item) => item.id)).size).toBe(8);
  });

  it('Pick_PrefersNotRecent', () => {
    const recent = bank.slice(0, 30).map((item) => item.id);
    const picked = pickSentences(bank, 8, recent, seeded(2));
    expect(picked.filter((item) => recent.includes(item.id))).toEqual([]);
  });

  it('Pick_AllRecent_TakesTheLeastRecent', () => {
    // Most recent first: the last ids in the list were used longest ago.
    const recent = bank.map((item) => item.id);
    const picked = pickSentences(bank, 4, recent, seeded(3));
    expect(picked.map((item) => item.id).sort()).toEqual(recent.slice(-4).sort());
  });

  it('Pick_Varies_WithRandom', () => {
    const a = pickSentences(bank, 8, [], seeded(4)).map((item) => item.id);
    const b = pickSentences(bank, 8, [], seeded(5)).map((item) => item.id);
    expect(a).not.toEqual(b);
  });
});
