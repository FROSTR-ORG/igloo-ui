import * as React from 'react';
import { Loader2 } from 'lucide-react';

import type { DashboardBanner } from '../../models/dashboard-state';
import { Alert } from '../ui/alert';
import { Button } from '../ui/button';
import { ContentCard } from '../ui/content-card';

/**
 * Full-panel loading state — shown in place of the signer dashboard while the
 * runtime restores its session and connects to relays.
 */
export function DashboardLoadingScreen({
  title = 'Starting signer…',
  detail,
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <ContentCard
      title={title}
      description={detail ?? 'Restoring your session and connecting to relays.'}
      data-testid="dashboard-loading"
    >
      <div className="flex items-center justify-center gap-3 rounded-lg border border-blue-800/30 p-8 text-blue-300">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        <span className="text-sm">Loading…</span>
      </div>
    </ContentCard>
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
  clearLabel = 'Clear credentials',
}: {
  message: string;
  timestampLabel?: string;
  onRetry?: () => void;
  retryLabel?: string;
  onClear?: () => void;
  clearLabel?: string;
}) {
  return (
    <ContentCard
      title="Couldn’t load your signer"
      description="The saved session could not be restored."
      data-testid="dashboard-load-failed"
    >
      <Alert tone="danger" title="Load failed">
        {message}
        {timestampLabel ? (
          <div className="mt-1 text-xs opacity-80">{timestampLabel}</div>
        ) : null}
      </Alert>
      {onRetry || onClear ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {onRetry ? (
            <Button onClick={onRetry} data-testid="dashboard-load-failed-retry">
              {retryLabel}
            </Button>
          ) : null}
          {onClear ? (
            <Button variant="destructive" onClick={onClear}>
              {clearLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </ContentCard>
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
