/**
 * Analyses takes in a Web Worker (a same-origin module file, allowed by the content security
 * policy). Where workers are missing (unit tests), it runs the same code directly.
 */
import { analyzeTake, type Readings } from './analysis';

export type Analyze = (samples: Float32Array, sampleRate: number) => Promise<Readings>;

type Reply = { id: number; readings: Readings } | { id: number; error: string };

export function createAnalyzer(): Analyze {
  if (typeof Worker === 'undefined') return (samples, sampleRate) => Promise.resolve(analyzeTake(samples, sampleRate));

  let worker: Worker | null = null;
  let nextId = 0;
  const pending = new Map<number, { resolve(r: Readings): void; reject(e: Error): void }>();

  const start = (): Worker => {
    const w = new Worker(new URL('./analysis.worker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (event: MessageEvent<Reply>) => {
      const reply = event.data;
      const job = pending.get(reply.id);
      pending.delete(reply.id);
      if ('error' in reply) job?.reject(new Error(reply.error));
      else job?.resolve(reply.readings);
    };
    w.onerror = (event) => {
      for (const job of pending.values()) job.reject(new Error(event.message || 'Analysis failed'));
      pending.clear();
      worker = null;
    };
    return w;
  };

  return (samples, sampleRate) =>
    new Promise<Readings>((resolve, reject) => {
      worker ??= start();
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      // Send a copy: the caller keeps its samples.
      const copy = samples.slice();
      worker.postMessage({ id, samples: copy, sampleRate }, [copy.buffer]);
    });
}
