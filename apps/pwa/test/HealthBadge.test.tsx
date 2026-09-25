import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HealthBadge } from '../src/components/HealthBadge';
import { jsonResponse, mockFetch } from './fetchMock';

describe('HealthBadge', () => {
  it('HealthBadge_ServerUp_ShowsOnline', async () => {
    mockFetch({ 'GET /api/health': () => jsonResponse({ status: 'ok', db: true }) });
    render(<HealthBadge />);
    expect(await screen.findByText('Server: online')).toBeInTheDocument();
  });

  it('HealthBadge_ServerDown_ShowsOffline', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))));
    render(<HealthBadge />);
    expect(await screen.findByText('Server: offline')).toBeInTheDocument();
  });

  it('HealthBadge_Degraded_ShowsDegraded', async () => {
    mockFetch({ 'GET /api/health': () => jsonResponse({ status: 'degraded', db: false }, 503) });
    render(<HealthBadge />);
    expect(await screen.findByText('Server: degraded')).toBeInTheDocument();
  });
});
