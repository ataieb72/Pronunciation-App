import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { SessionRow } from '../../src/data/database';
import { TodayScreen } from '../../src/today/TodayScreen';
import { memorySessions } from '../session/fakes';

// Local time: Wednesday 30 September 2026, 9:00.
const now = () => new Date(2026, 8, 30, 9, 0);
const on = (day: number): string => new Date(2026, 8, day, 8, 0).toISOString();

const baselines: Partial<SessionRow>[] = [
  { kind: 'baseline', language: 'en', length: null, startedAt: on(26) },
  { kind: 'baseline', language: 'fr', length: null, startedAt: on(27) },
];

describe('Today screen', () => {
  it('Today_ShowsLanguageAndWeek', async () => {
    // Monday English, Tuesday French: Wednesday is English again.
    const sessions = memorySessions([...baselines, { language: 'en', startedAt: on(28) }, { language: 'fr', startedAt: on(29) }]);
    render(<TodayScreen deps={{ sessions, now }} />);
    expect(await screen.findByText('Language of the day: English')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start · 10 min' })).toHaveAttribute('href', '#/session/10/en');
    expect(screen.getByRole('link', { name: '5 min' })).toHaveAttribute('href', '#/session/5/en');
    expect(screen.getByLabelText('2 of 4 practice days this week')).toHaveTextContent('●●○○');
  });

  it('Today_NoBaseline_OffersBaseline', async () => {
    render(<TodayScreen deps={{ sessions: memorySessions([]), now }} />);
    expect(await screen.findByText(/record your English baseline/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Record baseline' })).toHaveAttribute('href', '#/session/10/en');
    expect(screen.queryByRole('link', { name: 'Start · 10 min' })).not.toBeInTheDocument();
  });

  it('Today_Switch_ChangesLanguage', async () => {
    const user = userEvent.setup();
    render(<TodayScreen deps={{ sessions: memorySessions([]), now }} />);
    await user.click(await screen.findByRole('button', { name: 'Switch to Français' }));
    expect(screen.getByText('Language of the day: Français')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Record baseline' })).toHaveAttribute('href', '#/session/10/fr');
  });

  it('Settings_TargetChange_Saved', async () => {
    const user = userEvent.setup();
    const sessions = memorySessions(baselines);
    render(<TodayScreen deps={{ sessions, now }} />);
    await user.selectOptions(await screen.findByLabelText('Practice days a week'), '5');
    await waitFor(() => {
      expect(sessions.saved.weeklyTarget).toBe(5);
    });
    expect(screen.getByLabelText('0 of 5 practice days this week')).toHaveTextContent('○○○○○');
  });
});
