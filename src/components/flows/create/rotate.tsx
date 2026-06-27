import type * as React from 'react';
import { AlertTriangle, Check, HelpCircle, RotateCcw } from 'lucide-react';

import { Button } from '../../ui/button';
import { PasswordField } from '../../ui/password-field';
import { Textarea } from '../../ui/textarea';
import { CRITICAL_E2E_TEST_IDS } from '../../../lib/e2e-test-ids';
import type { RecoverDeviceShareState, SharedRotationSource } from './types';

const ROTATE_HELP_TEXT = {
  threshold:
    'The minimum number of shares required to sign. Must be at least 2 and no more than the total number of shares.',
  totalShares: 'Specify the total number of shares to create and the required threshold to sign.',
};

export function RotateKeysetPanel({
  sourceProfileId,
  availableProfiles,
  localSourceLabel,
  localSourceState,
  localPassphrase,
  rotationSources,
  threshold = 2,
  newThreshold,
  newCount,
  collectedCount,
  onChangeSourceProfile,
  onLocalPassphraseChange,
  onSubmitLocalPassphrase,
  onChangeRotationSource,
  onChangeNewConfiguration,
  onAddRotationSource,
  onRemoveRotationSource,
  onRotate,
  onBack,
  title,
  description,
  actionLabel = 'Next Step',
  actionBusy = false,
  actionLoadingLabel = 'Rotating...',
  localPassphraseActionBusy = false,
  localPassphraseError = null,
  deviceShareLabel = 'Share #1 (this device)',
  devicePassphrase,
  onChangeDevicePassphrase,
  deviceShareValidated = false,
  onVerifyDevicePassphrase,
}: {
  sourceProfileId: string;
  availableProfiles: Array<{ id: string; label: string }>;
  localSourceLabel?: string;
  localSourceState?: RecoverDeviceShareState;
  localPassphrase?: string;
  rotationSources: SharedRotationSource[];
  threshold?: number;
  newThreshold?: string;
  newCount?: string;
  collectedCount?: number;
  onChangeSourceProfile: (profileId: string) => void;
  onLocalPassphraseChange?: (value: string) => void;
  onSubmitLocalPassphrase?: () => void;
  onChangeRotationSource: (index: number, field: 'packageText' | 'packagePassword', value: string) => void;
  onChangeNewConfiguration?: (field: 'threshold' | 'count', value: string) => void;
  onAddRotationSource: () => void;
  onRemoveRotationSource: (index: number) => void;
  onRotate: () => void;
  onBack?: () => void;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionBusy?: boolean;
  actionLoadingLabel?: string;
  localPassphraseActionBusy?: boolean;
  localPassphraseError?: string | null;
  deviceShareLabel?: string;
  /**
   * When `onChangeDevicePassphrase` is provided, the rotating device's own share
   * is auto-included via this passphrase (so the operator pastes only the other
   * members'). Optional so other hosts (igloo-home) keep the paste-all behavior.
   */
  devicePassphrase?: string;
  onChangeDevicePassphrase?: (value: string) => void;
  /** Whether the device passphrase has been verified to unlock the device share. */
  deviceShareValidated?: boolean;
  /** Verify the entered device passphrase actually unlocks the device share. */
  onVerifyDevicePassphrase?: () => void;
}) {
  const selectedProfileLabel = availableProfiles.find((profile) => profile.id === sourceProfileId)?.label;
  const shouldShowProfileSelector = availableProfiles.length > 1 || !sourceProfileId;
  const changeLocalPassphrase = onLocalPassphraseChange ?? onChangeDevicePassphrase;
  const submitLocalPassphrase = onSubmitLocalPassphrase ?? onVerifyDevicePassphrase;
  const resolvedLocalPassphrase = localPassphrase ?? devicePassphrase ?? '';
  const resolvedLocalSourceLabel = localSourceLabel ?? deviceShareLabel ?? selectedProfileLabel ?? 'This Device Share';
  const effectiveLocalSourceState: RecoverDeviceShareState =
    localSourceState ?? (onChangeDevicePassphrase ? (deviceShareValidated ? 'validated' : 'locked') : 'validated');
  const localReadyCount = effectiveLocalSourceState === 'validated' ? 1 : 0;
  const readyRemoteCount = rotationSources.reduce((count, source, index) => {
    const sourceStatus = rotationSourceStatus(source, `Remote Source #${index + 1}`);
    return sourceStatus.state === 'ready' ? count + 1 : count;
  }, 0);
  const normalizedThreshold = Math.max(1, Math.trunc(threshold));
  const normalizedCollectedCount = Math.max(
    0,
    Math.trunc(collectedCount ?? localReadyCount + readyRemoteCount),
  );
  const resolvedNewThreshold = newThreshold ?? String(normalizedThreshold);
  const resolvedNewCount = newCount ?? String(Math.max(normalizedThreshold, 2));
  const parsedNewThreshold = Number.parseInt(resolvedNewThreshold, 10);
  const parsedNewCount = Number.parseInt(resolvedNewCount, 10);
  const normalizedNewThreshold = Number.isFinite(parsedNewThreshold) ? parsedNewThreshold : 0;
  const normalizedNewCount = Number.isFinite(parsedNewCount) ? parsedNewCount : 0;
  const newShapeValid = normalizedNewThreshold >= 2 && normalizedNewCount >= normalizedNewThreshold;
  const displayedCollectedCount = Math.min(normalizedCollectedCount, normalizedThreshold);
  const progress = Math.min(100, Math.round((displayedCollectedCount / normalizedThreshold) * 100));
  const readyToRotate = normalizedCollectedCount >= normalizedThreshold;
  const canEditNewConfiguration = Boolean(onChangeNewConfiguration) && !actionBusy;
  const newConfigurationSummary = newShapeValid
    ? `Any ${normalizedNewThreshold} of ${normalizedNewCount} shares can sign - total shares must be at least the threshold.`
    : 'Choose at least 2 threshold shares, with total shares greater than or equal to the threshold.';
  const showLocalPassphrase = Boolean(
    resolvedLocalSourceLabel && effectiveLocalSourceState === 'locked' && changeLocalPassphrase,
  );
  const localSourceStatus =
    effectiveLocalSourceState === 'validated'
      ? {
          label: 'Ready',
          detail: 'This device share is unlocked and counts toward the rotation threshold.',
        }
      : {
          label: 'Passphrase required',
          detail:
            'This device share is available but not counted yet. Enter its profile passphrase, or provide enough remote source packages without it.',
        };
  const requiredRemoteSources = Math.max(1, normalizedThreshold - localReadyCount);
  const canAddSource = rotationSources.length < requiredRemoteSources;
  const localPassphraseReady = resolvedLocalPassphrase.trim().length > 0;
  const adjustNewConfiguration = (field: 'threshold' | 'count', direction: -1 | 1) => {
    const currentValue = field === 'threshold' ? normalizedNewThreshold : normalizedNewCount;
    const fallbackValue = field === 'threshold' ? 2 : Math.max(normalizedNewThreshold || 2, 2);
    const nextValue = Math.max(2, (currentValue || fallbackValue) + direction);
    onChangeNewConfiguration?.(field, String(nextValue));
  };
  const collectionStatus = actionBusy
    ? 'Rotating keyset from collected shares...'
    : readyToRotate
      ? newShapeValid
        ? 'Threshold met. Continue to select the local share for this device.'
        : 'Choose a valid rotated keyset configuration to continue.'
      : showLocalPassphrase
        ? 'Enter this device passphrase or add enough remote source packages to continue.'
        : 'Add another source package and password to continue.';

  return (
    <div className="igloo-recover-collect igloo-rotate-collect">
      {onBack ? (
        <button
          type="button"
          className="igloo-recover-back"
          data-testid={CRITICAL_E2E_TEST_IDS.createBack}
          disabled={actionBusy}
          onClick={onBack}
        >
          ‹ Back
        </button>
      ) : null}
      {title || description ? (
        <header className="igloo-rotate-collect-heading">
          {title ? <h3>{title}</h3> : null}
          {description ? <p>{description}</p> : null}
        </header>
      ) : null}
      {shouldShowProfileSelector ? (
        <label className="igloo-rotate-source-select">
          <span>Source Profile</span>
          <select
            data-testid={CRITICAL_E2E_TEST_IDS.rotateSourceProfile}
            value={sourceProfileId}
            disabled={actionBusy}
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
      ) : null}
      <div
        className="igloo-recover-device-row"
        data-state={effectiveLocalSourceState}
        role="group"
        aria-label={`${resolvedLocalSourceLabel}: ${localSourceStatus.label}`}
      >
        <div className="igloo-recover-device-main">
          <strong>{resolvedLocalSourceLabel}</strong>
          <p>{localSourceStatus.detail}</p>
        </div>
        <span className="igloo-recover-device-badge" data-state={effectiveLocalSourceState}>
          {effectiveLocalSourceState === 'validated' ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <AlertTriangle size={14} aria-hidden="true" />
          )}
          {localSourceStatus.label}
        </span>
        {showLocalPassphrase ? (
          <label className="igloo-rotate-local-passphrase">
            <span>Profile Passphrase</span>
            <div className="igloo-rotate-local-passphrase-row">
              <PasswordField
                data-testid={CRITICAL_E2E_TEST_IDS.rotateLocalPassphrase}
                value={resolvedLocalPassphrase}
                disabled={actionBusy || localPassphraseActionBusy}
                onChange={(event) => changeLocalPassphrase?.(event.target.value)}
                placeholder="Enter this device profile passphrase"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="igloo-rotate-local-passphrase-submit"
                data-testid={CRITICAL_E2E_TEST_IDS.rotateLocalPassphraseSubmit}
                disabled={actionBusy || localPassphraseActionBusy || !localPassphraseReady || !submitLocalPassphrase}
                loading={localPassphraseActionBusy}
                loadingLabel="Unlocking..."
                onClick={submitLocalPassphrase}
              >
                Unlock Share
              </Button>
            </div>
            {localPassphraseError ? (
              <p className="igloo-rotate-local-passphrase-error">{localPassphraseError}</p>
            ) : null}
          </label>
        ) : null}
      </div>
      <div className="igloo-stack">
        {rotationSources.map((source, index) => {
          const sourceLabel = `Remote Source #${index + 1}`;
          const sourceStatus = rotationSourceStatus(source, sourceLabel);
          return (
            <div
              key={`rotation-source-${index}`}
              className="igloo-generated-card igloo-recover-source-card"
              role="group"
              aria-label={`${sourceLabel}: ${sourceStatus.label}`}
            >
              <header>
                <div className="igloo-recover-source-title-row">
                  <strong>{sourceLabel}</strong>
                  {sourceStatus.state !== 'empty' ? (
                    <span className="igloo-recover-source-badge" data-state={sourceStatus.state}>
                      {sourceStatus.label}
                    </span>
                  ) : null}
                </div>
                {sourceStatus.state !== 'empty' ? (
                  <p className="igloo-recover-source-detail" data-state={sourceStatus.state}>
                    {sourceStatus.detail}
                  </p>
                ) : null}
              </header>
              <label>
                Source Package
                <Textarea
                  className="igloo-rotate-source-textarea"
                  value={source.packageText}
                  disabled={actionBusy}
                  onChange={(event) => onChangeRotationSource(index, 'packageText', event.target.value)}
                  placeholder="Paste bfprofile or bfshare from another device or backup..."
                />
              </label>
              <label>
                Package Password
                <PasswordField
                  value={source.packagePassword}
                  disabled={actionBusy}
                  onChange={(event) => onChangeRotationSource(index, 'packagePassword', event.target.value)}
                  placeholder="Enter password to decrypt"
                />
              </label>
              <div className="igloo-button-row">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  aria-label={`Remove ${sourceLabel}`}
                  disabled={actionBusy}
                  onClick={() => onRemoveRotationSource(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          );
        })}
        {canAddSource ? (
          <div className="igloo-button-row">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              data-testid={CRITICAL_E2E_TEST_IDS.rotateAddSource}
              disabled={actionBusy}
              onClick={onAddRotationSource}
            >
              Add Source
            </Button>
          </div>
        ) : null}
      </div>
      <div className="igloo-recover-meter">
        <div className="igloo-recover-meter-head">
          <span>Shares Collected</span>
          <span>
            {displayedCollectedCount} of {normalizedThreshold} required
          </span>
        </div>
        <div
          className="igloo-recover-meter-track"
          role="progressbar"
          aria-label="Rotation threshold progress"
          aria-valuemin={0}
          aria-valuemax={normalizedThreshold}
          aria-valuenow={displayedCollectedCount}
          aria-valuetext={`${displayedCollectedCount} of ${normalizedThreshold} required`}
        >
          <div className="igloo-recover-meter-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <p className="igloo-recover-helper">
        Old devices do not need to be online. Provide enough source packages and passwords to meet the threshold.
      </p>
      <div className="igloo-rotate-new-config" aria-label="New rotation configuration">
        <div className="igloo-onboard-divider" />
        <h4>New Configuration</h4>
        <div className="igloo-create-threshold-row">
          <RotateCounterControl
            label="Threshold"
            value={resolvedNewThreshold}
            helpContent={ROTATE_HELP_TEXT.threshold}
            disabled={!canEditNewConfiguration}
            onDecrease={() => adjustNewConfiguration('threshold', -1)}
            onIncrease={() => adjustNewConfiguration('threshold', 1)}
            onChange={(value) => onChangeNewConfiguration?.('threshold', value)}
          />
          <span className="igloo-create-threshold-divider">/</span>
          <RotateCounterControl
            label="Total Shares"
            value={resolvedNewCount}
            helpContent={ROTATE_HELP_TEXT.totalShares}
            disabled={!canEditNewConfiguration}
            onDecrease={() => adjustNewConfiguration('count', -1)}
            onIncrease={() => adjustNewConfiguration('count', 1)}
            onChange={(value) => onChangeNewConfiguration?.('count', value)}
          />
        </div>
        <p className="igloo-create-threshold-help" data-state={newShapeValid ? 'valid' : 'invalid'}>
          {newConfigurationSummary}
        </p>
      </div>
      <p role="status" aria-live="polite" aria-label="Rotation collection status" className="igloo-recover-status">
        {collectionStatus}
      </p>
      <Button
        type="button"
        className="igloo-create-primary-action"
        data-testid={CRITICAL_E2E_TEST_IDS.rotateSubmit}
        disabled={!readyToRotate || !newShapeValid || actionBusy}
        loading={actionBusy}
        loadingLabel={actionLoadingLabel}
        onClick={onRotate}
      >
        {actionLabel}
      </Button>
      <div className="igloo-rotate-same-key-note">
        <RotateCcw size={16} aria-hidden="true" />
        <div>
          <strong>All shares change, group key stays the same</strong>
          <p>
            Rotation replaces all device shares for the same group public key. Next, create this device's local profile
            by setting its name, password, relays, and peer permissions before adoption.
          </p>
        </div>
      </div>
    </div>
  );
}

function RotateCounterControl({
  label,
  value,
  helpContent,
  disabled = false,
  onDecrease,
  onIncrease,
  onChange,
}: {
  label: string;
  value: string;
  helpContent: React.ReactNode;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="igloo-create-field">
      <span className="igloo-create-label-with-help">
        {label}
        <HelpCircle size={14} aria-hidden="true">
          <title>{String(helpContent)}</title>
        </HelpCircle>
      </span>
      <div className="igloo-create-counter">
        <button type="button" aria-label={`Decrease ${label}`} disabled={disabled} onClick={onDecrease}>
          -
        </button>
        <input
          aria-label={label}
          type="number"
          min={2}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" aria-label={`Increase ${label}`} disabled={disabled} onClick={onIncrease}>
          +
        </button>
      </div>
    </div>
  );
}

function rotationSourceStatus(source: SharedRotationSource, sourceLabel: string) {
  const hasPackage = source.packageText.trim().length > 0;
  const hasPassword = source.packagePassword.trim().length > 0;

  if (source.duplicateOfLocal && hasPackage) {
    return {
      state: 'error',
      label: 'Local share',
      detail: `${sourceLabel} matches this device. Enter the profile passphrase above, or paste a different device's source package.`,
    };
  }

  if (hasPackage && hasPassword) {
    return {
      state: 'ready',
      label: 'Ready',
      detail: `${sourceLabel} can count toward the threshold.`,
    };
  }

  if (hasPackage) {
    return {
      state: 'missing-password',
      label: 'Password required',
      detail: `Add the package password to count ${sourceLabel}.`,
    };
  }

  if (hasPassword) {
    return {
      state: 'missing-package',
      label: 'Package required',
      detail: `Paste the source package to count ${sourceLabel}.`,
    };
  }

  return {
    state: 'empty',
    label: 'Waiting',
    detail: `Paste a source package and enter its password to count ${sourceLabel}.`,
  };
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
