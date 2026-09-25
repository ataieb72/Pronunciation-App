import { useState, type SubmitEvent } from 'react';
import { pair, unpair, type PairFailure } from '../api';
import { clearDeviceToken, loadDeviceToken, saveDeviceToken } from '../deviceToken';

function failureMessage(reason: PairFailure, retryAfter?: number): string {
  switch (reason) {
    case 'invalid_code':
      return 'That code is not right. Check it and try again.';
    case 'rate_limited': {
      const minutes = Math.max(1, Math.ceil((retryAfter ?? 3600) / 60));
      return `Too many wrong codes. Try again in ${String(minutes)} minute${minutes === 1 ? '' : 's'}.`;
    }
    case 'device_limit':
      return 'The maximum number of phones are already paired. Unpair one first.';
    case 'pairing_disabled':
      return 'Pairing is off on the server. Set a PAIRING_CODE secret of 12 or more characters.';
    case 'network':
      return 'No connection. Check your internet and try again.';
    case 'bad_request':
    case 'server':
      return 'Something went wrong. Try again.';
  }
}

export function PairScreen() {
  const [token, setToken] = useState<string | null>(loadDeviceToken);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onPair(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const result = await pair(code.trim());
    setBusy(false);
    if (result.ok) {
      saveDeviceToken(result.deviceToken);
      setToken(result.deviceToken);
      setCode('');
    } else {
      setMessage(failureMessage(result.reason, result.retryAfter));
    }
  }

  async function onUnpair() {
    if (token === null) return;
    setBusy(true);
    setMessage(null);
    const done = await unpair(token);
    setBusy(false);
    if (done) {
      clearDeviceToken();
      setToken(null);
    } else {
      setMessage(failureMessage('network'));
    }
  }

  if (token !== null) {
    return (
      <section aria-labelledby="pair-title" className="card">
        <h2 id="pair-title">Paired ✓</h2>
        <p>This phone can now use speech scoring.</p>
        <p>
          <a href="/spike">Run the phone test</a>
        </p>
        {message !== null && (
          <p role="alert" className="alert">
            {message}
          </p>
        )}
        <button type="button" className="secondary" onClick={() => void onUnpair()} disabled={busy}>
          {busy ? 'Unpairing…' : 'Unpair this phone'}
        </button>
      </section>
    );
  }

  return (
    <section aria-labelledby="pair-title" className="card">
      <h2 id="pair-title">Pair this phone</h2>
      <p>Enter the pairing code you set on the server. You do this once.</p>
      <form onSubmit={(e) => void onPair(e)}>
        <label htmlFor="pairing-code">Pairing code</label>
        <input
          id="pairing-code"
          type="password"
          autoComplete="off"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
          }}
          maxLength={128}
        />
        {message !== null && (
          <p role="alert" className="alert">
            {message}
          </p>
        )}
        <button type="submit" disabled={busy || code.trim() === ''}>
          {busy ? 'Pairing…' : 'Pair this phone'}
        </button>
      </form>
    </section>
  );
}
