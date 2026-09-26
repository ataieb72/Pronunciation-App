/**
 * The microphone for a recording session: one AudioContext and one stream, opened once and kept
 * open between takes. Processing is requested off, and the settings the phone applied are kept
 * with every take (R1: the Pixel applies all three "off" requests).
 */
export const REQUESTED_CONSTRAINTS: MediaTrackConstraints = {
  channelCount: 1,
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
};

export interface MicInfo {
  readonly label: string;
  readonly requested: MediaTrackConstraints;
  readonly applied: MediaTrackSettings;
  readonly capabilities: MediaTrackCapabilities | null;
  readonly contextSampleRate: number;
}

export interface AudioSource {
  readonly sampleRate: number;
  readonly mic: MicInfo;
  /** Microphone batches (about 21 ms each) go to the listener while one is set. */
  listen(listener: ((batch: Float32Array) => void) | null): void;
  close(): Promise<void>;
}

export async function openMicrophone(): Promise<AudioSource> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: REQUESTED_CONSTRAINTS });
  const track = stream.getAudioTracks()[0];
  if (!track) throw new Error('No microphone track');
  const context = new AudioContext();
  try {
    // BASE_URL keeps the path right when the app lives in a sub-folder (GitHub Pages).
    await context.audioWorklet.addModule(`${import.meta.env.BASE_URL}worklets/capture-processor.js`);
  } catch (e) {
    for (const t of stream.getTracks()) t.stop();
    await context.close();
    throw e;
  }
  const source = context.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(context, 'capture-processor');
  let listener: ((batch: Float32Array) => void) | null = null;
  node.port.onmessage = (event: MessageEvent<Float32Array>) => {
    listener?.(event.data);
  };
  source.connect(node);
  // The processor outputs silence; connecting it keeps it running on all browsers.
  node.connect(context.destination);

  return {
    sampleRate: context.sampleRate,
    mic: {
      label: track.label,
      requested: REQUESTED_CONSTRAINTS,
      applied: track.getSettings(),
      capabilities: typeof track.getCapabilities === 'function' ? track.getCapabilities() : null,
      contextSampleRate: context.sampleRate,
    },
    listen(l) {
      listener = l;
    },
    async close() {
      listener = null;
      node.port.onmessage = null;
      source.disconnect();
      node.disconnect();
      for (const t of stream.getTracks()) t.stop();
      await context.close();
    },
  };
}
