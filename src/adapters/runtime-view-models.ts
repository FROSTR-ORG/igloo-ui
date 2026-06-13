import type {
  EventLogRowModel,
  PeerPolicyRowModel,
  PeerReadinessRowModel,
  PendingOperationRowModel,
  PolicyDashboardViewModel,
  SignerDashboardViewModel,
} from '../models/view-models';

type RuntimeNonceHistoryPointInput = {
  ts: number;
  held: number;
};

type RuntimePeerStatusInput = {
  idx: number;
  pubkey: string;
  known: boolean;
  last_seen: number | null;
  online: boolean;
  incoming_available: number;
  outgoing_available: number;
  outgoing_spent: number;
  can_sign: boolean;
  can_ecdh: boolean;
  can_ping: boolean;
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

type RuntimeMethodPolicy = {
  ping: boolean;
  onboard: boolean;
  sign: boolean;
  ecdh: boolean;
};

type RuntimePolicyOverrideValue = 'unset' | 'allow' | 'deny';

type RuntimeMethodPolicyOverride = {
  ping: RuntimePolicyOverrideValue;
  onboard: RuntimePolicyOverrideValue;
  sign: RuntimePolicyOverrideValue;
  ecdh: RuntimePolicyOverrideValue;
};

type RuntimePeerPermissionStateInput = {
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

type RuntimeStatusSummaryInput = {
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

export function runtimeStatusToSignerDashboardView(
  status: RuntimeStatusSummaryInput
): SignerDashboardViewModel {
  return {
    profileName: status.metadata.device_id,
    thresholdLabel: `${status.readiness.threshold}/${status.metadata.peers.length}`,
    publicKeyLabel: status.metadata.group_public_key,
    shareLabel: `Share #${status.metadata.member_idx}`,
    readinessLabel: status.readiness.sign_ready ? 'Signer online' : 'Signer degraded',
    relaySummary: status.readiness.degraded_reasons.length
      ? status.readiness.degraded_reasons.join(', ')
      : 'Runtime ready',
    peerRows: status.peers.map(runtimePeerToReadinessRow),
    pendingOperationRows: status.pending_operations.map(pendingOperationToRow),
    eventRows: [],
  };
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
  return events.map((event, index) => ({
    // Index keeps the key unique when several events share a tick/domain/event.
    id: `${index}-${event.ts}-${event.component}-${event.domain}-${event.event}`,
    badgeLabel: event.domain,
    badgeTone: event.level === 'error' ? 'danger' : event.level === 'warn' ? 'warning' : 'info',
    message: event.message ?? event.event,
    timestampLabel: formatTimestamp(event.ts),
  }));
}

function runtimePeerToReadinessRow(peer: RuntimePeerStatusInput): PeerReadinessRowModel {
  return {
    id: peer.pubkey,
    alias: `Peer #${peer.idx}`,
    pubkey: peer.pubkey,
    state: peer.online ? (peer.can_sign ? 'online' : 'idle') : peer.known ? 'warning' : 'offline',
    statusLabel: peer.can_sign ? 'sign-ready' : peer.online ? 'online' : peer.known ? 'known' : 'offline',
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

function pendingOperationToRow(operation: RuntimePendingOperationInput): PendingOperationRowModel {
  const responseCount = operation.collected_responses.length;
  return {
    id: operation.request_id,
    operationLabel: operation.op_type,
    thresholdLabel: `threshold ${operation.threshold}`,
    startedLabel: formatTimestamp(operation.started_at),
    timeoutLabel: formatTimestamp(operation.timeout_at),
    responseLabel: `${responseCount} ${responseCount === 1 ? 'response' : 'responses'}`,
  };
}

function formatTimestamp(value: number) {
  const normalized = value > 10_000_000_000 ? value : value * 1000;
  return new Date(normalized).toLocaleString();
}
