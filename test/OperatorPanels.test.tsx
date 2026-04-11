import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  OperatorDashboardTabs,
  OperatorPermissionsPanel,
  OperatorSettingsPanel,
  OperatorSignerPanel,
} from '../src';

describe('operator dashboard surface', () => {
  it('switches dashboard tabs through the canonical operator tab shell', () => {
    const onChangeTab = vi.fn();

    render(
      <OperatorDashboardTabs
        activeTab="signer"
        onChangeTab={onChangeTab}
        tabs={[
          { key: 'signer', label: 'Signer', description: 'runtime console' },
          { key: 'permissions', label: 'Permissions', description: 'peer policies' },
          { key: 'settings', label: 'Settings', description: 'operator controls' },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('tab', { name: /Permissions\s+peer policies/i }));
    expect(onChangeTab).toHaveBeenCalledWith('permissions');
  });

  it('renders signer, permissions, and settings interactions from the shared operator panels', () => {
    const onPrimaryAction = vi.fn();
    const onClearAllPeerPermissions = vi.fn();
    const onPeerPermissionChange = vi.fn();
    const onSave = vi.fn();
    const onCopyProfile = vi.fn();
    const onCopyShare = vi.fn();
    const onRotateShare = vi.fn();
    const onLogout = vi.fn();

    render(
      <div>
        <OperatorSignerPanel
          profile={{
            name: 'Primary Browser Device',
            sharePublicKey: 'share-pub-1',
            groupPublicKey: 'group-pub-1',
          }}
          introMessage="Runtime is attached."
          runtimeState="running"
          runtimeControlLabel="Stop Signer"
          runtimeSummaryLabel="running"
          statusBanner={<div>Refreshed 2 of 3 peers. 1 peer refresh failed.</div>}
          sharePublicKey="share-pub-1"
          groupPublicKey="group-pub-1"
          onPrimaryAction={onPrimaryAction}
          peers={[]}
          pendingOperations={[]}
          logs={[]}
        />
        <OperatorPermissionsPanel
          peerPermissions={[
            {
              pubkey: 'peer-1',
              send: true,
              receive: false,
            },
          ]}
          onClearAllPeerPermissions={onClearAllPeerPermissions}
          onPeerPermissionChange={onPeerPermissionChange}
        />
        <OperatorSettingsPanel
          hasProfile
          signerName="Primary Browser Device"
          onSignerNameChange={vi.fn()}
          relays={['wss://relay.primal.net']}
          newRelayUrl=""
          onNewRelayUrlChange={vi.fn()}
          onAddRelay={vi.fn()}
          onRemoveRelay={vi.fn()}
          signerSettings={{
            sign_timeout_secs: 30,
            ping_timeout_secs: 15,
            request_ttl_secs: 300,
            state_save_interval_secs: 30,
            peer_selection_strategy: 'deterministic_sorted',
          }}
          onSignerSettingNumberChange={vi.fn()}
          onPeerSelectionStrategyChange={vi.fn()}
          onSave={onSave}
          maintenanceActions={[
            { label: 'copy profile', onClick: onCopyProfile },
            { label: 'copy share', onClick: onCopyShare },
            { label: 'rotate share', onClick: onRotateShare },
            { label: 'logout', onClick: onLogout, variant: 'outline' },
          ]}
        />
      </div>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Stop Signer' }));
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Refreshed 2 of 3 peers. 1 peer refresh failed.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear All' }));
    expect(onClearAllPeerPermissions).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'send: allow' }));
    expect(onPeerPermissionChange).toHaveBeenCalledWith('peer-1', 'send', false);

    fireEvent.click(screen.getByRole('button', { name: 'receive: deny' }));
    expect(onPeerPermissionChange).toHaveBeenCalledWith('peer-1', 'receive', true);

    fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
    expect(onSave).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'copy profile' }));
    fireEvent.click(screen.getByRole('button', { name: 'copy share' }));
    fireEvent.click(screen.getByRole('button', { name: 'rotate share' }));
    fireEvent.click(screen.getByRole('button', { name: 'logout' }));
    expect(onCopyProfile).toHaveBeenCalledTimes(1);
    expect(onCopyShare).toHaveBeenCalledTimes(1);
    expect(onRotateShare).toHaveBeenCalledTimes(1);
    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /wipe all data/i })).not.toBeInTheDocument();
  });
});
