import * as React from 'react';
import { EyeOff, HelpCircle, Pencil } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ProfileConfirmationCard } from './ProfileConfirmationCard';

export type SharedCreateFormState = {
  groupName: string;
  threshold: string;
  count: string;
};

export type SharedRotationSource = {
  packageText: string;
  packagePassword: string;
};

export type SharedGeneratedShare = {
  name: string;
  member_idx: number;
  share_public_key: string;
};

export type SharedDistributionDraft = {
  label: string;
  packagePassword: string;
  confirmPassword: string;
};

export type SharedDistributionResult = {
  kind: 'copied' | 'qr' | 'saved';
  label: string;
};

export type SharedLocalSaveDraft = {
  label: string;
  relayUrls: string;
  primarySecret: string;
  secondarySecret?: string;
};

export function CreateFlowTaskBanner({
  kicker,
  description,
  points,
}: {
  kicker: string;
  description: React.ReactNode;
  points: string[];
}) {
  return (
    <section className="igloo-task-banner">
      <span className="igloo-task-kicker">{kicker}</span>
      <p>{description}</p>
      <div className="igloo-task-points">
        {points.map((point) => (
          <span key={point}>{point}</span>
        ))}
      </div>
    </section>
  );
}

export function CreateFlowGenerateCard({
  groupName,
  threshold,
  count,
  onChangeForm,
  onGenerate,
}: {
  groupName: string;
  threshold: string;
  count: string;
  onChangeForm: (
    field: 'groupName' | 'threshold' | 'count',
    value: string,
  ) => void;
  onGenerate: () => void;
}) {
  const thresholdValue = Number.parseInt(threshold, 10) || 2;
  const countValue = Number.parseInt(count, 10) || 3;
  const thresholdSummary = `Any ${thresholdValue} of ${countValue} shares can sign - min threshold is 2, min shares is 3`;

  const adjustNumber = (field: 'threshold' | 'count', direction: -1 | 1) => {
    const currentValue = field === 'threshold' ? thresholdValue : countValue;
    const nextValue = Math.max(2, currentValue + direction);
    onChangeForm(field, String(nextValue));
  };

  return (
    <div className="igloo-create-keyset-form">
      <label className="igloo-create-field">
        <span>Keyset Name</span>
        <div className="igloo-create-input-shell">
          <Pencil size={16} aria-hidden="true" />
          <input
            aria-label="Group Name"
            value={groupName}
            onChange={(event) => onChangeForm('groupName', event.target.value)}
            placeholder="e.g. My Signing Key, Work Key..."
          />
        </div>
        <small>A friendly name for this keyset's group profile. Visible to all peers in the keyset.</small>
      </label>

      <label className="igloo-create-field">
        <span className="igloo-create-label-with-help">
          Private Key (nsec)
          <HelpCircle size={14} aria-hidden="true" />
        </span>
        <div className="igloo-create-private-row">
          <div className="igloo-create-input-shell">
            <input
              aria-label="Private Key (nsec)"
              placeholder="Paste your existing nsec or generate a new one"
              readOnly
            />
            <EyeOff size={16} aria-hidden="true" />
          </div>
          <Button type="button" variant="secondary" disabled>
            Generate
          </Button>
        </div>
        <small>Paste your existing nsec or leave blank to generate a new one.</small>
      </label>

      <div className="igloo-create-threshold-row">
        <CreateCounterControl
          label="Threshold"
          value={threshold}
          onDecrease={() => adjustNumber('threshold', -1)}
          onIncrease={() => adjustNumber('threshold', 1)}
          onChange={(value) => onChangeForm('threshold', value)}
        />
        <span className="igloo-create-threshold-divider">/</span>
        <CreateCounterControl
          label="Total Shares"
          value={count}
          onDecrease={() => adjustNumber('count', -1)}
          onIncrease={() => adjustNumber('count', 1)}
          onChange={(value) => onChangeForm('count', value)}
        />
      </div>

      <p className="igloo-create-threshold-help">{thresholdSummary}</p>

      <Button type="button" className="igloo-create-primary-action" onClick={onGenerate}>
        Create Keyset
      </Button>
    </div>
  );
}

function CreateCounterControl({
  label,
  value,
  onDecrease,
  onIncrease,
  onChange,
}: {
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <label className="igloo-create-field">
      <span className="igloo-create-label-with-help">
        {label}
        <HelpCircle size={14} aria-hidden="true" />
      </span>
      <div className="igloo-create-counter">
        <button type="button" aria-label={`Decrease ${label}`} onClick={onDecrease}>
          -
        </button>
        <input
          aria-label={label}
          type="number"
          min={2}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" aria-label={`Increase ${label}`} onClick={onIncrease}>
          +
        </button>
      </div>
    </label>
  );
}

export function RotateKeysetPanel({
  sourceProfileId,
  availableProfiles,
  rotationSources,
  onChangeSourceProfile,
  onChangeRotationSource,
  onAddRotationSource,
  onRemoveRotationSource,
  onRotate,
}: {
  sourceProfileId: string;
  availableProfiles: Array<{ id: string; label: string }>;
  rotationSources: SharedRotationSource[];
  onChangeSourceProfile: (profileId: string) => void;
  onChangeRotationSource: (index: number, field: 'packageText' | 'packagePassword', value: string) => void;
  onAddRotationSource: () => void;
  onRemoveRotationSource: (index: number) => void;
  onRotate: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rotate Keyset</CardTitle>
        <CardDescription>Select the source profile and add recovery shares for the existing keyset.</CardDescription>
      </CardHeader>
      <CardContent className="igloo-stack">
        <label>
          Source Profile
          <select
            value={sourceProfileId}
            onChange={(event) => onChangeSourceProfile(event.target.value)}
          >
            <option value="">Select a local profile</option>
            {availableProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.label}
              </option>
            ))}
          </select>
        </label>
        <div className="igloo-stack">
          {rotationSources.map((source, index) => (
            <div key={`rotation-source-${index}`} className="igloo-generated-card">
              <header>
                <strong>Recovery Share {index + 1}</strong>
                <span>Add threshold bfshare packages to reconstruct the current keyset.</span>
              </header>
              <label>
                bfshare
                <Textarea
                  className="min-h-[96px]"
                  value={source.packageText}
                  onChange={(event) => onChangeRotationSource(index, 'packageText', event.target.value)}
                  placeholder="Paste bfshare1..."
                />
              </label>
              <label>
                Package Password
                <input
                  type="password"
                  value={source.packagePassword}
                  onChange={(event) => onChangeRotationSource(index, 'packagePassword', event.target.value)}
                />
              </label>
              <div className="igloo-button-row">
                <Button type="button" size="sm" variant="secondary" onClick={() => onRemoveRotationSource(index)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <div className="igloo-button-row">
            <Button type="button" size="sm" variant="secondary" onClick={onAddRotationSource}>
              Add bfshare Source
            </Button>
          </div>
        </div>
        <div className="igloo-button-row">
          <Button type="button" size="sm" onClick={onRotate}>
            Rotate Keyset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function CreateFlowSharePicker({
  shares,
  selectedMemberIdx,
  onSelect,
}: {
  shares: SharedGeneratedShare[];
  selectedMemberIdx: number | null;
  onSelect: (memberIdx: number) => void;
}) {
  return (
    <div className="igloo-flow-list">
      {shares.map((share) => (
        <div
          key={share.member_idx}
          className={selectedMemberIdx === share.member_idx ? 'igloo-flow-card is-selected' : 'igloo-flow-card'}
        >
          <button type="button" className="igloo-flow-card-select" onClick={() => onSelect(share.member_idx)}>
            <strong>{share.name}</strong>
            <span>Member {share.member_idx}</span>
            <small>{share.share_public_key}</small>
          </button>
        </div>
      ))}
    </div>
  );
}

export function CreateFlowLocalSaveCard({
  share,
  draft,
  actionLabel,
  actionVariant = 'default',
  title = share.name,
  subtitle = `Member ${share.member_idx}`,
  labelInputLabel = 'Device label',
  primarySecretLabel,
  secondarySecretLabel,
  relayLabel = 'Relay URLs',
  relayPlaceholder = 'One relay URL per line',
  onLabelChange,
  onPrimarySecretChange,
  onSecondarySecretChange,
  onRelayUrlsChange,
  onAction,
}: {
  share: SharedGeneratedShare;
  draft: SharedLocalSaveDraft;
  actionLabel: string;
  actionVariant?: 'default' | 'secondary';
  title?: string;
  subtitle?: string;
  labelInputLabel?: string;
  primarySecretLabel: string;
  secondarySecretLabel?: string;
  relayLabel?: string;
  relayPlaceholder?: string;
  onLabelChange: (value: string) => void;
  onPrimarySecretChange: (value: string) => void;
  onSecondarySecretChange?: (value: string) => void;
  onRelayUrlsChange: (value: string) => void;
  onAction: () => void;
}) {
  return (
    <section className="igloo-panel igloo-stack">
      <div>
        <strong>{title}</strong>
        <p className="igloo-message-muted">{subtitle}</p>
      </div>
      <div className="igloo-two-up">
        <label>
          {labelInputLabel}
          <input
            value={draft.label}
            onChange={(event) => onLabelChange(event.target.value)}
          />
        </label>
        <label>
          {primarySecretLabel}
          <input
            type="password"
            value={draft.primarySecret}
            onChange={(event) => onPrimarySecretChange(event.target.value)}
          />
        </label>
      </div>
      {secondarySecretLabel ? (
        <label>
          {secondarySecretLabel}
          <input
            type="password"
            value={draft.secondarySecret ?? ''}
            onChange={(event) => onSecondarySecretChange?.(event.target.value)}
          />
        </label>
      ) : null}
      <label>
        {relayLabel}
        <Textarea
          className="min-h-[96px]"
          placeholder={relayPlaceholder}
          value={draft.relayUrls}
          onChange={(event) => onRelayUrlsChange(event.target.value)}
        />
      </label>
      <div className="igloo-button-row">
        <Button
          type="button"
          size="sm"
          variant={actionVariant}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
    </section>
  );
}

export function CreateFlowReviewPanel({
  profileName,
  sharePublicKey,
  groupPublicKey,
  relays,
  actionLabel,
  onAccept,
  title = 'Preview and Confirm',
  description = 'This preview is read-only. Confirm the profile information before continuing to distribution.',
}: {
  profileName: string;
  sharePublicKey: string;
  groupPublicKey: string;
  relays: string[];
  actionLabel: string;
  onAccept: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <>
      <ProfileConfirmationCard
        title={title}
        description={description}
        profileName={profileName}
        sharePublicKey={sharePublicKey}
        groupPublicKey={groupPublicKey}
        relays={relays}
      />
      <div className="igloo-button-row">
        <Button type="button" size="sm" onClick={onAccept}>
          {actionLabel}
        </Button>
      </div>
    </>
  );
}

export function CreateFlowDistributionCards({
  shares,
  drafts,
  results,
  onChangeDraft,
  onDistribute,
  onFinish,
}: {
  shares: SharedGeneratedShare[];
  drafts: Record<number, SharedDistributionDraft>;
  results: Record<number, SharedDistributionResult>;
  onChangeDraft: (
    memberIdx: number,
    field: keyof SharedDistributionDraft,
    value: string,
  ) => void;
  onDistribute: (memberIdx: number, kind: 'copy' | 'qr' | 'save') => void;
  onFinish: () => void;
}) {
  return (
    <>
      {shares.map((share) => {
        const form = drafts[share.member_idx] ?? {
          label: share.name,
          packagePassword: '',
          confirmPassword: '',
        };
        const result = results[share.member_idx];
        return (
          <section key={`distribution-${share.member_idx}`} className="igloo-panel igloo-stack">
            <div>
              <strong>{share.name}</strong>
              <p className="igloo-message-muted">Member {share.member_idx}</p>
            </div>
            <label>
              Share label
              <input
                value={form.label}
                onChange={(event) => onChangeDraft(share.member_idx, 'label', event.target.value)}
              />
            </label>
            <div className="igloo-two-up">
              <label>
                Package password
                <input
                  type="password"
                  value={form.packagePassword}
                  onChange={(event) => onChangeDraft(share.member_idx, 'packagePassword', event.target.value)}
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => onChangeDraft(share.member_idx, 'confirmPassword', event.target.value)}
                />
              </label>
            </div>
            <div className="igloo-button-row">
              <Button type="button" size="sm" variant="secondary" onClick={() => onDistribute(share.member_idx, 'copy')}>
                Copy
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => onDistribute(share.member_idx, 'qr')}>
                QR
              </Button>
              <Button type="button" size="sm" onClick={() => onDistribute(share.member_idx, 'save')}>
                Save
              </Button>
            </div>
            {result ? (
              <div className="igloo-message-muted">
                {`${result.kind === 'copied' ? 'Copied' : result.kind === 'qr' ? 'Prepared QR for' : 'Saved file for'} ${result.label}.`}
              </div>
            ) : null}
          </section>
        );
      })}
      <div className="igloo-button-row">
        <Button type="button" size="sm" onClick={onFinish}>
          Finish
        </Button>
      </div>
    </>
  );
}

export function CreateFlowDistributionSection({
  bannerKicker,
  bannerDescription,
  bannerPoints,
  sectionTitle,
  sectionDescription,
  shares,
  drafts,
  results,
  onChangeDraft,
  onDistribute,
  onFinish,
  beforeCards,
}: {
  bannerKicker: string;
  bannerDescription: React.ReactNode;
  bannerPoints: string[];
  sectionTitle: string;
  sectionDescription: string;
  shares: SharedGeneratedShare[];
  drafts: Record<number, SharedDistributionDraft>;
  results: Record<number, SharedDistributionResult>;
  onChangeDraft: (
    memberIdx: number,
    field: keyof SharedDistributionDraft,
    value: string,
  ) => void;
  onDistribute: (memberIdx: number, kind: 'copy' | 'qr' | 'save') => void;
  onFinish: () => void;
  beforeCards?: React.ReactNode;
}) {
  return (
    <section className="igloo-stack">
      <CreateFlowTaskBanner
        kicker={bannerKicker}
        description={bannerDescription}
        points={bannerPoints}
      />
      {beforeCards}
      <Card>
        <CardHeader>
          <CardTitle>{sectionTitle}</CardTitle>
          <CardDescription>{sectionDescription}</CardDescription>
        </CardHeader>
        <CardContent className="igloo-stack">
          <div className="igloo-generated-grid">
            <CreateFlowDistributionCards
              shares={shares}
              drafts={drafts}
              results={results}
              onChangeDraft={onChangeDraft}
              onDistribute={onDistribute}
              onFinish={onFinish}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
