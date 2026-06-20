import * as React from 'react';
import { AlertTriangle, Check, Copy, EyeOff, HelpCircle, KeyRound, Loader2, Pencil, Play, QrCode, RefreshCw, RotateCcw, Square, X } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { PasswordField } from '../ui/password-field';
import { StatusDot } from '../ui/status-indicator';
import { Textarea } from '../ui/textarea';
import { CRITICAL_E2E_TEST_IDS } from '../../lib/e2e-test-ids';
import { passwordManagerOptOutProps } from '../../lib/password-manager';

export type SharedCreateFormState = {
  groupName: string;
  threshold: string;
  count: string;
  privateKey?: string;
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

export type SharedDistributionStatus = 'draft' | 'packaged' | 'delivered' | 'saved' | 'onboarded';

export type SharedDistributionResult = {
  status: SharedDistributionStatus;
  label: string;
  packageText?: string;
};

export type SharedDistributionAction = 'prepare' | 'copy' | 'qr' | 'save' | 'mark' | 'cancel' | 'revert';

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

export type SharedPeerPermissionRow = {
  label: string;
  detail?: string;
  enabled: Array<'sign' | 'ecdh' | 'ping' | 'onboard'>;
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
        {points.map((point, index) => {
          const [title, ...detailParts] = point.split('|');
          const detail = detailParts.join('|');
          return (
            <span key={point}>
              <em>{index + 1}</em>
              {detail ? (
                <strong>
                  {title}
                  <small>{detail}</small>
                </strong>
              ) : (
                point
              )}
            </span>
          );
        })}
      </div>
    </section>
  );
}

function CreateActionRow({ onBack, children }: { onBack?: () => void; children: React.ReactNode }) {
  if (!onBack) return <>{children}</>;
  return (
    <div className="igloo-create-action-row">
      <Button type="button" variant="secondary" className="igloo-create-back-action" data-testid={CRITICAL_E2E_TEST_IDS.createBack} onClick={onBack}>
        Go Back
      </Button>
      {children}
    </div>
  );
}

export function CreateFlowGenerateCard({
  groupName,
  threshold,
  count,
  privateKey = '',
  onChangeForm,
  onGenerate,
  onBack,
}: {
  groupName: string;
  threshold: string;
  count: string;
  privateKey?: string;
  onChangeForm: (
    field: 'groupName' | 'threshold' | 'count' | 'privateKey',
    value: string,
  ) => void;
  onGenerate: () => void;
  onBack?: () => void;
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

      <label className="igloo-create-field">
        <span className="igloo-create-label-with-help">
          Existing Private Key (optional)
          <HelpCircle size={14} aria-hidden="true" />
        </span>
        <div className="igloo-create-private-row">
          <div className="igloo-create-input-shell">
            <input
              aria-label="Existing Private Key (optional)"
              value={privateKey}
              onChange={(event) => onChangeForm('privateKey', event.target.value)}
              placeholder="Paste an nsec1... key or leave blank"
            />
            <EyeOff size={16} aria-hidden="true" />
          </div>
        </div>
        <small>Provide an existing key, otherwise a new one will be generated for you in the next step.</small>
      </label>

      <CreateActionRow onBack={onBack}>
        <Button type="button" className="igloo-create-primary-action" data-testid={CRITICAL_E2E_TEST_IDS.createGenerateNext} onClick={onGenerate}>
          Next Step
        </Button>
      </CreateActionRow>
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
  title = 'Rotate Keyset',
  description = 'Select the source profile and add recovery shares for the existing keyset.',
  actionLabel = 'Rotate Keyset',
}: {
  sourceProfileId: string;
  availableProfiles: Array<{ id: string; label: string }>;
  rotationSources: SharedRotationSource[];
  onChangeSourceProfile: (profileId: string) => void;
  onChangeRotationSource: (index: number, field: 'packageText' | 'packagePassword', value: string) => void;
  onAddRotationSource: () => void;
  onRemoveRotationSource: (index: number) => void;
  onRotate: () => void;
  title?: string;
  description?: string;
  actionLabel?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="igloo-stack">
        <label>
          Source Profile
          <select
            data-testid={CRITICAL_E2E_TEST_IDS.rotateSourceProfile}
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
                  {...passwordManagerOptOutProps}
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
            <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.rotateAddSource} onClick={onAddRotationSource}>
              Add bfshare Source
            </Button>
          </div>
        </div>
        <div className="igloo-button-row">
          <Button type="button" size="sm" data-testid={CRITICAL_E2E_TEST_IDS.rotateSubmit} onClick={onRotate}>
            {actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReplaceSharePackageEntry({
  packageText,
  packagePassword,
  onPackageTextChange,
  onPackagePasswordChange,
  onSubmit,
  onScanQr,
  actionLabel = 'Replace Share',
}: {
  packageText: string;
  packagePassword: string;
  onPackageTextChange: (value: string) => void;
  onPackagePasswordChange: (value: string) => void;
  onSubmit: () => void;
  onScanQr?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="igloo-replace-share-entry">
      <section className="igloo-replace-package" aria-label="Onboarding Package">
        <label className="igloo-replace-field">
          <span className="igloo-create-label-with-help">
            Onboarding Package
            <HelpCircle size={14} aria-hidden="true" />
          </span>
          <small>Paste a bfonboard1... package that was produced outside runtime, or scan its QR code.</small>
          <Textarea
            className="igloo-replace-textarea"
            data-testid={CRITICAL_E2E_TEST_IDS.rotationPackageInput}
            value={packageText}
            onChange={(event) => onPackageTextChange(event.target.value)}
            placeholder="Paste bfonboard1..."
          />
        </label>

        {onScanQr ? (
          <Button type="button" size="sm" variant="secondary" className="igloo-replace-scan" onClick={onScanQr}>
            Scan QR
          </Button>
        ) : null}

        <div className="igloo-replace-divider" />

        <label className="igloo-replace-field">
          <span className="igloo-create-label-with-help">
            Package Password
            <HelpCircle size={14} aria-hidden="true" />
          </span>
          <PasswordField
            data-testid={CRITICAL_E2E_TEST_IDS.rotationPasswordInput}
            value={packagePassword}
            onChange={(event) => onPackagePasswordChange(event.target.value)}
          />
        </label>

        <Button
          type="button"
          className="igloo-create-primary-action"
          data-testid={CRITICAL_E2E_TEST_IDS.rotationConnectSubmit}
          onClick={onSubmit}
        >
          {actionLabel}
        </Button>
      </section>
    </div>
  );
}

export function ReplaceShareProgressPanel({
  keysetName,
  memberLabel,
  packageLabel,
  applying = false,
  showHeader = true,
  confirmTestId,
  passphraseField,
  onConfirm,
  onCancel,
}: {
  keysetName: string;
  memberLabel: string;
  packageLabel: string;
  applying?: boolean;
  showHeader?: boolean;
  confirmTestId?: string;
  passphraseField?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <section
      className="igloo-replace-status-flow"
      aria-labelledby={showHeader ? 'replace-share-applying-title' : undefined}
      aria-label={showHeader ? undefined : 'Applying Replacement'}
    >
      {showHeader ? (
        <header>
          <h3 id="replace-share-applying-title">Applying Replacement</h3>
          <p>
            Validating the onboarding package and replacing this device's local share.
            The group public key and Group Profile stay the same.
          </p>
        </header>
      ) : null}

      <ol className="igloo-replace-timeline">
        <ReplaceTimelineStep
          state="complete"
          title="Validated package"
          detail={`${packageLabel} · ${keysetName}`}
        />
        <ReplaceTimelineStep
          state="complete"
          title="Matched Group Profile"
          detail={`${keysetName} · ${memberLabel} replacement`}
        />
        <ReplaceTimelineStep
          state="active"
          title="Replacing local share"
          detail="Refreshing only this device's share public key"
        />
        <ReplaceTimelineStep state="pending" title="Saving updated local share" />
      </ol>

      <div className="igloo-replace-package-summary">
        Onboarding package: {packageLabel} · {memberLabel}
      </div>

      {passphraseField ? <div className="igloo-replace-passphrase">{passphraseField}</div> : null}

      <div className="igloo-replace-actions">
        {!applying ? (
          <Button
            type="button"
            data-testid={confirmTestId}
            onClick={onConfirm}
            className="igloo-create-primary-action"
          >
            Replace Share
          </Button>
        ) : null}
        <Button type="button" variant="secondary" onClick={onCancel} disabled={applying}>
          Cancel Replacement
        </Button>
      </div>
    </section>
  );
}

export function ReplaceShareFailedPanel({
  message,
  showHeader = true,
  onRetry,
  onBack,
}: {
  message: string;
  showHeader?: boolean;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <section
      className="igloo-replace-status-flow"
      aria-labelledby={showHeader ? 'replace-share-failed-title' : undefined}
      aria-label={showHeader ? undefined : 'Replacement Failed'}
    >
      {showHeader ? (
        <header>
          <h3 id="replace-share-failed-title">Replacement Failed</h3>
          <p>
            The onboarding package could not be applied. Your current local share,
            group public key, and Group Profile were not changed.
          </p>
        </header>
      ) : null}
      <div className="igloo-replace-failure-card">
        <span aria-hidden="true">
          <AlertTriangle size={14} />
        </span>
        <div>
          <strong>Onboarding package did not apply</strong>
          <p>{message}</p>
        </div>
      </div>
      <div className="igloo-button-row">
        <Button type="button" onClick={onRetry}>
          Retry
        </Button>
        <Button type="button" variant="secondary" onClick={onBack}>
          Back to Replace Share
        </Button>
      </div>
    </section>
  );
}

export function ReplaceShareSuccessPanel({
  groupKeyLabel,
  oldShareKeyLabel,
  newShareKeyLabel,
  showHeader = true,
  onReturn,
}: {
  groupKeyLabel: string;
  oldShareKeyLabel: string;
  newShareKeyLabel: string;
  showHeader?: boolean;
  onReturn: () => void;
}) {
  return (
    <section
      className="igloo-replace-status-flow"
      aria-labelledby={showHeader ? 'replace-share-success-title' : undefined}
      aria-label={showHeader ? undefined : 'Share Replaced'}
    >
      {showHeader ? (
        <header>
          <h3 id="replace-share-success-title">Share Replaced</h3>
          <p>Your local share has been replaced. The group public key and Group Profile are unchanged.</p>
        </header>
      ) : null}
      <div className="igloo-replace-success-card">
        <span aria-hidden="true">
          <Check size={14} />
        </span>
        <div>
          <strong>Replacement share is active on this device</strong>
          <p>Group Profile stays the same; only this device's share public key changed.</p>
        </div>
      </div>
      <div className="igloo-replace-summary-card">
        <h4>Replacement Summary</h4>
        <ReplaceSummaryRow label="Group Public Key" value={groupKeyLabel} tag="Unchanged" tone="info" />
        <ReplaceSummaryRow
          label="Share Public Key"
          oldValue={oldShareKeyLabel}
          value={newShareKeyLabel}
          oldTag="Old"
          tag="New"
          tone="success"
        />
        <ReplaceSummaryRow label="Group Profile" value="Unchanged" tone="success" />
      </div>
      <Button type="button" className="igloo-create-primary-action" onClick={onReturn}>
        Return to Signer
      </Button>
    </section>
  );
}

function ReplaceSummaryRow({
  label,
  value,
  oldValue,
  tag,
  oldTag,
  tone,
}: {
  label: string;
  value: string;
  oldValue?: string;
  tag?: string;
  oldTag?: string;
  tone: 'info' | 'success';
}) {
  return (
    <div className="igloo-replace-summary-row">
      <span>{label}</span>
      <div>
        {oldValue ? (
          <div className="igloo-replace-summary-value is-old">
            <code>{oldValue}</code>
            <em>{oldTag}</em>
          </div>
        ) : null}
        <div className={`igloo-replace-summary-value is-${tone}`}>
          <code>{value}</code>
          {tag ? <em>{tag}</em> : null}
        </div>
      </div>
    </div>
  );
}

function ReplaceTimelineStep({
  state,
  title,
  detail,
}: {
  state: 'complete' | 'active' | 'pending';
  title: string;
  detail?: string;
}) {
  return (
    <li className={`is-${state}`}>
      <span aria-hidden="true">
        {state === 'complete' ? <Check size={14} /> : state === 'active' ? '...' : ''}
      </span>
      <div>
        <strong>{title}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
    </li>
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
            {...passwordManagerOptOutProps}
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
            {...passwordManagerOptOutProps}
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

export function CreateFlowShareSelection({
  shares,
  selectedMemberIdx,
  keysetName,
  groupPublicKey,
  actionLabel = 'Next Step',
  onSelectShare,
  onCopyGroupPublicKey,
  onAction,
  onBack,
}: {
  shares: SharedGeneratedShare[];
  selectedMemberIdx: number | null;
  keysetName: string;
  groupPublicKey: string;
  actionLabel?: string;
  onSelectShare: (memberIdx: number) => void;
  onCopyGroupPublicKey: () => void;
  onAction: () => void;
  onBack?: () => void;
}) {
  const selectedShare = shares.find((share) => share.member_idx === selectedMemberIdx) ?? shares[0] ?? null;

  return (
    <div className="igloo-create-profile-form">
      <section className="igloo-create-profile-panel">
        <header>
          <h3>Group Public Key</h3>
          <p>Copy this key when you need to identify the new keyset outside this device.</p>
        </header>
        <div className="igloo-create-profile-summary">
          <div>
            <span>{keysetName}</span>
            <strong>{groupPublicKey}</strong>
          </div>
          <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.selectShareCopyGroupKey} onClick={onCopyGroupPublicKey}>
            <Copy size={13} aria-hidden="true" />
            Copy group public key
          </Button>
        </div>
      </section>

      <section className="igloo-create-profile-panel">
        <header>
          <h3>Choose Local Share</h3>
          <p>One share saves locally; the rest become remote onboarding packages.</p>
        </header>
        <div className="igloo-create-share-list">
          {shares.map((share) => {
            const isSelected = share.member_idx === selectedShare?.member_idx;
            return (
              <button
                type="button"
                key={share.member_idx}
                className={isSelected ? 'igloo-create-share-option is-selected' : 'igloo-create-share-option'}
                data-testid={CRITICAL_E2E_TEST_IDS.selectShareOption}
                data-member-idx={share.member_idx}
                onClick={() => onSelectShare(share.member_idx)}
                aria-pressed={isSelected}
              >
                <span className="igloo-create-share-radio" aria-hidden="true" />
                <span className="igloo-create-share-copy">
                  <strong>{share.name}</strong>
                  <small>{share.share_public_key}</small>
                </span>
                <span className="igloo-create-share-state">
                  {isSelected ? 'Save to this device' : 'Distribute remotely'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <CreateActionRow onBack={onBack}>
        <Button type="button" className="igloo-create-primary-action" data-testid={CRITICAL_E2E_TEST_IDS.selectShareNext} onClick={onAction}>
          {actionLabel}
        </Button>
      </CreateActionRow>
    </div>
  );
}

export type RelayPingFn = (url: string) => Promise<{ latencyMs?: number; error?: string }>;

type RelayPingState = { status: 'idle' | 'pinging' | 'ok' | 'failed'; latencyMs?: number };

function RelayList({
  relays,
  onChange,
  onPing,
  readOnly = false,
}: {
  relays: string[];
  onChange: (relays: string[]) => void;
  onPing?: RelayPingFn;
  readOnly?: boolean;
}) {
  const [pings, setPings] = React.useState<Record<string, RelayPingState>>({});
  const [draft, setDraft] = React.useState('');

  const runPing = React.useCallback(
    async (url: string) => {
      if (!onPing) return;
      setPings((current) => ({ ...current, [url]: { status: 'pinging' } }));
      const result = await onPing(url);
      setPings((current) => ({
        ...current,
        [url]:
          typeof result.latencyMs === 'number'
            ? { status: 'ok', latencyMs: result.latencyMs }
            : { status: 'failed' },
      }));
    },
    [onPing],
  );

  // Auto-ping relays that don't yet have a recorded result (initial mount + new adds).
  React.useEffect(() => {
    for (const url of relays) {
      if (!pings[url]) void runPing(url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relays]);

  function addRelay() {
    const next = draft.trim();
    if (!next || relays.includes(next)) {
      setDraft('');
      return;
    }
    onChange([...relays, next]);
    setDraft('');
  }

  return (
    <div className="igloo-create-relay-list" data-testid={CRITICAL_E2E_TEST_IDS.relayList}>
      {relays.map((relay) => {
        const ping = pings[relay];
        const status = ping?.status ?? 'idle';
        const dotState = status === 'ok' ? 'online' : status === 'failed' ? 'offline' : status === 'pinging' ? 'warning' : 'idle';
        return (
          <div className="igloo-create-relay-row" key={relay} data-testid={CRITICAL_E2E_TEST_IDS.relayRow} data-relay-url={relay}>
            <span className="igloo-create-relay-url">{relay}</span>
            <span className="igloo-create-relay-status" aria-label={`Status: ${status}`}>
              {status === 'pinging' ? (
                <Loader2 size={14} aria-hidden="true" className="igloo-spin" />
              ) : (
                <StatusDot state={dotState} />
              )}
            </span>
            <span className="igloo-create-relay-ping">{ping?.latencyMs != null ? `${ping.latencyMs}ms` : '---'}</span>
            <button
              type="button"
              className="igloo-create-relay-icon"
              aria-label={`Ping ${relay}`}
              onClick={() => void runPing(relay)}
              disabled={!onPing || status === 'pinging'}
            >
              <RefreshCw size={14} aria-hidden="true" />
            </button>
            {readOnly ? null : (
              <button
                type="button"
                className="igloo-create-relay-icon igloo-create-relay-remove"
                aria-label={`Remove ${relay}`}
                onClick={() => onChange(relays.filter((entry) => entry !== relay))}
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        );
      })}
      {readOnly ? null : (
        <div className="igloo-create-relay-add">
          <input
            aria-label="Add relay"
            data-testid={CRITICAL_E2E_TEST_IDS.relayAddInput}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addRelay();
              }
            }}
            placeholder="wss://relay.example.com"
          />
          <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.relayAddSubmit} onClick={addRelay}>
            Add Relay
          </Button>
        </div>
      )}
    </div>
  );
}

export function CreateFlowProfileSetup({
  draft,
  actionLabel,
  onLabelChange,
  onPrimarySecretChange,
  onSecondarySecretChange,
  onRelaysChange,
  onPingRelay,
  onAction,
  onBack,
  lockIdentity = false,
  lockName = lockIdentity,
}: {
  draft: SharedLocalSaveDraft;
  actionLabel: string;
  onLabelChange: (value: string) => void;
  onPrimarySecretChange: (value: string) => void;
  onSecondarySecretChange: (value: string) => void;
  onRelaysChange: (relays: string[]) => void;
  onPingRelay?: RelayPingFn;
  onAction: () => void;
  onBack?: () => void;
  lockIdentity?: boolean;
  // Whether the device name is read-only. Defaults to lockIdentity so existing
  // callers are unchanged; the onboard flow opts out so the recipient can name
  // their own device while the keyset relays stay locked.
  lockName?: boolean;
}) {
  const relayRows = draft.relayUrls
    .split(/\r?\n/)
    .map((relay) => relay.trim())
    .filter(Boolean);

  return (
    <div className="igloo-create-profile-form">
      <label className="igloo-create-profile-field">
        <span>Profile Name</span>
        <small>A name for this profile to identify it in the peer list.</small>
        <input
          aria-label="Device Profile Name"
          data-testid={CRITICAL_E2E_TEST_IDS.saveProfileName}
          value={draft.label}
          onChange={(event) => onLabelChange(event.target.value)}
          readOnly={lockName}
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
            <PasswordField
              aria-label="Device Password"
              data-testid={CRITICAL_E2E_TEST_IDS.saveProfilePassword}
              value={draft.primarySecret}
              onChange={(event) => onPrimarySecretChange(event.target.value)}
            />
          </label>
          <label>
            <span>Confirm Password</span>
            <PasswordField
              aria-label="Confirm Password"
              data-testid={CRITICAL_E2E_TEST_IDS.saveProfileConfirm}
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
        <RelayList
          relays={relayRows}
          onChange={onRelaysChange}
          onPing={onPingRelay}
          readOnly={lockIdentity}
        />
      </section>

      <CreateActionRow onBack={onBack}>
        <Button type="button" className="igloo-create-primary-action" data-testid={CRITICAL_E2E_TEST_IDS.saveProfileNext} onClick={onAction}>
          {actionLabel}
        </Button>
      </CreateActionRow>
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

function statusLabel(status: SharedDistributionStatus) {
  switch (status) {
    case 'packaged':
      return 'Packaged';
    case 'delivered':
      return 'Delivered';
    case 'saved':
      return 'Saved';
    case 'onboarded':
      return 'Onboarded';
    default:
      return 'Draft';
  }
}

function packagePreview(result?: SharedDistributionResult) {
  if (!result?.packageText) return 'Waiting for package password';
  return `${result.packageText.slice(0, 24)}...`;
}

export type SharedDistributionPermission = 'sign' | 'ecdh' | 'ping' | 'onboard';

function CreatePermissionToggles({
  share,
  enabled,
  onTogglePermission,
}: {
  share: SharedGeneratedShare;
  enabled: SharedDistributionPermission[];
  onTogglePermission?: (memberIdx: number, permission: SharedDistributionPermission, enabled: boolean) => void;
}) {
  return (
    <div className="igloo-create-peer-permission-row">
      <div>
        <strong>Permissions</strong>
      </div>
      <div aria-label={`${share.name} permissions`}>
        {(['sign', 'ecdh', 'ping', 'onboard'] as const).map((permission) => {
          const isEnabled = enabled.includes(permission);
          return (
            <button
              type="button"
              key={permission}
              className={isEnabled ? `is-${permission}` : 'is-disabled'}
              aria-pressed={isEnabled}
              onClick={() => onTogglePermission?.(share.member_idx, permission, !isEnabled)}
            >
              {permission.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OnboardingClientCard({
  running,
  relayCount,
  peerCount,
  signerPubkey,
  onStart,
  onStop,
}: {
  running: boolean;
  relayCount: number;
  peerCount?: number;
  signerPubkey?: string;
  onStart: () => void;
  onStop: () => void;
}) {
  const metaParts = [`${relayCount} ${relayCount === 1 ? 'relay' : 'relays'}`];
  if (typeof peerCount === 'number') {
    metaParts.push(`${peerCount} ${peerCount === 1 ? 'peer' : 'peers'}`);
  }
  if (signerPubkey) {
    metaParts.push(shortKey(signerPubkey));
  }

  return (
    <section className={running ? 'igloo-create-client-card is-running' : 'igloo-create-client-card'}>
      <div className="igloo-create-client-info">
        <header>
          <StatusDot state={running ? 'online' : 'offline'} />
          <strong>Onboarding Client</strong>
          <span className="igloo-create-client-state">{running ? 'Running' : 'Stopped'}</span>
        </header>
        <p>{metaParts.join(' · ')}</p>
      </div>
      {running ? (
        <Button type="button" size="sm" variant="secondary" onClick={onStop}>
          <Square size={13} aria-hidden="true" />
          Stop
        </Button>
      ) : (
        <Button type="button" size="sm" onClick={onStart}>
          <Play size={13} aria-hidden="true" />
          Start
        </Button>
      )}
    </section>
  );
}

function CreateFlowDistributionCard({
  share,
  draft,
  result,
  permissions,
  onTogglePermission,
  onChangeDraft,
  onDistribute,
}: {
  share: SharedGeneratedShare;
  draft: SharedDistributionDraft;
  result?: SharedDistributionResult;
  permissions?: SharedDistributionPermission[];
  onTogglePermission?: (memberIdx: number, permission: SharedDistributionPermission, enabled: boolean) => void;
  onChangeDraft: (
    memberIdx: number,
    field: keyof SharedDistributionDraft,
    value: string,
  ) => void;
  onDistribute: (memberIdx: number, kind: SharedDistributionAction) => void;
}) {
  const status: SharedDistributionStatus = result?.status ?? 'draft';
  const isDraft = status === 'draft';
  const isPackaged = status === 'packaged';
  const isCompleted = status === 'delivered' || status === 'saved' || status === 'onboarded';
  const enabledPermissions = permissions ?? ['sign', 'ecdh', 'ping', 'onboard'];

  const statusClass =
    status === 'onboarded'
      ? 'igloo-create-distribution-status is-onboarded'
      : isCompleted || isPackaged
        ? 'igloo-create-distribution-status is-ready'
        : 'igloo-create-distribution-status';
  const cardClass =
    status === 'onboarded'
      ? 'igloo-create-distribution-card is-onboarded'
      : isCompleted || isPackaged
        ? 'igloo-create-distribution-card is-ready'
        : 'igloo-create-distribution-card';

  return (
    <section
      className={cardClass}
      data-testid={CRITICAL_E2E_TEST_IDS.distributionCard}
      data-member-idx={share.member_idx}
      data-status={status}
    >
      <header>
        <div>
          <h3>{share.name}</h3>
        </div>
        <span className={statusClass}>
          {isCompleted || isPackaged ? <Check size={12} aria-hidden="true" /> : null}
          {statusLabel(status)}
        </span>
      </header>

      <CreatePermissionToggles
        share={share}
        enabled={enabledPermissions}
        onTogglePermission={onTogglePermission}
      />

      {isDraft ? (
        <>
          <div className="igloo-create-package-password">
            <label>
              <span>Package Password</span>
              <input
                aria-label="Package password"
                data-testid={CRITICAL_E2E_TEST_IDS.distributionPackagePassword}
                type="password"
                {...passwordManagerOptOutProps}
                value={draft.packagePassword}
                onChange={(event) => {
                  onChangeDraft(share.member_idx, 'packagePassword', event.target.value);
                  onChangeDraft(share.member_idx, 'confirmPassword', event.target.value);
                }}
                placeholder="Enter password"
              />
            </label>
          </div>
          <Button type="button" className="igloo-create-package-action" data-testid={CRITICAL_E2E_TEST_IDS.distributionPrepare} onClick={() => onDistribute(share.member_idx, 'prepare')}>
            <KeyRound size={14} aria-hidden="true" />
            Create Package
          </Button>
        </>
      ) : null}

      {isPackaged ? (
        <>
          <div className="igloo-create-package-preview">
            <code>{packagePreview(result)}</code>
          </div>
          <div className="igloo-create-distribution-actions">
            <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.distributionCopy} onClick={() => onDistribute(share.member_idx, 'copy')}>
              <Copy size={13} aria-hidden="true" />
              Copy
            </Button>
            <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.distributionSave} onClick={() => onDistribute(share.member_idx, 'save')}>
              Save
            </Button>
            <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.distributionQr} onClick={() => onDistribute(share.member_idx, 'qr')}>
              <QrCode size={13} aria-hidden="true" />
              QR code
            </Button>
          </div>
          <div className="igloo-create-distribution-actions">
            <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.distributionCancel} onClick={() => onDistribute(share.member_idx, 'cancel')}>
              <X size={13} aria-hidden="true" />
              Cancel
            </Button>
            <Button type="button" size="sm" data-testid={CRITICAL_E2E_TEST_IDS.distributionMark} onClick={() => onDistribute(share.member_idx, 'mark')}>
              <Check size={13} aria-hidden="true" />
              Mark Delivered
            </Button>
          </div>
        </>
      ) : null}

      {isCompleted ? (
        <div className="igloo-create-distribution-actions">
          <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.distributionRevert} onClick={() => onDistribute(share.member_idx, 'revert')}>
            <RotateCcw size={13} aria-hidden="true" />
            Revert
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export function CreateFlowDistributionCards({
  shares,
  drafts,
  results,
  permissions = {},
  onTogglePermission,
  onChangeDraft,
  onDistribute,
  onFinish,
  onBack,
  finishLabel = 'Finish Setup',
}: {
  shares: SharedGeneratedShare[];
  drafts: Record<number, SharedDistributionDraft>;
  results: Record<number, SharedDistributionResult>;
  permissions?: Record<number, SharedDistributionPermission[]>;
  onTogglePermission?: (memberIdx: number, permission: SharedDistributionPermission, enabled: boolean) => void;
  onChangeDraft: (
    memberIdx: number,
    field: keyof SharedDistributionDraft,
    value: string,
  ) => void;
  onDistribute: (memberIdx: number, kind: SharedDistributionAction) => void;
  onFinish: () => void;
  onBack?: () => void;
  finishLabel?: string;
}) {
  const orderedShares = [...shares].sort((a, b) => a.member_idx - b.member_idx);

  return (
    <div className="igloo-create-distribution-list">
      {orderedShares.map((share) => {
        const form = drafts[share.member_idx] ?? {
          label: share.name,
          packagePassword: '',
          confirmPassword: '',
        };
        const result = results[share.member_idx];
        return (
          <CreateFlowDistributionCard
            key={`distribution-${share.member_idx}`}
            share={share}
            draft={form}
            result={result}
            permissions={permissions[share.member_idx]}
            onTogglePermission={onTogglePermission}
            onChangeDraft={onChangeDraft}
            onDistribute={onDistribute}
          />
        );
      })}
      <CreateActionRow onBack={onBack}>
        <Button type="button" className="igloo-create-primary-action" data-testid={CRITICAL_E2E_TEST_IDS.distributionFinish} onClick={onFinish}>
          {finishLabel}
        </Button>
      </CreateActionRow>
    </div>
  );
}

export function CreateFlowDistributionSection({
  sectionTitle,
  sectionDescription,
  shares,
  drafts,
  results,
  permissions,
  onTogglePermission,
  onChangeDraft,
  onDistribute,
  onFinish,
  onBack,
  finishLabel,
  beforeCards,
}: {
  bannerKicker?: string;
  bannerDescription?: React.ReactNode;
  bannerPoints?: string[];
  sectionTitle: string;
  sectionDescription: string;
  shares: SharedGeneratedShare[];
  drafts: Record<number, SharedDistributionDraft>;
  results: Record<number, SharedDistributionResult>;
  permissions?: Record<number, SharedDistributionPermission[]>;
  onTogglePermission?: (memberIdx: number, permission: SharedDistributionPermission, enabled: boolean) => void;
  onChangeDraft: (
    memberIdx: number,
    field: keyof SharedDistributionDraft,
    value: string,
  ) => void;
  onDistribute: (memberIdx: number, kind: SharedDistributionAction) => void;
  onFinish: () => void;
  onBack?: () => void;
  finishLabel?: string;
  beforeCards?: React.ReactNode;
}) {
  return (
    <section className="igloo-create-distribution-form">
      {beforeCards}
      <div className="igloo-create-distribution-heading">
        <h3>{sectionTitle}</h3>
        <p>{sectionDescription}</p>
      </div>
      <CreateFlowDistributionCards
        shares={shares}
        drafts={drafts}
        results={results}
        permissions={permissions}
        onTogglePermission={onTogglePermission}
        onChangeDraft={onChangeDraft}
        onDistribute={onDistribute}
        onFinish={onFinish}
        onBack={onBack}
        finishLabel={finishLabel}
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
  actionLabel = 'Apply Onboarding Package',
}: {
  packageText: string;
  password: string;
  onPackageTextChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConnect: () => void;
  actionLabel?: string;
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
            data-testid={CRITICAL_E2E_TEST_IDS.onboardPackageInput}
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
            Encryption Password
            <HelpCircle size={14} aria-hidden="true" />
          </span>
          <PasswordField
            aria-label="Encryption Password"
            data-testid={CRITICAL_E2E_TEST_IDS.onboardPasswordInput}
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
        </label>
      </section>
      <Button type="button" className="igloo-create-primary-action" data-testid={CRITICAL_E2E_TEST_IDS.onboardConnectSubmit} onClick={onConnect}>
        {actionLabel}
      </Button>
    </div>
  );
}

export function ImportProfileEntry({
  profileString,
  password,
  onProfileStringChange,
  onPasswordChange,
  onNext,
  actionLabel = 'Next Step',
}: {
  profileString: string;
  password: string;
  onProfileStringChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onNext: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="igloo-onboard-form">
      <section className="igloo-onboard-package-section">
        <label className="igloo-onboard-field">
          <span className="igloo-create-label-with-help">
            Profile Backup
            <HelpCircle size={14} aria-hidden="true" />
          </span>
          <small>Paste the encrypted profile backup string.</small>
          <Textarea
            aria-label="Profile Backup"
            data-testid={CRITICAL_E2E_TEST_IDS.importProfileInput}
            value={profileString}
            onChange={(event) => onProfileStringChange(event.target.value)}
            placeholder="bfprofile1..."
          />
        </label>
      </section>
      <div className="igloo-onboard-divider" />
      <section className="igloo-onboard-package-section">
        <label className="igloo-onboard-field">
          <span className="igloo-create-label-with-help">
            Backup Password
            <HelpCircle size={14} aria-hidden="true" />
          </span>
          <PasswordField
            aria-label="Backup Password"
            data-testid={CRITICAL_E2E_TEST_IDS.importPasswordInput}
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
        </label>
      </section>
      <Button type="button" className="igloo-create-primary-action" data-testid={CRITICAL_E2E_TEST_IDS.importNext} onClick={onNext}>
        {actionLabel}
      </Button>
    </div>
  );
}

export type SharedRecoverSource = { packageText: string; packagePassword: string };

export function RecoverCollectSharesPanel({
  deviceShareLabel = 'Share #1 (this device)',
  sources,
  threshold,
  collectedCount,
  onChangeSource,
  onAddSource,
  onRemoveSource,
  onNext,
  actionLabel = 'Next Step',
}: {
  deviceShareLabel?: string;
  sources: SharedRecoverSource[];
  threshold: number;
  collectedCount: number;
  onChangeSource: (index: number, field: 'packageText' | 'packagePassword', value: string) => void;
  onAddSource: () => void;
  onRemoveSource: (index: number) => void;
  onNext: () => void;
  actionLabel?: string;
}) {
  const pct = threshold > 0 ? Math.min(100, Math.round((collectedCount / threshold) * 100)) : 0;
  return (
    <div className="igloo-recover-collect">
      <div className="igloo-recover-device-row">
        <strong>{deviceShareLabel}</strong>
        <span className="igloo-recover-validated">
          <Check size={14} aria-hidden="true" />
          Validated
        </span>
      </div>
      <div className="igloo-stack">
        {sources.map((source, index) => (
          <div key={`recover-source-${index}`} className="igloo-generated-card">
            <header>
              <strong>Share #{index + 2}</strong>
            </header>
            <label>
              Source Package
              <Textarea
                className="min-h-[96px]"
                value={source.packageText}
                onChange={(event) => onChangeSource(index, 'packageText', event.target.value)}
                placeholder="Paste bfprofile or bfshare from another device or backup..."
              />
            </label>
            <label>
              Package Password
              <PasswordField
                value={source.packagePassword}
                onChange={(event) => onChangeSource(index, 'packagePassword', event.target.value)}
              />
            </label>
            <div className="igloo-button-row">
              <Button type="button" size="sm" variant="secondary" onClick={() => onRemoveSource(index)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
        <div className="igloo-button-row">
          <Button type="button" size="sm" variant="secondary" onClick={onAddSource}>
            Add Source
          </Button>
        </div>
      </div>
      <div className="igloo-recover-meter">
        <div className="igloo-recover-meter-head">
          <span>Shares Collected</span>
          <span>{collectedCount} of {threshold} required</span>
        </div>
        <div className="igloo-recover-meter-track">
          <div className="igloo-recover-meter-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <p className="igloo-recover-helper">
        Old devices do not need to be online. Provide enough source packages and passwords to meet the threshold.
      </p>
      <Button type="button" className="igloo-create-primary-action" onClick={onNext}>
        {actionLabel}
      </Button>
    </div>
  );
}

type OnboardTimelineStep = { key: OnboardTimelineStepKey; label: string; detail?: string };
export type OnboardTimelineStepKey = 'connect' | 'negotiate' | 'finish';

function buildOnboardSteps(keysetName: string, thresholdLabel: string): OnboardTimelineStep[] {
  return [
    { key: 'connect', label: 'Connect to Relays', detail: `${keysetName} (${thresholdLabel})` },
    { key: 'negotiate', label: 'Negotiate with Peer' },
    { key: 'finish', label: 'Finish Onboarding' },
  ];
}

function OnboardTimeline({
  steps,
  activeStep,
  failed = false,
}: {
  steps: OnboardTimelineStep[];
  activeStep: OnboardTimelineStepKey;
  failed?: boolean;
}) {
  const activeIndex = Math.max(0, steps.findIndex((step) => step.key === activeStep));
  return (
    <ol className={failed ? 'igloo-onboard-timeline is-failed' : 'igloo-onboard-timeline'}>
      {steps.map((step, index) => {
        const state =
          index < activeIndex
            ? 'is-complete'
            : index === activeIndex
              ? failed
                ? 'is-failed'
                : 'is-active'
              : 'is-waiting';
        return (
          <li className={state} key={step.key}>
            <span aria-hidden="true">
              {index < activeIndex ? (
                <Check size={14} />
              ) : index === activeIndex ? (
                failed ? <X size={14} /> : '...'
              ) : (
                ''
              )}
            </span>
            <div>
              <strong>{step.label}</strong>
              {step.detail ? <small>{step.detail}</small> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function OnboardHandshakePanel({
  packageText = '',
  keysetName = 'My Signing Key',
  thresholdLabel = '2/3',
  activeStep = 'negotiate',
  onCancel,
  title = 'Onboard Device',
}: {
  packageText?: string;
  keysetName?: string;
  thresholdLabel?: string;
  activeStep?: OnboardTimelineStepKey;
  onCancel?: () => void;
  title?: string;
}) {
  const compactPackage = packageText ? packageText.slice(0, 24) : 'bfonboard1...';
  return (
    <div className="igloo-onboard-handshake-flow">
      <header>
        <h3>{title}</h3>
        <p>Validating the onboarding package and saving this device's share.</p>
      </header>
      <OnboardTimeline steps={buildOnboardSteps(keysetName, thresholdLabel)} activeStep={activeStep} />
      <div className="igloo-onboard-package-summary">
        Onboarding package: {compactPackage} · Share #0
      </div>
      <Button type="button" variant="secondary" onClick={onCancel}>
        Cancel Onboarding
      </Button>
    </div>
  );
}

export function WarningCard({ title, message }: { title: string; message: React.ReactNode }) {
  return (
    <section className="igloo-onboard-panel igloo-onboard-failed">
      <div className="igloo-onboard-warning-row">
        <AlertTriangle size={16} aria-hidden="true" />
        <div>
          <h3>{title}</h3>
          <p>{message}</p>
        </div>
      </div>
    </section>
  );
}

export function OnboardFailedPanel({
  keysetName = 'My Signing Key',
  thresholdLabel = '2/3',
  activeStep = 'negotiate',
  message = 'Check the package, password, and group details, then retry onboarding.',
  onRetry,
}: {
  keysetName?: string;
  thresholdLabel?: string;
  activeStep?: OnboardTimelineStepKey;
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="igloo-onboard-form">
      <OnboardTimeline steps={buildOnboardSteps(keysetName, thresholdLabel)} activeStep={activeStep} failed />
      <WarningCard title="Package Did Not Apply" message={message} />
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
  groupName = 'My Signing Key',
  thresholdLabel = '2 of 3',
  shareLabel = '#0 (Index 0)',
  peerPolicyCount = 3,
  draft,
  onLabelChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSave,
}: {
  preview: SharedOnboardProfilePreview;
  groupName?: string;
  thresholdLabel?: string;
  shareLabel?: string;
  peerPolicyCount?: number;
  draft: { label: string; password: string; confirmPassword: string };
  onLabelChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSave: () => void;
}) {
  const groupRows = [
    { label: 'Keyset Name', value: groupName },
    { label: 'Threshold', value: thresholdLabel },
  ];
  const deviceRows = [
    { label: 'Share Key', value: shareLabel },
    { label: 'Relays', value: `${preview.relays.length} connected` },
    { label: 'Peer Policies', value: `${peerPolicyCount} total` },
  ];

  return (
    <div className="igloo-onboard-form">
      <section className="igloo-onboard-complete-hero">
        <span aria-hidden="true">
          <Check size={22} />
        </span>
        <div>
          <h3>Onboarding Complete</h3>
          <p>You've successfully applied the onboarding package. Review your configuration and set or confirm a local password before launching the signer.</p>
        </div>
      </section>
      <section className="igloo-onboard-panel igloo-onboard-summary-card">
        <span>Group Profile</span>
        <div className="igloo-create-review-summary">
          {groupRows.map((row) => (
            <div className="igloo-create-review-row" key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="igloo-onboard-panel igloo-onboard-summary-card">
        <span>Device Profile</span>
        <div className="igloo-create-review-summary">
          {deviceRows.map((row) => (
            <div className="igloo-create-review-row" key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="igloo-onboard-panel">
        <label className="igloo-onboard-field">
          <span>Device Name</span>
          <input
            aria-label="Device Name"
            data-testid={CRITICAL_E2E_TEST_IDS.onboardSaveName}
            value={draft.label}
            onChange={(event) => onLabelChange(event.target.value)}
          />
        </label>
      </section>
      <section className="igloo-onboard-password-section">
        <header>
          <h3>Profile Password <HelpCircle size={13} aria-hidden="true" /></h3>
          <p>This password encrypts your profile on this device. You'll need it each time you unlock it.</p>
        </header>
        <div className="igloo-create-profile-passwords">
          <label>
            <span>Password</span>
            <input
              aria-label="Password"
              data-testid={CRITICAL_E2E_TEST_IDS.onboardSavePassword}
              type="password"
              {...passwordManagerOptOutProps}
              value={draft.password}
              onChange={(event) => onPasswordChange(event.target.value)}
            />
          </label>
          <label>
            <span>Confirm Password</span>
            <input
              aria-label="Confirm Password"
              data-testid={CRITICAL_E2E_TEST_IDS.onboardSaveConfirm}
              type="password"
              {...passwordManagerOptOutProps}
              value={draft.confirmPassword}
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
            />
          </label>
        </div>
      </section>
      <Button type="button" className="igloo-create-primary-action" data-testid={CRITICAL_E2E_TEST_IDS.onboardSaveSubmit} onClick={onSave}>
        Save & Launch Signer
      </Button>
    </div>
  );
}
