import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../src/App';

afterEach(() => {
  window.location.hash = '';
});

describe('App', () => {
  it('App_Renders_ShowsAppNameAndKeySetup', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Pronunciation Coach' })).toBeInTheDocument();
    expect(screen.getByLabelText('Azure key')).toBeInTheDocument();
  });

  it('App_SpikeHash_ShowsPhoneTest', async () => {
    window.location.hash = '#/spike';
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1, name: 'Phone test' })).toBeInTheDocument();
  });

  it('App_HashChanges_SwitchesPage', async () => {
    render(<App />);
    act(() => {
      window.location.hash = '#/spike';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(await screen.findByRole('heading', { level: 1, name: 'Phone test' })).toBeInTheDocument();
    act(() => {
      window.location.hash = '#/';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(await screen.findByRole('heading', { level: 1, name: 'Pronunciation Coach' })).toBeInTheDocument();
  });

  it('App_SpikeWithoutKey_AsksForKeyFirst', async () => {
    window.location.hash = '#/spike';
    render(<App />);
    expect(await screen.findByText(/Add your Azure key first/)).toBeInTheDocument();
  });
});
