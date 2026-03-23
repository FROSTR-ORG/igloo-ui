import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CreateImportPanel } from '../src/components/flows/CreateImportPanel';

describe('CreateImportPanel', () => {
  it('dispatches onboarding import from the onboarding section', () => {
    const onImportOnboardingProfile = vi.fn();

    render(
      <CreateImportPanel
        createForm={{ threshold: '2', count: '3', nsec: '' }}
        importForm={{
          label: '',
          vaultPassphrase: '',
          relayUrls: '',
          groupPackageJson: '',
          sharePackageJson: '',
        }}
        onboardingForm={{
          packageText: 'bfonboard1demo',
          password: 'secret',
          vaultPassphrase: 'vault-pass',
          label: 'Bob',
        }}
        generatedKeyset={null}
        saveForms={{}}
        onChangeCreateForm={vi.fn()}
        onGenerateFresh={vi.fn()}
        onChangeImportForm={vi.fn()}
        onChangeOnboardingForm={vi.fn()}
        onImportOnboardingProfile={onImportOnboardingProfile}
        onImportRawProfile={vi.fn()}
        onChangeSaveForm={vi.fn()}
        onSaveGeneratedProfile={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^onboard$/i }));
    fireEvent.click(screen.getByRole('button', { name: /import onboarding package/i }));
    expect(onImportOnboardingProfile).toHaveBeenCalledTimes(1);
  });
});
