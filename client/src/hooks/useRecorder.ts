import { useState, useRef, useCallback } from 'react';
import { encodeToWav } from '../audio/wavEncoder';

export type RecorderState = 'idle' | 'requesting' | 'recording' | 'processing' | 'ready' | 'error';

export interface UseRecorderResult {
  state: RecorderState;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  audioUrl: string | null;      // for local playback
  wavBlob: Blob | null;         // the final 16k WAV
  reset: () => void;
  isRecording: boolean;
}

interface RecorderOptions {
  onWavReady?: (wavBlob: Blob) => void;
}

export function useRecorder(options: RecorderOptions = {}): UseRecorderResult {
  const [state, setState] = useState<RecorderState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [wavBlob, setWavBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setWavBlob(null);
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
  }, [audioUrl]);

  const reset = useCallback(() => {
    cleanup();
    setState('idle');
    setError(null);
  }, [cleanup]);

  const start = useCallback(async () => {
    setError(null);
    setState('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44100, // browser default, we resample later
        },
      });
      streamRef.current = stream;

      // Setup for waveform (optional but for T02)
      try {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
      } catch (e) {
        // waveform is nice-to-have
      }

      // Prefer audio/webm or whatever MediaRecorder supports, we convert anyway
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setState('processing');

        try {
          const recordedBlob = new Blob(audioChunksRef.current, { type: mimeType });

          // Decode the recorded audio
          const arrayBuffer = await recordedBlob.arrayBuffer();
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

          // Encode to our target WAV using the encoder
          const wavArrayBuffer = await encodeToWav(audioBuffer);
          const finalWavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' });

          const url = URL.createObjectURL(finalWavBlob);

          setWavBlob(finalWavBlob);
          setAudioUrl(url);
          setState('ready');

          options.onWavReady?.(finalWavBlob);
        } catch (err: any) {
          setError(`Failed to process recording: ${err.message}`);
          setState('error');
        } finally {
          // cleanup stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
          }
        }
      };

      recorder.start();
      setState('recording');
    } catch (err: any) {
      setError(err.name === 'NotAllowedError' ? 'Microphone permission denied' : err.message);
      setState('error');
    }
  }, [options]);

  const stop = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    }
  }, []);

  const isRecording = state === 'recording';

  return {
    state,
    error,
    start,
    stop,
    audioUrl,
    wavBlob,
    reset,
    isRecording,
  };
}
