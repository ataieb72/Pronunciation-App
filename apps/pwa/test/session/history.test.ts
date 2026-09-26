import { describe, expect, it } from 'vitest';
import type { SessionRow } from '../../src/data/database';
import { featureHistory, hasBaseline, measuresOf, recentItemIds, sessionLogs } from '../../src/session/history';
import { goodReadings } from '../record/fakes';

const summary = (changed: ('loudness' | 'pitchRange' | 'fade')[], stillHolding: ('loudness' | 'pitchRange' | 'fade')[] = []) => ({
  status: 'ok' as const,
  goodPairs: 4,
  changed,
  notChanged: [],
  unknown: [],
  stillHolding,
  pace: null,
  paceRatio: null,
  nextCue: 'jaw' as const,
});

function row(id: number, patch: Partial<SessionRow>): SessionRow {
  return { id, startedAt: `2026-09-${String(20 + id)}T09:00:00.000Z`, language: 'en', kind: 'practice', length: 10, warmUp: [], blocks: [], counted: true, ...patch };
}

describe('session history', () => {
  it('HasBaseline_OnlyCountedBaselineInThatLanguage', () => {
    const sessions = [row(1, { kind: 'baseline', language: 'en' }), row(2, { kind: 'baseline', language: 'fr', counted: false })];
    expect(hasBaseline(sessions, 'en')).toBe(true);
    expect(hasBaseline(sessions, 'fr')).toBe(false);
  });

  it('RecentItemIds_NewestFirst', () => {
    // Sessions come newest first, as the store lists them.
    const sessions = [
      row(2, { warmUp: [{ itemId: 'en-p05', takeId: 9 }], blocks: [{ cue: 'jaw', pairs: [{ itemId: 'en-p06', usualTakeId: 1, clearTakeId: 2 }, { itemId: 'en-p07', usualTakeId: null, clearTakeId: null, skipped: true }] }] }),
      row(1, { warmUp: [{ itemId: 'en-p01', takeId: 3 }], blocks: [{ cue: 'jaw', pairs: [{ itemId: 'en-p02', usualTakeId: 4, clearTakeId: 5 }] }] }),
    ];
    expect(recentItemIds(sessions)).toEqual(['en-p07', 'en-p06', 'en-p05', 'en-p02', 'en-p01']);
  });

  it('FeatureHistory_PracticeSessions_ChangedAndHolding', () => {
    const sessions = [
      row(3, { blocks: [{ cue: 'jaw', pairs: [], summary: summary(['fade'], ['loudness']) }, { cue: 'reach', pairs: [], summary: summary(['fade', 'pitchRange']) }] }),
      row(2, { kind: 'baseline', blocks: [{ cue: null, pairs: [] }] }),
      row(1, { blocks: [{ cue: 'jaw', pairs: [], summary: summary(['loudness']) }] }),
      row(0, { counted: false, blocks: [{ cue: 'jaw', pairs: [], summary: summary(['loudness']) }] }),
    ];
    expect(featureHistory(sessions)).toEqual([['fade', 'loudness', 'pitchRange'], ['loudness']]);
  });

  it('SessionLogs_KeepLanguageAndCounted', () => {
    expect(sessionLogs([row(1, { language: 'fr', counted: false })])).toEqual([{ startedAt: '2026-09-21T09:00:00.000Z', language: 'fr', counted: false }]);
  });

  it('MeasuresOf_Readings', () => {
    expect(measuresOf(goodReadings)).toEqual({ ok: true, levelDb: -24.3, pitchRangeSt: 5.2, fadeDb: -2.1, rate: 4.1 });
    expect(measuresOf(undefined).ok).toBe(false);
  });
});
