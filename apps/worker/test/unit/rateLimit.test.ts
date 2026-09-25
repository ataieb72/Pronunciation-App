import { describe, expect, it } from 'vitest';
import { dayBucket, hourBucket, secondsUntilNextDay, secondsUntilNextHour } from '../../src/rateLimit';

describe('rate-limit windows (UTC)', () => {
  const t = new Date('2026-09-25T10:15:30Z');

  it('Buckets_UseUtcHourAndDay', () => {
    expect(hourBucket(t)).toBe('h:2026-09-25T10');
    expect(dayBucket(t)).toBe('d:2026-09-25');
  });

  it('SecondsUntilNextWindow_CountsToBoundary', () => {
    expect(secondsUntilNextHour(t)).toBe(44 * 60 + 30);
    expect(secondsUntilNextDay(t)).toBe(13 * 3600 + 44 * 60 + 30);
  });

  it('SecondsUntilNextWindow_AtBoundary_IsFullWindow', () => {
    const edge = new Date('2026-09-25T00:00:00Z');
    expect(secondsUntilNextHour(edge)).toBe(3600);
    expect(secondsUntilNextDay(edge)).toBe(86_400);
  });
});
