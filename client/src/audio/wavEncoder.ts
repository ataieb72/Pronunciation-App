/**
 * WAV Encoder Utility (F2-T01)
 * 
 * Converts audio data to 16kHz 16-bit mono PCM WAV.
 * Uses OfflineAudioContext for resampling when available.
 * Pure-ish: main encode function is deterministic.
 */

export interface EncodeWavOptions {
  targetSampleRate?: number; // default 16000
  targetChannels?: number;   // default 1 (mono)
}

/**
 * Encode an AudioBuffer (or raw samples) to WAV ArrayBuffer.
 * This is the main exported function for the encoder.
 */
export async function encodeToWav(
  input: AudioBuffer | Float32Array | Float32Array[],
  options: EncodeWavOptions = {}
): Promise<ArrayBuffer> {
  const targetRate = options.targetSampleRate ?? 16000;
  const targetChannels = options.targetChannels ?? 1;

  let samples: Float32Array;
  let sampleRate: number;

  // Safe AudioBuffer detection (works in browser, avoids ReferenceError in Node tests)
  const isAudioBuffer = (obj: any): obj is AudioBuffer =>
    obj && typeof obj.sampleRate === 'number' && typeof obj.getChannelData === 'function';

  if (isAudioBuffer(input)) {
    sampleRate = input.sampleRate;
    // Get mono data (average channels or take first)
    if (input.numberOfChannels === 1) {
      samples = input.getChannelData(0);
    } else {
      // Mix to mono
      const ch0 = input.getChannelData(0);
      const ch1 = input.numberOfChannels > 1 ? input.getChannelData(1) : ch0;
      samples = new Float32Array(ch0.length);
      for (let i = 0; i < ch0.length; i++) {
        samples[i] = (ch0[i] + ch1[i]) / 2;
      }
    }
  } else if (input instanceof Float32Array) {
    samples = input;
    sampleRate = targetRate; // assume already correct rate
  } else if (Array.isArray(input)) {
    // Multiple channels - mix to mono for now
    samples = input[0];
    sampleRate = targetRate;
  } else {
    throw new Error('Unsupported input type for encodeToWav');
  }

  // Resample if needed using OfflineAudioContext (browser only)
  if (sampleRate !== targetRate && typeof OfflineAudioContext !== 'undefined') {
    samples = await resampleAudio(samples, sampleRate, targetRate);
  } else if (sampleRate !== targetRate) {
    // Fallback linear resample for Node/tests
    samples = linearResample(samples, sampleRate, targetRate);
  }

  // Now encode the (resampled) mono samples to 16-bit PCM WAV
  return pcmToWav(samples, targetRate);
}

async function resampleAudio(
  samples: Float32Array,
  fromRate: number,
  toRate: number
): Promise<Float32Array> {
  const offline = new OfflineAudioContext(1, Math.ceil(samples.length * toRate / fromRate), toRate);
  const buffer = offline.createBuffer(1, samples.length, fromRate);
  buffer.copyToChannel(samples, 0);

  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start(0);

  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}

function linearResample(samples: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return samples;
  const ratio = fromRate / toRate;
  const newLength = Math.round(samples.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const t = srcIndex - srcIndexFloor;

    if (srcIndexFloor + 1 < samples.length) {
      result[i] = samples[srcIndexFloor] * (1 - t) + samples[srcIndexFloor + 1] * t;
    } else {
      result[i] = samples[srcIndexFloor] || 0;
    }
  }
  return result;
}

/**
 * Core: Convert mono Float32 PCM samples to 16-bit WAV ArrayBuffer.
 * Hand-rolled header. Always produces 16kHz mono 16-bit in our usage.
 */
export function pcmToWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * (bitsPerSample / 8);
  const bufferSize = 44 + dataSize;
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true);  // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write samples (Float32 -> Int16)
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
