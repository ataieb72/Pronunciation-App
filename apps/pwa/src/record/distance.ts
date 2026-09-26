/**
 * Distance check (elocution-focus §5): level depends on how far the phone is from the mouth, so
 * the first take of a session is compared with the owner's usual level. The limits are app
 * defaults; test V3 tunes them.
 */
import { percentile } from '@pc/dsp';

export const DISTANCE_RULES = { minTakes: 3, lookback: 10, maxDiffDb: 6 } as const;

export type DistanceCheck =
  | { readonly status: 'building'; readonly have: number; readonly need: number }
  | { readonly status: 'ok' | 'louder' | 'quieter'; readonly diffDb: number; readonly usualDb: number };

/** `previous` holds earlier good takes' levels, oldest first. */
export function distanceCheck(levelDb: number | null, previous: readonly number[]): DistanceCheck | null {
  if (levelDb === null) return null;
  const { minTakes, lookback, maxDiffDb } = DISTANCE_RULES;
  if (previous.length < minTakes) return { status: 'building', have: previous.length, need: minTakes };
  const usualDb = percentile(previous.slice(-lookback), 50);
  const diffDb = levelDb - usualDb;
  const status = diffDb > maxDiffDb ? 'louder' : diffDb < -maxDiffDb ? 'quieter' : 'ok';
  return { status, diffDb, usualDb };
}
