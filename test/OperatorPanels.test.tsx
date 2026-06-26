import type * as React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  ClearCredentialsDialog,
  ExportPackageModal,
  OnboardDeviceSponsorDialog,
  OnboardDeviceSponsorshipPanel,
  OnboardDeviceSponsorshipDialog,
  DashboardLoadingState,
  DashboardSigningFailedDialog,
  OperatorDashboardTabs,
  OperatorPermissionsPanel,
  OperatorSettingsPanel,
  OperatorSettingsSidebar,
  OperatorSignerPanel,
  ProfilePasswordChangeDialog,
  SettingsUnsavedChangesDialog,
  type OperatorSettingsSidebarProps,
} from '../src';

describe('operator dashboard surface', () => {
  const minimalSettingsSidebarProps = {
    open: true,
    onClose: vi.fn(),
    hasProfile: true,
    signerName: 'Igloo Web',
    onSignerNameChange: vi.fn(),
    relays: [],
    newRelayUrl: '',
    onNewRelayUrlChange: vi.fn(),
    onAddRelay: vi.fn(),
    onRemoveRelay: vi.fn(),
    onSave: vi.fn(),
  } satisfies OperatorSettingsSidebarProps;

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

  it('renders the Paper dashboard loading-profile state', () => {
    render(
      <DashboardLoadingState
        profile={{
          profileName: 'My Signing Key',
          thresholdLabel: '2/3',
          publicKeyLabel: 'npub1qe3...7k4m',
          memberLabel: 'Share #1',
          shareLabel: '02a3f8...8f2c',
        }}
      />,
    );

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading profile...');
    expect(status).toHaveTextContent('Preparing your dashboard.');
    expect(screen.getByLabelText('Profile being loaded')).toHaveTextContent('My Signing Key');
    expect(screen.getByLabelText('Profile being loaded')).toHaveTextContent('2/3');
    expect(screen.getByLabelText('Profile being loaded')).toHaveTextContent('Share #1');
  });

  it('renders the Paper dashboard signing-failed dialog with recovery actions', () => {
    const onDismiss = vi.fn();
    const onRetry = vi.fn();

    render(
      <DashboardSigningFailedDialog
        open
        failure={{
          id: 'r-0x4f2a',
          message: 'Unable to complete signature for event kind:1. All 3 retry attempts exhausted.',
          detail: 'Round: r-0x4f2a · Peers responded: 1/2 · Error: insufficient partial signatures',
        }}
        onDismiss={onDismiss}
        onRetry={onRetry}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Signing Failed' });
    expect(dialog).toHaveTextContent('Unable to complete signature for event kind:1. All 3 retry attempts exhausted.');
    expect(dialog).toHaveTextContent('Round: r-0x4f2a · Peers responded: 1/2 · Error: insufficient partial signatures');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);

    fireEvent.click(within(dialog).getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
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

    const { container } = render(
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

    const requestPermissionMethods = Array.from(
      container.querySelectorAll('.igloo-permission-token[data-variant="policy"]'),
    )
      .slice(0, 4)
      .map((node) => node.getAttribute('data-method'));
    expect(requestPermissionMethods).toEqual(['sign', 'ecdh', 'ping', 'onboard']);
    expect(screen.getByRole('button', { name: 'request ecdh: deny' })).toHaveAttribute(
      'data-state',
      'inactive',
    );

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

  it('marks legacy operator settings save busy while saving', () => {
    render(
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
        onSave={vi.fn()}
        saving
      />,
    );

    const save = screen.getByRole('button', { name: 'Saving...' });
    expect(save).toBeDisabled();
    expect(save).toHaveAttribute('aria-busy', 'true');
    expect(save).toHaveAttribute('data-loading', 'true');
  });

  it('renders the Paper settings sidebar sections and actions', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    const onNameChange = vi.fn();
    const onNewRelayUrlChange = vi.fn();
    const onAddRelay = vi.fn();
    const onExportProfile = vi.fn();
    const onOnboardDevice = vi.fn();

    render(
      <OperatorSettingsSidebar
        open
        onClose={onClose}
        hasProfile
        signerName="Primary Browser Device"
        onSignerNameChange={onNameChange}
        memberLabel="Share #1"
        relays={['wss://relay.primal.net']}
        newRelayUrl=""
        onNewRelayUrlChange={onNewRelayUrlChange}
        onAddRelay={onAddRelay}
        onRemoveRelay={vi.fn()}
        profilePasswordAction={{
          title: 'Profile Password',
          description: 'Change the local password.',
          actionLabel: 'Change',
          disabled: true,
          onAction: vi.fn(),
        }}
        groupProfile={{
          keysetName: 'My Signing Key',
          keyNpub: 'npub1qe3...7k4m',
          thresholdLabel: '2 of 3',
          createdLabel: 'Feb 24, 2026',
          updatedLabel: 'Mar 8, 2026',
        }}
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
        onboardAction={{
          title: 'Onboard a Device',
          description: 'Sponsor a new device to join this keyset.',
          actionLabel: 'Onboard a Device',
          onAction: onOnboardDevice,
        }}
        replaceShareAction={{
          title: 'Replace Share',
          description: 'Import a bfonboard package to replace only this device.',
          actionLabel: 'Replace Share',
          onAction: vi.fn(),
        }}
        exportProfileAction={{
          title: 'Export Profile',
          description: 'Encrypted backup of your share and configuration',
          actionLabel: 'Export',
          onAction: onExportProfile,
        }}
        exportShareAction={{
          title: 'Export Share',
          description: 'Password-protected bfshare package',
          actionLabel: 'Export',
          onAction: vi.fn(),
        }}
        lockProfileAction={{
          title: 'Logout',
          description: 'Return to profile list to open another profile',
          actionLabel: 'Logout',
          variant: 'destructive',
          onAction: vi.fn(),
        }}
        clearCredentialsAction={{
          title: 'Clear Credentials',
          description: "Delete this device's saved profile, share, password, and relay configuration",
          actionLabel: 'Clear',
          variant: 'destructive',
          onAction: vi.fn(),
        }}
        browserPreferences={<div>Remember browser state</div>}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Settings' }).parentElement).toHaveClass('z-[60]');
    expect(screen.getByRole('heading', { name: 'Device Profile' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Group Profile' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Onboard Device' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Export & Backup' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Profile Security' })).toBeInTheDocument();
    expect(screen.getByText('Configuration for this device\'s share (Share #1)')).toBeInTheDocument();
    expect(screen.getByText('Encrypted backup of your share and configuration')).toBeInTheDocument();
    expect(screen.getByText('Password-protected bfshare package')).toBeInTheDocument();
    expect(screen.getByText('Return to profile list to open another profile')).toBeInTheDocument();
    expect(
      screen.getByText("Delete this device's saved profile, share, password, and relay configuration"),
    ).toBeInTheDocument();
    expect(screen.getByText('npub1qe3...7k4m')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Runtime Settings' })).not.toBeVisible();
    expect(screen.getByRole('button', { name: 'Change' })).toBeDisabled();
    const onboardButton = screen.getByRole('button', { name: 'Onboard a Device' });
    expect(onboardButton).not.toHaveClass('w-full');
    expect(onboardButton).not.toHaveClass('justify-self-stretch');
    expect(onboardButton).toHaveClass('min-h-10');
    expect(onboardButton).toHaveClass('min-w-[9rem]');
    expect(screen.getByRole('heading', { name: 'Logout' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();

    fireEvent.click(screen.getByText('Advanced'));
    expect(screen.getByRole('heading', { name: 'Runtime Settings' })).toBeVisible();

    const profileName = screen.getByLabelText('Profile Name');
    expect(profileName).toHaveAttribute('spellcheck', 'false');
    expect(profileName).toHaveClass('h-10');
    expect(screen.getByText('Profile Name')).toHaveAttribute('for', profileName.getAttribute('id'));
    fireEvent.change(profileName, { target: { value: 'Edited Device' } });
    expect(onNameChange).toHaveBeenCalledWith('Edited Device');

    const relayInput = screen.getByLabelText('New relay URL');
    expect(relayInput).toHaveAttribute('spellcheck', 'false');
    expect(relayInput).toHaveAttribute('inputmode', 'url');
    expect(relayInput).toHaveClass('h-11');
    fireEvent.change(relayInput, { target: { value: 'wss://relay.example.com' } });
    expect(onNewRelayUrlChange).toHaveBeenCalledWith('wss://relay.example.com');
    fireEvent.keyDown(relayInput, { key: 'Enter', code: 'Enter' });
    expect(onAddRelay).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(onSave).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getAllByRole('button', { name: 'Export' })[0]);
    expect(onExportProfile).toHaveBeenCalledTimes(1);

    fireEvent.click(onboardButton);
    expect(onOnboardDevice).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('dashboard-settings-sidebar-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps the explicit Settings logoutAction prop as a compatibility alias', () => {
    render(
      <OperatorSettingsSidebar
        open
        onClose={vi.fn()}
        hasProfile
        signerName="Primary Browser Device"
        onSignerNameChange={vi.fn()}
        relays={[]}
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
        onSave={vi.fn()}
        showSaveControls={false}
        logoutAction={{
          title: 'Logout',
          description: 'Return to profile list to open another profile',
          actionLabel: 'Logout',
          variant: 'destructive',
          onAction: vi.fn(),
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Profile Security' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  it('prefers the explicit profile security action over the legacy logoutAction alias', () => {
    render(
      <OperatorSettingsSidebar
        {...minimalSettingsSidebarProps}
        showSaveControls={false}
        lockProfileAction={{
          title: 'Logout',
          description: 'Return to profile list to open another profile',
          actionLabel: 'Logout',
          variant: 'destructive',
          onAction: vi.fn(),
        }}
        logoutAction={{
          title: 'Legacy Logout',
          description: 'Legacy logout label.',
          actionLabel: 'Legacy Logout',
          variant: 'destructive',
          onAction: vi.fn(),
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Profile Security' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Legacy Logout' })).not.toBeInTheDocument();
  });

  it('renders the Paper Settings sidebar without runtime settings props', () => {
    render(
      <OperatorSettingsSidebar
        {...minimalSettingsSidebarProps}
        memberLabel="Share #1"
        relays={['wss://relay.primal.net']}
        showSaveControls={false}
        showAdvancedSettings={false}
        browserPreferences={
          <div className="igloo-settings-grid">
            <label className="igloo-toggle-row">
              <input type="checkbox" defaultChecked />
              <span>
                <strong>Remember browser state</strong>
                <small>Persist profiles, drafts, and the last active workspace in this browser.</small>
              </span>
            </label>
          </div>
        }
        groupProfile={{
          keysetName: 'My Signing Key',
          keyNpub: 'npub1qe3...7k4m',
          thresholdLabel: '2 of 3',
        }}
        lockProfileAction={{
          title: 'Logout',
          description: 'Return to profile list to open another profile',
          actionLabel: 'Logout',
          variant: 'destructive',
          onAction: vi.fn(),
        }}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Device Profile' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Group Profile' })).toBeInTheDocument();
    expect(screen.queryByText('Advanced')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Runtime Settings' })).not.toBeInTheDocument();
    const browserSettings = screen.getByRole('heading', { name: 'Browser Settings' });
    const profileSecurity = screen.getByRole('heading', { name: 'Profile Security' });
    expect(browserSettings).toBeInTheDocument();
    expect(screen.getByText('Remember browser state')).toBeInTheDocument();
    expect(screen.getByText('Remember browser state').closest('.igloo-settings-sidebar-browser-preferences')).not.toBeNull();
    expect(screen.getByText('Remember browser state').closest('.igloo-toggle-row')).not.toBeNull();
    expect(Boolean(browserSettings.compareDocumentPosition(profileSecurity) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  it('renders the Paper clear-credentials confirmation dialog', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ClearCredentialsDialog
        open
        profileSummary="My Signing Key · Share #1 · Igloo Web"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Clear Credentials' })).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
    expect(screen.getByText('My Signing Key · Share #1 · Igloo Web')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Clear Credentials' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders the shared profile password change dialog', () => {
    const onCurrentPasswordChange = vi.fn();
    const onNextPasswordChange = vi.fn();
    const onConfirmPasswordChange = vi.fn();
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    const onCancel = vi.fn();

    render(
      <ProfilePasswordChangeDialog
        open
        currentPassword=""
        nextPassword=""
        confirmPassword=""
        error="Current password is incorrect."
        onCurrentPasswordChange={onCurrentPasswordChange}
        onNextPasswordChange={onNextPasswordChange}
        onConfirmPasswordChange={onConfirmPasswordChange}
        onSubmit={onSubmit}
        onCancel={onCancel}
        testIds={{
          current: 'settings-password-current',
          next: 'settings-password-next',
          confirm: 'settings-password-confirm',
          submit: 'settings-password-submit',
        }}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Change Profile Password' })).toBeInTheDocument();
    expect(screen.getByText(/Re-encrypt this device profile/i)).toBeInTheDocument();
    expect(screen.getByText('Current password is incorrect.')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('settings-password-current'), {
      target: { value: 'current-pass' },
    });
    expect(onCurrentPasswordChange).toHaveBeenCalledWith('current-pass');

    fireEvent.change(screen.getByTestId('settings-password-next'), {
      target: { value: 'next-pass' },
    });
    expect(onNextPasswordChange).toHaveBeenCalledWith('next-pass');

    fireEvent.change(screen.getByTestId('settings-password-confirm'), {
      target: { value: 'next-pass' },
    });
    expect(onConfirmPasswordChange).toHaveBeenCalledWith('next-pass');

    fireEvent.click(screen.getByTestId('settings-password-submit'));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('marks profile password changes busy while saving', () => {
    render(
      <ProfilePasswordChangeDialog
        open
        currentPassword="current-pass"
        nextPassword="next-pass"
        confirmPassword="next-pass"
        onCurrentPasswordChange={vi.fn()}
        onNextPasswordChange={vi.fn()}
        onConfirmPasswordChange={vi.fn()}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        busy
        testIds={{
          current: 'settings-password-current',
          next: 'settings-password-next',
          confirm: 'settings-password-confirm',
          submit: 'settings-password-submit',
        }}
      />,
    );

    expect(screen.getByTestId('settings-password-current')).toBeDisabled();
    expect(screen.getByTestId('settings-password-next')).toBeDisabled();
    expect(screen.getByTestId('settings-password-confirm')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    const submit = screen.getByRole('button', { name: 'Saving...' });
    expect(submit).toBeDisabled();
    expect(submit).toHaveAttribute('aria-busy', 'true');
    expect(submit).toHaveAttribute('data-loading', 'true');
  });

  it('renders the Paper settings unsaved-changes guard dialog', () => {
    const onDiscard = vi.fn();
    const onKeepEditing = vi.fn();

    render(
      <SettingsUnsavedChangesDialog
        open
        onDiscard={onDiscard}
        onKeepEditing={onKeepEditing}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Discard unsaved changes?' })).toBeInTheDocument();
    expect(screen.getByText('You have unsaved changes in Settings. Close without saving?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(onKeepEditing).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Discard' }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('renders the Settings Onboard Device sponsorship boundary panel', () => {
    const onExportShare = vi.fn();
    const onReplaceShare = vi.fn();
    const onClose = vi.fn();

    render(
      <OnboardDeviceSponsorshipPanel
        readiness={{
          available: false,
          reason: 'saved-profile-local-share-only',
          missing: 'remote-share-package-producer',
          securityBoundary: 'saved-browser-profiles-retain-local-share-only',
          requiredSource: 'nsec-or-threshold-source-shares',
          safeActions: [
            'export-local-share-as-source',
            'use-create-or-rotate-before-setup-finishes',
            'replace-share-from-prepared-package',
          ],
        }}
        onExportShare={onExportShare}
        onReplaceShare={onReplaceShare}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Package Producer Required' })).toBeInTheDocument();
    expect(screen.getByText(/stores only this device's encrypted local share/i)).toBeInTheDocument();
    expect(screen.getByText('Remote share package producer')).toBeInTheDocument();
    expect(screen.getByText('NSEC or threshold source shares')).toBeInTheDocument();
    expect(screen.getByText('Local encrypted share only')).toBeInTheDocument();
    expect(screen.getByText(/Do not create a new device by cloning/i)).toBeInTheDocument();
    expect(screen.getByText(/Use Create Keyset or Rotate Keyset/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ready to Onboard Device' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Configure Device' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Export Share' }));
    expect(onExportShare).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Replace Share' }));
    expect(onReplaceShare).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders the Settings Onboard Device producer-ready panel', () => {
    const onConfigureDevice = vi.fn();
    const onClose = vi.fn();

    render(
      <OnboardDeviceSponsorshipPanel
        readiness={{
          available: true,
          mode: 'package-producer',
          requiredSource: 'package-producer',
          safeActions: ['configure-device'],
        }}
        onConfigureDevice={onConfigureDevice}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Ready to Onboard Device' })).toBeInTheDocument();
    expect(screen.getAllByText('Package producer')).toHaveLength(2);
    expect(screen.getByText(/outside-runtime package producer is available/i)).toBeInTheDocument();
    expect(screen.getByText('Encrypted bfonboard')).toBeInTheDocument();
    expect(screen.getByText('Configure device')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Configure Device' }));
    expect(onConfigureDevice).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders the Settings Onboard Device source-share producer-ready panel', () => {
    render(
      <OnboardDeviceSponsorshipPanel
        readiness={{
          available: true,
          mode: 'source-share-package-producer',
          requiredSource: 'nsec-or-threshold-source-shares',
          safeActions: ['configure-device'],
        }}
        onConfigureDevice={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Ready to Onboard Device' })).toBeInTheDocument();
    expect(screen.getByText('Source-share package producer')).toBeInTheDocument();
    expect(screen.getByText('NSEC or threshold source shares')).toBeInTheDocument();
  });

  it('renders the shared Settings Onboard Device sponsorship dialog', () => {
    const onClose = vi.fn();

    render(
      <OnboardDeviceSponsorshipDialog
        open
        readiness={{
          available: false,
          reason: 'saved-profile-local-share-only',
          missing: 'remote-share-package-producer',
          securityBoundary: 'saved-browser-profiles-retain-local-share-only',
          requiredSource: 'nsec-or-threshold-source-shares',
          safeActions: [
            'export-local-share-as-source',
            'use-create-or-rotate-before-setup-finishes',
            'replace-share-from-prepared-package',
          ],
        }}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Onboard a Device' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Package Producer Required' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders the Settings Onboard Device source-package form', () => {
    const onDraftChange = vi.fn();
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    const onClose = vi.fn();

    render(
      <OnboardDeviceSponsorDialog
        open
        draft={{
          label: 'Remote Device',
          sourcePackageText: 'bfshare1remote',
          sourcePackagePassword: 'source-pass',
          packagePassword: 'package-pass',
          confirmPackagePassword: 'mismatch',
        }}
        signerActive
        error="Source bfshare does not match any member in this keyset."
        onDraftChange={onDraftChange}
        onCreatePackage={onSubmit}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Onboard a Device' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Configure Device' })).toBeInTheDocument();
    expect(screen.getByText(/remote-member bfshare/i)).toBeInTheDocument();
    expect(screen.getByTestId('settings-onboard-create')).toBeDisabled();
    expect(screen.getByRole('alert', { name: 'Package password mismatch' })).toHaveTextContent(
      'Package passwords do not match.',
    );
    expect(screen.getByLabelText('Confirm Package Password')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Confirm Package Password')).toHaveAccessibleDescription(
      'Package passwords do not match.',
    );
    expect(screen.getByRole('alert', { name: 'Onboard package creation failed' })).toHaveTextContent(
      'Source bfshare does not match any member in this keyset.',
    );

    fireEvent.change(screen.getByTestId('settings-onboard-device-label'), {
      target: { value: 'Laptop Device' },
    });
    expect(onDraftChange).toHaveBeenCalledWith('label', 'Laptop Device');

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('marks Settings Onboard source material invalid after package creation fails', () => {
    render(
      <OnboardDeviceSponsorDialog
        open
        draft={{
          label: 'Remote Device',
          sourcePackageText: 'bfshare1remote',
          sourcePackagePassword: 'source-pass',
          packagePassword: 'package-pass',
          confirmPackagePassword: 'package-pass',
        }}
        signerActive
        error="Source bfshare does not match any member in this keyset."
        errorFields={['sourcePackageText', 'sourcePackagePassword']}
        onDraftChange={vi.fn()}
        onCreatePackage={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const error = screen.getByRole('alert', { name: 'Onboard package creation failed' });
    expect(error).toHaveTextContent('Source bfshare does not match any member in this keyset.');
    expect(screen.getByLabelText('Source bfshare')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Source bfshare')).toHaveAccessibleDescription(
      'Source bfshare does not match any member in this keyset.',
    );
    expect(screen.getByLabelText('Source Password')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Source Password')).toHaveAccessibleDescription(
      'Source bfshare does not match any member in this keyset.',
    );
  });

  it('explains missing Settings Onboard Device sponsor inputs before package creation', () => {
    render(
      <OnboardDeviceSponsorDialog
        open
        draft={{
          label: 'Remote Device',
          sourcePackageText: 'bfshare1remote',
          sourcePackagePassword: '',
          packagePassword: 'package-pass',
          confirmPackagePassword: '',
        }}
        signerActive
        onDraftChange={vi.fn()}
        onCreatePackage={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByTestId('settings-onboard-create')).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Missing: source password, confirm package password.',
    );
  });

  it('confirms before closing dirty Settings Onboard Device sponsor input', () => {
    const onClose = vi.fn();

    render(
      <OnboardDeviceSponsorDialog
        open
        cancelRequiresConfirmation
        draft={{
          label: 'Remote Device',
          sourcePackageText: 'bfshare1remote',
          sourcePackagePassword: '',
          packagePassword: '',
          confirmPackagePassword: '',
        }}
        signerActive
        onDraftChange={vi.fn()}
        onCreatePackage={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Cancel onboarding setup?' })).toBeInTheDocument();
    expect(screen.getByText('Discard this onboarding package draft?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Keep Editing' }));
    expect(screen.queryByRole('dialog', { name: 'Cancel onboarding setup?' })).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Discard Setup' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('blocks Settings Onboard Device package creation while the signer is stopped', () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());

    render(
      <OnboardDeviceSponsorDialog
        open
        draft={{
          label: 'Remote Device',
          sourcePackageText: 'bfshare1remote',
          sourcePackagePassword: 'source-pass',
          packagePassword: 'package-pass',
          confirmPackagePassword: 'package-pass',
        }}
        signerActive={false}
        onDraftChange={vi.fn()}
        onCreatePackage={onSubmit}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('status', { name: 'Settings Onboard signer status' })).toHaveTextContent(
      'Start the signer before creating the package.',
    );
    const createButton = screen.getByTestId('settings-onboard-create');
    expect(createButton).toBeDisabled();

    fireEvent.click(createButton);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('locks Settings Onboard Device sponsor inputs while package creation is running', () => {
    const onClose = vi.fn();
    const onDraftChange = vi.fn();

    render(
      <OnboardDeviceSponsorDialog
        open
        draft={{
          label: 'Remote Device',
          sourcePackageText: 'bfshare1remote',
          sourcePackagePassword: 'source-pass',
          packagePassword: 'package-pass',
          confirmPackagePassword: 'package-pass',
        }}
        busy
        signerActive
        onDraftChange={onDraftChange}
        onCreatePackage={vi.fn()}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Creating onboarding package...');
    expect(screen.getByTestId('settings-onboard-device-label')).toBeDisabled();
    expect(screen.getByTestId('settings-onboard-source-package')).toBeDisabled();
    expect(screen.getByTestId('settings-onboard-source-password')).toBeDisabled();
    expect(screen.getByTestId('settings-onboard-package-password')).toBeDisabled();
    expect(screen.getByTestId('settings-onboard-package-confirm')).toBeDisabled();
    for (const toggle of screen.getAllByRole('button', { name: 'Show password' })) {
      expect(toggle).toBeDisabled();
    }

    fireEvent.change(screen.getByTestId('settings-onboard-device-label'), {
      target: { value: 'Changed Device' },
    });
    expect(onDraftChange).not.toHaveBeenCalled();

    const cancel = screen.getByRole('button', { name: 'Cancel' });
    expect(cancel).toBeDisabled();
    fireEvent.click(cancel);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).not.toHaveBeenCalled();

    const create = screen.getByRole('button', { name: 'Creating...' });
    expect(create).toBeDisabled();
    expect(create).toHaveAttribute('aria-busy', 'true');
  });

  it('renders the Settings Onboard Device package handoff state', () => {
    const onCopy = vi.fn();
    const onSave = vi.fn();
    const onQr = vi.fn();
    const onCreateAnother = vi.fn();
    const onClose = vi.fn();

    render(
      <OnboardDeviceSponsorDialog
        open
        draft={{
          label: '',
          sourcePackageText: '',
          sourcePackagePassword: '',
          packagePassword: '',
          confirmPackagePassword: '',
        }}
        result={{
          label: 'Remote Device',
          memberLabel: 'Share #2',
          sharePublicKeyLabel: 'npub1zfd...3k9p',
          sharePublicKey: '33'.repeat(32),
          packageText: 'bfonboard1remote',
        }}
        onDraftChange={vi.fn()}
        onCreatePackage={vi.fn()}
        onCopyPackage={onCopy}
        onSavePackage={onSave}
        onShowQrPackage={onQr}
        onCreateAnother={onCreateAnother}
        onClose={onClose}
        handoffStatus="Package copied."
        handoffAction="copy"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Package Handoff' })).toBeInTheDocument();
    expect(screen.getByTestId('settings-onboard-result')).toBeInTheDocument();
    expect(screen.getByDisplayValue('bfonboard1remote')).toBeInTheDocument();
    expect(screen.getByText('Share npub')).toBeInTheDocument();
    expect(screen.getByText('npub1zfd...3k9p')).toBeInTheDocument();
    expect(screen.getByText('Share hex')).toBeInTheDocument();
    expect(screen.getByText('33'.repeat(32))).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Package copied.');
    expect(screen.getByRole('button', { name: 'Copying...' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Copying...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'QR code' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Create Another' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Done' })).toBeDisabled();

    fireEvent.click(screen.getByTestId('settings-onboard-copy'));
    expect(onCopy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('settings-onboard-save'));
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('settings-onboard-qr'));
    expect(onQr).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Create Another' }));
    expect(onCreateAnother).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders Settings Onboard Device handoff failures with a warning status tone', () => {
    render(
      <OnboardDeviceSponsorDialog
        open
        draft={{
          label: '',
          sourcePackageText: '',
          sourcePackagePassword: '',
          packagePassword: '',
          confirmPackagePassword: '',
        }}
        result={{
          label: 'Remote Device',
          memberLabel: 'Share #2',
          packageText: 'bfonboard1remote',
        }}
        onDraftChange={vi.fn()}
        onCreatePackage={vi.fn()}
        onClose={vi.fn()}
        handoffStatus="Copy failed. Copy the package manually."
        handoffStatusTone="warning"
      />,
    );

    const status = screen.getByRole('alert', { name: 'Onboard package handoff status' });
    expect(status).toHaveTextContent('Copy failed. Copy the package manually.');
    expect(status).toHaveAttribute('data-tone', 'warning');
  });

  it('hides the Settings Onboard Device Create Another action without a handler', () => {
    render(
      <OnboardDeviceSponsorDialog
        open
        draft={{
          label: '',
          sourcePackageText: '',
          sourcePackagePassword: '',
          packagePassword: '',
          confirmPackagePassword: '',
        }}
        result={{
          label: 'Remote Device',
          memberLabel: 'Share #2',
          sharePublicKey: 'npub1zfd...3k9p',
          packageText: 'bfonboard1remote',
        }}
        onDraftChange={vi.fn()}
        onCreatePackage={vi.fn()}
        onCopyPackage={vi.fn()}
        onSavePackage={vi.fn()}
        onShowQrPackage={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Package Handoff' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create Another' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'QR code' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('merges identity into the signer card with only the group key copy control', () => {
    const onCopyGroupKey = vi.fn();

    const { container } = render(
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
          pendingApprovalRows: [
            {
              id: 'approval-1',
              methodLabel: 'SIGN',
              peerLabel: 'Peer #2',
              detailLabel: 'kind:1 Short Text Note',
              expiresLabel: '42s',
            },
          ],
          pendingOperationRows: [
            {
              id: 'approval-1',
              operationLabel: 'sign',
              thresholdLabel: 'threshold 2',
              startedLabel: '2:33:30p',
              timeoutLabel: '42s',
              responseLabel: '1 response',
            },
          ],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        copiedField={null}
        onCopyGroupKey={onCopyGroupKey}
        onPrimaryAction={vi.fn()}
      />,
    );

    // Member label appears on the merged card.
    expect(screen.getByText('Share #1')).toBeInTheDocument();

    // Default copy buttons copy npub.
    fireEvent.click(screen.getByTestId('dashboard-group-key-copy'));
    expect(onCopyGroupKey).toHaveBeenCalledWith('npub');

    // Share public key is intentionally not shown on the signer dashboard.
    expect(screen.queryByText('Share Public Key')).not.toBeInTheDocument();
    expect(screen.queryByText('npub1zfd...3k9p')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-share-key-copy')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-share-key-format')).not.toBeInTheDocument();

    // The group key format caret still reveals a hex option.
    fireEvent.click(screen.getByTestId('dashboard-group-key-format'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy hex' }));
    expect(onCopyGroupKey).toHaveBeenCalledWith('hex');

    // The format menu dismisses on an outside click.
    fireEvent.click(screen.getByTestId('dashboard-group-key-format'));
    expect(screen.getByRole('menuitem', { name: 'Copy hex' })).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menuitem', { name: 'Copy hex' })).not.toBeInTheDocument();

    // Pending Approvals renders populated Paper rows when runtime prompts exist.
    expect(screen.getByText('1 pending')).toBeInTheDocument();
    expect(container.querySelectorAll('.igloo-dashboard-approval-row')).toHaveLength(1);
    expect(screen.getByText('Peer #2')).toBeInTheDocument();
    expect(screen.getByText('kind:1 Short Text Note')).toBeInTheDocument();
  });

  it('renders the Paper stopped-signer dashboard cards instead of live runtime sections', () => {
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
          running: false,
          readinessLabel: 'Signer Stopped',
          relaySummary: 'Relays, peers, and signing are offline.',
          peerRows: [
            { id: 'peer-2', alias: 'Peer #2', pubkey: 'peer-2', state: 'offline', statusLabel: 'offline' },
          ],
          pendingApprovalRows: [
            {
              id: 'approval-1',
              methodLabel: 'SIGN',
              peerLabel: 'Peer #2',
              detailLabel: 'kind:1 Short Text Note',
              expiresLabel: '42s',
            },
          ],
          pendingOperationRows: [],
          eventRows: [
            { id: 'e1', badgeLabel: 'sign', badgeTone: 'success', message: 'sign request received' },
          ],
        }}
        introMessage="Runtime is stopped."
        runtimeControlLabel="Start Signer"
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Signer Stopped' })).toBeInTheDocument();
    expect(screen.getByText('Relays, peers, and signing are offline.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Signer' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Readiness' })).toBeInTheDocument();
    expect(screen.getByText('Start signer to restore connectivity.')).toBeInTheDocument();
    expect(screen.getByText('0 relays connected')).toBeInTheDocument();
    expect(screen.getByText('0 peers online')).toBeInTheDocument();
    expect(screen.getByText('Signing unavailable')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Next Step' })).toBeInTheDocument();
    expect(screen.getByText('Queued work · preserved')).toBeInTheDocument();
    expect(screen.getByText('New signing · blocked')).toBeInTheDocument();
    expect(screen.getByText('Policy prompts · paused')).toBeInTheDocument();
    expect(screen.getByText('Start when ready.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Peers' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Pending Approvals' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Event Log' })).not.toBeInTheDocument();
  });

  it('summarizes peer readiness counts and filters the diagnostics log by domain', () => {
    const onClearLogs = vi.fn();

    const { container } = render(
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
              lastSeenLabel: 'last seen 5/31/2026, 2:14 PM',
              incomingAvailable: 9,
              outgoingAvailable: 7,
              outgoingSpent: 1,
              latencyMs: 24,
            },
            { id: 'peer-2', alias: 'Peer #2', pubkey: 'peer-2', state: 'offline', statusLabel: 'offline' },
          ],
          pendingOperationRows: [],
          eventRows: [
            { id: 'e1', badgeLabel: 'sync', badgeTone: 'sync', message: 'peer roster synced' },
            { id: 'e2', badgeLabel: 'sign', badgeTone: 'success', message: 'sign request received' },
            { id: 'e3', badgeLabel: 'ecdh', badgeTone: 'ecdh', message: 'ecdh request processed' },
            {
              id: 'e4',
              badgeLabel: 'signer policy',
              badgeTone: 'policy',
              message: 'signer policy required',
            },
            { id: 'e5', badgeLabel: 'ping', badgeTone: 'ping', message: 'ping sweep completed' },
            { id: 'e6', badgeLabel: 'echo', badgeTone: 'echo', message: 'presence announced' },
          ],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
        onClearLogs={onClearLogs}
      />,
    );

    // Paper dashboard header counts render as separate status chips.
    expect(screen.getByText('1 online')).toBeInTheDocument();
    expect(screen.getByText('3 total')).toBeInTheDocument();
    expect(screen.getByText('~15 ready')).toBeInTheDocument();
    expect(screen.getByText('Avg: 24ms')).toBeInTheDocument();
    expect(screen.getByText('24ms')).toBeInTheDocument();

    // Canonical domains render until the closed filter menu opens and narrows the list.
    const eventBadges = Array.from(container.querySelectorAll('.igloo-dashboard-log-row .igloo-dashboard-domain-badge'));
    expect(eventBadges.map((badge) => badge.getAttribute('data-tone'))).toEqual([
      'sync',
      'success',
      'ecdh',
      'policy',
      'ping',
      'echo',
    ]);
    expect(container.querySelector('.igloo-dashboard-log-row .igloo-permission-token')).not.toBeInTheDocument();
    expect(screen.getByText('6 events')).toBeInTheDocument();
    expect(screen.getByText('sign request received')).toBeInTheDocument();
    expect(screen.getByText('peer roster synced')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'sign', pressed: false })).not.toBeInTheDocument();
    expect(screen.getByText('6 types')).toBeInTheDocument();
    expect(screen.getByRole('log', { name: 'Event Log entries' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'sign event: sign request received' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Filter/i }));
    expect(screen.getByRole('button', { name: 'sync', pressed: false })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'echo', pressed: false })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'sign', pressed: false }));
    expect(screen.getByText('1 of 6 events')).toBeInTheDocument();
    expect(screen.getByText('sign request received')).toBeInTheDocument();
    expect(screen.queryByText('peer roster synced')).not.toBeInTheDocument();
    expect(screen.queryByText('ecdh request processed')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onClearLogs).toHaveBeenCalledTimes(1);
  });

  it('labels expanded Event Log filters as one control group', () => {
    render(
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
          eventRows: [
            { id: 'e1', badgeLabel: 'sync', badgeTone: 'sync', message: 'peer roster synced' },
            { id: 'e2', badgeLabel: 'sign', badgeTone: 'success', message: 'sign request received' },
            { id: 'e3', badgeLabel: 'ecdh', badgeTone: 'info', message: 'ecdh request processed' },
          ],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Filter/i }));

    const filters = screen.getByRole('group', { name: 'Event Log filters' });
    expect(within(filters).getByRole('button', { name: 'All', pressed: true })).toBeInTheDocument();
    expect(within(filters).getByRole('button', { name: 'sign', pressed: false })).toBeInTheDocument();
  });

  it('collapses and expands the Event Log rows from the Paper header chevron', () => {
    render(
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
          eventRows: [
            { id: 'e1', badgeLabel: 'sync', badgeTone: 'sync', message: 'peer roster synced' },
            { id: 'e2', badgeLabel: 'sign', badgeTone: 'success', message: 'sign request received' },
          ],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(screen.getByRole('log', { name: 'Event Log entries' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Collapse Event Log' }));
    expect(screen.queryByRole('log', { name: 'Event Log entries' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand Event Log' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expand Event Log' }));
    expect(screen.getByRole('log', { name: 'Event Log entries' })).toBeInTheDocument();
  });

  it('collapses and expands Peers from the Paper header chevron', () => {
    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/2',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'running',
          relaySummary: 'Runtime is attached.',
          peerRows: [
            {
              id: 'peer-2',
              alias: 'Peer #2',
              pubkey: 'peer-2',
              state: 'online',
              statusLabel: 'sign-ready',
              lastSeenLabel: 'last seen 5/31/2026, 2:14 PM',
              incomingAvailable: 9,
              outgoingAvailable: 7,
              outgoingSpent: 1,
              latencyMs: 24,
            },
          ],
          pendingOperationRows: [],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Peer #2 telemetry: Ready, 24ms, last seen 5/31/2026, 2:14 PM')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Collapse Peers' }));
    expect(screen.queryByLabelText('Peer #2 telemetry: Ready, 24ms, last seen 5/31/2026, 2:14 PM')).not.toBeInTheDocument();
    expect(screen.getByText('1 online')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand Peers' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expand Peers' }));
    expect(screen.getByLabelText('Peer #2 telemetry: Ready, 24ms, last seen 5/31/2026, 2:14 PM')).toBeInTheDocument();
  });

  it('renders per-peer readiness and latency as separate telemetry', () => {
    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/2',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'running',
          relaySummary: 'Runtime is attached.',
          peerRows: [
            {
              id: 'peer-2',
              alias: 'Peer #2',
              pubkey: 'peer-2',
              state: 'online',
              statusLabel: 'sign-ready',
              lastSeenLabel: 'last seen 5/31/2026, 2:14 PM',
              incomingAvailable: 9,
              outgoingAvailable: 7,
              outgoingSpent: 1,
              latencyMs: 24,
              permissionMethods: ['sign', 'ecdh', 'ping'],
            },
          ],
          pendingOperationRows: [],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
      />,
    );

    const telemetry = screen.getByLabelText('Peer #2 telemetry: Ready, 24ms, last seen 5/31/2026, 2:14 PM');
    expect(telemetry).toHaveTextContent('Ready');
    expect(telemetry).toHaveTextContent('24ms');
  });

  it('labels per-peer permission method badges as telemetry', () => {
    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/2',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'running',
          relaySummary: 'Runtime is attached.',
          peerRows: [
            {
              id: 'peer-2',
              alias: 'Peer #2',
              pubkey: 'peer-2',
              state: 'online',
              statusLabel: 'sign-ready',
              permissionMethods: ['sign', 'ecdh', 'ping'],
            },
          ],
          pendingOperationRows: [],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
      />,
    );

    const methods = screen.getByLabelText('Peer #2 methods: SIGN, ECDH, PING');
    expect(methods).toHaveTextContent('SIGN');
    expect(methods).toHaveTextContent('ECDH');
    expect(methods).toHaveTextContent('PING');
  });

  it('fills missing dashboard peers with one-based share indexes for a two-browser keyset', () => {
    const renderShare = (memberLabel: 'Share #1' | 'Share #2', remoteAlias: 'Peer #1' | 'Peer #2') => {
      const { unmount } = render(
        <OperatorSignerPanel
          view={{
            profileName: 'Primary Browser Device',
            thresholdLabel: '2/2',
            publicKeyLabel: 'group-pub-1',
            shareLabel: memberLabel,
            shareKey: { display: `${memberLabel}-pubkey` },
            memberLabel,
            readinessLabel: 'running',
            relaySummary: 'Runtime is attached.',
            peerRows: [
              {
                id: remoteAlias,
                alias: remoteAlias,
                pubkey: `${remoteAlias}-pubkey`,
                state: 'online',
                statusLabel: 'sign-ready',
                permissionMethods: ['sign', 'ping'],
              },
            ],
            pendingOperationRows: [],
            eventRows: [],
          }}
          introMessage="Runtime is attached."
          runtimeControlLabel="Stop Signer"
          onPrimaryAction={vi.fn()}
        />,
      );

      expect(screen.queryByText('#0')).not.toBeInTheDocument();
      expect(screen.queryByText('Unknown member')).not.toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('2 online')).toBeInTheDocument();
      expect(screen.getByText('2 total')).toBeInTheDocument();

      unmount();
    };

    renderShare('Share #1', 'Peer #2');
    renderShare('Share #2', 'Peer #1');
  });

  it('renders Paper signing capacity bars without the nonce history widget', () => {
    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/2',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'running',
          relaySummary: 'Runtime is attached.',
          peerRows: [
            {
              id: 'peer-2',
              alias: 'Peer #2',
              pubkey: 'peer-2',
              state: 'online',
              statusLabel: 'sign-ready',
              incomingAvailable: 9,
              outgoingAvailable: 7,
              outgoingSpent: 1,
              nonceInventoryHistory: [
                { updatedAt: 1700000000, heldCount: 3 },
                { updatedAt: 1700000001, heldCount: 6 },
                { updatedAt: 1700000002, heldCount: 9 },
              ],
            },
          ],
          pendingOperationRows: [],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText(/nonce availability/i)).not.toBeInTheDocument();
    expect(document.querySelector('.igloo-dashboard-peer-meter')).not.toBeInTheDocument();
    expect(
      screen.getByLabelText('Peer #2 signing capacity: 9 incoming, 7 outgoing, 1 spent'),
    ).toBeInTheDocument();
    expect(document.querySelector('.igloo-dashboard-peer-capacity')).toBeInTheDocument();
    expect(document.querySelector('.igloo-dashboard-peer-capacity-bars')).toBeInTheDocument();
    expect(document.querySelector('.igloo-dashboard-peer-history')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Peer #2 telemetry: Ready')).toBeInTheDocument();
  });

  it('keeps empty Event Log controls inert when there are no captured events', () => {
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
          peerRows: [],
          pendingOperationRows: [],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
        onClearLogs={onClearLogs}
      />,
    );

    expect(screen.getByText('0 events')).toBeInTheDocument();
    expect(screen.getByText('No events captured yet.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Filter/i })).not.toBeInTheDocument();
    const clear = screen.getByRole('button', { name: 'Clear' });
    expect(clear).toBeDisabled();
    fireEvent.click(clear);
    expect(onClearLogs).not.toHaveBeenCalled();
  });

  it('locks Event Log filter controls while the log is clearing', () => {
    const onClearLogs = vi.fn();
    const eventView = {
      profileName: 'Primary Browser Device',
      thresholdLabel: '2/3',
      publicKeyLabel: 'group-pub-1',
      shareLabel: 'Share #1',
      readinessLabel: 'running',
      relaySummary: 'Runtime is attached.',
      peerRows: [],
      pendingOperationRows: [],
      eventRows: [
        { id: 'e1', badgeLabel: 'sync', badgeTone: 'sync' as const, message: 'peer roster synced' },
        { id: 'e2', badgeLabel: 'sign', badgeTone: 'success' as const, message: 'sign request received' },
      ],
    };

    const { rerender } = render(
      <OperatorSignerPanel
        view={eventView}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
        onClearLogs={onClearLogs}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Filter/i }));
    expect(screen.getByRole('button', { name: 'sign', pressed: false })).toBeEnabled();

    rerender(
      <OperatorSignerPanel
        view={eventView}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
        onClearLogs={onClearLogs}
        clearLogsLoading
      />,
    );

    const clear = screen.getByRole('button', { name: 'Clearing...' });
    expect(clear).toBeDisabled();
    expect(clear).toHaveAttribute('aria-busy', 'true');

    const filter = screen.getByRole('button', { name: /Filter/i });
    expect(filter).toBeDisabled();
    expect(filter).toHaveAttribute('aria-busy', 'true');
    expect(filter).toHaveAttribute('data-loading', 'true');
    expect(filter.querySelector('.igloo-spin')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'sign', pressed: false })).toBeDisabled();
  });

  it('names both pending approvals and operations in the empty pending queue state', () => {
    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/3',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'running',
          relaySummary: 'Runtime is attached.',
          peerRows: [],
          pendingApprovalRows: [],
          pendingOperationRows: [],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(screen.getByText('No pending approvals or operations.')).toBeInTheDocument();
    expect(screen.queryByText('No pending approvals.')).not.toBeInTheDocument();
  });

  it('orders pending approvals by nearest expiry like the Paper dashboard', () => {
    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/3',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'running',
          relaySummary: 'Runtime is attached.',
          peerRows: [],
          pendingApprovalRows: [
            {
              id: 'approval-3',
              methodLabel: 'SIGN',
              peerLabel: 'Peer #3',
              detailLabel: 'kind:4 Encrypted DM',
              expiresLabel: '3m 05s',
            },
            {
              id: 'approval-1',
              methodLabel: 'SIGN',
              peerLabel: 'Peer #2',
              detailLabel: 'kind:1 Short Text Note',
              expiresLabel: '42s',
            },
            {
              id: 'approval-2',
              methodLabel: 'ECDH',
              peerLabel: 'Peer #1',
              detailLabel: 'NIP-44 key exchange',
              expiresLabel: '1m 12s',
            },
          ],
          pendingOperationRows: [],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(screen.getByText('Nearest: 42s')).toBeInTheDocument();
    const rows = [
      screen.getByRole('button', { name: 'Open SIGN approval from Peer #2' }).closest('.igloo-dashboard-approval-row'),
      screen.getByRole('button', { name: 'Open ECDH approval from Peer #1' }).closest('.igloo-dashboard-approval-row'),
      screen.getByRole('button', { name: 'Open SIGN approval from Peer #3' }).closest('.igloo-dashboard-approval-row'),
    ];
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent('Peer #2');
    expect(rows[1]).toHaveTextContent('Peer #1');
    expect(rows[2]).toHaveTextContent('Peer #3');
  });

  it('collapses and expands Pending Approvals from the Paper header chevron', () => {
    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/3',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'running',
          relaySummary: 'Runtime is attached.',
          peerRows: [],
          pendingApprovalRows: [
            {
              id: 'approval-1',
              methodLabel: 'SIGN',
              peerLabel: 'Peer #2',
              detailLabel: 'kind:1 Short Text Note',
              expiresLabel: '42s',
            },
          ],
          pendingOperationRows: [],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(screen.getByRole('list', { name: 'Pending approval and operation rows' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Collapse Pending Approvals' }));
    expect(screen.queryByRole('list', { name: 'Pending approval and operation rows' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand Pending Approvals' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expand Pending Approvals' }));
    expect(screen.getByRole('list', { name: 'Pending approval and operation rows' })).toBeInTheDocument();
  });

  it('keeps pending approval open actions inert until the host wires an opener', () => {
    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/3',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'running',
          relaySummary: 'Runtime is attached.',
          peerRows: [],
          pendingApprovalRows: [
            {
              id: 'approval-1',
              methodLabel: 'SIGN',
              peerLabel: 'Peer #2',
              detailLabel: 'kind:1 Short Text Note',
              expiresLabel: '42s',
            },
          ],
          pendingOperationRows: [
            {
              id: 'operation-1',
              operationLabel: 'ecdh',
              thresholdLabel: 'threshold 2',
              startedLabel: '2:33:30p',
              timeoutLabel: '1m 12s',
              responseLabel: '1 response',
            },
          ],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
      />,
    );

    const openActions = [
      screen.getByRole('button', { name: 'Open SIGN approval from Peer #2' }),
      screen.getByRole('button', { name: 'Open ecdh operation for threshold 2' }),
    ];
    for (const action of openActions) {
      expect(action).toBeDisabled();
    }
  });

  it('labels pending open actions with approval and operation context', () => {
    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/3',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'running',
          relaySummary: 'Runtime is attached.',
          peerRows: [],
          pendingApprovalRows: [
            {
              id: 'approval-1',
              methodLabel: 'SIGN',
              peerLabel: 'Peer #2',
              detailLabel: 'kind:1 Short Text Note',
              expiresLabel: '42s',
            },
          ],
          pendingOperationRows: [
            {
              id: 'operation-1',
              operationLabel: 'ecdh',
              thresholdLabel: 'threshold 2',
              startedLabel: '2:33:30p',
              timeoutLabel: '1m 12s',
              responseLabel: '1 response',
            },
          ],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
        onOpenPendingApproval={vi.fn()}
        onOpenPendingOperation={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Open SIGN approval from Peer #2' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Open ecdh operation for threshold 2' })).toBeEnabled();
  });

  it('labels pending approval and operation rows as a combined queue', () => {
    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/3',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'running',
          relaySummary: 'Runtime is attached.',
          peerRows: [],
          pendingApprovalRows: [
            {
              id: 'approval-1',
              methodLabel: 'SIGN',
              peerLabel: 'Peer #2',
              detailLabel: 'kind:1 Short Text Note',
              expiresLabel: '42s',
            },
          ],
          pendingOperationRows: [
            {
              id: 'operation-1',
              operationLabel: 'ecdh',
              thresholdLabel: 'threshold 2',
              startedLabel: '2:33:30p',
              timeoutLabel: '1m 12s',
              responseLabel: '1 response',
            },
          ],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(screen.getByRole('list', { name: 'Pending approval and operation rows' })).toBeInTheDocument();
    expect(
      screen.getByRole('listitem', {
        name: 'SIGN approval from Peer #2: kind:1 Short Text Note, expires 42s',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('listitem', {
        name: 'ecdh operation for threshold 2: 1 response, started 2:33:30p, expires 1m 12s',
      }),
    ).toBeInTheDocument();
  });

  it('includes pending operation start and expiry timing in the row context', () => {
    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/3',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'running',
          relaySummary: 'Runtime is attached.',
          peerRows: [],
          pendingApprovalRows: [],
          pendingOperationRows: [
            {
              id: 'operation-1',
              operationLabel: 'ecdh',
              thresholdLabel: 'threshold 2',
              startedLabel: '2:33:30p',
              timeoutLabel: '1m 12s',
              responseLabel: '1 response',
            },
          ],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
      />,
    );

    const row = screen.getByRole('listitem', {
      name: 'ecdh operation for threshold 2: 1 response, started 2:33:30p, expires 1m 12s',
    });
    expect(row).toHaveTextContent('started 2:33:30p');
    expect(row).toHaveTextContent('1m 12s');
  });

  it('dispatches pending approval open actions to the host when wired', () => {
    const onOpenPendingApproval = vi.fn();
    const onOpenPendingOperation = vi.fn();

    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/3',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'running',
          relaySummary: 'Runtime is attached.',
          peerRows: [],
          pendingApprovalRows: [
            {
              id: 'approval-1',
              methodLabel: 'SIGN',
              peerLabel: 'Peer #2',
              detailLabel: 'kind:1 Short Text Note',
              expiresLabel: '42s',
            },
          ],
          pendingOperationRows: [
            {
              id: 'operation-1',
              operationLabel: 'ecdh',
              thresholdLabel: 'threshold 2',
              startedLabel: '2:33:30p',
              timeoutLabel: '1m 12s',
              responseLabel: '1 response',
            },
          ],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
        onOpenPendingApproval={onOpenPendingApproval}
        onOpenPendingOperation={onOpenPendingOperation}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open SIGN approval from Peer #2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open ecdh operation for threshold 2' }));

    expect(onOpenPendingApproval).toHaveBeenCalledWith('approval-1');
    expect(onOpenPendingOperation).toHaveBeenCalledWith('operation-1');
  });

  it('surfaces signer dashboard attention states for missing relay configuration', () => {
    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/3',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'Signer Running (Blocked)',
          relaySummary: 'No relays configured',
          running: true,
          attention: {
            tone: 'warning',
            title: 'No relays configured',
            description: 'Add at least one relay in Settings before this signer can find peers.',
          },
          peerRows: [],
          pendingOperationRows: [],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
      />,
    );

    const attention = screen.getByRole('status');
    expect(attention).toHaveTextContent('No relays configured');
    expect(attention).toHaveAttribute('data-tone', 'warning');
    expect(screen.getByText('Add at least one relay in Settings before this signer can find peers.')).toBeInTheDocument();
  });

  it('renders detailed signer attention states as Paper state cards with an action', () => {
    const onRefreshPeers = vi.fn();

    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/3',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'Signer Running (Degraded)',
          relaySummary: 'All relays unreachable · signing degraded.',
          running: true,
          attention: {
            tone: 'warning',
            title: 'All Relays Offline',
            description: 'No relay route to peers.',
            details: [
              {
                label: 'Readiness',
                title: 'All Relays Offline',
                description: 'No relay route to peers.',
                badges: [
                  { label: '0 / 2 relays reachable', tone: 'danger' },
                  { label: 'Ready count degraded', tone: 'warning' },
                ],
              },
              {
                label: 'Recovery',
                description: 'Check network, DNS, and firewall.',
                callout: 'Blocked until a relay connects.',
              },
            ],
            actionLabel: 'Retry Connections',
          },
          peerRows: [],
          pendingOperationRows: [],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
        onRefreshPeers={onRefreshPeers}
      />,
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    const readiness = screen.getByRole('region', { name: 'Readiness' });
    expect(readiness).toHaveTextContent('All Relays Offline');
    expect(readiness).toHaveTextContent('No relay route to peers.');
    expect(readiness).toHaveTextContent('0 / 2 relays reachable');
    expect(readiness).toHaveTextContent('Ready count degraded');
    const recovery = screen.getByRole('region', { name: 'Recovery' });
    expect(recovery).toHaveTextContent('Check network, DNS, and firewall.');
    expect(recovery).toHaveTextContent('Blocked until a relay connects.');
    expect(screen.getByText('All relays unreachable · signing degraded.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Peers' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Pending Approvals' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Event Log' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry Connections' }));
    expect(onRefreshPeers).toHaveBeenCalledTimes(1);
  });

  it('marks dashboard peer refresh actions busy while refresh is loading', () => {
    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/3',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'Signer Running (Degraded)',
          relaySummary: 'All relays unreachable · signing degraded.',
          running: true,
          attention: {
            tone: 'warning',
            title: 'All Relays Offline',
            description: 'No relay route to peers.',
            actionLabel: 'Retry Connections',
          },
          peerRows: [],
          pendingOperationRows: [],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
        onRefreshPeers={vi.fn()}
        refreshPeersLoading
      />,
    );

    const retry = screen.getByRole('button', { name: 'Retrying connections' });
    expect(retry).toBeDisabled();
    expect(retry).toHaveAttribute('data-loading', 'true');
    expect(retry).toHaveAttribute('aria-busy', 'true');
    expect(retry).toHaveTextContent('Retrying...');
    expect(retry.querySelector('.igloo-spin')).toBeInTheDocument();

    const refresh = screen.getByRole('button', { name: 'Refreshing peers' });
    expect(refresh).toBeDisabled();
    expect(refresh).toHaveAttribute('data-loading', 'true');
    expect(refresh).toHaveAttribute('aria-busy', 'true');
    expect(refresh).toHaveTextContent('Refreshing...');
    expect(refresh.querySelector('.igloo-spin')).toBeInTheDocument();
  });

  it('surfaces dashboard peer refresh and per-peer ping actions', async () => {
    const onRefreshPeers = vi.fn();
    const onPingPeer = vi.fn().mockResolvedValue({ success: true, latency: 38 });
    const peerPubkey = '44'.repeat(32);

    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/2',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'running',
          relaySummary: 'Runtime is attached.',
          peerRows: [
            {
              id: 'peer-2',
              alias: 'Peer #2',
              pubkey: peerPubkey,
              state: 'online',
              statusLabel: 'sign-ready',
              lastSeenLabel: 'last seen just now',
              permissionMethods: ['sign', 'ping'],
            },
          ],
          pendingOperationRows: [],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
        onRefreshPeers={onRefreshPeers}
        onPingPeer={onPingPeer}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Refresh peers' }));
    expect(onRefreshPeers).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Ping Peer #2' }));
    await waitFor(() => expect(onPingPeer).toHaveBeenCalledWith(peerPubkey));
    expect(await screen.findByRole('button', { name: 'Ping Peer #2 38ms' })).toBeInTheDocument();
  });

  it('labels unavailable peer ping actions instead of showing inert Ping controls', () => {
    const onPingPeer = vi.fn();
    const remotePubkey = '44'.repeat(32);
    const localPubkey = '55'.repeat(32);

    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/3',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          shareKey: { display: localPubkey },
          memberLabel: 'Share #1',
          readinessLabel: 'running',
          relaySummary: 'Runtime is attached.',
          peerRows: [
            {
              id: 'peer-2',
              alias: 'Peer #2',
              pubkey: remotePubkey,
              state: 'online',
              statusLabel: 'sign-ready',
              lastSeenLabel: 'last seen just now',
              permissionMethods: ['sign', 'ping'],
            },
          ],
          pendingOperationRows: [],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
        onPingPeer={onPingPeer}
      />,
    );

    expect(screen.getByRole('button', { name: 'Ping Peer #2' })).toBeEnabled();

    const missingPeer = screen.getByRole('button', { name: 'Peer #3 is unavailable to ping' });
    expect(missingPeer).toBeDisabled();
    expect(missingPeer).toHaveAttribute('data-unavailable', 'missing');
    expect(missingPeer).toHaveTextContent('Unavailable');

    const localPeer = screen.getByRole('button', { name: 'Peer #1 is this device' });
    expect(localPeer).toBeDisabled();
    expect(localPeer).toHaveAttribute('data-unavailable', 'local');
    expect(localPeer).toHaveTextContent('Local');
  });

  it('marks per-peer ping actions busy while a ping is in flight', async () => {
    let resolvePing: (value: { success: boolean; latency?: number }) => void = () => {};
    const onPingPeer = vi.fn(
      () =>
        new Promise<{ success: boolean; latency?: number }>((resolve) => {
          resolvePing = resolve;
        }),
    );
    const peerPubkey = '55'.repeat(32);

    render(
      <OperatorSignerPanel
        view={{
          profileName: 'Primary Browser Device',
          thresholdLabel: '2/2',
          publicKeyLabel: 'group-pub-1',
          shareLabel: 'Share #1',
          readinessLabel: 'running',
          relaySummary: 'Runtime is attached.',
          peerRows: [
            {
              id: 'peer-2',
              alias: 'Peer #2',
              pubkey: peerPubkey,
              state: 'online',
              statusLabel: 'sign-ready',
              lastSeenLabel: 'last seen just now',
              permissionMethods: ['sign', 'ping'],
            },
          ],
          pendingOperationRows: [],
          eventRows: [],
        }}
        introMessage="Runtime is attached."
        runtimeControlLabel="Stop Signer"
        onPrimaryAction={vi.fn()}
        onPingPeer={onPingPeer}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ping Peer #2' }));

    const loading = await screen.findByRole('button', { name: 'Ping Peer #2 Pinging' });
    expect(loading).toBeDisabled();
    expect(loading).toHaveAttribute('data-loading', 'true');
    expect(loading).toHaveAttribute('aria-busy', 'true');
    expect(loading.querySelector('.igloo-spin')).toBeInTheDocument();

    resolvePing({ success: true, latency: 41 });
    expect(await screen.findByRole('button', { name: 'Ping Peer #2 41ms' })).toBeInTheDocument();
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

  it('locks peer permission tokens while clearing overrides', () => {
    const onPeerPolicyOverrideChange = vi.fn();
    render(
      <OperatorPermissionsPanel
        view={{
          peerRows: [
            {
              pubkey: 'peer-1',
              request: { ping: true, onboard: true, sign: true, ecdh: false },
              respond: { ping: true, onboard: false, sign: false, ecdh: false },
            },
          ],
        }}
        onRefresh={vi.fn()}
        onClearAllPeerPermissions={vi.fn()}
        clearAllPeerPermissionsLoading
        onPeerPolicyOverrideChange={onPeerPolicyOverrideChange}
      />,
    );

    const refresh = screen.getByRole('button', { name: 'Refresh' });
    expect(refresh).toBeDisabled();
    const clear = screen.getByRole('button', { name: 'Clearing...' });
    expect(clear).toBeDisabled();
    expect(clear).toHaveAttribute('aria-busy', 'true');

    const requestSign = screen.getByRole('button', { name: 'request sign: allow' });
    const respondSign = screen.getByRole('button', { name: 'respond sign: deny' });
    expect(requestSign).toBeDisabled();
    expect(respondSign).toBeDisabled();

    fireEvent.click(requestSign);
    fireEvent.click(respondSign);
    expect(onPeerPolicyOverrideChange).not.toHaveBeenCalled();
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
    expect(screen.queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Download' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Export Password')).toBe(screen.getByTestId('export-password'));
    expect(screen.getByLabelText('Confirm Password')).toBe(screen.getByTestId('export-confirm'));
    fireEvent.change(screen.getByTestId('export-password'), { target: { value: 'export-pass' } });
    fireEvent.change(screen.getByTestId('export-confirm'), { target: { value: 'mismatch' } });
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(screen.getByTestId('export-submit')).toBeDisabled();

    fireEvent.change(screen.getByTestId('export-confirm'), { target: { value: 'export-pass' } });
    fireEvent.click(screen.getByTestId('export-submit'));
    expect(onExport).toHaveBeenCalledWith('export-pass');

    rerender(
      <ExportPackageModal
        open
        onClose={vi.fn()}
        title="Export Profile"
        description="Create an encrypted backup."
        summary="Share #1 (Index 1) · Keyset: My Signing Key · 2 relays · 3 peers"
        result={null}
        busy
        onExport={onExport}
        onCopy={onCopy}
        onDownload={onDownload}
      />,
    );
    const exporting = screen.getByRole('button', { name: 'Exporting...' });
    expect(exporting).toBeDisabled();
    expect(exporting).toHaveAttribute('aria-busy', 'true');
    expect(exporting).toHaveAttribute('data-loading', 'true');

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
