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
  ImportProfileEntry,
  OnboardCompletePanel,
  OnboardFailedPanel,
  OnboardHandshakePanel,
  OnboardingClientCard,
  OnboardPackageEntry,
  ReplaceShareFailedPanel,
  ReplaceSharePackageEntry,
  ReplaceShareProgressPanel,
  ReplaceShareSuccessPanel,
  RecoverCollectSharesPanel,
  RotateKeysetPanel,
  StoredProfilesLandingCard,
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
        onNewKeyset={onNewKeyset}
        onImportProfile={onImportProfile}
        onOnboard={onOnboard}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Igloo Web' })).toBeInTheDocument();
    expect(screen.getByText('Split your Nostr key. Sign from anywhere.')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Generate New Keyset' })).toBeInTheDocument();
    expect(screen.queryByTestId('welcome-new-keyset-plus')).not.toBeInTheDocument();
    const welcomeHelp = screen.getByRole('button', { name: 'About generating a new keyset' });
    expect(welcomeHelp).toHaveAttribute('data-tooltip-placement', 'right');
    const welcomeTooltip = document.getElementById(welcomeHelp.getAttribute('aria-describedby') ?? '');
    expect(welcomeTooltip).toHaveClass('igloo-tooltip-content');
    expect(welcomeTooltip).toHaveTextContent('Generate a new set of signing keys and devices.');

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
        layout="single"
        profiles={[returningProfiles[0]]}
        onUnlock={onUnlock}
        onRotate={onRotate}
        onDelete={onDelete}
        onNewKeyset={onNewKeyset}
        onImportProfile={onImportProfile}
        onOnboard={onOnboard}
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
        layout="multi"
        profiles={returningProfiles.slice(0, 3)}
        onUnlock={onUnlock}
        onRotate={onRotate}
        onDelete={vi.fn()}
        onNewKeyset={vi.fn()}
        onImportProfile={vi.fn()}
        onOnboard={vi.fn()}
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
        layout="many"
        profiles={returningProfiles}
        onUnlock={vi.fn()}
        onRotate={vi.fn()}
        onDelete={vi.fn()}
        onNewKeyset={vi.fn()}
        onImportProfile={vi.fn()}
        onOnboard={vi.fn()}
      />,
    );

    expect(screen.getByText('Family Key')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Unlock' })).toHaveLength(6);
    expect(screen.getByText('Generate Keyset')).toBeInTheDocument();
    expect(screen.getByText('Import Existing Device')).toBeInTheDocument();
    expect(screen.getByText('Onboard New Device')).toBeInTheDocument();
  });

  it('renders resumable devices with resume and forget actions', () => {
    const onResumeDevice = vi.fn();
    const onForgetDevice = vi.fn();

    render(
      <WelcomeReturningHero
        layout="single"
        profiles={[returningProfiles[0]]}
        onUnlock={vi.fn()}
        onRotate={vi.fn()}
        onDelete={vi.fn()}
        onNewKeyset={vi.fn()}
        onImportProfile={vi.fn()}
        onOnboard={vi.fn()}
        resumeDevices={[{ id: 'old-instance', label: 'Old Browser', metaLabel: '1 profile' }]}
        onResumeDevice={onResumeDevice}
        onForgetDevice={onForgetDevice}
      />,
    );

    expect(screen.getByText('Old Browser')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(onResumeDevice).toHaveBeenCalledWith('old-instance');

    fireEvent.click(screen.getByRole('button', { name: 'Forget Old Browser' }));
    expect(onForgetDevice).toHaveBeenCalledWith('old-instance');
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

  it('keeps recover collection blocked until threshold-worthy source material is complete', () => {
    const onNext = vi.fn();

    render(
      <RecoverCollectSharesPanel
        sources={[{ packageText: 'bfshare1remote', packagePassword: '' }]}
        threshold={2}
        collectedCount={1}
        onChangeSource={vi.fn()}
        onAddSource={vi.fn()}
        onRemoveSource={vi.fn()}
        onNext={onNext}
      />,
    );

    expect(screen.getByText('1 of 2 required')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Old devices do not need to be online. Provide enough source packages and passwords to meet the threshold.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Add another source package and password to continue.',
    );
    const nextButton = screen.getByRole('button', { name: 'Next Step' });
    expect(nextButton).toBeDisabled();

    fireEvent.click(nextButton);
    expect(onNext).not.toHaveBeenCalled();
  });

  it('labels the recover collection live status', () => {
    render(
      <RecoverCollectSharesPanel
        sources={[{ packageText: 'bfshare1remote', packagePassword: '' }]}
        threshold={2}
        collectedCount={1}
        onChangeSource={vi.fn()}
        onAddSource={vi.fn()}
        onRemoveSource={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByRole('status', { name: 'Recovery collection status' })).toHaveTextContent(
      'Add another source package and password to continue.',
    );
  });

  it('exposes recover threshold progress as a progressbar', () => {
    render(
      <RecoverCollectSharesPanel
        sources={[{ packageText: '', packagePassword: '' }, { packageText: '', packagePassword: '' }]}
        threshold={3}
        collectedCount={1}
        onChangeSource={vi.fn()}
        onAddSource={vi.fn()}
        onRemoveSource={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const progress = screen.getByRole('progressbar', { name: 'Recovery threshold progress' });
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '3');
    expect(progress).toHaveAttribute('aria-valuenow', '1');
    expect(progress).toHaveAttribute('aria-valuetext', '1 of 3 required');
  });

  it('renders an empty remote-source state before recovery sources are added', () => {
    const onAddSource = vi.fn();

    render(
      <RecoverCollectSharesPanel
        sources={[]}
        threshold={2}
        collectedCount={1}
        onChangeSource={vi.fn()}
        onAddSource={onAddSource}
        onRemoveSource={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const emptyState = screen.getByRole('status', { name: 'Remote recovery sources' });
    expect(emptyState).toHaveTextContent('No remote source packages added yet.');
    expect(emptyState).toHaveTextContent('Add a source package from another device or backup to meet the threshold.');

    fireEvent.click(screen.getByRole('button', { name: 'Add Source' }));
    expect(onAddSource).toHaveBeenCalledTimes(1);
  });

  it('shows which recovery source field is missing before a share can count', () => {
    render(
      <RecoverCollectSharesPanel
        sources={[{ packageText: 'bfshare1remote', packagePassword: '' }]}
        threshold={2}
        collectedCount={1}
        onChangeSource={vi.fn()}
        onAddSource={vi.fn()}
        onRemoveSource={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByText('Password required')).toBeInTheDocument();
    expect(screen.getByText('Add the package password to count Share #2.')).toBeInTheDocument();
  });

  it('labels each recover source card as a share-specific group', () => {
    render(
      <RecoverCollectSharesPanel
        sources={[
          { packageText: 'bfshare1remote', packagePassword: '' },
          { packageText: '', packagePassword: 'remote-pass' },
        ]}
        threshold={3}
        collectedCount={1}
        onChangeSource={vi.fn()}
        onAddSource={vi.fn()}
        onRemoveSource={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByRole('group', { name: 'Share #2 recovery source: Password required' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Share #3 recovery source: Package required' })).toBeInTheDocument();
  });

  it('marks recover source fields invalid after a recovery failure', () => {
    render(
      <RecoverCollectSharesPanel
        sources={[{ packageText: 'bfshare1remote', packagePassword: 'remote-pass' }]}
        threshold={2}
        collectedCount={2}
        error="Recovery failed. Check the source package and package password, then try again."
        onChangeSource={vi.fn()}
        onAddSource={vi.fn()}
        onRemoveSource={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert', { name: 'Recovery failed' })).toHaveTextContent(
      'Recovery failed. Check the source package and package password, then try again.',
    );
    expect(screen.getByLabelText('Source Package')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Package Password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('marks completed recover sources for review after a recovery failure', () => {
    render(
      <RecoverCollectSharesPanel
        sources={[{ packageText: 'bfshare1remote', packagePassword: 'remote-pass' }]}
        threshold={2}
        collectedCount={2}
        error="Recovery failed. Check the source package and package password, then try again."
        onChangeSource={vi.fn()}
        onAddSource={vi.fn()}
        onRemoveSource={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByRole('group', { name: 'Share #2 recovery source: Review required' })).toBeInTheDocument();
    expect(screen.getByText('Check Share #2 source package and password, then try again.')).toBeInTheDocument();
    expect(screen.queryByText('Share #2 can count toward the threshold.')).not.toBeInTheDocument();
  });

  it('announces recover failures in the collection status', () => {
    render(
      <RecoverCollectSharesPanel
        sources={[{ packageText: 'bfshare1remote', packagePassword: 'remote-pass' }]}
        threshold={2}
        collectedCount={2}
        error="Recovery failed. Check the source package and package password, then try again."
        onChangeSource={vi.fn()}
        onAddSource={vi.fn()}
        onRemoveSource={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByRole('status', { name: 'Recovery collection status' })).toHaveTextContent(
      'Recovery failed. Update the highlighted source package or password, then try again.',
    );
  });

  it('renders recovery failures with the Paper failure-state structure', () => {
    render(
      <RecoverCollectSharesPanel
        sources={[{ packageText: 'bfshare1remote', packagePassword: '' }]}
        threshold={2}
        collectedCount={1}
        error="Provided 1 of 2 required shares. Add at least 1 more share to continue reconstructing your nsec."
        onChangeSource={vi.fn()}
        onAddSource={vi.fn()}
        onRemoveSource={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const failure = screen.getByRole('alert', { name: 'Recovery failed' });
    expect(within(failure).getByText('Recovery Failed')).toBeInTheDocument();
    expect(failure).toHaveTextContent(
      'Provided 1 of 2 required shares. Add at least 1 more share to continue reconstructing your nsec.',
    );
    expect(within(failure).getByText('Shares: 1/2 (need 2)')).toBeInTheDocument();
  });

  it('locks recover source material while recovery is in flight', () => {
    const onAddSource = vi.fn();
    const onRemoveSource = vi.fn();

    render(
      <RecoverCollectSharesPanel
        sources={[{ packageText: 'bfshare1remote', packagePassword: 'remote-pass' }]}
        threshold={2}
        collectedCount={2}
        onChangeSource={vi.fn()}
        onAddSource={onAddSource}
        onRemoveSource={onRemoveSource}
        onNext={vi.fn()}
        actionBusy
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Recovering private key from collected shares...',
    );
    expect(screen.getByLabelText('Source Package')).toBeDisabled();
    expect(screen.getByLabelText('Package Password')).toBeDisabled();

    const remove = screen.getByRole('button', { name: 'Remove Share #2 source' });
    expect(remove).toBeDisabled();
    fireEvent.click(remove);
    expect(onRemoveSource).not.toHaveBeenCalled();

    const add = screen.getByRole('button', { name: 'Add Source' });
    expect(add).toBeDisabled();
    fireEvent.click(add);
    expect(onAddSource).not.toHaveBeenCalled();

    const next = screen.getByRole('button', { name: 'Recovering...' });
    expect(next).toBeDisabled();
    expect(next).toHaveAttribute('aria-busy', 'true');
  });

  it('can render the Paper fixed recovery source set without add or remove controls', () => {
    render(
      <RecoverCollectSharesPanel
        sources={[{ packageText: '', packagePassword: '' }]}
        threshold={2}
        collectedCount={1}
        onChangeSource={vi.fn()}
        onAddSource={vi.fn()}
        onRemoveSource={vi.fn()}
        onNext={vi.fn()}
        sourceControls="fixed"
      />,
    );

    expect(screen.getByText('Share #1 (this device)')).toBeInTheDocument();
    expect(screen.getByText('Share #2')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add Source' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });

  it('shows when the local recovery share is locked behind the device passphrase', () => {
    render(
      <RecoverCollectSharesPanel
        sources={[
          { packageText: '', packagePassword: '' },
          { packageText: '', packagePassword: '' },
        ]}
        threshold={2}
        collectedCount={0}
        deviceShareState="locked"
        onChangeSource={vi.fn()}
        onAddSource={vi.fn()}
        onRemoveSource={vi.fn()}
        onNext={vi.fn()}
        sourceControls="fixed"
      />,
    );

    expect(screen.getByRole('group', { name: 'Share #1 (this device): Passphrase required' })).toBeInTheDocument();
    expect(screen.getByText('Passphrase required')).toBeInTheDocument();
    expect(screen.getByText('0 of 2 required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next Step' })).toBeDisabled();
  });

  it('asks for this device passphrase and flags duplicate local packages during recover collection', () => {
    const onLocalPassphraseChange = vi.fn();
    const onSubmitLocalPassphrase = vi.fn();

    const { rerender } = render(
      <RecoverCollectSharesPanel
        sources={[
          { packageText: 'bfprofile1local', packagePassword: 'local-pass', duplicateOfLocal: true },
          { packageText: '', packagePassword: '' },
        ]}
        threshold={2}
        collectedCount={0}
        deviceShareLabel="This Device Share (#2)"
        deviceShareState="locked"
        localPassphrase=""
        onLocalPassphraseChange={onLocalPassphraseChange}
        onSubmitLocalPassphrase={onSubmitLocalPassphrase}
        onChangeSource={vi.fn()}
        onAddSource={vi.fn()}
        onRemoveSource={vi.fn()}
        onNext={vi.fn()}
        sourceControls="fixed"
      />,
    );

    expect(screen.getByRole('group', { name: 'This Device Share (#2): Passphrase required' })).toBeInTheDocument();
    expect(screen.getByText(/Unlock this profile or provide enough remote source packages/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unlock Share' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Profile Passphrase'), {
      target: { value: 'device-passphrase' },
    });
    expect(onLocalPassphraseChange).toHaveBeenCalledWith('device-passphrase');
    expect(onSubmitLocalPassphrase).not.toHaveBeenCalled();

    rerender(
      <RecoverCollectSharesPanel
        sources={[
          { packageText: 'bfprofile1local', packagePassword: 'local-pass', duplicateOfLocal: true },
          { packageText: '', packagePassword: '' },
        ]}
        threshold={2}
        collectedCount={0}
        deviceShareLabel="This Device Share (#2)"
        deviceShareState="locked"
        localPassphrase="device-passphrase"
        onLocalPassphraseChange={onLocalPassphraseChange}
        onSubmitLocalPassphrase={onSubmitLocalPassphrase}
        onChangeSource={vi.fn()}
        onAddSource={vi.fn()}
        onRemoveSource={vi.fn()}
        onNext={vi.fn()}
        sourceControls="fixed"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Unlock Share' }));
    expect(onSubmitLocalPassphrase).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Local share')).toBeInTheDocument();
    expect(screen.getByText(/matches this device/i)).toBeInTheDocument();
    expect(screen.getByText('0 of 2 required')).toBeInTheDocument();
  });

  it('renders stored profile card models on landing and dispatches explicit actions', () => {
    const onSelect = vi.fn();
    const onLoad = vi.fn();
    const onDelete = vi.fn();

    render(
      <StoredProfilesLandingCard
        profiles={[
          {
            id: 'profile-1',
            label: 'Primary Browser Device',
            shortId: 'npub1qe3...7k4m',
            thresholdLabel: '2/3',
            publicKeyLabel: 'group-pub-1',
            updatedLabel: 'Updated today',
            state: 'available',
            primaryActionLabel: 'Load Profile',
            destructiveActionLabel: 'Delete',
          },
          {
            id: 'profile-2',
            label: 'Backup Device',
            shortId: 'npub1backup...8mx',
            thresholdLabel: '2/3',
            state: 'locked',
            primaryActionLabel: 'Open Dashboard',
            destructiveActionLabel: 'Remove',
          }
        ]}
        selectedProfileId="profile-2"
        onSelect={onSelect}
        onLoad={onLoad}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText('Stored Profiles')).toBeInTheDocument();
    expect(screen.getByText('npub1qe3...7k4m')).toBeInTheDocument();
    expect(screen.getAllByText('2/3')).toHaveLength(2);
    expect(screen.getByText('group-pub-1')).toBeInTheDocument();
    expect(screen.getByText('Updated today')).toBeInTheDocument();
    expect(screen.getByText('available')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Primary Browser Device').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith('profile-1');

    const backupCard = screen.getByText('Backup Device').closest('.rounded-xl') as HTMLElement;
    fireEvent.click(within(backupCard).getByRole('button', { name: 'Open Dashboard' }));
    expect(onLoad).toHaveBeenCalledWith('profile-2');

    fireEvent.click(within(backupCard).getByRole('button', { name: 'Remove' }));
    expect(onDelete).toHaveBeenCalledWith('profile-2');
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
    const thresholdHelp = screen.getByRole('button', { name: 'About threshold' });
    const totalSharesHelp = screen.getByRole('button', { name: 'About total shares' });
    const existingPrivateKeyHelp = screen.getByRole('button', { name: 'About existing private keys' });
    expect(thresholdHelp).toHaveAttribute('data-tooltip-placement', 'right');
    expect(totalSharesHelp).toHaveAttribute('data-tooltip-placement', 'right');
    expect(existingPrivateKeyHelp).toHaveAttribute('data-tooltip-placement', 'right');
    expect(thresholdHelp).not.toHaveAttribute('title');
    const thresholdTooltip = document.getElementById(thresholdHelp.getAttribute('aria-describedby') ?? '');
    expect(thresholdTooltip).toHaveClass('igloo-tooltip-content');
    expect(thresholdTooltip).toHaveTextContent(/The minimum number of shares required to sign/);
    expect(screen.getByText(/Specify the total number of shares to create/)).toBeInTheDocument();
    expect(screen.getByText(/Provide an existing nsec or hex private key/)).toBeInTheDocument();

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

  it('locks create-flow keyset inputs while generation is in flight', () => {
    render(
      <CreateFlowGenerateCard
        groupName="Treasury Signers"
        threshold="2"
        count="3"
        privateKey="nsec1existing"
        onChangeForm={vi.fn()}
        onGenerate={vi.fn()}
        onBack={vi.fn()}
        actionBusy
      />,
    );

    expect(screen.getByLabelText('Group Name')).toBeDisabled();
    expect(screen.getByLabelText('Threshold')).toBeDisabled();
    expect(screen.getByLabelText('Total Shares')).toBeDisabled();
    expect(screen.getByLabelText('Existing Private Key (optional)')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrease Threshold' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increase Threshold' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Back to Welcome' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Generating...' })).toBeDisabled();
  });

  it('renders the create-flow private key validation state inline', () => {
    render(
      <CreateFlowGenerateCard
        groupName=""
        threshold="2"
        count="3"
        privateKey="not-a-valid-key"
        privateKeyError="Invalid private key format."
        onChangeForm={vi.fn()}
        onGenerate={vi.fn()}
      />,
    );

    const privateKey = screen.getByLabelText('Existing Private Key (optional)');
    expect(privateKey).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Invalid private key format.')).toHaveClass('igloo-field-error');
    expect(screen.queryByText(/Provide an existing key/)).not.toBeInTheDocument();
  });

  it('renders the select-share group public key as info in npub and raw hex formats', () => {
    const onSelectShare = vi.fn();
    const onAction = vi.fn();
    const groupHex = 'ab'.repeat(32);

    render(
      <CreateFlowShareSelection
        shares={[
          { name: 'Share 1', member_idx: 0, share_public_key: 'share-pub-1' },
          { name: 'Share 2', member_idx: 1, share_public_key: 'share-pub-2' },
          { name: 'Share 3', member_idx: 2, share_public_key: 'share-pub-3' },
        ]}
        selectedMemberIdx={1}
        keysetName="My Signing Key"
        groupPublicKey={groupHex}
        groupPublicKeyNpub="npub1group...demo"
        groupPublicKeyHex={groupHex}
        onSelectShare={onSelectShare}
        onAction={onAction}
      />,
    );

    expect(screen.getByText('Choose Local Share')).toBeInTheDocument();
    expect(screen.getByText('npub1group...demo')).toBeInTheDocument();
    expect(screen.getByText(groupHex)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy group public key' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Share 3/i }));
    expect(onSelectShare).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('locks select-share choices while the local share is being saved', () => {
    render(
      <CreateFlowShareSelection
        shares={[
          { name: 'Share 1', member_idx: 0, share_public_key: 'share-pub-1' },
          { name: 'Share 2', member_idx: 1, share_public_key: 'share-pub-2' },
        ]}
        selectedMemberIdx={0}
        keysetName="My Signing Key"
        groupPublicKey="npub1group...demo"
        onSelectShare={vi.fn()}
        onAction={vi.fn()}
        onBack={vi.fn()}
        actionBusy
      />,
    );

    expect(screen.getByRole('button', { name: /Share 1/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Share 2/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Go Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Continuing...' })).toBeDisabled();
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

  it('locks save-profile inputs while the local profile is being saved', () => {
    render(
      <CreateFlowProfileSetup
        draft={{
          label: 'Igloo Web',
          relayUrls: 'wss://relay.primal.net\nwss://relay.example.com',
          primarySecret: 'secret',
          secondarySecret: 'secret',
        }}
        actionLabel="Next Step"
        onLabelChange={vi.fn()}
        onPrimarySecretChange={vi.fn()}
        onSecondarySecretChange={vi.fn()}
        onRelaysChange={vi.fn()}
        onAction={vi.fn()}
        onBack={vi.fn()}
        actionBusy
      />,
    );

    expect(screen.getByLabelText('Device Profile Name')).toBeDisabled();
    expect(screen.getByLabelText('Device Password')).toBeDisabled();
    expect(screen.getByLabelText('Confirm Password')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Remove wss://relay.example.com' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Add relay' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
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
    const onChangeRotationSource = vi.fn();
    const onRemoveRotationSource = vi.fn();
    const onRotate = vi.fn();

    render(
      <RotateKeysetPanel
        sourceProfileId="profile-1"
        availableProfiles={[{ id: 'profile-1', label: 'Primary Browser Device' }]}
        localSourceLabel="Share #1 (this device)"
        threshold={2}
        collectedCount={2}
        rotationSources={[{ packageText: 'bfprofile1source', packagePassword: 'source-pass' }]}
        onChangeSourceProfile={vi.fn()}
        onChangeRotationSource={onChangeRotationSource}
        onAddRotationSource={vi.fn()}
        onRemoveRotationSource={onRemoveRotationSource}
        onRotate={onRotate}
      />,
    );

    expect(screen.getByRole('group', { name: 'Share #1 (this device): Ready' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Source Profile')).not.toBeInTheDocument();
    expect(screen.getByText('Remote Source #1')).toBeInTheDocument();
    expect(screen.getByText('Shares Collected')).toBeInTheDocument();
    expect(screen.getByText('2 of 2 required')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Source Package'), {
      target: { value: 'bfprofile1...' },
    });
    expect(onChangeRotationSource).toHaveBeenCalledWith(0, 'packageText', 'bfprofile1...');

    fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
    expect(onRotate).toHaveBeenCalledTimes(1);
  });

  it('asks for this device passphrase and flags duplicate local packages during rotate collection', () => {
    const onLocalPassphraseChange = vi.fn();
    const onSubmitLocalPassphrase = vi.fn();

    const { rerender } = render(
      <RotateKeysetPanel
        sourceProfileId="profile-1"
        availableProfiles={[{ id: 'profile-1', label: 'Primary Browser Device' }]}
        localSourceLabel="Share #2 (this device)"
        localSourceState="locked"
        localPassphrase=""
        threshold={2}
        collectedCount={0}
        rotationSources={[
          { packageText: 'bfprofile1local', packagePassword: 'local-pass', duplicateOfLocal: true },
        ]}
        onChangeSourceProfile={vi.fn()}
        onLocalPassphraseChange={onLocalPassphraseChange}
        onSubmitLocalPassphrase={onSubmitLocalPassphrase}
        onChangeRotationSource={vi.fn()}
        onAddRotationSource={vi.fn()}
        onRemoveRotationSource={vi.fn()}
        onRotate={vi.fn()}
      />,
    );

    expect(screen.getByRole('group', { name: 'Share #2 (this device): Passphrase required' })).toBeInTheDocument();
    expect(screen.getByText(/This device share is available but not counted yet/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unlock Share' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Profile Passphrase'), {
      target: { value: 'device-passphrase' },
    });
    expect(onLocalPassphraseChange).toHaveBeenCalledWith('device-passphrase');
    expect(onSubmitLocalPassphrase).not.toHaveBeenCalled();
    rerender(
      <RotateKeysetPanel
        sourceProfileId="profile-1"
        availableProfiles={[{ id: 'profile-1', label: 'Primary Browser Device' }]}
        localSourceLabel="Share #2 (this device)"
        localSourceState="locked"
        localPassphrase="device-passphrase"
        threshold={2}
        collectedCount={0}
        rotationSources={[
          { packageText: 'bfprofile1local', packagePassword: 'local-pass', duplicateOfLocal: true },
        ]}
        onChangeSourceProfile={vi.fn()}
        onLocalPassphraseChange={onLocalPassphraseChange}
        onSubmitLocalPassphrase={onSubmitLocalPassphrase}
        onChangeRotationSource={vi.fn()}
        onAddRotationSource={vi.fn()}
        onRemoveRotationSource={vi.fn()}
        onRotate={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Unlock Share' }));
    expect(onSubmitLocalPassphrase).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Remote Source #1')).toBeInTheDocument();
    expect(screen.getByText('Local share')).toBeInTheDocument();
    expect(screen.getByText(/matches this device/i)).toBeInTheDocument();
    expect(screen.getByText('0 of 2 required')).toBeInTheDocument();
  });

  it('shows rotate source profile and add controls only when needed', () => {
    const onChangeSourceProfile = vi.fn();
    const onAddRotationSource = vi.fn();

    render(
      <RotateKeysetPanel
        sourceProfileId="profile-1"
        availableProfiles={[
          { id: 'profile-1', label: 'Primary Browser Device' },
          { id: 'profile-2', label: 'Laptop Device' },
        ]}
        localSourceLabel="Share #1 (this device)"
        threshold={3}
        collectedCount={1}
        rotationSources={[{ packageText: '', packagePassword: '' }]}
        onChangeSourceProfile={onChangeSourceProfile}
        onChangeRotationSource={vi.fn()}
        onAddRotationSource={onAddRotationSource}
        onRemoveRotationSource={vi.fn()}
        onRotate={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Source Profile'), {
      target: { value: 'profile-2' },
    });
    expect(onChangeSourceProfile).toHaveBeenCalledWith('profile-2');

    fireEvent.click(screen.getByRole('button', { name: 'Add Source' }));
    expect(onAddRotationSource).toHaveBeenCalledTimes(1);
  });

  it('locks rotate-keyset source inputs while rotation is in flight', () => {
    render(
      <RotateKeysetPanel
        sourceProfileId="profile-1"
        availableProfiles={[{ id: 'profile-1', label: 'Primary Browser Device' }]}
        localSourceLabel="Share #1 (this device)"
        threshold={3}
        collectedCount={2}
        rotationSources={[{ packageText: 'bfshare1source', packagePassword: 'source-pass' }]}
        onChangeSourceProfile={vi.fn()}
        onChangeRotationSource={vi.fn()}
        onAddRotationSource={vi.fn()}
        onRemoveRotationSource={vi.fn()}
        onRotate={vi.fn()}
        actionBusy
      />,
    );

    expect(screen.getByLabelText('Source Package')).toBeDisabled();
    expect(screen.getByLabelText('Package Password')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove Remote Source #1' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add Source' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Rotating...' })).toBeDisabled();
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

    expect(screen.getByRole('region', { name: 'Replacement Package' })).toBeInTheDocument();
    expect(screen.getByText('Replacement Package')).toBeInTheDocument();
    expect(screen.getByText('Paste a prepared bfonboard1... replacement package, or scan its QR code.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'About replacement packages' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'About package passwords' })).toBeInTheDocument();
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

  it('locks replace-share package entry inputs while connecting', () => {
    render(
      <ReplaceSharePackageEntry
        packageText="bfonboard1demo"
        packagePassword="package-pass"
        onPackageTextChange={vi.fn()}
        onPackagePasswordChange={vi.fn()}
        onScanQr={vi.fn()}
        onSubmit={vi.fn()}
        actionBusy
      />,
    );

    expect(screen.getByTestId('rotation-package-input')).toBeDisabled();
    expect(screen.getByTestId('rotation-password-input')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Scan QR' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Connecting...' })).toBeDisabled();
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
    expect(screen.getByText('Replacement package did not apply')).toBeInTheDocument();
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
    expect(screen.getByRole('button', { name: 'About onboarding packages' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'About encryption passwords' })).toBeInTheDocument();
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

  it('locks onboarding package entry inputs while connecting', () => {
    render(
      <OnboardPackageEntry
        packageText="bfonboard1example"
        password="package-pass"
        onPackageTextChange={vi.fn()}
        onPasswordChange={vi.fn()}
        onConnect={vi.fn()}
        actionBusy
      />,
    );

    expect(screen.getByLabelText('bfonboard')).toBeDisabled();
    expect(screen.getByLabelText('Encryption Password')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Scan QR' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Connecting...' })).toBeDisabled();
  });

  it('locks import profile entry inputs while loading the profile', () => {
    render(
      <ImportProfileEntry
        profileString="bfprofile1example"
        password="backup-pass"
        onProfileStringChange={vi.fn()}
        onPasswordChange={vi.fn()}
        onNext={vi.fn()}
        actionBusy
      />,
    );

    expect(screen.getByLabelText('Profile Backup')).toBeDisabled();
    expect(screen.getByLabelText('Backup Password')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Importing...' })).toBeDisabled();
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
    expect(screen.getByText('Peer Permissions')).toBeInTheDocument();
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
    const onTogglePermission = vi.fn();
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
        permissions={{ 2: ['sign', 'ping'] }}
        onChangeDraft={vi.fn()}
        onDistribute={vi.fn()}
        onTogglePermission={onTogglePermission}
        onFinish={vi.fn()}
        beforeCards={<div>runtime panel</div>}
      />,
    );

    const section = within(view.container);
    expect(section.queryByText('Distribute the Keyset')).not.toBeInTheDocument();
    expect(section.getByText('runtime panel')).toBeInTheDocument();
    expect(section.getByText('Remaining Shares')).toBeInTheDocument();
    expect(section.getByLabelText('Package password')).toBeInTheDocument();
    expect(section.getByLabelText('Remote Tablet sign permission: enabled')).toHaveAttribute('data-state', 'active');
    expect(section.getByLabelText('Remote Tablet ecdh permission: disabled')).toHaveAttribute('data-state', 'inactive');
    fireEvent.click(section.getByLabelText('Remote Tablet ecdh permission: disabled'));
    expect(onTogglePermission).toHaveBeenCalledWith(2, 'ecdh', true);
    expect(section.getByRole('button', { name: 'Finish Setup' })).toBeEnabled();
  });
});
