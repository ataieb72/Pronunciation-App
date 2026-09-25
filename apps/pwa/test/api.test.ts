import { describe, expect, it, vi } from 'vitest';
import { checkHealth, pair, unpair } from '../src/api';
import { jsonResponse, mockFetch } from './fetchMock';

const TOKEN = 'A'.repeat(43);

describe('api.pair', () => {
  it('Pair_201_ReturnsToken', async () => {
    const fetch = mockFetch({ 'POST /api/pair': () => jsonResponse({ deviceToken: TOKEN }, 201) });
    expect(await pair('correct-code-123')).toEqual({ ok: true, deviceToken: TOKEN });
    const init = fetch.mock.calls[0]?.[1];
    expect(init?.body).toBe(JSON.stringify({ pairingCode: 'correct-code-123' }));
    expect(new Headers(init?.headers).get('content-type')).toBe('application/json');
  });

  it.each([
    [401, { error: 'invalid_code' }, 'invalid_code'],
    [403, { error: 'device_limit' }, 'device_limit'],
    [503, { error: 'pairing_disabled' }, 'pairing_disabled'],
    [400, { error: 'bad_request' }, 'bad_request'],
    [500, { error: 'boom' }, 'server'],
  ])('Pair_%i_MapsToReason', async (status, body, reason) => {
    mockFetch({ 'POST /api/pair': () => jsonResponse(body, status) });
    expect(await pair('x')).toEqual({ ok: false, reason });
  });

  it('Pair_429_ReturnsRetryAfter', async () => {
    mockFetch({ 'POST /api/pair': () => jsonResponse({ error: 'rate_limited', retryAfter: 125 }, 429) });
    expect(await pair('x')).toEqual({ ok: false, reason: 'rate_limited', retryAfter: 125 });
  });

  it('Pair_201WithBadBody_IsServerError', async () => {
    mockFetch({ 'POST /api/pair': () => jsonResponse({ nope: true }, 201) });
    expect(await pair('x')).toEqual({ ok: false, reason: 'server' });
  });

  it('Pair_NetworkError_ReturnsNetwork', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))));
    expect(await pair('x')).toEqual({ ok: false, reason: 'network' });
  });
});

describe('api.unpair', () => {
  it('Unpair_SendsBearer_ReturnsTrueOn204', async () => {
    const fetch = mockFetch({ 'DELETE /api/pair': () => new Response(null, { status: 204 }) });
    expect(await unpair(TOKEN)).toBe(true);
    expect(new Headers(fetch.mock.calls[0]?.[1]?.headers).get('authorization')).toBe(`Bearer ${TOKEN}`);
  });

  it('Unpair_401_ReturnsTrue_TokenAlreadyInvalid', async () => {
    mockFetch({ 'DELETE /api/pair': () => jsonResponse({ error: 'unauthorized' }, 401) });
    expect(await unpair(TOKEN)).toBe(true);
  });

  it('Unpair_NetworkError_ReturnsFalse', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))));
    expect(await unpair(TOKEN)).toBe(false);
  });
});

describe('api.checkHealth', () => {
  it.each([
    [200, { status: 'ok', db: true }, 'online'],
    [503, { status: 'degraded', db: false }, 'degraded'],
    [500, {}, 'degraded'],
  ])('Health_%i_Is_%s', async (status, body, expected) => {
    mockFetch({ 'GET /api/health': () => jsonResponse(body, status) });
    expect(await checkHealth()).toBe(expected);
  });

  it('Health_NetworkError_IsOffline', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))));
    expect(await checkHealth()).toBe('offline');
  });
});
