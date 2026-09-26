import { describe, expect, it } from 'vitest';
import { phraseEndFade } from '../src/fade';
import { syllableNuclei } from '../src/rhythm';
import { speechLevelDbfs } from '../src/speechLevel';
import { loadGolden } from './golden';
import { concat, mix, noise, sine } from './signals';

const SR = 16_000;
const floor = (seconds: number, seed = 1) => noise(SR, seconds, -70, seed);
const tone = (seconds: number, amplitude: number, seed: number) => mix(sine(180, SR, seconds, amplitude), floor(seconds, seed));

/** Tone "syllables" (150 ms loud, 100 ms 20 dB softer); the last one `lastDb` louder or softer. */
function phrase(count: number, lastDb: number): Float32Array {
  const parts: Float32Array[] = [floor(0.4)];
  for (let i = 0; i < count; i++) {
    const amplitude = 0.1 * 10 ** ((i === count - 1 ? lastDb : 0) / 20);
    parts.push(tone(0.15, amplitude, 10 + i), tone(0.1, amplitude / 10, 30 + i));
  }
  parts.push(floor(0.4, 3));
  return concat(...parts);
}

const golden = loadGolden();
const byName = (name: string) => golden.find((f) => f.name === name);

describe('speech level', () => {
  it('Level_GainChange_ShiftsExactly', () => {
    const fixture = byName('en1-normal');
    if (!fixture) throw new Error('missing fixture');
    const half = fixture.samples.map((v) => v * 0.5);
    const level = (x: Float32Array) => speechLevelDbfs(x, SR, syllableNuclei(x, SR).sounding) ?? Number.NaN;
    expect(level(half) - level(fixture.samples)).toBeCloseTo(20 * Math.log10(0.5), 1);
  });

  it('Level_NothingSounding_Null', () => {
    expect(speechLevelDbfs(floor(1), SR, [])).toBeNull();
  });

  it.each(golden)('Level_MatchesPraat ($name)', ({ samples, sampleRate, expected }) => {
    const level = speechLevelDbfs(samples, sampleRate, syllableNuclei(samples, sampleRate).sounding);
    expect(Math.abs((level ?? Number.NaN) - (expected.speechLevelDbfs ?? Number.NaN))).toBeLessThanOrEqual(0.5);
  });

  it.each(['en1', 'fr1'])('Level_QuietVersion_20dBLower (%s)', (sentence) => {
    const level = (name: string) => {
      const f = byName(name);
      return f ? (speechLevelDbfs(f.samples, SR, syllableNuclei(f.samples, SR).sounding) ?? Number.NaN) : Number.NaN;
    };
    expect(Math.abs(level(`${sentence}-quiet`) - level(`${sentence}-normal`) - -20)).toBeLessThanOrEqual(0.5);
  });
});

describe('fade at phrase ends', () => {
  it('Fade_SofterLastSyllable_Negative', () => {
    const { medianDb } = phraseEndFade(syllableNuclei(phrase(5, -8), SR));
    expect(Math.abs((medianDb ?? Number.NaN) - -8)).toBeLessThanOrEqual(1.5);
  });

  it('Fade_EvenSyllables_NearZero', () => {
    const { medianDb } = phraseEndFade(syllableNuclei(phrase(5, 0), SR));
    expect(Math.abs(medianDb ?? Number.NaN)).toBeLessThanOrEqual(1);
  });

  it('Fade_TooFewPeaks_Null', () => {
    expect(phraseEndFade(syllableNuclei(phrase(2, 0), SR))).toEqual({ perPhraseDb: [], medianDb: null });
  });

  it.each(golden)('Fade_MatchesPraat ($name)', ({ samples, sampleRate, expected }) => {
    const fade = phraseEndFade(syllableNuclei(samples, sampleRate));
    expect(fade.perPhraseDb).toHaveLength(expected.fade.perPhraseDb.length);
    fade.perPhraseDb.forEach((v, i) => {
      expect(Math.abs(v - (expected.fade.perPhraseDb[i] ?? Number.NaN))).toBeLessThanOrEqual(1);
    });
    if (expected.fade.medianDb === null) expect(fade.medianDb).toBeNull();
    else expect(Math.abs((fade.medianDb ?? Number.NaN) - expected.fade.medianDb)).toBeLessThanOrEqual(1);
  });

  it.each(['en1', 'fr1'])('Fade_FadingVersion_MoreNegative (%s)', (sentence) => {
    const fade = (name: string) => {
      const f = byName(name);
      return f ? (phraseEndFade(syllableNuclei(f.samples, SR)).medianDb ?? Number.NaN) : Number.NaN;
    };
    expect(fade(`${sentence}-fade`)).toBeLessThan(fade(`${sentence}-normal`) - 1);
  });
});
