import * as React from 'react';
import { BookOpen, Feather, Github, Globe, Lock, MoreVertical } from 'lucide-react';

import { CRITICAL_E2E_TEST_IDS, type CriticalE2ETestId } from '../../lib/e2e-test-ids';
import type { StoredProfileCardModel } from '../../models/view-models';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ContentCard } from '../ui/content-card';
import { Modal } from '../ui/modal';
import { PasswordField } from '../ui/password-field';
import { HelpHint } from '../ui/help-hint';
import { StepIndicator } from '../ui/step-indicator';

const WELCOME_HELP_TEXT = {
  newKeyset: 'Generate a new set of signing keys and devices.',
};

export function WelcomeEntryHero({
  logoSrc,
  logoAlt = 'Igloo',
  onNewKeyset,
  onImportProfile,
  onOnboard,
  resumeDevices,
  onResumeDevice,
  onForgetDevice,
}: {
  logoSrc?: string;
  logoAlt?: string;
  onNewKeyset: () => void;
  onImportProfile: () => void;
  onOnboard: () => void;
  resumeDevices?: WelcomeResumableDeviceModel[];
  onResumeDevice?: (deviceId: string) => void;
  onForgetDevice?: (deviceId: string) => void;
}) {
  return (
    <section className="igloo-welcome-entry" aria-labelledby="igloo-welcome-entry-title">
      <div className="igloo-welcome-entry-brand">
        {logoSrc ? <img src={logoSrc} alt={logoAlt} className="igloo-welcome-entry-logo" /> : null}
        <div className="igloo-welcome-entry-copy">
          <h2 id="igloo-welcome-entry-title">Igloo Web</h2>
          <p>Split your Nostr key. Sign from anywhere.</p>
        </div>
      </div>

      <div className="igloo-welcome-entry-panel">
        <div className="igloo-welcome-entry-panel-body">
          <div className="igloo-welcome-entry-panel-heading">
            <div className="igloo-welcome-entry-title-row">
              <h3>Generate New Keyset</h3>
              <HelpHint
                ariaLabel="About generating a new keyset"
                content={WELCOME_HELP_TEXT.newKeyset}
                placement="right"
                icon="info"
                iconSize={14}
              />
            </div>
          </div>
          <p>Generate a new threshold keyset and set up its first device profile.</p>
        </div>
        <div className="igloo-welcome-entry-primary">
          <Button type="button" data-testid={CRITICAL_E2E_TEST_IDS.welcomeEntryGenerate} onClick={onNewKeyset}>
            Generate Keyset
          </Button>
        </div>
        <div className="igloo-welcome-entry-secondary">
          <span>or</span>
          <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.welcomeEntryImport} onClick={onImportProfile}>
            Import Existing Device
          </Button>
          <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.welcomeEntryOnboard} onClick={onOnboard}>
            Onboard New Device
          </Button>
        </div>
      </div>

      {resumeDevices?.length && onResumeDevice ? (
        <WelcomeResumeDeviceList devices={resumeDevices} onResume={onResumeDevice} onForget={onForgetDevice} />
      ) : null}

      <PublicFocusFooter />
    </section>
  );
}

export type WelcomeReturningProfileModel = {
  id: string;
  label: string;
  thresholdLabel: string;
  memberLabel: string;
  publicKeyLabel: string;
};

// A signing device stored in another browser partition (e.g. an earlier session
// whose per-tab instance id was cleared by a restart). It can be resumed with
// one click, but its share stays encrypted until then — so, unlike a returning
// profile, only the label and a partition summary are known here.
export type WelcomeResumableDeviceModel = {
  id: string;
  label: string;
  metaLabel: string;
};

// Renders resumable devices using the same Paper device-card treatment as the
// returning-profile rows, with a single "Resume" action in place of
// Unlock + overflow menu.
function WelcomeResumeDeviceList({
  devices,
  onResume,
  onForget,
}: {
  devices: WelcomeResumableDeviceModel[];
  onResume: (deviceId: string) => void;
  onForget?: (deviceId: string) => void;
}) {
  return (
    <div className="igloo-welcome-profile-list" data-testid={CRITICAL_E2E_TEST_IDS.welcomeResumeDevices}>
      {devices.map((device) => (
        <div
          className="igloo-welcome-profile-row"
          key={device.id}
          data-testid={CRITICAL_E2E_TEST_IDS.welcomeResumeDevice}
          data-device-id={device.id}
        >
          <div className="igloo-welcome-profile-icon" aria-hidden="true">
            <Lock size={20} />
          </div>
          <div className="igloo-welcome-profile-copy">
            <h3>{device.label}</h3>
            <div className="igloo-welcome-profile-meta">
              <span>{device.metaLabel}</span>
            </div>
          </div>
          <div className="igloo-welcome-profile-actions">
            <Button
              type="button"
              data-testid={CRITICAL_E2E_TEST_IDS.welcomeResumeDeviceButton}
              onClick={() => onResume(device.id)}
            >
              Resume
            </Button>
            {onForget ? (
              <Button
                type="button"
                variant="secondary"
                className="igloo-welcome-resume-forget"
                aria-label={`Forget ${device.label}`}
                data-testid={CRITICAL_E2E_TEST_IDS.welcomeResumeDeviceForget}
                onClick={() => onForget(device.id)}
              >
                Forget
              </Button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PublicFocusFooter({
  className,
  variant = 'default',
}: {
  className?: string;
  variant?: 'default' | 'dashboard';
} = {}) {
  const dashboardClass = variant === 'dashboard' ? ' igloo-dashboard-footer' : '';
  return (
    <div className={`igloo-welcome-entry-footer${dashboardClass}${className ? ` ${className}` : ''}`} aria-hidden="true">
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
  layout,
  profiles,
  onUnlock,
  onRotate,
  onRecover,
  onDelete,
  onNewKeyset,
  onImportProfile,
  onOnboard,
  resumeDevices,
  onResumeDevice,
  onForgetDevice,
}: {
  logoSrc?: string;
  logoAlt?: string;
  layout: 'single' | 'multi' | 'many';
  profiles: WelcomeReturningProfileModel[];
  onUnlock: (profileId: string) => void;
  onRotate: (profileId: string) => void;
  onRecover?: (profileId: string) => void;
  onDelete: (profileId: string) => void;
  onNewKeyset: () => void;
  onImportProfile: () => void;
  onOnboard: () => void;
  resumeDevices?: WelcomeResumableDeviceModel[];
  onResumeDevice?: (deviceId: string) => void;
  onForgetDevice?: (deviceId: string) => void;
}) {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  return (
    <section className="igloo-welcome-entry" aria-labelledby="igloo-welcome-returning-title">
      <div className="igloo-welcome-entry-brand">
        {logoSrc ? <img src={logoSrc} alt={logoAlt} className="igloo-welcome-entry-logo" /> : null}
        <div className="igloo-welcome-entry-copy">
          <h2 id="igloo-welcome-returning-title">Igloo Web</h2>
          <p>Welcome back.</p>
        </div>
      </div>

      <div className={`igloo-welcome-returning-stack is-${layout}`}>
        <div className="igloo-welcome-profile-list">
          {profiles.map((profile) => (
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
                  <span>{profile.thresholdLabel}</span>
                  <span className="igloo-welcome-profile-dot">.</span>
                  <span>{profile.memberLabel}</span>
                  <span className="igloo-welcome-profile-dot">.</span>
                  <span className="igloo-welcome-profile-key">{profile.publicKeyLabel}</span>
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
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!onRecover}
                        data-testid={CRITICAL_E2E_TEST_IDS.welcomeProfileMenuRecover}
                        onClick={() => {
                          setOpenMenuId(null);
                          onRecover?.(profile.id);
                        }}
                      >
                        Recover
                      </button>
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
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        {resumeDevices?.length && onResumeDevice ? (
          <WelcomeResumeDeviceList devices={resumeDevices} onResume={onResumeDevice} onForget={onForgetDevice} />
        ) : null}

        <div className="igloo-welcome-entry-secondary">
          <span>or</span>
          <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.welcomeEntryGenerate} onClick={onNewKeyset}>
            Generate Keyset
          </Button>
          <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.welcomeEntryImport} onClick={onImportProfile}>
            Import Existing Device
          </Button>
          <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.welcomeEntryOnboard} onClick={onOnboard}>
            Onboard New Device
          </Button>
        </div>
      </div>

      <PublicFocusFooter />
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

function LandingIcon({ children }: { children: React.ReactNode }) {
  return <div className="igloo-entry-icon" aria-hidden="true">{children}</div>;
}

export function HostEntryTile({
  kicker,
  title,
  description,
  actionLabel,
  testId,
  icon,
  tone = 'secondary',
  onAction,
}: {
  kicker: string;
  title: string;
  description: string;
  actionLabel: string;
  testId?: CriticalE2ETestId;
  icon: React.ReactNode;
  tone?: 'primary' | 'secondary';
  onAction: () => void;
}) {
  return (
    <section className={`igloo-panel igloo-entry-tile ${tone === 'primary' ? 'is-primary' : ''}`}>
      <div className="igloo-entry-head">
        <LandingIcon>{icon}</LandingIcon>
        <div className="igloo-entry-copy">
          <span className="igloo-entry-kicker">{kicker}</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      <Button
        type="button"
        size="sm"
        variant={tone === 'primary' ? 'default' : 'secondary'}
        onClick={onAction}
        data-testid={testId}
      >
        {actionLabel}
      </Button>
    </section>
  );
}

export function HostFlowShell({
  title,
  description,
  onBack,
  backTooltip,
  variant = 'card',
  children,
}: {
  title: string;
  description: string;
  onBack: () => void;
  backTooltip: string;
  variant?: 'card' | 'bare';
  children: React.ReactNode;
}) {
  if (variant === 'bare') {
    return (
      <section className="igloo-host-flow-bare">
        <button type="button" className="igloo-host-flow-back" onClick={onBack} aria-label={backTooltip}>
          <span aria-hidden="true">‹</span>
          {backTooltip}
        </button>
        <div className="igloo-host-flow-heading">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {children}
      </section>
    );
  }

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

export function StoredProfilesLandingCard({
  profiles,
  selectedProfileId,
  onSelect,
  onLoad,
  onDelete,
  description = 'Profiles remain available while logged out. Only label and short id are shown here.',
  emptyMessage = 'No stored profiles are saved on this device yet.',
  renderProfileDetail,
  loadDisabled = false,
  deleteDisabled = false,
}: {
  profiles: StoredProfileCardModel[];
  selectedProfileId?: string | null;
  onSelect?: (profileId: string) => void;
  onLoad: (profileId: string) => void;
  onDelete?: (profileId: string) => void;
  description?: string;
  emptyMessage?: string;
  renderProfileDetail?: (profile: StoredProfileCardModel, isSelected: boolean) => React.ReactNode;
  loadDisabled?: boolean;
  deleteDisabled?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stored Profiles</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="igloo-stack">
        {profiles.length ? (
          profiles.map((profile) => {
            const isSelected = profile.id === selectedProfileId;
            const detail = renderProfileDetail?.(profile, isSelected);

            const summary = (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <strong>{profile.label || 'Unnamed device'}</strong>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span>{profile.shortId}</span>
                    {profile.thresholdLabel ? <span>{profile.thresholdLabel}</span> : null}
                    {profile.publicKeyLabel ? <span>{profile.publicKeyLabel}</span> : null}
                    {profile.updatedLabel ? <span>{profile.updatedLabel}</span> : null}
                  </div>
                </div>
                {profile.state ? (
                  <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-medium text-cyan-200">
                    {profile.state}
                  </span>
                ) : null}
              </div>
            );

            return (
              <div
                key={profile.id}
                data-testid={CRITICAL_E2E_TEST_IDS.storedProfileEntry}
                className={`rounded-xl border p-3 transition ${
                  isSelected
                    ? 'border-cyan-500/40 bg-cyan-500/10'
                    : 'border-slate-700/60 bg-slate-900/40'
                }`}
              >
                <div className="grid gap-3">
                  {onSelect ? (
                    <button
                      type="button"
                      className="w-full text-left"
                      aria-pressed={isSelected}
                      onClick={() => onSelect(profile.id)}
                    >
                      {summary}
                    </button>
                  ) : (
                    summary
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      data-testid={CRITICAL_E2E_TEST_IDS.storedProfileLoad}
                      onClick={() => onLoad(profile.id)}
                      disabled={loadDisabled}
                    >
                      {profile.primaryActionLabel ?? 'Load Profile'}
                    </Button>
                    {onDelete ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(profile.id)}
                        disabled={deleteDisabled}
                      >
                        {profile.destructiveActionLabel ?? 'Delete'}
                      </Button>
                    ) : null}
                  </div>
                  {detail ? <div>{detail}</div> : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="igloo-flow-card border-dashed border-slate-700/60 bg-slate-900/30 text-sm text-slate-300">
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
