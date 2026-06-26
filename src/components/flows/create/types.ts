export type SharedCreateFormState = {
  groupName: string;
  threshold: string;
  count: string;
  privateKey?: string;
};

export type SharedRotationSource = {
  packageText: string;
  packagePassword: string;
  duplicateOfLocal?: boolean;
};

export type SharedGeneratedShare = {
  name: string;
  member_idx: number;
  share_public_key: string;
};

export type SharedDistributionDraft = {
  label: string;
  packagePassword: string;
  confirmPassword: string;
};

export type SharedDistributionStatus = 'draft' | 'packaged' | 'delivered' | 'saved' | 'onboarded';

export type SharedDistributionResult = {
  status: SharedDistributionStatus;
  label: string;
  packageText?: string;
};

export type SharedDistributionAction = 'prepare' | 'copy' | 'qr' | 'save' | 'mark' | 'cancel' | 'revert';

export type SharedLocalSaveDraft = {
  label: string;
  relayUrls: string;
  primarySecret: string;
  secondarySecret?: string;
};

export type SharedOnboardProfilePreview = {
  label: string;
  sharePublicKey: string;
  groupPublicKey: string;
  relays: string[];
};

export type SharedPeerPermissionRow = {
  label: string;
  detail?: string;
  enabled: Array<'sign' | 'ecdh' | 'ping' | 'onboard'>;
};

export type RelayPingFn = (url: string) => Promise<{ latencyMs?: number; error?: string }>;

export type SharedDistributionPermission = 'sign' | 'ecdh' | 'ping' | 'onboard';

export type SharedRecoverSource = { packageText: string; packagePassword: string; duplicateOfLocal?: boolean };
export type RecoverDeviceShareState = 'validated' | 'locked';

export type OnboardTimelineStepKey = 'connect' | 'negotiate' | 'finish';
