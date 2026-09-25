import { HealthBadge } from './components/HealthBadge';
import { PairScreen } from './components/PairScreen';

export function App() {
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
