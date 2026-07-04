import * as React from 'react';
import { ChevronDown, ChevronRight, Clock, Copy, Filter, Radio, RefreshCw, ShieldAlert, X } from 'lucide-react';

import type {
  DashboardKeyModel,
  EventLogRowModel,
  PeerReadinessRowModel,
  PendingApprovalRowModel,
  SignerDashboardViewModel,
} from '../../models/view-models';
import type { DashboardBanner } from '../../models/dashboard-state';
import { CRITICAL_E2E_TEST_IDS as TID } from '../../lib/e2e-test-ids';
import { methodToneClass } from '../../lib/method-tone';
import { Button } from '../ui/button';
import { ContentCard } from '../ui/content-card';
import { Input } from '../ui/input';

type Props = {
  view: SignerDashboardViewModel | null;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  runtimeControlLabel: string;
  statusBanner?: React.ReactNode;
  copiedField?: 'group' | 'share' | null;
  // Receives the chosen format from the split-copy control. The legacy KeyField
  // fallback ignores the argument, so a plain `() => void` handler is still valid.
  onCopyGroupKey?: (format?: 'npub' | 'hex') => void;
  onCopyShareKey?: (format?: 'npub' | 'hex') => void;
  onPrimaryAction: () => void;
  primaryActionVariant?: 'default' | 'destructive' | 'success' | 'secondary';
  primaryActionDisabled?: boolean;
  onRefreshPeers?: () => void;
  refreshPeersDisabled?: boolean;
  availabilityIssue?: Extract<DashboardBanner, { kind: 'all-relays-offline' | 'signing-blocked' }> | null;
  onPingPeer?: (pubkey: string) => void;
  pingPeerDisabled?: boolean;
  pingingPeerPubkey?: string | null;
  onClearLogs?: () => void;
  // Pending-approval decisions. When omitted, the card stays read-only.
  onApproveOnce?: (id: string) => void;
  onAlwaysAllow?: (id: string) => void;
  onDenyApproval?: (id: string) => void;
};

export function OperatorSignerPanel({
  view,
  emptyTitle = 'No onboarding profile',
  emptyDescription = 'Complete onboarding to configure this signer.',
  emptyAction,
  runtimeControlLabel,
  statusBanner,
  copiedField = null,
  onCopyGroupKey,
  onCopyShareKey,
  onPrimaryAction,
  primaryActionDisabled,
  onRefreshPeers,
  refreshPeersDisabled,
  availabilityIssue = null,
  onPingPeer,
  pingPeerDisabled,
  pingingPeerPubkey,
  onClearLogs,
  onApproveOnce,
  onAlwaysAllow,
  onDenyApproval,
}: Props) {
  if (!view) {
    return (
      <ContentCard title={emptyTitle} description={emptyDescription}>
        <div className="border border-blue-800/30 rounded-lg p-6">{emptyAction}</div>
      </ContentCard>
    );
  }

  const running = Boolean(view.running);

  return (
    <div className="igloo-dashboard">
      <StatusCard
        view={view}
        running={running}
        availabilityIssue={availabilityIssue}
        runtimeControlLabel={runtimeControlLabel}
        onPrimaryAction={onPrimaryAction}
        primaryActionDisabled={primaryActionDisabled}
        copiedField={copiedField}
        onCopyGroupKey={onCopyGroupKey}
        onCopyShareKey={onCopyShareKey}
      />

      {statusBanner ? statusBanner : null}

      {running ? (
        availabilityIssue ? (
          <UnavailableState issue={availabilityIssue} view={view} onRetry={onRefreshPeers} retryDisabled={refreshPeersDisabled} />
        ) : (
          <>
            <PeersSection
              rows={view.peerRows}
              onRefresh={onRefreshPeers}
              refreshDisabled={refreshPeersDisabled}
              onPingPeer={onPingPeer}
              pingDisabled={pingPeerDisabled}
              pingingPeerPubkey={pingingPeerPubkey}
            />
            <PendingApprovalsSection
              rows={view.pendingApprovalRows ?? []}
              onApproveOnce={onApproveOnce}
              onAlwaysAllow={onAlwaysAllow}
              onDenyApproval={onDenyApproval}
            />
            <EventLogSection rows={view.eventRows} onClear={onClearLogs} />
          </>
        )
      ) : (
        <div className="igloo-dashboard-stopped-grid">
          <ReadinessCard />
          <NextStepCard />
        </div>
      )}
    </div>
  );
}

function StatusCard({
  view,
  running,
  availabilityIssue,
  runtimeControlLabel,
  onPrimaryAction,
  primaryActionDisabled,
  copiedField,
  onCopyGroupKey,
  onCopyShareKey,
}: {
  view: SignerDashboardViewModel;
  running: boolean;
  availabilityIssue?: Extract<DashboardBanner, { kind: 'all-relays-offline' | 'signing-blocked' }> | null;
  runtimeControlLabel: string;
  onPrimaryAction: () => void;
  primaryActionDisabled?: boolean;
  copiedField?: 'group' | 'share' | null;
  onCopyGroupKey?: (format?: 'npub' | 'hex') => void;
  onCopyShareKey?: (format?: 'npub' | 'hex') => void;
}) {
  const degraded = running && Boolean(availabilityIssue);
  const toneClass = degraded ? 'is-degraded' : running ? 'is-running' : 'is-stopped';
  const connectionLabel = availabilityIssue ? availabilityStatusDetail(availabilityIssue) : view.relaySummary;

  return (
    <div className="igloo-dashboard-status">
      <div className="igloo-dashboard-status-main">
        <div className="igloo-dashboard-status-head">
          <span className={`igloo-dashboard-status-dot ${toneClass}`} />
          <span className={`igloo-dashboard-status-title ${toneClass}`}>
            {view.readinessLabel}
          </span>
          <span className="igloo-dashboard-chip is-threshold">{view.thresholdLabel}</span>
          {view.memberLabel ? <span className="igloo-dashboard-chip is-member">{view.memberLabel}</span> : null}
        </div>

        <div className="igloo-dashboard-status-keys">
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
          {!running ? (
            view.shareKey ? (
              <KeyRow
                label="Share Public Key"
                keyModel={view.shareKey}
                copied={copiedField === 'share'}
                onCopy={onCopyShareKey}
                copyTestId={TID.dashboardShareKeyCopy}
                formatTestId={TID.dashboardShareKeyFormat}
              />
            ) : (
              <KeyField label="Share Public Key" value={view.shareLabel} copied={copiedField === 'share'} onCopy={onCopyShareKey} />
            )
          ) : null}
        </div>

        <div className="igloo-dashboard-status-connection">{connectionLabel}</div>
      </div>

      <button
        type="button"
        className={`igloo-dashboard-status-action ${running ? 'is-stop' : 'is-start'} self-start`}
        onClick={onPrimaryAction}
        disabled={primaryActionDisabled}
      >
        {runtimeControlLabel}
      </button>
    </div>
  );
}

function availabilityStatusDetail(issue: Extract<DashboardBanner, { kind: 'all-relays-offline' | 'signing-blocked' }>) {
  if (issue.kind === 'all-relays-offline') {
    return 'All relays unreachable · signing degraded.';
  }
  return 'Policy or readiness gate active.';
}

function UnavailableState({
  issue,
  view,
  onRetry,
  retryDisabled,
}: {
  issue: Extract<DashboardBanner, { kind: 'all-relays-offline' | 'signing-blocked' }>;
  view: SignerDashboardViewModel;
  onRetry?: () => void;
  retryDisabled?: boolean;
}) {
  const signingReady = view.peerRows.filter((peer) => (peer.state === 'online' || peer.state === 'idle') && peer.canSign).length;
  const remoteRequired = Math.max(parseThresholdRequired(view.thresholdLabel) - 1, 0);

  if (issue.kind === 'all-relays-offline') {
    return (
      <div className="igloo-dashboard-unavailable-grid" data-testid="dashboard-banner-all-relays-offline">
        <section className="igloo-dashboard-card">
          <span className="igloo-dashboard-card-label">Readiness</span>
          <div className="igloo-dashboard-readiness-body">
            <span className="igloo-dashboard-readiness-disc" aria-hidden="true">
              <span className="igloo-dashboard-readiness-disc-inner">
                <span className="igloo-dashboard-readiness-disc-dot" />
              </span>
            </span>
            <div>
              <div className="igloo-dashboard-readiness-title">All Relays Offline</div>
              <div className="igloo-dashboard-readiness-detail">No relay route to peers.</div>
            </div>
          </div>
          <div className="igloo-dashboard-readiness-badges">
            <span className="igloo-dashboard-pill is-danger">
              {issue.connectedCount} / {issue.configuredCount} relays reachable
            </span>
            <span className="igloo-dashboard-pill is-warning">Ready count degraded</span>
          </div>
        </section>
        <section className="igloo-dashboard-card">
          <span className="igloo-dashboard-card-label">Recovery</span>
          <div className="igloo-dashboard-nextstep-lines">
            <span>Check network, DNS, and firewall.</span>
          </div>
          <div className="igloo-dashboard-nextstep-note">Blocked until a relay connects.</div>
          {onRetry ? (
            <button
              type="button"
              className="igloo-dashboard-retry-action"
              onClick={onRetry}
              disabled={retryDisabled}
            >
              <RefreshCw size={14} aria-hidden="true" />
              Retry Connections
            </button>
          ) : null}
        </section>
      </div>
    );
  }

  return (
    <div className="igloo-dashboard-unavailable-grid" data-testid="dashboard-banner-signing-blocked">
      <section className="igloo-dashboard-card">
        <span className="igloo-dashboard-card-label">Common Causes</span>
        <div className="igloo-dashboard-readiness-body">
          <div>
            <div className="igloo-dashboard-readiness-title">Signing Blocked</div>
            <div className="igloo-dashboard-readiness-detail">
              {issue.reason === 'policy' ? 'Requests held pending clearance.' : 'Not enough peers are ready.'}
            </div>
          </div>
        </div>
        <div className="igloo-dashboard-readiness-badges">
          {issue.reason === 'policy' ? <span className="igloo-dashboard-pill is-warning">Policy decision pending</span> : null}
          <span className="igloo-dashboard-pill is-warning">Not enough ready peers</span>
          <span className="igloo-dashboard-pill is-warning">Pool imbalance</span>
        </div>
      </section>
      <section className="igloo-dashboard-card">
        <span className="igloo-dashboard-card-label">Operator Action</span>
        <div className="igloo-dashboard-nextstep-lines">
          <span>{issue.reason === 'policy' ? 'Clear via permissions or approvals.' : 'Bring another signer online.'}</span>
        </div>
        <div className="igloo-dashboard-nextstep-note">
          {issue.reason === 'policy'
            ? 'Peer policy is denying signing. Review Permissions or approve pending requests.'
            : remoteRequired === 0
              ? 'No remote signing peers are required for this threshold. Refresh peers or review local readiness.'
              : `${signingReady} of ${remoteRequired} signing peers are ready. Bring another signing peer online before approving signatures.`}
        </div>
      </section>
    </div>
  );
}

function parseThresholdRequired(label: string) {
  const match = label.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) || 1 : 1;
}

function toNum(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function PeersSection({
  rows,
  onRefresh,
  refreshDisabled,
  onPingPeer,
  pingDisabled,
  pingingPeerPubkey,
}: {
  rows: PeerReadinessRowModel[];
  onRefresh?: () => void;
  refreshDisabled?: boolean;
  onPingPeer?: (pubkey: string) => void;
  pingDisabled?: boolean;
  pingingPeerPubkey?: string | null;
}) {
  const total = rows.length;
  const online = rows.filter((peer) => peer.state === 'online' || peer.state === 'idle').length;
  const readyPeers = rows.filter((peer) => peer.statusLabel === 'sign-ready').length;
  const readyCapacity = rows.reduce((sum, peer) => sum + (toNum(peer.incomingAvailable) ?? 0), 0);
  const latencies = rows.map((peer) => peer.avgLatencyMs).filter((ms): ms is number => ms != null);
  const avgLatency = latencies.length
    ? Math.round(latencies.reduce((sum, ms) => sum + ms, 0) / latencies.length)
    : null;

  return (
    <section className="igloo-dashboard-section">
      <header className="igloo-dashboard-section-head">
        <span className="igloo-dashboard-section-title">Peers</span>
        {total > 0 ? (
          <>
            <span className="igloo-dashboard-count is-online">{online} online</span>
            <span className="igloo-dashboard-count is-total">{total} total</span>
            <span className="igloo-dashboard-section-spacer" />
            <span className="igloo-dashboard-count is-ready">
              {readyCapacity > 0 ? `~${readyCapacity} ready` : `${readyPeers} ready`}
            </span>
            {avgLatency != null ? <span className="igloo-dashboard-count is-avg">Avg: {avgLatency}ms</span> : null}
          </>
        ) : (
          <span className="igloo-dashboard-section-spacer" />
        )}
        {onRefresh ? (
          <button
            type="button"
            className="igloo-dashboard-clear"
            onClick={onRefresh}
            disabled={refreshDisabled}
            aria-label="Refresh Peers"
            title="Refresh Peers"
          >
            <RefreshCw size={14} aria-hidden="true" />
          </button>
        ) : null}
      </header>
      {total > 0 ? (
        rows.map((peer) => (
          <PeerRow
            key={peer.id}
            peer={peer}
            onPingPeer={onPingPeer}
            pingDisabled={pingDisabled}
            pinging={pingingPeerPubkey === peer.pubkey}
          />
        ))
      ) : (
        <div className="igloo-dashboard-empty">No peers are currently tracked.</div>
      )}
    </section>
  );
}

function PeerRow({
  peer,
  onPingPeer,
  pingDisabled,
  pinging,
}: {
  peer: PeerReadinessRowModel;
  onPingPeer?: (pubkey: string) => void;
  pingDisabled?: boolean;
  pinging?: boolean;
}) {
  const online = peer.state === 'online' || peer.state === 'idle';
  const incoming = toNum(peer.incomingAvailable);
  const outgoing = toNum(peer.outgoingAvailable);
  const denom = Math.max(incoming ?? 0, outgoing ?? 0, 1);
  const showMeter = incoming != null || outgoing != null;
  const aliasLabel = peer.alias.replace(/^Peer\s+/, '');
  const isLocal = peer.statusLabel === 'local';
  const pingAvailable = Boolean(onPingPeer && online && peer.canPing && !isLocal);
  const actionLabel = isLocal ? 'Local' : pingAvailable ? (pinging ? 'Pinging' : 'Ping') : 'Unavailable';

  return (
    <div className="igloo-dashboard-peer-row">
      <span className={`igloo-dashboard-peer-avatar ${online ? 'is-online' : 'is-offline'}`} aria-hidden="true">
        <span className="igloo-dashboard-peer-avatar-inner">
          <span className="igloo-dashboard-peer-avatar-dot" />
        </span>
      </span>
      <div className="igloo-dashboard-peer-main">
        <span className="igloo-dashboard-peer-id">{aliasLabel}</span>
        <span className="igloo-dashboard-peer-sep">·</span>
        <span className="igloo-dashboard-peer-key">{shortKey(peer.pubkey)}</span>
        <span className="igloo-dashboard-caps">
          <Cap label="SIGN" tone="sign" capable={peer.canSign} />
          <Cap label="ECDH" tone="ecdh" capable={peer.canEcdh} />
          <Cap label="PING" tone="ping" capable={peer.canPing} />
        </span>
      </div>
      <div className="igloo-dashboard-peer-meter">
        {showMeter ? (
          <>
            <span
              className="igloo-dashboard-bars"
              title={`Incoming ${incoming ?? 'n/a'} · Outgoing ${outgoing ?? 'n/a'}`}
            >
              <span className="igloo-dashboard-bar">
                <span className="igloo-dashboard-bar-fill" style={{ width: `${((incoming ?? 0) / denom) * 100}%` }} />
              </span>
              <span className="igloo-dashboard-bar">
                <span
                  className="igloo-dashboard-bar-fill is-dim"
                  style={{ width: `${((outgoing ?? 0) / denom) * 100}%` }}
                />
              </span>
            </span>
            <span className="igloo-dashboard-meter-values" aria-hidden="true">
              <span>{incoming ?? '—'}</span>
              <span>{outgoing ?? '—'}</span>
            </span>
          </>
        ) : null}
      </div>
      <span className={`igloo-dashboard-peer-latency ${online ? '' : 'is-idle'}`}>
        {online ? formatLatency(peer) : 'Offline'}
      </span>
      <button
        type="button"
        className={`igloo-dashboard-peer-action ${pingAvailable ? 'is-available' : 'is-unavailable'}`}
        onClick={() => onPingPeer?.(peer.pubkey)}
        disabled={!pingAvailable || pingDisabled || pinging}
        aria-label={`${actionLabel} ${peer.alias}`}
        title={pingAvailable ? `Ping ${peer.alias}` : actionLabel}
      >
        <Radio size={12} aria-hidden="true" />
        <span>{actionLabel}</span>
      </button>
    </div>
  );
}

function Cap({ label, tone, capable }: { label: string; tone: 'sign' | 'ecdh' | 'ping'; capable: boolean }) {
  return (
    <span
      className={`igloo-dashboard-cap ${capable ? `is-${tone}` : 'is-off'}`}
      aria-label={`${label} ${capable ? 'capable' : 'unavailable'}`}
    >
      {label}
    </span>
  );
}

// `last (avg N ms)` PING latency, or an em-dash until a ping has completed.
function formatLatency(peer: PeerReadinessRowModel): React.ReactNode {
  if (peer.lastResponseLatencyMs == null) return '—';
  return `${peer.lastResponseLatencyMs}ms`;
}

function shortKey(pubkey: string): string {
  if (pubkey.length <= 14) return pubkey;
  return `${pubkey.slice(0, 6)}…${pubkey.slice(-4)}`;
}

function PendingApprovalsSection({
  rows,
  onApproveOnce,
  onAlwaysAllow,
  onDenyApproval,
}: {
  rows: PendingApprovalRowModel[];
  onApproveOnce?: (id: string) => void;
  onAlwaysAllow?: (id: string) => void;
  onDenyApproval?: (id: string) => void;
}) {
  const interactive = Boolean(onApproveOnce || onAlwaysAllow || onDenyApproval);
  const [activeApprovalId, setActiveApprovalId] = React.useState<string | null>(null);
  const activeApproval = activeApprovalId ? rows.find((approval) => approval.id === activeApprovalId) : null;
  const nearest = rows[0]?.expiresLabel;

  React.useEffect(() => {
    if (activeApprovalId && !rows.some((approval) => approval.id === activeApprovalId)) {
      setActiveApprovalId(null);
    }
  }, [activeApprovalId, rows]);

  const closePrompt = () => setActiveApprovalId(null);
  const resolve = (callback: ((id: string) => void) | undefined, approval: PendingApprovalRowModel) => {
    callback?.(approval.id);
    closePrompt();
  };

  return (
    <section className="igloo-dashboard-section">
      <header className="igloo-dashboard-section-head">
        {rows.length > 0 ? <span className="igloo-dashboard-approval-spark" aria-hidden="true">*</span> : null}
        <span className="igloo-dashboard-section-title">Pending Approvals</span>
        {rows.length > 0 ? <span className="igloo-dashboard-count is-pending">{rows.length} pending</span> : null}
        <span className="igloo-dashboard-section-spacer" />
        {nearest ? (
          <span className="igloo-dashboard-timer">
            <Clock size={12} aria-hidden="true" />
            Nearest: {nearest}
          </span>
        ) : null}
      </header>
      <div data-testid={TID.dashboardPendingApprovals}>
        {rows.length > 0 ? (
          rows.map((approval) => (
            <div key={approval.id} data-approval-id={approval.id} className="igloo-dashboard-approval-row">
              <span className="igloo-dashboard-approval-dot" />
              <span className={`igloo-dashboard-method ${methodToneClass(approval.method)}`}>{approval.methodLabel}</span>
              <span className="igloo-dashboard-approval-peer">
                <span className="igloo-dashboard-approval-peer-name">{approval.peerLabel}</span>
                <span className="igloo-dashboard-approval-peer-key">{shortKey(approval.pubkey)}</span>
              </span>
              <span className="igloo-dashboard-approval-desc">{approval.detailLabel}</span>
              <span className="igloo-dashboard-timer">
                <Clock size={12} aria-hidden="true" />
                {approval.expiresLabel}
              </span>
              {interactive ? (
                <span className="igloo-dashboard-approval-actions">
                  <Button
                    type="button"
                    className="h-7 min-w-[7.5rem] px-3 text-xs"
                    data-testid={`${TID.dashboardPendingApprovals}-open`}
                    onClick={() => setActiveApprovalId(approval.id)}
                  >
                    Open
                  </Button>
                </span>
              ) : null}
            </div>
          ))
        ) : (
          <div className="igloo-dashboard-empty">No pending approvals.</div>
        )}
      </div>
      {activeApproval ? (
        <div className="igloo-dashboard-policy-backdrop" role="presentation">
          <div
            className="igloo-dashboard-policy-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="igloo-dashboard-policy-title"
          >
            <header className="igloo-dashboard-policy-head">
              <span className="igloo-dashboard-policy-icon" aria-hidden="true">
                <ShieldAlert size={20} />
              </span>
              <span className="igloo-dashboard-policy-title-wrap">
                <span id="igloo-dashboard-policy-title" className="igloo-dashboard-policy-title">
                  Signer Policy
                </span>
                <span className="igloo-dashboard-policy-subtitle">
                  A peer is requesting permission to {methodActionLabel(activeApproval.method)} on your behalf
                </span>
              </span>
              <button
                type="button"
                className="igloo-dashboard-policy-close"
                onClick={closePrompt}
                aria-label="Close signer policy prompt"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </header>
            <div className="igloo-dashboard-policy-request">
              <span className={`igloo-dashboard-method ${methodToneClass(activeApproval.method)}`}>
                {activeApproval.methodLabel}
              </span>
              <span className="igloo-dashboard-policy-peer">from {activeApproval.peerLabel}</span>
              <span className="igloo-dashboard-policy-key">{shortKey(activeApproval.pubkey)}</span>
            </div>
            <dl className="igloo-dashboard-policy-details">
              <div>
                <dt>Method</dt>
                <dd>{activeApproval.methodLabel}</dd>
              </div>
              <div>
                <dt>Peer</dt>
                <dd>{activeApproval.peerLabel}</dd>
              </div>
              <div>
                <dt>Request ID</dt>
                <dd>{shortKey(activeApproval.id)}</dd>
              </div>
              <div>
                <dt>Expires</dt>
                <dd>{activeApproval.expiresLabel}</dd>
              </div>
            </dl>
            <div className="igloo-dashboard-policy-expiry">
              <Clock size={14} aria-hidden="true" />
              {activeApproval.expiresLabel === 'expired' ? 'Expired' : `Expires in ${activeApproval.expiresLabel}`}
            </div>
            <div className="igloo-dashboard-policy-actions">
              {onDenyApproval ? (
                <Button
                  type="button"
                  variant="destructive"
                  data-testid={`${TID.dashboardPendingApprovals}-deny`}
                  onClick={() => resolve(onDenyApproval, activeApproval)}
                >
                  Deny
                </Button>
              ) : null}
              {onApproveOnce ? (
                <Button
                  type="button"
                  variant="success"
                  data-testid={`${TID.dashboardPendingApprovals}-allow-once`}
                  onClick={() => resolve(onApproveOnce, activeApproval)}
                >
                  Allow once
                </Button>
              ) : null}
              {onAlwaysAllow ? (
                <Button
                  type="button"
                  variant="secondary"
                  data-testid={`${TID.dashboardPendingApprovals}-always-allow`}
                  onClick={() => resolve(onAlwaysAllow, activeApproval)}
                >
                  Always allow
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function methodActionLabel(method: PendingApprovalRowModel['method']) {
  if (method === 'ecdh') return 'complete an ECDH exchange';
  if (method === 'ping') return 'answer a ping';
  if (method === 'onboard') return 'onboard a device';
  return 'sign';
}

type EventLogKind =
  | 'ready'
  | 'info'
  | 'error'
  | 'sign'
  | 'ecdh'
  | 'echo'
  | 'ping'
  | 'sync'
  | 'signer-policy'
  | 'peer-policy';

const EVENT_KIND_ORDER: EventLogKind[] = [
  'ready',
  'info',
  'error',
  'sign',
  'ecdh',
  'echo',
  'ping',
  'sync',
  'signer-policy',
  'peer-policy',
];

const EVENT_KIND_LABELS: Record<EventLogKind, string> = {
  ready: 'READY',
  info: 'INFO',
  error: 'ERROR',
  sign: 'SIGN',
  ecdh: 'ECDH',
  echo: 'ECHO',
  ping: 'PING',
  sync: 'SYNC',
  'signer-policy': 'SIGNER POLICY',
  'peer-policy': 'PEER POLICY',
};

const EVENT_FILTER_LEADING: EventLogKind[] = ['ready', 'info', 'error', 'sign', 'ecdh', 'echo', 'ping'];

function normalizeEventKind(value: string): EventLogKind | null {
  const label = value.toLowerCase().replace(/[_\s]+/g, '-');
  if (label.includes('peer-policy') || label.includes('permission')) return 'peer-policy';
  if (label.includes('signer-policy') || label === 'policy') return 'signer-policy';
  if (label.includes('ready') || label === 'success') return 'ready';
  if (label.includes('error') || label === 'danger' || label === 'warning' || label === 'warn') return 'error';
  if (label.includes('sync')) return 'sync';
  if (label.includes('ecdh')) return 'ecdh';
  if (label.includes('ping')) return 'ping';
  if (label.includes('echo')) return 'echo';
  if (label.includes('sign')) return 'sign';
  if (label.includes('info') || label === 'default' || label.includes('runtime') || label.includes('relay')) return 'info';
  return null;
}

function eventKind(row: EventLogRowModel): EventLogKind {
  const toneKind = normalizeEventKind(row.badgeTone);
  const labelKind = normalizeEventKind(row.badgeLabel);
  if (toneKind && toneKind !== 'info') return toneKind;
  return labelKind ?? toneKind ?? 'info';
}

function sortEventKinds(kinds: EventLogKind[]) {
  return [...kinds].sort((a, b) => EVENT_KIND_ORDER.indexOf(a) - EVENT_KIND_ORDER.indexOf(b));
}

function EventLogSection({ rows, onClear }: { rows: EventLogRowModel[]; onClear?: () => void }) {
  const [activeFilters, setActiveFilters] = React.useState<EventLogKind[] | null>(null);
  const [filtersOpen, setFiltersOpen] = React.useState(true);

  const availableKinds = React.useMemo(() => {
    const seen = new Set<EventLogKind>();
    for (const row of rows) {
      seen.add(eventKind(row));
    }
    return sortEventKinds([...seen]);
  }, [rows]);

  const selectedKinds = React.useMemo(() => {
    if (activeFilters === null) return availableKinds;
    return activeFilters.filter((kind) => availableKinds.includes(kind));
  }, [activeFilters, availableKinds]);
  const selectedKindSet = React.useMemo(() => new Set(selectedKinds), [selectedKinds]);
  const visibleRows = rows.filter((row) => selectedKindSet.has(eventKind(row)));
  const leadingKinds = availableKinds.filter((kind) => EVENT_FILTER_LEADING.includes(kind));
  const trailingKinds = availableKinds.filter((kind) => !EVENT_FILTER_LEADING.includes(kind));

  const toggleKind = (kind: EventLogKind) => {
    setActiveFilters((current) => {
      const base = current === null ? availableKinds : current;
      return base.includes(kind) ? base.filter((item) => item !== kind) : sortEventKinds([...base, kind]);
    });
  };

  return (
    <section className="igloo-dashboard-section igloo-dashboard-event-section">
      <header className="igloo-dashboard-section-head igloo-dashboard-event-head">
        <div className="igloo-dashboard-event-title-group">
          <ChevronDown size={14} aria-hidden="true" className="igloo-dashboard-event-chevron" />
          <span className="igloo-dashboard-section-title">Event Log</span>
          {rows.length > 0 ? <span className="igloo-dashboard-count is-total">{rows.length} events</span> : null}
          {rows.length > 0 ? <span className="igloo-dashboard-event-live-dot" aria-label="Event stream active" /> : null}
        </div>
        <div className="igloo-dashboard-event-controls">
          {availableKinds.length > 0 ? (
            <button
              type="button"
              className="igloo-dashboard-filter-trigger"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <Filter size={13} aria-hidden="true" />
              <span>Filter</span>
            </button>
          ) : null}
          {onClear ? (
            <button type="button" className="igloo-dashboard-clear" onClick={onClear}>
              Clear
            </button>
          ) : null}
        </div>
      </header>
      {filtersOpen && availableKinds.length > 0 ? (
        <div className="igloo-dashboard-filter-bar" aria-label="Event log filters">
          {leadingKinds.map((kind) => (
            <EventFilterChip
              key={kind}
              kind={kind}
              active={selectedKindSet.has(kind)}
              onClick={() => toggleKind(kind)}
            />
          ))}
          <span className="igloo-dashboard-filter-bulk">
            <button type="button" onClick={() => setActiveFilters(null)}>
              Select all
            </button>
            <span>/</span>
            <button type="button" onClick={() => setActiveFilters([])}>
              Clear all
            </button>
          </span>
          {trailingKinds.map((kind) => (
            <EventFilterChip
              key={kind}
              kind={kind}
              active={selectedKindSet.has(kind)}
              onClick={() => toggleKind(kind)}
            />
          ))}
        </div>
      ) : null}

      <div className="igloo-dashboard-event-list" role="log" aria-label="Event Log">
        {visibleRows.length > 0 ? (
          visibleRows.map((row) => {
            const kind = eventKind(row);
            return (
              <div key={row.id} className={`igloo-dashboard-event-row ${kind === 'error' ? 'is-error' : ''}`}>
                <span className="igloo-dashboard-event-time">{row.timestampLabel ?? ''}</span>
                <span className="igloo-dashboard-event-badge-slot">
                  <span className={`igloo-dashboard-event-badge is-${kind}`}>{EVENT_KIND_LABELS[kind]}</span>
                </span>
                <span className="igloo-dashboard-event-msg">{row.message}</span>
                <ChevronRight size={14} aria-hidden="true" className="igloo-dashboard-event-row-chevron" />
              </div>
            );
          })
        ) : (
          <div className="igloo-dashboard-empty">No events captured yet.</div>
        )}
      </div>
    </section>
  );
}

function EventFilterChip({
  kind,
  active,
  onClick,
}: {
  kind: EventLogKind;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`igloo-dashboard-filter-chip is-${kind} ${active ? 'is-active' : ''}`}
    >
      {EVENT_KIND_LABELS[kind]}
    </button>
  );
}

// Stopped-state cards (Paper: screens/dashboard/2-stopped). Static copy: with the
// signer stopped, nothing is connected, so the counts are zero by construction.
function ReadinessCard() {
  return (
    <section className="igloo-dashboard-card">
      <span className="igloo-dashboard-card-label">Readiness</span>
      <div className="igloo-dashboard-readiness-body">
        <span className="igloo-dashboard-readiness-disc" aria-hidden="true">
          <span className="igloo-dashboard-readiness-disc-inner">
            <span className="igloo-dashboard-readiness-disc-dot" />
          </span>
        </span>
        <div>
          <div className="igloo-dashboard-readiness-title">Offline</div>
          <div className="igloo-dashboard-readiness-detail">Start signer to restore connectivity.</div>
        </div>
      </div>
      <div className="igloo-dashboard-readiness-badges">
        <span className="igloo-dashboard-pill is-danger">0 relays connected</span>
        <span className="igloo-dashboard-pill is-danger">0 peers online</span>
        <span className="igloo-dashboard-pill is-muted">Signing unavailable</span>
      </div>
    </section>
  );
}

function NextStepCard() {
  return (
    <section className="igloo-dashboard-card">
      <span className="igloo-dashboard-card-label">Next Step</span>
      <div className="igloo-dashboard-nextstep-lines">
        <span>Queued work · preserved</span>
        <span>New signing · blocked</span>
        <span>Policy prompts · paused</span>
      </div>
      <div className="igloo-dashboard-nextstep-note">Start when ready.</div>
    </section>
  );
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
    <div className="space-y-1.5">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={value}
          className="h-10 w-full bg-gray-800/50 border-gray-700/50 py-2 text-sm font-mono text-blue-300"
          readOnly
        />
        {onCopy ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCopy}
            className="shrink-0 bg-blue-800/30 text-blue-400 hover:bg-blue-800/50 hover:text-blue-300"
            title={`Copy ${label}`}
          >
            <Copy className="h-5 w-5" />
          </Button>
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
    <div className="flex flex-wrap items-center gap-3 py-1">
      <span className="w-[130px] shrink-0 text-[11px] uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <span className="font-mono text-sm text-slate-300">{keyModel.display}</span>
      <div ref={menuContainerRef} className="relative flex items-center overflow-visible rounded-lg border border-blue-800/30 bg-slate-950/60">
        <button
          type="button"
          data-testid={copyTestId}
          onClick={() => onCopy?.('npub')}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-300 hover:text-blue-200"
          title={`Copy ${label} as npub`}
        >
          <Copy className="h-3 w-3" />
          npub
        </button>
        <button
          type="button"
          data-testid={formatTestId}
          onClick={() => setMenuOpen((open) => !open)}
          className="border-l border-blue-800/30 px-2 py-1 text-slate-500 hover:text-slate-300"
          title={`Copy ${label} in another format`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <ChevronDown className="h-3 w-3" />
        </button>
        {menuOpen ? (
          <div className="absolute right-0 top-full z-10 mt-1 w-28 rounded-lg border border-blue-800/30 bg-slate-950 py-1 shadow-lg" role="menu">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onCopy?.('npub');
                setMenuOpen(false);
              }}
              className="block w-full px-3 py-1.5 text-left text-xs text-blue-200 hover:bg-blue-900/30"
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
              className="block w-full px-3 py-1.5 text-left text-xs text-blue-200 hover:bg-blue-900/30"
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
