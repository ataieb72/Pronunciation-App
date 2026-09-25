// Copies microphone input to the main thread in batches of about 21 ms (1024 samples).
// Loaded with audioWorklet.addModule('/worklets/capture-processor.js').
const BATCH = 1024;

class CaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(BATCH);
    this.filled = 0;
  }

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (channel) {
      let offset = 0;
      while (offset < channel.length) {
        const n = Math.min(BATCH - this.filled, channel.length - offset);
        this.buffer.set(channel.subarray(offset, offset + n), this.filled);
        this.filled += n;
        offset += n;
        if (this.filled === BATCH) {
          this.port.postMessage(this.buffer);
          this.buffer = new Float32Array(BATCH);
          this.filled = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor('capture-processor', CaptureProcessor);
