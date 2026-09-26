import { clippedRatio, encodeWav, floatToPcm16, peakDbfs, resample, rmsDbfs } from '@pc/dsp';
import { useRef, useState } from 'react';
import { loadAzureSettings, redactKey } from '../azureSettings';
import { assess, transcribeContinuous, type Language } from './azure';
import { startRecording, type ActiveRecording, type MicInfo } from './capture';
import { buildReport, latencyStats, networkLabel, type Attempt, type MicSource } from './report';
import { summarizeAzureJson } from './summary';

const SENTENCES: Record<Language, string[]> = {
  'en-US': ['I asked her to help me with the world map.', 'The ship left the harbour at eight.', 'Please text me when you get home.'],
  'fr-FR': ['Le ministre a pris la table du fond.', 'Je voudrais un café, s’il vous plaît.', 'Il faut prendre le train de huit heures.'],
};
const STORAGE_KEY = 'pc.spike.attempts';
const JSON_KEPT_PER_LANGUAGE = 3;

function loadAttempts(): Attempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? [] : (JSON.parse(raw) as Attempt[]);
  } catch {
    return [];
  }
}

function saveAttempts(attempts: readonly Attempt[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  } catch {
    // Storage full or blocked: the report download still works for this visit.
  }
}

function download(name: string, data: BlobPart, type: string): void {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1_000);
}

const ms = (v: number | null) => (v === null ? '—' : `${String(Math.round(v))} ms`);

export function SpikePage() {
  const [azure] = useState(loadAzureSettings);
  const [mic, setMic] = useState<MicInfo | null>(null);
  const [micSource, setMicSource] = useState<MicSource>('phone');
  const [language, setLanguage] = useState<Language>('en-US');
  const [sentence, setSentence] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>(loadAttempts);
  const [status, setStatus] = useState('Ready.');
  const [busy, setBusy] = useState<'idle' | 'recording' | 'scoring'>('idle');
  const [lastWav, setLastWav] = useState<ArrayBuffer | null>(null);
  const [recordingMode, setRecordingMode] = useState<Attempt['mode'] | null>(null);
  const active = useRef<{ recording: ActiveRecording; mode: Attempt['mode'] } | null>(null);

  const referenceText = SENTENCES[language][sentence] ?? '';

  function record(attempt: Attempt) {
    setAttempts((prev) => {
      const next = [...prev, attempt];
      saveAttempts(next);
      return next;
    });
  }

  async function checkMic() {
    setStatus('Opening the microphone…');
    try {
      const rec = await startRecording(1);
      setMic(rec.mic);
      await rec.stop();
      setStatus('Microphone checked.');
    } catch (e) {
      setStatus(`Microphone error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function start(mode: Attempt['mode']) {
    if (azure === null) return;
    try {
      const recording = await startRecording(mode === 'assess' ? 15 : 60);
      setMic(recording.mic);
      active.current = { recording, mode };
      setRecordingMode(mode);
      setBusy('recording');
      setStatus(mode === 'assess' ? 'Recording… say the sentence, then tap Stop.' : 'Recording… talk for up to 60 seconds, then tap Stop.');
    } catch (e) {
      setStatus(`Microphone error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function stop() {
    const current = active.current;
    if (current === null || azure === null) return;
    active.current = null;
    setRecordingMode(null);
    setBusy('scoring');
    setStatus('Scoring…');
    const recording = await current.recording.stop();
    const t0 = performance.now();
    const samples16k = resample(recording.samples, recording.sampleRate, 16_000);
    const resampleMs = performance.now() - t0;
    const pcm16 = floatToPcm16(samples16k);
    setLastWav(encodeWav(samples16k, 16_000));

    const keepJson = attempts.filter((a) => a.language === language && a.azureJson !== null).length < JSON_KEPT_PER_LANGUAGE;
    const base = {
      n: attempts.length + 1,
      at: new Date().toISOString(),
      mode: current.mode,
      language,
      referenceText: current.mode === 'assess' ? referenceText : '',
      network: networkLabel(),
      micSource,
      captureMs: recording.durationMs,
      peakDbfs: peakDbfs(recording.samples),
      rmsDbfs: rmsDbfs(recording.samples),
      clippedRatio: clippedRatio(recording.samples),
      resampleMs,
    };

    try {
      if (current.mode === 'assess') {
        const result = await assess({ azure, language, referenceText, pcm16 });
        const summary = summarizeAzureJson(result.json);
        record({ ...base, latencyMs: result.latencyMs, reason: result.reason, summary, transcript: summary?.text ?? null, error: null, azureJson: keepJson ? result.json : null });
        setStatus(`Scored in ${ms(result.latencyMs)} (${result.reason}).`);
      } else {
        const result = await transcribeContinuous({ azure, language, pcm16 });
        record({ ...base, latencyMs: result.latencyMs, reason: 'Continuous', summary: null, transcript: result.texts.join(' '), error: null, azureJson: keepJson ? JSON.stringify(result.json) : null });
        setStatus(`Transcribed in ${ms(result.latencyMs)}.`);
      }
    } catch (e) {
      // The report goes to other people, so the key must never ride along in an error message.
      const message = redactKey(e instanceof Error ? e.message : String(e), azure.key);
      record({ ...base, latencyMs: null, reason: null, summary: null, transcript: null, error: message, azureJson: null });
      // A browser cannot see why a WebSocket was refused, so a wrong key also shows as ConnectionFailure.
      const hint = /AuthenticationFailure|ConnectionFailure/.test(message)
        ? ' Check your internet. If it works, check the key and region on the start page.'
        : '';
      setStatus(`Error: ${message}${hint}`);
    }
    setBusy('idle');
  }

  if (azure === null) {
    return (
      <main className="app">
        <h1>Phone test</h1>
        <p className="card">
          Add your Azure key first. <a href="#/">Go to the start page</a>.
        </p>
      </main>
    );
  }

  const stats = latencyStats(attempts);
  const last = attempts.at(-1);

  return (
    <main className="app spike">
      <p>
        <a href="#/">← Start page</a>
      </p>
      <h1>Phone test</h1>
      <p>This page checks the microphone and Azure scoring on this phone. It is a test page, not practice.</p>

      <section className="card">
        <h2>1. Microphone</h2>
        <button type="button" className="secondary" onClick={() => void checkMic()} disabled={busy !== 'idle'}>
          Check microphone
        </button>
        {mic !== null && (
          <table>
            <tbody>
              <tr><th>Device</th><td>{mic.label || '—'}</td></tr>
              <tr><th>Sample rate</th><td>{mic.contextSampleRate} Hz</td></tr>
              <tr><th>Echo cancellation</th><td>{String(mic.applied.echoCancellation)}</td></tr>
              <tr><th>Noise suppression</th><td>{String(mic.applied.noiseSuppression)}</td></tr>
              <tr><th>Auto gain</th><td>{String(mic.applied.autoGainControl)}</td></tr>
            </tbody>
          </table>
        )}
        <fieldset>
          <legend>Microphone in use</legend>
          {(['phone', 'wired', 'bluetooth'] as const).map((s) => (
            <label key={s} className="inline">
              <input type="radio" name="mic" checked={micSource === s} onChange={() => { setMicSource(s); }} />
              {s === 'phone' ? 'Phone' : s === 'wired' ? 'Wired earbuds' : 'Bluetooth earbuds'}
            </label>
          ))}
        </fieldset>
      </section>

      <section className="card">
        <h2>2. Record and score</h2>
        <p>Do 50 attempts: about 25 on Wi-Fi and 25 on mobile data.</p>
        <label htmlFor="lang">Language</label>
        <select id="lang" value={language} onChange={(e) => { setLanguage(e.target.value as Language); setSentence(0); }} disabled={busy !== 'idle'}>
          <option value="en-US">English (en-US)</option>
          <option value="fr-FR">French (fr-FR)</option>
        </select>
        <label htmlFor="sentence">Sentence</label>
        <select id="sentence" value={sentence} onChange={(e) => { setSentence(Number(e.target.value)); }} disabled={busy !== 'idle'}>
          {SENTENCES[language].map((s, i) => (
            <option key={s} value={i}>{s}</option>
          ))}
        </select>
        <p className="reference">“{referenceText}”</p>
        {recordingMode === 'assess' ? (
          <button type="button" onClick={() => void stop()}>Stop</button>
        ) : (
          <button type="button" onClick={() => void start('assess')} disabled={busy !== 'idle'}>Record</button>
        )}
      </section>

      <section className="card">
        <h2>3. 60-second round</h2>
        <p>Talk freely for up to 60 seconds. This checks long recordings.</p>
        {recordingMode === 'continuous' ? (
          <button type="button" onClick={() => void stop()}>Stop</button>
        ) : (
          <button type="button" className="secondary" onClick={() => void start('continuous')} disabled={busy !== 'idle'}>Start 60-second round</button>
        )}
      </section>

      <p role="status" className="status">{status}</p>

      {last !== undefined && (
        <section className="card">
          <h2>Last attempt</h2>
          <table>
            <tbody>
              <tr><th>Latency</th><td>{ms(last.latencyMs)}</td></tr>
              <tr><th>Result</th><td>{last.error ?? last.reason ?? '—'}</td></tr>
              <tr><th>Heard</th><td>{last.transcript ?? '—'}</td></tr>
              {last.summary !== null && (
                <tr><th>Scores</th><td>acc {last.summary.scores.accuracy ?? '—'} · flu {last.summary.scores.fluency ?? '—'} · pros {last.summary.scores.prosody ?? '—'} · phoneme names {last.summary.phonemesNamed ? 'yes' : 'no'}</td></tr>
              )}
              <tr><th>Peak / RMS</th><td>{last.peakDbfs.toFixed(1)} / {last.rmsDbfs.toFixed(1)} dBFS</td></tr>
            </tbody>
          </table>
        </section>
      )}

      <section className="card">
        <h2>4. Report</h2>
        <p>
          {stats.count} scored attempts · median {ms(stats.medianMs)} · 90th percentile {ms(stats.p90Ms)}
        </p>
        <button type="button" onClick={() => { download(`phone-test-${new Date().toISOString().slice(0, 19)}.json`, JSON.stringify(buildReport(mic, attempts), null, 2), 'application/json'); }} disabled={attempts.length === 0}>
          Download report (JSON)
        </button>
        <button type="button" className="secondary" onClick={() => { if (lastWav !== null) download('last-recording.wav', lastWav, 'audio/wav'); }} disabled={lastWav === null}>
          Download last recording (WAV)
        </button>
        <button type="button" className="secondary" onClick={() => { if (window.confirm('Delete all test attempts on this phone?')) { setAttempts([]); saveAttempts([]); } }} disabled={attempts.length === 0 || busy !== 'idle'}>
          Clear attempts
        </button>
      </section>
    </main>
  );
}
