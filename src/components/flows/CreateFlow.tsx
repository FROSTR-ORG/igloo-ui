import * as React from 'react';
import { AlertTriangle, Check, Copy, EyeOff, HelpCircle, KeyRound, Pencil, QrCode } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';

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
  kind: 'package_ready' | 'handoff_pending' | 'completed';
  label: string;
  packageText?: string;
};

export type SharedDistributionAction = 'prepare' | 'copy' | 'qr' | 'save' | 'mark';

export type SharedLocalSaveDraft = {
  label: string;
  relayUrls: string;
  primarySecret: string;
  secondarySecret?: string;
};

export type SharedOnboardProfilePreview = {
  label: string;
  sharePublicKey: string;
  groupPublicKey: string;
  relays: string[];
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
      {description ? <p>{description}</p> : null}
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

export function CreateFlowProfileSetup({
  shares,
  selectedMemberIdx,
  keysetName,
  draft,
  actionLabel,
  onSelectShare,
  onLabelChange,
  onPrimarySecretChange,
  onSecondarySecretChange,
  onRelayUrlsChange,
  onAction,
}: {
  shares: SharedGeneratedShare[];
  selectedMemberIdx: number | null;
  keysetName: string;
  draft: SharedLocalSaveDraft;
  actionLabel: string;
  onSelectShare: (memberIdx: number) => void;
  onLabelChange: (value: string) => void;
  onPrimarySecretChange: (value: string) => void;
  onSecondarySecretChange: (value: string) => void;
  onRelayUrlsChange: (value: string) => void;
  onAction: () => void;
}) {
  const selectedShare =
    shares.find((share) => share.member_idx === selectedMemberIdx) ?? shares[0] ?? null;
  const relayRows = draft.relayUrls
    .split(/\r?\n/)
    .map((relay) => relay.trim())
    .filter(Boolean);

  return (
    <div className="igloo-create-profile-form">
      <section className="igloo-create-profile-panel">
        <header>
          <h3>Choose Local Share</h3>
          <p>One share saves locally; the rest become bfonboard packages on the next step.</p>
        </header>
        <div className="igloo-create-share-list">
          {shares.map((share) => {
            const isSelected = share.member_idx === selectedShare?.member_idx;
            return (
              <button
                type="button"
                key={share.member_idx}
                className={isSelected ? 'igloo-create-share-option is-selected' : 'igloo-create-share-option'}
                onClick={() => onSelectShare(share.member_idx)}
                aria-pressed={isSelected}
              >
                <span className="igloo-create-share-radio" aria-hidden="true" />
                <span className="igloo-create-share-copy">
                  <strong>{share.name}</strong>
                  <small>Index {share.member_idx} · {keysetName}</small>
                </span>
                <span className="igloo-create-share-state">
                  {isSelected ? 'Save to this device' : 'Distribute remotely'}
                </span>
              </button>
            );
          })}
        </div>
        {selectedShare ? (
          <div className="igloo-create-profile-summary">
            <div>
              <span>Local Share</span>
              <strong>Index {selectedShare.member_idx} · Encrypted</strong>
            </div>
            <div>
              <span>Keyset</span>
              <strong>{keysetName}</strong>
            </div>
          </div>
        ) : null}
      </section>

      <label className="igloo-create-profile-field">
        <span>Profile Name</span>
        <small>A name for this profile to identify it in the peer list.</small>
        <input
          aria-label="Device Profile Name"
          value={draft.label}
          onChange={(event) => onLabelChange(event.target.value)}
        />
      </label>

      <section className="igloo-create-profile-section">
        <header>
          <h3>Profile Password</h3>
          <p>This password encrypts your profile on this device. You'll need it each time you unlock it.</p>
        </header>
        <div className="igloo-create-profile-passwords">
          <label>
            <span>Password</span>
            <input
              aria-label="Device Password"
              type="password"
              value={draft.primarySecret}
              onChange={(event) => onPrimarySecretChange(event.target.value)}
            />
          </label>
          <label>
            <span>Confirm Password</span>
            <input
              aria-label="Confirm Password"
              type="password"
              value={draft.secondarySecret ?? ''}
              onChange={(event) => onSecondarySecretChange(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="igloo-create-profile-section">
        <header>
          <h3>Relays</h3>
        </header>
        <div className="igloo-create-relay-box">
          {relayRows.map((relay) => (
            <div className="igloo-create-relay-row" key={relay}>
              <span>{relay}</span>
              <small>Connected</small>
            </div>
          ))}
          <label>
            <span className="sr-only">Relays</span>
            <Textarea
              aria-label="Relays"
              value={draft.relayUrls}
              onChange={(event) => onRelayUrlsChange(event.target.value)}
              placeholder="wss://"
            />
          </label>
        </div>
      </section>

      <Button type="button" className="igloo-create-primary-action" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

export function CreateFlowReviewPanel({
  profileName,
  sharePublicKey,
  groupPublicKey,
  relays,
  actionLabel,
  onAccept,
  title = 'Review Device Profile',
  description = 'Confirm the local profile details before this browser initializes the signer and prepares remote bfonboard packages.',
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
  const rows = [
    { label: 'Device Label', value: profileName },
    { label: 'Share Public Key', value: shortKey(sharePublicKey) },
    { label: 'Group Public Key', value: shortKey(groupPublicKey) },
    { label: 'Relays', value: `${relays.length} connected` },
  ];

  return (
    <div className="igloo-create-review-form">
      <section className="igloo-create-review-panel">
        <header>
          <span>Device Review</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </header>
        <div className="igloo-create-review-summary">
          {rows.map((row) => (
            <div className="igloo-create-review-row" key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </section>
      <Button type="button" className="igloo-create-primary-action" onClick={onAccept}>
        {actionLabel}
      </Button>
    </div>
  );
}

function shortKey(value: string) {
  if (!value || value === 'n/a') return 'n/a';
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}

function resultLabel(result?: SharedDistributionResult) {
  if (!result) return 'Package not created';
  if (result.kind === 'completed') return `Marked distributed`;
  if (result.kind === 'handoff_pending') return `Waiting for handoff`;
  return `Ready to distribute`;
}

function packagePreview(result?: SharedDistributionResult) {
  if (!result?.packageText) return 'Waiting for package password';
  return `${result.packageText.slice(0, 24)}...`;
}

function passwordPreview(value: string) {
  return value ? '••••••••' : 'Enter password';
}

export function CreateFlowDistributionCompletion({
  shares,
  results,
  onFinish,
}: {
  shares: SharedGeneratedShare[];
  results: Record<number, SharedDistributionResult>;
  onFinish: () => void;
}) {
  return (
    <div className="igloo-create-distribution-completion">
      <section className="igloo-create-completion-status">
        <span>Distribution Status</span>
        {shares.map((share) => {
          const result = results[share.member_idx];
          return (
            <div className="igloo-create-completion-row" key={share.member_idx}>
              <div>
                <Check size={16} aria-hidden="true" />
                <span>
                  <strong>{share.name} · Index {share.member_idx}</strong>
                  <small>{result?.label ?? share.name}</small>
                </span>
              </div>
              <em>{result?.kind === 'completed' ? 'Marked distributed' : 'Completed'}</em>
            </div>
          );
        })}
      </section>
      <section className="igloo-create-completion-callout">
        <strong>All remote packages complete</strong>
        <p>{shares.length} of {shares.length} remote bfonboard packages are complete. Handoff is accounted for.</p>
      </section>
      <Button type="button" className="igloo-create-primary-action" onClick={onFinish}>
        Finish Distribution
      </Button>
    </div>
  );
}

function CreateFlowDistributionCard({
  share,
  draft,
  result,
  onChangeDraft,
  onDistribute,
}: {
  share: SharedGeneratedShare;
  draft: SharedDistributionDraft;
  result?: SharedDistributionResult;
  onChangeDraft: (
    memberIdx: number,
    field: keyof SharedDistributionDraft,
    value: string,
  ) => void;
  onDistribute: (memberIdx: number, kind: SharedDistributionAction) => void;
}) {
  const hasPackage = Boolean(result);
  const isComplete = result?.kind === 'completed';
  const statusClass = hasPackage ? 'igloo-create-distribution-status is-ready' : 'igloo-create-distribution-status';

  return (
    <section className={hasPackage ? 'igloo-create-distribution-card is-ready' : 'igloo-create-distribution-card'}>
      <header>
        <div>
          <h3>{share.name} · Index {share.member_idx}</h3>
          <p>{draft.label || share.name}</p>
        </div>
        <span className={statusClass}>
          {hasPackage ? <Check size={12} aria-hidden="true" /> : null}
          {resultLabel(result)}
        </span>
      </header>

      <label className="igloo-create-distribution-label">
        <span>Share label</span>
        <input
          aria-label="Share label"
          value={draft.label}
          onChange={(event) => onChangeDraft(share.member_idx, 'label', event.target.value)}
        />
      </label>

      <div className="igloo-create-package-preview">
        <span>bfonboard Package</span>
        <code>{packagePreview(result)}</code>
      </div>

      <div className="igloo-create-package-password">
        <label>
          <span>Package Password</span>
          <input
            aria-label="Package password"
            type="password"
            value={draft.packagePassword}
            onChange={(event) => onChangeDraft(share.member_idx, 'packagePassword', event.target.value)}
            placeholder="Enter password"
          />
        </label>
        <label>
          <span>Confirm Password</span>
          <input
            aria-label="Confirm password"
            type="password"
            value={draft.confirmPassword}
            onChange={(event) => onChangeDraft(share.member_idx, 'confirmPassword', event.target.value)}
            placeholder="Confirm password"
          />
        </label>
        <div className="igloo-create-password-preview" aria-hidden="true">
          {passwordPreview(draft.packagePassword)}
        </div>
      </div>

      {!hasPackage ? (
        <>
          <Button type="button" className="igloo-create-package-action" onClick={() => onDistribute(share.member_idx, 'prepare')}>
            <KeyRound size={14} aria-hidden="true" />
            Create package
          </Button>
          <p className="igloo-create-distribution-help">Copy, QR, and manual mark unlock after the password creates this package.</p>
        </>
      ) : (
        <div className="igloo-create-distribution-actions">
          <Button type="button" size="sm" variant="secondary" onClick={() => onDistribute(share.member_idx, 'copy')}>
            <Copy size={13} aria-hidden="true" />
            Copy package
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => onDistribute(share.member_idx, 'qr')}>
            <QrCode size={13} aria-hidden="true" />
            QR code
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => onDistribute(share.member_idx, 'save')}>
            Save file
          </Button>
          <Button type="button" size="sm" variant="secondary" disabled={isComplete} onClick={() => onDistribute(share.member_idx, 'mark')}>
            <Check size={13} aria-hidden="true" />
            {isComplete ? 'Distributed' : 'Mark distributed'}
          </Button>
        </div>
      )}
    </section>
  );
}

export function CreateFlowDistributionCards({
  shares,
  drafts,
  results,
  onChangeDraft,
  onDistribute,
  onFinish,
  localShare,
  localProfileName = 'Igloo Web',
}: {
  shares: SharedGeneratedShare[];
  drafts: Record<number, SharedDistributionDraft>;
  results: Record<number, SharedDistributionResult>;
  onChangeDraft: (
    memberIdx: number,
    field: keyof SharedDistributionDraft,
    value: string,
  ) => void;
  onDistribute: (memberIdx: number, kind: SharedDistributionAction) => void;
  onFinish: () => void;
  localShare?: SharedGeneratedShare | null;
  localProfileName?: string;
}) {
  const allComplete = shares.length > 0 && shares.every((share) => results[share.member_idx]?.kind === 'completed');
  const orderedItems = [
    ...shares.map((share) => ({ kind: 'remote' as const, share })),
    ...(localShare ? [{ kind: 'local' as const, share: localShare }] : []),
  ].sort((a, b) => a.share.member_idx - b.share.member_idx);

  if (allComplete) {
    return <CreateFlowDistributionCompletion shares={shares} results={results} onFinish={onFinish} />;
  }

  return (
    <div className="igloo-create-distribution-list">
      {orderedItems.map((item) => {
        if (item.kind === 'local') {
          return (
            <section className="igloo-create-local-share-card" key={`local-${item.share.member_idx}`}>
              <header>
                <h3>{item.share.name}</h3>
                <span>Index {item.share.member_idx}</span>
              </header>
              <div>
                <Check size={13} aria-hidden="true" />
                <strong>Saved to {localProfileName}</strong>
              </div>
              <code>Saved securely in this browser</code>
            </section>
          );
        }

        const form = drafts[item.share.member_idx] ?? {
          label: item.share.name,
          packagePassword: '',
          confirmPassword: '',
        };
        const result = results[item.share.member_idx];
        return (
          <CreateFlowDistributionCard
            key={`distribution-${item.share.member_idx}`}
            share={item.share}
            draft={form}
            result={result}
            onChangeDraft={onChangeDraft}
            onDistribute={onDistribute}
          />
        );
      })}
      <Button type="button" className="igloo-create-primary-action" disabled>
        Continue to Completion
      </Button>
    </div>
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
  localShare,
  localProfileName,
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
  onDistribute: (memberIdx: number, kind: SharedDistributionAction) => void;
  onFinish: () => void;
  beforeCards?: React.ReactNode;
  localShare?: SharedGeneratedShare | null;
  localProfileName?: string;
}) {
  const allComplete = shares.length > 0 && shares.every((share) => results[share.member_idx]?.kind === 'completed');

  return (
    <section className="igloo-create-distribution-form">
      {beforeCards}
      {!allComplete ? (
        <>
          <CreateFlowTaskBanner
            kicker={bannerKicker}
            description={bannerDescription}
            points={bannerPoints}
          />
          <div className="igloo-create-distribution-heading">
            <h3>{sectionTitle}</h3>
            <p>{sectionDescription}</p>
          </div>
        </>
      ) : null}
      <CreateFlowDistributionCards
        shares={shares}
        drafts={drafts}
        results={results}
        onChangeDraft={onChangeDraft}
        onDistribute={onDistribute}
        onFinish={onFinish}
        localShare={localShare}
        localProfileName={localProfileName}
      />
    </section>
  );
}

export function OnboardPackageEntry({
  packageText,
  password,
  onPackageTextChange,
  onPasswordChange,
  onConnect,
}: {
  packageText: string;
  password: string;
  onPackageTextChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConnect: () => void;
}) {
  const hasPackage = packageText.trim().startsWith('bfonboard1');

  return (
    <div className="igloo-onboard-form">
      <section className="igloo-onboard-package-section">
        <label className="igloo-onboard-field">
          <span className="igloo-create-label-with-help">
            Onboarding Package
            <HelpCircle size={14} aria-hidden="true" />
          </span>
          <small>Paste a bfonboard1... package or scan its QR code.</small>
          <Textarea
            aria-label="bfonboard"
            value={packageText}
            onChange={(event) => onPackageTextChange(event.target.value)}
            placeholder="bfonboard1..."
          />
        </label>
        <div className="igloo-onboard-scan-row">
          <Button type="button" variant="secondary">
            <QrCode size={15} aria-hidden="true" />
            Scan QR
          </Button>
        </div>
        {hasPackage ? (
          <p className="igloo-onboard-valid-status">Valid package format</p>
        ) : null}
      </section>
      <div className="igloo-onboard-divider" />
      <section className="igloo-onboard-package-section">
        <label className="igloo-onboard-field">
          <span className="igloo-create-label-with-help">
            Package Password
            <HelpCircle size={14} aria-hidden="true" />
          </span>
          <div className="igloo-create-input-shell">
            <input
              aria-label="Package Password"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
            />
            <EyeOff size={16} aria-hidden="true" />
          </div>
        </label>
      </section>
      <Button type="button" className="igloo-create-primary-action" onClick={onConnect}>
        Apply Onboarding Package
      </Button>
    </div>
  );
}

export function OnboardHandshakePanel() {
  return (
    <section className="igloo-onboard-panel igloo-onboard-handshake">
      <span>Handshake</span>
      <h3>Connecting to Inviter</h3>
      <p>The package is being decoded and this browser is negotiating the onboarding handshake with the sponsor device.</p>
      <div className="igloo-onboard-progress" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}

export function OnboardFailedPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="igloo-onboard-form">
      <section className="igloo-onboard-panel igloo-onboard-failed">
        <div className="igloo-onboard-warning-row">
          <AlertTriangle size={16} aria-hidden="true" />
          <div>
            <h3>Package Did Not Apply</h3>
            <p>{message}</p>
          </div>
        </div>
      </section>
      <div className="igloo-onboard-action-row">
        <Button type="button" onClick={onRetry}>
          Retry
        </Button>
        <Button type="button" variant="secondary" onClick={onRetry}>
          Back to Onboarding
        </Button>
      </div>
    </div>
  );
}

export function OnboardCompletePanel({
  preview,
  draft,
  onLabelChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSave,
}: {
  preview: SharedOnboardProfilePreview;
  draft: { label: string; password: string; confirmPassword: string };
  onLabelChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSave: () => void;
}) {
  const rows = [
    { label: 'Device Label', value: preview.label },
    { label: 'Share Public Key', value: shortKey(preview.sharePublicKey) },
    { label: 'Group Public Key', value: shortKey(preview.groupPublicKey) },
    { label: 'Relays', value: `${preview.relays.length} connected` },
  ];

  return (
    <div className="igloo-onboard-form">
      <section className="igloo-onboard-complete-hero">
        <span aria-hidden="true">
          <Check size={22} />
        </span>
        <div>
          <h3>Onboarding Complete</h3>
          <p>Review your configuration and set or confirm a local password before launching the signer.</p>
        </div>
      </section>
      <section className="igloo-onboard-panel">
        <header>
          <span>Device Profile</span>
          <h3>Review Onboarded Profile</h3>
          <p>The onboarding package resolved successfully. Confirm the profile, then save this device locally.</p>
        </header>
        <div className="igloo-create-review-summary">
          {rows.map((row) => (
            <div className="igloo-create-review-row" key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="igloo-onboard-panel">
        <header>
          <span>Local Save</span>
          <h3>Save Device</h3>
          <p>This password encrypts the onboarded profile in this browser.</p>
        </header>
        <label className="igloo-onboard-field">
          <span>Device Name</span>
          <input
            aria-label="Device Name"
            value={draft.label}
            onChange={(event) => onLabelChange(event.target.value)}
          />
        </label>
        <div className="igloo-create-profile-passwords">
          <label>
            <span>Password</span>
            <input
              aria-label="Password"
              type="password"
              value={draft.password}
              onChange={(event) => onPasswordChange(event.target.value)}
            />
          </label>
          <label>
            <span>Confirm Password</span>
            <input
              aria-label="Confirm Password"
              type="password"
              value={draft.confirmPassword}
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
            />
          </label>
        </div>
      </section>
      <Button type="button" className="igloo-create-primary-action" onClick={onSave}>
        Save & Launch Signer
      </Button>
    </div>
  );
}
