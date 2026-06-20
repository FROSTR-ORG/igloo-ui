import type * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  ClearCredentialsDialog,
  ExportPackageModal,
  OnboardDeviceSponsorDialog,
  OnboardDeviceSponsorshipPanel,
  OnboardDeviceSponsorshipDialog,
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

  it('renders the Paper settings sidebar sections and actions', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    const onNameChange = vi.fn();
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
        onNewRelayUrlChange={vi.fn()}
        onAddRelay={vi.fn()}
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
    expect(onboardButton).toHaveClass('w-full');
    expect(screen.getByRole('heading', { name: 'Logout' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();

    fireEvent.click(screen.getByText('Advanced'));
    expect(screen.getByRole('heading', { name: 'Runtime Settings' })).toBeVisible();

    fireEvent.change(screen.getByLabelText('Profile Name'), { target: { value: 'Edited Device' } });
    expect(onNameChange).toHaveBeenCalledWith('Edited Device');

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
    expect(screen.getByText('Package passwords do not match.')).toBeInTheDocument();
    expect(screen.getByText('Source bfshare does not match any member in this keyset.')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('settings-onboard-device-label'), {
      target: { value: 'Laptop Device' },
    });
    expect(onDraftChange).toHaveBeenCalledWith('label', 'Laptop Device');

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
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
      />,
    );

    expect(screen.getByRole('heading', { name: 'Package Handoff' })).toBeInTheDocument();
    expect(screen.getByTestId('settings-onboard-result')).toBeInTheDocument();
    expect(screen.getByDisplayValue('bfonboard1remote')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('settings-onboard-copy'));
    expect(onCopy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('settings-onboard-save'));
    expect(onSave).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('settings-onboard-qr'));
    expect(onQr).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Create Another' }));
    expect(onCreateAnother).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onClose).toHaveBeenCalledTimes(1);
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
              lastSeenLabel: 'last seen 5/31/2026, 2:14 PM',
            },
            { id: 'peer-2', alias: 'Peer #2', pubkey: 'peer-2', state: 'offline', statusLabel: 'offline' },
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
