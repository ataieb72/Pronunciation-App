import { DEVICE_TOKEN_PATTERN, sha256Hex } from './crypto';

export interface Device {
  readonly id: string;
}

/** Returns the active device for a `Bearer <deviceToken>` header, or null. */
export async function authenticateDevice(request: Request, db: D1Database): Promise<Device | null> {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  if (!DEVICE_TOKEN_PATTERN.test(token)) return null;
  return db
    .prepare('SELECT id FROM devices WHERE token_hash = ? AND revoked_at IS NULL')
    .bind(await sha256Hex(token))
    .first<Device>();
}
