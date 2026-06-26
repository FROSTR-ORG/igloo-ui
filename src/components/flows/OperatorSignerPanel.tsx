import * as React from 'react';
import { AlertTriangle, ChevronDown, CircleX, Clock, Copy, Filter, Radio, RefreshCw, X } from 'lucide-react';

import type {
  DashboardKeyModel,
  DashboardSigningFailureModel,
  EventLogRowModel,
  PendingApprovalRowModel,
  PendingOperationRowModel,
  PermissionMethodKey,
  PeerReadinessRowModel,
  SignerDashboardViewModel,
} from '../../models/view-models';
import { CRITICAL_E2E_TEST_IDS as TID } from '../../lib/e2e-test-ids';
import { Button } from '../ui/button';
import { ContentCard } from '../ui/content-card';
import { Dialog } from '../ui/dialog';
import { HelpHint } from '../ui/help-hint';
import { Input } from '../ui/input';
import { PermissionToken, normalizePermissionMethod } from '../ui/permission-token';
import { Tooltip } from '../ui/tooltip';

type Props = {
  view: SignerDashboardViewModel | null;
  introMessage: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  runtimeControlLabel: string;
  statusBanner?: React.ReactNode;
  copiedField?: 'group' | null;
  // Receives the chosen format from the split-copy control. The legacy KeyField
  // fallback ignores the argument, so a plain `() => void` handler is still valid.
  onCopyGroupKey?: (format?: 'npub' | 'hex') => void;
  onPrimaryAction: () => void;
  primaryActionVariant?: 'default' | 'destructive' | 'success' | 'secondary';
  primaryActionDisabled?: boolean;
  primaryActionLoading?: boolean;
  primaryActionLoadingLabel?: string;
  onRefreshPeers?: () => void;
  refreshPeersDisabled?: boolean;
  refreshPeersLoading?: boolean;
  onPingPeer?: (pubkey: string) => Promise<PeerPingResult>;
  pingPeerDisabled?: boolean;
  onOpenPendingApproval?: (approvalId: string) => void;
  onOpenPendingOperation?: (operationId: string) => void;
  onClearLogs?: () => void;
  clearLogsLoading?: boolean;
};

type PeerPingResult = {
  success: boolean;
  latency?: number;
  error?: string;
};

export type DashboardLoadingProfileModel = {
  profileName: string;
  thresholdLabel?: string;
  publicKeyLabel?: string;
  memberLabel?: string;
  shareLabel?: string;
};

export type DashboardLoadingStateProps = {
  profile: DashboardLoadingProfileModel;
  title?: string;
  description?: string;
};

export type DashboardSigningFailedDialogProps = {
  open: boolean;
  failure: DashboardSigningFailureModel | null;
  retryBusy?: boolean;
  onDismiss: () => void;
  onRetry: () => void;
};

export function DashboardLoadingState({
  profile,
  title = 'Loading profile...',
  description = 'Preparing your dashboard.',
}: DashboardLoadingStateProps) {
  const metaItems = [
    profile.profileName,
    profile.thresholdLabel,
    profile.publicKeyLabel,
    profile.memberLabel,
    profile.shareLabel,
  ].filter((item): item is string => Boolean(item));

  return (
    <section className="igloo-dashboard-loading-shell" aria-label="Loading dashboard">
      <div className="igloo-dashboard-loading-profile" aria-label="Profile being loaded">
        {metaItems.map((item, index) => (
          <React.Fragment key={`${item}-${index}`}>
            {index > 0 ? <span className="igloo-dashboard-loading-separator">·</span> : null}
            <span>{item}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="igloo-dashboard-loading-card" role="status" aria-live="polite">
        <span className="igloo-dashboard-loading-spinner" aria-hidden="true" />
        <div className="igloo-dashboard-loading-copy">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
    </section>
  );
}

export function DashboardSigningFailedDialog({
  open,
  failure,
  retryBusy = false,
  onDismiss,
  onRetry,
}: DashboardSigningFailedDialogProps) {
  const titleId = React.useId();
  if (!failure) return null;

  return (
    <Dialog
      open={open}
      onClose={onDismiss}
      className="igloo-dashboard-signing-failed-dialog"
      ariaLabelledBy={titleId}
    >
      <div className="igloo-dashboard-signing-failed-head">
        <div className="igloo-dashboard-signing-failed-title-row">
          <div className="igloo-dashboard-signing-failed-icon" aria-hidden="true">
            <CircleX />
          </div>
          <h3 id={titleId}>Signing Failed</h3>
        </div>
        <button
          type="button"
          className="igloo-dashboard-signing-failed-close"
          aria-label="Dismiss signing failure"
          onClick={onDismiss}
          disabled={retryBusy}
        >
          <X aria-hidden="true" />
        </button>
      </div>

      <div className="igloo-dashboard-signing-failed-body">
        <p>{failure.message}</p>
        <div className="igloo-dashboard-signing-failed-detail">{failure.detail}</div>
      </div>

      <div className="igloo-dashboard-signing-failed-actions">
        <Button type="button" variant="outline" onClick={onDismiss} disabled={retryBusy}>
          Dismiss
        </Button>
        <Button type="button" onClick={onRetry} loading={retryBusy} loadingLabel="Retrying...">
          Retry
        </Button>
      </div>
    </Dialog>
  );
}

export function OperatorSignerPanel({
  view,
  introMessage,
  emptyTitle = 'No onboarding profile',
  emptyDescription = 'Complete onboarding to configure this signer.',
  emptyAction,
  runtimeControlLabel,
  statusBanner,
  copiedField = null,
  onCopyGroupKey,
  onPrimaryAction,
  primaryActionVariant = 'success',
  primaryActionDisabled,
  primaryActionLoading = false,
  primaryActionLoadingLabel = 'Working...',
  onRefreshPeers,
  refreshPeersDisabled,
  refreshPeersLoading = false,
  onPingPeer,
  pingPeerDisabled = false,
  onOpenPendingApproval,
  onOpenPendingOperation,
  onClearLogs,
  clearLogsLoading = false,
}: Props) {
  const [peersExpanded, setPeersExpanded] = React.useState(true);

  if (!view) {
    return (
      <ContentCard title={emptyTitle} description={emptyDescription}>
        <div className="border border-blue-800/30 rounded-lg p-6">{emptyAction}</div>
      </ContentCard>
    );
  }

  const peerTotal = parseThresholdTotal(view.thresholdLabel) ?? view.peerRows.length;
  const peerRows = fillMissingPeerRows(view.peerRows, peerTotal, view);
  const peersOnline = peerRows.filter(
    (peer) => peer.state === 'online' || peer.state === 'idle'
  ).length;
  const peersReady = derivePeerReadyCapacity(peerRows) ?? peerRows.filter((peer) => peer.statusLabel === 'sign-ready').length;
  const averageLatency = deriveAveragePeerLatency(peerRows);
  const runtimeTone = getRuntimeTone(view);
  const pendingApprovalRows = view.pendingApprovalRows ?? [];
  const pendingApprovalIds = new Set(pendingApprovalRows.map((approval) => approval.id));
  const pendingOperationRows = view.pendingOperationRows.filter((operation) => !pendingApprovalIds.has(operation.id));
  const detailedAttention = view.attention?.details?.length ? view.attention : null;

  return (
    <div className="igloo-dashboard-signer" aria-label={introMessage}>
      <section className="igloo-dashboard-runtime-card" data-state={runtimeTone}>
        <div className="igloo-dashboard-runtime-main">
          <div className="igloo-dashboard-runtime-head">
            <span className="igloo-dashboard-runtime-dot" aria-hidden="true" />
            <h2>{getRuntimeTitle(view)}</h2>
            <DashboardPill tone="success">{formatThresholdLabel(view.thresholdLabel)}</DashboardPill>
            {view.memberLabel ? <DashboardPill tone="blue">{view.memberLabel}</DashboardPill> : null}
          </div>
          <div className="igloo-dashboard-key-list">
          {view.groupKey ? (
            <KeyRow
              label="Group Public Key"
              keyModel={view.groupKey}
              copied={copiedField === 'group'}
              onCopy={onCopyGroupKey}
              copyTestId={TID.dashboardGroupKeyCopy}
              formatTestId={TID.dashboardGroupKeyFormat}
            />
          ) : (
            <KeyField label="Group Public Key" value={view.publicKeyLabel} copied={copiedField === 'group'} onCopy={onCopyGroupKey} />
          )}
          </div>
          <div className="igloo-dashboard-relay-line">{formatRelaySummary(view.relaySummary)}</div>
        </div>
        <Button
          onClick={onPrimaryAction}
          variant={primaryActionVariant}
          className="igloo-dashboard-runtime-action"
          loading={primaryActionLoading}
          loadingLabel={primaryActionLoadingLabel}
          disabled={primaryActionDisabled}
        >
          {runtimeControlLabel}
        </Button>
      </section>

      {statusBanner ? <div className="igloo-dashboard-status-banner">{statusBanner}</div> : null}
      {view.attention && !detailedAttention ? (
        <div
          className="igloo-dashboard-attention"
          data-tone={view.attention.tone}
          data-detail={view.attention.details?.length ? 'true' : undefined}
          role="status"
        >
          <AlertTriangle aria-hidden="true" />
          <div className="igloo-dashboard-attention-body">
            <div className="igloo-dashboard-attention-copy">
              <strong>{view.attention.title}</strong>
              <span>{view.attention.description}</span>
            </div>
            {view.attention.details?.length ? (
              <div className="igloo-dashboard-attention-details">
                {view.attention.details.map((detail) => (
                  <div key={detail.label} className="igloo-dashboard-attention-detail">
                    <div className="igloo-dashboard-attention-detail-label">{detail.label}</div>
                    {detail.title || detail.description ? (
                      <div className="igloo-dashboard-attention-detail-copy">
                        {detail.title ? <strong>{detail.title}</strong> : null}
                        {detail.description ? <span>{detail.description}</span> : null}
                      </div>
                    ) : null}
                    {detail.badges?.length ? (
                      <div className="igloo-dashboard-attention-badges">
                        {detail.badges.map((badge) => (
                          <span
                            key={badge.label}
                            className="igloo-dashboard-attention-badge"
                            data-tone={badge.tone ?? 'default'}
                          >
                            {badge.label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {detail.callout ? (
                      <div className="igloo-dashboard-attention-callout">{detail.callout}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            {view.attention.actionLabel && onRefreshPeers ? (
              <Button
                type="button"
                variant="ghost"
                className="igloo-dashboard-attention-action"
                aria-label={refreshPeersLoading ? 'Retrying connections' : view.attention.actionLabel}
                onClick={onRefreshPeers}
                disabled={refreshPeersDisabled || refreshPeersLoading}
                loading={refreshPeersLoading}
                loadingLabel="Retrying..."
              >
                <RefreshCw aria-hidden="true" />
                <span>{view.attention.actionLabel}</span>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {view.running === false ? (
        <StoppedSignerCards />
      ) : detailedAttention ? (
        <DetailedAttentionCards
          attention={detailedAttention}
          onRefreshPeers={onRefreshPeers}
          refreshPeersDisabled={refreshPeersDisabled}
          refreshPeersLoading={refreshPeersLoading}
        />
      ) : (
        <>
          <DashboardSection
            title="Peers"
            help={
              <HelpHint
                ariaLabel="About signer peers"
                iconSize={14}
                content="Peer rows summarize the signer nodes this device knows about, their current reachability, and the permission methods currently exposed by policy state."
              />
            }
            meta={
              peerTotal > 0 ? (
                <>
                  <span className="igloo-dashboard-status-dot" data-state="online" aria-hidden="true" />
                  <DashboardPill tone="success">{peersOnline} online</DashboardPill>
                  <DashboardPill>{peerTotal} total</DashboardPill>
                  <DashboardPill tone="blue">~{peersReady} ready</DashboardPill>
                  {averageLatency !== null ? <DashboardPill tone="outline">Avg: {averageLatency}ms</DashboardPill> : null}
                </>
              ) : null
            }
            action={
              onRefreshPeers ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="igloo-dashboard-refresh-action"
                  aria-label={refreshPeersLoading ? 'Refreshing peers' : 'Refresh peers'}
                  onClick={onRefreshPeers}
                  disabled={refreshPeersDisabled || refreshPeersLoading}
                  loading={refreshPeersLoading}
                  loadingLabel="Refreshing..."
                >
                  <RefreshCw aria-hidden="true" />
                  <span>Refresh</span>
                </Button>
              ) : null
            }
            collapsible={{
              expanded: peersExpanded,
              onToggle: () => setPeersExpanded((current) => !current),
              collapseLabel: 'Collapse Peers',
              expandLabel: 'Expand Peers',
            }}
          >
            {peerRows.length > 0 ? (
              <PeerRows
                rows={peerRows}
                localSharePubkey={view.shareKey?.hex ?? view.shareLabel}
                onPingPeer={onPingPeer}
                pingPeerDisabled={pingPeerDisabled}
              />
            ) : (
              <div className="igloo-dashboard-empty">
                No peers are currently tracked.
              </div>
            )}
          </DashboardSection>

          <PendingApprovalsSection
            approvals={pendingApprovalRows}
            operations={pendingOperationRows}
            onOpenApproval={onOpenPendingApproval}
            onOpenOperation={onOpenPendingOperation}
          />

          <EventRows rows={view.eventRows} onClear={onClearLogs} clearLoading={clearLogsLoading} />
        </>
      )}
    </div>
  );
}

function DetailedAttentionCards({
  attention,
  onRefreshPeers,
  refreshPeersDisabled,
  refreshPeersLoading = false,
}: {
  attention: NonNullable<SignerDashboardViewModel['attention']>;
  onRefreshPeers?: () => void;
  refreshPeersDisabled?: boolean;
  refreshPeersLoading?: boolean;
}) {
  const details = attention.details ?? [];

  return (
    <div className="igloo-dashboard-stopped-grid igloo-dashboard-state-grid">
      {details.map((detail, index) => (
        <section
          key={detail.label}
          className="igloo-dashboard-stopped-card igloo-dashboard-state-card"
          role="region"
          aria-label={detail.label}
        >
          <h2>{detail.label}</h2>
          <div className="igloo-dashboard-state-copy">
            {detail.title ? <strong>{detail.title}</strong> : null}
            {detail.description ? <span>{detail.description}</span> : null}
          </div>
          {detail.badges?.length ? (
            <div className="igloo-dashboard-stopped-pills">
              {detail.badges.map((badge) => (
                <span key={badge.label} data-tone={badge.tone ?? undefined}>
                  {badge.label}
                </span>
              ))}
            </div>
          ) : null}
          {detail.callout ? <div className="igloo-dashboard-stopped-callout">{detail.callout}</div> : null}
          {index === details.length - 1 && attention.actionLabel && onRefreshPeers ? (
            <Button
              type="button"
              className="igloo-dashboard-state-action"
              aria-label={refreshPeersLoading ? 'Retrying connections' : attention.actionLabel}
              onClick={onRefreshPeers}
              disabled={refreshPeersDisabled || refreshPeersLoading}
              loading={refreshPeersLoading}
              loadingLabel="Retrying..."
            >
              <RefreshCw aria-hidden="true" />
              <span>{attention.actionLabel}</span>
            </Button>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function StoppedSignerCards() {
  return (
    <div className="igloo-dashboard-stopped-grid">
      <section className="igloo-dashboard-stopped-card">
        <h2>Readiness</h2>
        <div className="igloo-dashboard-stopped-readiness">
          <div className="igloo-dashboard-stopped-orbit" aria-hidden="true">
            <span />
          </div>
          <div className="igloo-dashboard-stopped-copy">
            <strong>Offline</strong>
            <span>Start signer to restore connectivity.</span>
          </div>
        </div>
        <div className="igloo-dashboard-stopped-pills">
          <span data-tone="danger">0 relays connected</span>
          <span data-tone="danger">0 peers online</span>
          <span>Signing unavailable</span>
        </div>
      </section>
      <section className="igloo-dashboard-stopped-card">
        <h2>Next Step</h2>
        <div className="igloo-dashboard-stopped-list">
          <span>Queued work · preserved</span>
          <span>New signing · blocked</span>
          <span>Policy prompts · paused</span>
        </div>
        <div className="igloo-dashboard-stopped-callout">Start when ready.</div>
      </section>
    </div>
  );
}

function DashboardSection({
  title,
  help,
  meta,
  action,
  collapsible,
  children,
}: {
  title: string;
  help?: React.ReactNode;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  collapsible?: {
    expanded: boolean;
    onToggle: () => void;
    collapseLabel: string;
    expandLabel: string;
  };
  children: React.ReactNode;
}) {
  return (
    <section className="igloo-dashboard-section">
      <header className="igloo-dashboard-section-header">
        {collapsible ? (
          <button
            type="button"
            className="igloo-dashboard-section-toggle"
            aria-label={collapsible.expanded ? collapsible.collapseLabel : collapsible.expandLabel}
            aria-expanded={collapsible.expanded}
            onClick={collapsible.onToggle}
          >
            <ChevronDown aria-hidden="true" className="igloo-dashboard-section-chevron" />
          </button>
        ) : (
          <ChevronDown aria-hidden="true" className="igloo-dashboard-section-chevron" />
        )}
        <h2>{title}</h2>
        {help}
        {meta ? <div className="igloo-dashboard-section-meta">{meta}</div> : null}
        <div className="igloo-dashboard-section-spacer" />
        {action}
      </header>
      {collapsible && !collapsible.expanded ? null : children}
    </section>
  );
}

function DashboardPill({
  children,
  tone = 'muted',
}: {
  children: React.ReactNode;
  tone?: 'muted' | 'blue' | 'success' | 'warning' | 'outline';
}) {
  return (
    <span className="igloo-dashboard-pill" data-tone={tone}>
      {children}
    </span>
  );
}

function PeerRows({
  rows,
  localSharePubkey,
  onPingPeer,
  pingPeerDisabled = false,
}: {
  rows: PeerReadinessRowModel[];
  localSharePubkey?: string;
  onPingPeer?: (pubkey: string) => Promise<PeerPingResult>;
  pingPeerDisabled?: boolean;
}) {
  return (
    <div className="igloo-dashboard-peer-list">
      {rows.map((peer, index) => {
        const methods = normalizePeerMethods(peer.permissionMethods, peer.statusLabel, peer.state);
        const alias = formatPeerAlias(peer.alias, index);
        const actionAlias = formatPeerActionAlias(peer.alias, index);
        const readinessLabel = formatPeerReadiness(peer);
        const latencyLabel = formatPeerLatency(peer);
        const telemetryLabel = formatPeerTelemetryLabel(peer, actionAlias, readinessLabel, latencyLabel);
        const methodsLabel = formatPeerMethodsLabel(actionAlias, methods);
        const peerKeyLabel = isLocalPeerRow(peer, localSharePubkey) ? 'This device' : truncateMiddle(peer.pubkey, 10, 6);
        return (
          <div
            key={peer.id}
            className="igloo-dashboard-peer-row"
            data-state={peer.state}
            data-has-actions={onPingPeer ? 'true' : undefined}
          >
            <div className="igloo-dashboard-peer-presence" aria-hidden="true">
              <span />
            </div>
            <div className="igloo-dashboard-peer-identity">
              <span className="igloo-dashboard-peer-alias">{alias}</span>
              <span className="igloo-dashboard-peer-key">{peerKeyLabel}</span>
              {methods.length ? (
                <span className="igloo-dashboard-peer-methods" role="group" aria-label={methodsLabel}>
                  {methods.map((method) => (
                    <PermissionToken key={method} method={method} variant="policy" as="span" />
                  ))}
                </span>
              ) : null}
            </div>
            <PeerSigningCapacityMeter peer={peer} alias={actionAlias} />
            <span className="igloo-dashboard-peer-last-seen igloo-dashboard-peer-telemetry" aria-label={telemetryLabel}>
              <span className="igloo-dashboard-peer-state-label">{readinessLabel}</span>
              {latencyLabel ? <span className="igloo-dashboard-peer-latency-label">{latencyLabel}</span> : null}
            </span>
            {onPingPeer ? (
              <PeerPingButton
                peer={peer}
                alias={actionAlias}
                localSharePubkey={localSharePubkey}
                disabled={pingPeerDisabled}
                onPingPeer={onPingPeer}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function PeerSigningCapacityMeter({ peer, alias }: { peer: PeerReadinessRowModel; alias: string }) {
  const incoming = readFiniteNumber(peer.incomingAvailable);
  const outgoing = readFiniteNumber(peer.outgoingAvailable);
  const spent = readFiniteNumber(peer.outgoingSpent);
  const hasCapacity = incoming !== null || outgoing !== null;
  const max = Math.max(incoming ?? 0, outgoing ?? 0, spent ?? 0, 1);
  const tone = peer.state === 'warning' || (hasCapacity && max < 25) ? 'warning' : 'default';
  const label = formatPeerSigningCapacityLabel(alias, incoming, outgoing, spent, hasCapacity);

  if (peer.state === 'offline' || !hasCapacity) {
    return (
      <div className="igloo-dashboard-peer-capacity" data-empty="true" aria-label={label}>
        <span />
      </div>
    );
  }

  return (
    <div className="igloo-dashboard-peer-capacity" data-tone={tone} aria-label={label}>
      <div className="igloo-dashboard-peer-capacity-bars">
        <span style={{ width: `${Math.max(8, Math.round(((incoming ?? 0) / max) * 100))}%` }} />
        <span style={{ width: `${Math.max(8, Math.round(((outgoing ?? 0) / max) * 100))}%` }} />
      </div>
      <div className="igloo-dashboard-peer-capacity-counts">
        <span>{incoming ?? '—'}</span>
        <span>{outgoing ?? '—'}</span>
      </div>
    </div>
  );
}

function PeerPingButton({
  peer,
  alias,
  localSharePubkey,
  disabled,
  onPingPeer,
}: {
  peer: PeerReadinessRowModel;
  alias: string;
  localSharePubkey?: string;
  disabled: boolean;
  onPingPeer: (pubkey: string) => Promise<PeerPingResult>;
}) {
  const [status, setStatus] = React.useState<{
    kind: 'idle' | 'loading' | 'success' | 'offline' | 'error';
    label?: string;
  }>({ kind: 'idle' });
  const unavailable = getPeerPingUnavailable(peer, localSharePubkey, alias);
  const pingable = !unavailable;
  const buttonDisabled = disabled || status.kind === 'loading' || !pingable;
  const statusLabel =
    status.kind === 'loading'
      ? 'Pinging'
      : status.kind === 'success'
        ? status.label ?? 'OK'
        : status.kind === 'offline'
          ? 'Offline'
          : status.kind === 'error'
            ? 'Failed'
            : unavailable?.label ?? 'Ping';
  const ariaStatus = status.kind === 'idle' ? '' : ` ${statusLabel}`;
  const ariaLabel = unavailable?.ariaLabel ?? `Ping ${alias}${ariaStatus}`;

  async function handleClick() {
    if (buttonDisabled) return;
    setStatus({ kind: 'loading' });
    try {
      const result = await onPingPeer(peer.pubkey);
      if (result.success) {
        setStatus({
          kind: 'success',
          label: typeof result.latency === 'number' ? `${Math.max(0, Math.round(result.latency))}ms` : 'OK',
        });
        return;
      }
      setStatus(isOfflinePingResult(result) ? { kind: 'offline' } : { kind: 'error', label: result.error });
    } catch {
      setStatus({ kind: 'error' });
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="igloo-dashboard-peer-ping"
      aria-label={ariaLabel}
      disabled={buttonDisabled}
      loading={status.kind === 'loading'}
      loadingLabel="Pinging"
      data-state={status.kind}
      data-unavailable={unavailable?.kind}
      onClick={() => void handleClick()}
    >
      <Radio aria-hidden="true" />
      <span>{statusLabel}</span>
    </Button>
  );
}

function isOfflinePingResult(result: PeerPingResult) {
  const error = result.error?.toLowerCase() ?? '';
  return error.includes('timeout') || error.includes('timed out') || error.includes('offline') || error.includes('unreachable');
}

type PeerPingUnavailable = {
  kind: 'local' | 'missing' | 'invalid';
  label: string;
  ariaLabel: string;
};

function getPeerPingUnavailable(
  peer: PeerReadinessRowModel,
  localSharePubkey: string | undefined,
  alias: string,
): PeerPingUnavailable | null {
  const normalizedPeerKey = normalizePeerPubkey(peer.pubkey);
  const normalizedLocalKey = normalizePeerPubkey(localSharePubkey);
  if (isLocalPeerRow(peer, localSharePubkey, normalizedPeerKey, normalizedLocalKey)) {
    return { kind: 'local', label: 'Local', ariaLabel: `${alias} is this device` };
  }
  if (peer.id.startsWith('missing-peer-')) {
    return { kind: 'missing', label: 'Unavailable', ariaLabel: `${alias} is unavailable to ping` };
  }
  if (!normalizedPeerKey) {
    return { kind: 'invalid', label: 'No key', ariaLabel: `${alias} cannot be pinged without a valid public key` };
  }
  return null;
}

function isLocalPeerRow(
  peer: PeerReadinessRowModel,
  localSharePubkey: string | undefined,
  normalizedPeerKey = normalizePeerPubkey(peer.pubkey),
  normalizedLocalKey = normalizePeerPubkey(localSharePubkey),
) {
  return peer.id.startsWith('local-peer-') || Boolean(normalizedPeerKey && normalizedLocalKey === normalizedPeerKey);
}

function normalizePeerPubkey(pubkey?: string) {
  const normalized = (pubkey ?? '').trim().toLowerCase();
  if (/^[0-9a-f]{64}$/.test(normalized)) return normalized;
  if (/^(02|03)[0-9a-f]{64}$/.test(normalized)) return normalized.slice(2);
  return null;
}

function PendingApprovalsSection({
  approvals,
  operations,
  onOpenApproval,
  onOpenOperation,
}: {
  approvals: PendingApprovalRowModel[];
  operations: PendingOperationRowModel[];
  onOpenApproval?: (approvalId: string) => void;
  onOpenOperation?: (operationId: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(true);
  const pendingItems = sortPendingItems([
    ...approvals.map((approval) => ({ kind: 'approval' as const, label: approval.expiresLabel, row: approval })),
    ...operations.map((operation) => ({ kind: 'operation' as const, label: operation.timeoutLabel, row: operation })),
  ]);
  const count = pendingItems.length;

  return (
    <DashboardSection
      title="Pending Approvals"
      meta={
        count > 0 ? (
          <>
            <span className="igloo-dashboard-status-dot" data-state="pending" aria-hidden="true" />
            <DashboardPill tone="warning">{count} pending</DashboardPill>
          </>
        ) : null
      }
      action={count > 0 ? <span className="igloo-dashboard-nearest"><Clock aria-hidden="true" /> Nearest: {pendingItems[0]?.label ?? 'n/a'}</span> : null}
      collapsible={{
        expanded,
        onToggle: () => setExpanded((current) => !current),
        collapseLabel: 'Collapse Pending Approvals',
        expandLabel: 'Expand Pending Approvals',
      }}
    >
        <div data-testid={TID.dashboardPendingApprovals}>
          {count > 0 ? (
            <div className="igloo-dashboard-approval-list" role="list" aria-label="Pending approval and operation rows">
              {pendingItems.map((item) =>
                item.kind === 'approval' ? (
                  <div
                    key={item.row.id}
                    className="igloo-dashboard-approval-row"
                    role="listitem"
                    aria-label={`${item.row.methodLabel} approval from ${item.row.peerLabel}: ${item.row.detailLabel}, expires ${item.row.expiresLabel}`}
                  >
                    <span className="igloo-dashboard-status-dot" data-state="pending" aria-hidden="true" />
                    {renderPermissionBadge(item.row.methodLabel)}
                    <span className="igloo-dashboard-approval-peer">{item.row.peerLabel}</span>
                    <span className="igloo-dashboard-approval-detail">{item.row.detailLabel}</span>
                    <span className="igloo-dashboard-approval-time"><Clock aria-hidden="true" /> {item.row.expiresLabel}</span>
                    <Button
                      type="button"
                      size="sm"
                      className="igloo-dashboard-open-action"
                      aria-label={`Open ${item.row.methodLabel} approval from ${item.row.peerLabel}`}
                      disabled={!onOpenApproval}
                      onClick={onOpenApproval ? () => onOpenApproval(item.row.id) : undefined}
                      static={!onOpenApproval}
                    >
                      Open
                    </Button>
                  </div>
                ) : (
                  <div
                    key={item.row.id}
                    className="igloo-dashboard-approval-row"
                    role="listitem"
                    aria-label={`${item.row.operationLabel} operation for ${item.row.thresholdLabel}: ${item.row.responseLabel}, started ${item.row.startedLabel}, expires ${item.row.timeoutLabel}`}
                  >
                    <span className="igloo-dashboard-status-dot" data-state="pending" aria-hidden="true" />
                    {renderPermissionBadge(item.row.operationLabel)}
                    <span className="igloo-dashboard-approval-peer">{item.row.thresholdLabel}</span>
                    <span className="igloo-dashboard-approval-detail">
                      {item.row.responseLabel} · started {item.row.startedLabel} · {truncateMiddle(item.row.id, 8, 6)}
                    </span>
                    <span className="igloo-dashboard-approval-time"><Clock aria-hidden="true" /> {item.row.timeoutLabel}</span>
                    <Button
                      type="button"
                      size="sm"
                      className="igloo-dashboard-open-action"
                      aria-label={`Open ${item.row.operationLabel} operation for ${item.row.thresholdLabel}`}
                      disabled={!onOpenOperation}
                      onClick={onOpenOperation ? () => onOpenOperation(item.row.id) : undefined}
                      static={!onOpenOperation}
                    >
                      Open
                    </Button>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="igloo-dashboard-empty">
              No pending approvals or operations.
            </div>
          )}
        </div>
      </DashboardSection>
  );
}

type PendingItem =
  | { kind: 'approval'; label: string; row: PendingApprovalRowModel }
  | { kind: 'operation'; label: string; row: PendingOperationRowModel };

function sortPendingItems(items: PendingItem[]) {
  return items
    .map((item, index) => ({ item, index, sortValue: readPendingSortValue(item.label) }))
    .sort((left, right) => left.sortValue - right.sortValue || left.index - right.index)
    .map(({ item }) => item);
}

function readPendingSortValue(label: string) {
  const relative = readRelativeDurationMs(label);
  if (relative !== null) return relative;
  const absolute = Date.parse(label);
  return Number.isFinite(absolute) ? absolute : Number.POSITIVE_INFINITY;
}

function readRelativeDurationMs(label: string) {
  const normalized = label.trim().toLowerCase();
  const minuteMatch = normalized.match(/(\d+)\s*m/);
  const secondMatch = normalized.match(/(\d+)\s*s/);
  if (!minuteMatch && !secondMatch) return null;
  const minutes = minuteMatch ? Number.parseInt(minuteMatch[1], 10) : 0;
  const seconds = secondMatch ? Number.parseInt(secondMatch[1], 10) : 0;
  return (minutes * 60 + seconds) * 1000;
}

function FilterChip({
  label,
  active,
  disabled = false,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-pressed={active}
      disabled={disabled}
      className="igloo-dashboard-filter-chip"
      data-active={active ? 'true' : undefined}
    >
      {label}
    </button>
  );
}

function EventRows({
  rows,
  onClear,
  clearLoading = false,
}: {
  rows: EventLogRowModel[];
  onClear?: () => void;
  clearLoading?: boolean;
}) {
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState(true);

  // Distinct domain tags present in the current rows drive the filter chips.
  const domains = React.useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const row of rows) {
      if (!seen.has(row.badgeLabel)) {
        seen.add(row.badgeLabel);
        ordered.push(row.badgeLabel);
      }
    }
    return ordered;
  }, [rows]);
  const filterDomains = domains;
  const filterControlId = React.useId();

  // A filter that no longer matches any row (e.g. after Clear) falls back to All.
  const effectiveFilter = activeFilter && filterDomains.includes(activeFilter) ? activeFilter : null;
  const visibleRows = effectiveFilter ? rows.filter((row) => row.badgeLabel === effectiveFilter) : rows;
  const showFilterControl = filterDomains.length > 0;
  const filterDisabled = clearLoading;
  const eventCountLabel = effectiveFilter
    ? `${visibleRows.length} of ${rows.length} ${rows.length === 1 ? 'event' : 'events'}`
    : `${rows.length} ${rows.length === 1 ? 'event' : 'events'}`;

  return (
    <DashboardSection
      title="Event Log"
      help={
        <HelpHint
          ariaLabel="About signer event log"
          iconSize={14}
          content="Event rows summarize recent signer activity, including sync, signing, ECDH, policy, and relay messages visible to this browser session."
        />
      }
      meta={<DashboardPill>{eventCountLabel}</DashboardPill>}
      collapsible={{
        expanded,
        onToggle: () => setExpanded((current) => !current),
        collapseLabel: 'Collapse Event Log',
        expandLabel: 'Expand Event Log',
      }}
      action={
        <div className="igloo-dashboard-log-actions">
          {onClear ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="igloo-dashboard-clear-action"
              loading={clearLoading}
              loadingLabel="Clearing..."
              disabled={clearLoading || rows.length === 0}
              onClick={onClear}
            >
              Clear
            </Button>
          ) : null}
          {showFilterControl ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="igloo-dashboard-filter-control"
              aria-expanded={filterOpen}
              aria-controls={filterControlId}
              disabled={filterDisabled}
              loading={filterDisabled}
              onClick={() => {
                if (filterDisabled) return;
                setFilterOpen((open) => !open);
              }}
            >
              <Filter aria-hidden="true" />
              <span>Filter</span>
              <DashboardPill tone="blue">{filterDomains.length} types</DashboardPill>
              <ChevronDown aria-hidden="true" className="igloo-dashboard-filter-caret" />
            </Button>
          ) : null}
        </div>
      }
    >
      {showFilterControl && filterOpen ? (
        <div className="igloo-dashboard-filter-row" id={filterControlId} role="group" aria-label="Event Log filters">
          <FilterChip
            label="All"
            active={effectiveFilter === null}
            disabled={filterDisabled}
            onClick={() => setActiveFilter(null)}
          />
          {filterDomains.map((domain) => (
            <FilterChip
              key={domain}
              label={domain}
              active={effectiveFilter === domain}
              disabled={filterDisabled}
              onClick={() => setActiveFilter(domain)}
            />
          ))}
        </div>
      ) : null}
      {rows.length === 0 ? (
        <div className="igloo-dashboard-empty">
          No events captured yet.
        </div>
      ) : (
        <div className="igloo-dashboard-log-list" role="log" aria-label="Event Log entries">
          {visibleRows.map((row) => (
            <div
              key={row.id}
              className="igloo-dashboard-log-row"
              role="article"
              aria-label={`${normalizeEventLogSummaryDomain(row.badgeLabel)} event: ${row.message}`}
            >
              <span className="igloo-dashboard-log-time">{row.timestampLabel ?? '--:--'}</span>
              {renderEventLogBadge(row.badgeLabel, row.badgeTone)}
              <span className="igloo-dashboard-log-message">{row.message}</span>
            </div>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

function normalizeEventLogSummaryDomain(domain: string) {
  const normalized = domain.trim().toLowerCase();
  if (normalized === 'signer policy') return 'policy';
  if (normalized === 'onboarding') return 'onboard';
  return normalized;
}

function renderPermissionBadge(label: string, tone?: EventLogRowModel['badgeTone']) {
  const method = normalizePermissionMethod(label);
  if (method) {
    return <PermissionToken method={method} variant="policy" as="span" label={label.toUpperCase()} />;
  }

  return (
    <span className="igloo-dashboard-domain-badge" data-tone={tone ?? 'default'}>
      {label}
    </span>
  );
}

function renderEventLogBadge(label: string, tone: EventLogRowModel['badgeTone']) {
  return (
    <span className="igloo-dashboard-domain-badge" data-tone={tone}>
      {label}
    </span>
  );
}

function normalizePeerMethods(
  methods: readonly PermissionMethodKey[] | undefined,
  statusLabel: string,
  state?: PeerReadinessRowModel['state'],
) {
  if (state === 'offline') return [];
  if (methods?.length) return methods;
  return statusLabel === 'sign-ready' ? (['sign'] satisfies PermissionMethodKey[]) : [];
}

function parseThresholdTotal(label: string) {
  const slashMatch = label.match(/^\d+\s*\/\s*(\d+)$/);
  if (slashMatch) return Number.parseInt(slashMatch[1], 10);
  const wordsMatch = label.match(/^\d+\s+of\s+(\d+)$/i);
  return wordsMatch ? Number.parseInt(wordsMatch[1], 10) : null;
}

function fillMissingPeerRows(
  rows: PeerReadinessRowModel[],
  total: number,
  view: SignerDashboardViewModel,
) {
  if (!Number.isFinite(total) || total <= rows.length) return sortPeerRows(rows);
  const nextRows = [...rows];
  const usedIndexes = new Set(
    rows
      .map((row) => readPeerIndex(row.alias))
      .filter((index): index is number => index !== null),
  );
  const localIndex = readMemberIndex(view.memberLabel);
  for (let index = 1; index <= total; index += 1) {
    if (usedIndexes.has(index)) continue;
    if (index === localIndex) {
      nextRows.push({
        id: `local-peer-${index}`,
        alias: `Peer #${index}`,
        pubkey: view.shareKey?.display ?? view.shareLabel,
        state: view.running === false ? 'offline' : 'online',
        statusLabel: view.running === false ? 'offline' : 'sign-ready',
        permissionMethods: view.running === false ? [] : ['sign', 'ping'],
      });
      continue;
    }
    nextRows.push({
      id: `missing-peer-${index}`,
      alias: `Peer #${index}`,
      pubkey: 'Unknown member',
      state: 'offline',
      statusLabel: 'offline',
    });
  }
  return sortPeerRows(nextRows);
}

function sortPeerRows(rows: PeerReadinessRowModel[]) {
  return [...rows].sort((left, right) => (readPeerIndex(left.alias) ?? 999) - (readPeerIndex(right.alias) ?? 999));
}

function getRuntimeTone(view: SignerDashboardViewModel) {
  if (view.running === false) return 'stopped';
  return /degraded|warning|blocked|offline/i.test(view.readinessLabel) ? 'warning' : 'running';
}

function getRuntimeTitle(view: SignerDashboardViewModel) {
  if (view.running === false) return 'Signer Stopped';
  if (/signer/i.test(view.readinessLabel)) return view.readinessLabel;
  return 'Signer Running';
}

function formatThresholdLabel(label: string) {
  const match = label.match(/^(\d+)\s*\/\s*(\d+)$/);
  return match ? `${match[1]} of ${match[2]}` : label;
}

function formatRelaySummary(summary: string) {
  if (!summary) return 'No relay status yet';
  if (/^(all |connected|policy|runtime|signer|relays|no )/i.test(summary)) return summary;
  return `Connected to ${summary}`;
}

function formatPeerAlias(alias: string, index: number) {
  const peerNumber = readPeerIndex(alias);
  return peerNumber !== null ? `#${peerNumber}` : alias || `#${index}`;
}

function formatPeerActionAlias(alias: string, index: number) {
  const peerNumber = readPeerIndex(alias);
  return peerNumber !== null ? `Peer #${peerNumber}` : alias || `Peer #${index}`;
}

function readPeerIndex(alias: string) {
  const peerNumber = alias.match(/^peer\s+#?(\d+)$/i)?.[1];
  return peerNumber ? Number.parseInt(peerNumber, 10) : null;
}

function readMemberIndex(label: string | undefined) {
  const memberNumber = label?.match(/^share\s+#?(\d+)$/i)?.[1];
  return memberNumber ? Number.parseInt(memberNumber, 10) : null;
}

function derivePeerReadyCapacity(rows: PeerReadinessRowModel[]) {
  let hasCapacity = false;
  const total = rows.reduce((sum, peer) => {
    if (peer.state === 'offline') return sum;
    const incoming = readFiniteNumber(peer.incomingAvailable);
    const outgoing = readFiniteNumber(peer.outgoingAvailable);
    const spent = readFiniteNumber(peer.outgoingSpent) ?? 0;
    if (incoming === null && outgoing === null) return sum;
    hasCapacity = true;
    return sum + Math.max(0, (incoming ?? 0) + (outgoing ?? 0) - spent);
  }, 0);
  return hasCapacity ? total : null;
}

function deriveAveragePeerLatency(rows: PeerReadinessRowModel[]) {
  const latencies = rows
    .filter((peer) => peer.state !== 'offline')
    .map((peer) => readFiniteNumber(peer.latencyMs))
    .filter((latency): latency is number => latency !== null);
  if (!latencies.length) return null;
  return Math.round(latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length);
}

function readFiniteNumber(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function formatPeerReadiness(peer: PeerReadinessRowModel) {
  if (peer.state === 'offline') return 'Offline';
  if (peer.statusLabel === 'sign-ready') return 'Ready';
  if (peer.statusLabel === 'known') return 'Known';
  if (peer.statusLabel === 'online') return 'Online';
  if (peer.state === 'idle') return 'Idle';
  if (peer.state === 'warning') return 'Known';
  return peer.statusLabel;
}

function formatPeerLatency(peer: PeerReadinessRowModel) {
  const latency = readFiniteNumber(peer.latencyMs);
  return latency === null ? null : `${Math.round(latency)}ms`;
}

function formatPeerTelemetryLabel(
  peer: PeerReadinessRowModel,
  alias: string,
  readinessLabel: string,
  latencyLabel: string | null,
) {
  return `${alias} telemetry: ${[readinessLabel, latencyLabel, peer.lastSeenLabel].filter(Boolean).join(', ')}`;
}

function formatPeerMethodsLabel(alias: string, methods: readonly PermissionMethodKey[]) {
  return `${alias} methods: ${methods.map((method) => method.toUpperCase()).join(', ')}`;
}

function formatPeerSigningCapacityLabel(
  alias: string,
  incoming: number | null,
  outgoing: number | null,
  spent: number | null,
  hasCapacity: boolean,
) {
  if (!hasCapacity && spent === null) return `${alias} signing capacity unavailable`;
  const parts = [`${formatCapacityCount(incoming)} incoming`, `${formatCapacityCount(outgoing)} outgoing`];
  if (spent !== null) parts.push(`${Math.max(0, Math.round(spent))} spent`);
  return `${alias} signing capacity: ${parts.join(', ')}`;
}

function formatCapacityCount(value: number | null) {
  return value === null ? 'n/a' : String(Math.max(0, Math.round(value)));
}

function truncateMiddle(value: string, lead = 8, tail = 6) {
  if (value.length <= lead + tail + 3) return value;
  return `${value.slice(0, lead)}...${value.slice(-tail)}`;
}

function getNearestPendingLabel(
  approvals: PendingApprovalRowModel[],
  operations: PendingOperationRowModel[],
) {
  return approvals[0]?.expiresLabel ?? operations[0]?.timeoutLabel ?? 'n/a';
}

function KeyField({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="igloo-dashboard-key-field">
      <div className="igloo-dashboard-key-label">{label}</div>
      <div className="igloo-dashboard-key-input-row">
        <Input
          type="text"
          value={value}
          className="h-10 w-full bg-gray-800/50 border-gray-700/50 py-2 text-sm font-mono text-blue-300"
          readOnly
        />
        {onCopy ? (
          <Tooltip
            content={`Copy ${label}`}
            tooltipClassName="max-w-[14rem]"
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Copy ${label}`}
                onClick={onCopy}
                className="shrink-0 bg-blue-800/30 text-blue-400 hover:bg-blue-800/50 hover:text-blue-300"
              >
                <Copy className="h-5 w-5" />
              </Button>
            }
          />
        ) : null}
      </div>
      {copied ? <div className="text-xs text-blue-300">{label} copied</div> : null}
    </div>
  );
}

// Identity-card key row: a fixed-width label lane, the truncated key value, and a
// split copy control. The main button copies npub by default; the caret toggles a
// small menu to copy the hex encoding instead. onCopy receives the chosen format.
function KeyRow({
  label,
  keyModel,
  copied,
  onCopy,
  copyTestId,
  formatTestId,
}: {
  label: string;
  keyModel: DashboardKeyModel;
  copied: boolean;
  onCopy?: (format: 'npub' | 'hex') => void;
  copyTestId: string;
  formatTestId: string;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Dismiss the npub/hex format menu when clicking anywhere outside the control.
  React.useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuContainerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuOpen]);

  return (
    <div className="igloo-dashboard-key-row">
      <span className="igloo-dashboard-key-label">{label}</span>
      <span className="igloo-dashboard-key-value">{keyModel.display}</span>
      <div ref={menuContainerRef} className="igloo-dashboard-copy-control">
        <Tooltip
          content={`Copy ${label} as npub`}
          tooltipClassName="max-w-[14rem]"
          trigger={
            <button
              type="button"
              data-testid={copyTestId}
              aria-label={`Copy ${label} as npub`}
              onClick={() => onCopy?.('npub')}
              className="igloo-dashboard-copy-main"
            >
              <Copy className="h-3 w-3" />
              npub
            </button>
          }
        />
        <Tooltip
          content={`Copy ${label} in another format`}
          tooltipClassName="max-w-[14rem]"
          trigger={
            <button
              type="button"
              data-testid={formatTestId}
              onClick={() => setMenuOpen((open) => !open)}
              className="igloo-dashboard-copy-format"
              aria-label={`Copy ${label} in another format`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          }
        />
        {menuOpen ? (
          <div className="igloo-dashboard-copy-menu" role="menu">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onCopy?.('npub');
                setMenuOpen(false);
              }}
            >
              Copy npub
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onCopy?.('hex');
                setMenuOpen(false);
              }}
            >
              Copy hex
            </button>
          </div>
        ) : null}
      </div>
      {copied ? <span className="text-xs text-blue-300">copied</span> : null}
    </div>
  );
}
