import * as React from 'react';
import { BookOpen, Feather, Github, Globe, Info, Lock, MoreVertical } from 'lucide-react';

import { CRITICAL_E2E_TEST_IDS } from '../../lib/e2e-test-ids';
import { Button } from '../ui/button';
import { ContentCard } from '../ui/content-card';
import { Modal } from '../ui/modal';
import { PasswordField } from '../ui/password-field';
import { StepIndicator } from '../ui/step-indicator';

export type WelcomeHeroAction = {
  id: string;
  label: string;
  onAction: () => void;
  testId?: string;
};

export type WelcomeEntryPrimaryAction = {
  heading: string;
  description: string;
  buttonLabel: string;
  onAction: () => void;
  testId?: string;
  showInfo?: boolean;
};

export function WelcomeEntryHero({
  logoSrc,
  logoAlt = 'Igloo',
  productLabel,
  tagline,
  primaryAction,
  secondaryActions,
  footer,
}: {
  logoSrc?: string;
  logoAlt?: string;
  productLabel: string;
  tagline: string;
  primaryAction: WelcomeEntryPrimaryAction;
  secondaryActions: WelcomeHeroAction[];
  footer?: React.ReactNode;
}) {
  return (
    <section className="igloo-welcome-entry" aria-labelledby="igloo-welcome-entry-title">
      <div className="igloo-welcome-entry-brand">
        {logoSrc ? <img src={logoSrc} alt={logoAlt} className="igloo-welcome-entry-logo" /> : null}
        <div className="igloo-welcome-entry-copy">
          <h2 id="igloo-welcome-entry-title">{productLabel}</h2>
          <p>{tagline}</p>
        </div>
      </div>

      <div className="igloo-welcome-entry-panel">
        <div className="igloo-welcome-entry-panel-body">
          <div className="igloo-welcome-entry-panel-heading">
            <div className="igloo-welcome-entry-title-row">
              <h3>{primaryAction.heading}</h3>
              {primaryAction.showInfo !== false ? <Info size={14} aria-hidden="true" /> : null}
            </div>
          </div>
          <p>{primaryAction.description}</p>
        </div>
        <div className="igloo-welcome-entry-primary">
          <Button type="button" data-testid={primaryAction.testId} onClick={primaryAction.onAction}>
            {primaryAction.buttonLabel}
          </Button>
        </div>
        <div className="igloo-welcome-entry-secondary">
          <span>or</span>
          {secondaryActions.map((a) => (
            <Button key={a.id} type="button" size="sm" variant="secondary" data-testid={a.testId} onClick={a.onAction}>
              {a.label}
            </Button>
          ))}
        </div>
      </div>

      {footer}
    </section>
  );
}

export type WelcomeReturningProfileModel = {
  id: string;
  label: string;
  thresholdLabel: string;
  memberLabel: string;
  publicKeyLabel: string;
  canRotate?: boolean;
  canRecover?: boolean;
  canDelete?: boolean;
};

export function PublicFocusFooter() {
  return (
    <div className="igloo-welcome-entry-footer" aria-hidden="true">
      <Globe size={16} />
      <BookOpen size={16} />
      <Github size={16} />
      <Feather size={16} />
    </div>
  );
}

export function PublicTaskShell({ children }: { children: React.ReactNode }) {
  return <section className="igloo-public-task-screen igloo-flow-root">{children}</section>;
}

export function PublicTaskTitle({
  title,
  description,
}: {
  title: string;
  description: React.ReactNode;
}) {
  return (
    <div className="igloo-public-task-title">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export function WelcomeReturningHero({
  logoSrc,
  logoAlt = 'Igloo',
  productLabel,
  tagline = 'Welcome back.',
  layout,
  profiles,
  onUnlock,
  onRotate,
  onRecover,
  onDelete,
  secondaryActions,
  footer,
}: {
  logoSrc?: string;
  logoAlt?: string;
  productLabel: string;
  tagline?: string;
  layout: 'single' | 'multi' | 'many';
  profiles: WelcomeReturningProfileModel[];
  onUnlock: (profileId: string) => void;
  onRotate: (profileId: string) => void;
  onRecover?: (profileId: string) => void;
  onDelete: (profileId: string) => void;
  secondaryActions: WelcomeHeroAction[];
  footer?: React.ReactNode;
}) {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  return (
    <section className="igloo-welcome-entry" aria-labelledby="igloo-welcome-returning-title">
      <div className="igloo-welcome-entry-brand">
        {logoSrc ? <img src={logoSrc} alt={logoAlt} className="igloo-welcome-entry-logo" /> : null}
        <div className="igloo-welcome-entry-copy">
          <h2 id="igloo-welcome-returning-title">{productLabel}</h2>
          <p>{tagline}</p>
        </div>
      </div>

      <div className={`igloo-welcome-returning-stack is-${layout}`}>
        <div className="igloo-welcome-profile-list">
          {profiles.map((profile) => {
            const showRotate = profile.canRotate !== false;
            const showRecover = profile.canRecover ?? Boolean(onRecover);
            const showDelete = profile.canDelete !== false;
            return (
              <div
                className="igloo-welcome-profile-row"
                key={profile.id}
                data-testid={CRITICAL_E2E_TEST_IDS.welcomeProfileRow}
                data-profile-id={profile.id}
              >
                <div className="igloo-welcome-profile-icon" aria-hidden="true">
                  <Lock size={20} />
                </div>
                <div className="igloo-welcome-profile-copy">
                  <h3>{profile.label}</h3>
                  <div className="igloo-welcome-profile-meta">
                    {[
                      profile.thresholdLabel ? <span key="threshold">{profile.thresholdLabel}</span> : null,
                      profile.memberLabel ? <span key="member">{profile.memberLabel}</span> : null,
                      profile.publicKeyLabel ? <span key="pubkey" className="igloo-welcome-profile-key">{profile.publicKeyLabel}</span> : null,
                    ]
                      .filter(Boolean)
                      .flatMap((node, index, arr) =>
                        index < arr.length - 1
                          ? [node, <span key={`dot-${index}`} className="igloo-welcome-profile-dot">.</span>]
                          : [node],
                      )}
                  </div>
                </div>
                <div className="igloo-welcome-profile-actions">
                  <Button type="button" data-testid={CRITICAL_E2E_TEST_IDS.welcomeProfileUnlock} onClick={() => onUnlock(profile.id)}>
                    Unlock
                  </Button>
                  <div className="igloo-welcome-profile-menu">
                    <Button
                      type="button"
                      variant="secondary"
                      aria-label="More actions"
                      aria-haspopup="menu"
                      aria-expanded={openMenuId === profile.id}
                      data-testid={CRITICAL_E2E_TEST_IDS.welcomeProfileMenuTrigger}
                      onClick={() => setOpenMenuId(openMenuId === profile.id ? null : profile.id)}
                    >
                      <MoreVertical size={16} aria-hidden="true" />
                    </Button>
                    {openMenuId === profile.id ? (
                      <div className="igloo-welcome-profile-dropdown" role="menu">
                        {showRotate ? (
                          <button
                            type="button"
                            role="menuitem"
                            data-testid={CRITICAL_E2E_TEST_IDS.welcomeProfileMenuRotate}
                            onClick={() => {
                              setOpenMenuId(null);
                              onRotate(profile.id);
                            }}
                          >
                            Rotate
                          </button>
                        ) : null}
                        {showRecover ? (
                          <button
                            type="button"
                            role="menuitem"
                            data-testid={CRITICAL_E2E_TEST_IDS.welcomeProfileMenuRecover}
                            onClick={() => {
                              setOpenMenuId(null);
                              onRecover?.(profile.id);
                            }}
                          >
                            Recover
                          </button>
                        ) : null}
                        {showDelete ? (
                          <>
                            <div className="igloo-welcome-profile-dropdown-divider" aria-hidden="true" />
                            <button
                              type="button"
                              role="menuitem"
                              className="is-destructive"
                              data-testid={CRITICAL_E2E_TEST_IDS.welcomeProfileMenuDelete}
                              onClick={() => {
                                setOpenMenuId(null);
                                onDelete(profile.id);
                              }}
                            >
                              Delete
                            </button>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="igloo-welcome-entry-secondary">
          <span>or</span>
          {secondaryActions.map((a) => (
            <Button key={a.id} type="button" size="sm" variant="secondary" data-testid={a.testId} onClick={a.onAction}>
              {a.label}
            </Button>
          ))}
        </div>
      </div>

      {footer}
    </section>
  );
}

export function WelcomeUnlockModal({
  open,
  profile,
  password,
  error,
  submitting = false,
  onPasswordChange,
  onSubmit,
  onClose,
}: {
  open: boolean;
  profile: WelcomeReturningProfileModel | null;
  password: string;
  error?: string | null;
  submitting?: boolean;
  onPasswordChange: (value: string) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onClose: () => void;
}) {
  if (!profile) return null;

  const profileSummary = `${profile.label} · ${profile.thresholdLabel} · ${profile.memberLabel}`;

  return (
    <Modal open={open} onClose={onClose} className="igloo-welcome-unlock-modal">
      <form className="igloo-welcome-unlock-form" onSubmit={onSubmit}>
        <div className="igloo-welcome-unlock-heading">
          <div className="igloo-welcome-unlock-icon" aria-hidden="true">
            <Lock size={20} />
          </div>
          <div>
            <h2>Unlock Profile</h2>
            <p>{profileSummary}</p>
          </div>
        </div>

        <p className="igloo-welcome-unlock-description">
          Enter your profile password to decrypt and load the signing share.
        </p>

        <label className="igloo-welcome-unlock-field">
          <span>Profile Password</span>
          <PasswordField
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            data-testid={CRITICAL_E2E_TEST_IDS.welcomeUnlockPassword}
            autoFocus
          />
        </label>

        {error ? <p className="igloo-welcome-unlock-error">{error}</p> : null}

        <div className="igloo-welcome-unlock-actions">
          <Button type="submit" data-testid={CRITICAL_E2E_TEST_IDS.welcomeUnlockSubmit} disabled={submitting}>
            Unlock
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function WelcomeDeleteModal({
  open,
  profile,
  onConfirm,
  onClose,
}: {
  open: boolean;
  profile: WelcomeReturningProfileModel | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!profile) return null;

  const profileSummary = `${profile.label} · ${profile.thresholdLabel} · ${profile.memberLabel}`;

  return (
    <Modal open={open} onClose={onClose} className="igloo-welcome-delete-modal">
      <div className="igloo-welcome-unlock-form">
        <div className="igloo-welcome-unlock-heading">
          <h2>Delete Profile</h2>
          <p>{profileSummary}</p>
        </div>

        <p className="igloo-welcome-delete-warning">
          This permanently removes this profile and its encrypted share from this device. You can
          only restore it from a backup, and this cannot be undone.
        </p>

        <div className="igloo-welcome-unlock-actions igloo-welcome-delete-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" className="igloo-welcome-delete-confirm" onClick={onConfirm}>
            Delete Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function HostFlowShell({
  title,
  description,
  onBack,
  backTooltip,
  children,
}: {
  title: string;
  description: string;
  onBack: () => void;
  backTooltip: string;
  children: React.ReactNode;
}) {
  return (
    <ContentCard title={title} description={description} onBack={onBack} backButtonTooltip={backTooltip}>
      {children}
    </ContentCard>
  );
}

export function StepProgress({
  steps,
  active,
}: {
  steps: string[];
  active: number;
}) {
  const indicatorSteps = steps.map((step, index) => ({
    id: `${index}-${step}`,
    label: step,
  }));
  const currentStepId = indicatorSteps[active]?.id ?? '';
  return (
    <StepIndicator
      steps={indicatorSteps}
      currentStepId={currentStepId}
      ariaLabel="Flow progress"
    />
  );
}

