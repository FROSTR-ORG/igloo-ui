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
          view={{
            profileName: 'Primary Browser Device',
            thresholdLabel: '2/3',
            publicKeyLabel: 'group-pub-1',
            shareLabel: 'Share #1',
            readinessLabel: 'running',
            relaySummary: 'Runtime is attached.',
            peerRows: [],
            pendingOperationRows: [],
            eventRows: [],
          }}
          introMessage="Runtime is attached."
          runtimeControlLabel="Stop Signer"
          statusBanner={<div>Refreshed 2 of 3 peers. 1 peer refresh failed.</div>}
          onPrimaryAction={onPrimaryAction}
        />
        <OperatorPermissionsPanel
          view={{
            peerRows: [
              {
                pubkey: 'peer-1',
                request: { ping: true, onboard: true, sign: true, ecdh: false },
                respond: { ping: true, onboard: false, sign: false, ecdh: false },
                manualOverride: {
                  request: { ping: 'allow', onboard: 'unset', sign: 'unset', ecdh: 'unset' },
                  respond: { ping: 'unset', onboard: 'unset', sign: 'deny', ecdh: 'unset' },
                },
              },
            ],
          }}
          onClearAllPeerPermissions={onClearAllPeerPermissions}
          onPeerPolicyOverrideChange={onPeerPermissionChange}
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

    fireEvent.click(screen.getByRole('button', { name: 'request sign: allow' }));
    expect(onPeerPermissionChange).toHaveBeenCalledWith('peer-1', 'request', 'sign', 'deny');

    fireEvent.click(screen.getByRole('button', { name: 'respond sign: deny' }));
    expect(onPeerPermissionChange).toHaveBeenCalledWith('peer-1', 'respond', 'sign', 'unset');

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

  it('merges identity into the signer card with npub/hex split-copy and a pending-approvals empty state', () => {
    const onCopyGroupKey = vi.fn();
    const onCopyShareKey = vi.fn();

    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/3',
          memberLabel: 'Share #1',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'share-pub-1',
          groupKey: { display: 'npub1qe3...7k4m', npub: 'npub1qe3group', hex: 'aa'.repeat(32) },
          shareKey: { display: 'npub1zfd...3k9p', npub: 'npub1zfdshare', hex: 'bb'.repeat(32) },
          running: true,
          readinessLabel: 'running',
          relaySummary: 'Browser runtime connected',
          peerRows: [],
          pendingApprovalRows: [],
          pendingOperationRows: [],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        copiedField={null}
        onCopyGroupKey={onCopyGroupKey}
        onCopyShareKey={onCopyShareKey}
        onPrimaryAction={vi.fn()}
      />,
    );

    // Member label appears on the merged card.
    expect(screen.getByText('Share #1')).toBeInTheDocument();

    // Default copy buttons copy npub.
    fireEvent.click(screen.getByTestId('dashboard-group-key-copy'));
    expect(onCopyGroupKey).toHaveBeenCalledWith('npub');

    // The format caret reveals a hex option.
    fireEvent.click(screen.getByTestId('dashboard-share-key-format'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy hex' }));
    expect(onCopyShareKey).toHaveBeenCalledWith('hex');

    // The format menu dismisses on an outside click.
    fireEvent.click(screen.getByTestId('dashboard-group-key-format'));
    expect(screen.getByRole('menuitem', { name: 'Copy hex' })).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menuitem', { name: 'Copy hex' })).not.toBeInTheDocument();

    // Pending Approvals renders as a calm empty state (deferred behavior).
    expect(screen.getByText('No pending approvals.')).toBeInTheDocument();
  });
});
