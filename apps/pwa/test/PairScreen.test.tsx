import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PairScreen } from '../src/components/PairScreen';
import { loadDeviceToken, saveDeviceToken } from '../src/deviceToken';
import { jsonResponse, mockFetch } from './fetchMock';

const TOKEN = 'B'.repeat(43);

async function submitCode(code: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Pairing code'), code);
  await user.click(screen.getByRole('button', { name: 'Pair this phone' }));
  return user;
}

describe('PairScreen', () => {
  it('PairScreen_EmptyCode_ButtonDisabled', () => {
    render(<PairScreen />);
    expect(screen.getByRole('button', { name: 'Pair this phone' })).toBeDisabled();
  });

  it('PairScreen_ValidCode_ShowsPairedAndStoresToken', async () => {
    mockFetch({ 'POST /api/pair': () => jsonResponse({ deviceToken: TOKEN }, 201) });
    render(<PairScreen />);
    await submitCode('correct-code-123');
    expect(await screen.findByRole('heading', { name: 'Paired ✓' })).toBeInTheDocument();
    expect(loadDeviceToken()).toBe(TOKEN);
    expect(screen.queryByLabelText('Pairing code')).not.toBeInTheDocument();
  });

  it('PairScreen_WrongCode_ShowsError', async () => {
    mockFetch({ 'POST /api/pair': () => jsonResponse({ error: 'invalid_code' }, 401) });
    render(<PairScreen />);
    await submitCode('wrong-code-123');
    expect(await screen.findByRole('alert')).toHaveTextContent('That code is not right');
    expect(loadDeviceToken()).toBeNull();
  });

  it('PairScreen_RateLimited_ShowsMinutes', async () => {
    mockFetch({ 'POST /api/pair': () => jsonResponse({ error: 'rate_limited', retryAfter: 125 }, 429) });
    render(<PairScreen />);
    await submitCode('any-code-123');
    expect(await screen.findByRole('alert')).toHaveTextContent('Try again in 3 minutes');
  });

  it('PairScreen_DeviceLimit_ShowsMessage', async () => {
    mockFetch({ 'POST /api/pair': () => jsonResponse({ error: 'device_limit' }, 403) });
    render(<PairScreen />);
    await submitCode('any-code-123');
    expect(await screen.findByRole('alert')).toHaveTextContent('already paired');
  });

  it('PairScreen_NetworkError_ShowsMessage', async () => {
    mockFetch({});
    render(<PairScreen />);
    await submitCode('any-code-123');
    expect(await screen.findByRole('alert')).toHaveTextContent('No connection');
  });

  it('PairScreen_TokenStored_StartsPaired', () => {
    saveDeviceToken(TOKEN);
    render(<PairScreen />);
    expect(screen.getByRole('heading', { name: 'Paired ✓' })).toBeInTheDocument();
  });

  it('PairScreen_Unpair_CallsDeleteAndClearsToken', async () => {
    saveDeviceToken(TOKEN);
    const fetch = mockFetch({ 'DELETE /api/pair': () => new Response(null, { status: 204 }) });
    render(<PairScreen />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Unpair this phone' }));
    expect(await screen.findByLabelText('Pairing code')).toBeInTheDocument();
    expect(loadDeviceToken()).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('PairScreen_UnpairOffline_KeepsTokenAndShowsError', async () => {
    saveDeviceToken(TOKEN);
    mockFetch({});
    render(<PairScreen />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Unpair this phone' }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('No connection');
    });
    expect(loadDeviceToken()).toBe(TOKEN);
  });
});
