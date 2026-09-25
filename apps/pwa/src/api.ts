/** Client for the Worker API (same origin). See docs/api-reference.md. */

export type PairFailure = 'invalid_code' | 'device_limit' | 'rate_limited' | 'pairing_disabled' | 'bad_request' | 'network' | 'server';

export type PairResult =
  | { readonly ok: true; readonly deviceToken: string }
  | { readonly ok: false; readonly reason: PairFailure; readonly retryAfter?: number };

export type Health = 'online' | 'degraded' | 'offline';

const DEVICE_TOKEN = /^[A-Za-z0-9_-]{43}$/;
const KNOWN_FAILURES = new Set<string>(['invalid_code', 'device_limit', 'rate_limited', 'pairing_disabled', 'bad_request']);

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

function field(body: unknown, name: string): unknown {
  return typeof body === 'object' && body !== null ? (body as Record<string, unknown>)[name] : undefined;
}

export async function pair(pairingCode: string): Promise<PairResult> {
  let res: Response;
  try {
    res = await fetch('/api/pair', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pairingCode }),
    });
  } catch {
    return { ok: false, reason: 'network' };
  }

  const body = await readJson(res);
  if (res.status === 201) {
    const token = field(body, 'deviceToken');
    return typeof token === 'string' && DEVICE_TOKEN.test(token)
      ? { ok: true, deviceToken: token }
      : { ok: false, reason: 'server' };
  }

  const code = field(body, 'error');
  if (typeof code !== 'string' || !KNOWN_FAILURES.has(code)) return { ok: false, reason: 'server' };
  const reason = code as PairFailure;
  const retryAfter = field(body, 'retryAfter');
  return reason === 'rate_limited' && typeof retryAfter === 'number'
    ? { ok: false, reason, retryAfter }
    : { ok: false, reason };
}

/** Revokes this device. Returns true when the token is no longer valid on the server. */
export async function unpair(deviceToken: string): Promise<boolean> {
  try {
    const res = await fetch('/api/pair', { method: 'DELETE', headers: { authorization: `Bearer ${deviceToken}` } });
    return res.status === 204 || res.status === 401;
  } catch {
    return false;
  }
}

export async function checkHealth(): Promise<Health> {
  try {
    const res = await fetch('/api/health');
    return res.ok ? 'online' : 'degraded';
  } catch {
    return 'offline';
  }
}
