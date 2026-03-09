import * as React from 'react';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Collapsible } from '../ui/collapsible';
import { Textarea } from '../ui/textarea';

export type GeneratedShareDraft = {
  label: string;
  vaultPassphrase: string;
  relayUrls: string;
};

export type GeneratedShareCard = {
  member_idx: number;
  name: string;
  share_package_json: string;
};

export type GeneratedKeysetView = {
  source: string;
  group_public_key: string;
  nsec: string;
  group_package_json: string;
  shares: GeneratedShareCard[];
};

type Props = {
  createForm: {
    threshold: string;
    count: string;
    nsec: string;
  };
  importForm: {
    label: string;
    vaultPassphrase: string;
    relayUrls: string;
    groupPackageJson: string;
    sharePackageJson: string;
  };
  onboardingForm: {
    packageText: string;
    password: string;
    vaultPassphrase: string;
    label: string;
  };
  generatedKeyset: GeneratedKeysetView | null;
  saveForms: Record<number, GeneratedShareDraft>;
  onChangeCreateForm: (field: 'threshold' | 'count' | 'nsec', value: string) => void;
  onGenerateFresh: () => void;
  onGenerateImported: () => void;
  onChangeImportForm: (field: keyof Props['importForm'], value: string) => void;
  onChangeOnboardingForm: (field: keyof Props['onboardingForm'], value: string) => void;
  onImportOnboardingProfile: () => void;
  onImportRawProfile: () => void;
  onChangeSaveForm: (memberIdx: number, field: keyof GeneratedShareDraft, value: string) => void;
  onSaveGeneratedProfile: (share: GeneratedShareCard) => void;
};

export function CreateImportPanel({
  createForm,
  importForm,
  onboardingForm,
  generatedKeyset,
  saveForms,
  onChangeCreateForm,
  onGenerateFresh,
  onGenerateImported,
  onChangeImportForm,
  onChangeOnboardingForm,
  onImportOnboardingProfile,
  onImportRawProfile,
  onChangeSaveForm,
  onSaveGeneratedProfile,
}: Props) {
  return (
    <section className="panel-grid">
      <section className="panel">
        <div className="panel-head">
          <h3>Create or Split a Keyset</h3>
        </div>
        <div className="stack">
          <div className="two-up">
            <label>
              Threshold
              <input
                type="number"
                min={2}
                value={createForm.threshold}
                onChange={(event) => onChangeCreateForm('threshold', event.target.value)}
              />
            </label>
            <label>
              Member count
              <input
                type="number"
                min={2}
                value={createForm.count}
                onChange={(event) => onChangeCreateForm('count', event.target.value)}
              />
            </label>
          </div>
          <div className="button-row">
            <Button type="button" onClick={onGenerateFresh}>Generate fresh keyset</Button>
            <Button type="button" variant="secondary" onClick={onGenerateImported}>Split imported nsec</Button>
          </div>
          <label>
            Imported nsec
            <Textarea
              placeholder="Paste an nsec here when you want deterministic share generation."
              value={createForm.nsec}
              onChange={(event) => onChangeCreateForm('nsec', event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Import Existing Group + Share</h3>
        </div>
        <div className="stack">
          <div className="two-up">
            <label>
              Profile label
              <input value={importForm.label} onChange={(event) => onChangeImportForm('label', event.target.value)} />
            </label>
            <label>
              Vault passphrase
              <input
                type="password"
                value={importForm.vaultPassphrase}
                onChange={(event) => onChangeImportForm('vaultPassphrase', event.target.value)}
              />
            </label>
          </div>
          <label>
            Relay URLs
            <Textarea
              placeholder="One relay URL per line"
              value={importForm.relayUrls}
              onChange={(event) => onChangeImportForm('relayUrls', event.target.value)}
            />
          </label>
          <Collapsible title="Advanced Group / Share JSON Import" defaultOpen contentClassName="stack">
            <label>
              Group package JSON
              <Textarea value={importForm.groupPackageJson} onChange={(event) => onChangeImportForm('groupPackageJson', event.target.value)} />
            </label>
            <label>
              Share package JSON
              <Textarea value={importForm.sharePackageJson} onChange={(event) => onChangeImportForm('sharePackageJson', event.target.value)} />
            </label>
          </Collapsible>
          <Button type="button" onClick={onImportRawProfile}>Import managed profile</Button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Import Onboarding Package</h3>
        </div>
        <div className="stack">
          <div className="two-up">
            <label>
              Profile label
              <input value={onboardingForm.label} onChange={(event) => onChangeOnboardingForm('label', event.target.value)} />
            </label>
            <label>
              Vault passphrase
              <input
                type="password"
                value={onboardingForm.vaultPassphrase}
                onChange={(event) => onChangeOnboardingForm('vaultPassphrase', event.target.value)}
              />
            </label>
          </div>
          <label>
            Package password
            <input type="password" value={onboardingForm.password} onChange={(event) => onChangeOnboardingForm('password', event.target.value)} />
          </label>
          <label>
            Onboarding package
            <Textarea
              placeholder="Paste bfonboard1... package text"
              value={onboardingForm.packageText}
              onChange={(event) => onChangeOnboardingForm('packageText', event.target.value)}
            />
          </label>
          <Button type="button" onClick={onImportOnboardingProfile}>Import onboarding package</Button>
        </div>
      </section>

      {generatedKeyset ? (
        <section className="panel panel-span">
          <div className="panel-head">
            <h3>Generated Keyset Review</h3>
            <Badge tone="info">{generatedKeyset.source}</Badge>
          </div>
          <div className="banner-grid">
            <div>
              <small>Group public key</small>
              <strong>{generatedKeyset.group_public_key}</strong>
            </div>
            <div>
              <small>Recovered nsec preview</small>
              <strong>{generatedKeyset.nsec}</strong>
            </div>
          </div>
          <Collapsible title="Advanced Package JSON" defaultOpen contentClassName="stack">
            <label>
              Group package JSON
              <Textarea readOnly value={generatedKeyset.group_package_json} />
            </label>
          </Collapsible>
          <div className="generated-grid">
            {generatedKeyset.shares.map((share) => {
              const form = saveForms[share.member_idx] ?? {
                label: share.name,
                vaultPassphrase: '',
                relayUrls: '',
              };
              return (
                <article key={share.member_idx} className="generated-card">
                  <header>
                    <strong>Member {share.member_idx}</strong>
                    <span>Import this share as a managed profile</span>
                  </header>
                  <Collapsible title="Share package JSON" defaultOpen contentClassName="stack">
                    <Textarea readOnly value={share.share_package_json} />
                  </Collapsible>
                  <label>
                    Profile label
                    <input
                      value={form.label}
                      onChange={(event) => onChangeSaveForm(share.member_idx, 'label', event.target.value)}
                    />
                  </label>
                  <label>
                    Vault passphrase
                    <input
                      type="password"
                      value={form.vaultPassphrase}
                      onChange={(event) => onChangeSaveForm(share.member_idx, 'vaultPassphrase', event.target.value)}
                    />
                  </label>
                  <label>
                    Relay URLs
                    <Textarea
                      placeholder="One relay URL per line"
                      value={form.relayUrls}
                      onChange={(event) => onChangeSaveForm(share.member_idx, 'relayUrls', event.target.value)}
                    />
                  </label>
                  <Button type="button" onClick={() => onSaveGeneratedProfile(share)}>
                    Save Member {share.member_idx}
                  </Button>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </section>
  );
}
