/**
 * Throwaway Azure calls for the R1 phone test. The SDK loads on demand into its own
 * chunk (named azure-speech-sdk-*, which the key scan expects). The key never reaches
 * the phone: the Worker issues a 10-minute token.
 */
import type * as SpeechSdk from 'microsoft-cognitiveservices-speech-sdk';

type Sdk = typeof SpeechSdk;
export type Language = 'en-US' | 'fr-FR';

let sdkPromise: Promise<Sdk> | null = null;
function loadSdk(): Promise<Sdk> {
  sdkPromise ??= import('microsoft-cognitiveservices-speech-sdk');
  return sdkPromise;
}

interface SpeechToken {
  readonly token: string;
  readonly region: string;
  readonly expiresAt: number;
}

let cachedToken: SpeechToken | null = null;

async function speechToken(deviceToken: string): Promise<SpeechToken> {
  if (cachedToken !== null && cachedToken.expiresAt - Date.now() > 60_000) return cachedToken;
  const res = await fetch('/api/speech/token', { method: 'POST', headers: { authorization: `Bearer ${deviceToken}` } });
  if (!res.ok) throw new Error(`Speech token request failed (HTTP ${String(res.status)})`);
  const body = (await res.json()) as { token: string; region: string; expiresAt: string };
  cachedToken = { token: body.token, region: body.region, expiresAt: Date.parse(body.expiresAt) };
  return cachedToken;
}

function withTimeout<T>(promise: Promise<T>, ms: number, what: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${what} timed out after ${String(ms)} ms`));
    }, ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e: unknown) => {
        clearTimeout(timer);
        reject(e instanceof Error ? e : new Error(String(e)));
      },
    );
  });
}

function pcmBuffer(pcm16: Int16Array): ArrayBuffer {
  return pcm16.buffer.slice(pcm16.byteOffset, pcm16.byteOffset + pcm16.byteLength) as ArrayBuffer;
}

async function recognizerFor(sdk: Sdk, deviceToken: string, language: Language) {
  const { token, region } = await speechToken(deviceToken);
  const config = sdk.SpeechConfig.fromAuthorizationToken(token, region);
  config.speechRecognitionLanguage = language;
  config.outputFormat = sdk.OutputFormat.Detailed;
  const push = sdk.AudioInputStream.createPushStream(sdk.AudioStreamFormat.getWaveFormatPCM(16_000, 16, 1));
  const recognizer = new sdk.SpeechRecognizer(config, sdk.AudioConfig.fromStreamInput(push));
  return { recognizer, push };
}

export interface AssessResult {
  readonly reason: string;
  readonly json: string;
  readonly latencyMs: number;
}

/** Scripted pronunciation assessment of one take. Latency runs from "audio sent" to "result". */
export async function assess(opts: {
  deviceToken: string;
  language: Language;
  referenceText: string;
  pcm16: Int16Array;
  timeoutMs?: number;
}): Promise<AssessResult> {
  const sdk = await loadSdk();
  const { recognizer, push } = await recognizerFor(sdk, opts.deviceToken, opts.language);
  const pa = new sdk.PronunciationAssessmentConfig(
    opts.referenceText,
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Phoneme,
    true,
  );
  if (opts.language === 'en-US') {
    // Phoneme names, "sounded like" candidates and prosody exist for en-US only.
    pa.phonemeAlphabet = 'IPA';
    pa.nbestPhonemeCount = 5;
    pa.enableProsodyAssessment = true;
  }
  pa.applyTo(recognizer);

  const started = performance.now();
  push.write(pcmBuffer(opts.pcm16));
  push.close();
  try {
    // recognizeOnceAsync takes callbacks and returns nothing: wrap it, never `await` it directly.
    const result = await withTimeout(
      new Promise<SpeechSdk.SpeechRecognitionResult>((resolve, reject) => {
        recognizer.recognizeOnceAsync(resolve, (e) => {
          reject(new Error(e));
        });
      }),
      opts.timeoutMs ?? 15_000,
      'Azure assessment',
    );
    if (result.reason === sdk.ResultReason.Canceled) {
      // A failed connection arrives through the success callback as a cancelled result.
      const details = sdk.CancellationDetails.fromResult(result);
      throw new Error(
        `Azure canceled: ${sdk.CancellationReason[details.reason]} (${sdk.CancellationErrorCode[details.ErrorCode]}) ${details.errorDetails}`,
      );
    }
    return {
      reason: sdk.ResultReason[result.reason],
      json: result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult),
      latencyMs: performance.now() - started,
    };
  } finally {
    recognizer.close();
  }
}

export interface ContinuousResult {
  readonly texts: string[];
  readonly json: string[];
  readonly latencyMs: number;
}

/** Continuous speech-to-text over a long take (for the 60-second round). */
export async function transcribeContinuous(opts: {
  deviceToken: string;
  language: Language;
  pcm16: Int16Array;
  timeoutMs?: number;
}): Promise<ContinuousResult> {
  const sdk = await loadSdk();
  const { recognizer, push } = await recognizerFor(sdk, opts.deviceToken, opts.language);
  const texts: string[] = [];
  const json: string[] = [];
  let started = performance.now();

  const done = new Promise<ContinuousResult>((resolve, reject) => {
    recognizer.recognized = (_sender, event) => {
      if (event.result.reason === sdk.ResultReason.RecognizedSpeech) {
        texts.push(event.result.text);
        json.push(event.result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult));
      }
    };
    recognizer.canceled = (_sender, event) => {
      if (event.reason === sdk.CancellationReason.Error) reject(new Error(event.errorDetails));
    };
    recognizer.sessionStopped = () => {
      resolve({ texts, json, latencyMs: performance.now() - started });
    };
    recognizer.startContinuousRecognitionAsync(
      () => {
        started = performance.now();
        push.write(pcmBuffer(opts.pcm16));
        push.close();
      },
      (e) => {
        reject(new Error(e));
      },
    );
  });

  try {
    return await withTimeout(done, opts.timeoutMs ?? 90_000, 'Azure transcription');
  } finally {
    recognizer.stopContinuousRecognitionAsync(
      () => {
        recognizer.close();
      },
      () => {
        recognizer.close();
      },
    );
  }
}
