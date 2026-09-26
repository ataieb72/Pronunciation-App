/** Runs take analysis off the main thread (a 60-second talk takes a few seconds on a phone). */
import { analyzeTake } from './analysis';

interface Request {
  readonly id: number;
  readonly samples: Float32Array;
  readonly sampleRate: number;
}

// The app's TypeScript setup has DOM types, not worker types; this is all the worker needs.
const scope = self as unknown as { onmessage: ((event: MessageEvent<Request>) => void) | null; postMessage(message: unknown): void };

scope.onmessage = (event) => {
  const { id, samples, sampleRate } = event.data;
  try {
    scope.postMessage({ id, readings: analyzeTake(samples, sampleRate) });
  } catch (e) {
    scope.postMessage({ id, error: e instanceof Error ? e.message : String(e) });
  }
};
