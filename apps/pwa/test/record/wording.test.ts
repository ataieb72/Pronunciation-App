import { describe, expect, it } from 'vitest';
import { distanceCheck } from '../../src/record/distance';
import { distanceText, retakeText, stopText } from '../../src/record/messages';

describe('distance check', () => {
  it('DistanceCheck_FewTakes_Building', () => {
    expect(distanceCheck(-25, [-24, -26])).toEqual({ status: 'building', have: 2, need: 3 });
  });

  it('DistanceCheck_FarOff_AsksToAdjust', () => {
    const louder = distanceCheck(-18, [-30, -29, -31, -30]);
    expect(louder).toMatchObject({ status: 'louder', usualDb: -30 });
    expect(louder?.status === 'louder' && louder.diffDb).toBeCloseTo(12, 5);
    expect(distanceText(louder)).toMatch(/12 dB louder than your usual/);
    expect(distanceCheck(-40, [-30, -30, -30])).toMatchObject({ status: 'quieter' });
  });

  it('DistanceCheck_Close_Ok', () => {
    expect(distanceCheck(-28, [-30, -29, -31])).toMatchObject({ status: 'ok' });
    expect(distanceText(distanceCheck(-28, [-30, -29, -31]))).toBeNull();
  });

  it('DistanceCheck_UsesLast10Takes', () => {
    const old = Array<number>(20).fill(-50);
    const recent = Array<number>(10).fill(-30);
    expect(distanceCheck(-30, [...old, ...recent])).toMatchObject({ status: 'ok', usualDb: -30 });
  });

  it('DistanceCheck_NoLevel_Null', () => {
    expect(distanceCheck(null, [-30, -30, -30])).toBeNull();
  });
});

describe('messages', () => {
  it('StopText_EachReason', () => {
    expect(stopText('silence')).toMatch(/finished speaking/);
    expect(stopText('cap')).toMatch(/time limit/);
    expect(stopText('manual')).toBe('Stopped.');
  });

  it('RetakeText_EachReason_PlainWords', () => {
    expect(retakeText('clipped')).toMatch(/further away/);
    expect(retakeText('too-quiet')).toMatch(/hand-span/);
    expect(retakeText('noisy')).toMatch(/quieter place/);
    // Below about 10 dB SNR the detector hears no speech, so "too short" covers noise too (R2-T02).
    expect(retakeText('too-short')).toMatch(/No speech heard.*quieter place/);
  });
});
