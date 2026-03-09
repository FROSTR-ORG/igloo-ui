import * as React from 'react';

import { Button } from '../ui/button';

type ManagedProfileSummary = {
  id: string;
  label: string;
  relay_profile: string;
};

type RuntimeSnapshot = {
  active?: boolean;
  profile?: { label: string } | null;
  daemon_log_path?: string | null;
  daemon_metadata?: {
    pid?: number | null;
    socket_path?: string | null;
  } | null;
  runtime_status?: unknown;
  readiness?: unknown;
  policies?: unknown;
  daemon_log_lines?: string[] | null;
};

type Props = {
  selectedProfile: ManagedProfileSummary | null;
  vaultPassphrase: string;
  runtimeSnapshot: RuntimeSnapshot | null;
  onChangeVaultPassphrase: (value: string) => void;
  onStartSigner: () => void;
  onStopSigner: () => void;
  onRefreshSigner: () => void;
};

function renderJson(value: unknown) {
  if (value == null) return 'n/a';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function SignerSessionPanel({
  selectedProfile,
  vaultPassphrase,
  runtimeSnapshot,
  onChangeVaultPassphrase,
  onStartSigner,
  onStopSigner,
  onRefreshSigner,
}: Props) {
  return (
    <section className="panel-grid">
      <section className="panel">
        <div className="panel-head">
          <h3>Session Control</h3>
        </div>
        {selectedProfile ? (
          <div className="stack">
            <dl className="detail-list">
              <dt>Profile</dt>
              <dd>{selectedProfile.label}</dd>
              <dt>Profile id</dt>
              <dd>{selectedProfile.id}</dd>
              <dt>Relay profile</dt>
              <dd>{selectedProfile.relay_profile}</dd>
            </dl>
            <label>
              Vault passphrase
              <input
                type="password"
                value={vaultPassphrase}
                onChange={(event) => onChangeVaultPassphrase(event.target.value)}
              />
            </label>
            <div className="button-row">
              <Button type="button" onClick={onStartSigner}>Start signer</Button>
              <Button type="button" variant="destructive" onClick={onStopSigner}>Stop signer</Button>
              <Button type="button" variant="secondary" onClick={onRefreshSigner}>Refresh status</Button>
            </div>
          </div>
        ) : (
          <div className="empty">Select a managed profile from the Profiles tab first.</div>
        )}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Runtime Snapshot</h3>
        </div>
        {runtimeSnapshot?.profile ? (
          <dl className="detail-list">
            <dt>Active</dt>
            <dd>{String(runtimeSnapshot.active)}</dd>
            <dt>Profile</dt>
            <dd>{runtimeSnapshot.profile.label}</dd>
            <dt>Daemon log</dt>
            <dd>{runtimeSnapshot.daemon_log_path ?? 'n/a'}</dd>
            <dt>Daemon pid</dt>
            <dd>{runtimeSnapshot.daemon_metadata?.pid ?? 'n/a'}</dd>
            <dt>Socket</dt>
            <dd>{runtimeSnapshot.daemon_metadata?.socket_path ?? 'n/a'}</dd>
          </dl>
        ) : (
          <div className="empty">No profile runtime snapshot loaded.</div>
        )}
      </section>

      <section className="panel panel-span">
        <div className="panel-head">
          <h3>Runtime Diagnostics</h3>
        </div>
        <div className="two-column">
          <div className="stack">
            <h4>Status</h4>
            <pre className="code-block">{renderJson(runtimeSnapshot?.runtime_status)}</pre>
            <h4>Readiness</h4>
            <pre className="code-block">{renderJson(runtimeSnapshot?.readiness)}</pre>
            <h4>Policies</h4>
            <pre className="code-block">{renderJson(runtimeSnapshot?.policies)}</pre>
          </div>
          <div className="stack">
            <h4>Session Log</h4>
            {runtimeSnapshot?.daemon_log_lines?.length ? (
              <div className="log-list">
                {runtimeSnapshot.daemon_log_lines.map((line, index) => (
                  <div key={`${index}-${line}`} className="log-entry">
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">No runtime diagnostics yet.</div>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}
