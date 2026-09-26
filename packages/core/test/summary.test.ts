import { describe, expect, it } from 'vitest';
import { CHANGE_RULES, CUE_TEXT, pairDifference, summarizeBlock, summaryLines, type PairMeasures, type TakeMeasures } from '../src';

const usual: TakeMeasures = { ok: true, levelDb: -30, pitchRangeSt: 3, fadeDb: -3, rate: 5 };

function clear(change: Partial<TakeMeasures>): TakeMeasures {
  return { ...usual, ...change };
}

function pairs(...clears: Partial<TakeMeasures>[]): PairMeasures[] {
  return clears.map((c) => ({ usual, clear: clear(c) }));
}

describe('pairDifference', () => {
  it('Pair_Differences_Computed', () => {
    expect(pairDifference({ usual, clear: clear({ levelDb: -27, pitchRangeSt: 4.5, fadeDb: -1, rate: 4.5 }) })).toEqual({
      loudness: 3,
      pitchRange: 1.5,
      fade: 2,
      rateRatio: 0.9,
    });
  });

  it('Pair_FailedTake_NoDifference', () => {
    expect(pairDifference({ usual, clear: clear({ ok: false }) })).toBeNull();
    expect(pairDifference({ usual: { ...usual, ok: false }, clear: usual })).toBeNull();
  });

  it('Pair_MissingMeasure_Null', () => {
    expect(pairDifference({ usual, clear: clear({ fadeDb: null, pitchRangeSt: null }) })).toMatchObject({ fade: null, pitchRange: null, loudness: 0 });
  });
});

describe('summarizeBlock', () => {
  it('Summary_TooFewGoodPairs_SaysSo', () => {
    const block = [...pairs({ levelDb: -26 }, { levelDb: -26 }), { usual, clear: clear({ ok: false }) }];
    const summary = summarizeBlock(block, { previousCue: 'jaw' });
    expect(summary.status).toBe('too-few');
    expect(summary.nextCue).toBe('jaw');
    expect(summaryLines(summary).join(' ')).toContain('Not enough good pairs');
  });

  it('Summary_LouderInAllPairs_Changed', () => {
    const summary = summarizeBlock(pairs({ levelDb: -27 }, { levelDb: -26 }, { levelDb: -27.5 }, { levelDb: -25 }), { previousCue: 'jaw' });
    expect(summary.status).toBe('ok');
    expect(summary.changed).toContain('loudness');
    expect(summary.notChanged).toEqual(expect.arrayContaining(['pitchRange', 'fade']));
  });

  it('Summary_ThresholdIsMedian_SmallGainNotChanged', () => {
    const summary = summarizeBlock(pairs({ levelDb: -29 }, { levelDb: -29 }, { levelDb: -28.5 }, { levelDb: -29 }), { previousCue: 'jaw' });
    expect(CHANGE_RULES.loudnessDb).toBe(2);
    expect(summary.notChanged).toContain('loudness');
  });

  it('Summary_MixedDirections_NotChanged', () => {
    // Median +2 dB, but only 2 of 4 pairs are louder.
    const summary = summarizeBlock(pairs({ levelDb: -25 }, { levelDb: -25 }, { levelDb: -31 }, { levelDb: -31 }), { previousCue: 'jaw' });
    expect(summary.notChanged).toContain('loudness');
  });

  it('Summary_ThreeOfFourAgree_Changed', () => {
    const summary = summarizeBlock(pairs({ pitchRangeSt: 5 }, { pitchRangeSt: 4.5 }, { pitchRangeSt: 4.2 }, { pitchRangeSt: 2.5 }), { previousCue: 'jaw' });
    expect(summary.changed).toContain('pitchRange');
  });

  it('Summary_MeasureMissing_Unknown', () => {
    const summary = summarizeBlock(pairs({ fadeDb: null }, { fadeDb: null }, { fadeDb: 0 }, { fadeDb: 0 }), { previousCue: 'jaw' });
    expect(summary.unknown).toContain('fade');
    expect(summary.changed).not.toContain('fade');
    expect(summary.notChanged).not.toContain('fade');
  });

  it('Summary_NextCue_TargetsUnchangedLoudness', () => {
    const summary = summarizeBlock(pairs({ fadeDb: 0 }, { fadeDb: 0 }, { fadeDb: 0 }, { fadeDb: 0 }), { previousCue: 'jaw' });
    expect(summary.changed).toEqual(['fade']);
    expect(summary.nextCue).toBe('reach');
  });

  it('Summary_NextCue_TargetsUnchangedFade', () => {
    const summary = summarizeBlock(pairs({ levelDb: -26 }, { levelDb: -26 }, { levelDb: -26 }, { levelDb: -26 }), { previousCue: 'reach' });
    expect(summary.nextCue).toBe('lastWord');
  });

  it('Summary_NextCue_AllChanged_AlternatesJawAndEndings', () => {
    const all = { levelDb: -26, pitchRangeSt: 5, fadeDb: 0 };
    expect(summarizeBlock(pairs(all, all, all, all), { previousCue: 'jaw' }).nextCue).toBe('endings');
    expect(summarizeBlock(pairs(all, all, all, all), { previousCue: 'endings' }).nextCue).toBe('jaw');
    expect(summarizeBlock(pairs(all, all, all, all), { previousCue: 'reach' }).nextCue).toBe('jaw');
  });

  it('Summary_SlowerClear_PaceNote_NoSlowDown', () => {
    const summary = summarizeBlock(pairs({ rate: 4 }, { rate: 4 }, { rate: 4.2 }, { rate: 3.9 }), { previousCue: 'jaw' });
    expect(summary.pace).toBe('slower');
    const text = summaryLines(summary).join(' ');
    expect(text).toMatch(/normal pace/);
    expect(text.toLowerCase()).not.toContain('slow down');
  });

  it('Summary_SamePace_WithinTenPercent', () => {
    expect(summarizeBlock(pairs({ rate: 4.6 }, { rate: 5.4 }, { rate: 5 }), { previousCue: 'jaw' }).pace).toBe('same');
  });

  it('Summary_HeldThreeSessions_StillHolding', () => {
    const louder = pairs({ levelDb: -26 }, { levelDb: -26 }, { levelDb: -26 }, { levelDb: -26 });
    const held = summarizeBlock(louder, { previousCue: 'jaw', history: [['loudness'], ['loudness', 'fade'], ['loudness']] });
    expect(held.changed).not.toContain('loudness');
    expect(held.stillHolding).toEqual(['loudness']);
    expect(summaryLines(held).join(' ')).toContain('Still holding: volume');

    const notYet = summarizeBlock(louder, { previousCue: 'jaw', history: [['loudness'], [], ['loudness']] });
    expect(notYet.changed).toContain('loudness');
  });

  it('SummaryText_Cautious_NoScores', () => {
    const summary = summarizeBlock(pairs({ levelDb: -26 }, { levelDb: -26 }, { levelDb: -26 }, { levelDb: -26 }), { previousCue: 'jaw' });
    const lines = summaryLines(summary);
    expect(lines[0]).toBe('Probably changed: volume.');
    expect(lines).toContain('Not changed: pitch movement, fade at phrase ends.');
    expect(lines.at(-1)).toBe(`Next: ${CUE_TEXT.lastWord}.`);
    expect(lines.join(' ')).not.toMatch(/score|%|\/10|points/i);
  });
});
