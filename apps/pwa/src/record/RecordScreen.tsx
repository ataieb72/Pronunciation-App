import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { openMicrophone, type AudioSource } from '../audio/microphone';
import { createTakeController, type ControllerEnv, type TakeController } from '../audio/takeController';
import type { StopReason, TakeKind } from '../audio/takeRecorder';
import { openTakeStore, type TakeRow, type TakeStore } from '../audio/takeStore';
import type { Readings } from './analysis';
import { createAnalyzer, type Analyze } from './analyzer';
import { distanceCheck, type DistanceCheck } from './distance';
import { DISCARD_TEXT, distanceText, MIC_ERROR_TEXT, retakeText, stopText } from './messages';
import { exportTakes } from './exportTakes';
import { SENTENCES, TALK_PROMPTS, VOWEL_PROMPTS, type Language } from './prompts';

export interface RecordDeps {
  openSource(): Promise<AudioSource>;
  store: TakeStore;
  analyze: Analyze;
  env: ControllerEnv;
}

function defaultDeps(): RecordDeps {
  return {
    openSource: openMicrophone,
    store: openTakeStore(),
    analyze: createAnalyzer(),
    env: { document, wakeLock: 'wakeLock' in navigator ? navigator.wakeLock : undefined },
  };
}

type Phase = 'idle' | 'opening' | 'recording' | 'analyzing';
type Mode = 'sentence' | 'vowel' | 'talk';
const KIND: Record<Mode, TakeKind> = { sentence: 'sentence', vowel: 'word', talk: 'talk' };

interface Result {
  readonly takeId: number;
  readonly stopReason: StopReason;
  readonly readings: Readings;
  readonly distance: DistanceCheck | null;
}

interface Session {
  source: AudioSource | null;
  controller: TakeController | null;
  takesThisVisit: number;
}

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function saveFile(name: string, data: BlobPart, type: string): void {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.hidden = true;
  document.body.append(a);
  a.click();
  // Android Chrome may read the file late (after a prompt), so keep it for a minute.
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 60_000);
}

function pausesText(count: number, totalS: number): string {
  if (count === 0) return 'No pauses';
  return `${String(count)} pause${count === 1 ? '' : 's'}, ${totalS.toFixed(1)} s in total`;
}

function ReadingsTable({ readings }: { readings: Readings }) {
  const rows: [string, string, string][] = [
    [
      'Loudness while speaking',
      readings.speechLevelDbfs === null ? '—' : `${readings.speechLevelDbfs.toFixed(1)} dBFS`,
      'Compare only with your own takes: same phone, same distance.',
    ],
    [
      'Pitch range',
      readings.pitch ? `${readings.pitch.rangeSemitones.toFixed(1)} semitones (typical pitch ${String(Math.round(readings.pitch.medianHz))} Hz)` : '—',
      'How much your pitch moved (10th to 90th percentile).',
    ],
    ['Pauses', pausesText(readings.pauses.count, readings.pauses.totalS), 'Silences of 250 ms or more between words.'],
    [
      'Speaking rate',
      readings.articulationRate === null ? '—' : `${readings.articulationRate.toFixed(1)} syllables per second`,
      'Counted from the sound, with pauses left out.',
    ],
    [
      'Fade at phrase ends',
      readings.fadeDb === null ? 'Not enough syllables' : `${readings.fadeDb.toFixed(1)} dB (experiment)`,
      'Below zero: the last syllable of a phrase was quieter than the others.',
    ],
  ];
  return (
    <>
      <h3>Test readings (not scores)</h3>
      <table className="readings">
        <tbody>
          {rows.map(([name, value, help]) => (
            <tr key={name}>
              <th scope="row">{name}</th>
              <td>
                <span>{value}</span>
                <br />
                <small>{help}</small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function RecordScreen({ deps: given }: { deps?: RecordDeps }) {
  const deps = useMemo(() => given ?? defaultDeps(), [given]);
  const session = useRef<Session>({ source: null, controller: null, takesThisVisit: 0 });
  const [mode, setMode] = useState<Mode>('sentence');
  const [language, setLanguage] = useState<Language>('en');
  const [sentence, setSentence] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [takes, setTakes] = useState<TakeRow[]>([]);

  const refresh = useCallback(async () => {
    try {
      setTakes(await deps.store.list());
    } catch {
      setTakes([]);
    }
  }, [deps]);

  useEffect(() => {
    let closed = false;
    deps.store.list().then(
      (rows) => {
        if (!closed) setTakes(rows);
      },
      () => {
        if (!closed) setTakes([]);
      },
    );
    return () => {
      closed = true;
    };
  }, [deps]);

  useEffect(() => {
    const current = session.current; // one object for the screen's lifetime
    return () => {
      current.controller?.stop();
      void current.source?.close();
      current.source = null;
      current.controller = null;
    };
  }, []);

  const prompt = mode === 'sentence' ? (SENTENCES[language][sentence] ?? '') : mode === 'vowel' ? VOWEL_PROMPTS[language] : TALK_PROMPTS[language];
  const busy = phase !== 'idle';

  async function onRecord() {
    setError(null);
    setStatus(null);
    setResult(null);
    const s = session.current;
    if (!s.source || !s.controller) {
      setPhase('opening');
      try {
        s.source = await deps.openSource();
        s.controller = createTakeController(s.source, deps.env);
      } catch {
        setPhase('idle');
        setError(MIC_ERROR_TEXT);
        return;
      }
    }
    const { source, controller } = s;
    setPhase('recording');
    setElapsed(0);
    const outcome = await controller.start(KIND[mode], (p) => {
      setElapsed(p.elapsedS);
    });
    if (outcome.status === 'discarded') {
      setPhase('idle');
      setStatus(DISCARD_TEXT);
      return;
    }

    setPhase('analyzing');
    setStatus(stopText(outcome.take.stopReason));
    const earlierLevels = (await deps.store.list())
      .reverse()
      .flatMap((row) => (row.readings?.quality.ok && row.readings.speechLevelDbfs !== null ? [row.readings.speechLevelDbfs] : []));
    const takeId = await deps.store.save(outcome.take, { mic: source.mic, device: navigator.userAgent, language, prompt });
    try {
      const readings = await deps.analyze(outcome.take.samples, outcome.take.sampleRate);
      await deps.store.setReadings(takeId, readings);
      // The first take of a visit is the warm-up: it carries the distance check.
      const distance = s.takesThisVisit === 0 && readings.quality.ok ? distanceCheck(readings.speechLevelDbfs, earlierLevels) : null;
      s.takesThisVisit++;
      setResult({ takeId, stopReason: outcome.take.stopReason, readings, distance });
    } catch {
      setError('The app could not analyse this take. It is saved; try another one.');
    }
    setPhase('idle');
    await refresh();
  }

  async function replay(takeId: number) {
    const wav = await deps.store.loadWav(takeId);
    if (!wav) return;
    const url = URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));
    const audio = new Audio(url);
    audio.onended = () => {
      URL.revokeObjectURL(url);
    };
    await audio.play().catch(() => {
      setError('The phone could not play this take.');
    });
  }

  async function download(row: Pick<TakeRow, 'id' | 'createdAt' | 'kind'>) {
    const wav = await deps.store.loadWav(row.id);
    if (wav) saveFile(`take-${row.createdAt.slice(0, 19).replaceAll(':', '-')}-${row.kind}.wav`, wav, 'audio/wav');
  }

  async function downloadAll() {
    setError(null);
    const { zip, count } = await exportTakes(deps.store);
    saveFile(`pronunciation-coach-takes-${new Date().toISOString().slice(0, 10)}.zip`, zip, 'application/zip');
    setStatus(`Downloaded: ${String(count)} take${count === 1 ? '' : 's'} in the file.`);
  }

  async function remove(row: TakeRow) {
    if (!window.confirm('Delete this take from the phone?')) return;
    await deps.store.remove(row.id);
    if (result?.takeId === row.id) setResult(null);
    await refresh();
  }

  const resultRow = result ? takes.find((t) => t.id === result.takeId) : undefined;
  const advice = result ? distanceText(result.distance) : null;

  return (
    <main className="app record">
      <p>
        <a href="#/">← Start page</a>
      </p>
      <h1>Record and replay</h1>
      <p>Test the recorder. It stops by itself when you finish speaking.</p>

      <section className="card">
        <fieldset disabled={busy}>
          <legend>What to record</legend>
          <label className="inline">
            <input type="radio" name="mode" checked={mode === 'sentence'} onChange={() => { setMode('sentence'); }} />
            A sentence (up to 15 s)
          </label>
          <label className="inline">
            <input type="radio" name="mode" checked={mode === 'vowel'} onChange={() => { setMode('vowel'); }} />
            A held vowel (about 2 s)
          </label>
          <label className="inline">
            <input type="radio" name="mode" checked={mode === 'talk'} onChange={() => { setMode('talk'); }} />
            A short talk (up to 60 s)
          </label>
        </fieldset>
        <label htmlFor="language">Language</label>
        <select id="language" value={language} disabled={busy} onChange={(e) => { setLanguage(e.target.value as Language); setSentence(0); }}>
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
        <p className="reference" lang={language}>
          {mode === 'sentence' ? `“${prompt}”` : prompt}
        </p>
        {mode === 'sentence' && (
          <button type="button" className="secondary" disabled={busy} onClick={() => { setSentence((i) => (i + 1) % SENTENCES[language].length); }}>
            Another sentence
          </button>
        )}
        {phase === 'recording' ? (
          <>
            <p>Recording… {elapsed.toFixed(0)} s</p>
            <button type="button" onClick={() => session.current.controller?.stop()}>
              Stop
            </button>
          </>
        ) : (
          <button type="button" disabled={busy} onClick={() => void onRecord()}>
            {phase === 'opening' ? 'Opening the microphone…' : phase === 'analyzing' ? 'Checking the recording…' : 'Record'}
          </button>
        )}
      </section>

      {status !== null && (
        <p role="status" className="status">
          {status}
        </p>
      )}
      {error !== null && (
        <p role="alert" className="alert">
          {error}
        </p>
      )}

      {result && (
        <section className="card" aria-labelledby="result-title">
          <h2 id="result-title">{result.readings.quality.ok ? 'Good recording' : 'Please record again'}</h2>
          {!result.readings.quality.ok && (
            <ul>
              {result.readings.quality.reasons.map((reason) => (
                <li key={reason}>{retakeText(reason)}</li>
              ))}
            </ul>
          )}
          {advice !== null && <p className="note">{advice}</p>}
          {result.readings.quality.ok && <ReadingsTable readings={result.readings} />}
          <button type="button" className="secondary" onClick={() => void replay(result.takeId)}>
            Replay
          </button>
          {resultRow && (
            <button type="button" className="secondary" onClick={() => void download(resultRow)}>
              Download
            </button>
          )}
        </section>
      )}

      {takes.length > 0 && (
        <section className="card" aria-labelledby="takes-title">
          <h2 id="takes-title">Your last takes</h2>
          {takes.length > 5 && <p>The last 5 of {takes.length}.</p>}
          <ul className="takes">
            {takes.slice(0, 5).map((row) => (
              <li key={row.id}>
                <span>
                  {time(row.createdAt)} · {row.kind === 'word' ? 'vowel' : row.kind} · {row.durationS.toFixed(1)} s
                  {row.readings ? (row.readings.quality.ok ? ' · good' : ' · record again') : ''}
                </span>
                <span className="row-actions">
                  <button type="button" className="secondary small" aria-label={`Replay take from ${time(row.createdAt)}`} onClick={() => void replay(row.id)}>
                    Replay
                  </button>
                  <button type="button" className="secondary small" aria-label={`Download take from ${time(row.createdAt)}`} onClick={() => void download(row)}>
                    Download
                  </button>
                  <button type="button" className="secondary small" aria-label={`Delete take from ${time(row.createdAt)}`} onClick={() => void remove(row)}>
                    Delete
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <button type="button" className="secondary" onClick={() => void downloadAll()}>
            Download all takes (ZIP)
          </button>
        </section>
      )}
    </main>
  );
}
