/**
 * Quality gate: asks for a retake when a take cannot be measured well.
 * Limits from design-options §6.9; test V3 tunes them on the owner's phone.
 */
import { clippedRatio, peakDbfs } from './levels';
import { detectSpeech, frameEnergiesDb, VAD_FRAME_MS, type DetectorSnapshot } from './vad';

export type RetakeReason = 'clipped' | 'too-quiet' | 'noisy' | 'too-short';

export const QUALITY_LIMITS = {
  maxClippedRatio: 0.001,
  minPeakDbfs: -35,
  minSnrDb: 15,
  minSpeechMs: 250,
} as const;

export interface QualityVerdict {
  readonly ok: boolean;
  readonly reasons: readonly RetakeReason[];
  readonly peakDbfs: number;
  readonly clippedRatio: number;
  /** Mean speech energy minus mean energy between speech, in dB; null when no speech was found. */
  readonly snrDb: number | null;
  readonly speechMs: number;
}

const STARTUP_FRAMES = 15; // the detector ignores the first 150 ms too

function meanDb(energies: readonly number[]): number | null {
  if (energies.length === 0) return null;
  return 10 * Math.log10(energies.reduce((a, b) => a + 10 ** (b / 10), 0) / energies.length);
}

export function checkQuality(samples: Float32Array, sampleRate: number, detection: DetectorSnapshot = detectSpeech(samples, sampleRate)): QualityVerdict {
  const frameS = VAD_FRAME_MS / 1000;
  const speech: number[] = [];
  const between: number[] = [];
  frameEnergiesDb(samples, sampleRate).forEach((db, k) => {
    if (k < STARTUP_FRAMES) return;
    const mid = (k + 0.5) * frameS;
    (detection.segments.some((s) => mid >= s.start && mid < s.end) ? speech : between).push(db);
  });
  const speechDb = meanDb(speech);
  const noiseDb = meanDb(between) ?? detection.noiseFloorDb;
  const snrDb = speechDb !== null && noiseDb !== null ? speechDb - noiseDb : null;
  const speechMs = Math.round(detection.segments.reduce((sum, s) => sum + (s.end - s.start), 0) * 1000);

  const peak = peakDbfs(samples);
  const clipped = clippedRatio(samples);
  const reasons: RetakeReason[] = [];
  if (clipped > QUALITY_LIMITS.maxClippedRatio) reasons.push('clipped');
  if (peak < QUALITY_LIMITS.minPeakDbfs) reasons.push('too-quiet');
  if (snrDb !== null && snrDb < QUALITY_LIMITS.minSnrDb) reasons.push('noisy');
  if (speechMs < QUALITY_LIMITS.minSpeechMs) reasons.push('too-short');
  return { ok: reasons.length === 0, reasons, peakDbfs: peak, clippedRatio: clipped, snrDb, speechMs };
}
