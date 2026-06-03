import * as React from 'react';

import { Button } from '../ui/button';
import { passwordManagerOptOutProps } from '../../lib/password-manager';

export type ManagedProfileSummary = {
  id: string;
  display_id?: string;
  label: string;
  relay_profile: string;
  group_ref: string;
  share_ref: string;
  state_path: string;
  created_at?: number | null;
};

type Props = {
  profiles: ManagedProfileSummary[];
  selectedProfileId: string;
  activeProfileId?: string | null;
  selectedProfile: ManagedProfileSummary | null;
  vaultPassphrase: string;
  secretLabel?: string;
  secretPlaceholder?: string;
  onSelectProfile: (profileId: string) => void;
  onOpenSigner?: (profileId: string) => void;
  onActivateProfile?: (profileId: string) => void;
  onStopActiveProfile?: () => void;
  onChangeVaultPassphrase: (value: string) => void;
  onDelete: (profileId: string) => void;
  onExport: (profileId: string) => void;
  onRefresh: () => void;
};

function unixTime(value: number | undefined | null) {
  if (!value) return 'n/a';
  return new Date(value * 1000).toLocaleString();
}

export function ManagedProfilesPanel({
  profiles,
  selectedProfileId,
  activeProfileId = null,
  selectedProfile,
  vaultPassphrase,
  secretLabel = 'Vault passphrase',
  secretPlaceholder = 'Required for signer start and profile export',
  onSelectProfile,
  onOpenSigner,
  onActivateProfile,
  onStopActiveProfile,
  onChangeVaultPassphrase,
  onDelete,
  onExport,
  onRefresh,
}: Props) {
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) ?? null;
  const displayId = (profile: ManagedProfileSummary | null) =>
    profile ? profile.display_id ?? profile.id : '';
  return (
    <section className="igloo-flow-root igloo-stack">
      <div className="igloo-panel-head">
        <div>
          <h3>Profiles</h3>
          <p className="text-xs text-blue-400">Select a profile, then open it in the signer workspace.</p>
        </div>
        <div className="igloo-button-row">
          <Button type="button" size="sm" variant="secondary" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      {activeProfile ? (
        <div className="igloo-flow-summary">
          <div>
            <span className="igloo-flow-summary-kicker">Active profile</span>
            <strong>{activeProfile.label}</strong>
            <small>{displayId(activeProfile)}</small>
          </div>
          <div className="igloo-button-row igloo-button-row-tight">
            {onOpenSigner ? (
              <Button type="button" size="sm" onClick={() => onOpenSigner(activeProfile.id)}>
                Open Dashboard
              </Button>
            ) : null}
            {onStopActiveProfile ? (
              <Button type="button" size="sm" variant="destructive" onClick={() => onStopActiveProfile()}>
                Stop Signer
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {profiles.length === 0 ? <div className="igloo-empty">No managed profiles imported yet.</div> : null}

      <div className="igloo-flow-list">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className={selectedProfileId === profile.id ? 'igloo-flow-card is-selected' : 'igloo-flow-card'}
          >
            <button type="button" className="igloo-flow-card-select" onClick={() => onSelectProfile(profile.id)}>
              <div className="igloo-flow-card-title">
                <strong>{profile.label}</strong>
                <div className="igloo-flow-card-badges">
                  {profile.id === activeProfileId ? <span className="igloo-flow-badge is-active">Active</span> : null}
                  {profile.id === selectedProfileId ? <span className="igloo-flow-badge">Selected</span> : null}
                </div>
              </div>
              <span>{displayId(profile)}</span>
              <small>{profile.relay_profile}</small>
              <small>{unixTime(profile.created_at)}</small>
            </button>
            <div className="igloo-button-row">
              {onOpenSigner ? (
                <Button type="button" size="sm" onClick={() => onOpenSigner(profile.id)}>
                  Open
                </Button>
              ) : null}
              {onActivateProfile && profile.id !== activeProfileId ? (
                <Button type="button" size="sm" variant="secondary" onClick={() => onActivateProfile(profile.id)}>
                  Activate
                </Button>
              ) : null}
              <Button type="button" size="sm" variant="secondary" onClick={() => onExport(profile.id)}>
                Export
              </Button>
              <Button type="button" size="sm" variant="destructive" onClick={() => onDelete(profile.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedProfile ? (
        <div className="igloo-stack">
          <label>
            {secretLabel}
            <input
              type="password"
              {...passwordManagerOptOutProps}
              value={vaultPassphrase}
              onChange={(event) => onChangeVaultPassphrase(event.target.value)}
              placeholder={secretPlaceholder}
            />
          </label>
          <dl className="igloo-detail-list">
            <dt>Selected profile</dt>
            <dd>{selectedProfile.label}</dd>
            <dt>Profile id</dt>
            <dd>{selectedProfile.id}</dd>
            <dt>Group ref</dt>
            <dd>{selectedProfile.group_ref}</dd>
            <dt>Share ref</dt>
            <dd>{selectedProfile.share_ref}</dd>
          </dl>
        </div>
      ) : null}
    </section>
  );
}
