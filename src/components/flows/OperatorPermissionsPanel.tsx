import * as React from 'react';

import { CRITICAL_E2E_TEST_IDS } from '../../lib/e2e-test-ids';
import type {
  PolicyDashboardViewModel,
  PolicyMethodOverrideState,
  PolicyMethodState,
  PolicyOverrideValue,
} from '../../models/view-models';
import { Button } from '../ui/button';
import { ContentCard } from '../ui/content-card';

type Props = {
  view: PolicyDashboardViewModel;
  loading?: boolean;
  onRefresh?: () => void;
  onClearAllSitePermissions?: () => void;
  onRevokeSitePermission?: (permissionId: string) => void;
  onClearAllPeerPermissions?: () => void;
  onPeerPolicyOverrideChange?: (
    pubkey: string,
    direction: 'request' | 'respond',
    method: keyof PolicyMethodOverrideState,
    value: PolicyOverrideValue
  ) => void;
  siteTitle?: string;
  peerTitle?: string;
  siteDescription?: string;
  peerDescription?: string;
  siteEmptyText?: string;
  peerEmptyText?: string;
  peerClearAllLabel?: string;
  /**
   * Show the "Peers" / "Effective responders" summary pills. Paper's Permissions
   * design omits them, so the PWA opts out; other consumers (e.g. igloo-chrome)
   * keep the default. Site-policy pills are unaffected.
   */
  showPeerSummary?: boolean;
};

export function OperatorPermissionsPanel({
  view,
  loading = false,
  onRefresh,
  onClearAllSitePermissions,
  onRevokeSitePermission,
  onClearAllPeerPermissions,
  onPeerPolicyOverrideChange,
  // "Permissions" is the canonical user-facing term (the policies declare
  // permissions); Paper labels these sections "Signer Permissions" / "Peer
  // Permissions".
  siteTitle = 'Signer Permissions',
  peerTitle = 'Peer Permissions',
  siteDescription = 'Permissions granted to websites through the signing bridge.',
  peerDescription = 'Stored inbound and outbound peer rules for the signer runtime.',
  siteEmptyText = 'No website permissions have been granted yet.',
  peerEmptyText = 'No peer policy state has been saved yet.',
  peerClearAllLabel = 'Clear All',
  showPeerSummary = true,
}: Props) {
  const siteRows = view.siteRows ?? [];
  const siteCount = siteRows.length;
  const allowedSiteCount = siteRows.filter((permission) => permission.state === 'allow').length;
  const effectiveResponderCount = view.peerRows.filter(
    (policy) => policy.respond.sign || policy.respond.ecdh
  ).length;
  const showSummary = Boolean(view.siteRows) || showPeerSummary;

  return (
    <div className="space-y-6">
      {showSummary ? (
        <div className="grid gap-3 md:grid-cols-3">
          {view.siteRows ? (
            <>
              <SummaryPill label="Site policies" value={siteCount} tone="blue" />
              <SummaryPill label="Allowed origins" value={allowedSiteCount} tone="green" />
            </>
          ) : null}
          {showPeerSummary ? (
            <>
              <SummaryPill label="Peers" value={view.peerRows.length} tone="blue" />
              <SummaryPill label="Effective responders" value={effectiveResponderCount} tone="blue" />
            </>
          ) : null}
        </div>
      ) : null}

      {view.siteRows ? (
        <ContentCard
          title={siteTitle}
          description={siteDescription}
          action={
            <div className="flex gap-2">
              {onRefresh ? (
                <Button variant="secondary" size="sm" onClick={onRefresh} disabled={loading}>
                  Refresh
                </Button>
              ) : null}
              {onClearAllSitePermissions ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onClearAllSitePermissions}
                  disabled={!siteRows.length}
                >
                  Clear All
                </Button>
              ) : null}
            </div>
          }
        >
          {siteRows.length === 0 ? (
            <div className="rounded border border-dashed border-blue-900/30 px-4 py-6 text-sm text-gray-400">
              {siteEmptyText}
            </div>
          ) : (
            <div className="space-y-3">
              {siteRows.map((permission) => (
                <div
                  key={permission.id}
                  className="rounded-lg border border-blue-900/20 bg-gray-950/30 p-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-blue-200">{permission.host}</div>
                      <div className="text-xs text-gray-400">
                        Method: {permission.methodLabel}
                        {permission.scopeLabel ? ` • ${permission.scopeLabel}` : ''}
                      </div>
                      <div className="text-xs text-gray-500">Saved: {permission.createdAtLabel}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          permission.state === 'allow'
                            ? 'bg-green-500/20 text-green-300 ring-1 ring-green-500/30'
                            : 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30'
                        }`}
                      >
                        {permission.state}
                      </span>
                      {onRevokeSitePermission ? (
                        <Button variant="secondary" size="sm" onClick={() => onRevokeSitePermission(permission.id)}>
                          Revoke
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ContentCard>
      ) : null}

      <ContentCard
        title={peerTitle}
        description={peerDescription}
        action={
          <div className="flex gap-2">
            {onRefresh ? (
              <Button variant="secondary" size="sm" onClick={onRefresh} disabled={loading}>
                Refresh
              </Button>
            ) : null}
            {onClearAllPeerPermissions ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={onClearAllPeerPermissions}
                disabled={!view.peerRows.length}
              >
                {peerClearAllLabel}
              </Button>
            ) : null}
          </div>
        }
      >
        {view.peerRows.length === 0 ? (
          <div className="rounded border border-dashed border-blue-900/30 px-4 py-6 text-sm text-gray-400">
            {peerEmptyText}
          </div>
        ) : (
          <div className="space-y-4">
            {view.peerRows.map((policy) => (
              <div
                key={policy.pubkey}
                className="rounded-lg border border-blue-900/20 bg-gray-950/30 p-3.5"
              >
                <div className="mb-3 font-mono text-sm text-blue-200">{policy.pubkey}</div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <PermissionSection
                    title="Request"
                    direction="request"
                    peerPubkey={policy.pubkey}
                    policy={policy.request}
                    overrides={policy.manualOverride?.request}
                    onChange={
                      onPeerPolicyOverrideChange
                        ? (method, value) => onPeerPolicyOverrideChange(policy.pubkey, 'request', method, value)
                        : undefined
                    }
                  />
                  <PermissionSection
                    title="Respond"
                    direction="respond"
                    peerPubkey={policy.pubkey}
                    policy={policy.respond}
                    overrides={policy.manualOverride?.respond}
                    onChange={
                      onPeerPolicyOverrideChange
                        ? (method, value) => onPeerPolicyOverrideChange(policy.pubkey, 'respond', method, value)
                        : undefined
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentCard>
    </div>
  );
}

type PermissionSectionProps = {
  title: string;
  direction: 'request' | 'respond';
  peerPubkey: string;
  policy: PolicyMethodState;
  overrides?: PolicyMethodOverrideState;
  onChange?: (method: keyof PolicyMethodOverrideState, value: PolicyOverrideValue) => void;
};

function PermissionSection({ title, direction, peerPubkey, policy, overrides, onChange }: PermissionSectionProps) {
  return (
    <div className="space-y-2">
      <div className="text-[0.68rem] uppercase tracking-[0.18em] text-slate-400">{title}</div>
      <div className="rounded border border-blue-900/20 px-3 py-2">
        <div className="flex flex-wrap gap-2">
          {(['ping', 'onboard', 'sign', 'ecdh'] as const).map((method) => {
            const effectiveValue = policy[method];
            const overrideValue = overrides?.[method] ?? 'unset';
            const label = effectiveValue ? 'allow' : 'deny';
            return (
              <MethodToken
                key={method}
                direction={direction}
                peerPubkey={peerPubkey}
                method={method}
                label={label}
                value={effectiveValue}
                override={overrideValue}
                editable={Boolean(onChange)}
                onClick={
                  onChange
                    ? () => onChange(method, nextOverrideValue(effectiveValue, overrideValue))
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function nextOverrideValue(effectiveValue: boolean, overrideValue: PolicyOverrideValue): PolicyOverrideValue {
  if (overrideValue === 'allow') return 'deny';
  if (overrideValue === 'deny') return 'unset';
  return effectiveValue ? 'deny' : 'allow';
}

function MethodToken({
  direction,
  peerPubkey,
  method,
  label,
  value,
  override,
  editable,
  onClick
}: {
  direction: 'request' | 'respond';
  peerPubkey: string;
  method: string;
  label: string;
  value: boolean;
  override: PolicyOverrideValue;
  editable?: boolean;
  onClick?: () => void;
}) {
  const tone = value
    ? 'border-green-500/40 bg-green-500/10 text-green-300'
    : 'border-red-500/40 bg-red-500/10 text-red-300';
  const content = `${direction} ${method}: ${label}`;
  // Stable e2e hook: one id, disambiguated by peer/direction/method. data-allowed
  // mirrors the live EFFECTIVE policy; data-override mirrors the operator's manual
  // override (the directly-edited, persisted tri-state). Specs assert either
  // without parsing copy.
  const e2eProps = {
    'data-testid': CRITICAL_E2E_TEST_IDS.permissionToggle,
    'data-peer-pubkey': peerPubkey,
    'data-direction': direction,
    'data-method': method,
    'data-allowed': value ? 'true' : 'false',
    'data-override': override,
  };
  return editable ? (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border px-2.5 py-1 text-xs font-medium ${tone}`}
      {...e2eProps}
    >
      {content}
    </button>
  ) : (
    <span className={`rounded border px-2.5 py-1 text-xs font-medium ${tone}`} {...e2eProps}>
      {content}
    </span>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'blue' | 'green';
}) {
  const toneClasses =
    tone === 'green'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
      : 'border-blue-900/20 bg-blue-950/20 text-blue-200';

  return (
    <div className={`rounded-lg border px-3.5 py-3 ${toneClasses}`}>
      <div className="text-[0.68rem] uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 text-lg">{value}</div>
    </div>
  );
}
