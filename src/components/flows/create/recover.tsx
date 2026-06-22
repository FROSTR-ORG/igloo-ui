import { Button } from '../../ui/button';
import { PasswordField } from '../../ui/password-field';
import { Textarea } from '../../ui/textarea';
import { CRITICAL_E2E_TEST_IDS } from '../../../lib/e2e-test-ids';
import type { SharedRecoverSource } from './types';

export function RecoverCollectSharesPanel({
  deviceShareLabel = 'Share #1 (this device)',
  devicePassphrase,
  onChangeDevicePassphrase,
  sources,
  threshold,
  collectedCount,
  onChangeSource,
  onAddSource,
  onRemoveSource,
  onNext,
  actionLabel = 'Next Step',
  lostDeviceMode = false,
  onToggleLostDevice,
  deviceShareValidated = false,
  onVerifyDevicePassphrase,
}: {
  deviceShareLabel?: string;
  devicePassphrase: string;
  onChangeDevicePassphrase: (value: string) => void;
  sources: SharedRecoverSource[];
  threshold: number;
  collectedCount: number;
  onChangeSource: (index: number, field: 'packageText' | 'packagePassword', value: string) => void;
  onAddSource: () => void;
  onRemoveSource: (index: number) => void;
  onNext: () => void;
  actionLabel?: string;
  /**
   * Lost-device recovery: reconstruct from a full threshold of pasted shares with
   * no device share. When true the device-share card is hidden. Optional so other
   * hosts (igloo-home) keep the original single-path behavior.
   */
  lostDeviceMode?: boolean;
  /** When provided, renders the lost-device toggle. */
  onToggleLostDevice?: (value: boolean) => void;
  /** Whether the device passphrase has been verified to unlock its own share. */
  deviceShareValidated?: boolean;
  /** Verify the entered device passphrase actually unlocks the device share. */
  onVerifyDevicePassphrase?: () => void;
}) {
  const pct = threshold > 0 ? Math.min(100, Math.round((collectedCount / threshold) * 100)) : 0;
  // Pasted shares are numbered after the device share normally, or from #1 in
  // lost-device mode where no device share contributes.
  const sourceNumberOffset = lostDeviceMode ? 1 : 2;
  // Show the validation badge only when the host opted into unlock verification.
  const showDeviceShareStatus = Boolean(onVerifyDevicePassphrase);
  return (
    <div className="igloo-recover-collect">
      {lostDeviceMode ? null : (
        <div className="igloo-generated-card">
          <header className="igloo-recover-device-header">
            <strong>{deviceShareLabel}</strong>
            {showDeviceShareStatus ? (
              <span
                className={
                  deviceShareValidated
                    ? 'igloo-recover-share-status igloo-recover-share-status-valid'
                    : 'igloo-recover-share-status'
                }
              >
                {deviceShareValidated ? 'Validated' : 'Locked'}
              </span>
            ) : null}
          </header>
          <label>
            Device Passphrase
            <PasswordField
              data-testid={CRITICAL_E2E_TEST_IDS.recoverDevicePassphrase}
              value={devicePassphrase}
              onChange={(event) => onChangeDevicePassphrase(event.target.value)}
              onBlur={onVerifyDevicePassphrase ? () => onVerifyDevicePassphrase() : undefined}
              placeholder="Unlock this device's share to count it toward the threshold"
            />
          </label>
        </div>
      )}
      {onToggleLostDevice ? (
        <label className="igloo-recover-lost-device">
          <input
            type="checkbox"
            checked={lostDeviceMode}
            onChange={(event) => onToggleLostDevice(event.target.checked)}
          />
          <span>This device is lost — recover from a full threshold of pasted shares.</span>
        </label>
      ) : null}
      <div className="igloo-stack">
        {sources.map((source, index) => (
          <div key={`recover-source-${index}`} className="igloo-generated-card">
            <header>
              <strong>Share #{index + sourceNumberOffset}</strong>
            </header>
            <label>
              Source Package
              <Textarea
                className="min-h-[96px]"
                value={source.packageText}
                onChange={(event) => onChangeSource(index, 'packageText', event.target.value)}
                placeholder="Paste a bfshare from another device..."
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
        {lostDeviceMode
          ? 'This device is excluded — paste a full threshold of bfshares from the other members to reconstruct the key.'
          : 'Old devices do not need to be online. Provide enough source packages and passwords to meet the threshold.'}
      </p>
      <Button
        type="button"
        className="igloo-create-primary-action"
        data-testid={CRITICAL_E2E_TEST_IDS.recoverNext}
        onClick={onNext}
      >
        {actionLabel}
      </Button>
    </div>
  );
}
