/**
 * Fade at phrase ends (trailing off): per sounding stretch, the level of the last syllable peak
 * minus the median level of the other syllable peaks, in dB. Negative means the phrase fades.
 * An experiment only: no study links it to intelligibility (elocution-focus §5 [None found]).
 *
 * Phrase peaks are the syllable nuclei plus a final peak, which the nuclei method never counts,
 * when it is voiced and dips at least 2 dB before the stretch ends. A phrase needs 3 peaks.
 */
import { intensityValueAt, minimumBetween } from './intensity';
import { percentile } from './pitch';
import { RHYTHM_SETTINGS, type RhythmResult } from './rhythm';

export interface FadeResult {
  readonly perPhraseDb: readonly number[];
  readonly medianDb: number | null;
}

export function phraseEndFade(rhythm: RhythmResult): FadeResult {
  const { intensity, sounding, nuclei, peaks } = rhythm;
  const perPhraseDb: number[] = [];
  for (const { start, end } of sounding) {
    const inside = nuclei.filter((t) => t >= start && t <= end);
    const last = peaks.filter((p) => p.time >= start && p.time <= end).at(-1);
    if (last && (inside.length === 0 || last.time > (inside.at(-1) ?? Infinity))) {
      const endDip = minimumBetween(intensity, last.time, end);
      if (Math.abs(last.db - endDip) > RHYTHM_SETTINGS.minDipDb && last.voicedAndSounding) inside.push(last.time);
    }
    if (inside.length < 3) continue;
    const levels = inside.map((t) => intensityValueAt(intensity, t));
    perPhraseDb.push((levels.at(-1) ?? 0) - percentile(levels.slice(0, -1), 50));
  }
  return { perPhraseDb, medianDb: perPhraseDb.length > 0 ? percentile(perPhraseDb, 50) : null };
}
