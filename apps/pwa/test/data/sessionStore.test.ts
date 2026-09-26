import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { describe, expect, it } from 'vitest';
import type { MicInfo } from '../../src/audio/microphone';
import type { RecordedTake } from '../../src/audio/takeRecorder';
import { openTakeStore } from '../../src/audio/takeStore';
import { DEFAULT_PROFILE, openSessionStore } from '../../src/data/sessionStore';

const mic: MicInfo = {
  label: 'Default',
  requested: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  applied: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, sampleRate: 48_000 },
  capabilities: null,
  contextSampleRate: 48_000,
};

const take: RecordedTake = {
  kind: 'sentence',
  stopReason: 'silence',
  samples: new Float32Array(1600),
  sampleRate: 16_000,
  sourceDurationS: 0.2,
  startOffsetS: 0,
  speech: [],
  noiseFloorDb: null,
};

let count = 0;
const fresh = () => `session-test-${String(++count)}`;

describe('session store', () => {
  it('Store_UpgradeFromV1_KeepsTakes', async () => {
    const name = fresh();
    // Version 1 as shipped in R2 (apps/pwa/src/audio/takeStore.ts).
    const v1 = new Dexie(name);
    v1.version(1).stores({ takes: '++id, createdAt, kind', audio: '++id' });
    const audioId = await v1.table('audio').add({ kind: 'practice', createdAt: '2026-09-26T10:00:00.000Z', wav: new ArrayBuffer(8) });
    const takeId = await v1.table('takes').add({ createdAt: '2026-09-26T10:00:00.000Z', kind: 'sentence', audioId, durationS: 1 });
    v1.close();

    const takes = openTakeStore(name);
    expect((await takes.list()).map((row) => row.id)).toEqual([takeId]);
    expect(await takes.loadWav(Number(takeId))).not.toBeNull();
    expect(await openSessionStore(name).list()).toEqual([]);
  });

  it('Store_SessionSaveLoad_RoundTrips', async () => {
    const sessions = openSessionStore(fresh());
    const id = await sessions.start({ language: 'fr', kind: 'practice', length: 10 });
    await sessions.update(id, {
      warmUp: [{ itemId: 'fr-p01', takeId: 1 }],
      blocks: [{ cue: 'jaw', pairs: [{ itemId: 'fr-p02', usualTakeId: 2, clearTakeId: 3, judgement: 'clear' }] }],
      counted: true,
    });
    const row = await sessions.get(id);
    expect(row).toMatchObject({ id, language: 'fr', kind: 'practice', length: 10, counted: true });
    expect(row?.blocks[0]?.pairs[0]?.judgement).toBe('clear');
    expect(row?.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('Store_SessionList_NewestFirst', async () => {
    const sessions = openSessionStore(fresh());
    const first = await sessions.start({ language: 'en', kind: 'baseline', length: null });
    const second = await sessions.start({ language: 'fr', kind: 'practice', length: 5 });
    expect((await sessions.list()).map((row) => row.id)).toEqual([second, first]);
  });

  it('Store_TakeRole_Saved', async () => {
    const name = fresh();
    const takes = openTakeStore(name);
    const id = await takes.save(take, { mic, device: 'a', language: 'en', prompt: 'x', sessionId: 4, itemId: 'en-p01', role: 'clear' });
    const [row] = await takes.list();
    expect(row).toMatchObject({ id, sessionId: 4, itemId: 'en-p01', role: 'clear' });
  });

  it('Profile_Defaults', async () => {
    const sessions = openSessionStore(fresh());
    expect(await sessions.profile()).toEqual(DEFAULT_PROFILE);
    expect(DEFAULT_PROFILE).toEqual({ weeklyTarget: 4, lastCue: 'jaw' });
  });

  it('Profile_Save_MergesAndClampsTarget', async () => {
    const sessions = openSessionStore(fresh());
    await sessions.saveProfile({ weeklyTarget: 9 });
    await sessions.saveProfile({ lastCue: 'reach' });
    expect(await sessions.profile()).toEqual({ weeklyTarget: 6, lastCue: 'reach' });
  });
});
