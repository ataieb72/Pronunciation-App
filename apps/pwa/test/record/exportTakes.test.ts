import { describe, expect, it } from 'vitest';
import { exportTakes } from '../../src/record/exportTakes';
import { memorySessions } from '../session/fakes';
import { goodReadings, memoryStore } from './fakes';

function entryNames(zip: Uint8Array): string[] {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const end = zip.byteLength - 22;
  let at = view.getUint32(end + 16, true);
  const names: string[] = [];
  for (let i = 0; i < view.getUint16(end + 10, true); i++) {
    const length = view.getUint16(at + 28, true);
    names.push(new TextDecoder().decode(zip.subarray(at + 46, at + 46 + length)));
    at += 46 + length;
  }
  return names;
}

interface Manifest {
  takes: Record<string, unknown>[];
  sessions: { blocks: { pairs: { judgement?: string }[] }[] }[];
}

/** The manifest is the first, stored (uncompressed) entry. */
function readManifest(zip: Uint8Array): Manifest {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const size = view.getUint32(18, true);
  const nameLength = view.getUint16(26, true);
  const extra = view.getUint16(28, true);
  const start = 30 + nameLength + extra;
  return JSON.parse(new TextDecoder().decode(zip.subarray(start, start + size))) as Manifest;
}

describe('export all takes', () => {
  it('Export_TwoTakes_ZipWithWavsAndManifest', async () => {
    const store = memoryStore();
    const mic = { label: 'Default', requested: {}, applied: {}, capabilities: null, contextSampleRate: 48_000 };
    const take = { kind: 'word' as const, stopReason: 'silence' as const, samples: new Float32Array(16_000), sampleRate: 16_000 as const, sourceDurationS: 1.2, startOffsetS: 0.2, speech: [], noiseFloorDb: -70 };
    const first = await store.save(take, { mic, device: 'a', language: 'en', prompt: 'Say “aah” steadily for about 2 seconds.' });
    await store.setReadings(first, goodReadings);
    await store.save({ ...take, kind: 'sentence' }, { mic, device: 'a', language: 'fr', prompt: 'Le ministre a pris la table du fond.' });

    const { zip, count } = await exportTakes(store);
    expect(count).toBe(2);
    const names = entryNames(zip);
    expect(names[0]).toBe('manifest.json');
    expect(names.filter((n) => n.endsWith('.wav'))).toHaveLength(2);
    expect(names).toContain(`takes/take-${String(first)}-word.wav`);
  });

  it('Export_Manifest_HasSessionAndRole', async () => {
    const store = memoryStore();
    const mic = { label: 'Default', requested: {}, applied: {}, capabilities: null, contextSampleRate: 48_000 };
    const take = { kind: 'sentence' as const, stopReason: 'silence' as const, samples: new Float32Array(1600), sampleRate: 16_000 as const, sourceDurationS: 0.2, startOffsetS: 0, speech: [], noiseFloorDb: -70 };
    const id = await store.save(take, { mic, device: 'a', language: 'en', prompt: 'x', sessionId: 1, itemId: 'en-p03', role: 'clear' });
    const sessions = memorySessions([{ blocks: [{ cue: 'jaw', pairs: [{ itemId: 'en-p03', usualTakeId: null, clearTakeId: id, judgement: 'clear' }] }] }]);

    const { zip } = await exportTakes(store, sessions);
    expect(entryNames(zip)).toContain(`takes/take-${String(id)}-clear.wav`);
    const manifest = readManifest(zip);
    expect(manifest.takes[0]).toMatchObject({ id, sessionId: 1, itemId: 'en-p03', role: 'clear' });
    expect(manifest.sessions[0]?.blocks[0]?.pairs[0]?.judgement).toBe('clear');
  });

  it('Export_NoTakes_EmptyManifestOnly', async () => {
    const { zip, count } = await exportTakes(memoryStore());
    expect(count).toBe(0);
    expect(entryNames(zip)).toEqual(['manifest.json']);
  });
});
