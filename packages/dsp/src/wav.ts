/** Float samples (−1…1) to 16-bit PCM. Clamps out-of-range values; NaN becomes silence. */
export function floatToPcm16(samples: Float32Array): Int16Array {
  const out = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i] ?? 0;
    const v = Number.isNaN(s) ? 0 : Math.max(-1, Math.min(1, s));
    out[i] = v < 0 ? Math.round(v * 32768) : Math.round(v * 32767);
  }
  return out;
}

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
}

/** A 16-bit mono PCM WAV file (44-byte header). */
export function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  if (!(sampleRate > 0 && Number.isInteger(sampleRate))) throw new RangeError('sample rate must be a positive integer');
  const pcm = floatToPcm16(samples);
  const dataBytes = pcm.length * 2;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataBytes, true);
  for (let i = 0; i < pcm.length; i++) view.setInt16(44 + 2 * i, pcm[i] ?? 0, true);
  return buffer;
}

export interface DecodedWav {
  readonly samples: Float32Array;
  readonly sampleRate: number;
}

function readAscii(view: DataView, offset: number, length: number): string {
  let text = '';
  for (let i = 0; i < length; i++) text += String.fromCharCode(view.getUint8(offset + i));
  return text;
}

/** Reads a 16-bit mono PCM WAV file. It skips chunks it does not need, such as "LIST". */
export function decodeWav(buffer: ArrayBuffer): DecodedWav {
  const view = new DataView(buffer);
  if (view.byteLength < 12 || readAscii(view, 0, 4) !== 'RIFF' || readAscii(view, 8, 4) !== 'WAVE') {
    throw new Error('Not a WAV file');
  }
  let sampleRate = 0;
  let offset = 12;
  while (offset + 8 <= view.byteLength) {
    const id = readAscii(view, offset, 4);
    const size = view.getUint32(offset + 4, true);
    const body = offset + 8;
    if (id === 'fmt ') {
      const format = view.getUint16(body, true);
      const channels = view.getUint16(body + 2, true);
      const bits = view.getUint16(body + 14, true);
      if (format !== 1 || channels !== 1 || bits !== 16) {
        throw new Error(`Unsupported WAV: format ${String(format)}, ${String(channels)} channels, ${String(bits)} bits (need 16-bit mono PCM)`);
      }
      sampleRate = view.getUint32(body + 4, true);
    } else if (id === 'data') {
      if (sampleRate === 0) throw new Error('WAV data before its format');
      const count = Math.floor(Math.min(size, view.byteLength - body) / 2);
      const samples = new Float32Array(count);
      for (let i = 0; i < count; i++) samples[i] = view.getInt16(body + 2 * i, true) / 32768;
      return { samples, sampleRate };
    }
    offset = body + size + (size % 2); // chunks are padded to an even size
  }
  throw new Error('WAV file has no data');
}
