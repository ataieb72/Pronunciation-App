import { createExecutionContext } from 'cloudflare:test';
import { env } from 'cloudflare:workers';
import { describe, expect, it, vi } from 'vitest';
import { dayBucket } from '../src/rateLimit';
import { handleSpeechToken } from '../src/routes/speechToken';
import { AZURE_KEY, BASE, bearer, del, pairDevice, post } from './helpers';

const AZURE_URL = 'https://uksouth.api.cognitive.microsoft.com/sts/v1.0/issueToken';

function mockAzure(impl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(impl);
}

function tokenRequest(token?: string): Request {
  return new Request(`${BASE}/api/speech/token`, {
    method: 'POST',
    headers: token === undefined ? {} : bearer(token),
  });
}

describe('POST /api/speech/token', () => {
  it('Token_NoAuth_Returns401', async () => {
    const res = await post('/api/speech/token');
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
  });

  it.each([
    ['malformed header', { authorization: 'Token abc' }],
    ['bad token format', { authorization: 'Bearer not a token!' }],
    ['unknown token', { authorization: `Bearer ${'A'.repeat(43)}` }],
  ])('Token_InvalidAuth_Returns401 (%s)', async (_label, headers) => {
    const res = await post('/api/speech/token', undefined, headers);
    expect(res.status).toBe(401);
  });

  it('Token_RevokedDevice_Returns401', async () => {
    const token = await pairDevice();
    await del('/api/pair', bearer(token));
    expect((await post('/api/speech/token', undefined, bearer(token))).status).toBe(401);
  });

  it('Token_Valid_ReturnsAzureTokenRegionExpiry', async () => {
    const token = await pairDevice();
    const spy = mockAzure(() => Promise.resolve(new Response('azure-jwt-token', { status: 200 })));
    const before = Date.now();

    const res = await post('/api/speech/token', undefined, bearer(token));

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).not.toContain(AZURE_KEY);
    const body = JSON.parse(text) as { token: string; region: string; expiresAt: string };
    expect(body.token).toBe('azure-jwt-token');
    expect(body.region).toBe('uksouth');
    const expires = Date.parse(body.expiresAt);
    expect(expires - before).toBeGreaterThanOrEqual(9.9 * 60_000);
    expect(expires - before).toBeLessThanOrEqual(10.1 * 60_000);

    expect(spy).toHaveBeenCalledTimes(1);
    const [target, init] = spy.mock.calls[0] ?? [];
    const url = target instanceof Request ? target.url : target instanceof URL ? target.href : target;
    expect(url).toBe(AZURE_URL);
    expect(init?.method).toBe('POST');
    expect(new Headers(init?.headers).get('ocp-apim-subscription-key')).toBe(AZURE_KEY);
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it('Token_OverHourlyLimit_Returns429', async () => {
    const token = await pairDevice();
    mockAzure(() => Promise.resolve(new Response('t', { status: 200 })));
    for (let i = 0; i < 30; i++) {
      expect((await post('/api/speech/token', undefined, bearer(token))).status).toBe(200);
    }
    const res = await post('/api/speech/token', undefined, bearer(token));
    expect(res.status).toBe(429);
    const body = await res.json<{ error: string; retryAfter: number }>();
    expect(body.error).toBe('rate_limited');
    expect(body.retryAfter).toBeGreaterThan(0);
    expect(body.retryAfter).toBeLessThanOrEqual(3600);
    expect(res.headers.get('retry-after')).toBe(String(body.retryAfter));
  });

  it('Token_OverDailyLimit_Returns429', async () => {
    const token = await pairDevice();
    const { id } = (await env.DB.prepare('SELECT id FROM devices').first<{ id: string }>()) ?? { id: '' };
    await env.DB.prepare('INSERT INTO rate_counters (scope, bucket, count, expires_at) VALUES (?, ?, ?, ?)')
      .bind(`token:${id}`, dayBucket(new Date()), 200, Math.floor(Date.now() / 1000) + 86_400)
      .run();
    const spy = mockAzure(() => Promise.resolve(new Response('t', { status: 200 })));
    const res = await post('/api/speech/token', undefined, bearer(token));
    expect(res.status).toBe(429);
    expect(spy).not.toHaveBeenCalled();
  });

  it('Token_AzureRejects_Returns502', async () => {
    const token = await pairDevice();
    mockAzure(() => Promise.resolve(new Response('Access denied', { status: 401 })));
    const res = await post('/api/speech/token', undefined, bearer(token));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'azure_unavailable' });
  });

  it('Token_AzureNetworkError_Returns502', async () => {
    const token = await pairDevice();
    mockAzure(() => Promise.reject(new TypeError('network down')));
    expect((await post('/api/speech/token', undefined, bearer(token))).status).toBe(502);
  });

  it('Token_AzureTimeout_Returns502', async () => {
    const token = await pairDevice();
    mockAzure(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('timed out', 'TimeoutError'));
          });
        }),
    );
    const res = await handleSpeechToken(tokenRequest(token), { ...env, AZURE_TOKEN_TIMEOUT_MS: '50' }, createExecutionContext());
    expect(res.status).toBe(502);
  });

  it.each([
    ['key unset', { AZURE_SPEECH_KEY: undefined }],
    ['region unset', { AZURE_SPEECH_REGION: undefined }],
    ['region not a plain name', { AZURE_SPEECH_REGION: 'evil.example.com/x' }],
  ])('Token_NotConfigured_Returns503 (%s)', async (_label, override) => {
    const token = await pairDevice();
    const spy = mockAzure(() => Promise.resolve(new Response('t')));
    const res = await handleSpeechToken(tokenRequest(token), { ...env, ...override }, createExecutionContext());
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'speech_not_configured' });
    expect(spy).not.toHaveBeenCalled();
  });
});
