import * as React from 'react';

import { CRITICAL_E2E_TEST_IDS, type CriticalE2ETestId } from '../../lib/e2e-test-ids';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ContentCard } from '../ui/content-card';
import { StepIndicator } from '../ui/step-indicator';

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

export type HostStoredProfileSummary = {
  id: string;
  label: string;
  subtitle?: string;
  statusLabel?: string;
  loadLabel?: string;
};

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
  deleteLabel = 'Delete Profile',
}: {
  profiles: HostStoredProfileSummary[];
  selectedProfileId?: string | null;
  onSelect?: (profileId: string) => void;
  onLoad: (profileId: string) => void;
  onDelete?: (profileId: string) => void;
  description?: string;
  emptyMessage?: string;
  renderProfileDetail?: (profile: HostStoredProfileSummary, isSelected: boolean) => React.ReactNode;
  loadDisabled?: boolean;
  deleteDisabled?: boolean;
  deleteLabel?: string;
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
                  {profile.subtitle ? (
                    <div className="text-xs text-slate-400">{profile.subtitle}</div>
                  ) : null}
                </div>
                {profile.statusLabel ? (
                  <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-medium text-cyan-200">
                    {profile.statusLabel}
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
                      {profile.loadLabel ?? 'Load Profile'}
                    </Button>
                    {onDelete ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(profile.id)}
                        disabled={deleteDisabled}
                      >
                        {deleteLabel}
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
