import { describe, expect, it } from 'vitest';
import { encodeWav, floatToPcm16 } from '../src/wav';

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
