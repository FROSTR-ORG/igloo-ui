import * as React from 'react';
import { ChevronDown, ChevronUp, Radio, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { HelpHint } from './help-hint';
import { IconButton } from './icon-button';
import { StatusBadge, type StatusState } from './status-indicator';

export type PeerPolicy = {
  alias: string;
  pubkey: string;
  send: boolean;
  receive: boolean;
  state: StatusState;
  statusLabel?: string;
  lastSeen?: number | null;
  incomingAvailable?: number;
  outgoingAvailable?: number;
  outgoingSpent?: number;
  shouldSendNonces?: boolean;
};

type PeerListProps = {
  peers: PeerPolicy[];
  onPing?: (pubkey: string) => Promise<{ success: boolean; latency?: number }>;
  onPolicyChange?: (pubkey: string, field: 'send' | 'receive', value: boolean) => void;
  onRefreshAll?: () => void;
  disabled?: boolean;
};

const formatPubkey = (value: string) => `${value.slice(0, 14)}...${value.slice(-8)}`;

function formatLastSeen(value: number | null | undefined): string {
  if (!value) return 'never';
  const normalized = value > 10_000_000_000 ? value : value * 1000;
  const deltaMs = Date.now() - normalized;
  if (deltaMs < 60_000) return 'just now';
  const deltaMinutes = Math.floor(deltaMs / 60_000);
  if (deltaMinutes < 60) return `${deltaMinutes}m ago`;
  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) return `${deltaHours}h ago`;
  return new Date(normalized).toLocaleString();
}

function NonceBar({
  label,
  value,
  tone = 'blue',
  capacity = 20
}: {
  label: string;
  value: number;
  tone?: 'blue' | 'green' | 'amber';
  capacity?: number;
}) {
  const width = Math.min(100, Math.max(0, (value / Math.max(capacity, 1)) * 100));
  const barClass =
    tone === 'green' ? 'bg-green-400/80' : tone === 'amber' ? 'bg-amber-400/80' : 'bg-blue-400/80';

  return (
    <div className="min-w-[88px]">
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-gray-500">
        <span>{label}</span>
        <span className="text-gray-300">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-700/60">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function PeerList({ peers, onPing, onPolicyChange, onRefreshAll, disabled }: PeerListProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const onlineCount = peers.filter((p) => p.state === 'online').length;
  const signReadyCount = peers.filter((p) => p.statusLabel === 'sign-ready').length;
  const knownCount = peers.filter((p) => p.state !== 'offline').length;

  return (
    <div className="overflow-hidden rounded-lg border border-blue-900/30">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        onClick={() => setCollapsed(!collapsed)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setCollapsed((prev) => !prev);
          }
        }}
        className="flex w-full items-center justify-between bg-gray-800/30 px-4 py-3 transition-colors hover:bg-gray-800/50"
      >
        <div className="flex items-center gap-3">
          {collapsed ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          <span className="font-medium text-blue-300">Peer List</span>
          <div className={cn('h-2 w-2 rounded-full', onlineCount > 0 ? 'bg-green-500' : signReadyCount > 0 ? 'bg-yellow-500' : 'bg-gray-500')} />
          <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400">{onlineCount} online</span>
          <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-300">{signReadyCount} sign-ready</span>
          <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-200">{knownCount} known</span>
          <span className="rounded bg-gray-500/20 px-2 py-0.5 text-xs text-gray-400">{peers.length} total</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="italic">{collapsed ? 'Click to expand' : 'Click to collapse'}</span>
          {onRefreshAll && (
            <IconButton
              variant="ghost"
              size="sm"
              icon={<RefreshCw className="h-3.5 w-3.5" />}
              onClick={(e) => {
                e.stopPropagation();
                onRefreshAll();
              }}
              disabled={disabled}
              tooltip="Refresh all"
              className="text-gray-400 hover:text-blue-300"
            />
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="max-h-[400px] space-y-2 overflow-y-auto p-3">
          {peers.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">No peers configured</p>
          ) : (
            peers.map((peer) => (
              <PeerCard key={peer.pubkey} peer={peer} onPing={onPing} onPolicyChange={onPolicyChange} disabled={disabled} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

type PeerCardProps = {
  peer: PeerPolicy;
  onPing?: PeerListProps['onPing'];
  onPolicyChange?: PeerListProps['onPolicyChange'];
  disabled?: boolean;
};

function PeerCard({ peer, onPing, onPolicyChange, disabled }: PeerCardProps) {
  const [pinging, setPinging] = React.useState(false);
  const [latency, setLatency] = React.useState<number | null>(null);
  const [showPolicyControls, setShowPolicyControls] = React.useState(false);

  const handlePing = async () => {
    if (!onPing || pinging) return;
    setPinging(true);
    setLatency(null);
    try {
      const result = await onPing(peer.pubkey);
      if (result.success && result.latency !== undefined) setLatency(result.latency);
    } finally {
      setPinging(false);
    }
  };

  const statusLabel =
    peer.statusLabel ??
    (peer.state === 'online' ? 'Online' : peer.state === 'warning' ? 'Sign-ready' : peer.state === 'idle' ? 'Known' : 'Offline');

  return (
    <div className="overflow-hidden rounded-lg border border-blue-900/20 bg-gray-800/30">
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0 flex items-center gap-3">
          <StatusBadge state={peer.state} label={statusLabel} className="shrink-0" />
          <div className="min-w-0">
            <span className="font-mono text-sm text-blue-300">{formatPubkey(peer.pubkey)}</span>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-300">Status: {statusLabel}</span>
              {latency !== null && (
                <>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-blue-400">Ping: {latency}ms</span>
                </>
              )}
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">Policy: out {peer.send ? 'allow' : 'block'}, in {peer.receive ? 'allow' : 'block'}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">Last seen: {formatLastSeen(peer.lastSeen)}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              <NonceBar label="In" value={peer.incomingAvailable ?? 0} />
              <NonceBar label="Out" value={peer.outgoingAvailable ?? 0} tone="green" />
              <NonceBar label="Spent" value={peer.outgoingSpent ?? 0} tone="amber" />
              <div className="flex items-center text-[10px] uppercase tracking-wide text-gray-400">
                {peer.shouldSendNonces ? 'needs nonce refill' : 'nonce pool healthy'}
              </div>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {onPolicyChange && (
            <IconButton
              variant="ghost"
              size="sm"
              icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
              onClick={() => setShowPolicyControls(!showPolicyControls)}
              tooltip="Policy controls"
              className={cn('text-gray-400 hover:text-blue-300', showPolicyControls && 'bg-blue-900/30 text-blue-300')}
            />
          )}
          {onPing && (
            <IconButton
              variant="ghost"
              size="sm"
              icon={<Radio className="h-3.5 w-3.5" />}
              onClick={handlePing}
              disabled={disabled || pinging}
              loading={pinging}
              loadingLabel="Pinging..."
              tooltip="Ping"
              className="text-gray-400 hover:text-blue-300"
            />
          )}
        </div>
      </div>

      {showPolicyControls && onPolicyChange && (
        <div className="space-y-3 border-t border-blue-900/20 bg-gray-900/30 p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">Policy controls</span>
            <HelpHint
              ariaLabel="About policy controls"
              content="Peer policy tags define peer actions: SIGN, ECDH, PING, ONBOARD. Requests not explicitly allowed by signer policies require a peer policy decision."
              placement="top"
              iconSize={14}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onPolicyChange(peer.pubkey, 'send', !peer.send)}
              className={cn(
                'rounded border px-4 py-2 text-xs font-medium uppercase tracking-wide transition-colors',
                peer.send
                  ? 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  : 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20'
              )}
            >
              Outbound {peer.send ? 'Allow' : 'Block'}
            </button>
            <button
              type="button"
              onClick={() => onPolicyChange(peer.pubkey, 'receive', !peer.receive)}
              className={cn(
                'rounded border px-4 py-2 text-xs font-medium uppercase tracking-wide transition-colors',
                peer.receive
                  ? 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  : 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20'
              )}
            >
              Inbound {peer.receive ? 'Allow' : 'Block'}
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Outbound controls requests you initiate; inbound gates requests arriving from this peer.
          </p>
        </div>
      )}
    </div>
  );
}
