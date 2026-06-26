import * as React from 'react';
import { AlertTriangle, Check, HelpCircle, X } from 'lucide-react';

import { Button } from '../../ui/button';
import { CRITICAL_E2E_TEST_IDS } from '../../../lib/e2e-test-ids';
import { passwordManagerOptOutProps } from '../../../lib/password-manager';
import type { OnboardTimelineStepKey, SharedOnboardProfilePreview } from './types';

type OnboardTimelineStep = { key: OnboardTimelineStepKey; label: string; detail?: string };

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
  shareLabel = 'Share #0',
  activeStep = 'negotiate',
  onCancel,
  title = 'Onboard Device',
}: {
  packageText?: string;
  keysetName?: string;
  thresholdLabel?: string;
  shareLabel?: string;
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
        Onboarding package: {compactPackage} · {shareLabel}
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
