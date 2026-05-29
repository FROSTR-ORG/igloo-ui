import * as React from 'react';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Collapsible } from '../ui/collapsible';
import { HelpHint } from '../ui/help-hint';
import { SensitiveTextarea } from '../ui/sensitive-textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
  defaultTab?: 'create' | 'import' | 'onboard';
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
  onChangeImportForm: (field: keyof Props['importForm'], value: string) => void;
  onChangeOnboardingForm: (field: keyof Props['onboardingForm'], value: string) => void;
  onImportOnboardingProfile: () => void;
  onImportRawProfile: () => void;
  onChangeSaveForm: (memberIdx: number, field: keyof GeneratedShareDraft, value: string) => void;
  onSaveGeneratedProfile: (share: GeneratedShareCard) => void;
};

export function CreateImportPanel({
  defaultTab = 'create',
  createForm,
  importForm,
  onboardingForm,
  generatedKeyset,
  saveForms,
  onChangeCreateForm,
  onGenerateFresh,
  onChangeImportForm,
  onChangeOnboardingForm,
  onImportOnboardingProfile,
  onImportRawProfile,
  onChangeSaveForm,
  onSaveGeneratedProfile,
}: Props) {
  return (
    <section className="igloo-flow-root igloo-stack">
      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="onboard">Onboard</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <div className="igloo-inline-title">
                <CardTitle>Create Keyset</CardTitle>
                <HelpHint
                  ariaLabel="About creating a keyset"
                  content="Generate a fresh secret and split it into managed member profiles."
                />
              </div>
              <CardDescription>
                Generate a fresh managed FROSTR V2 keyset and save member profiles locally.
              </CardDescription>
            </CardHeader>
            <CardContent className="igloo-stack">
              <section className="igloo-task-banner">
                <span className="igloo-task-kicker">Create Flow</span>
                <p>
                  Generate a fresh keyset, then review the group package once before saving a member profile into this
                  workspace.
                </p>
                <div className="igloo-task-points">
                  <span>Choose threshold and member count.</span>
                  <span>Save one or more member profiles after review.</span>
                </div>
              </section>
              <div className="igloo-two-up">
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
              <div className="igloo-button-row igloo-button-row-tight">
                <Button type="button" size="sm" onClick={onGenerateFresh}>Generate fresh keyset</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <div className="igloo-inline-title">
                <CardTitle>Load Profile</CardTitle>
                <HelpHint
                  ariaLabel="About loading a profile"
                  content="Use this when you already have exported group and share package JSON from another FROSTR environment."
                />
              </div>
              <CardDescription>
                Bring an existing group package and share package into this managed workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="igloo-stack">
              <section className="igloo-task-banner">
                <span className="igloo-task-kicker">Load Existing Material</span>
                <p>
                  Import a previously exported group package and share package, assign a label, and attach the relay
                  set you want this profile to use.
                </p>
                <div className="igloo-task-points">
                  <span>Give the imported profile a readable label.</span>
                  <span>Paste group and share JSON from a trusted export.</span>
                  <span>Relay URLs can be updated later if needed.</span>
                </div>
              </section>
              <div className="igloo-two-up">
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
                  className="min-h-[72px]"
                  placeholder="One relay URL per line"
                  value={importForm.relayUrls}
                  onChange={(event) => onChangeImportForm('relayUrls', event.target.value)}
                />
              </label>
              <Collapsible title="Advanced Group / Share JSON Import" contentClassName="igloo-stack">
                <label>
                  Group package JSON
                  <Textarea className="min-h-[132px]" value={importForm.groupPackageJson} onChange={(event) => onChangeImportForm('groupPackageJson', event.target.value)} />
                </label>
                <label>
                  Share package JSON
                  <Textarea className="min-h-[132px]" value={importForm.sharePackageJson} onChange={(event) => onChangeImportForm('sharePackageJson', event.target.value)} />
                </label>
              </Collapsible>
              <Button type="button" size="sm" onClick={onImportRawProfile}>Import managed profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboard">
          <Card>
            <CardHeader>
              <div className="igloo-inline-title">
                <CardTitle>Onboard Device</CardTitle>
                <HelpHint
                  ariaLabel="About device onboarding"
                  content="Paste the compact onboarding package and password to complete invite onboarding into a managed profile."
                />
              </div>
              <CardDescription>
                Complete invite onboarding and materialize a fully managed profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="igloo-stack">
              <section className="igloo-task-banner">
                <span className="igloo-task-kicker">Accepted Package</span>
                <p>
                  Paste the accepted onboarding package, enter the package password, and save the resulting managed
                  profile into this workspace.
                </p>
                <div className="igloo-task-points">
                  <span>Use the exact package text you received.</span>
                  <span>The package password is required to finish onboarding.</span>
                  <span>Choose a profile label before import.</span>
                </div>
              </section>
              <div className="igloo-two-up">
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
                  className="min-h-[116px]"
                  placeholder="Paste bfonboard1... package text"
                  value={onboardingForm.packageText}
                  onChange={(event) => onChangeOnboardingForm('packageText', event.target.value)}
                />
              </label>
              <Button type="button" size="sm" onClick={onImportOnboardingProfile}>Import onboarding package</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {generatedKeyset ? (
        <Card>
          <CardHeader>
            <div className="igloo-inline-title">
              <CardTitle>Generated Keyset Review</CardTitle>
              <HelpHint
                ariaLabel="About the generated keyset review"
                content="Review the shared group package once, then save each member card as a separate managed desktop profile."
              />
            </div>
            <CardDescription>
              Review the group package once, then save each member as its own managed profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="igloo-stack">
            <section className="igloo-task-banner">
              <span className="igloo-task-kicker">Review Then Save</span>
              <p>
                Confirm the generated group package once, then save any member card below as its own managed profile.
              </p>
              <div className="igloo-task-points">
                <span>Each member card becomes a separate managed profile.</span>
                <span>Use a distinct label for each saved member.</span>
                <span>Add relay URLs before saving the profile.</span>
              </div>
            </section>
            <dl className="igloo-detail-list">
              <dt>Source</dt>
              <dd>{generatedKeyset.source}</dd>
              <dt>Group public key</dt>
              <dd>{generatedKeyset.group_public_key}</dd>
              <dt>Recovered nsec preview</dt>
              <dd>{generatedKeyset.nsec}</dd>
            </dl>
            <Collapsible title="Advanced Package JSON" contentClassName="igloo-stack">
              <SensitiveTextarea label="Group package JSON" value={generatedKeyset.group_package_json} />
            </Collapsible>
            <div className="igloo-generated-grid">
              {generatedKeyset.shares.map((share) => {
                const form = saveForms[share.member_idx] ?? {
                  label: share.name,
                  vaultPassphrase: '',
                  relayUrls: '',
                };
                return (
                  <article key={share.member_idx} className="igloo-generated-card">
                    <header>
                      <strong>Member {share.member_idx}</strong>
                      <span>{share.name}. Import this share as a managed profile.</span>
                    </header>
                    <Collapsible title="Share package JSON" contentClassName="igloo-stack">
                      <SensitiveTextarea value={share.share_package_json} />
                    </Collapsible>
                    <div className="igloo-two-up">
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
                    </div>
                    <label>
                      Relay URLs
                      <Textarea
                        className="min-h-[72px]"
                        placeholder="One relay URL per line"
                        value={form.relayUrls}
                        onChange={(event) => onChangeSaveForm(share.member_idx, 'relayUrls', event.target.value)}
                      />
                    </label>
                    <Button type="button" size="sm" onClick={() => onSaveGeneratedProfile(share)}>
                      Save Member {share.member_idx}
                    </Button>
                  </article>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
