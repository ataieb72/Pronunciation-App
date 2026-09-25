import { exports } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';

const BASE = 'https://app.test';

describe('router', () => {
  it('Health_Get_Returns200Ok', async () => {
    const res = await exports.default.fetch(`${BASE}/api/health`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('Health_Post_Returns405', async () => {
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
