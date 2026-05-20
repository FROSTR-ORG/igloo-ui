import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  CreateFlowDistributionSection,
  CreateFlowDistributionCards,
  CreateFlowGenerateCard,
  CreateFlowLocalSaveCard,
  RotateKeysetPanel,
  StoredProfilesLandingCard,
} from '../src';

describe('shared host flow components', () => {
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

    fireEvent.change(screen.getByLabelText('Group Name'), {
      target: { value: 'Treasury Signers' },
    });
    expect(onChangeForm).toHaveBeenCalledWith('groupName', 'Treasury Signers');

    fireEvent.click(screen.getByRole('button', { name: 'Generate Keyset' }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
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

    fireEvent.click(screen.getByRole('button', { name: 'QR' }));
    expect(onDistribute).toHaveBeenCalledWith(2, 'qr');

    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
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
    expect(section.getByRole('heading', { name: 'Remaining Shares' })).toBeInTheDocument();
    expect(section.getByLabelText('Share label')).toBeInTheDocument();
    expect(section.getByRole('button', { name: 'Finish' })).toBeInTheDocument();
  });
});
