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
