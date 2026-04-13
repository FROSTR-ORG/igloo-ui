import * as React from 'react';

import type { CriticalE2ETestId } from '../../lib/e2e-test-ids';
import { Button } from '../ui/button';
import { ContentCard } from '../ui/content-card';
import { Input } from '../ui/input';

export type OperatorPeerSelectionStrategy = 'deterministic_sorted' | 'random';

export type OperatorSignerSettings = {
  sign_timeout_secs: number;
  ping_timeout_secs: number;
  request_ttl_secs: number;
  state_save_interval_secs: number;
  peer_selection_strategy: OperatorPeerSelectionStrategy;
};

export type OperatorMaintenanceAction = {
  label: string;
  onClick: () => void;
  variant?: 'secondary' | 'destructive' | 'outline';
  disabled?: boolean;
  testId?: CriticalE2ETestId;
};

type Props = {
  hasProfile: boolean;
  signerName: string;
  onSignerNameChange: (value: string) => void;
  relays: string[];
  newRelayUrl: string;
  onNewRelayUrlChange: (value: string) => void;
  onAddRelay: () => void;
  onRemoveRelay: (relay: string) => void;
  signerSettings: OperatorSignerSettings;
  onSignerSettingNumberChange: (
    field: keyof Omit<OperatorSignerSettings, 'peer_selection_strategy'>,
    value: string,
  ) => void;
  onPeerSelectionStrategyChange: (value: OperatorPeerSelectionStrategy) => void;
  onSave: () => void;
  saving?: boolean;
  saveDisabled?: boolean;
  message?: string | null;
  maintenanceDescription?: string;
  maintenanceActions?: OperatorMaintenanceAction[];
  extraSections?: React.ReactNode;
};

export function OperatorSettingsPanel({
  hasProfile,
  signerName,
  onSignerNameChange,
  relays,
  newRelayUrl,
  onNewRelayUrlChange,
  onAddRelay,
  onRemoveRelay,
  signerSettings,
  onSignerSettingNumberChange,
  onPeerSelectionStrategyChange,
  onSave,
  saving = false,
  saveDisabled = false,
  message = null,
  maintenanceDescription = 'Profile export, share rotation, and session controls.',
  maintenanceActions = [],
  extraSections,
}: Props) {
  return (
    <div className="space-y-6">
      <ContentCard title="Settings" description="Signer identity, relay topology, and runtime configuration.">
        {!hasProfile ? (
          <div className="rounded border border-dashed border-blue-900/30 px-4 py-6 text-sm text-gray-400">
            No profile is configured yet.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <label className="block rounded-lg border border-blue-900/20 bg-gray-950/30 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500">Signer Name</div>
                <div className="mt-1 text-sm text-slate-400">The operator-facing label shown across the dashboard.</div>
                <Input
                  className="mt-3"
                  value={signerName}
                  onChange={(event) => onSignerNameChange(event.target.value)}
                  placeholder="Unnamed signer"
                />
              </label>

              <div className="rounded-lg border border-blue-900/20 bg-gray-950/30 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500">Relay URLs</div>
                <div className="mt-1 text-sm text-slate-400">Endpoints used to publish events and fetch remote signer state.</div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={newRelayUrl}
                    onChange={(event) => onNewRelayUrlChange(event.target.value)}
                    placeholder="wss://relay.example.com"
                  />
                  <Button variant="secondary" onClick={onAddRelay}>
                    Add Relay
                  </Button>
                </div>
                <div className="mt-3 space-y-2">
                  {relays.map((relay) => (
                    <div
                      key={relay}
                      className="flex items-center justify-between rounded border border-blue-900/20 bg-slate-950/70 px-3 py-2"
                    >
                      <div className="font-mono text-xs text-blue-100">{relay}</div>
                      <Button variant="ghost" size="sm" onClick={() => onRemoveRelay(relay)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">Signer Settings</div>
              <div className="text-sm text-slate-400">Request timing, state persistence, and peer selection behavior.</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  label="Sign Timeout (secs)"
                  value={signerSettings.sign_timeout_secs}
                  onChange={(value) => onSignerSettingNumberChange('sign_timeout_secs', value)}
                />
                <NumberField
                  label="Ping Timeout (secs)"
                  value={signerSettings.ping_timeout_secs}
                  onChange={(value) => onSignerSettingNumberChange('ping_timeout_secs', value)}
                />
                <NumberField
                  label="Request TTL (secs)"
                  value={signerSettings.request_ttl_secs}
                  onChange={(value) => onSignerSettingNumberChange('request_ttl_secs', value)}
                />
                <NumberField
                  label="State Save Interval (secs)"
                  value={signerSettings.state_save_interval_secs}
                  onChange={(value) => onSignerSettingNumberChange('state_save_interval_secs', value)}
                />
                <SelectionField
                  label="Peer Selection Strategy"
                  value={signerSettings.peer_selection_strategy}
                  onChange={onPeerSelectionStrategyChange}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={onSave} disabled={saving || saveDisabled}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        )}
      </ContentCard>

      {extraSections}

      <ContentCard title="Maintenance" description={maintenanceDescription}>
        <div className="flex flex-wrap gap-2">
          {maintenanceActions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant ?? 'secondary'}
              size="sm"
              data-testid={action.testId}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}
        </div>

        {message ? (
          <div className="mt-4 rounded border border-blue-900/20 bg-blue-950/20 px-3 py-2 text-sm text-blue-100">
            {message}
          </div>
        ) : null}
      </ContentCard>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-lg border border-blue-900/20 bg-gray-950/30 p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <Input className="mt-2" type="number" min={1} value={String(value)} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectionField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: OperatorPeerSelectionStrategy;
  onChange: (value: OperatorPeerSelectionStrategy) => void;
}) {
  return (
    <label className="rounded-lg border border-blue-900/20 bg-gray-950/30 p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <select
        className="mt-2 w-full rounded border border-gray-700/50 bg-gray-900 px-3 py-2 text-sm text-blue-100"
        value={value}
        onChange={(event) => onChange(event.target.value as OperatorPeerSelectionStrategy)}
      >
        <option value="deterministic_sorted">Deterministic Sorted</option>
        <option value="random">Random</option>
      </select>
    </label>
  );
}
