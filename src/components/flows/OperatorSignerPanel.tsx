import * as React from 'react';
import { ChevronDown, Clock, Copy, RefreshCw } from 'lucide-react';

import type {
  DashboardKeyModel,
  EventLogRowModel,
  PeerReadinessRowModel,
  PendingApprovalRowModel,
  PendingOperationRowModel,
  SignerDashboardViewModel,
} from '../../models/view-models';
import { CRITICAL_E2E_TEST_IDS as TID } from '../../lib/e2e-test-ids';
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
        runtimeControlLabel={runtimeControlLabel}
        onPrimaryAction={onPrimaryAction}
        primaryActionDisabled={primaryActionDisabled}
        copiedField={copiedField}
        onCopyGroupKey={onCopyGroupKey}
        onCopyShareKey={onCopyShareKey}
      />

      {statusBanner ? statusBanner : null}

      {running ? (
        <>
          <PeersSection rows={view.peerRows} onRefresh={onRefreshPeers} refreshDisabled={refreshPeersDisabled} />
          <PendingApprovalsSection
            rows={view.pendingApprovalRows ?? []}
            onApproveOnce={onApproveOnce}
            onAlwaysAllow={onAlwaysAllow}
            onDenyApproval={onDenyApproval}
          />
          <PendingOperationsSection rows={view.pendingOperationRows} />
          <EventLogSection rows={view.eventRows} onClear={onClearLogs} />
        </>
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
  runtimeControlLabel,
  onPrimaryAction,
  primaryActionDisabled,
  copiedField,
  onCopyGroupKey,
  onCopyShareKey,
}: {
  view: SignerDashboardViewModel;
  running: boolean;
  runtimeControlLabel: string;
  onPrimaryAction: () => void;
  primaryActionDisabled?: boolean;
  copiedField?: 'group' | 'share' | null;
  onCopyGroupKey?: (format?: 'npub' | 'hex') => void;
  onCopyShareKey?: (format?: 'npub' | 'hex') => void;
}) {
  return (
    <div className="igloo-dashboard-status">
      <div className="igloo-dashboard-status-main">
        <div className="igloo-dashboard-status-head">
          <span className={`igloo-dashboard-status-dot ${running ? 'is-running' : 'is-stopped'}`} />
          <span className={`igloo-dashboard-status-title ${running ? 'is-running' : 'is-stopped'}`}>
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
          {view.shareKey ? (
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
          )}
        </div>

        <div className="igloo-dashboard-status-connection">{view.relaySummary}</div>
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

function toNum(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function PeersSection({
  rows,
  onRefresh,
  refreshDisabled,
}: {
  rows: PeerReadinessRowModel[];
  onRefresh?: () => void;
  refreshDisabled?: boolean;
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
        rows.map((peer) => <PeerRow key={peer.id} peer={peer} />)
      ) : (
        <div className="igloo-dashboard-empty">No peers are currently tracked.</div>
      )}
    </section>
  );
}

function PeerRow({ peer }: { peer: PeerReadinessRowModel }) {
  const online = peer.state === 'online' || peer.state === 'idle';
  const incoming = toNum(peer.incomingAvailable);
  const outgoing = toNum(peer.outgoingAvailable);
  const denom = Math.max(incoming ?? 0, outgoing ?? 0, 1);
  const showMeter = incoming != null || outgoing != null;

  return (
    <div className="igloo-dashboard-peer-row">
      <span className={`igloo-dashboard-peer-avatar ${online ? 'is-online' : 'is-offline'}`} aria-hidden="true">
        <span className="igloo-dashboard-peer-avatar-inner">
          <span className="igloo-dashboard-peer-avatar-dot" />
        </span>
      </span>
      <div className="igloo-dashboard-peer-main">
        <span className="igloo-dashboard-peer-id">{peer.alias}</span>
        <span className="igloo-dashboard-peer-sep">·</span>
        <span className="igloo-dashboard-peer-key">{peer.pubkey}</span>
        <span className="igloo-dashboard-caps">
          <Cap label="SIGN" tone="sign" capable={peer.canSign} />
          <Cap label="ECDH" tone="ecdh" capable={peer.canEcdh} />
          <Cap label="PING" tone="ping" capable={peer.canPing} />
        </span>
      </div>
      <div className="igloo-dashboard-peer-meter">
        {showMeter ? (
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
        ) : null}
        <span className={`igloo-dashboard-peer-latency ${online ? '' : 'is-idle'}`}>
          {online ? formatLatency(peer) : 'Offline'}
        </span>
      </div>
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

function methodTone(method: PendingApprovalRowModel['method']): string {
  switch (method) {
    case 'sign':
      return 'is-sign';
    case 'ecdh':
      return 'is-ecdh';
    case 'ping':
      return 'is-ping';
    default:
      return 'is-default';
  }
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
  return (
    <section className="igloo-dashboard-section">
      <header className="igloo-dashboard-section-head">
        <span className="igloo-dashboard-section-title">Pending Approvals</span>
        {rows.length > 0 ? <span className="igloo-dashboard-count is-pending">{rows.length} pending</span> : null}
      </header>
      <div data-testid={TID.dashboardPendingApprovals}>
        {rows.length > 0 ? (
          rows.map((approval) => (
            <div key={approval.id} data-approval-id={approval.id} className="igloo-dashboard-approval-row">
              <span className="igloo-dashboard-approval-dot" />
              <span className={`igloo-dashboard-method ${methodTone(approval.method)}`}>{approval.methodLabel}</span>
              <span className="igloo-dashboard-approval-peer">
                <span className="igloo-dashboard-approval-peer-name">{approval.peerLabel}</span>
                <span className="igloo-dashboard-approval-peer-key">{shortKey(approval.pubkey)}</span>
              </span>
              <span className="igloo-dashboard-approval-desc">{approval.detailLabel}</span>
              <span className="igloo-dashboard-section-spacer" />
              <span className="igloo-dashboard-timer">
                <Clock size={12} aria-hidden="true" />
                {approval.expiresLabel}
              </span>
              {interactive ? (
                <span className="igloo-dashboard-approval-actions">
                  <Button
                    type="button"
                    variant="destructive"
                    className="h-7 px-2.5 text-xs"
                    data-testid={`${TID.dashboardPendingApprovals}-deny`}
                    onClick={() => onDenyApproval?.(approval.id)}
                  >
                    Deny
                  </Button>
                  <Button
                    type="button"
                    variant="success"
                    className="h-7 px-2.5 text-xs"
                    data-testid={`${TID.dashboardPendingApprovals}-allow-once`}
                    onClick={() => onApproveOnce?.(approval.id)}
                  >
                    Allow once
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-7 px-2.5 text-xs"
                    data-testid={`${TID.dashboardPendingApprovals}-always-allow`}
                    onClick={() => onAlwaysAllow?.(approval.id)}
                  >
                    Always allow
                  </Button>
                </span>
              ) : null}
            </div>
          ))
        ) : (
          <div className="igloo-dashboard-empty">No pending approvals.</div>
        )}
      </div>
    </section>
  );
}

function PendingOperationsSection({ rows }: { rows: PendingOperationRowModel[] }) {
  return (
    <section className="igloo-dashboard-section">
      <header className="igloo-dashboard-section-head">
        <span className="igloo-dashboard-section-title">Pending Operations</span>
        {rows.length > 0 ? <span className="igloo-dashboard-count is-total">{rows.length} active</span> : null}
      </header>
      {rows.length > 0 ? (
        rows.map((operation) => (
          <div key={operation.id} className="igloo-dashboard-op-row">
            <span className="igloo-dashboard-op-label">{operation.operationLabel}</span>
            <span className="igloo-dashboard-op-id">{operation.id}</span>
            <span className="igloo-dashboard-op-meta">
              <span>{operation.startedLabel}</span>
              <span>{operation.timeoutLabel}</span>
              <span>{operation.responseLabel}</span>
            </span>
          </div>
        ))
      ) : (
        <div className="igloo-dashboard-empty">No operations are currently pending.</div>
      )}
    </section>
  );
}

// Map an event domain label to its Paper badge tone. Checks the more specific
// "Signer Policy" before the substring "Sign".
function eventTone(label: string): string {
  const value = label.toLowerCase();
  if (value.includes('policy')) return 'is-policy';
  if (value.includes('sync')) return 'is-sync';
  if (value.includes('ecdh')) return 'is-ecdh';
  if (value.includes('ping')) return 'is-ping';
  if (value.includes('echo')) return 'is-echo';
  if (value.includes('sign')) return 'is-sign';
  return 'is-default';
}

function EventLogSection({ rows, onClear }: { rows: EventLogRowModel[]; onClear?: () => void }) {
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

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

  // A filter that no longer matches any row (e.g. after Clear) falls back to All.
  const effectiveFilter = activeFilter && domains.includes(activeFilter) ? activeFilter : null;
  const visibleRows = effectiveFilter ? rows.filter((row) => row.badgeLabel === effectiveFilter) : rows;

  return (
    <section className="igloo-dashboard-section">
      <header className="igloo-dashboard-section-head">
        <span className="igloo-dashboard-section-title">Event Log</span>
        {rows.length > 0 ? <span className="igloo-dashboard-count is-total">{rows.length} events</span> : null}
        <span className="igloo-dashboard-section-spacer" />
        {onClear ? (
          <button type="button" className="igloo-dashboard-clear" onClick={onClear}>
            Clear
          </button>
        ) : null}
      </header>

      {domains.length > 1 ? (
        <div className="igloo-dashboard-filters">
          <FilterChip label="All" active={effectiveFilter === null} onClick={() => setActiveFilter(null)} />
          {domains.map((domain) => (
            <FilterChip
              key={domain}
              label={domain}
              active={effectiveFilter === domain}
              onClick={() => setActiveFilter(domain)}
            />
          ))}
        </div>
      ) : null}

      {visibleRows.length > 0 ? (
        visibleRows.map((row) => (
          <div key={row.id} className="igloo-dashboard-event-row">
            {row.timestampLabel ? <span className="igloo-dashboard-event-time">{row.timestampLabel}</span> : null}
            <span className={`igloo-dashboard-event-badge ${eventTone(row.badgeLabel)}`}>{row.badgeLabel}</span>
            <span className="igloo-dashboard-event-msg">{row.message}</span>
          </div>
        ))
      ) : (
        <div className="igloo-dashboard-empty">No events captured yet.</div>
      )}
    </section>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`igloo-dashboard-filter-chip ${active ? 'is-active' : ''}`}
    >
      {label}
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
