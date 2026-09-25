import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../src/App';

describe('App', () => {
  it('App_Renders_ShowsAppName', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Pronunciation Coach' })).toBeInTheDocument();
  });
});
