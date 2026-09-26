/**
 * The app's IndexedDB database (docs/database-schema.md §2), shared by the take and session
 * stores. One Dexie instance per database name, so both stores use one connection.
 *
 * Version 2 (R3-T04) adds `sessions` and `profile`, and indexes takes by session. Version 1 rows
 * stay as they are: the new take fields are optional.
 */
import type { BlockSummary, Cue, Language, SessionLength } from '@pc/core';
import type { SpeechSegment } from '@pc/dsp';
import Dexie, { type EntityTable } from 'dexie';
import type { MicInfo } from '../audio/microphone';
import type { StopReason, TakeKind } from '../audio/takeRecorder';
import type { Readings } from '../record/analysis';

/** What a take was for in a session. */
export type TakeRole = 'warm-up' | 'usual' | 'clear';

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
  /** Language and text of the prompt, when there was one. */
  language?: Language;
  prompt?: string;
  /** Quality verdict and test readings, added after analysis (R2-T07). */
  readings?: Readings;
  /** Session, sentence and role, for takes recorded in a session (R3). */
  sessionId?: number;
  itemId?: string;
  role?: TakeRole;
}

export interface AudioRow {
  id: number;
  kind: 'practice';
  createdAt: string;
  wav: ArrayBuffer;
}

export type Judgement = 'usual' | 'clear' | 'same';

export interface PairRecord {
  itemId: string;
  usualTakeId: number | null;
  clearTakeId: number | null;
  /** "Which would your listener catch better?" (not asked in the baseline). */
  judgement?: Judgement;
  skipped?: boolean;
}

export interface BlockRecord {
  /** The block's sub-cue; null in the baseline, which has no cue. */
  cue: Cue | null;
  pairs: PairRecord[];
  summary?: BlockSummary;
}

export type SessionKind = 'practice' | 'baseline';

export interface SessionRow {
  id: number;
  startedAt: string;
  endedAt?: string;
  language: Language;
  kind: SessionKind;
  /** Minutes chosen; null for the baseline. */
  length: SessionLength | null;
  warmUp: { itemId: string; takeId: number }[];
  blocks: BlockRecord[];
  /** Counts toward the week: the first block (or the whole baseline) was done. */
  counted: boolean;
  /** The cue shown at the Wrap, for next time. */
  nextCue?: Cue;
}

export interface ProfileRow {
  id: 'owner';
  weeklyTarget: number;
  lastCue: Cue;
}

export class CoachDatabase extends Dexie {
  takes!: EntityTable<TakeRow, 'id'>;
  audio!: EntityTable<AudioRow, 'id'>;
  sessions!: EntityTable<SessionRow, 'id'>;
  profile!: EntityTable<ProfileRow, 'id'>;

  constructor(name: string) {
    super(name);
    this.version(1).stores({ takes: '++id, createdAt, kind', audio: '++id' });
    this.version(2).stores({ takes: '++id, createdAt, kind, sessionId', sessions: '++id, startedAt', profile: 'id' });
  }
}

const open = new Map<string, CoachDatabase>();

export function database(name = 'pronunciation-coach'): CoachDatabase {
  let db = open.get(name);
  if (!db) {
    db = new CoachDatabase(name);
    open.set(name, db);
  }
  return db;
}
