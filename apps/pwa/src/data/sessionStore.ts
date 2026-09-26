/** Practice sessions and the owner's settings, on the phone (docs/database-schema.md §2). */
import { clampTarget, WEEKLY_TARGET, type Language, type SessionLength } from '@pc/core';
import { database, type ProfileRow, type SessionKind, type SessionRow } from './database';

export type Profile = Omit<ProfileRow, 'id'>;

export const DEFAULT_PROFILE: Profile = { weeklyTarget: WEEKLY_TARGET.default, lastCue: 'jaw' };

export interface SessionStore {
  start(session: { language: Language; kind: SessionKind; length: SessionLength | null }): Promise<number>;
  update(id: number, patch: Partial<Omit<SessionRow, 'id'>>): Promise<void>;
  get(id: number): Promise<SessionRow | undefined>;
  /** Newest first. */
  list(): Promise<SessionRow[]>;
  profile(): Promise<Profile>;
  saveProfile(patch: Partial<Profile>): Promise<void>;
}

export function openSessionStore(name?: string): SessionStore {
  const db = database(name);

  const profile = async (): Promise<Profile> => {
    const row = await db.profile.get('owner');
    return row ? { weeklyTarget: row.weeklyTarget, lastCue: row.lastCue } : { ...DEFAULT_PROFILE };
  };

  return {
    async start({ language, kind, length }) {
      return db.sessions.add({ startedAt: new Date().toISOString(), language, kind, length, warmUp: [], blocks: [], counted: false });
    },
    async update(id, patch) {
      await db.sessions.update(id, patch);
    },
    async get(id) {
      return db.sessions.get(id);
    },
    async list() {
      return db.sessions.orderBy('id').reverse().toArray();
    },
    profile,
    async saveProfile(patch) {
      const merged = { ...(await profile()), ...patch };
      await db.profile.put({ id: 'owner', weeklyTarget: clampTarget(merged.weeklyTarget), lastCue: merged.lastCue });
    },
  };
}
