import { vi } from 'vitest';
import type { AudioSource } from '../../src/audio/microphone';
import type { TakeRow, TakeStore } from '../../src/audio/takeStore';
import type { Readings } from '../../src/record/analysis';
import type { RecordDeps } from '../../src/record/RecordScreen';
import { hush, join, MIC_RATE, syllables, withFloor } from '../audio/signals';

export const speechThenSilence = () => join(hush(0.3), withFloor(syllables(1.5)), hush(1.5, MIC_RATE, 3));
export const speechOnly = () => join(hush(0.3), withFloor(syllables(1.5)));

/** A microphone that plays a signal once a listener is set. */
export function fakeSource(signal: Float32Array): AudioSource {
  let played = false;
  return {
    sampleRate: MIC_RATE,
    mic: { label: 'Fake mic', requested: {}, applied: { echoCancellation: false }, capabilities: null, contextSampleRate: MIC_RATE },
    listen(listener) {
      if (!listener || played) return;
      played = true;
      setTimeout(() => {
        for (let i = 0; i < signal.length; i += 1024) listener(signal.subarray(i, i + 1024));
      }, 0);
    },
    close: () => Promise.resolve(),
  };
}

export function memoryStore(initial: Partial<TakeRow>[] = []): TakeStore & { rows: TakeRow[] } {
  const rows: TakeRow[] = [];
  const wavs = new Map<number, ArrayBuffer>();
  let nextId = 1;
  const base = { createdAt: '2026-09-26T10:00:00.000Z', kind: 'sentence', stopReason: 'silence', durationS: 2, sampleRate: 16_000, startOffsetS: 0, speech: [], noiseFloorDb: -70, audioId: 0, mic: { label: '', requested: {}, applied: {}, capabilities: null, contextSampleRate: 48_000 }, device: 'test' } as const;
  for (const row of initial) rows.push({ ...base, ...row, speech: [], id: nextId++ });
  return {
    rows,
    save(take, context) {
      const id = nextId++;
      rows.push({ ...base, kind: take.kind, stopReason: take.stopReason, durationS: take.samples.length / take.sampleRate, speech: [...take.speech], mic: context.mic, device: context.device, id, audioId: id, ...(context.language ? { language: context.language } : {}), ...(context.prompt ? { prompt: context.prompt } : {}) });
      wavs.set(id, new ArrayBuffer(44));
      return Promise.resolve(id);
    },
    list: () => Promise.resolve([...rows].reverse()),
    loadWav: (id) => Promise.resolve(wavs.get(id) ?? null),
    setReadings(id, readings) {
      const row = rows.find((r) => r.id === id);
      if (row) row.readings = readings;
      return Promise.resolve();
    },
    remove(id) {
      const i = rows.findIndex((r) => r.id === id);
      if (i >= 0) rows.splice(i, 1);
      return Promise.resolve();
    },
    persisted: () => Promise.resolve(true),
  };
}

export const goodReadings: Readings = {
  quality: { ok: true, reasons: [], peakDbfs: -6, clippedRatio: 0, snrDb: 38, speechMs: 1400 },
  speechLevelDbfs: -24.3,
  pitch: { medianHz: 118, rangeSemitones: 5.2 },
  pauses: { count: 2, totalS: 1.1 },
  syllables: 12,
  articulationRate: 4.1,
  fadeDb: -2.1,
};

export function makeDeps(options: { signal?: Float32Array; readings?: Readings; store?: TakeStore; openError?: Error } = {}): RecordDeps & { analyze: ReturnType<typeof vi.fn> } {
  const analyze = vi.fn(() => Promise.resolve(options.readings ?? goodReadings));
  return {
    openSource: () => (options.openError ? Promise.reject(options.openError) : Promise.resolve(fakeSource(options.signal ?? speechThenSilence()))),
    store: options.store ?? memoryStore(),
    analyze,
    env: { document },
  };
}
