import type { FormEvent } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  CreateFlowDistributionSection,
  CreateFlowDistributionCards,
  CreateFlowGenerateCard,
  CreateFlowShareSelection,
  CreateFlowLocalSaveCard,
  CreateFlowProfileSetup,
  OnboardCompletePanel,
  OnboardFailedPanel,
  OnboardHandshakePanel,
  OnboardingClientCard,
  OnboardPackageEntry,
  ReplaceShareFailedPanel,
  ReplaceSharePackageEntry,
  ReplaceShareProgressPanel,
  ReplaceShareSuccessPanel,
  RotateKeysetPanel,
  WelcomeEntryHero,
  WelcomeReturningHero,
  WelcomeUnlockModal,
} from '../src';

afterEach(() => {
  cleanup();
});

describe('shared host flow components', () => {
  const returningProfiles = [
    {
      id: 'profile-1',
      label: 'My Signing Key',
      thresholdLabel: '2/3',
      memberLabel: '#0',
      publicKeyLabel: 'npub1qe3...7k4m',
    },
    {
      id: 'profile-2',
      label: 'Work Key',
      thresholdLabel: '2/3',
      memberLabel: '#1',
      publicKeyLabel: 'npub1work...8mx2',
    },
    {
      id: 'profile-3',
      label: 'Travel Key',
      thresholdLabel: '2/3',
      memberLabel: '#2',
      publicKeyLabel: 'npub1travel...9px3',
    },
    {
      id: 'profile-4',
      label: 'Archive Key',
      thresholdLabel: '3/5',
      memberLabel: '#3',
      publicKeyLabel: 'npub1archive...4va4',
    },
    {
      id: 'profile-5',
      label: 'Cold Key',
      thresholdLabel: '3/5',
      memberLabel: '#4',
      publicKeyLabel: 'npub1cold...5qk5',
    },
    {
      id: 'profile-6',
      label: 'Family Key',
      thresholdLabel: '3/5',
      memberLabel: '#5',
      publicKeyLabel: 'npub1family...6jf6',
    },
  ];

  it('renders the first-launch Paper welcome entry actions', () => {
    const onNewKeyset = vi.fn();
    const onImportProfile = vi.fn();
    const onOnboard = vi.fn();

    render(
      <WelcomeEntryHero
        logoSrc="/igloo-mark.png"
        productLabel="Igloo Web"
        tagline="Split your Nostr key. Sign from anywhere."
        primaryAction={{
          heading: 'Generate New Keyset',
          description: 'Generate a new threshold keyset and set up its first device profile.',
          buttonLabel: 'Generate Keyset',
          onAction: onNewKeyset,
        }}
        secondaryActions={[
          { id: 'import', label: 'Import Existing Device', onAction: onImportProfile },
          { id: 'onboard', label: 'Onboard New Device', onAction: onOnboard },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Igloo Web' })).toBeInTheDocument();
    expect(screen.getByText('Split your Nostr key. Sign from anywhere.')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Generate New Keyset' })).toBeInTheDocument();
    expect(screen.queryByTestId('welcome-new-keyset-plus')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Generate Keyset' }));
    expect(onNewKeyset).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Import Existing Device' }));
    expect(onImportProfile).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Onboard New Device' }));
    expect(onOnboard).toHaveBeenCalledTimes(1);
  });

  it('renders the returning Paper welcome profile actions', () => {
    const onUnlock = vi.fn();
    const onRotate = vi.fn();
    const onDelete = vi.fn();
    const onNewKeyset = vi.fn();
    const onImportProfile = vi.fn();
    const onOnboard = vi.fn();

    render(
      <WelcomeReturningHero
        logoSrc="/igloo-mark.png"
        productLabel="Igloo Web"
        layout="single"
        profiles={[returningProfiles[0]]}
        onUnlock={onUnlock}
        onRotate={onRotate}
        onDelete={onDelete}
        secondaryActions={[
          { id: 'generate', label: 'Generate Keyset', onAction: onNewKeyset },
          { id: 'import', label: 'Import Existing Device', onAction: onImportProfile },
          { id: 'onboard', label: 'Onboard New Device', onAction: onOnboard },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Igloo Web' })).toBeInTheDocument();
    expect(screen.getByText('Welcome back.')).toBeInTheDocument();
    expect(screen.getByText('My Signing Key')).toBeInTheDocument();
    expect(screen.getByText('2/3')).toBeInTheDocument();
    expect(screen.getByText('#0')).toBeInTheDocument();
    expect(screen.getByText('npub1qe3...7k4m')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Unlock' }));
    expect(onUnlock).toHaveBeenCalledWith('profile-1');

    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Rotate' }));
    expect(onRotate).toHaveBeenCalledWith('profile-1');

    fireEvent.click(screen.getByRole('button', { name: 'Generate Keyset' }));
    expect(onNewKeyset).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Import Existing Device' }));
    expect(onImportProfile).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Onboard New Device' }));
    expect(onOnboard).toHaveBeenCalledTimes(1);
  });

  it('renders the returning Paper welcome multi-profile layout', () => {
    const onUnlock = vi.fn();
    const onRotate = vi.fn();

    render(
      <WelcomeReturningHero
        productLabel="Igloo Web"
        layout="multi"
        profiles={returningProfiles.slice(0, 3)}
        onUnlock={onUnlock}
        onRotate={onRotate}
        onDelete={vi.fn()}
        secondaryActions={[
          { id: 'generate', label: 'Generate Keyset', onAction: vi.fn() },
          { id: 'import', label: 'Import Existing Device', onAction: vi.fn() },
          { id: 'onboard', label: 'Onboard New Device', onAction: vi.fn() },
        ]}
      />,
    );

    expect(screen.getByText('My Signing Key')).toBeInTheDocument();
    expect(screen.getByText('Work Key')).toBeInTheDocument();
    expect(screen.getByText('Travel Key')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Unlock' })).toHaveLength(3);

    fireEvent.click(screen.getAllByRole('button', { name: 'Unlock' })[1]);
    expect(onUnlock).toHaveBeenCalledWith('profile-2');

    fireEvent.click(screen.getAllByRole('button', { name: 'More actions' })[2]);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Rotate' }));
    expect(onRotate).toHaveBeenCalledWith('profile-3');
  });

  it('renders the returning Paper welcome many-profile layout', () => {
    render(
      <WelcomeReturningHero
        productLabel="Igloo Web"
        layout="many"
        profiles={returningProfiles}
        onUnlock={vi.fn()}
        onRotate={vi.fn()}
        onDelete={vi.fn()}
        secondaryActions={[
          { id: 'generate', label: 'Generate Keyset', onAction: vi.fn() },
          { id: 'import', label: 'Import Existing Device', onAction: vi.fn() },
          { id: 'onboard', label: 'Onboard New Device', onAction: vi.fn() },
        ]}
      />,
    );

    expect(screen.getByText('Family Key')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Unlock' })).toHaveLength(6);
    expect(screen.getByText('Generate Keyset')).toBeInTheDocument();
    expect(screen.getByText('Import Existing Device')).toBeInTheDocument();
    expect(screen.getByText('Onboard New Device')).toBeInTheDocument();
  });

  it('renders the returning Paper welcome unlock modal states', () => {
    const onPasswordChange = vi.fn();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    const onClose = vi.fn();

    const { rerender } = render(
      <WelcomeUnlockModal
        open
        profile={returningProfiles[0]}
        password=""
        error={null}
        submitting={false}
        onPasswordChange={onPasswordChange}
        onSubmit={onSubmit}
        onClose={onClose}
      />,
    );

    expect(screen.getByText('Unlock Profile')).toBeInTheDocument();
    expect(screen.getByText('My Signing Key · 2/3 · #0')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Profile Password'), { target: { value: 'secret' } });
    expect(onPasswordChange).toHaveBeenCalledWith('secret');

    fireEvent.click(screen.getByRole('button', { name: 'Unlock' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    rerender(
      <WelcomeUnlockModal
        open
        profile={returningProfiles[0]}
        password="wrong"
        error="Incorrect password. Please try again."
        submitting={false}
        onPasswordChange={onPasswordChange}
        onSubmit={onSubmit}
        onClose={onClose}
      />,
    );

    expect(screen.getByText('Incorrect password. Please try again.')).toBeInTheDocument();
  });

  it('dispatches create-flow keyset edits with the Paper four-step copy', () => {
    const onChangeForm = vi.fn();
    const onGenerate = vi.fn();

    render(
      <CreateFlowGenerateCard
        groupName=""
        threshold="2"
        count="3"
        privateKey=""
        onChangeForm={onChangeForm}
        onGenerate={onGenerate}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Generate' })).not.toBeInTheDocument();
    expect(screen.getByText('Threshold')).toBeInTheDocument();
    expect(screen.getByText('Existing Private Key (optional)')).toBeInTheDocument();
    expect(screen.getByText('Any 2 of 3 shares can sign - min threshold is 2, min shares is 3')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Group Name'), {
      target: { value: 'Treasury Signers' },
    });
    expect(onChangeForm).toHaveBeenCalledWith('groupName', 'Treasury Signers');

    fireEvent.change(screen.getByLabelText('Existing Private Key (optional)'), {
      target: { value: 'nsec1existing' },
    });
    expect(onChangeForm).toHaveBeenCalledWith('privateKey', 'nsec1existing');

    fireEvent.click(screen.getByRole('button', { name: 'Increase Threshold' }));
    expect(onChangeForm).toHaveBeenCalledWith('threshold', '3');

    fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it('renders the Paper select-share step with info-only group public key formats', () => {
    const onSelectShare = vi.fn();
    const onAction = vi.fn();

    render(
      <CreateFlowShareSelection
        shares={[
          { name: 'Share 1', member_idx: 0, share_public_key: 'share-pub-1' },
          { name: 'Share 2', member_idx: 1, share_public_key: 'share-pub-2' },
          { name: 'Share 3', member_idx: 2, share_public_key: 'share-pub-3' },
        ]}
        selectedMemberIdx={1}
        keysetName="My Signing Key"
        groupPublicKey={'11'.repeat(32)}
        groupPublicKeyNpub="npub1examplegroupkey"
        onSelectShare={onSelectShare}
        onAction={onAction}
      />,
    );

    expect(screen.getByText('Choose Local Share')).toBeInTheDocument();
    expect(screen.getByText('npub1examplegroupkey')).toBeInTheDocument();
    expect(screen.getByText('11'.repeat(32))).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy group public key' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Share 3/i }));
    expect(onSelectShare).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders the Paper save-profile setup surface without peer permissions', () => {
    const onLabelChange = vi.fn();
    const onPrimarySecretChange = vi.fn();
    const onSecondarySecretChange = vi.fn();
    const onRelayUrlsChange = vi.fn();
    const onAction = vi.fn();

    render(
      <CreateFlowProfileSetup
        draft={{
          label: 'Igloo Web',
          relayUrls: 'wss://relay.primal.net\nwss://relay.example.com',
          primarySecret: '',
          secondarySecret: '',
        }}
        actionLabel="Next Step"
        onLabelChange={onLabelChange}
        onPrimarySecretChange={onPrimarySecretChange}
        onSecondarySecretChange={onSecondarySecretChange}
        onRelayUrlsChange={onRelayUrlsChange}
        onAction={onAction}
      />,
    );

    expect(screen.getByLabelText('Device Profile Name')).toBeInTheDocument();
    expect(screen.getByText('wss://relay.example.com')).toBeInTheDocument();
    expect(screen.queryByText('Choose Local Share')).not.toBeInTheDocument();
    expect(screen.queryByText('Peer Permissions')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Device Profile Name'), {
      target: { value: 'Primary Browser Device' },
    });
    expect(onLabelChange).toHaveBeenCalledWith('Primary Browser Device');

    fireEvent.change(screen.getByLabelText('Device Password'), {
      target: { value: 'secret' },
    });
    expect(onPrimarySecretChange).toHaveBeenCalledWith('secret');

    fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('keeps the device name editable on the onboard save surface while relays stay locked', () => {
    const onLabelChange = vi.fn();

    render(
      <CreateFlowProfileSetup
        draft={{
          label: 'Onboarded Device',
          relayUrls: 'wss://relay.primal.net',
          primarySecret: '',
          secondarySecret: '',
        }}
        actionLabel="Launch Signer"
        lockIdentity
        lockName={false}
        onLabelChange={onLabelChange}
        onPrimarySecretChange={vi.fn()}
        onSecondarySecretChange={vi.fn()}
        onRelayUrlsChange={vi.fn()}
        onAction={vi.fn()}
      />,
    );

    const nameInput = screen.getByLabelText('Device Profile Name');
    expect(nameInput).not.toHaveAttribute('readonly');
    fireEvent.change(nameInput, { target: { value: 'My Tablet' } });
    expect(onLabelChange).toHaveBeenCalledWith('My Tablet');
  });

  it('renders rotate-keyset source and recovery share inputs separately', () => {
    const onChangeSourceProfile = vi.fn();
    const onChangeRotationSource = vi.fn();
    const onAddRotationSource = vi.fn();
    const onRemoveRotationSource = vi.fn();
    const onRotate = vi.fn();

    render(
      <RotateKeysetPanel
        sourceProfileId="profile-1"
        availableProfiles={[{ id: 'profile-1', label: 'Primary Browser Device' }]}
        rotationSources={[{ packageText: '', packagePassword: '' }]}
        onChangeSourceProfile={onChangeSourceProfile}
        onChangeRotationSource={onChangeRotationSource}
        onAddRotationSource={onAddRotationSource}
        onRemoveRotationSource={onRemoveRotationSource}
        onRotate={onRotate}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Rotate Keyset' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Source Profile'), {
      target: { value: 'profile-1' },
    });
    expect(onChangeSourceProfile).toHaveBeenCalledWith('profile-1');

    fireEvent.change(screen.getByLabelText('bfshare'), {
      target: { value: 'bfshare1...' },
    });
    expect(onChangeRotationSource).toHaveBeenCalledWith(0, 'packageText', 'bfshare1...');

    fireEvent.click(screen.getByRole('button', { name: 'Add bfshare Source' }));
    expect(onAddRotationSource).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Rotate Keyset' }));
    expect(onRotate).toHaveBeenCalledTimes(1);
  });

  it('renders the Paper replace-share package entry section', () => {
    const onPackageTextChange = vi.fn();
    const onPackagePasswordChange = vi.fn();
    const onSubmit = vi.fn();
    const onScanQr = vi.fn();

    render(
      <ReplaceSharePackageEntry
        packageText=""
        packagePassword=""
        onPackageTextChange={onPackageTextChange}
        onPackagePasswordChange={onPackagePasswordChange}
        onScanQr={onScanQr}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByText('Onboarding Package')).toBeInTheDocument();
    expect(screen.getByText('Paste a bfonboard1... package that was produced outside runtime, or scan its QR code.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Scan QR' }));
    expect(onScanQr).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByTestId('rotation-package-input'), {
      target: { value: 'bfonboard1demo' },
    });
    expect(onPackageTextChange).toHaveBeenCalledWith('bfonboard1demo');

    fireEvent.change(screen.getByTestId('rotation-password-input'), {
      target: { value: 'package-pass' },
    });
    expect(onPackagePasswordChange).toHaveBeenCalledWith('package-pass');

    fireEvent.click(screen.getByRole('button', { name: 'Replace Share' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders the Paper replace-share applying, failed, and success states', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const onRetry = vi.fn();
    const onBack = vi.fn();
    const onReturn = vi.fn();

    const { rerender } = render(
      <ReplaceShareProgressPanel
        keysetName="My Signing Key"
        memberLabel="Share #1"
        packageLabel="bfonboard1demo..."
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Applying Replacement' })).toBeInTheDocument();
    expect(screen.getByText('Validated package')).toBeInTheDocument();
    expect(screen.getByText('Matched Group Profile')).toBeInTheDocument();
    expect(screen.getByText('Replacing local share')).toBeInTheDocument();
    expect(screen.getByText('Saving updated local share')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Replace Share' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel Replacement' }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    rerender(
      <ReplaceShareProgressPanel
        keysetName="My Signing Key"
        memberLabel="Share #1"
        packageLabel="bfonboard1demo..."
        applying
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Replace Share' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel Replacement' })).toBeDisabled();

    rerender(
      <ReplaceShareFailedPanel
        message="Check the package, password, group match, and current share state, then retry replacement."
        onRetry={onRetry}
        onBack={onBack}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Replacement Failed' })).toBeInTheDocument();
    expect(screen.getByText('Onboarding package did not apply')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Back to Replace Share' }));
    expect(onBack).toHaveBeenCalledTimes(1);

    rerender(
      <ReplaceShareSuccessPanel
        groupKeyLabel="npub1group...demo"
        oldShareKeyLabel="npub1old...share"
        newShareKeyLabel="npub1new...share"
        onReturn={onReturn}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Share Replaced' })).toBeInTheDocument();
    expect(screen.getByText('Replacement share is active on this device')).toBeInTheDocument();
    expect(screen.getByText('Replacement Summary')).toBeInTheDocument();
    expect(screen.getByText('Group Public Key')).toBeInTheDocument();
    expect(screen.getByText('Share Public Key')).toBeInTheDocument();
    expect(screen.getByText('Group Profile')).toBeInTheDocument();
    expect(screen.getByText('npub1old...share')).toBeInTheDocument();
    expect(screen.getByText('npub1new...share')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Return to Signer' }));
    expect(onReturn).toHaveBeenCalledTimes(1);
  });

  it('dispatches distribution field edits and actions', () => {
    const onChangeDraft = vi.fn();
    const onDistribute = vi.fn();
    const onFinish = vi.fn();

    render(
      <CreateFlowDistributionCards
        shares={[
          {
            name: 'Remote Tablet',
            member_idx: 2,
            share_public_key: 'share-pub-2',
          },
        ]}
        drafts={{
          2: {
            label: 'Remote Tablet',
            packagePassword: '',
            confirmPassword: '',
          },
        }}
        results={{}}
        onChangeDraft={onChangeDraft}
        onDistribute={onDistribute}
        onFinish={onFinish}
      />,
    );

    fireEvent.change(screen.getByLabelText('Package password'), {
      target: { value: 'remote-pass' },
    });
    expect(onChangeDraft).toHaveBeenCalledWith(2, 'packagePassword', 'remote-pass');
    expect(onChangeDraft).toHaveBeenCalledWith(2, 'confirmPassword', 'remote-pass');
    expect(screen.queryByLabelText('Confirm password')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create Package' }));
    expect(onDistribute).toHaveBeenCalledWith(2, 'prepare');
  });

  it('shows delivered cards with a revert action and the finish button', () => {
    const onFinish = vi.fn();
    const onDistribute = vi.fn();

    render(
      <CreateFlowDistributionCards
        shares={[
          {
            name: 'Remote Tablet',
            member_idx: 2,
            share_public_key: 'share-pub-2',
          },
        ]}
        drafts={{
          2: {
            label: 'Remote Tablet',
            packagePassword: 'remote-pass',
            confirmPassword: 'remote-pass',
          },
        }}
        results={{
          2: {
            status: 'delivered',
            label: 'Remote Tablet',
            packageText: 'bfonboard1example',
          },
        }}
        onChangeDraft={vi.fn()}
        onDistribute={onDistribute}
        onFinish={onFinish}
      />,
    );

    // Delivered cards hide the delivery options and expose Revert.
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark Delivered' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Revert' }));
    expect(onDistribute).toHaveBeenCalledWith(2, 'revert');

    fireEvent.click(screen.getByRole('button', { name: 'Finish Setup' }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('shows packaged cards with delivery options and the onboarding client card', () => {
    const onDistribute = vi.fn();
    const onStart = vi.fn();

    render(
      <CreateFlowDistributionSection
        sectionTitle="Remote Shares"
        sectionDescription="Each share can be distributed as a protected onboarding package."
        shares={[
          {
            name: 'Remote Tablet',
            member_idx: 2,
            share_public_key: 'share-pub-2',
          },
        ]}
        drafts={{
          2: { label: 'Remote Tablet', packagePassword: 'remote-pass', confirmPassword: 'remote-pass' },
        }}
        results={{
          2: { status: 'packaged', label: 'Remote Tablet', packageText: 'bfonboard1example' },
        }}
        onChangeDraft={vi.fn()}
        onDistribute={onDistribute}
        onFinish={vi.fn()}
        beforeCards={
          <OnboardingClientCard
            running={false}
            relayCount={2}
            peerCount={1}
            signerPubkey={'ab'.repeat(16)}
            onStart={onStart}
            onStop={vi.fn()}
          />
        }
      />,
    );

    expect(screen.getByText('Onboarding Client')).toBeInTheDocument();
    expect(screen.getByText('Stopped')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(onStart).toHaveBeenCalledTimes(1);

    expect(screen.getByText('Packaged')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mark Delivered' }));
    expect(onDistribute).toHaveBeenCalledWith(2, 'mark');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onDistribute).toHaveBeenCalledWith(2, 'cancel');
  });

  it('dispatches onboarding package entry edits and connect', () => {
    const onPackageTextChange = vi.fn();
    const onPasswordChange = vi.fn();
    const onConnect = vi.fn();

    render(
      <OnboardPackageEntry
        packageText=""
        password=""
        onPackageTextChange={onPackageTextChange}
        onPasswordChange={onPasswordChange}
        onConnect={onConnect}
      />,
    );

    expect(screen.getByText('Onboarding Package')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('bfonboard'), {
      target: { value: 'bfonboard1example' },
    });
    expect(onPackageTextChange).toHaveBeenCalledWith('bfonboard1example');

    fireEvent.change(screen.getByLabelText('Encryption Password'), {
      target: { value: 'package-pass' },
    });
    expect(onPasswordChange).toHaveBeenCalledWith('package-pass');

    fireEvent.click(screen.getByRole('button', { name: 'Apply Onboarding Package' }));
    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it('renders onboarding handshake and failure panels', () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <OnboardHandshakePanel
        packageText="bfonboard1paperdemo"
        keysetName="My Signing Key"
        thresholdLabel="2/3"
        activeStep="negotiate"
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Onboard Device' })).toBeInTheDocument();
    expect(screen.getByText('Connect to Relays')).toBeInTheDocument();
    expect(screen.getByText('Negotiate with Peer')).toBeInTheDocument();
    expect(screen.getByText('Finish Onboarding')).toBeInTheDocument();
    expect(screen.getByText(/Onboarding package: bfonboard1paperdemo/)).toBeInTheDocument();

    rerender(<OnboardFailedPanel onRetry={onRetry} />);
    expect(screen.getByText('Check the package, password, and group details, then retry onboarding.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('dispatches onboarding completion edits and save', () => {
    const onLabelChange = vi.fn();
    const onPasswordChange = vi.fn();
    const onConfirmPasswordChange = vi.fn();
    const onSave = vi.fn();

    render(
      <OnboardCompletePanel
        preview={{
          label: 'Remote Tablet',
          sharePublicKey: 'share-pub-2',
          groupPublicKey: 'group-pub-1',
          relays: ['wss://relay.primal.net'],
        }}
        groupName="My Signing Key"
        thresholdLabel="2 of 3"
        shareLabel="#0 (Index 0)"
        peerPolicyCount={3}
        draft={{ label: 'Remote Tablet', password: '', confirmPassword: '' }}
        onLabelChange={onLabelChange}
        onPasswordChange={onPasswordChange}
        onConfirmPasswordChange={onConfirmPasswordChange}
        onSave={onSave}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Onboarding Complete' })).toBeInTheDocument();
    expect(screen.getByText('Group Profile')).toBeInTheDocument();
    expect(screen.getByText('My Signing Key')).toBeInTheDocument();
    expect(screen.getByText('2 of 3')).toBeInTheDocument();
    expect(screen.getByText('#0 (Index 0)')).toBeInTheDocument();
    expect(screen.getByText('3 total')).toBeInTheDocument();
    expect(screen.getByLabelText('Device Name')).toHaveValue('Remote Tablet');

    fireEvent.change(screen.getByLabelText('Device Name'), {
      target: { value: 'Remote Browser' },
    });
    expect(onLabelChange).toHaveBeenCalledWith('Remote Browser');

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'device-pass' },
    });
    expect(onPasswordChange).toHaveBeenCalledWith('device-pass');

    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'device-pass' },
    });
    expect(onConfirmPasswordChange).toHaveBeenCalledWith('device-pass');

    fireEvent.click(screen.getByRole('button', { name: 'Save & Launch Signer' }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('renders the shared local-save form contract', () => {
    const onAction = vi.fn();

    render(
      <CreateFlowLocalSaveCard
        share={{ name: 'Primary Browser Device', member_idx: 1, share_public_key: 'share-pub-1' }}
        draft={{
          label: 'Primary Browser Device',
          relayUrls: 'wss://relay.example.com',
          primarySecret: 'secret-pass',
          secondarySecret: 'secret-pass',
        }}
        labelInputLabel="Device Profile Name"
        primarySecretLabel="Device Password"
        secondarySecretLabel="Confirm Password"
        actionLabel="Next Step"
        onLabelChange={vi.fn()}
        onPrimarySecretChange={vi.fn()}
        onSecondarySecretChange={vi.fn()}
        onRelayUrlsChange={vi.fn()}
        onAction={onAction}
      />,
    );

    expect(screen.getByLabelText('Device Profile Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Device Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Relay URLs')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders the shared distribution section framing together', () => {
    const view = render(
      <CreateFlowDistributionSection
        bannerKicker="Distribute the Keyset"
        bannerDescription="This device is initialized and connected."
        bannerPoints={[
          'Copy, QR, and Save all produce bfonboard packages.',
          'Finish when you are done to reach the dashboard.',
        ]}
        sectionTitle="Remaining Shares"
        sectionDescription="Each share can be distributed as a protected onboarding package."
        shares={[
          {
            name: 'Remote Tablet',
            member_idx: 2,
            share_public_key: 'share-pub-2',
          },
        ]}
        drafts={{
          2: {
            label: 'Remote Tablet',
            packagePassword: 'remote-pass',
            confirmPassword: 'remote-pass',
          },
        }}
        results={{}}
        onChangeDraft={vi.fn()}
        onDistribute={vi.fn()}
        onFinish={vi.fn()}
        beforeCards={<div>runtime panel</div>}
      />,
    );

    const section = within(view.container);
    expect(section.queryByText('Distribute the Keyset')).not.toBeInTheDocument();
    expect(section.getByText('runtime panel')).toBeInTheDocument();
    expect(section.getByText('Remaining Shares')).toBeInTheDocument();
    expect(section.getByLabelText('Package password')).toBeInTheDocument();
    expect(section.getByRole('button', { name: 'Finish Setup' })).toBeEnabled();
  });
});
