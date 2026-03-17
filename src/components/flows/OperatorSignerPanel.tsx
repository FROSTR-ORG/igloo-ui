import * as React from 'react';
import { Copy, HelpCircle, User } from 'lucide-react';

import { Button } from '../ui/button';
import { ContentCard } from '../ui/content-card';
import { EventLog, type LogEntry } from '../ui/event-log';
import { Input } from '../ui/input';
import { PeerList, type PeerPolicy } from '../ui/peer-list';

export type OperatorRuntimeState = 'stopped' | 'connecting' | 'running';

export type OperatorPendingOperation = {
  request_id: string;
  op_type: string;
  threshold: number;
  started_at: number | null;
  timeout_at: number | null;
  collected_responses: number;
  target_peers: string[];
};

export type OperatorProfileSummary = {
  name: string;
  groupPublicKey?: string | null;
  sharePublicKey?: string | null;
};

type Props = {
  profile: OperatorProfileSummary | null;
  introMessage: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  runtimeState: OperatorRuntimeState;
  runtimeControlLabel: string;
  runtimeSummaryLabel: string;
  activationStage?: string | null;
  activationUpdatedAt?: number | null;
  runtimeError?: string | null;
  sharePublicKey?: string | null;
  groupPublicKey?: string | null;
  copiedField?: 'group' | 'share' | null;
  onCopyGroupKey?: () => void;
  onCopyShareKey?: () => void;
  onPrimaryAction: () => void;
  primaryActionVariant?: 'default' | 'destructive' | 'success' | 'secondary';
  primaryActionDisabled?: boolean;
  onRefreshPeers?: () => void;
  refreshPeersDisabled?: boolean;
  peers: PeerPolicy[];
  onPingPeer?: (pubkey: string) => Promise<{ success: boolean; latency?: number }>;
  onPeerPolicyChange?: (pubkey: string, field: 'send' | 'receive', value: boolean) => void;
  pendingOperations: OperatorPendingOperation[];
  logs: LogEntry[];
  onClearLogs?: () => void;
};

export function OperatorSignerPanel({
  profile,
  introMessage,
  emptyTitle = 'No onboarding profile',
  emptyDescription = 'Complete onboarding to configure this signer.',
  emptyAction,
  runtimeState,
  runtimeControlLabel,
  runtimeSummaryLabel,
  activationStage,
  activationUpdatedAt,
  runtimeError,
  sharePublicKey,
  groupPublicKey,
  copiedField = null,
  onCopyGroupKey,
  onCopyShareKey,
  onPrimaryAction,
  primaryActionVariant,
  primaryActionDisabled,
  onRefreshPeers,
  refreshPeersDisabled,
  peers,
  onPingPeer,
  onPeerPolicyChange,
  pendingOperations,
  logs,
  onClearLogs,
}: Props) {
  if (!profile) {
    return (
      <ContentCard title={emptyTitle} description={emptyDescription}>
        <div className="border border-blue-800/30 rounded-lg p-6">{emptyAction}</div>
      </ContentCard>
    );
  }

  const isSignerRunning = runtimeState === 'running';
  const isConnecting = runtimeState === 'connecting';
  const primaryVariant =
    primaryActionVariant ?? (isSignerRunning ? 'destructive' : 'success');

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/20 px-4 py-3 text-sm text-cyan-100 shadow-[inset_0_1px_0_rgba(103,232,249,0.08)]">
        {introMessage}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center">
            <h2 className="text-lg text-blue-300">Manage your signer runtime</h2>
            <span title="Inspect runtime health, peer state, pending operations, and recent diagnostics from one operator surface.">
              <HelpCircle size={18} className="ml-2 text-blue-400 cursor-help" />
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            <span className="rounded-full border border-blue-900/30 bg-blue-950/30 px-2.5 py-1 text-blue-200">
              {profile.name || 'Unnamed signer'}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 ${
                isSignerRunning
                  ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : isConnecting
                    ? 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
                    : 'border border-red-500/30 bg-red-500/10 text-red-300'
              }`}
            >
              {runtimeSummaryLabel}
            </span>
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
            variant={primaryVariant}
            className="px-5 py-2 text-sm font-medium"
            disabled={primaryActionDisabled}
          >
            {runtimeControlLabel}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <div className="rounded-xl border border-blue-800/30 bg-slate-950/60 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.22)]">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-blue-200">Profile Keys</span>
          </div>
          <div className="space-y-4">
            <KeyField
              label="Share Public Key"
              value={sharePublicKey ?? profile.sharePublicKey ?? ''}
              copied={copiedField === 'share'}
              onCopy={onCopyShareKey}
            />
            <KeyField
              label="Group Public Key"
              value={groupPublicKey ?? profile.groupPublicKey ?? ''}
              copied={copiedField === 'group'}
              onCopy={onCopyGroupKey}
            />
          </div>
        </div>

        <div className="rounded-xl border border-blue-800/30 bg-slate-950/60 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.22)]">
          <div className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">Runtime Status</div>
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <div
              className={`h-3 w-3 rounded-full ${
                isSignerRunning
                  ? 'bg-green-500 pulse-animation'
                  : isConnecting
                    ? 'bg-yellow-500 pulse-animation-yellow'
                    : 'bg-red-500'
              }`}
            />
            <span>{runtimeSummaryLabel}</span>
          </div>
          {activationStage && activationUpdatedAt ? (
            <div className="mt-3 rounded-lg border border-blue-900/20 bg-blue-950/20 px-3 py-2 text-xs text-slate-300">
              Activation stage: <span className="text-blue-200">{activationStage}</span> at{' '}
              {new Date(activationUpdatedAt).toLocaleTimeString()}
            </div>
          ) : null}

          {runtimeError ? (
            <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {runtimeError}
            </div>
          ) : null}
        </div>
      </div>

      <ContentCard title="Peers" description="Signer-owned peer liveness, readiness, and policy state.">
        <PeerList
          peers={peers}
          onPing={onPingPeer}
          onPolicyChange={onPeerPolicyChange}
          onRefreshAll={onRefreshPeers}
          disabled={refreshPeersDisabled}
        />
      </ContentCard>

      <ContentCard title="Pending Operations" description="In-flight sign, ECDH, ping, and onboard operations still tracked by the device.">
        {pendingOperations.length > 0 ? (
          <div className="space-y-3">
            {pendingOperations.map((operation) => (
              <div key={operation.request_id} className="rounded-lg border border-blue-900/20 bg-gray-950/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wide text-gray-500">{operation.op_type}</div>
                    <div className="break-all font-mono text-xs text-blue-100">{operation.request_id}</div>
                  </div>
                  <div className="text-xs text-gray-400">threshold {operation.threshold}</div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Metric label="Started" value={formatTimestamp(operation.started_at)} />
                  <Metric label="Timeout" value={formatTimestamp(operation.timeout_at)} />
                  <Metric label="Responses" value={operation.collected_responses} />
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
        {logs.length === 0 ? (
          <div className="rounded border border-dashed border-blue-900/30 px-4 py-6 text-sm text-gray-400">
            No diagnostics captured yet.
          </div>
        ) : (
          <EventLog entries={logs} onClear={onClearLogs} />
        )}
      </ContentCard>
    </div>
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

function formatTimestamp(value: number | null | undefined) {
  if (!value) return 'n/a';
  const normalized = value > 10_000_000_000 ? value : value * 1000;
  return new Date(normalized).toLocaleString();
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
