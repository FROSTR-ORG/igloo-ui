import * as React from 'react';
import { ChevronDown, Copy } from 'lucide-react';

import type { DashboardKeyModel, EventLogRowModel, SignerDashboardViewModel } from '../../models/view-models';
import { CRITICAL_E2E_TEST_IDS as TID } from '../../lib/e2e-test-ids';
import { Button } from '../ui/button';
import { ContentCard } from '../ui/content-card';
import { HelpHint } from '../ui/help-hint';
import { Input } from '../ui/input';
import { PermissionToken, normalizePermissionMethod } from '../ui/permission-token';

type Props = {
  view: SignerDashboardViewModel | null;
  introMessage: string;
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
};

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
  onCopyShareKey,
  onPrimaryAction,
  primaryActionVariant = 'success',
  primaryActionDisabled,
  onRefreshPeers,
  refreshPeersDisabled,
  onClearLogs,
}: Props) {
  if (!view) {
    return (
      <ContentCard title={emptyTitle} description={emptyDescription}>
        <div className="border border-blue-800/30 rounded-lg p-6">{emptyAction}</div>
      </ContentCard>
    );
  }

  // Peer header counts derived from data the runtime already exposes: a peer is
  // "online" when reachable (online/idle state) and "ready" when sign-capable.
  // Per-peer latency, "Avg" latency, the nonce sparkline, and per-method
  // SIGN/ECDH/PING capability badges that Paper draws are intentionally omitted —
  // they require runtime instrumentation (bifrost-rs/igloo-shared) that does not
  // exist yet (tracked as a future-scope follow-up).
  const peerTotal = view.peerRows.length;
  const peersOnline = view.peerRows.filter(
    (peer) => peer.state === 'online' || peer.state === 'idle'
  ).length;
  const peersReady = view.peerRows.filter((peer) => peer.statusLabel === 'sign-ready').length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/20 px-4 py-3 text-sm text-cyan-100 shadow-[inset_0_1px_0_rgba(103,232,249,0.08)]">
        {introMessage}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center">
            <h2 className="text-lg text-blue-300">Manage your signer runtime</h2>
            <HelpHint
              className="ml-2"
              ariaLabel="About the signer runtime"
              iconSize={18}
              content="Inspect runtime health, peer state, pending operations, and recent diagnostics from one operator surface."
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            <span className="rounded-full border border-blue-900/30 bg-blue-950/30 px-2.5 py-1 text-blue-200">
              {view.profileName || 'Unnamed signer'}
            </span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
              {view.readinessLabel}
            </span>
            <span className="rounded-full border border-blue-900/30 bg-blue-950/30 px-2.5 py-1 text-blue-200">
              {view.thresholdLabel}
            </span>
            {view.memberLabel ? (
              <span className="rounded-full border border-blue-900/30 bg-blue-950/30 px-2.5 py-1 text-blue-200">
                {view.memberLabel}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2 self-center">
          {onRefreshPeers ? (
            <Button variant="secondary" size="sm" onClick={onRefreshPeers} disabled={refreshPeersDisabled}>
              Refresh Peers
            </Button>
          ) : null}
          <Button
            onClick={onPrimaryAction}
            variant={primaryActionVariant}
            className="px-5 py-2 text-sm font-medium"
            disabled={primaryActionDisabled}
          >
            {runtimeControlLabel}
          </Button>
        </div>
      </div>

      {statusBanner ? statusBanner : null}

      <div className="rounded-xl border border-blue-800/30 bg-slate-950/60 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.22)]">
        <div className="flex flex-col gap-1.5">
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
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Relays</span>
          <span>{view.relaySummary}</span>
        </div>
      </div>

      <ContentCard
        title="Peers"
        description="Signer-owned peer liveness, readiness, and policy state."
        action={
          peerTotal > 0 ? (
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em]">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
                {peersOnline}/{peerTotal} online
              </span>
              <span className="rounded-full border border-blue-900/30 bg-blue-950/30 px-2.5 py-1 text-blue-200">
                {peersReady} ready
              </span>
            </div>
          ) : null
        }
      >
        {view.peerRows.length > 0 ? (
          <div className="space-y-3">
            {view.peerRows.map((peer) => (
              <div key={peer.id} className="rounded-lg border border-blue-900/20 bg-gray-950/30 p-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-blue-200">{peer.alias}</div>
                    <div className="break-all font-mono text-xs text-gray-400">{peer.pubkey}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded-full border border-blue-900/30 bg-blue-950/30 px-2.5 py-1 text-xs text-blue-200">
                      {peer.statusLabel}
                    </span>
                    {peer.lastSeenLabel ? (
                      <span className="text-[11px] text-gray-500">{peer.lastSeenLabel}</span>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Metric label="Incoming" value={peer.incomingAvailable ?? 'n/a'} />
                  <Metric label="Outgoing" value={peer.outgoingAvailable ?? 'n/a'} />
                  <Metric label="Spent" value={peer.outgoingSpent ?? 'n/a'} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded border border-dashed border-blue-900/30 px-4 py-6 text-sm text-gray-400">
            No peers are currently tracked.
          </div>
        )}
      </ContentCard>

      <ContentCard
        title="Pending Approvals"
        description="Signing and encryption requests awaiting your approval."
      >
        <div data-testid={TID.dashboardPendingApprovals}>
          {view.pendingApprovalRows && view.pendingApprovalRows.length > 0 ? (
            <div className="space-y-3">
              {view.pendingApprovalRows.map((approval) => (
                <div key={approval.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-900/20 bg-gray-950/30 p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-200">
                      {approval.methodLabel}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-blue-200">{approval.peerLabel}</div>
                      <div className="text-xs text-gray-400">{approval.detailLabel}</div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{approval.expiresLabel}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded border border-dashed border-blue-900/30 px-4 py-6 text-sm text-gray-400">
              No pending approvals.
            </div>
          )}
        </div>
      </ContentCard>

      <ContentCard title="Pending Operations" description="In-flight sign, ECDH, ping, and onboard operations still tracked by the device.">
        {view.pendingOperationRows.length > 0 ? (
          <div className="space-y-3">
            {view.pendingOperationRows.map((operation) => (
              <div key={operation.id} className="rounded-lg border border-blue-900/20 bg-gray-950/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wide text-gray-500">{operation.operationLabel}</div>
                    <div className="break-all font-mono text-xs text-blue-100">{operation.id}</div>
                  </div>
                  <div className="text-xs text-gray-400">{operation.thresholdLabel}</div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Metric label="Started" value={operation.startedLabel} />
                  <Metric label="Timeout" value={operation.timeoutLabel} />
                  <Metric label="Responses" value={operation.responseLabel} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded border border-dashed border-blue-900/30 px-4 py-6 text-sm text-gray-400">
            No operations are currently pending.
          </div>
        )}
      </ContentCard>

      <ContentCard title="Diagnostics" description="Recent structured runtime and control-plane events.">
        {view.eventRows.length === 0 ? (
          <div className="rounded border border-dashed border-blue-900/30 px-4 py-6 text-sm text-gray-400">
            No diagnostics captured yet.
          </div>
        ) : (
          <EventRows rows={view.eventRows} onClear={onClearLogs} />
        )}
      </ContentCard>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? 'rounded-full border border-blue-500/50 bg-blue-500/20 px-2.5 py-0.5 text-xs text-blue-100'
          : 'rounded-full border border-blue-900/30 bg-blue-950/30 px-2.5 py-0.5 text-xs text-blue-300 hover:text-blue-200'
      }
    >
      {label}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-blue-900/20 bg-gray-950/30 p-3.5">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1.5 text-sm text-blue-100">{value}</div>
    </div>
  );
}

function EventRows({ rows, onClear }: { rows: EventLogRowModel[]; onClear?: () => void }) {
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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {domains.length > 1 ? (
          <div className="flex flex-wrap items-center gap-1.5">
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
        ) : (
          <span />
        )}
        {onClear ? (
          <Button type="button" size="sm" variant="secondary" onClick={onClear}>
            Clear Log
          </Button>
        ) : null}
      </div>
      {visibleRows.map((row) => {
        const permissionMethod = normalizePermissionMethod(row.badgeLabel);
        return (
          <div key={row.id} className="rounded-lg border border-blue-900/20 bg-gray-950/30 p-3.5">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
              {permissionMethod ? (
                <PermissionToken method={permissionMethod} variant="policy" as="span" />
              ) : (
                <span className="rounded-full border border-blue-900/30 bg-blue-950/30 px-2 py-0.5 text-blue-200">
                  {row.badgeLabel}
                </span>
              )}
              {row.timestampLabel ? <span>{row.timestampLabel}</span> : null}
            </div>
            <div className="text-sm text-blue-100">{row.message}</div>
          </div>
        );
      })}
    </div>
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
