import { describe, expect, it } from 'vitest';
import { decodeWav, encodeWav, floatToPcm16 } from '../src/wav';

function ascii(view: DataView, offset: number, length: number): string {
  let s = '';
  for (let i = 0; i < length; i++) s += String.fromCharCode(view.getUint8(offset + i));
  return s;
}

describe('floatToPcm16', () => {
  it('Pcm16_ScalesClampsAndRounds', () => {
    const out = floatToPcm16(new Float32Array([0, 1, -1, 0.5, -0.5, 2, -2, Number.NaN]));
    expect(Array.from(out)).toEqual([0, 32767, -32768, 16384, -16384, 32767, -32768, 0]);
  });
});

describe('encodeWav', () => {
  const samples = new Float32Array([0, 0.5, -0.5, 1]);
  const buf = encodeWav(samples, 16_000);
  const view = new DataView(buf);

  it('Wav_HeaderFields_Pcm16MonoAtRate', () => {
    expect(buf.byteLength).toBe(44 + 2 * samples.length);
    expect(ascii(view, 0, 4)).toBe('RIFF');
    expect(view.getUint32(4, true)).toBe(36 + 2 * samples.length);
    expect(ascii(view, 8, 4)).toBe('WAVE');
    expect(ascii(view, 12, 4)).toBe('fmt ');
    expect(view.getUint32(16, true)).toBe(16);
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(16_000);
    expect(view.getUint32(28, true)).toBe(32_000); // byte rate
    expect(view.getUint16(32, true)).toBe(2); // block align
    expect(view.getUint16(34, true)).toBe(16); // bits
    expect(ascii(view, 36, 4)).toBe('data');
    expect(view.getUint32(40, true)).toBe(2 * samples.length);
  });

  it('Wav_Samples_LittleEndianPcm16', () => {
    expect([0, 1, 2, 3].map((i) => view.getInt16(44 + 2 * i, true))).toEqual([0, 16384, -16384, 32767]);
  });

  it('Wav_InvalidRate_Throws', () => {
    expect(() => encodeWav(samples, 0)).toThrow(RangeError);
  });
});

/** A WAV file with an extra chunk before "data", as some tools write. */
function wavWithListChunk(pcm: number[], sampleRate: number, channels = 1, bits = 16, format = 1): ArrayBuffer {
  const list = [0x4c, 0x49, 0x53, 0x54, 4, 0, 0, 0, 0x49, 0x4e, 0x46, 0x4f]; // "LIST", size 4, "INFO"
  const dataBytes = pcm.length * 2;
  const buffer = new ArrayBuffer(36 + list.length + 8 + dataBytes);
  const view = new DataView(buffer);
  const text = (offset: number, t: string) => {
    for (let i = 0; i < t.length; i++) view.setUint8(offset + i, t.charCodeAt(i));
  };
  text(0, 'RIFF');
  view.setUint32(4, buffer.byteLength - 8, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * (bits / 8), true);
  view.setUint16(32, channels * (bits / 8), true);
  view.setUint16(34, bits, true);
  list.forEach((b, i) => {
    view.setUint8(36 + i, b);
  });
  const dataAt = 36 + list.length;
  text(dataAt, 'data');
  view.setUint32(dataAt + 4, dataBytes, true);
  pcm.forEach((v, i) => {
    view.setInt16(dataAt + 8 + 2 * i, v, true);
  });
  return buffer;
}

describe('decodeWav', () => {
  it('DecodeWav_Pcm16Mono_RoundTripsEncodeWav', () => {
    const samples = new Float32Array([0, 0.25, -0.25, 0.999, -1]);
    const decoded = decodeWav(encodeWav(samples, 16_000));
    expect(decoded.sampleRate).toBe(16_000);
    expect(decoded.samples).toHaveLength(samples.length);
    decoded.samples.forEach((v, i) => {
      expect(v).toBeCloseTo(samples[i] ?? 0, 4);
    });
  });

  it('DecodeWav_ExtraChunkBeforeData_IsSkipped', () => {
    const decoded = decodeWav(wavWithListChunk([0, 16384, -16384], 22_050));
    expect(decoded.sampleRate).toBe(22_050);
    expect(Array.from(decoded.samples)).toEqual([0, 0.5, -0.5]);
  });

  it.each([
    ['not a WAV file', new TextEncoder().encode('hello, this is not audio at all').buffer],
    ['stereo', wavWithListChunk([0, 0], 16_000, 2)],
    ['float samples', wavWithListChunk([0, 0], 16_000, 1, 16, 3)],
  ])('DecodeWav_%s_Throws', (_label, buffer) => {
    expect(() => decodeWav(buffer)).toThrow(/WAV/);
  });
});
