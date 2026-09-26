/**
 * Runs one take at a time on an open microphone: feeds the take recorder, keeps the screen awake
 * while recording, and discards the take if the page is hidden (a phone call, a switch to another
 * app), because the phone may pause or change the audio then (design-options §6.9).
 */
import type { AudioSource } from './microphone';
import { createTakeRecorder, type RecordedTake, type TakeKind } from './takeRecorder';

export type TakeOutcome = { readonly status: 'done'; readonly take: RecordedTake } | { readonly status: 'discarded'; readonly reason: 'page-hidden' };

export interface TakeProgress {
  readonly elapsedS: number;
  readonly speaking: boolean;
}

interface WakeLockLike {
  request(type: 'screen'): Promise<{ release(): Promise<void> }>;
}

export interface ControllerEnv {
  readonly document: Document;
  readonly wakeLock?: WakeLockLike | undefined;
}

export interface TakeController {
  start(kind: TakeKind, onProgress?: (progress: TakeProgress) => void): Promise<TakeOutcome>;
  /** A tap on Stop. */
  stop(): void;
  readonly recording: boolean;
}

const PROGRESS_EVERY_S = 0.1;

export function createTakeController(source: AudioSource, env: ControllerEnv): TakeController {
  let active: { stop(): void } | null = null;

  return {
    start(kind, onProgress) {
      if (active) throw new Error('A take is already recording');
      const recorder = createTakeRecorder(kind, source.sampleRate);
      let lastProgress = -Infinity;
      let lock: Promise<{ release(): Promise<void> } | null> = Promise.resolve(null);
      if (env.wakeLock) lock = env.wakeLock.request('screen').catch(() => null); // the take works without it

      return new Promise<TakeOutcome>((resolve) => {
        const end = (outcome: TakeOutcome) => {
          source.listen(null);
          env.document.removeEventListener('visibilitychange', onVisibility);
          active = null;
          void lock.then((sentinel) => sentinel?.release()).catch(() => undefined);
          resolve(outcome);
        };
        const onVisibility = () => {
          if (env.document.visibilityState === 'hidden') end({ status: 'discarded', reason: 'page-hidden' });
        };
        env.document.addEventListener('visibilitychange', onVisibility);
        active = {
          stop: () => {
            end({ status: 'done', take: recorder.finish('manual') });
          },
        };
        source.listen((batch) => {
          const reason = recorder.push(batch);
          if (onProgress && (reason !== null || recorder.elapsedS - lastProgress >= PROGRESS_EVERY_S)) {
            lastProgress = recorder.elapsedS;
            onProgress({ elapsedS: recorder.elapsedS, speaking: recorder.speaking });
          }
          if (reason !== null) end({ status: 'done', take: recorder.finish() });
        });
      });
    },
    stop() {
      active?.stop();
    },
    get recording() {
      return active !== null;
    },
  };
}
