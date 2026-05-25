import * as React from 'react';
import { BookOpen, Check, Feather, Github, Globe, Info, Lock } from 'lucide-react';

import { CRITICAL_E2E_TEST_IDS, type CriticalE2ETestId } from '../../lib/e2e-test-ids';
import type { StoredProfileCardModel } from '../../models/view-models';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ContentCard } from '../ui/content-card';
import { Modal } from '../ui/modal';

export function WelcomeEntryHero({
  logoSrc,
  logoAlt = 'Igloo',
  onNewKeyset,
  onImportProfile,
  onOnboard,
}: {
  logoSrc?: string;
  logoAlt?: string;
  onNewKeyset: () => void;
  onImportProfile: () => void;
  onOnboard: () => void;
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
              <Info size={14} aria-hidden="true" />
            </div>
          </div>
          <p>Generate a new threshold keyset and set up its first device profile.</p>
        </div>
        <div className="igloo-welcome-entry-primary">
          <Button type="button" onClick={onNewKeyset}>
            Generate
          </Button>
        </div>
        <div className="igloo-welcome-entry-secondary">
          <span>or</span>
          <Button type="button" size="sm" variant="secondary" onClick={onImportProfile}>
            Import Existing Device
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onOnboard}>
            Onboard New Device
          </Button>
        </div>
      </div>

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
  layout,
  profiles,
  onUnlock,
  onRotate,
  onNewKeyset,
  onImportProfile,
  onOnboard,
}: {
  logoSrc?: string;
  logoAlt?: string;
  layout: 'single' | 'multi' | 'many';
  profiles: WelcomeReturningProfileModel[];
  onUnlock: (profileId: string) => void;
  onRotate: (profileId: string) => void;
  onNewKeyset: () => void;
  onImportProfile: () => void;
  onOnboard: () => void;
}) {
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
            <div className="igloo-welcome-profile-row" key={profile.id}>
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
                <Button type="button" onClick={() => onUnlock(profile.id)}>
                  Unlock
                </Button>
                <Button type="button" variant="secondary" onClick={() => onRotate(profile.id)}>
                  Rotate
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="igloo-welcome-entry-secondary">
          <span>or</span>
          <Button type="button" size="sm" variant="secondary" onClick={onNewKeyset}>
            Generate
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onImportProfile}>
            Import Existing Device
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onOnboard}>
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
          <h2>Unlock Profile</h2>
          <p>{profileSummary}</p>
        </div>

        <label className="igloo-welcome-unlock-field">
          <span>Profile Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            autoFocus
          />
        </label>

        {error ? <p className="igloo-welcome-unlock-error">{error}</p> : null}

        <div className="igloo-welcome-unlock-actions">
          <Button type="submit" disabled={submitting}>
            Unlock
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function LandingIcon({ children }: { children: React.ReactNode }) {
  return <div className="igloo-pwa-entry-icon" aria-hidden="true">{children}</div>;
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
    <section className={`igloo-panel igloo-pwa-entry-tile ${tone === 'primary' ? 'is-primary' : ''}`}>
      <div className="igloo-pwa-entry-head">
        <LandingIcon>{icon}</LandingIcon>
        <div className="igloo-pwa-entry-copy">
          <span className="igloo-pwa-entry-kicker">{kicker}</span>
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
  return (
    <div className="igloo-step-progress" aria-label="Flow progress">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          {index > 0 ? (
            <div
              className={index <= active ? 'igloo-step-connector is-complete' : 'igloo-step-connector'}
              aria-hidden="true"
            />
          ) : null}
          <div
            className={[
              'igloo-step-chip',
              index < active ? 'is-complete' : '',
              index === active ? 'is-active' : '',
            ].filter(Boolean).join(' ')}
          >
            <span>{index < active ? <Check size={14} aria-hidden="true" /> : index + 1}</span>
            <strong>{step}</strong>
          </div>
        </React.Fragment>
      ))}
    </div>
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
