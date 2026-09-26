/**
 * A practice session (product-design §1–3; R3 defaults in docs/backlog/epics/R3-clarity-core.md):
 * warm-up with the distance check, blocks of clear-speech pairs judged by the owner, one summary
 * per block, and a wrap with one cue for next time. The first session in a language records the
 * baseline instead: all sentences the usual way, then all "big and clear", with no feedback.
 */
import {
  CUE_TEXT,
  planSession,
  summarizeBlock,
  summaryLines,
  weekProgress,
  type Cue,
  type Language,
  type SessionLength,
  type SessionPlan,
  type WeekProgress,
} from '@pc/core';
import type { RetakeReason } from '@pc/dsp';
import { useEffect, useMemo, useRef, useState } from 'react';
import { openMicrophone, type AudioSource } from '../audio/microphone';
import { WeekDots } from '../components/WeekDots';
import { playWav } from '../audio/playback';
import { createTakeController, type ControllerEnv, type TakeController } from '../audio/takeController';
import { openTakeStore, type TakeStore } from '../audio/takeStore';
import type { BlockRecord, Judgement, SessionRow } from '../data/database';
import { openSessionStore, type Profile, type SessionStore } from '../data/sessionStore';
import type { Readings } from '../record/analysis';
import { createAnalyzer, type Analyze } from '../record/analyzer';
import { distanceCheck } from '../record/distance';
import { DISCARD_TEXT, distanceText, MIC_ERROR_TEXT, retakeText } from '../record/messages';
import { buildSteps, skipTo, type Step } from './flow';
import { LANGUAGE_NAME } from './labels';
import { featureHistory, hasBaseline, measuresOf, recentItemIds, sessionLogs } from './history';

export interface SessionDeps {
  openSource(): Promise<AudioSource>;
  takes: TakeStore;
  sessions: SessionStore;
  analyze: Analyze;
  env: ControllerEnv;
  random?: () => number;
}

function defaultDeps(): SessionDeps {
  return {
    openSource: openMicrophone,
    takes: openTakeStore(),
    sessions: openSessionStore(),
    analyze: createAnalyzer(),
    env: { document, wakeLock: 'wakeLock' in navigator ? navigator.wakeLock : undefined },
  };
}

type Phase = 'idle' | 'opening' | 'recording' | 'analyzing';

/** The parts of the session row this screen fills in. */
interface SessionData {
  warmUp: SessionRow['warmUp'];
  blocks: BlockRecord[];
  counted: boolean;
}

interface Setup {
  readonly plan: SessionPlan;
  readonly steps: readonly Step[];
  readonly profile: Profile;
  readonly past: readonly SessionRow[];
}

interface Wrap {
  readonly ended: boolean;
  readonly counted: boolean;
  readonly pairs: number;
  readonly nextCue: Cue;
  readonly week: WeekProgress;
}

const BASELINE_CLEAR = 'Now big and clear: open your jaw, give vowels their full shape, finish every ending.';

function takeHeading(step: Extract<Step, { kind: 'take' }>, baseline: boolean): string {
  const n = `${String(step.index + 1)} of ${String(step.of)}`;
  if (step.role === 'warm-up') return `Warm-up ${n}`;
  if (baseline) return step.role === 'usual' ? `Your usual way: ${n}` : `Big and clear: ${n}`;
  return `Pair ${n}: ${step.role === 'usual' ? 'your usual way' : 'big and clear'}`;
}

export function SessionScreen({ language, length, deps: given }: { language: Language; length: SessionLength; deps?: SessionDeps }) {
  const deps = useMemo(() => given ?? defaultDeps(), [given]);
  const audio = useRef<{ source: AudioSource | null; controller: TakeController | null }>({ source: null, controller: null });
  const readings = useRef(new Map<number, Readings>());
  const distanceDone = useRef(false);

  const [setup, setSetup] = useState<Setup | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [data, setData] = useState<SessionData>({ warmUp: [], blocks: [], counted: false });
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [retake, setRetake] = useState<readonly RetakeReason[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wrap, setWrap] = useState<Wrap | null>(null);

  useEffect(() => {
    let closed = false;
    Promise.all([deps.sessions.list(), deps.sessions.profile()]).then(
      ([past, profile]) => {
        if (closed) return;
        const plan = planSession({ language, length, hasBaseline: hasBaseline(past, language), recentIds: recentItemIds(past), ...(deps.random ? { random: deps.random } : {}) });
        setSetup({ plan, steps: buildSteps(plan), profile, past });
      },
      () => {
        if (!closed) setLoadError(true);
      },
    );
    return () => {
      closed = true;
    };
  }, [deps, language, length]);

  useEffect(() => {
    const current = audio.current; // one object for the screen's lifetime
    return () => {
      current.controller?.stop();
      void current.source?.close();
      current.source = null;
      current.controller = null;
    };
  }, []);

  if (loadError) {
    return (
      <main className="app">
        <p role="alert" className="alert">
          The app could not read its saved sessions. Close it and open it again.
        </p>
      </main>
    );
  }
  if (!setup) return <p className="app">Getting your session ready…</p>;

  const { plan, steps, profile, past } = setup;
  const baseline = plan.kind === 'baseline';
  const step = sessionId === null ? null : steps[stepIndex];
  const busy = phase !== 'idle';

  async function save(id: number, next: SessionData, extra: Partial<Omit<SessionRow, 'id'>> = {}) {
    setData(next);
    await deps.sessions.update(id, { ...next, ...extra });
  }

  async function begin() {
    const id = await deps.sessions.start({ language, kind: plan.kind, length: plan.kind === 'practice' ? length : null });
    const blocks: BlockRecord[] =
      plan.kind === 'practice'
        ? plan.blocks.map((items, b) => ({ cue: b === 0 ? profile.lastCue : null, pairs: items.map((item) => ({ itemId: item.id, usualTakeId: null, clearTakeId: null })) }))
        : [{ cue: null, pairs: plan.items.map((item) => ({ itemId: item.id, usualTakeId: null, clearTakeId: null })) }];
    setSessionId(id);
    await save(id, { warmUp: [], blocks, counted: false });
    setStepIndex(0);
  }

  /** Moves to a step; a summary step computes and stores the block summary, the wrap ends the session. */
  async function goTo(id: number, index: number, current: SessionData) {
    setRetake(null);
    setError(null);
    const target = steps[index];
    if (target?.kind === 'summary') {
      const next = structuredClone(current);
      const block = next.blocks[target.block];
      if (block) {
        const pairs = block.pairs.flatMap((p) =>
          p.usualTakeId !== null && p.clearTakeId !== null ? [{ usual: measuresOf(readings.current.get(p.usualTakeId)), clear: measuresOf(readings.current.get(p.clearTakeId)) }] : [],
        );
        block.summary = summarizeBlock(pairs, { previousCue: block.cue ?? profile.lastCue, history: featureHistory(past) });
        const following = next.blocks[target.block + 1];
        if (following) following.cue = block.summary.nextCue;
        next.counted = true;
      }
      await save(id, next);
      setStepIndex(index);
      return;
    }
    if (target === undefined || target.kind === 'wrap') {
      await finish(id, current, false);
      return;
    }
    setStepIndex(index);
  }

  async function finish(id: number, current: SessionData, ended: boolean) {
    const summaries = current.blocks.flatMap((b) => (b.summary ? [b.summary] : []));
    const nextCue = summaries.at(-1)?.nextCue ?? profile.lastCue;
    // The baseline counts when every step was reached with at least one take; practice counts after its first block.
    const recorded = current.blocks.some((b) => b.pairs.some((p) => p.usualTakeId !== null || p.clearTakeId !== null));
    const counted = baseline ? !ended && recorded : current.counted;
    const next = { ...current, counted };
    await save(id, next, { endedAt: new Date().toISOString(), ...(baseline ? {} : { nextCue }) });
    if (!baseline) await deps.sessions.saveProfile({ lastCue: nextCue });
    const all = await deps.sessions.list();
    const pairs = next.blocks.flatMap((b) => b.pairs).filter((p) => p.usualTakeId !== null && p.clearTakeId !== null).length;
    setWrap({ ended, counted, pairs, nextCue, week: weekProgress(sessionLogs(all), new Date(), profile.weeklyTarget) });
    setStepIndex(steps.length - 1);
  }

  async function record(id: number, current: Extract<Step, { kind: 'take' }>) {
    setError(null);
    setRetake(null);
    setNote(null);
    const a = audio.current;
    if (!a.source || !a.controller) {
      setPhase('opening');
      try {
        a.source = await deps.openSource();
        a.controller = createTakeController(a.source, deps.env);
      } catch {
        setPhase('idle');
        setError(MIC_ERROR_TEXT);
        return;
      }
    }
    const { source, controller } = a;
    setPhase('recording');
    setElapsed(0);
    const outcome = await controller.start('sentence', (p) => {
      setElapsed(p.elapsedS);
    });
    if (outcome.status === 'discarded') {
      setPhase('idle');
      setNote(DISCARD_TEXT);
      return;
    }

    setPhase('analyzing');
    const earlierLevels = distanceDone.current
      ? []
      : (await deps.takes.list()).reverse().flatMap((row) => (row.readings?.quality.ok && row.readings.speechLevelDbfs !== null ? [row.readings.speechLevelDbfs] : []));
    const takeId = await deps.takes.save(outcome.take, { mic: source.mic, device: navigator.userAgent, language, prompt: current.item.text, sessionId: id, itemId: current.item.id, role: current.role });
    let result: Readings;
    try {
      result = await deps.analyze(outcome.take.samples, outcome.take.sampleRate);
      await deps.takes.setReadings(takeId, result);
    } catch {
      setPhase('idle');
      setError('The app could not check this take. Please record it again.');
      return;
    }
    setPhase('idle');
    if (!result.quality.ok) {
      setRetake(result.quality.reasons);
      return;
    }
    readings.current.set(takeId, result);

    let advice: string | null = null;
    if (!distanceDone.current) {
      distanceDone.current = true;
      advice = distanceText(distanceCheck(result.speechLevelDbfs, earlierLevels));
    }

    const next = structuredClone(data);
    if (current.role === 'warm-up') next.warmUp.push({ itemId: current.item.id, takeId });
    else {
      const pair = next.blocks[current.block ?? 0]?.pairs[current.index];
      if (pair) {
        if (current.role === 'usual') pair.usualTakeId = takeId;
        else pair.clearTakeId = takeId;
      }
    }
    await save(id, next);
    await goTo(id, stepIndex + 1, next);
    setNote(advice);
  }

  async function judge(id: number, current: Extract<Step, { kind: 'judge' }>, choice: Judgement) {
    const next = structuredClone(data);
    const pair = next.blocks[current.block]?.pairs[current.index];
    if (pair) pair.judgement = choice;
    await save(id, next);
    await goTo(id, stepIndex + 1, next);
  }

  async function skip(id: number, current: Extract<Step, { kind: 'take' }>) {
    setNote(null);
    const next = structuredClone(data);
    if (!baseline && current.role !== 'warm-up') {
      const pair = next.blocks[current.block ?? 0]?.pairs[current.index];
      if (pair) pair.skipped = true;
    }
    await save(id, next);
    await goTo(id, skipTo(steps, stepIndex), next);
  }

  async function play(takeId: number | null | undefined) {
    if (takeId === null || takeId === undefined) return;
    const wav = await deps.takes.loadWav(takeId);
    if (!wav) return;
    await playWav(wav).catch(() => {
      setError('The phone could not play this take.');
    });
  }

  const messages = (
    <>
      {note !== null && (
        <p role="status" className="status">
          {note}
        </p>
      )}
      {retake !== null && (
        <div role="alert" className="alert">
          <p>
            <strong>Please record again</strong>
          </p>
          <ul>
            {retake.map((reason) => (
              <li key={reason}>{retakeText(reason)}</li>
            ))}
          </ul>
        </div>
      )}
      {error !== null && (
        <p role="alert" className="alert">
          {error}
        </p>
      )}
    </>
  );

  let body: React.ReactNode;
  if (sessionId === null || step === undefined || step === null) {
    body = (
      <section className="card">
        {baseline ? (
          <>
            <h2>Baseline · {LANGUAGE_NAME[language]}</h2>
            <p>This first session records how you speak now, before any practice.</p>
            <p>Read 8 sentences your usual way. Then read the same 8 big and clear. No feedback. About 4 minutes.</p>
          </>
        ) : (
          <>
            <h2>
              {LANGUAGE_NAME[language]} · {String(length)} minutes
            </h2>
            <p>
              Warm-up, then {plan.blocks.length > 1 ? `${String(plan.blocks.length)} blocks` : '1 block'} of 4 pairs. For each sentence: say it your usual way, then
              big and clear. Then choose which one a listener would catch better.
            </p>
          </>
        )}
        <p>Sit somewhere quiet. Hold the phone one hand-span from your mouth.</p>
        <button type="button" onClick={() => void begin()}>
          Start
        </button>
      </section>
    );
  } else if (step.kind === 'take') {
    const cue = data.blocks[step.block ?? 0]?.cue ?? profile.lastCue;
    const instruction =
      step.role === 'warm-up'
        ? 'Say it big and clear.'
        : step.role === 'usual'
          ? 'Say it your usual way, as you would to a friend.'
          : baseline
            ? BASELINE_CLEAR
            : `Now big and clear. ${CUE_TEXT[cue]}.`;
    body = (
      <section className="card">
        {!baseline && step.block !== null && plan.blocks.length > 1 && (
          <p className="muted">
            Block {String(step.block + 1)} of {String(plan.blocks.length)}
          </p>
        )}
        <h2>{takeHeading(step, baseline)}</h2>
        <p>{instruction}</p>
        <p className="reference" lang={language}>
          {step.item.text}
        </p>
        {phase === 'recording' ? (
          <>
            <p>Recording… {elapsed.toFixed(0)} s</p>
            <button type="button" onClick={() => audio.current.controller?.stop()}>
              Stop
            </button>
          </>
        ) : (
          <button type="button" disabled={busy} onClick={() => void record(sessionId, step)}>
            {phase === 'opening' ? 'Opening the microphone…' : phase === 'analyzing' ? 'Checking the recording…' : 'Record'}
          </button>
        )}
        <button type="button" className="secondary" disabled={busy} onClick={() => void skip(sessionId, step)}>
          Skip this sentence
        </button>
      </section>
    );
  } else if (step.kind === 'judge') {
    const pair = data.blocks[step.block]?.pairs[step.index];
    const of = data.blocks[step.block]?.pairs.length ?? 0;
    body = (
      <section className="card">
        <h2>
          Pair {String(step.index + 1)} of {String(of)}: which is clearer?
        </h2>
        <p className="reference" lang={language}>
          {plan.kind === 'practice' ? plan.blocks[step.block]?.[step.index]?.text : ''}
        </p>
        <button type="button" className="secondary" onClick={() => void play(pair?.usualTakeId)}>
          Play usual
        </button>
        <button type="button" className="secondary" onClick={() => void play(pair?.clearTakeId)}>
          Play clear
        </button>
        <p>Which would your listener catch better?</p>
        <div className="choices">
          {(
            [
              ['usual', 'Usual'],
              ['clear', 'Clear'],
              ['same', 'About the same'],
            ] as const
          ).map(([value, text]) => (
            <button key={value} type="button" onClick={() => void judge(sessionId, step, value)}>
              {text}
            </button>
          ))}
        </div>
      </section>
    );
  } else if (step.kind === 'summary') {
    const summary = data.blocks[step.block]?.summary;
    const last = plan.kind === 'practice' && step.block === plan.blocks.length - 1;
    body = (
      <section className="card">
        <h2>Block {String(step.block + 1)} summary</h2>
        {summary && (
          <ul className="summary">
            {summaryLines(summary).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
        <p className="muted">App readings, not scores. They may be wrong until they are checked on your voice.</p>
        <button type="button" onClick={() => void goTo(sessionId, stepIndex + 1, data)}>
          {last ? 'Finish' : 'Next block'}
        </button>
      </section>
    );
  } else {
    body = wrap && (
      <section className="card">
        {baseline ? (
          <>
            <h2>{wrap.counted ? 'Baseline saved' : 'Baseline not finished'}</h2>
            <p>{wrap.counted ? 'The app keeps these takes as your starting point. Practice starts next time.' : 'The baseline starts again next time.'}</p>
          </>
        ) : (
          <>
            <h2>{wrap.ended ? 'Session ended' : 'Session done'}</h2>
            <p>
              You recorded {String(wrap.pairs)} pair{wrap.pairs === 1 ? '' : 's'}.{' '}
              {wrap.counted ? 'This session counts toward your week.' : 'This session did not count: finish the first block to count it.'}
            </p>
            <p>Next time: {CUE_TEXT[wrap.nextCue]}.</p>
          </>
        )}
        <WeekDots week={wrap.week} />
        <p>
          <a href="#/">Back to Today</a>
        </p>
      </section>
    );
  }

  const running = sessionId !== null && step !== undefined && step !== null && step.kind !== 'wrap';
  return (
    <main className="app session">
      <p>
        <a href="#/">← Today</a>
      </p>
      <h1>{baseline ? 'Baseline' : 'Practice'}</h1>
      {body}
      {messages}
      {running && (
        <button
          type="button"
          className="secondary"
          disabled={busy}
          onClick={() => {
            void finish(sessionId, data, true);
          }}
        >
          End session
        </button>
      )}
    </main>
  );
}
