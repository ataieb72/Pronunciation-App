import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { loadAzureSettings, saveAzureSettings } from '../src/azureSettings';
import { AzureSetup } from '../src/components/AzureSetup';

const KEY = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';

async function fillAndSave(key: string, region: string) {
  const user = userEvent.setup();
  if (key !== '') await user.type(screen.getByLabelText('Azure key'), key);
  if (region !== '') await user.type(screen.getByLabelText('Region'), region);
  await user.click(screen.getByRole('button', { name: 'Save on this phone' }));
  return user;
}

describe('AzureSetup', () => {
  it('Setup_EmptyFields_SaveDisabled', () => {
    render(<AzureSetup />);
    expect(screen.getByRole('button', { name: 'Save on this phone' })).toBeDisabled();
  });

  it('Setup_KeyField_IsHiddenAndNotAutofilled', () => {
    render(<AzureSetup />);
    const input = screen.getByLabelText('Azure key');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'off');
  });

  it('Setup_ValidValues_SavesAndShowsMaskedKey', async () => {
    render(<AzureSetup />);
    await fillAndSave(KEY, 'UK South');
    expect(await screen.findByRole('heading', { name: 'Azure key saved ✓' })).toBeInTheDocument();
    expect(loadAzureSettings()).toEqual({ key: KEY, region: 'uksouth' });
    expect(screen.getByText(/…c5d6/)).toBeInTheDocument();
    expect(screen.getByText(/uksouth/)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain(KEY);
    expect(screen.queryByLabelText('Azure key')).not.toBeInTheDocument();
  });

  it('Setup_BadKey_ShowsKeyErrorAndSavesNothing', async () => {
    render(<AzureSetup />);
    await fillAndSave('not-a-key', 'uksouth');
    expect(await screen.findByRole('alert')).toHaveTextContent('does not look like an Azure key');
    expect(loadAzureSettings()).toBeNull();
  });

  it('Setup_BadRegion_ShowsRegionError', async () => {
    render(<AzureSetup />);
    await fillAndSave(KEY, 'uksouth.example.com');
    expect(await screen.findByRole('alert')).toHaveTextContent('region');
    expect(loadAzureSettings()).toBeNull();
  });

  it('Setup_StorageBlocked_ShowsErrorAndStaysOnForm', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    render(<AzureSetup />);
    await fillAndSave(KEY, 'uksouth');
    expect(await screen.findByRole('alert')).toHaveTextContent('could not store');
    expect(screen.queryByRole('heading', { name: 'Azure key saved ✓' })).not.toBeInTheDocument();
  });

  it('Setup_SavedEarlier_StartsSaved', () => {
    saveAzureSettings({ key: KEY, region: 'uksouth' });
    render(<AzureSetup />);
    expect(screen.getByRole('heading', { name: 'Azure key saved ✓' })).toBeInTheDocument();
  });

  it('Setup_RemoveConfirmed_ClearsKey', async () => {
    saveAzureSettings({ key: KEY, region: 'uksouth' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<AzureSetup />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Remove the key from this phone' }));
    expect(loadAzureSettings()).toBeNull();
    expect(screen.getByLabelText('Azure key')).toHaveValue('');
  });

  it('Setup_RemoveCancelled_KeepsKey', async () => {
    saveAzureSettings({ key: KEY, region: 'uksouth' });
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<AzureSetup />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Remove the key from this phone' }));
    expect(loadAzureSettings()).toEqual({ key: KEY, region: 'uksouth' });
  });
});
