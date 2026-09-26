import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionScreen } from '../../src/session/SessionScreen';
import { goodReadings, speechOnly } from '../record/fakes';
import { badReadings, level, sessionDeps } from './fakes';

let visibility: DocumentVisibilityState = 'visible';
Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });
afterEach(() => {
  visibility = 'visible';
});

const heading = (name: string | RegExp) => screen.findByRole('heading', { level: 2, name }, { timeout: 3000 });

async function start(user: UserEvent) {
  await user.click(await screen.findByRole('button', { name: 'Start' }));
}

/** Records one take and waits for the next step's heading. */
async function take(user: UserEvent, next: string | RegExp) {
  await user.click(screen.getByRole('button', { name: 'Record' }));
  await heading(next);
}

describe('session screen', () => {
  it('Session_WarmUp_ThenPairs', async () => {
    const user = userEvent.setup();
    render(<SessionScreen language="en" length={5} deps={sessionDeps()} />);
    expect(await heading('English · 5 minutes')).toBeInTheDocument();
    await start(user);
    await heading('Warm-up 1 of 2');
    expect(screen.getByText('Say it big and clear.')).toBeInTheDocument();
    await take(user, 'Warm-up 2 of 2');
    await take(user, 'Pair 1 of 4: your usual way');
  });

  it('Pair_UsualThenClear_ThenJudge', async () => {
    const user = userEvent.setup();
    const deps = sessionDeps();
    render(<SessionScreen language="fr" length={5} deps={deps} />);
    await start(user);
    await take(user, 'Warm-up 2 of 2');
    await take(user, 'Pair 1 of 4: your usual way');
    await take(user, 'Pair 1 of 4: big and clear');
    expect(screen.getByText('Now big and clear. Open your jaw.')).toBeInTheDocument();
    await take(user, 'Pair 1 of 4: which is clearer?');
    expect(screen.getByText('Which would your listener catch better?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    await heading('Pair 2 of 4: your usual way');

    const session = deps.sessions.rows.at(-1);
    const pair = session?.blocks[0]?.pairs[0];
    expect(pair?.judgement).toBe('clear');
    const roles = deps.takes.rows.map((row) => [row.role, row.itemId, row.sessionId]);
    expect(roles.slice(2)).toEqual([
      ['usual', pair?.itemId, session?.id],
      ['clear', pair?.itemId, session?.id],
    ]);
    expect(deps.takes.rows.every((row) => row.language === 'fr')).toBe(true);
  });

  it('Pair_FailedTake_AsksRetake', async () => {
    const user = userEvent.setup();
    render(<SessionScreen language="en" length={5} deps={sessionDeps({ readings: [badReadings, goodReadings] })} />);
    await start(user);
    await user.click(await screen.findByRole('button', { name: 'Record' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Please record again');
    expect(screen.getByRole('alert')).toHaveTextContent('Too quiet');
    expect(screen.getByRole('heading', { level: 2, name: 'Warm-up 1 of 2' })).toBeInTheDocument();
    await take(user, 'Warm-up 2 of 2');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('Block_ShowsSummaryAndNextCue_ThenWrapShowsCueAndWeek', async () => {
    const user = userEvent.setup();
    // Warm-up twice, then usual (−30 dB) and clear (−26 dB) in turn: louder in every pair.
    const pairs = Array.from({ length: 4 }, () => [level(-30), level(-26)]).flat();
    const deps = sessionDeps({ readings: [goodReadings, goodReadings, ...pairs] });
    render(<SessionScreen language="en" length={5} deps={deps} />);
    await start(user);
    await take(user, 'Warm-up 2 of 2');
    await take(user, 'Pair 1 of 4: your usual way');
    for (let i = 1; i <= 4; i++) {
      await take(user, `Pair ${String(i)} of 4: big and clear`);
      await take(user, `Pair ${String(i)} of 4: which is clearer?`);
      await user.click(screen.getByRole('button', { name: 'About the same' }));
      await heading(i < 4 ? `Pair ${String(i + 1)} of 4: your usual way` : 'Block 1 summary');
    }
    expect(screen.getByText('Probably changed: volume.')).toBeInTheDocument();
    expect(screen.getByText('Next: Keep your voice to the last word.')).toBeInTheDocument();
    expect(deps.sessions.rows.at(-1)?.counted).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Finish' }));
    await heading('Session done');
    expect(screen.getByText('Next time: Keep your voice to the last word.')).toBeInTheDocument();
    expect(screen.getByLabelText('1 of 4 practice days this week')).toHaveTextContent('●○○○');
    expect(deps.sessions.saved.lastCue).toBe('lastWord');
    expect(deps.sessions.rows.at(-1)?.nextCue).toBe('lastWord');
    expect(deps.sessions.rows.at(-1)?.endedAt).toBeDefined();
  }, 20_000);

  it('Baseline_UsualAllThenClearAll', async () => {
    const user = userEvent.setup();
    const deps = sessionDeps({ sessions: [] });
    render(<SessionScreen language="en" length={10} deps={deps} />);
    expect(await heading('Baseline · English')).toBeInTheDocument();
    await start(user);
    await heading('Your usual way: 1 of 8');
    expect(screen.getByText('I asked her to help me with the world map.')).toBeInTheDocument();
    for (let i = 2; i <= 8; i++) await take(user, `Your usual way: ${String(i)} of 8`);
    await take(user, 'Big and clear: 1 of 8');
    expect(screen.getByText('I asked her to help me with the world map.')).toBeInTheDocument();
    for (let i = 2; i <= 8; i++) await take(user, `Big and clear: ${String(i)} of 8`);
    await take(user, 'Baseline saved');
    const session = deps.sessions.rows.at(-1);
    expect(session).toMatchObject({ kind: 'baseline', counted: true, length: null });
    expect(session?.blocks[0]?.pairs.every((p) => p.usualTakeId !== null && p.clearTakeId !== null)).toBe(true);
    expect(deps.analyze).toHaveBeenCalledTimes(16);
  }, 20_000);

  it('Baseline_AllSkipped_NotCounted', async () => {
    const user = userEvent.setup();
    const deps = sessionDeps({ sessions: [] });
    render(<SessionScreen language="fr" length={10} deps={deps} />);
    await start(user);
    for (let i = 0; i < 16; i++) {
      await heading(/of 8$/);
      await user.click(screen.getByRole('button', { name: 'Skip this sentence' }));
    }
    await heading('Baseline not finished');
    expect(deps.sessions.rows.at(-1)?.counted).toBe(false);
  });

  it('EndSession_SavesWhatWasDone', async () => {
    const user = userEvent.setup();
    const deps = sessionDeps();
    render(<SessionScreen language="en" length={10} deps={deps} />);
    await start(user);
    await take(user, 'Warm-up 2 of 2');
    await user.click(screen.getByRole('button', { name: 'End session' }));
    await heading('Session ended');
    expect(screen.getByText(/did not count/)).toBeInTheDocument();
    const session = deps.sessions.rows.at(-1);
    expect(session?.warmUp).toHaveLength(1);
    expect(session?.counted).toBe(false);
    expect(session?.endedAt).toBeDefined();
  });

  it('Skip_JumpsToNextPair', async () => {
    const user = userEvent.setup();
    const deps = sessionDeps();
    render(<SessionScreen language="en" length={5} deps={deps} />);
    await start(user);
    await take(user, 'Warm-up 2 of 2');
    await take(user, 'Pair 1 of 4: your usual way');
    await user.click(screen.getByRole('button', { name: 'Skip this sentence' }));
    await heading('Pair 2 of 4: your usual way');
    expect(deps.sessions.rows.at(-1)?.blocks[0]?.pairs[0]?.skipped).toBe(true);
  });

  it('Judge_PlaysBothTakes', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    URL.createObjectURL = vi.fn(() => 'blob:take');
    URL.revokeObjectURL = vi.fn();
    const user = userEvent.setup();
    render(<SessionScreen language="en" length={5} deps={sessionDeps()} />);
    await start(user);
    await take(user, 'Warm-up 2 of 2');
    await take(user, 'Pair 1 of 4: your usual way');
    await take(user, 'Pair 1 of 4: big and clear');
    await take(user, 'Pair 1 of 4: which is clearer?');
    await user.click(screen.getByRole('button', { name: 'Play usual' }));
    await user.click(screen.getByRole('button', { name: 'Play clear' }));
    await waitFor(() => {
      expect(play).toHaveBeenCalledTimes(2);
    });
  });

  it('PageHidden_DiscardsTake', async () => {
    const user = userEvent.setup();
    render(<SessionScreen language="en" length={5} deps={sessionDeps({ signal: speechOnly() })} />);
    await start(user);
    await user.click(await screen.findByRole('button', { name: 'Record' }));
    await screen.findByRole('button', { name: 'Stop' });
    visibility = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
    expect(await screen.findByText(/app went to the background/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Warm-up 1 of 2' })).toBeInTheDocument();
  });
});
