import { json } from '../http';
import type { Handler } from '../router';

export const handleHealth: Handler = async (_request, env) => {
  try {
    await env.DB.prepare('SELECT 1').first();
    return json({ status: 'ok', db: true });
  } catch {
    return json({ status: 'degraded', db: false }, 503);
  }
};
