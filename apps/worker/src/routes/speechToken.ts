import { authenticateDevice } from '../auth';
import { error, json, positiveInt, rateLimited } from '../http';
import { dayWindow, hit, hourWindow, secondsUntilNextDay, secondsUntilNextHour } from '../rateLimit';
import type { Handler } from '../router';

const HOURLY_LIMIT = 30;
const DAILY_LIMIT = 200;
/** Azure access tokens last 10 minutes. The phone should refresh after about 9. */
const TOKEN_LIFETIME_MS = 10 * 60_000;
const DEFAULT_TIMEOUT_MS = 5_000;
/** A plain Azure region name. Anything else could redirect the key to another host. */
const REGION_PATTERN = /^[a-z0-9]{2,32}$/;

export const handleSpeechToken: Handler = async (request, env) => {
  const device = await authenticateDevice(request, env.DB);
  if (!device) return error('unauthorized', 401);

  const key = env.AZURE_SPEECH_KEY;
  const region = env.AZURE_SPEECH_REGION;
  if (key === undefined || key === '' || region === undefined || !REGION_PATTERN.test(region)) {
    return error('speech_not_configured', 503);
  }

  const now = new Date();
  const [hourCount = 0, dayCount = 0] = await hit(env.DB, `token:${device.id}`, [hourWindow(now), dayWindow(now)], now);
  if (dayCount > DAILY_LIMIT) return rateLimited(secondsUntilNextDay(now));
  if (hourCount > HOURLY_LIMIT) return rateLimited(secondsUntilNextHour(now));

  let azure: Response;
  try {
    azure = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': key },
      body: '',
      signal: AbortSignal.timeout(positiveInt(env.AZURE_TOKEN_TIMEOUT_MS, DEFAULT_TIMEOUT_MS)),
    });
  } catch (e) {
    // Log the error type only: never the key, never the request.
    console.warn('azure token request failed:', e instanceof Error ? e.name : 'unknown');
    return error('azure_unavailable', 502);
  }
  if (!azure.ok) {
    console.warn('azure token request rejected: status', azure.status);
    return error('azure_unavailable', 502);
  }
  const token = await azure.text();
  if (token === '') return error('azure_unavailable', 502);

  return json({ token, region, expiresAt: new Date(now.getTime() + TOKEN_LIFETIME_MS).toISOString() });
};
