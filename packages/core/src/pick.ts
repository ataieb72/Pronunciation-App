import type { SentenceItem } from './content/sentences';

/**
 * Picks `count` different items: first, in random order, items not in `recentIds`; then, if more
 * are needed, the items used longest ago. `recentIds` lists the most recent first.
 */
export function pickSentences(
  bank: readonly SentenceItem[],
  count: number,
  recentIds: readonly string[],
  random: () => number = Math.random,
): SentenceItem[] {
  const recentRank = new Map<string, number>();
  recentIds.forEach((id, i) => {
    if (!recentRank.has(id)) recentRank.set(id, i);
  });
  const fresh = shuffle(
    bank.filter((item) => !recentRank.has(item.id)),
    random,
  );
  const stale = bank
    .filter((item) => recentRank.has(item.id))
    .sort((a, b) => (recentRank.get(b.id) ?? 0) - (recentRank.get(a.id) ?? 0));
  return [...fresh, ...stale].slice(0, count);
}

function shuffle<T>(items: T[], random: () => number): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j] as T, items[i] as T];
  }
  return items;
}
