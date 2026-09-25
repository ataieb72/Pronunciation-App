import { useEffect, useState } from 'react';
import { checkHealth, type Health } from '../api';

export function HealthBadge() {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    let active = true;
    void checkHealth().then((h) => {
      if (active) setHealth(h);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <p className={`badge badge-${health ?? 'checking'}`} aria-live="polite">
      {health === null ? 'Server: checking…' : `Server: ${health}`}
    </p>
  );
}
