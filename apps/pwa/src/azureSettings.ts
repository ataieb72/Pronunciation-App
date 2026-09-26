/**
 * The owner's Azure Speech key and region (ADR 002). The owner types them once on the phone.
 * They live only in this browser's storage: never in the app files, the repository or a server.
 * Storage can be blocked (private mode, cleared site data), so every call is guarded.
 */
export interface AzureSettings {
  readonly key: string;
  readonly region: string;
}

export type ParseResult =
  | { readonly ok: true; readonly settings: AzureSettings }
  | { readonly ok: false; readonly problem: 'key' | 'region' };

const STORAGE_KEY = 'pc.azure';
// Older keys have 32 hex characters; newer ones have 84 letters and digits.
const KEY_PATTERN = /^[A-Za-z0-9]{32,128}$/;
// A plain region name, so a typo can never send the key to another host.
const REGION_PATTERN = /^[a-z0-9]{2,32}$/;

export function parseAzureSettings(input: { key: string; region: string }): ParseResult {
  const key = input.key.trim();
  // The portal shows both "UK South" and "uksouth"; Azure wants the second form.
  const region = input.region.trim().toLowerCase().replaceAll(' ', '');
  if (!KEY_PATTERN.test(key)) return { ok: false, problem: 'key' };
  if (!REGION_PATTERN.test(region)) return { ok: false, problem: 'region' };
  return { ok: true, settings: { key, region } };
}

export function loadAzureSettings(): AzureSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return null;
    const { key, region } = value as Record<string, unknown>;
    if (typeof key !== 'string' || typeof region !== 'string') return null;
    const parsed = parseAzureSettings({ key, region });
    return parsed.ok ? parsed.settings : null;
  } catch {
    return null;
  }
}

/** Returns false when the phone refuses storage; the key then lasts only for this visit. */
export function saveAzureSettings(settings: AzureSettings): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

export function clearAzureSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

/** Enough to recognise the key, never enough to use it. */
export function maskKey(key: string): string {
  return `…${key.slice(-4)}`;
}

/** Removes the key from text that may be shown, stored or shared, such as an SDK error message. */
export function redactKey(text: string, key: string): string {
  return text.replaceAll(key, '[key]');
}
