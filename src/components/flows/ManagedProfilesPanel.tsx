import * as React from 'react';

import { Button } from '../ui/button';

export type ManagedProfileSummary = {
  id: string;
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
  selectedProfile: ManagedProfileSummary | null;
  vaultPassphrase: string;
  onSelectProfile: (profileId: string) => void;
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
  selectedProfile,
  vaultPassphrase,
  onSelectProfile,
  onChangeVaultPassphrase,
  onDelete,
  onExport,
  onRefresh,
}: Props) {
  return (
    <section className="panel-grid">
      <section className="panel">
        <div className="panel-head">
          <h3>Managed Profiles</h3>
          <div className="button-row">
            <Button type="button" variant="secondary" onClick={onRefresh}>
              Refresh
            </Button>
          </div>
        </div>
        <div className="share-list">
          {profiles.length === 0 ? <div className="empty">No managed profiles imported yet.</div> : null}
          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              className={selectedProfileId === profile.id ? 'share-card is-selected' : 'share-card'}
              onClick={() => onSelectProfile(profile.id)}
            >
              <strong>{profile.label}</strong>
              <span>{profile.id}</span>
              <small>relay profile {profile.relay_profile}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Profile Details</h3>
          {selectedProfile ? (
            <div className="button-row">
              <Button type="button" variant="secondary" onClick={() => onExport(selectedProfile.id)}>
                Export Profile
              </Button>
              <Button type="button" variant="destructive" onClick={() => onDelete(selectedProfile.id)}>
                Delete
              </Button>
            </div>
          ) : null}
        </div>
        {selectedProfile ? (
          <>
            <dl className="detail-list">
              <dt>Label</dt>
              <dd>{selectedProfile.label}</dd>
              <dt>Profile id</dt>
              <dd>{selectedProfile.id}</dd>
              <dt>Relay profile</dt>
              <dd>{selectedProfile.relay_profile}</dd>
              <dt>Group ref</dt>
              <dd>{selectedProfile.group_ref}</dd>
              <dt>Share ref</dt>
              <dd>{selectedProfile.share_ref}</dd>
              <dt>State path</dt>
              <dd>{selectedProfile.state_path}</dd>
              <dt>Created</dt>
              <dd>{unixTime(selectedProfile.created_at)}</dd>
            </dl>
            <label>
              Vault passphrase
              <input
                type="password"
                value={vaultPassphrase}
                onChange={(event) => onChangeVaultPassphrase(event.target.value)}
              />
            </label>
          </>
        ) : (
          <div className="empty">Select a managed profile to inspect it.</div>
        )}
      </section>
    </section>
  );
}
