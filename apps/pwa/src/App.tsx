import type { Language, SessionLength } from '@pc/core';
import { lazy, Suspense, useEffect, useState } from 'react';
import { AzureSetup } from './components/AzureSetup';
import { TodayScreen } from './today/TodayScreen';

// Loaded on demand: the recorder and the session bring the audio code.
const RecordScreen = lazy(() => import('./record/RecordScreen').then((m) => ({ default: m.RecordScreen })));
const SessionScreen = lazy(() => import('./session/SessionScreen').then((m) => ({ default: m.SessionScreen })));

/** `#/session/<5 or 10>/<en or fr>` */
function sessionRoute(hash: string): { length: SessionLength; language: Language } | null {
  const match = /^#\/session\/(5|10)\/(en|fr)$/.exec(hash);
  if (!match) return null;
  return { length: match[1] === '5' ? 5 : 10, language: match[2] === 'fr' ? 'fr' : 'en' };
}

// Pages use the URL hash: GitHub Pages has no fallback for deep links, and the hash never reaches the host.
function useHashPage(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener('hashchange', onChange);
    return () => {
      window.removeEventListener('hashchange', onChange);
    };
  }, []);
  return hash;
}

export function App() {
  const page = useHashPage();

  const session = sessionRoute(page);
  if (session) {
    return (
      <Suspense fallback={<p className="app">Loading the session…</p>}>
        <SessionScreen key={page} language={session.language} length={session.length} />
      </Suspense>
    );
  }

  if (page === '#/record') {
    return (
      <Suspense fallback={<p className="app">Loading the recorder…</p>}>
        <RecordScreen />
      </Suspense>
    );
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Pronunciation Coach</h1>
      </header>
      <TodayScreen />
      <section className="card" aria-labelledby="record-title">
        <h2 id="record-title">Record and replay</h2>
        <p>A test tool: record a sentence or a short talk, replay it, see test readings, and download all your takes as a ZIP file.</p>
        <p>
          <a href="#/record">Open the recorder</a>
        </p>
      </section>
      <AzureSetup />
    </main>
  );
}
