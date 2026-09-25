import { createExecutionContext } from 'cloudflare:test';
import { env, exports } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { handleHealth } from '../src/routes/health';
import { BASE } from './helpers';

describe('router and health', () => {
  it('Health_DbUp_Returns200', async () => {
    const res = await exports.default.fetch(`${BASE}/api/health`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(await res.json()).toEqual({ status: 'ok', db: true });
  });

  it('Health_DbDown_Returns503', async () => {
    const brokenDb = {
      prepare: () => {
        throw new Error('D1 unavailable');
      },
    } as unknown as D1Database;
    const res = await handleHealth(new Request(`${BASE}/api/health`), { ...env, DB: brokenDb }, createExecutionContext());
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ status: 'degraded', db: false });
  });

  it('Health_Post_Returns405WithAllow', async () => {
    const res = await exports.default.fetch(`${BASE}/api/health`, { method: 'POST' });
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('GET');
  });

  it('UnknownApiRoute_Returns404Json', async () => {
    const res = await exports.default.fetch(`${BASE}/api/nope`);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'not_found' });
  });

  it('ApiResponses_AreNotCached', async () => {
    const res = await exports.default.fetch(`${BASE}/api/health`);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
});
