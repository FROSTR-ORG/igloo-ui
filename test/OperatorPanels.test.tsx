import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  ExportPackageModal,
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

  it('summarizes peer readiness counts and filters the diagnostics log by domain', () => {
    const onClearLogs = vi.fn();

    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/3',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'running',
          relaySummary: 'Runtime is attached.',
          peerRows: [
            {
              id: 'peer-1',
              alias: 'Peer #1',
              pubkey: 'peer-1',
              state: 'online',
              statusLabel: 'sign-ready',
              canSign: true,
              canEcdh: true,
              canPing: true,
              lastResponseLatencyMs: 120,
              avgLatencyMs: 95,
              nonceSeries: [
                { ts: 1700000000, held: 4 },
                { ts: 1700000005, held: 6 },
              ],
              lastSeenLabel: 'last seen 5/31/2026, 2:14 PM',
            },
            {
              id: 'peer-2',
              alias: 'Peer #2',
              pubkey: 'peer-2',
              state: 'offline',
              statusLabel: 'offline',
              canSign: false,
              canEcdh: false,
              canPing: false,
              lastResponseLatencyMs: null,
              avgLatencyMs: null,
              nonceSeries: [],
            },
          ],
          pendingOperationRows: [],
          eventRows: [
            { id: 'e1', badgeLabel: 'sign', badgeTone: 'info', message: 'sign request received' },
            { id: 'e2', badgeLabel: 'sync', badgeTone: 'info', message: 'peer roster synced' },
          ],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
        onClearLogs={onClearLogs}
      />,
    );

    // Peer header counts: 1 of 2 reachable, 1 sign-ready; last-seen surfaces per row.
    expect(screen.getByText('1/2 online')).toBeInTheDocument();
    expect(screen.getByText('1 ready')).toBeInTheDocument();
    expect(screen.getByText('last seen 5/31/2026, 2:14 PM')).toBeInTheDocument();

    // Telemetry: per-method capability badges (both peers), latency, and the
    // nonce-history sparkline (only the peer with a series).
    expect(screen.getAllByText('SIGN')).toHaveLength(2);
    expect(screen.getAllByText('ECDH')).toHaveLength(2);
    expect(screen.getAllByText('PING')).toHaveLength(2);
    expect(screen.getByText('120 ms (avg 95 ms)')).toBeInTheDocument();
    expect(screen.getByLabelText('Peer #1 nonce history')).toBeInTheDocument();
    expect(screen.queryByLabelText('Peer #2 nonce history')).not.toBeInTheDocument();

    // Both domains render until a filter narrows the list.
    expect(screen.getByText('sign request received')).toBeInTheDocument();
    expect(screen.getByText('peer roster synced')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'sync', pressed: false }));
    expect(screen.queryByText('sign request received')).not.toBeInTheDocument();
    expect(screen.getByText('peer roster synced')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear Log' }));
    expect(onClearLogs).toHaveBeenCalledTimes(1);
  });

  it('hides the peer summary pills when showPeerSummary is false', () => {
    const { rerender } = render(
      <OperatorPermissionsPanel
        view={{ peerRows: [] }}
        showPeerSummary={false}
      />,
    );
    expect(screen.queryByText('Peers')).not.toBeInTheDocument();
    expect(screen.queryByText('Effective responders')).not.toBeInTheDocument();

    // Default keeps the peer pills for other consumers (e.g. igloo-chrome).
    rerender(<OperatorPermissionsPanel view={{ peerRows: [] }} />);
    expect(screen.getByText('Peers')).toBeInTheDocument();
    expect(screen.getByText('Effective responders')).toBeInTheDocument();
  });

  it('gates export on a matching password and shows the complete state', () => {
    const onExport = vi.fn();
    const onCopy = vi.fn();
    const onDownload = vi.fn();

    const { rerender } = render(
      <ExportPackageModal
        open
        onClose={vi.fn()}
        title="Export Profile"
        description="Create an encrypted backup."
        summary="Share #1 (Index 1) · Keyset: My Signing Key · 2 relays · 3 peers"
        result={null}
        onExport={onExport}
        onCopy={onCopy}
        onDownload={onDownload}
      />,
    );

    // Export is disabled until the passwords match.
    expect(screen.getByTestId('export-submit')).toBeDisabled();
    fireEvent.change(screen.getByTestId('export-password'), { target: { value: 'export-pass' } });
    fireEvent.change(screen.getByTestId('export-confirm'), { target: { value: 'mismatch' } });
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(screen.getByTestId('export-submit')).toBeDisabled();

    fireEvent.change(screen.getByTestId('export-confirm'), { target: { value: 'export-pass' } });
    fireEvent.click(screen.getByTestId('export-submit'));
    expect(onExport).toHaveBeenCalledWith('export-pass');

    // Once the parent supplies a result, the complete state offers copy + download.
    rerender(
      <ExportPackageModal
        open
        onClose={vi.fn()}
        title="Export Profile"
        description="Create an encrypted backup."
        summary="Share #1 (Index 1) · Keyset: My Signing Key · 2 relays · 3 peers"
        result="bfprofile1exportedpackage"
        onExport={onExport}
        onCopy={onCopy}
        onDownload={onDownload}
      />,
    );
    expect(screen.getByTestId('export-result')).toHaveTextContent('bfprofile1exportedpackage');
    fireEvent.click(screen.getByTestId('export-copy'));
    expect(onCopy).toHaveBeenCalledWith('bfprofile1exportedpackage');
    fireEvent.click(screen.getByTestId('export-download'));
    expect(onDownload).toHaveBeenCalledWith('bfprofile1exportedpackage');
  });
});
