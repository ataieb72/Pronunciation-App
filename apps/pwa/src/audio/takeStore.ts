/**
 * Takes on the phone, in IndexedDB through Dexie (docs/database-schema.md §2; `data/database.ts`).
 * `takes` holds the metadata (small, listed often); `audio` holds the 16 kHz WAV files.
 * On the first save the app asks the browser to keep the data (`navigator.storage.persist()`),
 * so Chrome does not clear it when space runs low.
 */
import type { Language } from '@pc/core';
import { encodeWav } from '@pc/dsp';
import { database, type TakeRole, type TakeRow } from '../data/database';
import type { Readings } from '../record/analysis';
import type { MicInfo } from './microphone';
import type { RecordedTake } from './takeRecorder';

export type { AudioRow, TakeRole, TakeRow } from '../data/database';

export interface TakeContext {
  readonly mic: MicInfo;
  /** The browser's user agent, to tell phones and browsers apart later ("scoring eras"). */
  readonly device: string;
  readonly language?: Language;
  readonly prompt?: string;
  readonly sessionId?: number;
  readonly itemId?: string;
  readonly role?: TakeRole;
}

export interface TakeStore {
  save(take: RecordedTake, context: TakeContext): Promise<number>;
  /** Newest first, without audio. */
  list(): Promise<TakeRow[]>;
  loadWav(takeId: number): Promise<ArrayBuffer | null>;
  setReadings(takeId: number, readings: Readings): Promise<void>;
  remove(takeId: number): Promise<void>;
  /** Whether the browser agreed to keep the data; null before the first save or without the API. */
  persisted(): Promise<boolean | null>;
}

export function openTakeStore(name?: string): TakeStore {
  const db = database(name);
  let persistence: Promise<boolean | null> | null = null;

  const askToPersist = (): Promise<boolean | null> => {
    const storage = (navigator as Partial<Navigator>).storage;
    if (typeof storage?.persist !== 'function') return Promise.resolve(null);
    return storage.persist().catch(() => null);
  };

  return {
    async save(take, context) {
      persistence ??= askToPersist();
      const createdAt = new Date().toISOString();
      return db.transaction('rw', db.takes, db.audio, async () => {
        const audioId = await db.audio.add({ kind: 'practice', createdAt, wav: encodeWav(take.samples, take.sampleRate) });
        return db.takes.add({
          createdAt,
          kind: take.kind,
          stopReason: take.stopReason,
          durationS: take.samples.length / take.sampleRate,
          sampleRate: take.sampleRate,
          startOffsetS: take.startOffsetS,
          speech: take.speech.map((s) => ({ start: s.start, end: s.end })),
          noiseFloorDb: take.noiseFloorDb,
          audioId,
          mic: context.mic,
          device: context.device,
          ...(context.language === undefined ? {} : { language: context.language }),
          ...(context.prompt === undefined ? {} : { prompt: context.prompt }),
          ...(context.sessionId === undefined ? {} : { sessionId: context.sessionId }),
          ...(context.itemId === undefined ? {} : { itemId: context.itemId }),
          ...(context.role === undefined ? {} : { role: context.role }),
        });
      });
    },
    async list() {
      return db.takes.orderBy('id').reverse().toArray();
    },
    async loadWav(takeId) {
      const row = await db.takes.get(takeId);
      if (!row) return null;
      return (await db.audio.get(row.audioId))?.wav ?? null;
    },
    async setReadings(takeId, readings) {
      await db.takes.update(takeId, { readings });
    },
    async remove(takeId) {
      await db.transaction('rw', db.takes, db.audio, async () => {
        const row = await db.takes.get(takeId);
        if (row) await db.audio.delete(row.audioId);
        await db.takes.delete(takeId);
      });
    },
    persisted() {
      return persistence ?? Promise.resolve(null);
    },
  };
}
