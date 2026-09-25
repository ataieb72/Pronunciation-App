import { exports } from 'cloudflare:workers';

export const BASE = 'https://app.test';
export const PAIRING_CODE = 'correct-horse-battery-staple';
export const AZURE_KEY = 'test-azure-key-0123456789abcdef0123';

export function post(path: string, body?: unknown, headers: HeadersInit = {}): Promise<Response> {
  const h = new Headers(headers);
  h.set('content-type', 'application/json');
  return exports.default.fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: h,
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
}

export function del(path: string, headers: HeadersInit = {}): Promise<Response> {
  return exports.default.fetch(`${BASE}${path}`, { method: 'DELETE', headers });
}

export async function pairDevice(): Promise<string> {
  const res = await post('/api/pair', { pairingCode: PAIRING_CODE });
  if (res.status !== 201) throw new Error(`pairing failed: ${String(res.status)}`);
  const body: { deviceToken: string } = await res.json();
  return body.deviceToken;
}

export function bearer(token: string): HeadersInit {
  return { authorization: `Bearer ${token}` };
}
