/**
 * A minimal ZIP writer ("stored": no compression; WAV files barely compress anyway). Enough to
 * hand several takes over as one file. Names must be ASCII.
 */
export interface ZipEntry {
  readonly name: string;
  readonly data: Uint8Array;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) crc = (CRC_TABLE[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export function makeZip(entries: readonly ZipEntry[]): Uint8Array<ArrayBuffer> {
  const encoder = new TextEncoder();
  const prepared = entries.map((e) => ({ name: encoder.encode(e.name), data: e.data, crc: crc32(e.data) }));
  const localSize = prepared.reduce((n, e) => n + 30 + e.name.length + e.data.length, 0);
  const centralSize = prepared.reduce((n, e) => n + 46 + e.name.length, 0);
  const out = new Uint8Array(localSize + centralSize + 22);
  const view = new DataView(out.buffer);
  const offsets: number[] = [];
  let at = 0;

  for (const e of prepared) {
    offsets.push(at);
    view.setUint32(at, 0x04034b50, true);
    view.setUint16(at + 4, 20, true); // version needed
    view.setUint16(at + 6, 0, true); // flags
    view.setUint16(at + 8, 0, true); // stored
    view.setUint32(at + 10, 0, true); // time and date (none)
    view.setUint32(at + 14, e.crc, true);
    view.setUint32(at + 18, e.data.length, true);
    view.setUint32(at + 22, e.data.length, true);
    view.setUint16(at + 26, e.name.length, true);
    view.setUint16(at + 28, 0, true);
    out.set(e.name, at + 30);
    out.set(e.data, at + 30 + e.name.length);
    at += 30 + e.name.length + e.data.length;
  }

  const centralStart = at;
  prepared.forEach((e, i) => {
    view.setUint32(at, 0x02014b50, true);
    view.setUint16(at + 4, 20, true); // version made by
    view.setUint16(at + 6, 20, true); // version needed
    view.setUint16(at + 8, 0, true);
    view.setUint16(at + 10, 0, true);
    view.setUint32(at + 12, 0, true);
    view.setUint32(at + 16, e.crc, true);
    view.setUint32(at + 20, e.data.length, true);
    view.setUint32(at + 24, e.data.length, true);
    view.setUint16(at + 28, e.name.length, true);
    // extra, comment, disk, internal and external attributes stay 0
    view.setUint32(at + 42, offsets[i] ?? 0, true);
    out.set(e.name, at + 46);
    at += 46 + e.name.length;
  });

  view.setUint32(at, 0x06054b50, true);
  view.setUint16(at + 8, prepared.length, true);
  view.setUint16(at + 10, prepared.length, true);
  view.setUint32(at + 12, at - centralStart, true);
  view.setUint32(at + 16, centralStart, true);
  return out;
}
