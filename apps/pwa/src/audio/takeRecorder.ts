/**
 * One take: feeds microphone batches to the streaming speech detector and decides when the take
 * ends. Pure logic (no browser APIs), so the rules are tested with synthetic audio.
 *
 * - A take stops by itself a short time after speech ends, or at its cap (R1 run 2: a
 *   60-second round ran to 89 s because nothing stopped it).
 * - The kept audio starts 300 ms before the first speech (pre-roll) and is resampled to 16 kHz.
 */
import { createSpeechDetector, resample, type SpeechSegment } from '@pc/dsp';

export type TakeKind = 'word' | 'sentence' | 'talk';
export type StopReason = 'silence' | 'cap' | 'manual';

/**
 * Caps from design-options §6.9. End silence: 0.8 s for words and sentences; 4 s for talk rounds,
 * where thinking pauses are normal (an app default; test V3 may tune it).
 */
export const TAKE_RULES: Record<TakeKind, { readonly capS: number; readonly endSilenceS: number }> = {
  word: { capS: 8, endSilenceS: 0.8 },
  sentence: { capS: 15, endSilenceS: 0.8 },
  talk: { capS: 60, endSilenceS: 4 },
};

export const PRE_ROLL_S = 0.3;
export const TAKE_RATE = 16_000;

export interface RecordedTake {
  readonly kind: TakeKind;
  readonly stopReason: StopReason;
  /** 16 kHz mono, from 300 ms before the first speech to the stop. */
  readonly samples: Float32Array;
  readonly sampleRate: typeof TAKE_RATE;
  /** Seconds of microphone audio received before the stop. */
  readonly sourceDurationS: number;
  /** Seconds dropped at the start (silence before the pre-roll). */
  readonly startOffsetS: number;
  /** Speech stretches, relative to the kept audio. */
  readonly speech: readonly SpeechSegment[];
  readonly noiseFloorDb: number | null;
}

export interface TakeRecorder {
  /** Adds a microphone batch. Returns the stop reason once the take has stopped, else null. */
  push(batch: Float32Array): StopReason | null;
  /** Ends the take (a tap on Stop gives "manual") and returns the kept audio. */
  finish(reason?: 'manual'): RecordedTake;
  readonly elapsedS: number;
  readonly speaking: boolean;
}

export function createTakeRecorder(kind: TakeKind, sourceRate: number): TakeRecorder {
  const rules = TAKE_RULES[kind];
  const capSamples = Math.round(rules.capS * sourceRate);
  const detector = createSpeechDetector({ sampleRate: sourceRate });
  const batches: Float32Array[] = [];
  let received = 0;
  let stopReason: StopReason | null = null;

  return {
    push(batch) {
      if (stopReason !== null) return stopReason;
      const room = capSamples - received;
      const kept = batch.length > room ? batch.subarray(0, room) : batch;
      batches.push(kept.slice());
      detector.push(kept);
      received += kept.length;

      const elapsed = received / sourceRate;
      const { lastSpeechEnd } = detector.snapshot();
      if (lastSpeechEnd !== null && elapsed - lastSpeechEnd >= rules.endSilenceS) stopReason = 'silence';
      else if (received >= capSamples) stopReason = 'cap';
      return stopReason;
    },

    finish(reason) {
      stopReason ??= reason ?? 'manual';
      const raw = new Float32Array(received);
      let offset = 0;
      for (const b of batches) {
        raw.set(b, offset);
        offset += b.length;
      }
      const { segments, noiseFloorDb } = detector.snapshot();
      const firstSpeech = segments[0]?.start;
      const startSample = firstSpeech === undefined ? 0 : Math.max(0, Math.round((firstSpeech - PRE_ROLL_S) * sourceRate));
      const startOffsetS = startSample / sourceRate;
      const sourceDurationS = received / sourceRate;
      const samples = resample(raw.subarray(startSample), sourceRate, TAKE_RATE);
      const keptS = samples.length / TAKE_RATE;
      const speech = segments
        .map((s) => ({ start: Math.max(0, s.start - startOffsetS), end: Math.min(keptS, s.end - startOffsetS) }))
        .filter((s) => s.end > s.start);
      return { kind, stopReason, samples, sampleRate: TAKE_RATE, sourceDurationS, startOffsetS, speech, noiseFloorDb };
    },

    get elapsedS() {
      return received / sourceRate;
    },
    get speaking() {
      return detector.snapshot().speaking;
    },
  };
}
