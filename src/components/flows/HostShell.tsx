import * as React from 'react';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ContentCard } from '../ui/content-card';

function LandingIcon({ children }: { children: React.ReactNode }) {
  return <div className="igloo-pwa-entry-icon" aria-hidden="true">{children}</div>;
}

export function HostEntryTile({
  kicker,
  title,
  description,
  actionLabel,
  icon,
  tone = 'secondary',
  onAction,
}: {
  kicker: string;
  title: string;
  description: string;
  actionLabel: string;
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
      <Button type="button" size="sm" variant={tone === 'primary' ? 'default' : 'secondary'} onClick={onAction}>
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
        <div
          key={step}
          className={index === active ? 'igloo-step-chip is-active' : 'igloo-step-chip'}
        >
          <span>{index + 1}</span>
          <strong>{step}</strong>
        </div>
      ))}
    </div>
  );
}

export type HostStoredProfileSummary = {
  id: string;
  label: string;
  subtitle?: string;
  actionLabel?: string;
};

export function StoredProfilesLandingCard({
  profiles,
  onAction,
  description = 'Profiles remain available while logged out. Only label and short id are shown here.',
  footer,
}: {
  profiles: HostStoredProfileSummary[];
  onAction: (profileId: string) => void;
  description?: string;
  footer?: React.ReactNode;
}) {
  if (!profiles.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stored Profiles</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="igloo-stack">
        {profiles.map((profile) => (
          <div key={profile.id} className="igloo-flow-card">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <strong>{profile.label || 'Unnamed device'}</strong>
                {profile.subtitle ? <div className="text-xs text-slate-400">{profile.subtitle}</div> : null}
              </div>
              <Button type="button" size="sm" onClick={() => onAction(profile.id)}>
                {profile.actionLabel ?? 'Load Profile'}
              </Button>
            </div>
          </div>
        ))}
        {footer}
      </CardContent>
    </Card>
  );
}
