import { lazy, Suspense, useEffect, useState } from 'react';
import { AzureSetup } from './components/AzureSetup';

// Loaded on demand: the recorder brings the audio code and the take database.
const RecordScreen = lazy(() => import('./record/RecordScreen').then((m) => ({ default: m.RecordScreen })));

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
      <section className="card" aria-labelledby="record-title">
        <h2 id="record-title">Record and replay</h2>
        <p>Record a sentence or a short talk, replay it, and see test readings. Practice sessions come next.</p>
        <p>
          <a href="#/record">Open the recorder</a>
        </p>
      </section>
      <AzureSetup />
    </main>
  );
}
