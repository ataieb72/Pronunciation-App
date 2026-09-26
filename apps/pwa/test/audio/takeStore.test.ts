import 'fake-indexeddb/auto';
import { decodeWav } from '@pc/dsp';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MicInfo } from '../../src/audio/microphone';
import type { RecordedTake } from '../../src/audio/takeRecorder';
import { openTakeStore } from '../../src/audio/takeStore';

const mic: MicInfo = {
  label: 'Default',
  requested: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  applied: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, sampleRate: 48_000 },
  capabilities: null,
  contextSampleRate: 48_000,
};

function take(seconds = 1): RecordedTake {
  const samples = Float32Array.from({ length: seconds * 16_000 }, (_, i) => 0.1 * Math.sin(i / 10));
  return { kind: 'sentence', stopReason: 'silence', samples, sampleRate: 16_000, sourceDurationS: seconds + 0.5, startOffsetS: 0.5, speech: [{ start: 0.3, end: 0.9 }], noiseFloorDb: -68 };
}

let dbCount = 0;
const freshStore = () => openTakeStore(`test-${String(++dbCount)}`);

/** jsdom has no StorageManager; tests set one on navigator. */
function setStorage(value: Partial<StorageManager> | undefined): void {
  Object.defineProperty(navigator, 'storage', { configurable: true, get: () => value });
}

afterEach(() => {
  setStorage(undefined);
});

describe('take store', () => {
  it('TakeStore_SaveLoad_RoundTrips', async () => {
    const store = freshStore();
    const recorded = take();
    const id = await store.save(recorded, { mic, device: 'test-agent' });
    const wav = await store.loadWav(id);
    expect(wav).not.toBeNull();
    const decoded = decodeWav(wav ?? new ArrayBuffer(0));
    expect(decoded.sampleRate).toBe(16_000);
    expect(decoded.samples).toHaveLength(recorded.samples.length);
    expect(decoded.samples[100]).toBeCloseTo(recorded.samples[100] ?? 0, 4);
  });

  it('TakeStore_Reopen_KeepsTakes', async () => {
    // An app restart opens the database again under the same name.
    const name = `test-reopen-${String(++dbCount)}`;
    const id = await openTakeStore(name).save(take(), { mic, device: 'a' });
    const reopened = openTakeStore(name);
    expect((await reopened.list()).map((r) => r.id)).toEqual([id]);
    expect(await reopened.loadWav(id)).not.toBeNull();
  });

  it('TakeStore_Metadata_HasAppliedSettings', async () => {
    const store = freshStore();
    await store.save(take(), { mic, device: 'test-agent' });
    const [row] = await store.list();
    expect(row?.mic.applied).toEqual(mic.applied);
    expect(row?.device).toBe('test-agent');
    expect(row?.kind).toBe('sentence');
    expect(row?.stopReason).toBe('silence');
    expect(row?.durationS).toBeCloseTo(1, 5);
    expect(row?.noiseFloorDb).toBe(-68);
    expect(row?.speech).toEqual([{ start: 0.3, end: 0.9 }]);
  });

  it('TakeStore_List_NewestFirst_WithoutAudio', async () => {
    const store = freshStore();
    const first = await store.save(take(), { mic, device: 'a' });
    const second = await store.save(take(2), { mic, device: 'b' });
    const rows = await store.list();
    expect(rows.map((r) => r.id)).toEqual([second, first]);
    expect(rows[0]).not.toHaveProperty('wav');
  });

  it('TakeStore_Remove_DeletesTakeAndAudio', async () => {
    const store = freshStore();
    const id = await store.save(take(), { mic, device: 'a' });
    await store.remove(id);
    expect(await store.list()).toEqual([]);
    expect(await store.loadWav(id)).toBeNull();
  });

  it('TakeStore_FirstSave_AsksForPersistentStorage', async () => {
    const persist = vi.fn(() => Promise.resolve(true));
    setStorage({ persist });
    const store = freshStore();
    await store.save(take(), { mic, device: 'a' });
    await store.save(take(), { mic, device: 'a' });
    expect(persist).toHaveBeenCalledTimes(1);
    expect(await store.persisted()).toBe(true);
  });

  it('TakeStore_NoStorageApi_StillSaves', async () => {
    setStorage(undefined);
    const store = freshStore();
    await expect(store.save(take(), { mic, device: 'a' })).resolves.toBeTypeOf('number');
    expect(await store.persisted()).toBeNull();
  });
});
