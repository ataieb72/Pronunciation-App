import { vi } from 'vitest';
import type { SessionRow } from '../../src/data/database';
import { DEFAULT_PROFILE, type Profile, type SessionStore } from '../../src/data/sessionStore';
import type { Readings } from '../../src/record/analysis';
import type { SessionDeps } from '../../src/session/SessionScreen';
import { hush, join, MIC_RATE, syllables, withFloor } from '../audio/signals';
import { goodReadings, memoryStore, repeatingSource } from '../record/fakes';

/** A short take: enough speech to start, then enough silence to stop by itself. */
const shortTake = () => join(hush(0.2), withFloor(syllables(0.5)), hush(1, MIC_RATE, 3));

export function memorySessions(initial: Partial<SessionRow>[] = []): SessionStore & { rows: SessionRow[]; saved: Profile } {
  const rows: SessionRow[] = [];
  let nextId = 1;
  for (const row of initial) rows.push({ startedAt: new Date().toISOString(), language: 'en', kind: 'practice', length: 10, warmUp: [], blocks: [], counted: true, ...row, id: nextId++ });
  const store = {
    rows,
    saved: { ...DEFAULT_PROFILE },
    start(s: { language: SessionRow['language']; kind: SessionRow['kind']; length: SessionRow['length'] }) {
      const id = nextId++;
      rows.push({ id, startedAt: new Date().toISOString(), ...s, warmUp: [], blocks: [], counted: false });
      return Promise.resolve(id);
    },
    update(id: number, patch: Partial<Omit<SessionRow, 'id'>>) {
      const row = rows.find((r) => r.id === id);
      if (row) Object.assign(row, structuredClone(patch));
      return Promise.resolve();
    },
    get: (id: number) => Promise.resolve(rows.find((r) => r.id === id)),
    list: () => Promise.resolve([...rows].reverse()),
    profile: () => Promise.resolve({ ...store.saved }),
    saveProfile(patch: Partial<Profile>) {
      store.saved = { ...store.saved, ...patch };
      return Promise.resolve();
    },
  };
  return store;
}

export const baselineDone: Partial<SessionRow>[] = [
  { kind: 'baseline', language: 'en', length: null },
  { kind: 'baseline', language: 'fr', length: null },
];

export const badReadings: Readings = { ...goodReadings, quality: { ...goodReadings.quality, ok: false, reasons: ['too-quiet'] } };

export function level(db: number, fade = -3): Readings {
  return { ...goodReadings, speechLevelDbfs: db, fadeDb: fade };
}

function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** `readings` are used in order, one per take; the last one repeats. */
export function sessionDeps(options: { sessions?: Partial<SessionRow>[]; readings?: Readings[]; signal?: Float32Array } = {}) {
  const queue = [...(options.readings ?? [goodReadings])];
  const analyze = vi.fn(() => Promise.resolve((queue.length > 1 ? queue.shift() : queue[0]) ?? goodReadings));
  const deps = {
    openSource: () => Promise.resolve(repeatingSource(options.signal ?? shortTake())),
    takes: memoryStore(),
    sessions: memorySessions(options.sessions ?? baselineDone),
    analyze,
    env: { document },
    random: seeded(11),
  } satisfies SessionDeps;
  return deps;
}
