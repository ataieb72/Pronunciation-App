import { applyD1Migrations } from 'cloudflare:test';
import { env } from 'cloudflare:workers';
import { beforeEach, vi } from 'vitest';

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);

beforeEach(async () => {
  vi.restoreAllMocks();
  await env.DB.batch([env.DB.prepare('DELETE FROM devices'), env.DB.prepare('DELETE FROM rate_counters')]);
});
