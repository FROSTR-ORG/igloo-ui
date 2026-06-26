import type {
  EventLogRowModel,
  PermissionMethodKey,
  PeerPolicyRowModel,
  PeerReadinessRowModel,
  PendingApprovalRowModel,
  PendingOperationRowModel,
  PolicyDashboardViewModel,
  SignerDashboardViewModel,
} from '../models/view-models';

type RuntimePeerStatusInput = {
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
  can_ping?: boolean;
  can_onboard?: boolean;
  can_ecdh?: boolean;
  should_send_nonces: boolean;
};

type RuntimePeerNonceInventorySampleInput = {
  updated_at: number;
  held_count: number;
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
  const policyByPeer = new Map(status.peer_permission_states.map((state) => [state.pubkey, state]));
  return {
    profileName: status.metadata.device_id,
    thresholdLabel: `${status.readiness.threshold}/${status.metadata.peers.length}`,
    publicKeyLabel: status.metadata.group_public_key,
    shareLabel: `Share #${status.metadata.member_idx}`,
    readinessLabel: status.readiness.sign_ready ? 'Signer online' : 'Signer degraded',
    relaySummary: status.readiness.degraded_reasons.length
      ? status.readiness.degraded_reasons.join(', ')
      : 'Runtime ready',
    peerRows: status.peers.map((peer) => runtimePeerToReadinessRow(peer, policyByPeer.get(peer.pubkey))),
    pendingApprovalRows: status.pending_operations
      .filter(isPendingApprovalOperation)
      .map(pendingOperationToApprovalRow),
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
  return events.map((event, index) => {
    const domain = normalizeEventDomain(event.domain);
    return {
      // Index keeps the key unique when several events share a tick/domain/event.
      id: `${index}-${event.ts}-${event.component}-${event.domain}-${event.event}`,
      badgeLabel: domain,
      badgeTone: deriveEventBadgeTone(event, domain),
      message: event.message ?? event.event,
      timestampLabel: formatEventTimestamp(event.ts),
    };
  });
}

function normalizeEventDomain(domain: string): string {
  const normalized = domain.trim().toLowerCase();
  if (normalized === 'signer policy') return 'policy';
  if (normalized === 'onboarding') return 'onboard';
  return normalized;
}

function deriveEventBadgeTone(
  event: ObservabilityEventInput,
  normalizedDomain = normalizeEventDomain(event.domain)
): EventLogRowModel['badgeTone'] {
  if (event.level === 'error') return 'danger';
  if (normalizedDomain === 'sync' || normalizedDomain === 'relay') return 'sync';
  if (normalizedDomain === 'sign') return 'success';
  if (normalizedDomain === 'ecdh') return 'ecdh';
  if (normalizedDomain === 'ping') return 'ping';
  if (normalizedDomain === 'echo') return 'echo';
  if (normalizedDomain === 'onboard') return 'onboard';
  if (normalizedDomain === 'policy') return 'policy';
  if (event.level === 'warn') return 'warning';
  return 'info';
}

function runtimePeerToReadinessRow(
  peer: RuntimePeerStatusInput,
  policyState?: RuntimePeerPermissionStateInput,
): PeerReadinessRowModel {
  return {
    id: peer.pubkey,
    alias: `Peer #${peer.idx}`,
    pubkey: peer.pubkey,
    state: peer.online ? (peer.can_sign ? 'online' : 'idle') : 'offline',
    statusLabel: peer.online ? (peer.can_sign ? 'sign-ready' : 'online') : 'offline',
    incomingAvailable: peer.incoming_available,
    outgoingAvailable: peer.outgoing_available,
    outgoingSpent: peer.outgoing_spent,
    latencyMs: peer.latency_ms,
    nonceInventoryHistory: peer.nonce_inventory_history?.map((sample) => ({
      updatedAt: sample.updated_at,
      heldCount: sample.held_count,
    })),
    permissionMethods: policyState
      ? policyStateToPermissionMethods(policyState)
      : peerCapabilityToPermissionMethods(peer),
    lastSeenLabel: peer.last_seen ? `last seen ${formatTimestamp(peer.last_seen)}` : undefined,
  };
}

function peerCapabilityToPermissionMethods(peer: RuntimePeerStatusInput): PermissionMethodKey[] | undefined {
  const methods: PermissionMethodKey[] = [];
  if (peer.can_sign) methods.push('sign');
  if (peer.can_ecdh) methods.push('ecdh');
  if (peer.can_ping) methods.push('ping');
  if (peer.can_onboard) methods.push('onboard');
  return methods.length ? methods : undefined;
}

function policyStateToPermissionMethods(state: RuntimePeerPermissionStateInput): PermissionMethodKey[] {
  const methods: PermissionMethodKey[] = [];
  for (const method of ['sign', 'ecdh', 'ping', 'onboard'] satisfies PermissionMethodKey[]) {
    if (state.effective_policy.request[method] || state.effective_policy.respond[method]) {
      methods.push(method);
    }
  }
  return methods;
}

function pendingOperationToRow(operation: RuntimePendingOperationInput): PendingOperationRowModel {
  const responseCount = operation.collected_responses.length;
  return {
    id: operation.request_id,
    operationLabel: operation.op_type,
    thresholdLabel: `threshold ${operation.threshold}`,
    startedLabel: formatTimestamp(operation.started_at),
    timeoutLabel: formatPendingExpiry(operation),
    responseLabel: `${responseCount} ${responseCount === 1 ? 'response' : 'responses'}`,
  };
}

function pendingOperationToApprovalRow(operation: RuntimePendingOperationInput, index: number): PendingApprovalRowModel {
  const context = isRecord(operation.context) ? operation.context : {};
  return {
    id: operation.request_id,
    methodLabel: readString(context, 'method_label') ?? operation.op_type,
    peerLabel: readString(context, 'peer_label') ?? formatPendingPeerLabel(operation.target_peers[0], index),
    detailLabel: readString(context, 'detail_label') ?? formatPendingOperationDetail(operation.op_type, context),
    expiresLabel: formatPendingExpiry(operation),
  };
}

function isPendingApprovalOperation(operation: RuntimePendingOperationInput) {
  const context = isRecord(operation.context) ? operation.context : {};
  return (
    context.approval_required === true ||
    readString(context, 'method_label') !== undefined ||
    readString(context, 'peer_label') !== undefined ||
    readString(context, 'detail_label') !== undefined
  );
}

function formatPendingOperationDetail(operationType: string, context: Record<string, unknown>) {
  const kind = readString(context, 'kind');
  const kindLabel = readString(context, 'kind_label');
  if (kind && kindLabel) return `kind:${kind} ${kindLabel}`;
  if (kind) return `kind:${kind}`;
  const detail = readString(context, 'detail') ?? readString(context, 'event') ?? readString(context, 'request');
  return detail ?? operationType;
}

function formatPendingPeerLabel(pubkey: string | undefined, index: number) {
  return pubkey ? `Peer ${truncateMiddle(pubkey, 8, 4)}` : `Peer #${index + 1}`;
}

function formatPendingExpiry(operation: RuntimePendingOperationInput) {
  if (operation.timeout_at >= operation.started_at) {
    return formatDurationLabel(operation.timeout_at - operation.started_at);
  }
  return formatTimestamp(operation.timeout_at);
}

function formatDurationLabel(seconds: number) {
  const rounded = Math.max(0, Math.round(seconds));
  if (rounded < 60) return `${rounded}s`;
  const minutes = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return remainder ? `${minutes}m ${String(remainder).padStart(2, '0')}s` : `${minutes}m`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function readString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function truncateMiddle(value: string, prefix = 8, suffix = 4) {
  if (value.length <= prefix + suffix + 3) return value;
  return `${value.slice(0, prefix)}...${value.slice(-suffix)}`;
}

function formatTimestamp(value: number) {
  const normalized = value > 10_000_000_000 ? value : value * 1000;
  return new Date(normalized).toLocaleString();
}

function formatEventTimestamp(value: number) {
  const normalized = value > 10_000_000_000 ? value : value * 1000;
  const date = new Date(normalized);
  const hours = date.getHours();
  const hour12 = hours % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const meridiem = hours >= 12 ? 'p' : 'a';
  return `${hour12}:${minutes}:${seconds}${meridiem}`;
}
