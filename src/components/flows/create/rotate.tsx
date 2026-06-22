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
