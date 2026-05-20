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

export type PaperStepState = 'active' | 'pending' | 'complete' | 'error' | 'loading';

export type PaperStepModel = {
  id: string;
  label: string;
  state: PaperStepState;
  description?: string;
};

export type SignerDashboardViewModel = {
  profileName: string;
  thresholdLabel: string;
  publicKeyLabel: string;
  shareLabel: string;
  readinessLabel: string;
  relaySummary: string;
  peerRows: PeerReadinessRowModel[];
  pendingOperationRows: PendingOperationRowModel[];
  eventRows: EventLogRowModel[];
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
  manualOverride?: PolicyMethodOverrideState;
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
