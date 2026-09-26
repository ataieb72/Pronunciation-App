import { useState, type SubmitEvent } from 'react';
import {
  clearAzureSettings,
  loadAzureSettings,
  maskKey,
  parseAzureSettings,
  saveAzureSettings,
  type AzureSettings,
} from '../azureSettings';

const PROBLEM_MESSAGES = {
  key: 'That does not look like an Azure key. Copy KEY 1 from the Keys and Endpoint page and paste it again.',
  region: 'Check the region. Use the Location/Region value from the Keys and Endpoint page, for example uksouth.',
} as const;

const STORAGE_MESSAGE = 'This phone could not store the key. Check that Chrome allows site data for this app, then try again.';

export function AzureSetup() {
  const [saved, setSaved] = useState<AzureSettings | null>(loadAzureSettings);
  const [key, setKey] = useState('');
  const [region, setRegion] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  function onSave(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseAzureSettings({ key, region });
    if (!parsed.ok) {
      setMessage(PROBLEM_MESSAGES[parsed.problem]);
      return;
    }
    if (!saveAzureSettings(parsed.settings)) {
      setMessage(STORAGE_MESSAGE);
      return;
    }
    setSaved(parsed.settings);
    setKey('');
    setRegion('');
    setMessage(null);
  }

  function onRemove() {
    if (!window.confirm('Remove the Azure key from this phone?')) return;
    clearAzureSettings();
    setSaved(null);
  }

  if (saved !== null) {
    return (
      <section aria-labelledby="azure-title" className="card">
        <h2 id="azure-title">Azure key saved ✓</h2>
        <p>
          Key ending in {maskKey(saved.key)} · region {saved.region}
        </p>
        <p>The key stays on this phone. The app sends it only to Azure.</p>
        <p>
          <a href="#/spike">Run the phone test</a>
        </p>
        <button type="button" className="secondary" onClick={onRemove}>
          Remove the key from this phone
        </button>
      </section>
    );
  }

  return (
    <section aria-labelledby="azure-title" className="card">
      <h2 id="azure-title">Connect to Azure</h2>
      <p>Paste your Azure Speech key and type its region. You do this once. Both stay on this phone.</p>
      <form onSubmit={onSave}>
        <label htmlFor="azure-key">Azure key</label>
        <input
          id="azure-key"
          type="password"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
          }}
          maxLength={200}
        />
        <label htmlFor="azure-region">Region</label>
        <input
          id="azure-region"
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="uksouth"
          value={region}
          onChange={(e) => {
            setRegion(e.target.value);
          }}
          maxLength={64}
        />
        {message !== null && (
          <p role="alert" className="alert">
            {message}
          </p>
        )}
        <button type="submit" disabled={key.trim() === '' || region.trim() === ''}>
          Save on this phone
        </button>
      </form>
    </section>
  );
}
