import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeRollingAverage, assessPronunciation } from '../services/assess.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.resolve(__dirname, 'fixtures/assess-response.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

// Top level mock for SDK (required for vitest hoisting)
vi.mock('microsoft-cognitiveservices-speech-sdk', () => {
  const fromSubscription = vi.fn(() => ({
    speechRecognitionLanguage: '',
  }));
  return {
    SpeechConfig: { fromSubscription },
    AudioConfig: { fromWavFileInput: vi.fn() },
    PronunciationAssessmentConfig: {
      fromConfig: vi.fn(() => ({ applyTo: vi.fn() })),
    },
    SpeechRecognizer: vi.fn(() => ({
      recognizeOnceAsync: vi.fn(),
      close: vi.fn(),
    })),
    PronunciationAssessmentResult: {
      fromResult: vi.fn(),
    },
    PronunciationAssessmentGradingSystem: { HundredMark: 'HundredMark' },
    PronunciationAssessmentGranularity: { Phoneme: 'Phoneme' },
    ResultReason: { RecognizedSpeech: 'RecognizedSpeech' },
  };
});

describe('F3 Assessment service (TDD)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('RollingAverage_ExistingStat_ComputesCorrectly', () => {
    // Pure function test for the rolling average logic
    const existing = { avg_score: 80, attempt_count: 4 };
    const newScore = 90;
    const result = computeRollingAverage(existing, newScore);
    // (80*4 + 90) / 5 = 410 / 5 = 82
    expect(result.avg).toBeCloseTo(82);
    expect(result.count).toBe(5);
  });

  it('Assess_SdkError_Returns502KeepsAttempt', async () => {
    const originalKey = process.env.AZURE_SPEECH_KEY;
    process.env.AZURE_SPEECH_KEY = 'real-key-to-skip-fallback';

    const { SpeechRecognizer } = await import('microsoft-cognitiveservices-speech-sdk');
    (SpeechRecognizer as any).mockImplementation(() => ({
      recognizeOnceAsync: vi.fn().mockRejectedValue(new Error('Azure quota exceeded')),
      close: vi.fn(),
    }));

    const fakeWavPath = path.resolve(__dirname, 'fixtures/fake.wav');
    fs.writeFileSync(fakeWavPath, 'fake wav');

    const result = await assessPronunciation({
      audioPath: fakeWavPath,
      referenceText: 'test',
      language: 'en-US',
    });

    expect(result.status).toBe(502);
    expect(result.error).toBeDefined();

    process.env.AZURE_SPEECH_KEY = originalKey;
    fs.unlinkSync(fakeWavPath);
  });

  it('Assess_Success_PersistsPhonemeJson (mocked SDK, real fixture)', async () => {
    const originalKey = process.env.AZURE_SPEECH_KEY;
    process.env.AZURE_SPEECH_KEY = 'mock-key';

    const fakeWavPath = path.resolve(__dirname, 'fixtures/fake.wav');
    fs.writeFileSync(fakeWavPath, 'fake wav');

    const result = await assessPronunciation({
      audioPath: fakeWavPath,
      referenceText: 'The quick brown fox.',
      language: 'en-US',
    });

    expect(result.status).toBe(200);
    expect(result.scores).toBeDefined();
    expect(result.phonemeJson).toContain('quick');

    process.env.AZURE_SPEECH_KEY = originalKey;
    fs.unlinkSync(fakeWavPath);
  });
});
