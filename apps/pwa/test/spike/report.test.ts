import { describe, expect, it } from 'vitest';
import { latencyStats, type Attempt } from '../../src/spike/report';

function attempt(over: Partial<Attempt>): Attempt {
  return {
    n: 1, at: '', mode: 'assess', language: 'en-US', referenceText: '', network: 'wifi/4g', micSource: 'phone',
    captureMs: 0, peakDbfs: 0, rmsDbfs: 0, clippedRatio: 0, resampleMs: 0,
    latencyMs: 1000, reason: 'RecognizedSpeech', summary: null, transcript: null, error: null, azureJson: null,
    ...over,
  };
}

describe('latencyStats', () => {
  it('Latency_CountsOnlyRecognizedAssessments', () => {
    const attempts = [
      attempt({ latencyMs: 1000 }),
      attempt({ latencyMs: 3000 }),
      attempt({ latencyMs: 9000, error: 'Azure canceled: Error' }),
      attempt({ latencyMs: 800, reason: 'NoMatch' }),
      attempt({ latencyMs: 5000, mode: 'continuous', reason: 'Continuous' }),
    ];
    expect(latencyStats(attempts)).toEqual({ count: 2, medianMs: 2000, p90Ms: 3000 });
  });

  it('Latency_FiltersByNetwork', () => {
    const attempts = [attempt({ latencyMs: 1000, network: 'wifi/4g' }), attempt({ latencyMs: 4000, network: 'cellular/4g' })];
    expect(latencyStats(attempts, 'cellular/4g')).toEqual({ count: 1, medianMs: 4000, p90Ms: 4000 });
  });
});
