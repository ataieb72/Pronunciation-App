import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecordScreen } from '../../src/record/RecordScreen';
import { goodReadings, makeDeps, memoryStore, speechOnly } from './fakes';

let visibility: DocumentVisibilityState = 'visible';
Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });
afterEach(() => {
  visibility = 'visible';
});

async function record() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Record' }));
  return user;
}

describe('record screen', () => {
  it('Recorder_Take_ShowsVerdictAndReadings', async () => {
    const deps = makeDeps();
    render(<RecordScreen deps={deps} />);
    await record();
    expect(await screen.findByRole('heading', { name: 'Good recording' })).toBeInTheDocument();
    expect(screen.getByText(/finished speaking/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Test readings (not scores)' })).toBeInTheDocument();
    expect(screen.getByText('4.1 syllables per second')).toBeInTheDocument();
    expect(screen.getByText('5.2 semitones (typical pitch 118 Hz)')).toBeInTheDocument();
    expect(screen.getByText('2 pauses, 1.1 s in total')).toBeInTheDocument();
    expect(deps.analyze).toHaveBeenCalledTimes(1);
  });

  it('Recorder_TakeSavedWithPromptAndReadings', async () => {
    const store = memoryStore();
    render(<RecordScreen deps={makeDeps({ store })} />);
    await record();
    await screen.findByRole('heading', { name: 'Good recording' });
    expect(store.rows).toHaveLength(1);
    expect(store.rows[0]?.readings).toEqual(goodReadings);
    expect(store.rows[0]?.language).toBe('en');
    expect(store.rows[0]?.prompt).toBe('I asked her to help me with the world map.');
  });

  it('Recorder_RetakeReason_Shown', async () => {
    const readings = { ...goodReadings, quality: { ...goodReadings.quality, ok: false, reasons: ['noisy' as const] } };
    render(<RecordScreen deps={makeDeps({ readings })} />);
    await record();
    expect(await screen.findByRole('heading', { name: 'Please record again' })).toBeInTheDocument();
    expect(screen.getByText(/Too much background noise/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Test readings (not scores)' })).not.toBeInTheDocument();
  });

  it('DistanceCheck_FarOff_AsksToAdjust', async () => {
    const earlier = { ...goodReadings, speechLevelDbfs: -30 };
    const store = memoryStore([{ readings: earlier }, { readings: earlier }, { readings: earlier }]);
    render(<RecordScreen deps={makeDeps({ store, readings: { ...goodReadings, speechLevelDbfs: -18 } })} />);
    await record();
    expect(await screen.findByText(/12 dB louder than your usual/)).toBeInTheDocument();
  });

  it('Replay_PlaysStoredTake', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const createUrl = vi.fn(() => 'blob:take');
    URL.createObjectURL = createUrl;
    URL.revokeObjectURL = vi.fn();
    render(<RecordScreen deps={makeDeps()} />);
    const user = await record();
    await screen.findByRole('heading', { name: 'Good recording' });
    await user.click(screen.getByRole('button', { name: 'Replay' }));
    await waitFor(() => {
      expect(play).toHaveBeenCalledTimes(1);
    });
    expect(createUrl).toHaveBeenCalled();
  });

  it('Recorder_PageHidden_ShowsDiscardMessage', async () => {
    render(<RecordScreen deps={makeDeps({ signal: speechOnly() })} />);
    await record();
    await screen.findByRole('button', { name: 'Stop' });
    visibility = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
    expect(await screen.findByText(/went to the background/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Record' })).toBeEnabled();
  });

  it('Recorder_ManualStop_ShowsResult', async () => {
    render(<RecordScreen deps={makeDeps({ signal: speechOnly() })} />);
    const user = await record();
    await user.click(await screen.findByRole('button', { name: 'Stop' }));
    expect(await screen.findByRole('heading', { name: 'Good recording' })).toBeInTheDocument();
    expect(screen.getByText('Stopped.')).toBeInTheDocument();
  });

  it('Recorder_MicError_ShowsMessage', async () => {
    render(<RecordScreen deps={makeDeps({ openError: new Error('NotAllowedError') })} />);
    await record();
    expect(await screen.findByRole('alert')).toHaveTextContent(/microphone did not open/);
  });

  it('LastTakes_Delete_RemovesTake', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const store = memoryStore([{ readings: goodReadings }]);
    render(<RecordScreen deps={makeDeps({ store })} />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /^Delete take/ }));
    await waitFor(() => {
      expect(store.rows).toHaveLength(0);
    });
  });

  it('Recorder_VowelMode_SavesWordTakeWithPrompt', async () => {
    const store = memoryStore();
    render(<RecordScreen deps={makeDeps({ store })} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('radio', { name: /held vowel/ }));
    expect(screen.getByText('Say “aah” steadily for about 2 seconds.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Record' }));
    await screen.findByRole('heading', { name: 'Good recording' });
    expect(store.rows[0]?.kind).toBe('word');
    expect(store.rows[0]?.prompt).toBe('Say “aah” steadily for about 2 seconds.');
  });

  it('DownloadAll_SavesOneZipFile', async () => {
    const createUrl = vi.fn<(blob: Blob) => string>(() => 'blob:zip');
    URL.createObjectURL = createUrl;
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    render(<RecordScreen deps={makeDeps({ store: memoryStore([{ readings: goodReadings }, { readings: goodReadings }]) })} />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Download all takes (ZIP)' }));
    await waitFor(() => {
      expect(click).toHaveBeenCalledTimes(1);
    });
    expect(createUrl.mock.calls[0]?.[0].type).toBe('application/zip');
    expect(screen.getByText(/2 takes in the file/)).toBeInTheDocument();
  });

  it('Recorder_TalkMode_ShowsTalkPrompt', async () => {
    render(<RecordScreen deps={makeDeps()} />);
    await userEvent.setup().click(screen.getByRole('radio', { name: /short talk/ }));
    expect(screen.getByText('Say what you did this morning.')).toBeInTheDocument();
  });
});
