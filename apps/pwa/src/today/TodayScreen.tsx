/**
 * Today (product-design §1): the language of the day, Start (10 minutes, or 5), the week's dots
 * and the weekly target. The first session in each language records its baseline.
 */
import { languageOfTheDay, WEEKLY_TARGET, weekProgress, type Language } from '@pc/core';
import { useEffect, useMemo, useState } from 'react';
import { WeekDots } from '../components/WeekDots';
import type { SessionRow } from '../data/database';
import { openSessionStore, type Profile, type SessionStore } from '../data/sessionStore';
import { hasBaseline, sessionLogs } from '../session/history';
import { LANGUAGE_NAME } from '../session/labels';

export interface TodayDeps {
  sessions: SessionStore;
  now?: () => Date;
}

const TARGETS = Array.from({ length: WEEKLY_TARGET.max - WEEKLY_TARGET.min + 1 }, (_, i) => WEEKLY_TARGET.min + i);

export function TodayScreen({ deps: given }: { deps?: TodayDeps }) {
  const deps = useMemo(() => given ?? { sessions: openSessionStore() }, [given]);
  const now = useMemo(() => (deps.now ?? (() => new Date()))(), [deps]);
  const [loaded, setLoaded] = useState<{ sessions: SessionRow[]; profile: Profile } | null>(null);
  const [chosen, setChosen] = useState<Language | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let closed = false;
    Promise.all([deps.sessions.list(), deps.sessions.profile()]).then(
      ([sessions, profile]) => {
        if (!closed) setLoaded({ sessions, profile });
      },
      () => {
        if (!closed) setFailed(true);
      },
    );
    return () => {
      closed = true;
    };
  }, [deps]);

  if (failed) {
    return (
      <p role="alert" className="alert">
        The app could not read its saved sessions. Close it and open it again.
      </p>
    );
  }
  if (!loaded) return <p>Loading today…</p>;

  const { sessions, profile } = loaded;
  const logs = sessionLogs(sessions);
  const language = chosen ?? languageOfTheDay(logs, now);
  const other: Language = language === 'en' ? 'fr' : 'en';
  const week = weekProgress(logs, now, profile.weeklyTarget);
  const ready = hasBaseline(sessions, language);

  async function changeTarget(value: number) {
    await deps.sessions.saveProfile({ weeklyTarget: value });
    setLoaded((current) => (current ? { ...current, profile: { ...current.profile, weeklyTarget: value } } : current));
  }

  return (
    <>
      <section className="card" aria-labelledby="today-title">
        <h2 id="today-title">Today</h2>
        <p>Language of the day: {LANGUAGE_NAME[language]}</p>
        {ready ? (
          <>
            <a className="button" href={`#/session/10/${language}`}>
              Start · 10 min
            </a>
            <a className="button secondary" href={`#/session/5/${language}`}>
              5 min
            </a>
          </>
        ) : (
          <>
            <p>First, record your {language === 'en' ? 'English' : 'French'} baseline: how you speak now, before any practice. About 4 minutes.</p>
            <a className="button" href={`#/session/10/${language}`}>
              Record baseline
            </a>
          </>
        )}
        <button
          type="button"
          className="secondary"
          onClick={() => {
            setChosen(other);
          }}
        >
          Switch to {LANGUAGE_NAME[other]}
        </button>
        <h3>This week</h3>
        <WeekDots week={week} />
        <label htmlFor="target">Practice days a week</label>
        <select id="target" value={profile.weeklyTarget} onChange={(e) => void changeTarget(Number(e.target.value))}>
          {TARGETS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </section>
    </>
  );
}
