/**
 * Clear-speech pairs: what changed between the usual take and the "big and clear" take, summed up
 * once per block (elocution-focus §6; product-design §3). The owner judges each pair first; this
 * summary comes after the block.
 *
 * The thresholds are app defaults with no study behind them [None found]. Test V3 tunes them, so
 * the wording says "probably" until then.
 */
import { percentile } from '@pc/dsp';

/** What the app reads from one take (see apps/pwa `Readings`). */
export interface TakeMeasures {
  /** Passed the quality check. */
  readonly ok: boolean;
  readonly levelDb: number | null;
  readonly pitchRangeSt: number | null;
  readonly fadeDb: number | null;
  /** Articulation rate, syllables per second. */
  readonly rate: number | null;
}

export interface PairMeasures {
  readonly usual: TakeMeasures;
  readonly clear: TakeMeasures;
}

/** Clear minus usual. Rate is a ratio (clear / usual). */
export interface PairDifference {
  readonly loudness: number | null;
  readonly pitchRange: number | null;
  readonly fade: number | null;
  readonly rateRatio: number | null;
}

export type Feature = 'loudness' | 'pitchRange' | 'fade';
export const FEATURES: readonly Feature[] = ['loudness', 'pitchRange', 'fade'];

export type Cue = 'jaw' | 'endings' | 'reach' | 'lastWord';

export const CUE_TEXT: Readonly<Record<Cue, string>> = {
  jaw: 'Open your jaw',
  endings: 'Finish every word ending',
  reach: 'Reach the back of the room',
  lastWord: 'Keep your voice to the last word',
};

export const FEATURE_TEXT: Readonly<Record<Feature, string>> = {
  loudness: 'volume',
  pitchRange: 'pitch movement',
  fade: 'fade at phrase ends',
};

export const CHANGE_RULES = {
  /** Pairs where both takes passed the quality check. */
  minPairs: 3,
  /** Share of pairs that must move the same way. */
  agreeShare: 0.75,
  loudnessDb: 2,
  pitchRangeSt: 1,
  /** Less trailing off: the fade gets closer to zero. */
  fadeDb: 1.5,
  /** "About the same pace" band for clear / usual. */
  paceBand: 0.1,
} as const;

const THRESHOLD: Readonly<Record<Feature, number>> = {
  loudness: CHANGE_RULES.loudnessDb,
  pitchRange: CHANGE_RULES.pitchRangeSt,
  fade: CHANGE_RULES.fadeDb,
};

export type Pace = 'same' | 'slower' | 'faster';

export interface BlockSummary {
  readonly status: 'ok' | 'too-few';
  readonly goodPairs: number;
  /** Probably changed this block, and not yet holding for 3 sessions. */
  readonly changed: readonly Feature[];
  readonly notChanged: readonly Feature[];
  /** Too few pairs with this measure (for example, too few syllables for the fade). */
  readonly unknown: readonly Feature[];
  /** Changed now and in each of the last 3 sessions: shown as one short line, less often. */
  readonly stillHolding: readonly Feature[];
  readonly pace: Pace | null;
  /** Median clear / usual rate. */
  readonly paceRatio: number | null;
  readonly nextCue: Cue;
}

export interface SummaryContext {
  readonly previousCue: Cue;
  /** Features changed in earlier sessions, most recent first. */
  readonly history?: readonly (readonly Feature[])[];
}

const diff = (a: number | null, b: number | null) => (a === null || b === null ? null : b - a);

export function pairDifference({ usual, clear }: PairMeasures): PairDifference | null {
  if (!usual.ok || !clear.ok) return null;
  return {
    loudness: diff(usual.levelDb, clear.levelDb),
    pitchRange: diff(usual.pitchRangeSt, clear.pitchRangeSt),
    fade: diff(usual.fadeDb, clear.fadeDb),
    rateRatio: usual.rate === null || clear.rate === null || usual.rate <= 0 ? null : clear.rate / usual.rate,
  };
}

const values = (list: readonly (number | null)[]) => list.filter((v): v is number => v !== null);

export function summarizeBlock(block: readonly PairMeasures[], context: SummaryContext): BlockSummary {
  const differences = block.map(pairDifference).filter((d): d is PairDifference => d !== null);
  const goodPairs = differences.length;
  if (goodPairs < CHANGE_RULES.minPairs) {
    return { status: 'too-few', goodPairs, changed: [], notChanged: [], unknown: [...FEATURES], stillHolding: [], pace: null, paceRatio: null, nextCue: context.previousCue };
  }

  const changedNow: Feature[] = [];
  const notChanged: Feature[] = [];
  const unknown: Feature[] = [];
  for (const feature of FEATURES) {
    const list = values(differences.map((d) => d[feature]));
    if (list.length < CHANGE_RULES.minPairs) {
      unknown.push(feature);
      continue;
    }
    const agree = list.filter((v) => v > 0).length / list.length;
    if (percentile(list, 50) >= THRESHOLD[feature] && agree >= CHANGE_RULES.agreeShare) changedNow.push(feature);
    else notChanged.push(feature);
  }

  const recent = (context.history ?? []).slice(0, 3);
  const holding = (f: Feature) => recent.length === 3 && recent.every((session) => session.includes(f));
  const stillHolding = changedNow.filter(holding);
  const changed = changedNow.filter((f) => !holding(f));

  const ratios = values(differences.map((d) => d.rateRatio));
  const paceRatio = ratios.length >= CHANGE_RULES.minPairs ? percentile(ratios, 50) : null;
  const pace: Pace | null =
    paceRatio === null ? null : paceRatio < 1 - CHANGE_RULES.paceBand ? 'slower' : paceRatio > 1 + CHANGE_RULES.paceBand ? 'faster' : 'same';

  return { status: 'ok', goodPairs, changed, notChanged, unknown, stillHolding, pace, paceRatio, nextCue: nextCue(notChanged, context.previousCue) };
}

/** The next block's cue targets a feature that did not change (elocution-focus §6). */
function nextCue(notChanged: readonly Feature[], previous: Cue): Cue {
  if (notChanged.includes('loudness')) return 'reach';
  if (notChanged.includes('fade')) return 'lastWord';
  // Jaw opening and word endings have no phone measure yet: they take turns.
  return previous === 'jaw' ? 'endings' : 'jaw';
}

const list = (features: readonly Feature[]) => features.map((f) => FEATURE_TEXT[f]).join(', ');

/** Plain lines for the block summary card. Cautious wording; never a score. */
export function summaryLines(summary: BlockSummary): string[] {
  const next = `Next: ${CUE_TEXT[summary.nextCue]}.`;
  if (summary.status === 'too-few') return ['Not enough good pairs to compare this block.', next];

  const lines: string[] = [];
  lines.push(summary.changed.length > 0 ? `Probably changed: ${list(summary.changed)}.` : 'No clear change this block.');
  if (summary.notChanged.length > 0) lines.push(`Not changed: ${list(summary.notChanged)}.`);
  if (summary.stillHolding.length > 0) lines.push(`Still holding: ${list(summary.stillHolding)}.`);
  if (summary.pace !== null && summary.paceRatio !== null) {
    const percent = Math.round(Math.abs(1 - summary.paceRatio) * 100);
    if (summary.pace === 'same') lines.push('About the same pace as your usual.');
    else if (summary.pace === 'slower') lines.push(`Your clear takes were about ${String(percent)}% slower than your usual. Aim for clear at your normal pace.`);
    else lines.push(`Your clear takes were about ${String(percent)}% faster than your usual.`);
  }
  lines.push(next);
  return lines;
}
