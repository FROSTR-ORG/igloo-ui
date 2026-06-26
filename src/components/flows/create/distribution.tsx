import * as React from 'react';
import { Check, Copy, KeyRound, Play, QrCode, RotateCcw, Square, X } from 'lucide-react';

import { Button } from '../../ui/button';
import { StatusDot } from '../../ui/status-indicator';
import { CRITICAL_E2E_TEST_IDS } from '../../../lib/e2e-test-ids';
import { methodToneClass } from '../../../lib/method-tone';
import { passwordManagerOptOutProps } from '../../../lib/password-manager';
import type {
  SharedGeneratedShare,
  SharedDistributionDraft,
  SharedDistributionResult,
  SharedDistributionStatus,
  SharedDistributionAction,
  SharedDistributionPermission,
} from './types';
import { CreateActionRow, shortKey } from './common';

function statusLabel(status: SharedDistributionStatus) {
  switch (status) {
    case 'packaged':
      return 'Packaged';
    case 'delivered':
      return 'Delivered';
    case 'saved':
      return 'Saved';
    case 'onboarded':
      return 'Onboarded';
    default:
      return 'Draft';
  }
}

function packagePreview(result?: SharedDistributionResult) {
  if (!result?.packageText) return 'Waiting for package password';
  return `${result.packageText.slice(0, 24)}...`;
}

function CreatePermissionToggles({
  share,
  enabled,
  onTogglePermission,
}: {
  share: SharedGeneratedShare;
  enabled: SharedDistributionPermission[];
  onTogglePermission?: (memberIdx: number, permission: SharedDistributionPermission, enabled: boolean) => void;
}) {
  return (
    <div className="igloo-create-peer-permission-row">
      <div>
        <strong>Permissions</strong>
      </div>
      <div aria-label={`${share.name} permissions`}>
        {(['sign', 'ecdh', 'ping', 'onboard'] as const).map((permission) => {
          const isEnabled = enabled.includes(permission);
          return (
            <button
              type="button"
              key={permission}
              className={`${methodToneClass(permission)} ${isEnabled ? 'is-enabled' : 'is-disabled'}`}
              aria-label={`${share.name} ${permission} permission: ${isEnabled ? 'enabled' : 'disabled'}`}
              aria-pressed={isEnabled}
              data-method={permission}
              data-state={isEnabled ? 'active' : 'inactive'}
              onClick={() => onTogglePermission?.(share.member_idx, permission, !isEnabled)}
            >
              {permission.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OnboardingClientCard({
  running,
  relayCount,
  peerCount,
  signerPubkey,
  onStart,
  onStop,
}: {
  running: boolean;
  relayCount: number;
  peerCount?: number;
  signerPubkey?: string;
  onStart: () => void;
  onStop: () => void;
}) {
  const metaParts = [`${relayCount} ${relayCount === 1 ? 'relay' : 'relays'}`];
  if (typeof peerCount === 'number') {
    metaParts.push(`${peerCount} ${peerCount === 1 ? 'peer' : 'peers'}`);
  }
  if (signerPubkey) {
    metaParts.push(shortKey(signerPubkey));
  }

  return (
    <section className={running ? 'igloo-create-client-card is-running' : 'igloo-create-client-card'}>
      <div className="igloo-create-client-info">
        <header>
          <StatusDot state={running ? 'online' : 'offline'} />
          <strong>Onboarding Client</strong>
          <span className="igloo-create-client-state">{running ? 'Running' : 'Stopped'}</span>
        </header>
        <p>{metaParts.join(' · ')}</p>
      </div>
      {running ? (
        <Button type="button" size="sm" variant="secondary" onClick={onStop}>
          <Square size={13} aria-hidden="true" />
          Stop
        </Button>
      ) : (
        <Button type="button" size="sm" onClick={onStart}>
          <Play size={13} aria-hidden="true" />
          Start
        </Button>
      )}
    </section>
  );
}

function CreateFlowDistributionCard({
  share,
  draft,
  result,
  permissions,
  onTogglePermission,
  onChangeDraft,
  onDistribute,
}: {
  share: SharedGeneratedShare;
  draft: SharedDistributionDraft;
  result?: SharedDistributionResult;
  permissions?: SharedDistributionPermission[];
  onTogglePermission?: (memberIdx: number, permission: SharedDistributionPermission, enabled: boolean) => void;
  onChangeDraft: (
    memberIdx: number,
    field: keyof SharedDistributionDraft,
    value: string,
  ) => void;
  onDistribute: (memberIdx: number, kind: SharedDistributionAction) => void;
}) {
  const status: SharedDistributionStatus = result?.status ?? 'draft';
  const isDraft = status === 'draft';
  const isPackaged = status === 'packaged';
  const isCompleted = status === 'delivered' || status === 'saved' || status === 'onboarded';
  const enabledPermissions = permissions ?? ['sign', 'ecdh', 'ping', 'onboard'];

  const statusClass =
    status === 'onboarded'
      ? 'igloo-create-distribution-status is-onboarded'
      : isCompleted || isPackaged
        ? 'igloo-create-distribution-status is-ready'
        : 'igloo-create-distribution-status';
  const cardClass =
    status === 'onboarded'
      ? 'igloo-create-distribution-card is-onboarded'
      : isCompleted || isPackaged
        ? 'igloo-create-distribution-card is-ready'
        : 'igloo-create-distribution-card';

  return (
    <section
      className={cardClass}
      data-testid={CRITICAL_E2E_TEST_IDS.distributionCard}
      data-member-idx={share.member_idx}
      data-status={status}
    >
      <header>
        <div>
          <h3>{share.name}</h3>
        </div>
        <span className={statusClass}>
          {isCompleted || isPackaged ? <Check size={12} aria-hidden="true" /> : null}
          {statusLabel(status)}
        </span>
      </header>

      <CreatePermissionToggles
        share={share}
        enabled={enabledPermissions}
        onTogglePermission={onTogglePermission}
      />

      {isDraft ? (
        <>
          <div className="igloo-create-package-password">
            <label>
              <span>Package Password</span>
              <input
                aria-label="Package password"
                data-testid={CRITICAL_E2E_TEST_IDS.distributionPackagePassword}
                type="password"
                {...passwordManagerOptOutProps}
                value={draft.packagePassword}
                onChange={(event) => {
                  onChangeDraft(share.member_idx, 'packagePassword', event.target.value);
                  onChangeDraft(share.member_idx, 'confirmPassword', event.target.value);
                }}
                placeholder="Enter password"
              />
            </label>
          </div>
          <Button type="button" className="igloo-create-package-action" data-testid={CRITICAL_E2E_TEST_IDS.distributionPrepare} onClick={() => onDistribute(share.member_idx, 'prepare')}>
            <KeyRound size={14} aria-hidden="true" />
            Create Package
          </Button>
        </>
      ) : null}

      {isPackaged ? (
        <>
          <div className="igloo-create-package-preview">
            <code>{packagePreview(result)}</code>
          </div>
          <div className="igloo-create-distribution-actions">
            <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.distributionCopy} onClick={() => onDistribute(share.member_idx, 'copy')}>
              <Copy size={13} aria-hidden="true" />
              Copy
            </Button>
            <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.distributionSave} onClick={() => onDistribute(share.member_idx, 'save')}>
              Save
            </Button>
            <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.distributionQr} onClick={() => onDistribute(share.member_idx, 'qr')}>
              <QrCode size={13} aria-hidden="true" />
              QR code
            </Button>
          </div>
          <div className="igloo-create-distribution-actions">
            <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.distributionCancel} onClick={() => onDistribute(share.member_idx, 'cancel')}>
              <X size={13} aria-hidden="true" />
              Cancel
            </Button>
            <Button type="button" size="sm" data-testid={CRITICAL_E2E_TEST_IDS.distributionMark} onClick={() => onDistribute(share.member_idx, 'mark')}>
              <Check size={13} aria-hidden="true" />
              Mark Delivered
            </Button>
          </div>
        </>
      ) : null}

      {isCompleted ? (
        <div className="igloo-create-distribution-actions">
          <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.distributionRevert} onClick={() => onDistribute(share.member_idx, 'revert')}>
            <RotateCcw size={13} aria-hidden="true" />
            Revert
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export function CreateFlowDistributionCards({
  shares,
  drafts,
  results,
  permissions = {},
  onTogglePermission,
  onChangeDraft,
  onDistribute,
  onFinish,
  onBack,
  finishLabel = 'Finish Setup',
}: {
  shares: SharedGeneratedShare[];
  drafts: Record<number, SharedDistributionDraft>;
  results: Record<number, SharedDistributionResult>;
  permissions?: Record<number, SharedDistributionPermission[]>;
  onTogglePermission?: (memberIdx: number, permission: SharedDistributionPermission, enabled: boolean) => void;
  onChangeDraft: (
    memberIdx: number,
    field: keyof SharedDistributionDraft,
    value: string,
  ) => void;
  onDistribute: (memberIdx: number, kind: SharedDistributionAction) => void;
  onFinish: () => void;
  onBack?: () => void;
  finishLabel?: string;
}) {
  const orderedShares = [...shares].sort((a, b) => a.member_idx - b.member_idx);

  return (
    <div className="igloo-create-distribution-list">
      {orderedShares.map((share) => {
        const form = drafts[share.member_idx] ?? {
          label: share.name,
          packagePassword: '',
          confirmPassword: '',
        };
        const result = results[share.member_idx];
        return (
          <CreateFlowDistributionCard
            key={`distribution-${share.member_idx}`}
            share={share}
            draft={form}
            result={result}
            permissions={permissions[share.member_idx]}
            onTogglePermission={onTogglePermission}
            onChangeDraft={onChangeDraft}
            onDistribute={onDistribute}
          />
        );
      })}
      <CreateActionRow onBack={onBack}>
        <Button type="button" className="igloo-create-primary-action" data-testid={CRITICAL_E2E_TEST_IDS.distributionFinish} onClick={onFinish}>
          {finishLabel}
        </Button>
      </CreateActionRow>
    </div>
  );
}

export function CreateFlowDistributionSection({
  sectionTitle,
  sectionDescription,
  shares,
  drafts,
  results,
  permissions,
  onTogglePermission,
  onChangeDraft,
  onDistribute,
  onFinish,
  onBack,
  finishLabel,
  beforeCards,
}: {
  bannerKicker?: string;
  bannerDescription?: React.ReactNode;
  bannerPoints?: string[];
  sectionTitle: string;
  sectionDescription: string;
  shares: SharedGeneratedShare[];
  drafts: Record<number, SharedDistributionDraft>;
  results: Record<number, SharedDistributionResult>;
  permissions?: Record<number, SharedDistributionPermission[]>;
  onTogglePermission?: (memberIdx: number, permission: SharedDistributionPermission, enabled: boolean) => void;
  onChangeDraft: (
    memberIdx: number,
    field: keyof SharedDistributionDraft,
    value: string,
  ) => void;
  onDistribute: (memberIdx: number, kind: SharedDistributionAction) => void;
  onFinish: () => void;
  onBack?: () => void;
  finishLabel?: string;
  beforeCards?: React.ReactNode;
}) {
  return (
    <section className="igloo-create-distribution-form">
      {beforeCards}
      <div className="igloo-create-distribution-heading">
        <h3>{sectionTitle}</h3>
        <p>{sectionDescription}</p>
      </div>
      <CreateFlowDistributionCards
        shares={shares}
        drafts={drafts}
        results={results}
        permissions={permissions}
        onTogglePermission={onTogglePermission}
        onChangeDraft={onChangeDraft}
        onDistribute={onDistribute}
        onFinish={onFinish}
        onBack={onBack}
        finishLabel={finishLabel}
      />
    </section>
  );
}
