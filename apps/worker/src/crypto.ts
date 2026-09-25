const encoder = new TextEncoder();

/** Device tokens: 32 random bytes, base64url without padding (43 characters). */
export const DEVICE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

function sha256(data: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', encoder.encode(data));
}

export async function sha256Hex(data: string): Promise<string> {
  const bytes = new Uint8Array(await sha256(data));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Compares two secrets in constant time. Hashing first gives equal-length inputs. */
export async function timingSafeEqualStrings(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([sha256(a), sha256(b)]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

export function randomToken(byteLength = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
