import { describe, expect, it } from 'vitest';
import { createSpeechDetector, detectSpeech } from '../src/vad';
import { loadGolden } from './golden';
import { concat, mix, noise, sine } from './signals';

const SR = 16_000;
const floor = (seconds: number, seed = 1) => noise(SR, seconds, -70, seed);
/** A "voice" stand-in: a 200 Hz tone at about −23 dBFS RMS over a −70 dBFS floor. */
const voice = (seconds: number, seed = 2) => mix(sine(200, SR, seconds, 0.1), floor(seconds, seed));

describe('speech detector', () => {
  it('Vad_SilenceThenTone_FindsOnsetWithin20ms', () => {
    const { segments } = detectSpeech(concat(floor(0.5), voice(0.5), floor(0.5, 3)), SR);
    expect(segments).toHaveLength(1);
    expect(segments[0]?.start).toBeCloseTo(0.5, 1);
    expect(Math.abs((segments[0]?.start ?? 0) - 0.5)).toBeLessThanOrEqual(0.02);
    expect(Math.abs((segments[0]?.end ?? 0) - 1.0)).toBeLessThanOrEqual(0.03);
  });

  it('Vad_FloorOnly_NoSpeech', () => {
    const result = detectSpeech(floor(2), SR);
    expect(result.segments).toEqual([]);
    expect(result.speaking).toBe(false);
    expect(result.lastSpeechEnd).toBeNull();
  });

  it('Vad_TwoWordsWithGap_TwoSegments', () => {
    const { segments } = detectSpeech(concat(floor(0.3), voice(0.3), floor(0.4, 4), voice(0.3, 5), floor(0.3, 6)), SR);
    expect(segments).toHaveLength(2);
    expect(Math.abs((segments[1]?.start ?? 0) - 1.0)).toBeLessThanOrEqual(0.02);
  });

  it('Vad_ShortGap_Bridged', () => {
    const { segments } = detectSpeech(concat(floor(0.3), voice(0.3), floor(0.08, 4), voice(0.3, 5), floor(0.3, 6)), SR);
    expect(segments).toHaveLength(1);
  });

  it('Vad_NoiseFloorRises_Adapts', () => {
    const result = detectSpeech(concat(noise(SR, 2, -60, 7), noise(SR, 5, -35, 8)), SR);
    expect(result.speaking).toBe(false);
    expect(Math.abs((result.noiseFloorDb ?? 0) - -35)).toBeLessThanOrEqual(3);
  });

  it('Vad_StartupSilence_Ignored', () => {
    // The Pixel's mic delivers about 120 ms of digital silence before the first sound (R1 run 1).
    const result = detectSpeech(concat(new Float32Array(Math.round(0.12 * SR)), floor(0.4), voice(0.3), floor(0.3, 3)), SR);
    expect(result.segments).toHaveLength(1);
    expect(Math.abs((result.segments[0]?.start ?? 0) - 0.52)).toBeLessThanOrEqual(0.02);
    expect(Math.abs((result.noiseFloorDb ?? 0) - -70)).toBeLessThanOrEqual(3);
  });

  it('Vad_StreamingChunks_MatchBatch', () => {
    const signal = concat(floor(0.3), voice(0.4), floor(0.5, 4), voice(0.2, 5), floor(0.3, 6));
    const detector = createSpeechDetector({ sampleRate: SR });
    // AudioWorklet quanta are 128 samples; the capture batches them unevenly.
    for (let i = 0, size = 128; i < signal.length; i += size, size = size === 128 ? 1024 : 128) {
      detector.push(signal.subarray(i, i + size));
    }
    expect(detector.snapshot().segments).toEqual(detectSpeech(signal, SR).segments);
  });

  it('Vad_SpeakingNow_ReportsOpenSegment', () => {
    const detector = createSpeechDetector({ sampleRate: SR });
    detector.push(concat(floor(0.3), voice(0.5)));
    const now = detector.snapshot();
    expect(now.speaking).toBe(true);
    expect(now.segments).toHaveLength(1);
    expect(now.lastSpeechEnd).toBeCloseTo(0.8, 1);
  });
});

describe('speech detector on golden fixtures', () => {
  const golden = loadGolden();
  const clean = golden.filter((f) => !f.expected.variant.startsWith('noise'));
  const noisy = golden.filter((f) => f.expected.variant.startsWith('noise'));

  it.each(clean)('Vad_OnsetMatchesPraatAndNeverEndsEarly ($name)', ({ samples, sampleRate, expected }) => {
    const { segments } = detectSpeech(samples, sampleRate);
    const praat = expected.silences.sounding;
    const praatStart = praat[0]?.[0] ?? Number.NaN;
    const praatEnd = praat.at(-1)?.[1] ?? Number.NaN;
    const start = segments[0]?.start ?? Number.NaN;
    const end = segments.at(-1)?.end ?? Number.NaN;
    expect(Math.abs(start - praatStart)).toBeLessThanOrEqual(0.05);
    // Endpointing must never cut speech short; a slightly longer tail is harmless.
    expect(end).toBeGreaterThanOrEqual(praatEnd - 0.05);
    expect(end).toBeLessThanOrEqual(praatEnd + 0.35);
  });

  // At 10 dB SNR Praat's relative threshold marks the whole file as sounding, so the truth for a
  // noisy file is Praat's reading of the same sentence without noise.
  it.each(noisy)('Vad_FindsSpeechInNoise ($name)', ({ name, samples, sampleRate }) => {
    const clean = golden.find((f) => f.name === `${name.split('-')[0] ?? ''}-normal`)?.expected.silences.sounding ?? [];
    const { segments } = detectSpeech(samples, sampleRate);
    expect(segments.length).toBeGreaterThan(0);
    expect(Math.abs((segments[0]?.start ?? Number.NaN) - (clean[0]?.[0] ?? Number.NaN))).toBeLessThanOrEqual(0.15);
    expect(segments.at(-1)?.end ?? Number.NaN).toBeGreaterThanOrEqual((clean.at(-1)?.[1] ?? Number.NaN) - 0.1);
  });
});
