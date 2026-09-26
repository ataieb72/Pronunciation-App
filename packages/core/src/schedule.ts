/**
 * Which language today, what a session holds, and the week against the target
 * (R3 defaults R3-a, R3-b, R3-c, R3-g in docs/backlog/epics/R3-clarity-core.md).
 */
import { BASELINE_SENTENCES, PRACTICE_SENTENCES, type Language, type SentenceItem } from './content/sentences';
import { pickSentences } from './pick';

export interface SessionLog {
  readonly startedAt: string;
  readonly language: Language;
  /** The session counts toward the week (its first block, or the baseline, was done). */
  readonly counted: boolean;
}

/** The calendar day in local time, as YYYY-MM-DD. */
export function localDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * English and French take turns by practice day (50/50): the other language from the last
 * practice day, or the same language again on a day that already has a session.
 */
export function languageOfTheDay(history: readonly SessionLog[], now: Date): Language {
  const counted = history.filter((s) => s.counted).sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const last = counted.at(-1);
  if (!last) return 'en';
  if (localDay(new Date(last.startedAt)) === localDay(now)) return last.language;
  return last.language === 'en' ? 'fr' : 'en';
}

export type SessionLength = 5 | 10;

/** Until R4 (Listen) and R6 (Use) ship, sessions hold blocks of clear-speech pairs only. */
export const SESSION_RULES = {
  warmUpSentences: 2,
  pairsPerBlock: 4,
  blocks: { 5: 1, 10: 2 },
} as const;

export type SessionPlan =
  | { readonly kind: 'practice'; readonly language: Language; readonly length: SessionLength; readonly warmUp: readonly SentenceItem[]; readonly blocks: readonly (readonly SentenceItem[])[] }
  | { readonly kind: 'baseline'; readonly language: Language; readonly items: readonly SentenceItem[] };

export interface PlanInput {
  readonly language: Language;
  readonly length: SessionLength;
  /** A baseline for this language exists. The first session in a language records it. */
  readonly hasBaseline: boolean;
  /** Sentence ids used recently, most recent first. */
  readonly recentIds: readonly string[];
  readonly random?: () => number;
}

export function planSession(input: PlanInput): SessionPlan {
  const { language, length } = input;
  if (!input.hasBaseline) return { kind: 'baseline', language, items: BASELINE_SENTENCES[language] };
  const blockCount = SESSION_RULES.blocks[length];
  const { warmUpSentences, pairsPerBlock } = SESSION_RULES;
  const picked = pickSentences(PRACTICE_SENTENCES[language], warmUpSentences + blockCount * pairsPerBlock, input.recentIds, input.random);
  const blocks = Array.from({ length: blockCount }, (_, b) => picked.slice(warmUpSentences + b * pairsPerBlock, warmUpSentences + (b + 1) * pairsPerBlock));
  return { kind: 'practice', language, length, warmUp: picked.slice(0, warmUpSentences), blocks };
}

export const WEEKLY_TARGET = { default: 4, min: 3, max: 6 } as const;

export function clampTarget(value: number): number {
  if (!Number.isFinite(value)) return WEEKLY_TARGET.default;
  return Math.min(WEEKLY_TARGET.max, Math.max(WEEKLY_TARGET.min, Math.round(value)));
}

export interface WeekProgress {
  /** Days this week (Monday to Sunday, local time) with a counted session. */
  readonly practiceDays: number;
  readonly target: number;
  readonly met: boolean;
}

export function weekProgress(history: readonly SessionLog[], now: Date, target: number): WeekProgress {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const nextMonday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7);
  const days = new Set(
    history
      .filter((s) => s.counted)
      .map((s) => new Date(s.startedAt))
      .filter((d) => d >= monday && d < nextMonday)
      .map(localDay),
  );
  return { practiceDays: days.size, target, met: days.size >= target };
}
