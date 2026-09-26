/// <reference types="node" />
// Loads the golden fixtures made by golden/make_golden.py (Praat reference values). Tests only.
import { readFileSync } from 'node:fs';
import { decodeWav } from '../src/wav';

const GOLDEN = new URL('../golden/', import.meta.url);

export interface GoldenExpected {
  readonly file: string;
  readonly language: 'en' | 'fr';
  readonly text: string;
  readonly variant: string;
  readonly sampleRate: number;
  readonly duration: number;
  readonly peakDbfs: number;
  readonly rmsDbfs: number;
  readonly pitch: {
    readonly timeStep: number;
    readonly floorHz: number;
    readonly ceilingHz: number;
    readonly t0: number;
    readonly f0: readonly number[];
    readonly medianHz: number | null;
    readonly p10Hz: number | null;
    readonly p90Hz: number | null;
    readonly rangeSemitones: number | null;
  };
  readonly intensity: { readonly minPitchHz: number; readonly timeStep: number; readonly t0: number; readonly dbfs: readonly number[] };
  readonly silences: {
    readonly thresholdDb: number;
    readonly relativeThresholdDb: number;
    readonly minPause: number;
    readonly minSounding: number;
    readonly sounding: readonly (readonly [number, number])[];
    readonly pauses: readonly (readonly [number, number])[];
  };
  readonly nuclei: {
    readonly minDipDb: number;
    readonly times: readonly number[];
    readonly count: number;
    readonly phonationTime: number;
    readonly articulationRate: number | null;
  };
  readonly speechLevelDbfs: number | null;
  readonly fade: { readonly perPhraseDb: readonly number[]; readonly medianDb: number | null };
}

export interface GoldenFixture {
  readonly name: string;
  readonly expected: GoldenExpected;
  readonly samples: Float32Array;
  readonly sampleRate: number;
}

function readJson(relative: string): unknown {
  return JSON.parse(readFileSync(new URL(relative, GOLDEN), 'utf8'));
}

export function loadGolden(): GoldenFixture[] {
  return (readJson('expected/index.json') as string[]).map((name) => {
    const expected = readJson(`expected/${name}.json`) as GoldenExpected;
    const bytes = readFileSync(new URL(expected.file, GOLDEN));
    const { samples, sampleRate } = decodeWav(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    return { name, expected, samples, sampleRate };
  });
}
