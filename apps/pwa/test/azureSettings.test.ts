import { describe, expect, it, vi } from 'vitest';
import {
  clearAzureSettings,
  loadAzureSettings,
  maskKey,
  parseAzureSettings,
  redactKey,
  saveAzureSettings,
} from '../src/azureSettings';

const KEY32 = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
const KEY84 = 'Ab1'.repeat(28);

describe('parseAzureSettings', () => {
  it('Parse_ValidKeyAndRegion_ReturnsSettings', () => {
    expect(parseAzureSettings({ key: KEY32, region: 'uksouth' })).toEqual({
      ok: true,
      settings: { key: KEY32, region: 'uksouth' },
    });
  });

  it('Parse_LongNewStyleKey_IsAccepted', () => {
    expect(parseAzureSettings({ key: KEY84, region: 'uksouth' }).ok).toBe(true);
  });

  it('Parse_SpacesAroundKey_AreTrimmed', () => {
    expect(parseAzureSettings({ key: `  ${KEY32}\n`, region: 'uksouth' })).toEqual({
      ok: true,
      settings: { key: KEY32, region: 'uksouth' },
    });
  });

  it('Parse_DisplayNameRegion_IsNormalised', () => {
    // The portal shows "UK South" in some places and "uksouth" in others.
    expect(parseAzureSettings({ key: KEY32, region: ' France Central ' })).toEqual({
      ok: true,
      settings: { key: KEY32, region: 'francecentral' },
    });
  });

  it.each([
    ['too short', 'abc123'],
    ['has a symbol', `${KEY32.slice(0, 31)}!`],
    ['has an inner space', `${KEY32.slice(0, 16)} ${KEY32.slice(16)}`],
    ['empty', ''],
  ])('Parse_BadKey_%s_ReturnsKeyProblem', (_label, key) => {
    expect(parseAzureSettings({ key, region: 'uksouth' })).toEqual({ ok: false, problem: 'key' });
  });

  it.each([
    ['empty', ''],
    ['a URL', 'https://uksouth.api.cognitive.microsoft.com'],
    ['a dotted host', 'evil.example'],
  ])('Parse_BadRegion_%s_ReturnsRegionProblem', (_label, region) => {
    expect(parseAzureSettings({ key: KEY32, region })).toEqual({ ok: false, problem: 'region' });
  });
});

describe('Azure settings storage', () => {
  it('Settings_SaveLoadClear_RoundTrips', () => {
    expect(loadAzureSettings()).toBeNull();
    expect(saveAzureSettings({ key: KEY32, region: 'uksouth' })).toBe(true);
    expect(loadAzureSettings()).toEqual({ key: KEY32, region: 'uksouth' });
    clearAzureSettings();
    expect(loadAzureSettings()).toBeNull();
  });

  it('Settings_StorageThrowsOnLoad_ReturnsNull', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(loadAzureSettings()).toBeNull();
  });

  it('Settings_StorageThrowsOnSave_ReturnsFalse', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    expect(saveAzureSettings({ key: KEY32, region: 'uksouth' })).toBe(false);
  });

  it.each([
    ['not JSON', '{oops'],
    ['wrong shape', JSON.stringify({ key: 1, region: 'uksouth' })],
    ['bad region', JSON.stringify({ key: KEY32, region: 'evil.example' })],
  ])('Settings_StoredValue_%s_IsIgnored', (_label, raw) => {
    localStorage.setItem('pc.azure', raw);
    expect(loadAzureSettings()).toBeNull();
  });
});

describe('maskKey', () => {
  it('MaskKey_ShowsLastFourOnly', () => {
    expect(maskKey(KEY32)).toBe('…c5d6');
    expect(maskKey(KEY32)).not.toContain(KEY32.slice(0, 8));
  });
});

describe('redactKey', () => {
  it('Redact_KeyInText_IsReplacedEverywhere', () => {
    const text = `wss://uksouth.stt.speech.microsoft.com/x?Ocp-Apim-Subscription-Key=${KEY32}&a=1 (${KEY32})`;
    const out = redactKey(text, KEY32);
    expect(out).not.toContain(KEY32);
    expect(out).toContain('Ocp-Apim-Subscription-Key=[key]&a=1 ([key])');
  });

  it('Redact_NoKeyInText_ReturnsTextUnchanged', () => {
    expect(redactKey('Unable to contact server. StatusCode: 1006', KEY32)).toBe('Unable to contact server. StatusCode: 1006');
  });
});
