import { authenticateDevice } from '../auth';
import { randomToken, sha256Hex, timingSafeEqualStrings } from '../crypto';
import { error, isRecord, json, noContent, positiveInt, rateLimited, readJson } from '../http';
import { hit, hourWindow, peek, secondsUntilNextHour } from '../rateLimit';
import type { Handler } from '../router';

/** A shorter code would be too easy to guess, so pairing stays off until the secret is strong enough. */
const MIN_CODE_LENGTH = 12;
const MAX_CODE_LENGTH = 128;
/** Failed attempts allowed per hour, across all callers. */
const MAX_FAILURES_PER_HOUR = 10;
const DEFAULT_MAX_DEVICES = 2;
const FAILURE_SCOPE = 'pair-fail';

export const handlePair: Handler = async (request, env) => {
  const pairingCode = env.PAIRING_CODE;
  if (pairingCode === undefined || pairingCode.length < MIN_CODE_LENGTH) {
    return error('pairing_disabled', 503);
  }

  const body = await readJson(request);
  const submitted = isRecord(body) ? body['pairingCode'] : undefined;
  if (typeof submitted !== 'string' || submitted.length === 0 || submitted.length > MAX_CODE_LENGTH) {
    return error('bad_request', 400);
  }

  const now = new Date();
  const window = hourWindow(now);
  if ((await peek(env.DB, FAILURE_SCOPE, window)) >= MAX_FAILURES_PER_HOUR) {
    return rateLimited(secondsUntilNextHour(now));
  }

  if (!(await timingSafeEqualStrings(submitted, pairingCode))) {
    await hit(env.DB, FAILURE_SCOPE, [window], now);
    return error('invalid_code', 401);
  }

  const maxDevices = positiveInt(env.MAX_DEVICES, DEFAULT_MAX_DEVICES);
  const active = await env.DB.prepare('SELECT COUNT(*) AS n FROM devices WHERE revoked_at IS NULL').first<{ n: number }>();
  if ((active?.n ?? 0) >= maxDevices) {
    return error('device_limit', 403);
  }

  const deviceToken = randomToken();
  await env.DB.prepare('INSERT INTO devices (id, token_hash, created_at) VALUES (?, ?, ?)')
    .bind(crypto.randomUUID(), await sha256Hex(deviceToken), now.toISOString())
    .run();
  return json({ deviceToken }, 201);
};

export const handleUnpair: Handler = async (request, env) => {
  const device = await authenticateDevice(request, env.DB);
  if (!device) return error('unauthorized', 401);
  await env.DB.prepare('UPDATE devices SET revoked_at = ? WHERE id = ?').bind(new Date().toISOString(), device.id).run();
  return noContent();
};
