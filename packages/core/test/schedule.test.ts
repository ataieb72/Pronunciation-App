import { describe, expect, it } from 'vitest';
import {
  BASELINE_SENTENCES,
  clampTarget,
  languageOfTheDay,
  localDay,
  planSession,
  PRACTICE_SENTENCES,
  SESSION_RULES,
  weekProgress,
  WEEKLY_TARGET,
  type SessionLog,
} from '../src';

// Local-time dates (months start at 0): 2026-09-28 is a Monday.
const at = (day: number, hour = 9) => new Date(2026, 8, day, hour, 0);
const log = (day: number, language: 'en' | 'fr', counted = true, hour = 9): SessionLog => ({ startedAt: at(day, hour).toISOString(), language, counted });

function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe('languageOfTheDay', () => {
  it('Language_NoHistory_English', () => {
    expect(languageOfTheDay([], at(28))).toBe('en');
  });

  it('Language_NextDay_Alternates', () => {
    expect(languageOfTheDay([log(28, 'en')], at(29))).toBe('fr');
    expect(languageOfTheDay([log(28, 'fr')], at(29))).toBe('en');
  });

  it('Language_SameDay_Keeps', () => {
    expect(languageOfTheDay([log(28, 'fr', true, 8)], at(28, 20))).toBe('fr');
  });

  it('Language_MonWedFri_Alternates', () => {
    const history = [log(28, 'en')];
    expect(languageOfTheDay(history, at(30))).toBe('fr');
    history.push(log(30, 'fr'));
    expect(languageOfTheDay(history, at(32))).toBe('en');
  });

  it('Language_UncountedSession_Ignored', () => {
    expect(languageOfTheDay([log(28, 'en'), log(29, 'fr', false)], at(30))).toBe('fr');
  });

  it('Language_HistoryInAnyOrder', () => {
    expect(languageOfTheDay([log(30, 'fr'), log(28, 'en')], at(31))).toBe('en');
  });
});

describe('planSession', () => {
  const base = { language: 'en' as const, hasBaseline: true, recentIds: [] as string[], random: seeded(7) };

  it('Plan_5min_OneBlock', () => {
    const plan = planSession({ ...base, length: 5 });
    expect(plan.kind).toBe('practice');
    if (plan.kind !== 'practice') return;
    expect(plan.warmUp).toHaveLength(SESSION_RULES.warmUpSentences);
    expect(plan.blocks).toHaveLength(1);
    expect(plan.blocks[0]).toHaveLength(SESSION_RULES.pairsPerBlock);
  });

  it('Plan_10min_TwoBlocks_AllDifferent', () => {
    const plan = planSession({ ...base, length: 10 });
    if (plan.kind !== 'practice') throw new Error('expected practice');
    expect(plan.blocks).toHaveLength(2);
    const ids = [...plan.warmUp, ...plan.blocks.flat()].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => PRACTICE_SENTENCES.en.some((item) => item.id === id))).toBe(true);
  });

  it('Plan_FirstInLanguage_Baseline', () => {
    const plan = planSession({ ...base, language: 'fr', length: 10, hasBaseline: false });
    expect(plan).toEqual({ kind: 'baseline', language: 'fr', items: BASELINE_SENTENCES.fr });
  });

  it('Plan_AvoidsRecent', () => {
    const recentIds = PRACTICE_SENTENCES.en.slice(0, 30).map((item) => item.id);
    const plan = planSession({ ...base, length: 10, recentIds });
    if (plan.kind !== 'practice') throw new Error('expected practice');
    expect([...plan.warmUp, ...plan.blocks.flat()].filter((item) => recentIds.includes(item.id))).toEqual([]);
  });
});

describe('weekProgress', () => {
  it('Week_CountsDaysMondayToSunday', () => {
    // Sunday 27th is last week; Monday 28th to Wednesday 30th are this week.
    const history = [log(27, 'en'), log(28, 'en'), log(30, 'fr')];
    expect(weekProgress(history, at(30, 21), 4)).toEqual({ practiceDays: 2, target: 4, met: false });
  });

  it('Week_TwoSessionsOneDay_CountsOnce', () => {
    const history = [log(28, 'en', true, 8), log(28, 'fr', true, 19)];
    expect(weekProgress(history, at(29), 4).practiceDays).toBe(1);
  });

  it('Week_UncountedSession_Ignored', () => {
    expect(weekProgress([log(28, 'en', false)], at(29), 4).practiceDays).toBe(0);
  });

  it('Week_SundayNight_StillSameWeek', () => {
    const history = [log(28, 'en'), log(29, 'fr'), log(30, 'en'), log(31, 'fr')];
    expect(weekProgress(history, new Date(2026, 9, 4, 23, 30), 4)).toEqual({ practiceDays: 4, target: 4, met: true });
  });

  it('Target_ClampedTo3to6', () => {
    expect(WEEKLY_TARGET.default).toBe(4);
    expect(clampTarget(1)).toBe(3);
    expect(clampTarget(9)).toBe(6);
    expect(clampTarget(5)).toBe(5);
    expect(clampTarget(Number.NaN)).toBe(4);
  });

  it('LocalDay_UsesLocalCalendar', () => {
    expect(localDay(at(28, 0))).toBe('2026-09-28');
    expect(localDay(at(28, 23))).toBe('2026-09-28');
  });
});
