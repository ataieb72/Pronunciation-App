import { beforeEach, describe, expect, it, vi } from 'vitest';

// A small stand-in for the Azure Speech SDK: just the parts the phone test uses.
const fake = vi.hoisted(() => {
  const PropertyId = { WebWorkerLoadType: 65, SpeechServiceResponse_JsonResult: 5000 } as const;
  const ResultReason = { Canceled: 1, RecognizedSpeech: 3 } as const;
  const CancellationReason = { Error: 0, EndOfStream: 1 } as const;
  const configs: { setProperty: ReturnType<typeof vi.fn> }[] = [];

  class SpeechRecognizer {
    recognized: ((s: unknown, e: unknown) => void) | undefined;
    canceled: ((s: unknown, e: unknown) => void) | undefined;
    sessionStopped: ((s: unknown, e: unknown) => void) | undefined;
    startContinuousRecognitionAsync(ok: () => void) {
      ok();
      setTimeout(() => {
        this.recognized?.(this, {
          result: { reason: ResultReason.RecognizedSpeech, text: 'Hello there.', properties: { getProperty: () => '{}' } },
        });
        this.sessionStopped?.(this, {});
      }, 0);
    }
    stopContinuousRecognitionAsync(ok: () => void) {
      ok();
    }
    close() {
      // Nothing to release in the fake.
    }
  }

  const sdk = {
    PropertyId,
    ResultReason,
    CancellationReason,
    OutputFormat: { Detailed: 1 },
    SpeechConfig: {
      fromSubscription: () => {
        const config = { setProperty: vi.fn(), speechRecognitionLanguage: '', outputFormat: 0 };
        configs.push(config);
        return config;
      },
    },
    AudioStreamFormat: { getWaveFormatPCM: () => ({}) },
    AudioInputStream: { createPushStream: () => ({ write: vi.fn(), close: vi.fn() }) },
    AudioConfig: { fromStreamInput: () => ({}) },
    SpeechRecognizer,
  };
  return { sdk, configs, PropertyId };
});

vi.mock('microsoft-cognitiveservices-speech-sdk', () => fake.sdk);

const { transcribeContinuous } = await import('../../src/spike/azure');

const azure = { key: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', region: 'uksouth' };

describe('Azure phone-test calls', () => {
  beforeEach(() => {
    fake.configs.length = 0;
  });

  it('Azure_SdkTimerWorker_IsTurnedOff', async () => {
    // The SDK paces audio after the first 5 s with timers in a web worker loaded from a data: URL.
    // The app's content security policy blocks that worker, so long takes stalled at 5 s.
    await transcribeContinuous({ azure, language: 'en-US', pcm16: new Int16Array(16_000) });
    expect(fake.configs).toHaveLength(1);
    expect(fake.configs[0]?.setProperty).toHaveBeenCalledWith(fake.PropertyId.WebWorkerLoadType, 'off');
  });

  it('Transcribe_SessionStops_ReturnsTexts', async () => {
    const result = await transcribeContinuous({ azure, language: 'fr-FR', pcm16: new Int16Array(16_000) });
    expect(result.texts).toEqual(['Hello there.']);
  });
});
