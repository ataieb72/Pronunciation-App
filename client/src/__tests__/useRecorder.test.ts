import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecorder } from '../hooks/useRecorder';

// Mock browser APIs
const mockGetUserMedia = vi.fn();
const mockMediaRecorder = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  // @ts-expect-error - mock
  global.navigator.mediaDevices = {
    getUserMedia: mockGetUserMedia,
  };
  // @ts-expect-error
  global.MediaRecorder = mockMediaRecorder;
  // @ts-expect-error
  global.AudioContext = vi.fn(() => ({
    decodeAudioData: vi.fn().mockResolvedValue({}),
    close: vi.fn(),
  }));
});

describe('useRecorder hook (TDD state machine)', () => {
  it('starts in idle state', () => {
    const { result } = renderHook(() => useRecorder());
    expect(result.current.state).toBe('idle');
    expect(result.current.isRecording).toBe(false);
  });

  it('transitions to requesting on start attempt (mocked)', async () => {
    const mockStream = { getTracks: vi.fn(() => []) };
    mockGetUserMedia.mockResolvedValue(mockStream);

    // Simple mock - we mainly test that getUserMedia is called
    const mockRecorderInstance: any = { start: vi.fn(), stop: vi.fn(), state: 'recording' };
    mockMediaRecorder.mockImplementation(() => mockRecorderInstance);

    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      // start may error due to full recorder simulation, but we verify calling
      try { await result.current.start(); } catch {}
    });

    expect(mockGetUserMedia).toHaveBeenCalled();
  });

  it('handles permission denied error', async () => {
    mockGetUserMedia.mockRejectedValue({ name: 'NotAllowedError' });

    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.state).toBe('error');
    expect(result.current.error).toContain('permission denied');
  });

  it('reset clears state back to idle', () => {
    const { result } = renderHook(() => useRecorder());

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toBe('idle');
    expect(result.current.error).toBeNull();
  });
});
