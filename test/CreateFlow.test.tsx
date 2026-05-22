import type { FormEvent } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  CreateFlowDistributionSection,
  CreateFlowDistributionCards,
  CreateFlowGenerateCard,
  CreateFlowLocalSaveCard,
  CreateFlowProfileSetup,
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

    fireEvent.click(screen.getByRole('button', { name: 'New Keyset' }));
    expect(onNewKeyset).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Import Device Profile' }));
    expect(onImportProfile).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Onboard' }));
    expect(onOnboard).toHaveBeenCalledTimes(1);
  });

  it('renders the returning Paper welcome profile actions', () => {
    const onUnlock = vi.fn();
    const onRotate = vi.fn();
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

    fireEvent.click(screen.getByRole('button', { name: 'Rotate' }));
    expect(onRotate).toHaveBeenCalledWith('profile-1');

    fireEvent.click(screen.getByRole('button', { name: 'New Keyset' }));
    expect(onNewKeyset).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Import Device Profile' }));
    expect(onImportProfile).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Onboard' }));
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

    fireEvent.click(screen.getAllByRole('button', { name: 'Rotate' })[2]);
    expect(onRotate).toHaveBeenCalledWith('profile-3');
  });

  it('renders the returning Paper welcome many-profile layout', () => {
    render(
      <WelcomeReturningHero
        layout="many"
        profiles={returningProfiles}
        onUnlock={vi.fn()}
        onRotate={vi.fn()}
        onNewKeyset={vi.fn()}
        onImportProfile={vi.fn()}
        onOnboard={vi.fn()}
      />,
    );

    expect(screen.getByText('Family Key')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Unlock' })).toHaveLength(6);
    expect(screen.getByText('New Keyset')).toBeInTheDocument();
    expect(screen.getByText('Import Device Profile')).toBeInTheDocument();
    expect(screen.getByText('Onboard')).toBeInTheDocument();
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

  it('dispatches create-flow keyset edits without rotation controls', () => {
    const onChangeForm = vi.fn();
    const onGenerate = vi.fn();

    render(
      <CreateFlowGenerateCard
        groupName=""
        threshold="2"
        count="3"
        onChangeForm={onChangeForm}
        onGenerate={onGenerate}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Rotate Existing Keyset' })).not.toBeInTheDocument();
    expect(screen.getByText('Private Key (nsec)')).toBeInTheDocument();
    expect(screen.getByText('Any 2 of 3 shares can sign - min threshold is 2, min shares is 3')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Group Name'), {
      target: { value: 'Treasury Signers' },
    });
    expect(onChangeForm).toHaveBeenCalledWith('groupName', 'Treasury Signers');

    fireEvent.click(screen.getByRole('button', { name: 'Increase Threshold' }));
    expect(onChangeForm).toHaveBeenCalledWith('threshold', '3');

    fireEvent.click(screen.getByRole('button', { name: 'Create Keyset' }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it('renders the Paper create-profile setup surface', () => {
    const onSelectShare = vi.fn();
    const onLabelChange = vi.fn();
    const onPrimarySecretChange = vi.fn();
    const onSecondarySecretChange = vi.fn();
    const onRelayUrlsChange = vi.fn();
    const onAction = vi.fn();

    render(
      <CreateFlowProfileSetup
        shares={[
          { name: 'Share 1', member_idx: 0, share_public_key: 'share-pub-1' },
          { name: 'Share 2', member_idx: 1, share_public_key: 'share-pub-2' },
          { name: 'Share 3', member_idx: 2, share_public_key: 'share-pub-3' },
        ]}
        selectedMemberIdx={1}
        keysetName="My Signing Key"
        draft={{
          label: 'Igloo Web',
          relayUrls: 'wss://relay.primal.net',
          primarySecret: '',
          secondarySecret: '',
        }}
        actionLabel="Continue to Review"
        onSelectShare={onSelectShare}
        onLabelChange={onLabelChange}
        onPrimarySecretChange={onPrimarySecretChange}
        onSecondarySecretChange={onSecondarySecretChange}
        onRelayUrlsChange={onRelayUrlsChange}
        onAction={onAction}
      />,
    );

    expect(screen.getByText('Choose Local Share')).toBeInTheDocument();
    expect(screen.getByText('Index 1 · Encrypted')).toBeInTheDocument();
    expect(screen.getByText('Save to this device')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Share 3/i }));
    expect(onSelectShare).toHaveBeenCalledWith(2);

    fireEvent.change(screen.getByLabelText('Device Profile Name'), {
      target: { value: 'Primary Browser Device' },
    });
    expect(onLabelChange).toHaveBeenCalledWith('Primary Browser Device');

    fireEvent.change(screen.getByLabelText('Device Password'), {
      target: { value: 'secret' },
    });
    expect(onPrimarySecretChange).toHaveBeenCalledWith('secret');

    fireEvent.click(screen.getByRole('button', { name: 'Continue to Review' }));
    expect(onAction).toHaveBeenCalledTimes(1);
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

    fireEvent.change(screen.getByLabelText('Share label'), {
      target: { value: 'Remote Phone' },
    });
    expect(onChangeDraft).toHaveBeenCalledWith(2, 'label', 'Remote Phone');

    fireEvent.change(screen.getByLabelText('Package password'), {
      target: { value: 'remote-pass' },
    });
    expect(onChangeDraft).toHaveBeenCalledWith(2, 'packagePassword', 'remote-pass');

    fireEvent.click(screen.getByRole('button', { name: 'Create package' }));
    expect(onDistribute).toHaveBeenCalledWith(2, 'prepare');
  });

  it('renders distribution completion when every remote package is ready', () => {
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
            packagePassword: 'remote-pass',
            confirmPassword: 'remote-pass',
          },
        }}
        results={{
          2: {
            kind: 'prepared',
            label: 'Remote Tablet',
            packageText: 'bfonboard1example',
          },
        }}
        onChangeDraft={vi.fn()}
        onDistribute={vi.fn()}
        onFinish={onFinish}
      />,
    );

    expect(screen.getByText('Distribution Status')).toBeInTheDocument();
    expect(screen.getByText('All remote packages complete')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Finish Distribution' }));
    expect(onFinish).toHaveBeenCalledTimes(1);
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
        actionLabel="Continue to Review"
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
    fireEvent.click(screen.getByRole('button', { name: 'Continue to Review' }));
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
    expect(section.getByText('Distribute the Keyset')).toBeInTheDocument();
    expect(section.getByText('runtime panel')).toBeInTheDocument();
    expect(section.getByText('Remaining Shares')).toBeInTheDocument();
    expect(section.getByLabelText('Share label')).toBeInTheDocument();
    expect(section.getByRole('button', { name: 'Continue to Completion' })).toBeDisabled();
  });
});
