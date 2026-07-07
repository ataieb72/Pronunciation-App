import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { assessPronunciation, getTtsUrl } from '../lib/api';

const originalFetch = (globalThis as any).fetch;

describe('F3-T03 API client (TDD)', () => {
  beforeEach(() => {
    (globalThis as any).fetch = vi.fn();
  });

  afterEach(() => {
    (globalThis as any).fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('assessPronunciation happy path calls /api/assess and returns data', async () => {
    const mockResponse = { scores: { overall: 85, accuracy: 82 }, phonemeJson: '{}' };
    ((globalThis as any).fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await assessPronunciation(42, 'Hello world', 'en-US');

    expect((globalThis as any).fetch).toHaveBeenCalledWith('/api/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId: 42, referenceText: 'Hello world', language: 'en-US' }),
    });
    expect(result).toEqual(mockResponse);
  });

  it('assessPronunciation 502 error path', async () => {
    ((globalThis as any).fetch as any).mockResolvedValue({
      ok: false,
      status: 502,
      text: () => Promise.resolve('Azure error'),
    });

    await expect(
      assessPronunciation(99, 'test', 'en-US')
    ).rejects.toThrow('Assess failed: 502 - Azure error');
  });

  it('assessPronunciation 429 rate limit path', async () => {
    ((globalThis as any).fetch as any).mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve('Quota exceeded'),
    });

    await expect(
      assessPronunciation(1, 'test', 'en-US')
    ).rejects.toThrow('Assess failed: 429 - Quota exceeded');
  });

  it('getTtsUrl builds correct URL', () => {
    const url = getTtsUrl('Hello', 'en-US', 1.25);
    expect(url).toBe('/api/tts?text=Hello&lang=en-US&rate=1.25');
  });
});
