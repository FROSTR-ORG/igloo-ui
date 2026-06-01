import type * as React from 'react';

export type StoredProfileCardModel = {
  id: string;
  label: string;
  shortId: string;
  thresholdLabel?: string;
  publicKeyLabel?: string;
  updatedLabel?: string;
  state?: 'available' | 'locked' | 'active';
  primaryActionLabel?: string;
  destructiveActionLabel?: string;
};

export type FlowStepState = 'active' | 'pending' | 'complete' | 'error' | 'loading';

export type FlowStepModel = {
  id: string;
  label: string;
  state: FlowStepState;
  description?: string;
};

// A public key rendered with a truncated display plus the full encodings the
// operator can copy. Optional on the dashboard view: consumers that don't supply
// it (e.g. igloo-chrome) fall back to the plain truncated `publicKeyLabel` /
// `shareLabel` single-copy display.
export type DashboardKeyModel = {
  /** Truncated display value, e.g. `npub1qe3...7k4m`. */
  display: string;
  /** Full npub (bech32) encoding, copied by default. */
  npub: string;
  /** Full 32-byte hex encoding, copied via the format caret. */
  hex: string;
};

export type DashboardKeyFormat = 'npub' | 'hex';

export type SignerDashboardViewModel = {
  profileName: string;
  thresholdLabel: string;
  /** e.g. `Share #1` — shown inline on the merged identity/runtime card. */
  memberLabel?: string;
  publicKeyLabel: string;
  shareLabel: string;
  /** Structured group key enabling the npub/hex split-copy control. */
  groupKey?: DashboardKeyModel;
  /** Structured share key enabling the npub/hex split-copy control. */
  shareKey?: DashboardKeyModel;
  /** Whether the signer runtime is running (drives the merged card status dot). */
  running?: boolean;
  readinessLabel: string;
  relaySummary: string;
  peerRows: PeerReadinessRowModel[];
  /** Deferred interactive-approval feature: rendered as an empty-state card today. */
  pendingApprovalRows?: PendingApprovalRowModel[];
  pendingOperationRows: PendingOperationRowModel[];
  eventRows: EventLogRowModel[];
};

export type PendingApprovalRowModel = {
  id: string;
  methodLabel: string;
  peerLabel: string;
  detailLabel: string;
  expiresLabel: string;
};

export type PeerReadinessRowModel = {
  id: string;
  alias: string;
  pubkey: string;
  state: 'online' | 'warning' | 'offline' | 'idle';
  statusLabel: string;
  incomingAvailable?: number;
  outgoingAvailable?: number;
  outgoingSpent?: number;
};

export type PolicyDashboardViewModel = {
  peerRows: PeerPolicyRowModel[];
  siteRows?: SitePolicyRowModel[];
};

export type PeerPolicyRowModel = {
  pubkey: string;
  request: PolicyMethodState;
  respond: PolicyMethodState;
  manualOverride?: {
    request: PolicyMethodOverrideState;
    respond: PolicyMethodOverrideState;
  };
};

export type SitePolicyRowModel = {
  id: string;
  host: string;
  methodLabel: string;
  scopeLabel?: string;
  state: 'allow' | 'deny';
  createdAtLabel: string;
};

export type PolicyMethodState = {
  ping: boolean;
  onboard: boolean;
  sign: boolean;
  ecdh: boolean;
};

export type PolicyOverrideValue = 'unset' | 'allow' | 'deny';

export type PolicyMethodOverrideState = {
  ping: PolicyOverrideValue;
  onboard: PolicyOverrideValue;
  sign: PolicyOverrideValue;
  ecdh: PolicyOverrideValue;
};

export type PendingOperationRowModel = {
  id: string;
  operationLabel: string;
  thresholdLabel: string;
  startedLabel: string;
  timeoutLabel: string;
  responseLabel: string;
};

export type EventLogRowModel = {
  id: string;
  badgeLabel: string;
  badgeTone: 'default' | 'success' | 'warning' | 'danger' | 'info';
  message: React.ReactNode;
  timestampLabel?: string;
};
