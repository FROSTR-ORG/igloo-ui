import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  CreateFlowDistributionSection,
  CreateFlowDistributionCards,
  CreateFlowGenerateCard,
  CreateFlowLocalSaveCard,
  StoredProfilesLandingCard,
} from '../src';

describe('shared host flow components', () => {
  it('renders stored profiles on landing and dispatches the load action', () => {
    const onAction = vi.fn();

    render(
      <StoredProfilesLandingCard
        profiles={[
          {
            id: 'profile-1',
            label: 'Primary Browser Device',
            subtitle: 'abcd1234',
          },
        ]}
        onAction={onAction}
      />,
    );

    expect(screen.getByText('Stored Profiles')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Load Profile' }));
    expect(onAction).toHaveBeenCalledWith('profile-1');
  });

  it('dispatches create-flow edits and mode changes', () => {
    const onChangeForm = vi.fn();
    const onGenerate = vi.fn();

    render(
      <CreateFlowGenerateCard
        form={{
          mode: 'new',
          groupName: '',
          threshold: '2',
          count: '3',
          sourceProfileId: '',
        }}
        availableProfiles={[]}
        rotationSources={[{ packageText: '', packagePassword: '' }]}
        onChangeForm={onChangeForm}
        onChangeRotationSource={vi.fn()}
        onAddRotationSource={vi.fn()}
        onRemoveRotationSource={vi.fn()}
        onGenerate={onGenerate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Rotate Existing Keyset' }));
    expect(onChangeForm).toHaveBeenCalledWith('mode', 'rotate');

    fireEvent.change(screen.getByLabelText('Group Name'), {
      target: { value: 'Treasury Signers' },
    });
    expect(onChangeForm).toHaveBeenCalledWith('groupName', 'Treasury Signers');

    fireEvent.click(screen.getByRole('button', { name: 'Generate Keyset' }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
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
