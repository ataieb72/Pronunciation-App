import { lazy, Suspense, useEffect, useState } from 'react';
import { AzureSetup } from './components/AzureSetup';

// R1 phone test page. Loaded on demand, so the Azure SDK never enters the main bundle.
const SpikePage = lazy(() => import('./spike/SpikePage').then((m) => ({ default: m.SpikePage })));

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

  if (page === '#/spike') {
    return (
      <Suspense fallback={<p className="app">Loading the phone test…</p>}>
        <SpikePage />
      </Suspense>
    );
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Pronunciation Coach</h1>
      </header>
      <AzureSetup />
    </main>
  );
}
