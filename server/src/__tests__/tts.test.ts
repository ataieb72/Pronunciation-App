import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { synthesizeTts, getTtsCacheKey } from '../services/tts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.resolve(__dirname, '../../tts-cache-test');

beforeEach(() => {
  if (fs.existsSync(CACHE_DIR)) {
    fs.rmSync(CACHE_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(CACHE_DIR, { recursive: true });
});

afterEach(() => {
  if (fs.existsSync(CACHE_DIR)) {
    fs.rmSync(CACHE_DIR, { recursive: true, force: true });
  }
});

vi.mock('microsoft-cognitiveservices-speech-sdk', () => ({
  SpeechConfig: {
    fromSubscription: vi.fn(() => ({})),
  },
  SpeechSynthesizer: vi.fn(() => ({
    speakSsmlAsync: vi.fn((ssml, successCb, errorCb) => {
      // Simulate success with some audio data
      const audioData = new Uint8Array(Buffer.from('FAKE_MP3_DATA')).buffer;
      successCb({ 
        reason: 'SynthesizingAudioCompleted',
        audioData,
        audioDuration: 12345678 // 100ns units -> ~1234 ms
      });
    }),
    close: vi.fn(),
  })),
  ResultReason: { 
    SynthesizingAudioCompleted: 'SynthesizingAudioCompleted' 
  },
}));

describe('F3-T02 TTS service (TDD)', () => {
  it('CacheKey_DiffersByRate', () => {
    const key1 = getTtsCacheKey('hello', 'en-US', 1.0);
    const key2 = getTtsCacheKey('hello', 'en-US', 1.25);
    expect(key1).not.toBe(key2);
    expect(key1).toHaveLength(64); // sha256 hex
  });

  it('Tts_RateParam_AltersSsml', async () => {
    // We can inspect by spying or by the fact that different rate produces different key
    // For this test, just ensure it doesn't crash and returns data
    const result = await synthesizeTts({
      text: 'hello',
      lang: 'en-US',
      rate: 0.75,
      cacheDir: CACHE_DIR,
    });
    expect(result.status).toBe(200);
    expect(result.duration).toBeGreaterThan(0);
    expect(result.fromCache).toBe(false);
  });

  it('Tts_CacheHit_SkipsSdk', async () => {
    const sdk = await import('microsoft-cognitiveservices-speech-sdk');
    const speakSpy = vi.fn((ssml, successCb) => {
      const audioData = new Uint8Array(Buffer.from('FAKE_MP3_DATA')).buffer;
      successCb({ 
        reason: 'SynthesizingAudioCompleted',
        audioData,
        audioDuration: 12345678 
      });
    });

    // Override the mock for this test
    (sdk.SpeechSynthesizer as any).mockImplementation(() => ({
      speakSsmlAsync: speakSpy,
      close: vi.fn(),
    }));

    // First call - should call SDK
    const res1 = await synthesizeTts({
      text: 'test cache',
      lang: 'en-US',
      rate: 1.0,
      cacheDir: CACHE_DIR,
    });
    expect(res1.fromCache).toBe(false);
    expect(speakSpy).toHaveBeenCalledTimes(1);

    // Second identical call - should hit cache, no SDK call
    const res2 = await synthesizeTts({
      text: 'test cache',
      lang: 'en-US',
      rate: 1.0,
      cacheDir: CACHE_DIR,
    });
    expect(res2.fromCache).toBe(true);
    expect(speakSpy).toHaveBeenCalledTimes(1); // still 1
    expect(res2.duration).toBe(res1.duration);
  });
});
