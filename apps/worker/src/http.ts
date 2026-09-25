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
