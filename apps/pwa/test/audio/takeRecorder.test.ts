import { describe, expect, it } from 'vitest';
import { createTakeRecorder, PRE_ROLL_S, TAKE_RULES } from '../../src/audio/takeRecorder';
import { feed, hush, join, MIC_RATE, syllables, tone, withFloor } from './signals';

describe('take recorder', () => {
  it('Session_SpeechThenSilence_StopsAfter800ms', () => {
    const recorder = createTakeRecorder('sentence', MIC_RATE);
    let reason: string | null = null;
    feed((c) => (reason = recorder.push(c)), join(hush(0.5), withFloor(tone(1)), hush(3, MIC_RATE, 3)));
    expect(reason).toBe('silence');
    // Speech ends at 1.5 s; the take stops 0.8 s later (within one 21 ms batch).
    expect(Math.abs(recorder.elapsedS - 2.3)).toBeLessThanOrEqual(0.05);
  });

  it('Session_Cap_StopsAtCap', () => {
    const recorder = createTakeRecorder('word', MIC_RATE);
    let reason: string | null = null;
    feed((c) => (reason = recorder.push(c)), join(hush(0.3), withFloor(syllables(10))));
    expect(reason).toBe('cap');
    const take = recorder.finish();
    expect(take.stopReason).toBe('cap');
    // The cap is exact even when the last batch runs past it.
    expect(take.sourceDurationS).toBeCloseTo(TAKE_RULES.word.capS, 3);
  });

  it('Session_TalkPause_DoesNotStop', () => {
    const recorder = createTakeRecorder('talk', MIC_RATE);
    let reason: string | null = null;
    feed((c) => (reason = recorder.push(c)), join(hush(0.3), withFloor(tone(2)), hush(2, MIC_RATE, 3), withFloor(tone(2), 4), hush(6, MIC_RATE, 5)));
    expect(reason).toBe('silence');
    // A 2 s thinking pause is fine in a talk; it stops 4 s after the last speech (6.3 s).
    expect(Math.abs(recorder.elapsedS - 10.3)).toBeLessThanOrEqual(0.05);
  });

  it('Session_PreRoll_Keeps300ms', () => {
    const recorder = createTakeRecorder('sentence', MIC_RATE);
    feed((c) => recorder.push(c), join(hush(2), withFloor(tone(1)), hush(2, MIC_RATE, 3)));
    const take = recorder.finish();
    expect(take.startOffsetS).toBeCloseTo(2 - PRE_ROLL_S, 1);
    expect(Math.abs((take.speech[0]?.start ?? 0) - PRE_ROLL_S)).toBeLessThanOrEqual(0.02);
  });

  it('Session_Output_Is16kHz', () => {
    const recorder = createTakeRecorder('sentence', MIC_RATE);
    feed((c) => recorder.push(c), join(hush(0.3), withFloor(tone(1)), hush(1.5, MIC_RATE, 3)));
    const take = recorder.finish();
    expect(take.sampleRate).toBe(16_000);
    expect(take.samples.length).toBe(Math.round((take.sourceDurationS - take.startOffsetS) * 16_000));
  });

  it('Session_ManualStop_KeepsWhatWasSaid', () => {
    const recorder = createTakeRecorder('talk', MIC_RATE);
    feed((c) => recorder.push(c), join(hush(0.3), withFloor(tone(1.2))));
    const take = recorder.finish('manual');
    expect(take.stopReason).toBe('manual');
    expect(take.speech).toHaveLength(1);
  });

  it('Session_SteadyToneOver3s_TreatedAsBackground', () => {
    // Known limit: the detector follows the room, so a held sound becomes background after about
    // 3 s. Held-vowel takes (R2-T08) must stay under 3 s.
    const recorder = createTakeRecorder('word', MIC_RATE);
    let reason: string | null = null;
    feed((c) => (reason = recorder.push(c)), join(hush(0.3), withFloor(tone(10))));
    expect(reason).toBe('silence');
    expect(recorder.elapsedS).toBeLessThan(TAKE_RULES.word.capS);
  });

  it('Session_AfterStop_IgnoresAudio', () => {
    const recorder = createTakeRecorder('word', MIC_RATE);
    feed((c) => recorder.push(c), join(hush(0.3), withFloor(syllables(9))));
    const before = recorder.elapsedS;
    expect(recorder.push(tone(1))).toBe('cap');
    expect(recorder.elapsedS).toBe(before);
  });
});
