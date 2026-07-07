import { describe, it, expect } from 'vitest';
import { loadPack, validatePack, PackValidatorError } from '../lib/languagePacks';

describe('F5-T01 Language packs (TDD)', () => {
  it('PackValidator_MissingTrack_ReportsPath', () => {
    const bad = {
      exercises: [
        { id: 'bad-1', text: 'foo', focus: ['θ'], difficulty: 1, level: 'word' }
        // missing track
      ]
    };
    expect(() => validatePack(bad)).toThrow(PackValidatorError);
    try {
      validatePack(bad);
    } catch (e: any) {
      expect(e.message).toContain('exercises[0].track');
      expect(e.path).toBe('exercises[0].track');
    }
  });

  it('Loader_UnknownLocale_Throws', () => {
    expect(() => loadPack('xx-XX')).toThrow(/unknown locale/i);
  });

  it('Loader loads en-US with phoneme lookup', () => {
    const pack = loadPack('en-US');
    expect(pack.phonemes['θ']).toBeDefined();
    expect(pack.phonemes['θ'].example).toBeTruthy();
  });
});
