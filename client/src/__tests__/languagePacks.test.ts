import { describe, it, expect } from 'vitest';
import { loadPack, validatePack, PackValidatorError } from '../lib/languagePacks';

describe('F5-T01 Language packs (TDD)', () => {
  it('PackValidator_MissingTrack_ReportsPath', () => {
    const bad = {
      phonemes: { "θ": { ipa: "θ", example: "three", difficulty: 2 } },
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

  it('ContentAudit_EnUs_MeetsMinimumCounts', () => {
    const pack = loadPack('en-US');
    const phonemeCount = pack.exercises.filter(e => e.track === 'phoneme').length;
    const artCount = pack.exercises.filter(e => e.track === 'articulation').length;
    const prosCount = pack.exercises.filter(e => e.track === 'prosody').length;
    expect(phonemeCount).toBeGreaterThanOrEqual(3);
    expect(artCount).toBeGreaterThanOrEqual(2);
    expect(prosCount).toBeGreaterThanOrEqual(1);
  });

  it('ContentAudit_FrFr_MeetsMinimumCounts', () => {
    const pack = loadPack('fr-FR');
    const phonemeCount = pack.exercises.filter(e => e.track === 'phoneme').length;
    const artCount = pack.exercises.filter(e => e.track === 'articulation').length;
    const prosCount = pack.exercises.filter(e => e.track === 'prosody').length;

    // Minimum per epic/PRD for French
    expect(phonemeCount).toBeGreaterThanOrEqual(5);
    expect(artCount).toBeGreaterThanOrEqual(3);
    expect(prosCount).toBeGreaterThanOrEqual(2);

    // All focus phonemes must exist in phonemes.json
    pack.exercises.forEach(ex => {
      ex.focus.forEach(f => {
        expect(pack.phonemes[f]).toBeDefined();
      });
    });
  });
});
