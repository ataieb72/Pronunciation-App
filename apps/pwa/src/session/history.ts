/** What earlier sessions tell the next one. Sessions come newest first, as the store lists them. */
import type { Feature, Language, SessionLog, TakeMeasures } from '@pc/core';
import type { SessionRow } from '../data/database';
import type { Readings } from '../record/analysis';

export function hasBaseline(sessions: readonly SessionRow[], language: Language): boolean {
  return sessions.some((s) => s.kind === 'baseline' && s.counted && s.language === language);
}

/** Sentence ids, most recent first, so the picker can avoid them. */
export function recentItemIds(sessions: readonly SessionRow[]): string[] {
  return sessions.flatMap((s) => [...s.blocks.flatMap((b) => b.pairs.map((p) => p.itemId)).reverse(), ...s.warmUp.map((w) => w.itemId).reverse()]);
}

/** Per counted practice session, newest first: the features that changed (or held) in any block. */
export function featureHistory(sessions: readonly SessionRow[]): Feature[][] {
  return sessions
    .filter((s) => s.kind === 'practice' && s.counted)
    .map((s) => [...new Set(s.blocks.flatMap((b) => (b.summary ? [...b.summary.changed, ...b.summary.stillHolding] : [])))].sort());
}

export function sessionLogs(sessions: readonly SessionRow[]): SessionLog[] {
  return sessions.map((s) => ({ startedAt: s.startedAt, language: s.language, counted: s.counted }));
}

export function measuresOf(readings: Readings | undefined): TakeMeasures {
  if (!readings) return { ok: false, levelDb: null, pitchRangeSt: null, fadeDb: null, rate: null };
  return {
    ok: readings.quality.ok,
    levelDb: readings.speechLevelDbfs,
    pitchRangeSt: readings.pitch?.rangeSemitones ?? null,
    fadeDb: readings.fadeDb,
    rate: readings.articulationRate,
  };
}
