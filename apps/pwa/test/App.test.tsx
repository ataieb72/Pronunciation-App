import 'fake-indexeddb/auto';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../src/App';

afterEach(() => {
  window.location.hash = '';
});

describe('App', () => {
  it('App_Renders_ShowsAppNameRecorderLinkAndKeySetup', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Pronunciation Coach' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open the recorder' })).toHaveAttribute('href', '#/record');
    expect(screen.getByLabelText('Azure key')).toBeInTheDocument();
  });

  it('App_RecordHash_ShowsRecorder', async () => {
    window.location.hash = '#/record';
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1, name: 'Record and replay' })).toBeInTheDocument();
  });

  it('App_HashChanges_SwitchesPage', async () => {
    render(<App />);
    act(() => {
      window.location.hash = '#/record';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(await screen.findByRole('heading', { level: 1, name: 'Record and replay' })).toBeInTheDocument();
    act(() => {
      window.location.hash = '#/';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(await screen.findByRole('heading', { level: 1, name: 'Pronunciation Coach' })).toBeInTheDocument();
  });

  it('App_OldPhoneTestLink_ShowsStartPage', () => {
    window.location.hash = '#/spike';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Pronunciation Coach' })).toBeInTheDocument();
  });
});
