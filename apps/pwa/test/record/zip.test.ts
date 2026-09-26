import { describe, expect, it } from 'vitest';
import { crc32, makeZip } from '../../src/record/zip';

const text = (s: string) => new TextEncoder().encode(s);

describe('zip', () => {
  it('Crc32_KnownValues', () => {
    expect(crc32(text(''))).toBe(0);
    expect(crc32(text('hello'))).toBe(0x3610a686);
    expect(crc32(text('The quick brown fox jumps over the lazy dog'))).toBe(0x414fa339);
  });

  it('Zip_TwoFiles_ValidStoredArchive', () => {
    const zip = makeZip([
      { name: 'a.txt', data: text('hello') },
      { name: 'dir/b.bin', data: new Uint8Array([1, 2, 3]) },
    ]);
    const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
    expect(view.getUint32(0, true)).toBe(0x04034b50); // first local file header
    const end = zip.byteLength - 22;
    expect(view.getUint32(end, true)).toBe(0x06054b50); // end of central directory
    expect(view.getUint16(end + 10, true)).toBe(2); // two entries
    const centralStart = view.getUint32(end + 16, true);
    expect(view.getUint32(centralStart, true)).toBe(0x02014b50);
    expect(view.getUint32(centralStart + 16, true)).toBe(0x3610a686); // CRC of "hello"
    const nameLength = view.getUint16(centralStart + 28, true);
    expect(new TextDecoder().decode(zip.subarray(centralStart + 46, centralStart + 46 + nameLength))).toBe('a.txt');
    // Stored (no compression): the data follows the local header as is.
    expect(new TextDecoder().decode(zip.subarray(30 + 5, 30 + 5 + 5))).toBe('hello');
  });
});
