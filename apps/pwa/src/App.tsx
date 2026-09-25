import { lazy, Suspense } from 'react';
import { HealthBadge } from './components/HealthBadge';
import { PairScreen } from './components/PairScreen';

// R1 phone test page. Loaded on demand, so the Azure SDK never enters the main bundle.
const SpikePage = lazy(() => import('./spike/SpikePage').then((m) => ({ default: m.SpikePage })));

export function App() {
  if (window.location.pathname === '/spike') {
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
        <HealthBadge />
      </header>
      <PairScreen />
    </main>
  );
}
