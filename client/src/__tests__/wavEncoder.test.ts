import { describe, it, expect } from 'vitest';
import { pcmToWav, encodeToWav } from '../audio/wavEncoder';

describe('wavEncoder (F2-T01 - TDD)', () => {
  it('pcmToWav produces valid 16kHz mono WAV header', () => {
    const samples = new Float32Array([0, 0.5, -0.5, 0]);
    const wav = pcmToWav(samples, 16000);
    const view = new DataView(wav);

    // RIFF magic
    expect(String.fromCharCode(view.getUint8(0))).toBe('R');
    expect(String.fromCharCode(view.getUint8(1))).toBe('I');
    expect(String.fromCharCode(view.getUint8(2))).toBe('F');
    expect(String.fromCharCode(view.getUint8(3))).toBe('F');

    // fmt chunk
    expect(String.fromCharCode(view.getUint8(12))).toBe('f');
    expect(String.fromCharCode(view.getUint8(13))).toBe('m');
    expect(String.fromCharCode(view.getUint8(14))).toBe('t');
    expect(String.fromCharCode(view.getUint8(15))).toBe(' ');

    // Sample rate at offset 24
    expect(view.getUint32(24, true)).toBe(16000);

    // Channels = 1 at 22
    expect(view.getUint16(22, true)).toBe(1);

    // Bits per sample at 34
    expect(view.getUint16(34, true)).toBe(16);

    // data chunk
    expect(String.fromCharCode(view.getUint8(36))).toBe('d');
    expect(String.fromCharCode(view.getUint8(37))).toBe('a');
    expect(String.fromCharCode(view.getUint8(38))).toBe('t');
    expect(String.fromCharCode(view.getUint8(39))).toBe('a');
  });

  it('pcmToWav golden file check - small known buffer produces expected prefix', () => {
    // Golden: very small signal
    const samples = new Float32Array(8).fill(0.1);
    const wav = pcmToWav(samples, 16000);
    const bytes = new Uint8Array(wav);

    // Check header fields (these are deterministic)
    expect(bytes[24]).toBe(0x80); // 16000 little endian low byte? wait precise
    expect(bytes[25]).toBe(0x3E);
    expect(bytes[26]).toBe(0x00);
    expect(bytes[27]).toBe(0x00);

    // Data size at 40-43 should be 8 samples * 2 bytes = 16
    const dataSize = bytes[40] | (bytes[41] << 8) | (bytes[42] << 16) | (bytes[43] << 24);
    expect(dataSize).toBe(16);

    // Total size check
    expect(wav.byteLength).toBe(44 + 16);
  });

  it('encodeToWav accepts Float32Array and returns ArrayBuffer', async () => {
    const samples = new Float32Array([0.1, 0.2, -0.3]);
    const result = await encodeToWav(samples);
    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBeGreaterThan(44);
  });
});
