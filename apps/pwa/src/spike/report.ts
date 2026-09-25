import type { MicInfo } from './capture';
import { median, percentile } from './stats';
import type { AzureSummary } from './summary';

export type MicSource = 'phone' | 'wired' | 'bluetooth';

export interface Attempt {
  readonly n: number;
  readonly at: string;
  readonly mode: 'assess' | 'continuous';
  readonly language: string;
  readonly referenceText: string;
  readonly network: string;
  readonly micSource: MicSource;
  readonly captureMs: number;
  readonly peakDbfs: number;
  readonly rmsDbfs: number;
  readonly clippedRatio: number;
  readonly resampleMs: number;
  readonly latencyMs: number | null;
  readonly reason: string | null;
  readonly summary: AzureSummary | null;
  readonly transcript: string | null;
  readonly error: string | null;
  /** Full Azure JSON, kept for the first few attempts per language (test fixtures). */
  readonly azureJson: string | null;
}

export interface LatencyStats {
  readonly count: number;
  readonly medianMs: number | null;
  readonly p90Ms: number | null;
}

export function latencyStats(attempts: readonly Attempt[], network?: string): LatencyStats {
  const values = attempts
    // Only real recognitions count: failed, cancelled and no-match attempts would distort the timing.
    .filter((a) => a.mode === 'assess' && a.error === null && a.reason === 'RecognizedSpeech' && a.latencyMs !== null)
    .filter((a) => network === undefined || a.network === network)
    .map((a) => a.latencyMs ?? 0);
  return { count: values.length, medianMs: median(values), p90Ms: percentile(values, 90) };
}

export function networkLabel(): string {
  const connection = (navigator as Navigator & { connection?: { type?: string; effectiveType?: string } }).connection;
  const type = connection?.type ?? 'unknown';
  const effective = connection?.effectiveType ?? 'unknown';
  return `${type}/${effective}`;
}

export function buildReport(mic: MicInfo | null, attempts: readonly Attempt[]) {
  const networks = [...new Set(attempts.map((a) => a.network))];
  return {
    kind: 'r1-phone-test',
    createdAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    mic,
    latency: {
      all: latencyStats(attempts),
      byNetwork: Object.fromEntries(networks.map((n) => [n, latencyStats(attempts, n)])),
    },
    attempts,
  };
}
