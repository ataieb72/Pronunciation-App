/**
 * Takes on the phone, in IndexedDB through Dexie (docs/database-schema.md §2).
 * `takes` holds the metadata (small, listed often); `audio` holds the 16 kHz WAV files.
 * On the first save the app asks the browser to keep the data (`navigator.storage.persist()`),
 * so Chrome does not clear it when space runs low.
 */
import { encodeWav, type SpeechSegment } from '@pc/dsp';
import Dexie, { type EntityTable } from 'dexie';
import type { MicInfo } from './microphone';
import type { RecordedTake, StopReason, TakeKind } from './takeRecorder';

export interface TakeRow {
  id: number;
  createdAt: string;
  kind: TakeKind;
  stopReason: StopReason;
  durationS: number;
  sampleRate: number;
  /** Seconds of silence dropped before the 300 ms pre-roll. */
  startOffsetS: number;
  speech: SpeechSegment[];
  noiseFloorDb: number | null;
  audioId: number;
  mic: MicInfo;
  device: string;
}

export interface AudioRow {
  id: number;
  kind: 'practice';
  createdAt: string;
  wav: ArrayBuffer;
}

export interface TakeContext {
  readonly mic: MicInfo;
  /** The browser's user agent, to tell phones and browsers apart later ("scoring eras"). */
  readonly device: string;
}

export interface TakeStore {
  save(take: RecordedTake, context: TakeContext): Promise<number>;
  /** Newest first, without audio. */
  list(): Promise<TakeRow[]>;
  loadWav(takeId: number): Promise<ArrayBuffer | null>;
  remove(takeId: number): Promise<void>;
  /** Whether the browser agreed to keep the data; null before the first save or without the API. */
  persisted(): Promise<boolean | null>;
}

class CoachDatabase extends Dexie {
  takes!: EntityTable<TakeRow, 'id'>;
  audio!: EntityTable<AudioRow, 'id'>;

  constructor(name: string) {
    super(name);
    this.version(1).stores({ takes: '++id, createdAt, kind', audio: '++id' });
  }
}

export function openTakeStore(name = 'pronunciation-coach'): TakeStore {
  const db = new CoachDatabase(name);
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
