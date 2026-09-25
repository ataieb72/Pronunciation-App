import { describe, expect, it, vi } from 'vitest';
import { clearDeviceToken, loadDeviceToken, saveDeviceToken } from '../src/deviceToken';

describe('deviceToken storage', () => {
  it('Token_SaveLoadClear_RoundTrips', () => {
    expect(loadDeviceToken()).toBeNull();
    saveDeviceToken('C'.repeat(43));
    expect(loadDeviceToken()).toBe('C'.repeat(43));
    clearDeviceToken();
    expect(loadDeviceToken()).toBeNull();
  });

  it('Token_StorageThrows_LoadReturnsNull', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(loadDeviceToken()).toBeNull();
  });

  it('Token_MalformedStoredValue_IsIgnored', () => {
    localStorage.setItem('pc.deviceToken', 'not a token');
    expect(loadDeviceToken()).toBeNull();
  });
});
