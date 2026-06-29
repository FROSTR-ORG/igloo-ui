import * as React from 'react';

import type { DashboardBanner } from '../../models/dashboard-state';
import { Alert } from '../ui/alert';
import { Button } from '../ui/button';

export type DashboardProfileSummary = {
  profileName?: string;
  thresholdLabel?: string;
  groupKeyLabel?: string;
  shareLabel?: string;
  shareKeyLabel?: string;
};

function DashboardStateShell({
  testId,
  profileSummary,
  children,
}: {
  testId: string;
  profileSummary?: DashboardProfileSummary;
  children: React.ReactNode;
}) {
  return (
    <div className="igloo-dashboard-state" data-testid={testId}>
      <DashboardProfileStrip profileSummary={profileSummary} />
      {children}
    </div>
  );
}

function DashboardProfileStrip({ profileSummary }: { profileSummary?: DashboardProfileSummary }) {
  const profileName = profileSummary?.profileName?.trim() || 'Signing profile';
  const primaryItems = [profileName, profileSummary?.thresholdLabel, profileSummary?.groupKeyLabel].filter(
    Boolean,
  );
  const shareItems = [profileSummary?.shareLabel, profileSummary?.shareKeyLabel].filter(Boolean);

  return (
    <div className="igloo-dashboard-state-profile" aria-label="Profile summary">
      <span className="igloo-dashboard-state-profile-group">
        {primaryItems.map((item, index) => (
          <React.Fragment key={`${item}-${index}`}>
            {index > 0 ? <span className="igloo-dashboard-state-separator">·</span> : null}
            <span>{item}</span>
          </React.Fragment>
        ))}
      </span>
      {shareItems.length ? (
        <>
          <span className="igloo-dashboard-state-divider" aria-hidden="true" />
          <span className="igloo-dashboard-state-profile-group">
            {shareItems.map((item, index) => (
              <React.Fragment key={`${item}-${index}`}>
                {index > 0 ? <span className="igloo-dashboard-state-separator">·</span> : null}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </span>
        </>
      ) : null}
    </div>
  );
}

/**
 * Full-panel loading state — shown in place of the signer dashboard while the
 * runtime restores its session and connects to relays.
 */
export function DashboardLoadingScreen({
  title = 'Loading profile...',
  detail = 'Preparing your dashboard.',
  profileSummary,
}: {
  title?: string;
  detail?: string;
  profileSummary?: DashboardProfileSummary;
}) {
  return (
    <DashboardStateShell testId="dashboard-loading" profileSummary={profileSummary}>
      <div className="igloo-dashboard-state-center" role="status" aria-live="polite">
        <span className="igloo-dashboard-state-spinner" aria-hidden="true" />
        <div className="igloo-dashboard-state-copy">
          <h2>{title}</h2>
          <p>{detail}</p>
        </div>
      </div>
    </DashboardStateShell>
  );
}

/**
 * Full-panel load-failure state — shown in place of the signer dashboard when a
 * saved session could not be restored. `onRetry` / `onClear` render optional
 * recovery actions.
 */
export function DashboardLoadFailedScreen({
  message,
  timestampLabel,
  onRetry,
  retryLabel = 'Retry',
  onClear,
  clearLabel = 'Back to Profiles',
  clearVariant = 'secondary',
  profileSummary,
}: {
  message: string;
  timestampLabel?: string;
  onRetry?: () => void;
  retryLabel?: string;
  onClear?: () => void;
  clearLabel?: string;
  clearVariant?: React.ComponentProps<typeof Button>['variant'];
  profileSummary?: DashboardProfileSummary;
}) {
  return (
    <DashboardStateShell testId="dashboard-load-failed" profileSummary={profileSummary}>
      <div className="igloo-dashboard-state-center">
        <span className="igloo-dashboard-state-error-icon" aria-hidden="true">
          !
        </span>
        <div className="igloo-dashboard-state-copy">
          <h2>Couldn’t load profile</h2>
          <p>Try again, or return to your profiles.</p>
        </div>
        <div className="igloo-dashboard-state-error" role="alert">
          {message}
          {timestampLabel ? (
            <span className="igloo-dashboard-state-error-time">{timestampLabel}</span>
          ) : null}
        </div>
        {onRetry || onClear ? (
          <div className="igloo-dashboard-state-actions">
            {onRetry ? (
              <Button onClick={onRetry} data-testid="dashboard-load-failed-retry">
                {retryLabel}
              </Button>
            ) : null}
            {onClear ? (
              <Button variant={clearVariant} onClick={onClear}>
                {clearLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </DashboardStateShell>
  );
}

const BANNER_COPY: Record<DashboardBanner['kind'], { tone: 'warning' | 'danger'; title: string }> = {
  'all-relays-offline': { tone: 'warning', title: 'No relays connected' },
  'signing-blocked': { tone: 'warning', title: 'Signing unavailable' },
  'signing-failed': { tone: 'danger', title: 'Signing failed' },
};

/**
 * A single dashboard condition banner, rendered above an otherwise-usable
 * dashboard. Switches on `banner.kind`; `signing-failed` is dismissible via
 * `onDismiss`. `timestampLabel` is used only by `signing-failed`.
 */
export function DashboardConditionBanner({
  banner,
  timestampLabel,
  onDismiss,
}: {
  banner: DashboardBanner;
  timestampLabel?: string;
  onDismiss?: () => void;
}) {
  const { tone, title } = BANNER_COPY[banner.kind];
  return (
    <Alert tone={tone} title={title} data-testid={`dashboard-banner-${banner.kind}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          {bannerBody(banner)}
          {banner.kind === 'signing-failed' && timestampLabel ? (
            <div className="mt-1 text-xs opacity-80">{timestampLabel}</div>
          ) : null}
        </div>
        {banner.kind === 'signing-failed' && onDismiss ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            data-testid="dashboard-banner-signing-failed-dismiss"
          >
            Dismiss
          </Button>
        ) : null}
      </div>
    </Alert>
  );
}

function bannerBody(banner: DashboardBanner): React.ReactNode {
  switch (banner.kind) {
    case 'all-relays-offline':
      return (
        <>
          Not connected to any relay ({banner.connectedCount} of {banner.configuredCount}). Signing
          and peer updates are paused until a relay reconnects.
        </>
      );
    case 'signing-blocked':
      return banner.reason === 'policy'
        ? 'Signing is blocked by peer permissions — no reachable peer is allowed to sign.'
        : 'Not enough peers are online to meet the signing threshold.';
    case 'signing-failed':
      return banner.message;
  }
}
