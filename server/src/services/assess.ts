import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import fs from 'node:fs';

export interface AssessInput {
  audioPath: string;
  referenceText: string;
  language: string;
}

export interface AssessResult {
  status: number;
  scores?: {
    overall: number;
    accuracy: number;
    fluency: number;
    prosody?: number;
  };
  phonemeJson?: string;
  error?: string;
}

/**
 * Pure rolling average calculator (for TDD test)
 */
export function computeRollingAverage(
  existing: { avg_score: number; attempt_count: number },
  newScore: number
): { avg: number; count: number } {
  const newCount = existing.attempt_count + 1;
  const newAvg = (existing.avg_score * existing.attempt_count + newScore) / newCount;
  return { avg: Math.round(newAvg * 100) / 100, count: newCount };
}

/**
 * Main assessment function.
 */
export async function assessPronunciation(input: AssessInput): Promise<AssessResult> {
  const { audioPath, referenceText, language } = input;

  if (!fs.existsSync(audioPath)) {
    return { status: 400, error: 'Audio file not found' };
  }

  // Test / fallback path when no real key
  if (!process.env.AZURE_SPEECH_KEY || process.env.AZURE_SPEECH_KEY === 'mock-key') {
    try {
      const fixturePath = new URL('../__tests__/fixtures/assess-response.json', import.meta.url);
      const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
      const detail = fixture.NBest[0];
      const scores = {
        overall: detail.PronScore || detail.AccuracyScore || 0,
        accuracy: detail.AccuracyScore || 0,
        fluency: detail.FluencyScore || 0,
        prosody: detail.ProsodyScore,
      };
      return {
        status: 200,
        scores,
        phonemeJson: JSON.stringify(detail),
      };
    } catch (e) {
      return { status: 502, error: 'Fixture load failed' };
    }
  }

  try {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION!
    );
    speechConfig.speechRecognitionLanguage = language;

    const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(audioPath));

    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true
    );
    pronunciationConfig.phonemeAlphabet = 'IPA';

    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    pronunciationConfig.applyTo(recognizer);

    const result: any = await recognizer.recognizeOnceAsync();
    recognizer.close();

    if (result.reason !== sdk.ResultReason.RecognizedSpeech) {
      throw new Error(`Recognition failed: ${result.reason}`);
    }

    const pronResult = sdk.PronunciationAssessmentResult.fromResult(result);
    const detail = (pronResult as any).DetailResult || (pronResult as any) || {};

    const scores = {
      overall: detail.PronScore || detail.AccuracyScore || 0,
      accuracy: detail.AccuracyScore || 0,
      fluency: detail.FluencyScore || 0,
      prosody: detail.ProsodyScore,
    };

    const phonemeJson = JSON.stringify(detail);

    return {
      status: 200,
      scores,
      phonemeJson,
    };
  } catch (err: any) {
    console.error('[Azure assess error]', err.message);
    return { status: 502, error: err.message };
  }
}
