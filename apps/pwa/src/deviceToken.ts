/**
 * The device token is this phone's credential for the Worker. It stays on the phone.
 * Storage can be blocked (private mode, cleared site data), so every call is guarded.
 */
const KEY = 'pc.deviceToken';
const DEVICE_TOKEN = /^[A-Za-z0-9_-]{43}$/;

export function loadDeviceToken(): string | null {
  try {
    const value = localStorage.getItem(KEY);
    return value !== null && DEVICE_TOKEN.test(value) ? value : null;
  } catch {
    return null;
  }
}

export function saveDeviceToken(token: string): void {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    // Storage blocked: pairing lasts only for this page visit.
  }
}

export function clearDeviceToken(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}
