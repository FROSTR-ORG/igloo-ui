import type * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CreateImportPanel } from '../src/components/flows/CreateImportPanel';

function renderCreateImportPanel(overrides: Partial<React.ComponentProps<typeof CreateImportPanel>> = {}) {
  const props: React.ComponentProps<typeof CreateImportPanel> = {
    createForm: { threshold: '2', count: '3', nsec: '' },
    importForm: {
      label: '',
      vaultPassphrase: '',
      relayUrls: '',
      groupPackageJson: '',
      sharePackageJson: '',
    },
    onboardingForm: {
      packageText: 'bfonboard1demo',
      password: 'secret',
      vaultPassphrase: 'vault-pass',
      label: 'Bob',
    },
    generatedKeyset: null,
    saveForms: {},
    onChangeCreateForm: vi.fn(),
    onGenerateFresh: vi.fn(),
    onChangeImportForm: vi.fn(),
    onChangeOnboardingForm: vi.fn(),
    onImportOnboardingProfile: vi.fn(),
    onImportRawProfile: vi.fn(),
    onChangeSaveForm: vi.fn(),
    onSaveGeneratedProfile: vi.fn(),
    ...overrides,
  };

  return {
    ...render(<CreateImportPanel {...props} />),
    props,
  };
}

describe('CreateImportPanel', () => {
  it('renders Paper-backed tooltip affordances in the create tab', () => {
    renderCreateImportPanel();

    const thresholdHelp = screen.getByRole('button', { name: 'About threshold' });
    const totalSharesHelp = screen.getByRole('button', { name: 'About total shares' });
    const thresholdTooltip = document.getElementById(thresholdHelp.getAttribute('aria-describedby') ?? '');
    const totalSharesTooltip = document.getElementById(totalSharesHelp.getAttribute('aria-describedby') ?? '');

    expect(thresholdHelp).toHaveAttribute('data-tooltip-placement', 'right');
    expect(totalSharesHelp).toHaveAttribute('data-tooltip-placement', 'right');
    expect(thresholdTooltip).toHaveTextContent('The minimum number of shares required to sign.');
    expect(totalSharesTooltip).toHaveTextContent('Specify the total number of shares to create');
    expect(screen.getByLabelText('Total shares')).toBeInTheDocument();
  });

  it('renders Paper-backed tooltip affordances in the onboarding tab', () => {
    renderCreateImportPanel();

    fireEvent.click(screen.getByRole('button', { name: /^onboard$/i }));

    const packageHelp = screen.getByRole('button', { name: 'About onboarding packages' });
    const passwordHelp = screen.getByRole('button', { name: 'About package passwords' });
    const packageTooltip = document.getElementById(packageHelp.getAttribute('aria-describedby') ?? '');
    const passwordTooltip = document.getElementById(passwordHelp.getAttribute('aria-describedby') ?? '');

    expect(packageTooltip).toHaveTextContent('A credential used to onboard a new peer/device into a keyset.');
    expect(passwordTooltip).toHaveTextContent('Decrypts the onboarding package');
  });

  it('dispatches onboarding import from the onboarding section', () => {
    const onImportOnboardingProfile = vi.fn();

    renderCreateImportPanel({ onImportOnboardingProfile });

    fireEvent.click(screen.getByRole('button', { name: /^onboard$/i }));
    fireEvent.click(screen.getByRole('button', { name: /import onboarding package/i }));
    expect(onImportOnboardingProfile).toHaveBeenCalledTimes(1);
  });
});
