const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/** Fixed windows in UTC. */
export function hourBucket(now: Date): string {
  return `h:${now.toISOString().slice(0, 13)}`;
}

export function dayBucket(now: Date): string {
  return `d:${now.toISOString().slice(0, 10)}`;
}

function secondsUntilNext(now: Date, windowMs: number): number {
  const ms = now.getTime();
  const next = Math.floor(ms / windowMs) * windowMs + windowMs;
  return Math.ceil((next - ms) / 1000);
}

export function secondsUntilNextHour(now: Date): number {
  return secondsUntilNext(now, HOUR_MS);
}

export function secondsUntilNextDay(now: Date): number {
  return secondsUntilNext(now, DAY_MS);
}

export interface Window {
  readonly bucket: string;
  /** Seconds from `now` until the row can be deleted. */
  readonly ttlSeconds: number;
}

export function hourWindow(now: Date): Window {
  return { bucket: hourBucket(now), ttlSeconds: secondsUntilNextHour(now) };
}

export function dayWindow(now: Date): Window {
  return { bucket: dayBucket(now), ttlSeconds: secondsUntilNextDay(now) };
}

/**
 * Adds one hit to each window for `scope` and returns the new counts, in order.
 * Also deletes expired rows, so the table stays small.
 */
export async function hit(db: D1Database, scope: string, windows: readonly Window[], now: Date): Promise<number[]> {
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const upsert = db.prepare(
    `INSERT INTO rate_counters (scope, bucket, count, expires_at) VALUES (?, ?, 1, ?)
     ON CONFLICT (scope, bucket) DO UPDATE SET count = count + 1
     RETURNING count`,
  );
  const results = await db.batch<{ count: number }>([
    db.prepare('DELETE FROM rate_counters WHERE expires_at < ?').bind(nowSeconds),
    ...windows.map((w) => upsert.bind(scope, w.bucket, nowSeconds + w.ttlSeconds)),
  ]);
  return results.slice(1).map((r) => r.results[0]?.count ?? 0);
}

/** Current count for one window, without adding a hit. */
export async function peek(db: D1Database, scope: string, window: Window): Promise<number> {
  const row = await db
    .prepare('SELECT count FROM rate_counters WHERE scope = ? AND bucket = ?')
    .bind(scope, window.bucket)
    .first<{ count: number }>();
  return row?.count ?? 0;
}
