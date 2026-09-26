/**
 * Voice activity detection: an energy detector that adapts to the room's noise level.
 * It runs on 10 ms frames, in a stream (for stopping takes by themselves) or on a whole take.
 *
 * Noise level: the lowest 50 ms-smoothed frame energy over the last 3 s. Speech rarely stays
 * loud for 3 s without a dip, so the level follows the room, including a room that gets louder.
 * Speech starts when frames stay 10 dB above the noise level for 30 ms, and ends after 150 ms
 * near the noise level (within 6 dB).
 */

export interface SpeechSegment {
  /** Seconds from the start of the take. */
  readonly start: number;
  readonly end: number;
}

export interface DetectorOptions {
  readonly sampleRate: number;
  /** The first part of a take is ignored: the Pixel's mic delivers about 120 ms of digital silence (R1 run 1). */
  readonly startupMs?: number;
}

export interface DetectorSnapshot {
  readonly speaking: boolean;
  /** Finished stretches, plus the current one while speaking (ending at the last speech frame). */
  readonly segments: readonly SpeechSegment[];
  /** End of the last speech frame, in seconds, or null before any speech. */
  readonly lastSpeechEnd: number | null;
  /** The room's noise level in dBFS, or null before the first frame. */
  readonly noiseFloorDb: number | null;
  /** Seconds of audio processed. */
  readonly time: number;
}

export interface SpeechDetector {
  push(samples: Float32Array): void;
  snapshot(): DetectorSnapshot;
}

export const VAD_FRAME_MS = 10;
const STARTUP_MS = 150;
const SMOOTH_FRAMES = 5;
const FLOOR_WINDOW_FRAMES = 300;
const ONSET_DB = 10;
const OFFSET_DB = 6;
const ONSET_FRAMES = 3;
const MIN_SILENCE_FRAMES = 15;
/** Nothing quieter than this counts as speech, however quiet the room. */
const ABSOLUTE_MIN_DB = -60;
const LOWEST_DB = -120;

function energyDb(samples: Float32Array, from: number, to: number): number {
  let sum = 0;
  for (let i = from; i < to; i++) {
    const s = samples[i] ?? 0;
    sum += s * s;
  }
  return Math.max(LOWEST_DB, 10 * Math.log10(sum / Math.max(1, to - from) + 1e-12));
}

/** Energy of each 10 ms frame, in dBFS. */
export function frameEnergiesDb(samples: Float32Array, sampleRate: number): Float32Array {
  const size = Math.round((sampleRate * VAD_FRAME_MS) / 1000);
  const out = new Float32Array(Math.floor(samples.length / size));
  for (let k = 0; k < out.length; k++) out[k] = energyDb(samples, k * size, (k + 1) * size);
  return out;
}

export function createSpeechDetector(options: DetectorOptions): SpeechDetector {
  const frameSize = Math.round((options.sampleRate * VAD_FRAME_MS) / 1000);
  const frameS = frameSize / options.sampleRate;
  const startupFrames = Math.ceil((options.startupMs ?? STARTUP_MS) / VAD_FRAME_MS);

  const pending = new Float32Array(frameSize);
  let pendingLength = 0;
  let frameIndex = 0;

  const recentEnergy: number[] = []; // linear energies for smoothing
  const smoothedHistory: number[] = []; // dB, for the noise level
  let noiseFloorDb: number | null = null;

  let speaking = false;
  let onsetRun = 0;
  let onsetStart = 0;
  let silenceRun = 0;
  let segmentStart = 0;
  let lastActiveEnd: number | null = null;
  const segments: SpeechSegment[] = [];

  function onFrame(db: number): void {
    const index = frameIndex++;
    if (index < startupFrames) return;
    const start = index * frameS;
    const end = start + frameS;

    recentEnergy.push(10 ** (db / 10));
    if (recentEnergy.length > SMOOTH_FRAMES) recentEnergy.shift();
    const smoothed = 10 * Math.log10(recentEnergy.reduce((a, b) => a + b, 0) / recentEnergy.length);
    smoothedHistory.push(smoothed);
    if (smoothedHistory.length > FLOOR_WINDOW_FRAMES) smoothedHistory.shift();
    const floor = Math.min(...smoothedHistory);
    noiseFloorDb = floor;

    if (!speaking) {
      if (db > floor + ONSET_DB && db > ABSOLUTE_MIN_DB) {
        if (onsetRun === 0) onsetStart = start;
        onsetRun++;
        if (onsetRun >= ONSET_FRAMES) {
          speaking = true;
          segmentStart = onsetStart;
          lastActiveEnd = end;
          silenceRun = 0;
        }
      } else {
        onsetRun = 0;
      }
      return;
    }

    if (db > floor + OFFSET_DB && db > ABSOLUTE_MIN_DB) {
      lastActiveEnd = end;
      silenceRun = 0;
    } else if (++silenceRun >= MIN_SILENCE_FRAMES) {
      segments.push({ start: segmentStart, end: lastActiveEnd ?? end });
      speaking = false;
      onsetRun = 0;
    }
  }

  return {
    push(samples) {
      let offset = 0;
      while (offset < samples.length) {
        const take = Math.min(frameSize - pendingLength, samples.length - offset);
        pending.set(samples.subarray(offset, offset + take), pendingLength);
        pendingLength += take;
        offset += take;
        if (pendingLength === frameSize) {
          onFrame(energyDb(pending, 0, frameSize));
          pendingLength = 0;
        }
      }
    },
    snapshot() {
      const open = speaking && lastActiveEnd !== null ? [{ start: segmentStart, end: lastActiveEnd }] : [];
      return {
        speaking,
        segments: [...segments, ...open],
        lastSpeechEnd: lastActiveEnd,
        noiseFloorDb,
        time: (frameIndex * frameSize + pendingLength) / options.sampleRate,
      };
    },
  };
}

/** Runs the detector over a whole take. */
export function detectSpeech(samples: Float32Array, sampleRate: number, options: Omit<DetectorOptions, 'sampleRate'> = {}): DetectorSnapshot {
  const detector = createSpeechDetector({ ...options, sampleRate });
  detector.push(samples);
  return detector.snapshot();
}
