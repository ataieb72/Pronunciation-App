/**
 * Speech level: the energy mean of the intensity (minimum pitch 50 Hz, 10 ms, mean pressure kept)
 * over frames inside sounding stretches, in dBFS. Meaningful only against the same person's
 * baseline, on the same phone, at the same distance (elocution-focus §5 [Moderate]).
 */
import { intensityTrack } from './intensity';
import type { Interval } from './rhythm';

export function speechLevelDbfs(samples: Float32Array, sampleRate: number, sounding: readonly Interval[]): number | null {
  const track = intensityTrack(samples, sampleRate, { minPitchHz: 50, timeStep: 0.01, subtractMean: false });
  let sum = 0;
  let count = 0;
  track.db.forEach((db, k) => {
    const t = track.t0 + k * track.timeStep;
    if (sounding.some((s) => t >= s.start && t <= s.end)) {
      sum += 10 ** (db / 10);
      count++;
    }
  });
  return count > 0 ? 10 * Math.log10(sum / count) : null;
}
