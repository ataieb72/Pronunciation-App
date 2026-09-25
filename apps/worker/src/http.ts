/** JSON response. API responses are never cached. */
export function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  const h = new Headers(headers);
  h.set('content-type', 'application/json; charset=utf-8');
  h.set('cache-control', 'no-store');
  return new Response(JSON.stringify(body), { status, headers: h });
}

export function error(code: string, status: number, headers: HeadersInit = {}): Response {
  return json({ error: code }, status, headers);
}

export function noContent(): Response {
  return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
}

export function rateLimited(retryAfterSeconds: number): Response {
  return json({ error: 'rate_limited', retryAfter: retryAfterSeconds }, 429, {
    'retry-after': String(retryAfterSeconds),
  });
}

/** Parses a JSON body; returns undefined when the body is missing or invalid. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json<unknown>();
  } catch {
    return undefined;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function positiveInt(value: string | undefined, fallback: number): number {
  const n = value === undefined ? Number.NaN : Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}
