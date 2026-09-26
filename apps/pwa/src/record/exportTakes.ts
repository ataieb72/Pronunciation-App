/**
 * All takes in one ZIP file: the WAV files plus a manifest with each take's details and readings.
 * The owner saves it and shares it (for example in the chat for the R2-T08 voice check).
 * The file holds the owner's voice: it is never committed to the public repository.
 */
import type { TakeStore } from '../audio/takeStore';
import { makeZip, type ZipEntry } from './zip';

export async function exportTakes(store: TakeStore): Promise<{ zip: Uint8Array<ArrayBuffer>; count: number }> {
  const rows = (await store.list()).reverse(); // oldest first
  const entries: ZipEntry[] = [];
  const takes = [];
  for (const row of rows) {
    const wav = await store.loadWav(row.id);
    const file = `takes/take-${String(row.id)}-${row.kind}.wav`;
    if (wav) entries.push({ name: file, data: new Uint8Array(wav) });
    takes.push({ ...row, file: wav ? file : null });
  }
  const manifest = { app: 'Pronunciation Coach', exportedAt: new Date().toISOString(), takes };
  entries.unshift({ name: 'manifest.json', data: new TextEncoder().encode(JSON.stringify(manifest, null, 1)) });
  return { zip: makeZip(entries), count: rows.length };
}
