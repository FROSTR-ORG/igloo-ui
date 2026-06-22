import { HelpCircle, QrCode } from 'lucide-react';

import { Button } from '../../ui/button';
import { PasswordField } from '../../ui/password-field';
import { Textarea } from '../../ui/textarea';
import { CRITICAL_E2E_TEST_IDS } from '../../../lib/e2e-test-ids';

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
