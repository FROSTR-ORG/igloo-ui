import type {
  EventLogRowModel,
  PeerPolicyRowModel,
  PeerReadinessRowModel,
  PendingApprovalRowModel,
  PolicyDashboardViewModel,
} from '../models/view-models';
import type {
  DashboardBanner,
  DashboardState,
  SigningBlockedReason,
} from '../models/dashboard-state';

type RuntimeNonceHistoryPointInput = {
  ts: number;
  held: number;
};

type RuntimePeerNonceInventorySampleInput = {
  updated_at: number;
  held_count: number;
};

export type RuntimePeerStatusInput = {
  idx: number;
  pubkey: string;
  known: boolean;
  last_seen: number | null;
  online: boolean;
  incoming_available: number;
  outgoing_available: number;
  outgoing_spent: number;
  latency_ms?: number;
  nonce_inventory_history?: RuntimePeerNonceInventorySampleInput[];
  can_sign: boolean;
  can_ecdh: boolean;
  can_ping: boolean;
  can_onboard?: boolean;
  should_send_nonces: boolean;
  last_response_latency_ms: number | null;
  avg_latency_ms: number | null;
  nonce_history: RuntimeNonceHistoryPointInput[];
};

type RuntimePendingOperationInput = {
  op_type: string;
  request_id: string;
  started_at: number;
  timeout_at: number;
  target_peers: string[];
  threshold: number;
  collected_responses: unknown[];
  context: unknown;
};

export type RuntimePendingApprovalInput = {
  request_id: string;
  peer: string;
  method: string;
  queued_at: number;
  expires_at: number;
};

type RuntimeMethodPolicy = {
  ping: boolean;
  onboard: boolean;
  sign: boolean;
  ecdh: boolean;
};

type RuntimePolicyOverrideValue = 'unset' | 'allow' | 'deny' | 'ask';

type RuntimeMethodPolicyOverride = {
  ping: RuntimePolicyOverrideValue;
  onboard: RuntimePolicyOverrideValue;
  sign: RuntimePolicyOverrideValue;
  ecdh: RuntimePolicyOverrideValue;
};

export type RuntimePeerPermissionStateInput = {
  pubkey: string;
  manual_override: {
    request: RuntimeMethodPolicyOverride;
    respond: RuntimeMethodPolicyOverride;
  };
  remote_observation: {
    request: RuntimeMethodPolicy;
    respond: RuntimeMethodPolicy;
    updated: number;
    revision: number;
  } | null;
  effective_policy: {
    request: RuntimeMethodPolicy;
    respond: RuntimeMethodPolicy;
  };
};

export type RuntimeStatusSummaryInput = {
  status: {
    device_id: string;
    pending_ops: number;
    last_active: number;
    known_peers: number;
    request_seq: number;
  };
  metadata: {
    device_id: string;
    member_idx: number;
    share_public_key: string;
    group_public_key: string;
    peers: string[];
  };
  readiness: {
    runtime_ready: boolean;
    restore_complete: boolean;
    sign_ready: boolean;
    ecdh_ready: boolean;
    threshold: number;
    signing_peer_count: number;
    ecdh_peer_count: number;
    last_refresh_at: number | null;
    degraded_reasons: string[];
  };
  peers: RuntimePeerStatusInput[];
  peer_permission_states: RuntimePeerPermissionStateInput[];
  pending_operations: RuntimePendingOperationInput[];
  pending_approvals?: RuntimePendingApprovalInput[];
  last_sign_failure?: RuntimeOperationFailureInput | null;
  connected_relays?: string[] | null;
  configured_relays?: string[] | null;
  last_load_error?: { message: string; at: number } | null;
};

export type RuntimeOperationFailureInput = {
  request_id: string;
  op_type: 'Sign' | 'Ecdh' | 'Ping' | 'Onboard';
  code: string;
  message: string;
  failed_peer?: string | null;
  failed_at: number;
};

export type ObservabilityEventInput = {
  ts: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  component: string;
  domain: string;
  event: string;
  message?: string;
  [key: string]: unknown;
};

/**
 * The subset of runtime status `deriveDashboardState` actually reads. Kept
 * narrow (structural) so any client's status shape is accepted regardless of how
 * it types the fields the selector ignores (e.g. `peer_permission_states`).
 */
export type DashboardStatusInput = {
  readiness?: { restore_complete: boolean; sign_ready: boolean } | null;
  peers?: Array<{ online: boolean; can_sign: boolean }> | null;
  pending_approvals?: unknown[];
  connected_relays?: string[] | null;
  configured_relays?: string[] | null;
  last_sign_failure?: RuntimeOperationFailureInput | null;
  last_load_error?: { message: string; at: number } | null;
};

export type DashboardStateInput = {
  /** Whether the runtime/signer is active (running). */
  active: boolean;
  /** Runtime status summary, when available. */
  status?: DashboardStatusInput | null;
  /**
   * The client's own load/activation error. Authoritative for the *hard*
   * load-failed case where there is no running runtime to query (e.g. a failed
   * desktop daemon start or a browser connect() that threw); takes precedence
   * over the bridge-enriched `status.last_load_error` soft signal.
   */
  loadError?: { message: string; at?: number } | null;
  /** request_id of a signing-failed banner the operator dismissed. */
  dismissedSignFailureId?: string | null;
};

/**
 * Canonical signer-dashboard state selector. Derived once and consumed by every
 * client (pwa / chrome / home) so the loading / load-failed / all-relays-offline
 * / signing-blocked / signing-failed presentation never drifts per client.
 *
 * Precedence: load-failed > loading > ready. Within `ready`, banners follow
 * `all-relays-offline` (mutually exclusive with) `signing-blocked`, then an
 * independent, dismissible `signing-failed`. Consumers may promote the
 * availability states into replacement dashboard content instead of top banners.
 */
export function deriveDashboardState(input: DashboardStateInput): DashboardState {
  const { active, status } = input;

  // (1) load-failed — client error (no running runtime) wins, else the
  // bridge-enriched soft restore-fallback signal.
  const loadError = input.loadError ?? status?.last_load_error ?? null;
  if (loadError) {
    return { kind: 'load-failed', message: loadError.message, at: loadError.at };
  }

  // (2) loading — active but the runtime has not reported a status yet (still
  // starting). NB: readiness.restore_complete is NOT a loading signal — it just
  // means "no pending operations" and goes false during normal operation, so a
  // present status (the runtime responded) is treated as ready, not loading.
  if (active && !status) {
    return { kind: 'loading' };
  }

  // Stopped or no status → no banners; clients render their own stopped/empty
  // state through OperatorSignerPanel.
  if (!active || !status) {
    return { kind: 'ready', banners: [] };
  }

  // (3) ready + condition banners.
  const banners: DashboardBanner[] = [];

  const relaysReported = status.connected_relays != null;
  const allRelaysOffline = relaysReported && status.connected_relays!.length === 0;
  if (allRelaysOffline) {
    banners.push({
      kind: 'all-relays-offline',
      connectedCount: 0,
      configuredCount: status.configured_relays?.length ?? 0,
    });
  } else {
    const reason = deriveSigningBlockedReason(status);
    if (reason) {
      banners.push({ kind: 'signing-blocked', reason });
    }
  }

  const failure = status.last_sign_failure;
  if (
    failure &&
    failure.op_type === 'Sign' &&
    failure.request_id !== input.dismissedSignFailureId
  ) {
    banners.push({
      kind: 'signing-failed',
      requestId: failure.request_id,
      opType: failure.op_type,
      message: failure.message,
      at: failure.failed_at,
    });
  }

  return { kind: 'ready', banners };
}

// Sign is blocked only when the runtime is up (restore complete, handled above)
// but cannot sign. Peers reachable yet none permitted → policy; otherwise not
// enough peers online → capacity.
function deriveSigningBlockedReason(
  status: DashboardStatusInput
): SigningBlockedReason | null {
  // The `ask` path is actionable in the approval queue. Do not replace the
  // running dashboard with a generic blocked state while an operator decision is
  // pending.
  if ((status.pending_approvals ?? []).length > 0) {
    return null;
  }

  // Can't determine a block without readiness; sign-ready → not blocked.
  if (!status.readiness || status.readiness.sign_ready) {
    return null;
  }
  const onlinePeers = (status.peers ?? []).filter((peer) => peer.online);
  if (onlinePeers.length > 0 && !onlinePeers.some((peer) => peer.can_sign)) {
    return 'policy';
  }
  return 'insufficient-peers';
}

export function runtimePeerPermissionStatesToPolicyDashboardView(
  states: RuntimePeerPermissionStateInput[]
): PolicyDashboardViewModel {
  return {
    peerRows: states.map((state): PeerPolicyRowModel => ({
      pubkey: state.pubkey,
      request: state.effective_policy.request,
      respond: state.effective_policy.respond,
      manualOverride: {
        request: state.manual_override.request,
        respond: state.manual_override.respond,
      },
    })),
  };
}

export function observabilityEventsToEventRows(
  events: ObservabilityEventInput[]
): EventLogRowModel[] {
  return events.map((event, index) => {
    const tone = classifyEventLogTone(event);
    return {
      // Index keeps the key unique when several events share a tick/domain/event.
      id: `${index}-${event.ts}-${event.component}-${event.domain}-${event.event}`,
      badgeLabel: eventLogToneLabel(tone),
      badgeTone: tone,
      message: event.message ?? event.event,
      timestampLabel: formatEventTimestamp(event.ts),
    };
  });
}

function classifyEventLogTone(event: ObservabilityEventInput): EventLogRowModel['badgeTone'] {
  const domain = event.domain.toLowerCase();
  const name = event.event.toLowerCase();
  const joined = `${domain}:${name}`;

  if (event.level === 'error' || event.level === 'warn' || joined.includes('fail') || joined.includes('lost')) {
    return 'error';
  }
  if (joined.includes('peer_policy') || joined.includes('peer-policy') || joined.includes('permission')) {
    return 'peer-policy';
  }
  if (joined.includes('signer_policy') || joined.includes('signer-policy') || joined.includes('policy')) {
    return 'signer-policy';
  }
  if (domain.includes('sign') || name.includes('sign')) return 'sign';
  if (domain.includes('ecdh') || name.includes('ecdh')) return 'ecdh';
  if (domain.includes('ping') || name.includes('ping')) return 'ping';
  if (domain.includes('echo') || name.includes('echo')) return 'echo';
  if (domain.includes('sync') || name.includes('sync')) return 'sync';
  if (
    name.endsWith('_ok') ||
    name.includes('ready') ||
    name.includes('restore_complete') ||
    name === 'connected'
  ) {
    return 'ready';
  }
  return 'info';
}

function eventLogToneLabel(tone: EventLogRowModel['badgeTone']): string {
  switch (tone) {
    case 'danger':
    case 'warning':
    case 'error':
      return 'error';
    case 'success':
    case 'ready':
      return 'ready';
    case 'signer-policy':
    case 'policy':
      return 'signer policy';
    case 'peer-policy':
      return 'peer policy';
    case 'default':
      return 'info';
    default:
      return tone;
  }
}

function runtimePeerToReadinessRow(peer: RuntimePeerStatusInput): PeerReadinessRowModel {
  return {
    id: peer.pubkey,
    alias: `Peer #${peer.idx}`,
    pubkey: peer.pubkey,
    state: peer.online ? (peer.can_sign ? 'online' : 'idle') : 'offline',
    statusLabel: peer.can_sign ? 'sign-ready' : peer.online ? 'online' : 'offline',
    canSign: peer.can_sign,
    canEcdh: peer.can_ecdh,
    canPing: peer.can_ping,
    incomingAvailable: peer.incoming_available,
    outgoingAvailable: peer.outgoing_available,
    outgoingSpent: peer.outgoing_spent,
    lastResponseLatencyMs: peer.last_response_latency_ms,
    avgLatencyMs: peer.avg_latency_ms,
    nonceSeries: peer.nonce_history.map((point) => ({ ts: point.ts, held: point.held })),
    lastSeenLabel: peer.last_seen ? `last seen ${formatTimestamp(peer.last_seen)}` : undefined,
  };
}

// A peer known from the roster or a saved policy but not currently reporting live
// status: a roster peer renders "known/idle", a policy-only peer "offline". This is
// the single home for the empty-telemetry defaults.
function offlinePeerRow(
  pubkey: string,
  alias: string,
  opts: { known: boolean },
): PeerReadinessRowModel {
  return {
    id: pubkey,
    alias,
    pubkey,
    state: opts.known ? 'idle' : 'offline',
    statusLabel: opts.known ? 'known' : 'offline',
    canSign: false,
    canEcdh: false,
    canPing: false,
    lastResponseLatencyMs: null,
    avgLatencyMs: null,
    nonceSeries: [],
  };
}

/**
 * Canonical peer→row projection for the signer dashboard. Merges the runtime's
 * live peer status with the known group roster and any policy-known peers so peers
 * that are not currently reporting still appear: live peers carry full telemetry
 * (capability badges, latency, nonce history); roster-only peers render "known/idle"
 * and policy-only peers "offline". Deduped by lowercased pubkey, sorted by pubkey.
 *
 * All clients (pwa / chrome / home) call this rather than re-implementing the merge —
 * they only need to hand over their pubkey lists, not their policy shapes.
 */
export function buildPeerReadinessRows(input: {
  peers: RuntimePeerStatusInput[];
  rosterPubkeys?: string[];
  policyPubkeys?: string[];
}): PeerReadinessRowModel[] {
  const rows = new Map<string, PeerReadinessRowModel>();
  let aliasSeq = 0;

  // (1) Policy-known peers → offline placeholders.
  for (const pubkey of input.policyPubkeys ?? []) {
    const normalized = pubkey.toLowerCase();
    if (rows.has(normalized)) continue;
    rows.set(normalized, offlinePeerRow(normalized, `Peer #${++aliasSeq}`, { known: false }));
  }

  // (2) Roster peers → upgrade to known/idle, preserving any alias already assigned.
  for (const pubkey of input.rosterPubkeys ?? []) {
    const normalized = pubkey.toLowerCase();
    const alias = rows.get(normalized)?.alias ?? `Peer #${++aliasSeq}`;
    rows.set(normalized, offlinePeerRow(normalized, alias, { known: true }));
  }

  // (3) Live peers → full telemetry rows, keeping any prior (roster/policy) alias.
  for (const peer of input.peers) {
    const normalized = peer.pubkey.toLowerCase();
    const existingAlias = rows.get(normalized)?.alias;
    const row = runtimePeerToReadinessRow({ ...peer, pubkey: normalized });
    rows.set(normalized, existingAlias ? { ...row, alias: existingAlias } : row);
  }

  return [...rows.values()].sort((a, b) => a.pubkey.localeCompare(b.pubkey));
}

const APPROVAL_METHODS = ['ping', 'onboard', 'sign', 'ecdh'] as const;
type ApprovalMethod = (typeof APPROVAL_METHODS)[number];

function approvalMethod(method: string): ApprovalMethod {
  return (APPROVAL_METHODS as readonly string[]).includes(method)
    ? (method as ApprovalMethod)
    : 'sign';
}

function shortPubkey(pubkey: string): string {
  return pubkey.length > 12 ? `${pubkey.slice(0, 6)}…${pubkey.slice(-4)}` : pubkey;
}

/**
 * Canonical projection of the runtime's parked-approval queue into dashboard
 * rows. All clients (pwa / chrome / home) call this rather than re-deriving the
 * shape, mirroring {@link buildPeerReadinessRows}. `peerAliases` maps a
 * lowercased pubkey to the alias already shown on the peer rows so an approval
 * names the same peer consistently; absent entries fall back to a short pubkey.
 */
export function buildPendingApprovalRows(input: {
  approvals: RuntimePendingApprovalInput[];
  peerAliases?: Record<string, string>;
  nowMs?: number;
}): PendingApprovalRowModel[] {
  return input.approvals.map((approval): PendingApprovalRowModel => {
    const normalized = approval.peer.toLowerCase();
    const alias = input.peerAliases?.[normalized];
    const method = approvalMethod(approval.method);
    return {
      id: approval.request_id,
      methodLabel: approval.method.toUpperCase(),
      peerLabel: alias ?? shortPubkey(normalized),
      detailLabel: `${approval.method.toUpperCase()} request awaiting operator approval`,
      expiresLabel: formatExpiryCountdown(approval.expires_at, input.nowMs),
      pubkey: normalized,
      method,
    };
  });
}

function formatExpiryCountdown(value: number, nowMs = Date.now()) {
  const normalized = value > 10_000_000_000 ? value : value * 1000;
  const remainingSeconds = Math.max(0, Math.ceil((normalized - nowMs) / 1000));
  if (remainingSeconds <= 0) return 'expired';
  if (remainingSeconds < 60) return `${remainingSeconds}s`;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  if (minutes < 60) return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatTimestamp(value: number) {
  const normalized = value > 10_000_000_000 ? value : value * 1000;
  return new Date(normalized).toLocaleString();
}

function formatEventTimestamp(value: number) {
  const normalized = value > 10_000_000_000 ? value : value * 1000;
  const date = new Date(normalized);
  const suffix = date.getHours() >= 12 ? 'p' : 'a';
  const hour = date.getHours() % 12 || 12;
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${hour}:${minute}:${second}${suffix}`;
}
