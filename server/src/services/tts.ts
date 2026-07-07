import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export interface TtsInput {
  text: string;
  lang: string;
  rate: number; // 0.75 | 1.0 | 1.25
  cacheDir?: string;
}

export interface TtsResult {
  status: number;
  audio?: Buffer;
  duration: number; // milliseconds
  fromCache: boolean;
  contentType: string;
}

const DEFAULT_CACHE_DIR = path.resolve('tts-cache');

function getVoice(lang: string): string {
  if (lang === 'fr-FR') return 'fr-FR-DeniseNeural';
  return 'en-US-JennyNeural';
}

export function getTtsCacheKey(text: string, lang: string, rate: number): string {
  const voice = getVoice(lang);
  return crypto.createHash('sha256').update(`${text}|${voice}|${rate}`).digest('hex');
}

function getSsml(text: string, lang: string, rate: number): string {
  const voice = getVoice(lang);
  const rateStr = rate.toFixed(2); // 0.75, 1.00, 1.25
  return `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">
  <voice name="${voice}">
    <prosody rate="${rateStr}">${escapeXml(text)}</prosody>
  </voice>
</speak>`.trim();
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function ensureCacheDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadCacheIndex(dir: string): Record<string, { duration: number }> {
  const indexPath = path.join(dir, 'index.json');
  if (fs.existsSync(indexPath)) {
    try {
      return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    } catch {
      return {};
    }
  }
  return {};
}

function saveCacheIndex(dir: string, index: Record<string, { duration: number }>) {
  const indexPath = path.join(dir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
}

export async function synthesizeTts(input: TtsInput): Promise<TtsResult> {
  const { text, lang, rate } = input;
  const cacheDir = input.cacheDir || DEFAULT_CACHE_DIR;
  ensureCacheDir(cacheDir);

  const key = getTtsCacheKey(text, lang, rate);
  const mp3Path = path.join(cacheDir, `${key}.mp3`);
  const index = loadCacheIndex(cacheDir);

  // Cache hit
  if (fs.existsSync(mp3Path) && index[key]) {
    const audio = fs.readFileSync(mp3Path);
    return {
      status: 200,
      audio,
      duration: index[key].duration,
      fromCache: true,
      contentType: 'audio/mpeg',
    };
  }

  // Cache miss - call SDK
  try {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY!,
      process.env.AZURE_SPEECH_REGION!
    );

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

    const ssml = getSsml(text, lang, rate);

    return new Promise((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          synthesizer.close();

          if (result.reason !== 'SynthesizingAudioCompleted' && result.reason !== sdk.ResultReason?.SynthesizingAudioCompleted) {
            reject(new Error(`TTS failed: ${result.reason}`));
            return;
          }

          // result.audioData is ArrayBuffer
          const audio = Buffer.from(result.audioData);
          // audioDuration is in 100-nanosecond units
          const durationMs = Math.round((result.audioDuration || 0) / 10000);

          // Save to cache
          fs.writeFileSync(mp3Path, audio);
          index[key] = { duration: durationMs };
          saveCacheIndex(cacheDir, index);

          resolve({
            status: 200,
            audio,
            duration: durationMs,
            fromCache: false,
            contentType: 'audio/mpeg',
          });
        },
        (error) => {
          synthesizer.close();
          reject(error);
        }
      );
    });
  } catch (err: any) {
    return {
      status: 502,
      duration: 0,
      fromCache: false,
      contentType: 'audio/mpeg',
    };
  }
}
