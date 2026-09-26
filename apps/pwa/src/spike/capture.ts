/** Throwaway capture path for the R1 phone test. R2 replaces it with the real audio core. */

import { REQUESTED_CONSTRAINTS, type MicInfo } from '../audio/microphone';

export type { MicInfo };

export interface Recording {
  readonly samples: Float32Array;
  readonly sampleRate: number;
  readonly durationMs: number;
  readonly mic: MicInfo;
}

export interface ActiveRecording {
  readonly mic: MicInfo;
  stop: () => Promise<Recording>;
}

function concat(chunks: readonly Float32Array[]): Float32Array {
  const out = new Float32Array(chunks.reduce((n, c) => n + c.length, 0));
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

export async function startRecording(maxSeconds: number): Promise<ActiveRecording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: REQUESTED_CONSTRAINTS });
  const track = stream.getAudioTracks()[0];
  if (!track) throw new Error('No microphone track');

  const context = new AudioContext();
  // BASE_URL keeps the path right when the app lives in a sub-folder (GitHub Pages).
  await context.audioWorklet.addModule(`${import.meta.env.BASE_URL}worklets/capture-processor.js`);
  const source = context.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(context, 'capture-processor');

  const chunks: Float32Array[] = [];
  let total = 0;
  const maxSamples = maxSeconds * context.sampleRate;
  node.port.onmessage = (event: MessageEvent<Float32Array>) => {
    if (total < maxSamples) {
      chunks.push(event.data);
      total += event.data.length;
    }
  };
  source.connect(node);
  // The processor writes silence; connecting it keeps it running on all browsers.
  node.connect(context.destination);
  const started = performance.now();

  const mic: MicInfo = {
    label: track.label,
    requested: REQUESTED_CONSTRAINTS,
    applied: track.getSettings(),
    capabilities: typeof track.getCapabilities === 'function' ? track.getCapabilities() : null,
    contextSampleRate: context.sampleRate,
  };

  return {
    mic,
    stop: async () => {
      const durationMs = performance.now() - started;
      node.port.onmessage = null;
      source.disconnect();
      node.disconnect();
      for (const t of stream.getTracks()) t.stop();
      const sampleRate = context.sampleRate;
      await context.close();
      return { samples: concat(chunks).subarray(0, Math.min(total, maxSamples)), sampleRate, durationMs, mic };
    },
  };
}
