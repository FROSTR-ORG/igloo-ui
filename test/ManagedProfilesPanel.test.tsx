import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ManagedProfilesPanel } from '../src/components/flows/ManagedProfilesPanel';

describe('ManagedProfilesPanel', () => {
  it('renders selected profile details and wires profile actions', () => {
    const onSelectProfile = vi.fn();
    const onExport = vi.fn();
    const onActivateProfile = vi.fn();
    const onStopActiveProfile = vi.fn();

    const profile = {
      id: 'alice',
      label: 'Alice',
      relay_profile: 'default',
      group_ref: 'group.json',
      share_ref: 'vault:share',
      state_path: '/tmp/state',
      created_at: 1700000000,
    };

    render(
      <ManagedProfilesPanel
        profiles={[profile]}
        selectedProfileId="alice"
        activeProfileId="alice"
        selectedProfile={profile}
        vaultPassphrase=""
        onSelectProfile={onSelectProfile}
        onActivateProfile={onActivateProfile}
        onStopActiveProfile={onStopActiveProfile}
        onChangeVaultPassphrase={vi.fn()}
        onDelete={vi.fn()}
        onExport={onExport}
        onRefresh={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /alice.*alice.*default/i }));
    expect(onSelectProfile).toHaveBeenCalledWith('alice');
    fireEvent.click(screen.getByRole('button', { name: /^export$/i }));
    expect(onExport).toHaveBeenCalledWith('alice');
    fireEvent.click(screen.getByRole('button', { name: /^stop signer$/i }));
    expect(onStopActiveProfile).toHaveBeenCalledTimes(1);
    expect(onActivateProfile).not.toHaveBeenCalled();
  });
});
