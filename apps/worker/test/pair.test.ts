import { createExecutionContext } from 'cloudflare:test';
import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { sha256Hex } from '../src/crypto';
import { handlePair } from '../src/routes/pair';
import { BASE, PAIRING_CODE, bearer, del, pairDevice, post } from './helpers';

interface DeviceRow {
  id: string;
  token_hash: string;
  created_at: string;
  revoked_at: string | null;
}

async function devices(): Promise<DeviceRow[]> {
  const { results } = await env.DB.prepare('SELECT * FROM devices').all<DeviceRow>();
  return results;
}

describe('POST /api/pair', () => {
  it('Pair_ValidCode_ReturnsTokenAndStoresHashOnly', async () => {
    const res = await post('/api/pair', { pairingCode: PAIRING_CODE });
    expect(res.status).toBe(201);
    const { deviceToken } = await res.json<{ deviceToken: string }>();
    expect(deviceToken).toMatch(/^[A-Za-z0-9_-]{43}$/);

    const rows = await devices();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.token_hash).toBe(await sha256Hex(deviceToken));
    expect(rows[0]?.revoked_at).toBeNull();
    expect(JSON.stringify(rows)).not.toContain(deviceToken);
  });

  it('Pair_TwoPairings_GiveDifferentTokens', async () => {
    const a = await pairDevice();
    const b = await pairDevice();
    expect(a).not.toBe(b);
  });

  it('Pair_WrongCode_Returns401', async () => {
    const res = await post('/api/pair', { pairingCode: 'wrong-code-wrong-code' });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'invalid_code' });
    expect(await devices()).toHaveLength(0);
  });

  it.each([
    ['not json', 'this is not json'],
    ['missing field', {}],
    ['non-string code', { pairingCode: 12345 }],
    ['empty code', { pairingCode: '' }],
    ['oversized code', { pairingCode: 'x'.repeat(200) }],
  ])('Pair_MalformedBody_Returns400 (%s)', async (_label, body) => {
    const res = await post('/api/pair', body);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'bad_request' });
  });

  it('Pair_TooManyFailures_Returns429EvenForCorrectCode', async () => {
    for (let i = 0; i < 10; i++) {
      expect((await post('/api/pair', { pairingCode: `wrong-${String(i)}-xxxxxxxxxx` })).status).toBe(401);
    }
    const res = await post('/api/pair', { pairingCode: PAIRING_CODE });
    expect(res.status).toBe(429);
    const body = await res.json<{ error: string; retryAfter: number }>();
    expect(body.error).toBe('rate_limited');
    expect(body.retryAfter).toBeGreaterThan(0);
    expect(res.headers.get('retry-after')).toBe(String(body.retryAfter));
  });

  it('Pair_DeviceLimit_Returns403', async () => {
    await pairDevice();
    await pairDevice();
    const res = await post('/api/pair', { pairingCode: PAIRING_CODE });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'device_limit' });
  });

  it('Pair_RevokedDevice_FreesItsSlot', async () => {
    const a = await pairDevice();
    await pairDevice();
    expect((await del('/api/pair', bearer(a))).status).toBe(204);
    expect((await post('/api/pair', { pairingCode: PAIRING_CODE })).status).toBe(201);
  });

  it.each([
    ['unset', undefined],
    ['too short', 'short'],
  ])('Pair_CodeNotConfigured_Returns503 (%s)', async (_label, code) => {
    const req = new Request(`${BASE}/api/pair`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pairingCode: code ?? 'anything-anything' }),
    });
    const res = await handlePair(req, { ...env, PAIRING_CODE: code }, createExecutionContext());
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'pairing_disabled' });
  });
});

describe('DELETE /api/pair', () => {
  it('Unpair_ValidToken_Returns204AndRevokes', async () => {
    const token = await pairDevice();
    const res = await del('/api/pair', bearer(token));
    expect(res.status).toBe(204);
    const rows = await devices();
    expect(rows[0]?.revoked_at).not.toBeNull();
    expect((await del('/api/pair', bearer(token))).status).toBe(401);
  });

  it('Unpair_NoAuth_Returns401', async () => {
    const res = await del('/api/pair');
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
  });
});
