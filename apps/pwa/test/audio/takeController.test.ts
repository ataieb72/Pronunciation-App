import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AudioSource } from '../../src/audio/microphone';
import { createTakeController, type TakeProgress } from '../../src/audio/takeController';
import { hush, join, MIC_RATE, syllables, withFloor } from './signals';

function fakeSource() {
  let listener: ((batch: Float32Array) => void) | null = null;
  const source: AudioSource & { emit(signal: Float32Array): void } = {
    sampleRate: MIC_RATE,
    mic: { label: 'Fake mic', requested: {}, applied: { echoCancellation: false }, capabilities: null, contextSampleRate: MIC_RATE },
    listen(l) {
      listener = l;
    },
    close: () => Promise.resolve(),
    emit(signal) {
      for (let i = 0; i < signal.length; i += 1024) listener?.(signal.subarray(i, i + 1024));
    },
  };
  return source;
}

let visibility: DocumentVisibilityState = 'visible';
Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });
const hide = () => {
  visibility = 'hidden';
  document.dispatchEvent(new Event('visibilitychange'));
};
afterEach(() => {
  visibility = 'visible';
});

const speech = () => join(hush(0.3), withFloor(syllables(1.5)), hush(1.5, MIC_RATE, 3));

describe('take controller', () => {
  it('Controller_SpeechThenSilence_ResolvesDone', async () => {
    const source = fakeSource();
    const controller = createTakeController(source, { document });
    const outcome = controller.start('sentence');
    source.emit(speech());
    const result = await outcome;
    expect(result.status).toBe('done');
    if (result.status === 'done') expect(result.take.stopReason).toBe('silence');
    expect(controller.recording).toBe(false);
  });

  it('Session_PageHidden_DiscardsTake', async () => {
    const source = fakeSource();
    const controller = createTakeController(source, { document });
    const outcome = controller.start('talk');
    source.emit(join(hush(0.3), withFloor(syllables(1))));
    hide();
    expect(await outcome).toEqual({ status: 'discarded', reason: 'page-hidden' });
    expect(controller.recording).toBe(false);
  });

  it('Controller_ManualStop_ResolvesManual', async () => {
    const source = fakeSource();
    const controller = createTakeController(source, { document });
    const outcome = controller.start('talk');
    source.emit(join(hush(0.3), withFloor(syllables(1))));
    controller.stop();
    const result = await outcome;
    expect(result.status === 'done' && result.take.stopReason).toBe('manual');
  });

  it('Controller_WakeLock_HeldWhileRecording', async () => {
    const release = vi.fn(() => Promise.resolve());
    const request = vi.fn(() => Promise.resolve({ release }));
    const source = fakeSource();
    const controller = createTakeController(source, { document, wakeLock: { request } });
    const outcome = controller.start('sentence');
    await Promise.resolve();
    expect(request).toHaveBeenCalledWith('screen');
    source.emit(speech());
    await outcome;
    await vi.waitFor(() => {
      expect(release).toHaveBeenCalledTimes(1);
    });
  });

  it('Controller_WakeLockRefused_StillRecords', async () => {
    const source = fakeSource();
    const controller = createTakeController(source, { document, wakeLock: { request: () => Promise.reject(new Error('denied')) } });
    const outcome = controller.start('sentence');
    source.emit(speech());
    expect((await outcome).status).toBe('done');
  });

  it('Controller_Progress_ReportsElapsedAndSpeaking', async () => {
    const source = fakeSource();
    const controller = createTakeController(source, { document });
    const progress = vi.fn<(p: TakeProgress) => void>();
    const outcome = controller.start('sentence', progress);
    source.emit(speech());
    await outcome;
    expect(progress).toHaveBeenCalled();
    expect(progress.mock.calls.some(([p]) => p.speaking)).toBe(true);
  });

  it('Controller_StartWhileRecording_Throws', () => {
    const controller = createTakeController(fakeSource(), { document });
    void controller.start('word');
    expect(() => controller.start('word')).toThrow(/already/);
    controller.stop();
  });
});
