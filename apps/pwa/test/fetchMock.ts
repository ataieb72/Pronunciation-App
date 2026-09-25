import { vi } from 'vitest';

type Route = (init?: RequestInit) => Response | Promise<Response>;

/** Stubs global fetch with a table of "METHOD /path" handlers. Unknown routes fail the test. */
export function mockFetch(routes: Record<string, Route>) {
  const fn = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const path = new URL(url, 'https://app.test').pathname;
    const key = `${init?.method ?? 'GET'} ${path}`;
    const route = routes[key];
    if (!route) return Promise.reject(new Error(`unexpected fetch: ${key}`));
    return Promise.resolve(route(init));
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
}
