import * as React from 'react';

import { Button } from '../ui/button';
import { ContentCard } from '../ui/content-card';

export type OperatorSitePermission = {
  id: string;
  host: string;
  methodLabel: string;
  scopeLabel: string;
  createdAtLabel: string;
  allow: boolean;
};

export type OperatorPeerPermission = {
  pubkey: string;
  send: boolean;
  receive: boolean;
};

export type OperatorPolicyOverrideValue = 'unset' | 'allow' | 'deny';

export type OperatorMethodPermission = {
  ping: boolean;
  onboard: boolean;
  sign: boolean;
  ecdh: boolean;
};

export type OperatorMethodPermissionOverride = {
  ping: OperatorPolicyOverrideValue;
  onboard: OperatorPolicyOverrideValue;
  sign: OperatorPolicyOverrideValue;
  ecdh: OperatorPolicyOverrideValue;
};

export type OperatorPeerPermissionState = {
  pubkey: string;
  manualOverride: {
    request: OperatorMethodPermissionOverride;
    respond: OperatorMethodPermissionOverride;
  };
  remoteObservation: {
    request: OperatorMethodPermission;
    respond: OperatorMethodPermission;
    updated: number;
    revision: number;
  } | null;
  effectivePolicy: {
    request: OperatorMethodPermission;
    respond: OperatorMethodPermission;
  };
};

type Props = {
  sitePermissions?: OperatorSitePermission[];
  peerPermissions: OperatorPeerPermission[];
  peerPermissionStates?: OperatorPeerPermissionState[];
  loading?: boolean;
  onRefresh?: () => void;
  onClearAllSitePermissions?: () => void;
  onRevokeSitePermission?: (permissionId: string) => void;
  onClearAllPeerPermissions?: () => void;
  onPeerPermissionChange?: (pubkey: string, field: 'send' | 'receive', value: boolean) => void;
  onPeerPermissionOverrideChange?: (
    pubkey: string,
    direction: 'request' | 'respond',
    method: keyof OperatorMethodPermissionOverride,
    value: OperatorPolicyOverrideValue
  ) => void;
  siteDescription?: string;
  peerDescription?: string;
  siteEmptyText?: string;
  peerEmptyText?: string;
  peerClearAllLabel?: string;
};

export function OperatorPermissionsPanel({
  sitePermissions,
  peerPermissions,
  peerPermissionStates,
  loading = false,
  onRefresh,
  onClearAllSitePermissions,
  onRevokeSitePermission,
  onClearAllPeerPermissions,
  onPeerPermissionChange,
  onPeerPermissionOverrideChange,
  siteDescription = 'Permissions granted to websites through the signing bridge.',
  peerDescription = 'Stored inbound and outbound peer rules for the signer runtime.',
  siteEmptyText = 'No website permissions have been granted yet.',
  peerEmptyText = 'No peer policy state has been saved yet.',
  peerClearAllLabel = 'Clear All',
}: Props) {
  const siteCount = sitePermissions?.length ?? 0;
  const allowedSiteCount = sitePermissions?.filter((permission) => permission.allow).length ?? 0;
  const peerSendCount = peerPermissions.filter((policy) => policy.send).length;
  const peerReceiveCount = peerPermissions.filter((policy) => policy.receive).length;
  const detailedPeerCount = peerPermissionStates?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        {sitePermissions ? (
          <>
            <SummaryPill label="Site policies" value={siteCount} tone="blue" />
            <SummaryPill label="Allowed origins" value={allowedSiteCount} tone="green" />
          </>
        ) : null}
        <SummaryPill
          label={peerPermissionStates ? 'Peers' : 'Peer send rules'}
          value={peerPermissionStates ? detailedPeerCount : peerSendCount}
          tone="blue"
        />
        <SummaryPill
          label={peerPermissionStates ? 'Effective responders' : 'Peer receive rules'}
          value={
            peerPermissionStates
              ? peerPermissionStates.filter(
                  (policy) => policy.effectivePolicy.respond.sign || policy.effectivePolicy.respond.ecdh
                ).length
              : peerReceiveCount
          }
          tone="blue"
        />
      </div>

      {sitePermissions ? (
        <ContentCard
          title="Site Policies"
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
                  disabled={!sitePermissions.length}
                >
                  Clear All
                </Button>
              ) : null}
            </div>
          }
        >
          {sitePermissions.length === 0 ? (
            <div className="rounded border border-dashed border-blue-900/30 px-4 py-6 text-sm text-gray-400">
              {siteEmptyText}
            </div>
          ) : (
            <div className="space-y-3">
              {sitePermissions.map((permission) => (
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
                          permission.allow
                            ? 'bg-green-500/20 text-green-300 ring-1 ring-green-500/30'
                            : 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30'
                        }`}
                      >
                        {permission.allow ? 'allow' : 'deny'}
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
        title="Peer Policies"
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
                disabled={!peerPermissions.length}
              >
                {peerClearAllLabel}
              </Button>
            ) : null}
          </div>
        }
      >
        {(peerPermissionStates ? peerPermissionStates.length === 0 : peerPermissions.length === 0) ? (
          <div className="rounded border border-dashed border-blue-900/30 px-4 py-6 text-sm text-gray-400">
            {peerEmptyText}
          </div>
        ) : peerPermissionStates ? (
          <div className="space-y-4">
            {peerPermissionStates.map((policy) => (
              <div
                key={policy.pubkey}
                className="rounded-lg border border-blue-900/20 bg-gray-950/30 p-3.5"
              >
                <div className="mb-3 font-mono text-sm text-blue-200">{policy.pubkey}</div>
                <div className="grid gap-4 lg:grid-cols-3">
                  <PermissionSection
                    title="Manual Override"
                    rows={[
                      { label: 'request', policy: policy.manualOverride.request, editable: true },
                      { label: 'respond', policy: policy.manualOverride.respond, editable: true }
                    ]}
                    onChange={
                      onPeerPermissionOverrideChange
                        ? (direction, method, value) =>
                            onPeerPermissionOverrideChange(policy.pubkey, direction, method, value)
                        : undefined
                    }
                  />
                  <PermissionSection
                    title="Remote Reported"
                    rows={
                      policy.remoteObservation
                        ? [
                            {
                              label: `request · rev ${policy.remoteObservation.revision}`,
                              policy: policy.remoteObservation.request
                            },
                            {
                              label: `respond · ${new Date(policy.remoteObservation.updated).toLocaleString()}`,
                              policy: policy.remoteObservation.respond
                            }
                          ]
                        : [{ label: 'status', emptyText: 'No remote policy observed yet.' }]
                    }
                  />
                  <PermissionSection
                    title="Effective"
                    rows={[
                      { label: 'request', policy: policy.effectivePolicy.request },
                      { label: 'respond', policy: policy.effectivePolicy.respond }
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {peerPermissions.map((policy) => (
              <div
                key={policy.pubkey}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-900/20 bg-gray-950/30 p-3.5"
              >
                <div className="font-mono text-sm text-blue-200">{policy.pubkey}</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {onPeerPermissionChange ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onPeerPermissionChange(policy.pubkey, 'send', !policy.send)}
                        className={`rounded border px-3 py-1.5 font-medium uppercase tracking-wide transition-colors ${
                          policy.send
                            ? 'border-green-500/50 bg-green-500/10 text-green-300 hover:bg-green-500/20'
                            : 'border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20'
                        }`}
                      >
                        send: {policy.send ? 'allow' : 'deny'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onPeerPermissionChange(policy.pubkey, 'receive', !policy.receive)}
                        className={`rounded border px-3 py-1.5 font-medium uppercase tracking-wide transition-colors ${
                          policy.receive
                            ? 'border-green-500/50 bg-green-500/10 text-green-300 hover:bg-green-500/20'
                            : 'border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20'
                        }`}
                      >
                        receive: {policy.receive ? 'allow' : 'deny'}
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-blue-200">
                        send: {policy.send ? 'allow' : 'deny'}
                      </span>
                      <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-blue-200">
                        receive: {policy.receive ? 'allow' : 'deny'}
                      </span>
                    </>
                  )}
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
  rows: Array<
    | {
        label: string;
        policy: OperatorMethodPermission | OperatorMethodPermissionOverride;
        editable?: boolean;
      }
    | {
        label: string;
        emptyText: string;
      }
  >;
  onChange?: (
    direction: 'request' | 'respond',
    method: keyof OperatorMethodPermissionOverride,
    value: OperatorPolicyOverrideValue
  ) => void;
};

function PermissionSection({ title, rows, onChange }: PermissionSectionProps) {
  return (
    <div className="space-y-2">
      <div className="text-[0.68rem] uppercase tracking-[0.18em] text-slate-400">{title}</div>
      {rows.map((row) =>
        'emptyText' in row ? (
          <div key={row.label} className="rounded border border-dashed border-blue-900/20 px-3 py-2 text-xs text-gray-400">
            {row.emptyText}
          </div>
        ) : (
          <div key={row.label} className="rounded border border-blue-900/20 px-3 py-2">
            <div className="mb-2 text-xs text-gray-400">{row.label}</div>
            <div className="flex flex-wrap gap-2">
              {(['ping', 'onboard', 'sign', 'ecdh'] as const).map((method) => (
                <MethodToken
                  key={method}
                  method={method}
                  value={row.policy[method]}
                  editable={Boolean(row.editable)}
                  onClick={
                    row.editable && onChange
                      ? () =>
                          onChange(
                            row.label.startsWith('request') ? 'request' : 'respond',
                            method,
                            nextOverrideValue(row.policy[method] as OperatorPolicyOverrideValue)
                          )
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

function nextOverrideValue(value: OperatorPolicyOverrideValue): OperatorPolicyOverrideValue {
  if (value === 'unset') return 'allow';
  if (value === 'allow') return 'deny';
  return 'unset';
}

function MethodToken({
  method,
  value,
  editable,
  onClick
}: {
  method: string;
  value: boolean | OperatorPolicyOverrideValue;
  editable?: boolean;
  onClick?: () => void;
}) {
  const tone =
    value === 'allow' || value === true
      ? 'border-green-500/40 bg-green-500/10 text-green-300'
      : value === 'deny' || value === false
        ? 'border-red-500/40 bg-red-500/10 text-red-300'
        : 'border-slate-500/40 bg-slate-500/10 text-slate-300';
  const label =
    value === true ? 'allow' : value === false ? 'deny' : value;
  return editable ? (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border px-2.5 py-1 text-xs font-medium ${tone}`}
    >
      {method}: {label}
    </button>
  ) : (
    <span className={`rounded border px-2.5 py-1 text-xs font-medium ${tone}`}>
      {method}: {label}
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
