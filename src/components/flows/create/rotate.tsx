import type * as React from 'react';
import { AlertTriangle, Check, HelpCircle } from 'lucide-react';

import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { PasswordField } from '../../ui/password-field';
import { Textarea } from '../../ui/textarea';
import { CRITICAL_E2E_TEST_IDS } from '../../../lib/e2e-test-ids';
import { passwordManagerOptOutProps } from '../../../lib/password-manager';
import type { SharedRotationSource } from './types';

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
  deviceShareLabel = 'Share #1 (this device)',
  devicePassphrase,
  onChangeDevicePassphrase,
  deviceShareValidated = false,
  onVerifyDevicePassphrase,
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
  const includeDeviceShare = Boolean(onChangeDevicePassphrase);
  // Pasted shares are numbered after the auto-included device share when present.
  const sourceNumberOffset = includeDeviceShare ? 2 : 1;
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
        {includeDeviceShare ? (
          <div className="igloo-generated-card">
            <header className="igloo-recover-device-header">
              <strong>{deviceShareLabel}</strong>
              <span
                className={
                  deviceShareValidated
                    ? 'igloo-recover-share-status igloo-recover-share-status-valid'
                    : 'igloo-recover-share-status'
                }
              >
                {deviceShareValidated ? 'Validated' : 'Locked'}
              </span>
            </header>
            <label>
              Device Passphrase
              <PasswordField
                value={devicePassphrase ?? ''}
                onChange={(event) => onChangeDevicePassphrase?.(event.target.value)}
                onBlur={onVerifyDevicePassphrase ? () => onVerifyDevicePassphrase() : undefined}
                placeholder="Unlock this device's share to auto-include it in the rotation"
              />
            </label>
          </div>
        ) : null}
        <div className="igloo-stack">
          {rotationSources.map((source, index) => (
            <div key={`rotation-source-${index}`} className="igloo-generated-card">
              <header>
                <strong>Recovery Share {index + sourceNumberOffset}</strong>
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
