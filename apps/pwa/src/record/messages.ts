/** Plain wording for the record screen (short sentences, no jargon, never a score). */
import type { RetakeReason } from '@pc/dsp';
import type { StopReason } from '../audio/takeRecorder';
import type { DistanceCheck } from './distance';

export function stopText(reason: StopReason): string {
  switch (reason) {
    case 'silence':
      return 'Stopped by itself: you finished speaking.';
    case 'cap':
      return 'Stopped at the time limit.';
    case 'manual':
      return 'Stopped.';
  }
}

export function retakeText(reason: RetakeReason): string {
  switch (reason) {
    case 'clipped':
      return 'Too loud: the sound was cut off. Hold the phone a little further away.';
    case 'too-quiet':
      return 'Too quiet. Hold the phone one hand-span from your mouth and speak up.';
    case 'noisy':
      return 'Too much background noise. Find a quieter place.';
    case 'too-short':
      return 'No speech heard, or too little. Move closer or find a quieter place, then try again.';
  }
}

export function distanceText(check: DistanceCheck | null): string | null {
  if (check === null) return null;
  switch (check.status) {
    case 'building':
      return `Learning your usual level: take ${String(check.have + 1)} of ${String(check.need)}. Hold the phone one hand-span from your mouth.`;
    case 'ok':
      return null;
    case 'louder':
      return `This take was ${check.diffDb.toFixed(0)} dB louder than your usual. If you did not mean to speak louder, move the phone back to one hand-span.`;
    case 'quieter':
      return `This take was ${(-check.diffDb).toFixed(0)} dB quieter than your usual. Hold the phone one hand-span from your mouth.`;
  }
}

export const DISCARD_TEXT = 'Recording stopped because the app went to the background. Please record again.';
export const MIC_ERROR_TEXT = 'The microphone did not open. Allow the microphone for this app in Chrome, then try again.';
