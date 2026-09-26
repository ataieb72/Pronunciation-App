/**
 * Everything the app reads from one take, computed on the phone with packages/dsp (each measure
 * checked against Praat, R2-T01…T05). These are test readings, never scores (product-design §3).
 */
import { checkQuality, phraseEndFade, speechLevelDbfs, summarizePitch, syllableNuclei, trackPitch, type QualityVerdict } from '@pc/dsp';

export interface Readings {
  readonly quality: QualityVerdict;
  /** Mean level while speaking, dBFS. Only comparable with the same phone at the same distance. */
  readonly speechLevelDbfs: number | null;
  readonly pitch: { readonly medianHz: number; readonly rangeSemitones: number } | null;
  readonly pauses: { readonly count: number; readonly totalS: number };
  readonly syllables: number;
  /** Syllables per second of speaking (pauses excluded). */
  readonly articulationRate: number | null;
  /** Median fade at phrase ends in dB (negative = trailing off). An experiment. */
  readonly fadeDb: number | null;
}

export function analyzeTake(samples: Float32Array, sampleRate: number): Readings {
  const quality = checkQuality(samples, sampleRate);
  const rhythm = syllableNuclei(samples, sampleRate);
  const pitch = summarizePitch(trackPitch(samples, sampleRate));
  return {
    quality,
    speechLevelDbfs: speechLevelDbfs(samples, sampleRate, rhythm.sounding),
    pitch: pitch ? { medianHz: pitch.medianHz, rangeSemitones: pitch.rangeSemitones } : null,
    pauses: { count: rhythm.pauses.length, totalS: rhythm.pauses.reduce((sum, p) => sum + (p.end - p.start), 0) },
    syllables: rhythm.count,
    articulationRate: rhythm.articulationRate,
    fadeDb: phraseEndFade(rhythm).medianDb,
  };
}
