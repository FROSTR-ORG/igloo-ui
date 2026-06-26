import * as React from 'react';
import { Check, Copy, Download, Lock, PackagePlus, Pencil, QrCode, RotateCcw, ShieldAlert, Trash2, X } from 'lucide-react';

import type { CriticalE2ETestId } from '../../lib/e2e-test-ids';
import { CRITICAL_E2E_TEST_IDS as TID } from '../../lib/e2e-test-ids';
import { cn } from '../../lib/utils';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { Button } from '../ui/button';
import { ConfirmDialog, Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { PasswordField } from '../ui/password-field';
import { Textarea } from '../ui/textarea';
import type { OperatorPeerSelectionStrategy, OperatorSignerSettings } from './OperatorSettingsPanel';

export type OperatorSettingsSidebarAction = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  variant?: 'secondary' | 'destructive' | 'outline';
  disabled?: boolean;
  testId?: CriticalE2ETestId;
};

export type OperatorSettingsSidebarGroupProfile = {
  keysetName?: string;
  keyNpub?: string;
  thresholdLabel?: string;
  createdLabel?: string;
  updatedLabel?: string;
};

export type OnboardDeviceSponsorshipReadiness =
  | {
      available: true;
      mode: 'package-producer' | 'source-share-package-producer';
      requiredSource: 'package-producer' | 'nsec-or-threshold-source-shares';
      safeActions: readonly ['configure-device'];
    }
  | {
      available: false;
      reason: 'saved-profile-local-share-only';
      missing: 'remote-share-package-producer';
      securityBoundary: 'saved-browser-profiles-retain-local-share-only';
      requiredSource: 'nsec-or-threshold-source-shares';
      safeActions: readonly [
        'export-local-share-as-source',
        'use-create-or-rotate-before-setup-finishes',
        'replace-share-from-prepared-package',
      ];
    };

export type OnboardDeviceSponsorshipPanelProps = {
  readiness?: OnboardDeviceSponsorshipReadiness;
  onConfigureDevice?: () => void;
  onExportShare?: () => void;
  onReplaceShare?: () => void;
  onClose: () => void;
  configureDeviceDisabled?: boolean;
  exportShareDisabled?: boolean;
  replaceShareDisabled?: boolean;
};

export type OnboardDeviceSponsorshipDialogProps = OnboardDeviceSponsorshipPanelProps & {
  open: boolean;
  title?: string;
  className?: string;
};

export type OnboardDeviceSponsorDraft = {
  label: string;
  sourcePackageText: string;
  sourcePackagePassword: string;
  packagePassword: string;
  confirmPackagePassword: string;
};

export type OnboardDeviceSponsorResult = {
  label: string;
  memberLabel?: string;
  packageText: string;
  sharePublicKeyLabel?: string;
  sharePublicKey?: string;
};

export type OnboardDeviceSponsorErrorField = keyof OnboardDeviceSponsorDraft;

export type OnboardDeviceSponsorDialogProps = {
  open: boolean;
  draft: OnboardDeviceSponsorDraft;
  result?: OnboardDeviceSponsorResult | null;
  error?: string | null;
  errorFields?: OnboardDeviceSponsorErrorField[];
  busy?: boolean;
  signerActive?: boolean;
  handoffStatus?: string | null;
  handoffStatusTone?: 'info' | 'success' | 'warning';
  handoffAction?: 'copy' | 'save' | 'qr' | null;
  cancelRequiresConfirmation?: boolean;
  onDraftChange: (field: keyof OnboardDeviceSponsorDraft, value: string) => void;
  onCreatePackage: (event: React.FormEvent<HTMLFormElement>) => void;
  onCopyPackage?: () => void;
  onSavePackage?: () => void;
  onShowQrPackage?: () => void;
  onCreateAnother?: () => void;
  onClose: () => void;
  title?: string;
  className?: string;
};

export type ClearCredentialsDialogProps = {
  open: boolean;
  profileSummary: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export type ProfilePasswordChangeDialogProps = {
  open: boolean;
  currentPassword: string;
  nextPassword: string;
  confirmPassword: string;
  error?: string | null;
  busy?: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNextPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  testIds?: {
    current?: CriticalE2ETestId;
    next?: CriticalE2ETestId;
    confirm?: CriticalE2ETestId;
    submit?: CriticalE2ETestId;
  };
};

export type SettingsUnsavedChangesDialogProps = {
  open: boolean;
  onDiscard: () => void;
  onKeepEditing: () => void;
};

export type OperatorSettingsSidebarProps = {
  open: boolean;
  onClose: () => void;
  hasProfile: boolean;
  signerName: string;
  onSignerNameChange: (value: string) => void;
  memberLabel?: string;
  relays: string[];
  newRelayUrl: string;
  onNewRelayUrlChange: (value: string) => void;
  onAddRelay: () => void;
  onRemoveRelay: (relay: string) => void;
  profilePasswordAction?: OperatorSettingsSidebarAction;
  groupProfile?: OperatorSettingsSidebarGroupProfile;
  signerSettings?: OperatorSignerSettings;
  onSignerSettingNumberChange?: (
    field: keyof Omit<OperatorSignerSettings, 'peer_selection_strategy'>,
    value: string,
  ) => void;
  onPeerSelectionStrategyChange?: (value: OperatorPeerSelectionStrategy) => void;
  onSave: () => void;
  saving?: boolean;
  saveDisabled?: boolean;
  showSaveControls?: boolean;
  showAdvancedSettings?: boolean;
  message?: string | null;
  permissions?: React.ReactNode;
  browserPreferences?: React.ReactNode;
  onboardAction?: OperatorSettingsSidebarAction;
  replaceShareAction?: OperatorSettingsSidebarAction;
  exportProfileAction?: OperatorSettingsSidebarAction;
  exportShareAction?: OperatorSettingsSidebarAction;
  logoutAction?: OperatorSettingsSidebarAction;
  lockProfileAction?: OperatorSettingsSidebarAction;
  clearCredentialsAction?: OperatorSettingsSidebarAction;
};

export function OperatorSettingsSidebar({
  open,
  onClose,
  hasProfile,
  signerName,
  onSignerNameChange,
  memberLabel,
  relays,
  newRelayUrl,
  onNewRelayUrlChange,
  onAddRelay,
  onRemoveRelay,
  profilePasswordAction,
  groupProfile,
  signerSettings,
  onSignerSettingNumberChange,
  onPeerSelectionStrategyChange,
  onSave,
  saving = false,
  saveDisabled = false,
  showSaveControls = true,
  showAdvancedSettings = true,
  message = null,
  permissions,
  browserPreferences,
  onboardAction,
  replaceShareAction,
  exportProfileAction,
  exportShareAction,
  logoutAction,
  lockProfileAction,
  clearCredentialsAction,
}: OperatorSettingsSidebarProps) {
  const panelRef = React.useRef<HTMLElement>(null);
  const titleId = React.useId();
  const profileNameId = React.useId();
  const newRelayId = React.useId();
  const onCloseRef = React.useRef(onClose);
  const hasAdvancedSettings = showAdvancedSettings && Boolean(signerSettings || permissions);
  const profileSecurityAction = lockProfileAction ?? logoutAction;

  useFocusTrap(panelRef, open);

  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  React.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const frame = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement && panel.contains(activeElement)) {
        return;
      }
      panel.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close settings"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[#020617]/78 backdrop-blur-[2px]"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        data-testid={TID.dashboardSettingsSidebar}
        className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col overflow-hidden border-l border-blue-900/20 bg-[#111827] px-4 pb-5 pt-4 shadow-[-32px_0_90px_rgba(2,6,23,0.48)] outline-none sm:px-7 sm:pb-8"
      >
        <div className="flex shrink-0 items-center justify-between">
          <h2 id={titleId} className="font-sharetech text-xl leading-6 text-blue-300">
            Settings
          </h2>
          <button
            type="button"
            aria-label="Close settings"
            data-testid={TID.dashboardSettingsSidebarClose}
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-blue-950/40 hover:text-blue-200 active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          data-testid={TID.dashboardSettingsSidebarBody}
          className="-mx-4 mt-6 min-h-0 flex-1 overflow-y-auto px-4 pb-2 sm:-mx-7 sm:mt-8 sm:px-7"
        >
          {!hasProfile ? (
            <div className="rounded-lg border border-dashed border-blue-900/40 px-4 py-6 text-sm text-slate-400">
              No profile is configured yet.
            </div>
          ) : (
            <div className="space-y-8">
              <SidebarSection title="Device Profile">
                <div className="overflow-hidden rounded-lg border border-blue-900/30 bg-slate-950/20">
                  <div className="grid gap-2 border-b border-blue-900/15 px-3.5 py-3 sm:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)] sm:items-center">
                    <label htmlFor={profileNameId} className="text-xs leading-4 text-slate-400">
                      Profile Name
                    </label>
                    <div className="relative min-w-0">
                      <Input
                        id={profileNameId}
                        value={signerName}
                        onChange={(event) => onSignerNameChange(event.target.value)}
                        placeholder="Unnamed signer"
                        aria-label="Profile Name"
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="none"
                        className="h-10 rounded-md border-blue-900/30 bg-slate-950/55 pl-3 pr-9 text-left text-sm text-slate-100 shadow-none hover:border-blue-500/40 focus-visible:border-blue-400/80 focus-visible:bg-slate-950/70 focus-visible:ring-2 focus-visible:ring-blue-500/25"
                      />
                      <Pencil className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                    </div>
                  </div>

                  {profilePasswordAction ? (
                    <div className="grid grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)_auto] items-center gap-2 border-b border-blue-900/15 px-3.5 py-2.5">
                      <span className="text-xs leading-4 text-slate-400">{profilePasswordAction.title}</span>
                      <span className="min-w-0 truncate text-right text-xs leading-4 text-slate-100">••••••••</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        data-testid={profilePasswordAction.testId}
                        onClick={profilePasswordAction.onAction}
                        disabled={profilePasswordAction.disabled}
                        className="h-7 border-blue-500/35 bg-blue-500/5 px-3 text-xs text-blue-300 hover:bg-blue-500/10 hover:text-blue-200 active:scale-[0.96]"
                      >
                        {profilePasswordAction.actionLabel}
                      </Button>
                    </div>
                  ) : null}

                  <div className="space-y-2 px-3 py-3">
                    {relays.map((relay) => (
                      <div key={relay} className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-2">
                        <div className="min-w-0 rounded-md border border-blue-900/30 bg-slate-950/60 px-3 py-2.5 font-sharetech text-[13px] leading-4 text-slate-300">
                          <span className="block truncate">{relay}</span>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${relay}`}
                          onClick={() => onRemoveRelay(relay)}
                          className="grid h-10 w-10 place-items-center rounded-md text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-300 active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                      <Input
                        id={newRelayId}
                        value={newRelayUrl}
                        onChange={(event) => onNewRelayUrlChange(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            onAddRelay();
                          }
                        }}
                        placeholder="wss://..."
                        aria-label="New relay URL"
                        inputMode="url"
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="none"
                        className="h-11 border-blue-900/30 bg-slate-950/60 font-sharetech text-[13px] text-slate-300 placeholder:text-slate-600 hover:border-blue-500/40 focus-visible:border-blue-400/80 focus-visible:bg-slate-950/75 focus-visible:ring-2 focus-visible:ring-blue-500/25"
                      />
                      <Button type="button" size="sm" onClick={onAddRelay} className="min-h-11 px-4 active:scale-[0.96]">
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-4 text-slate-500">
                  Configuration for this device's share{memberLabel ? ` (${memberLabel})` : ''}
                </p>
                {showSaveControls ? (
                  <div className="mt-4 flex items-center justify-between gap-3">
                    {message ? <p className="min-w-0 text-xs leading-4 text-blue-200/80">{message}</p> : <span />}
                    <Button
                      type="button"
                      size="sm"
                      onClick={onSave}
                      loading={saving}
                      loadingLabel="Saving..."
                      disabled={saving || saveDisabled}
                      className="shrink-0 active:scale-[0.96]"
                    >
                      Save Changes
                    </Button>
                  </div>
                ) : null}
              </SidebarSection>

              {groupProfile ? (
                <SidebarSection title="Group Profile">
                  <InfoRows
                    rows={[
                      ['Keyset Name', groupProfile.keysetName],
                      ['Keyset npub', groupProfile.keyNpub],
                      ['Threshold', groupProfile.thresholdLabel],
                      ['Created', groupProfile.createdLabel],
                      ['Updated', groupProfile.updatedLabel],
                    ]}
                  />
                  <p className="mt-3 text-[11px] leading-4 text-slate-500">
                    Shared across all peers. Synced via Nostr.
                  </p>
                </SidebarSection>
              ) : null}

              {onboardAction ? (
                <SidebarSection title="Onboard Device">
                  <ActionRow action={onboardAction} emphasis />
                </SidebarSection>
              ) : null}

              {replaceShareAction ? (
                <SidebarSection title="Replace Share">
                  <ActionRow action={replaceShareAction} />
                </SidebarSection>
              ) : null}

              {exportProfileAction || exportShareAction ? (
                <SidebarSection title="Export & Backup">
                  <div className="space-y-2.5">
                    {exportProfileAction ? <ActionRow action={exportProfileAction} /> : null}
                    {exportShareAction ? <ActionRow action={exportShareAction} /> : null}
                  </div>
                </SidebarSection>
              ) : null}

              {browserPreferences ? (
                <SidebarSection title="Browser Settings">
                  <div className="igloo-settings-sidebar-browser-preferences">{browserPreferences}</div>
                </SidebarSection>
              ) : null}

              {profileSecurityAction || clearCredentialsAction ? (
                <SidebarSection title="Profile Security">
                  <div className="space-y-2.5">
                    {profileSecurityAction ? <ActionRow action={profileSecurityAction} /> : null}
                    {clearCredentialsAction ? <ActionRow action={clearCredentialsAction} /> : null}
                  </div>
                </SidebarSection>
              ) : null}

              {hasAdvancedSettings ? (
                <details className="group rounded-lg border border-blue-900/20 bg-slate-950/15 px-3.5 py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-sharetech text-[13px] uppercase leading-4 tracking-[0.08em] text-blue-300/80 transition-colors hover:text-blue-200 [&::-webkit-details-marker]:hidden">
                    Advanced
                    <span className="text-base leading-none text-slate-600 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="mt-6 space-y-8">
                    {signerSettings ? (
                      <SidebarSection title="Runtime Settings">
                        <div className="grid gap-3">
                          <NumberField
                            label="Sign Timeout"
                            value={signerSettings.sign_timeout_secs}
                            onChange={(value) => onSignerSettingNumberChange?.('sign_timeout_secs', value)}
                          />
                          <NumberField
                            label="Ping Timeout"
                            value={signerSettings.ping_timeout_secs}
                            onChange={(value) => onSignerSettingNumberChange?.('ping_timeout_secs', value)}
                          />
                          <NumberField
                            label="Request TTL"
                            value={signerSettings.request_ttl_secs}
                            onChange={(value) => onSignerSettingNumberChange?.('request_ttl_secs', value)}
                          />
                          <NumberField
                            label="State Save Interval"
                            value={signerSettings.state_save_interval_secs}
                            onChange={(value) => onSignerSettingNumberChange?.('state_save_interval_secs', value)}
                          />
                          <SelectionField
                            label="Peer Selection"
                            value={signerSettings.peer_selection_strategy}
                            onChange={(value) => onPeerSelectionStrategyChange?.(value)}
                          />
                        </div>
                      </SidebarSection>
                    ) : null}

                    {permissions ? <SidebarSection title="Peer Permissions">{permissions}</SidebarSection> : null}
                  </div>
                </details>
              ) : null}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export function OnboardDeviceSponsorshipPanel({
  readiness,
  onConfigureDevice,
  onExportShare,
  onReplaceShare,
  onClose,
  configureDeviceDisabled = false,
  exportShareDisabled = false,
  replaceShareDisabled = false,
}: OnboardDeviceSponsorshipPanelProps) {
  if (readiness?.available) {
    const producerLabel =
      readiness.mode === 'source-share-package-producer'
        ? 'Source-share package producer'
        : 'Package producer';
    const sourceLabel =
      readiness.requiredSource === 'nsec-or-threshold-source-shares'
        ? 'NSEC or threshold source shares'
        : 'Package producer';
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-blue-900/30 bg-slate-950/30 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-blue-500/15 text-blue-300">
              <PackagePlus className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="font-sharetech text-base leading-5 text-blue-200">
                Ready to Onboard Device
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                An outside-runtime package producer is available for this keyset.
                Configure the new device, create an encrypted bfonboard package,
                then hand it off to the recipient.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-blue-900/25 bg-slate-950/20">
          <BoundaryRow label="Producer" value={producerLabel} />
          <BoundaryRow label="Source" value={sourceLabel} />
          <BoundaryRow label="Package" value="Encrypted bfonboard" />
          <BoundaryRow label="Next step" value="Configure device" />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            onClick={onConfigureDevice}
            disabled={!onConfigureDevice || configureDeviceDisabled}
          >
            Configure Device
          </Button>
        </div>
      </div>
    );
  }

  const savedProfileLocalShareOnly =
    !readiness || (!readiness.available && readiness.reason === 'saved-profile-local-share-only');
  const missingLabel =
    readiness?.missing === 'remote-share-package-producer'
      ? 'Remote share package producer'
      : 'Package producer';
  const requiredSourceLabel =
    readiness?.requiredSource === 'nsec-or-threshold-source-shares'
      ? 'NSEC or threshold source shares'
      : 'Package producer';
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-blue-900/30 bg-slate-950/30 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-blue-500/15 text-blue-300">
            <PackagePlus className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="font-sharetech text-base leading-5 text-blue-200">
              Package Producer Required
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {savedProfileLocalShareOnly
                ? "This saved browser profile stores only this device's encrypted local share. Settings cannot mint another member's bfonboard package without a producer that has the right source material."
                : "Onboarding packages need a package producer that can mint a valid remote bfonboard package without cloning this device's local share."}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-blue-900/25 bg-slate-950/20">
        <BoundaryRow label="Missing" value={missingLabel} />
        <BoundaryRow label="Required source" value={requiredSourceLabel} />
        <BoundaryRow
          label="Saved profile"
          value={
            readiness?.securityBoundary === 'saved-browser-profiles-retain-local-share-only'
              ? 'Local encrypted share only'
              : 'Source unavailable'
          }
        />
      </div>

      <div className="grid gap-3 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-4 py-4 text-sm leading-5 text-amber-50/80">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
          <div>
            <strong className="block text-xs uppercase tracking-[0.08em] text-amber-200/90">
              Secret Boundary
            </strong>
            <p className="mt-1">
              Do not create a new device by cloning this profile's local share. A
              valid sponsor flow must create a remote member package from an nsec,
              a threshold of source shares, or an outside-runtime package producer.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-blue-900/20 bg-slate-950/20 px-4 py-4 text-sm leading-5 text-slate-400">
        <div>
          <strong className="block text-xs uppercase tracking-[0.08em] text-blue-300/80">
            Safe Paths
          </strong>
          <p className="mt-1">
            Use Create Keyset or Rotate Keyset while source shares are present to
            package remote members. Export this share as one source for an
            outside-runtime package producer, or use Replace Share when this device
            has already received a prepared bfonboard package.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {onExportShare ? (
          <Button
            type="button"
            variant="outline"
            onClick={onExportShare}
            disabled={exportShareDisabled}
            className="border-blue-500/50 bg-blue-500/5 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200"
          >
            Export Share
          </Button>
        ) : null}
        {onReplaceShare ? (
          <Button
            type="button"
            variant="outline"
            onClick={onReplaceShare}
            disabled={replaceShareDisabled}
            className="border-blue-500/50 bg-blue-500/5 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200"
          >
            Replace Share
          </Button>
        ) : null}
        <Button type="button" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

function BoundaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] items-center gap-3 border-b border-blue-900/15 px-3.5 py-2.5 text-xs leading-4 last:border-b-0">
      <span className="text-slate-400">{label}</span>
      <span className="min-w-0 text-right text-slate-100">{value}</span>
    </div>
  );
}

function missingOnboardSponsorInputs(draft: OnboardDeviceSponsorDraft) {
  const missing: string[] = [];
  if (!draft.label.trim()) missing.push('device label');
  if (!draft.sourcePackageText.trim()) missing.push('source bfshare');
  if (!draft.sourcePackagePassword) missing.push('source password');
  if (!draft.packagePassword) missing.push('package password');
  if (!draft.confirmPackagePassword) missing.push('confirm package password');
  return missing;
}

export function OnboardDeviceSponsorshipDialog({
  open,
  title = 'Onboard a Device',
  className,
  ...panelProps
}: OnboardDeviceSponsorshipDialogProps) {
  return (
    <Dialog open={open} onClose={panelProps.onClose} title={title} className={cn('max-w-md', className)}>
      <OnboardDeviceSponsorshipPanel {...panelProps} />
    </Dialog>
  );
}

export function OnboardDeviceSponsorDialog({
  open,
  title = 'Onboard a Device',
  className,
  draft,
  result = null,
  error = null,
  errorFields = [],
  busy = false,
  signerActive = true,
  handoffStatus = null,
  handoffStatusTone = 'success',
  handoffAction = null,
  cancelRequiresConfirmation = false,
  onDraftChange,
  onCreatePackage,
  onCopyPackage,
  onSavePackage,
  onShowQrPackage,
  onCreateAnother,
  onClose,
}: OnboardDeviceSponsorDialogProps) {
  const [cancelConfirmOpen, setCancelConfirmOpen] = React.useState(false);
  const passwordMismatchId = React.useId();
  const creationErrorId = React.useId();
  const passwordsMismatch =
    draft.confirmPackagePassword.length > 0 && draft.packagePassword !== draft.confirmPackagePassword;
  const missingInputs = missingOnboardSponsorInputs(draft);
  const createDisabled =
    busy ||
    !signerActive ||
    missingInputs.length > 0 ||
    draft.packagePassword !== draft.confirmPackagePassword;
  const handoffBusy = Boolean(handoffAction);
  const handoffStatusRole: 'alert' | 'status' = handoffStatusTone === 'warning' ? 'alert' : 'status';
  const errorDescribesField = React.useCallback(
    (field: OnboardDeviceSponsorErrorField) => Boolean(error && errorFields.includes(field)),
    [error, errorFields],
  );
  const errorDescriptionForField = React.useCallback(
    (field: OnboardDeviceSponsorErrorField) => (errorDescribesField(field) ? creationErrorId : undefined),
    [creationErrorId, errorDescribesField],
  );
  const shouldConfirmCancel =
    cancelRequiresConfirmation && !result && !busy && !handoffBusy;

  React.useEffect(() => {
    if (!open) setCancelConfirmOpen(false);
  }, [open]);

  const requestClose = React.useCallback(() => {
    if (shouldConfirmCancel) {
      setCancelConfirmOpen(true);
      return;
    }
    onClose();
  }, [onClose, shouldConfirmCancel]);

  return (
    <>
      <Dialog
        open={open}
        onClose={requestClose}
        title={title}
        className={cn('max-w-2xl', className)}
        preventDismissOnBackdrop={(busy && !result) || handoffBusy}
        preventDismissOnEscape={(busy && !result) || handoffBusy}
      >
        {result ? (
          <div className="space-y-5" data-testid={TID.settingsOnboardResult}>
            <div className="rounded-lg border border-green-400/25 bg-green-400/[0.06] px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-green-400/15 text-green-200">
                  <Check className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-sharetech text-base leading-5 text-green-100">Package Handoff</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {result.label} is ready as an encrypted bfonboard package.
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-blue-900/25 bg-slate-950/25">
              <BoundaryRow label="Device" value={result.label} />
              {result.memberLabel ? <BoundaryRow label="Member" value={result.memberLabel} /> : null}
              {result.sharePublicKeyLabel && result.sharePublicKey ? (
                <>
                  <BoundaryRow label="Share npub" value={result.sharePublicKeyLabel} />
                  <BoundaryRow label="Share hex" value={result.sharePublicKey} />
                </>
              ) : result.sharePublicKeyLabel || result.sharePublicKey ? (
                <BoundaryRow label="Share pubkey" value={result.sharePublicKeyLabel ?? result.sharePublicKey ?? ''} />
              ) : null}
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.08em] text-blue-300/80" htmlFor="settings-onboard-result-package">
                bfonboard package
              </label>
              <Textarea
                id="settings-onboard-result-package"
                readOnly
                rows={4}
                value={result.packageText}
                className="mt-2 border-blue-900/35 bg-slate-950/50 font-sharetech text-xs leading-5 text-blue-100"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              {onCreateAnother ? (
                <Button type="button" variant="outline" onClick={onCreateAnother} disabled={handoffBusy} className="gap-2">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Create Another
                </Button>
              ) : (
                <span aria-hidden="true" />
              )}
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCopyPackage}
                  disabled={!onCopyPackage || (handoffBusy && handoffAction !== 'copy')}
                  loading={handoffAction === 'copy'}
                  loadingLabel="Copying..."
                  className="gap-2"
                  data-testid={TID.settingsOnboardCopy}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  Copy
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSavePackage}
                  disabled={!onSavePackage || (handoffBusy && handoffAction !== 'save')}
                  loading={handoffAction === 'save'}
                  loadingLabel="Saving..."
                  className="gap-2"
                  data-testid={TID.settingsOnboardSave}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onShowQrPackage}
                  disabled={!onShowQrPackage || (handoffBusy && handoffAction !== 'qr')}
                  loading={handoffAction === 'qr'}
                  loadingLabel="Opening..."
                  className="gap-2"
                  data-testid={TID.settingsOnboardQr}
                >
                  <QrCode className="h-4 w-4" aria-hidden="true" />
                  QR code
                </Button>
                <Button type="button" onClick={onClose} disabled={handoffBusy}>
                  Done
                </Button>
              </div>
            </div>
            {handoffStatus ? (
              <p
                role={handoffStatusRole}
                aria-label="Onboard package handoff status"
                aria-live={handoffStatusTone === 'warning' ? 'assertive' : 'polite'}
                data-tone={handoffStatusTone}
                className={cn(
                  'text-sm leading-5',
                  handoffStatusTone === 'warning'
                    ? 'text-amber-200'
                    : handoffStatusTone === 'info'
                      ? 'text-blue-200'
                      : 'text-green-200',
                )}
              >
                {handoffStatus}
              </p>
            ) : null}
          </div>
        ) : (
          <form className="space-y-5" onSubmit={onCreatePackage}>
            <div className="rounded-lg border border-blue-900/30 bg-slate-950/30 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-blue-500/15 text-blue-300">
                  <PackagePlus className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-sharetech text-base leading-5 text-blue-200">Configure Device</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Convert a protected remote-member bfshare into an encrypted bfonboard handoff for this signer.
                  </p>
                </div>
              </div>
            </div>

            <OnboardTextField
              label="Device Label"
              value={draft.label}
              onChange={(value) => onDraftChange('label', value)}
              placeholder="Remote Device"
              disabled={busy}
              testId={TID.settingsOnboardDeviceLabel}
            />

            <div>
              <label className="text-xs uppercase tracking-[0.08em] text-blue-300/80" htmlFor="settings-onboard-source-package">
                Source bfshare
              </label>
              <Textarea
                id="settings-onboard-source-package"
                rows={5}
                value={draft.sourcePackageText}
                disabled={busy}
                aria-invalid={errorDescribesField('sourcePackageText') || undefined}
                aria-describedby={errorDescriptionForField('sourcePackageText')}
                onChange={(event) => {
                  if (!busy) onDraftChange('sourcePackageText', event.target.value);
                }}
                placeholder="bfshare1..."
                data-testid={TID.settingsOnboardSourcePackage}
                className="mt-2 border-blue-900/35 bg-slate-950/50 font-sharetech text-xs leading-5 text-blue-100 placeholder:text-slate-600"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <OnboardPasswordField
                label="Source Password"
                value={draft.sourcePackagePassword}
                onChange={(value) => onDraftChange('sourcePackagePassword', value)}
                disabled={busy}
                invalid={errorDescribesField('sourcePackagePassword')}
                describedBy={errorDescriptionForField('sourcePackagePassword')}
                testId={TID.settingsOnboardSourcePassword}
              />
              <OnboardPasswordField
                label="Package Password"
                value={draft.packagePassword}
                onChange={(value) => onDraftChange('packagePassword', value)}
                disabled={busy}
                invalid={errorDescribesField('packagePassword')}
                describedBy={errorDescriptionForField('packagePassword')}
                testId={TID.settingsOnboardPackagePassword}
              />
              <OnboardPasswordField
                label="Confirm Package Password"
                value={draft.confirmPackagePassword}
                onChange={(value) => onDraftChange('confirmPackagePassword', value)}
                disabled={busy}
                invalid={passwordsMismatch || errorDescribesField('confirmPackagePassword')}
                describedBy={
                  passwordsMismatch
                    ? passwordMismatchId
                    : errorDescriptionForField('confirmPackagePassword')
                }
                testId={TID.settingsOnboardPackageConfirm}
                className="sm:col-span-2"
              />
            </div>

            {passwordsMismatch ? (
              <p
                id={passwordMismatchId}
                role="alert"
                aria-label="Package password mismatch"
                className="text-sm leading-5 text-red-300"
              >
                Package passwords do not match.
              </p>
            ) : null}
            {missingInputs.length > 0 ? (
              <p role="status" aria-live="polite" className="text-sm leading-5 text-blue-200">
                Missing: {missingInputs.join(', ')}.
              </p>
            ) : null}
            {!signerActive ? (
              <p
                role="status"
                aria-label="Settings Onboard signer status"
                aria-live="polite"
                className="text-sm leading-5 text-amber-200"
              >
                Start the signer before creating the package.
              </p>
            ) : null}
            {busy ? (
              <p role="status" aria-live="polite" className="text-sm leading-5 text-blue-200">
                Creating onboarding package...
              </p>
            ) : null}
            {error ? (
              <p
                id={creationErrorId}
                role="alert"
                aria-label="Onboard package creation failed"
                className="text-sm leading-5 text-red-300"
              >
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={requestClose} disabled={busy}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createDisabled}
                loading={busy}
                loadingLabel="Creating..."
                data-testid={TID.settingsOnboardCreate}
              >
                Create Package
              </Button>
            </div>
          </form>
        )}
      </Dialog>
      <ConfirmDialog
        open={cancelConfirmOpen}
        title="Cancel onboarding setup?"
        message="Discard this onboarding package draft?"
        confirmLabel="Discard Setup"
        cancelLabel="Keep Editing"
        variant="warning"
        onCancel={() => setCancelConfirmOpen(false)}
        onConfirm={() => {
          setCancelConfirmOpen(false);
          onClose();
        }}
      />
    </>
  );
}

function OnboardTextField({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  testId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  testId?: CriticalE2ETestId;
}) {
  const id = React.useId();
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.08em] text-blue-300/80" htmlFor={id}>
        {label}
      </label>
      <Input
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          if (!disabled) onChange(event.target.value);
        }}
        placeholder={placeholder}
        data-testid={testId}
        className="mt-2 border-blue-900/35 bg-slate-950/50 font-sharetech text-sm text-blue-100 placeholder:text-slate-600"
      />
    </div>
  );
}

function OnboardPasswordField({
  label,
  value,
  onChange,
  disabled = false,
  invalid = false,
  describedBy,
  testId,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  testId?: CriticalE2ETestId;
  className?: string;
}) {
  const id = React.useId();
  return (
    <div className={className}>
      <label className="text-xs uppercase tracking-[0.08em] text-blue-300/80" htmlFor={id}>
        {label}
      </label>
      <PasswordField
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          if (!disabled) onChange(event.target.value);
        }}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        data-testid={testId}
        shellClassName="mt-2"
        className="border-blue-900/35 bg-slate-950/50 font-sharetech text-sm text-blue-100 placeholder:text-slate-600"
      />
    </div>
  );
}

export function ClearCredentialsDialog({
  open,
  profileSummary,
  onConfirm,
  onCancel,
}: ClearCredentialsDialogProps) {
  const titleId = React.useId();
  return (
    <Dialog open={open} onClose={onCancel} className="max-w-md" ariaLabelledBy={titleId}>
      <div className="flex items-start justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-red-600/15 text-red-300">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 id={titleId} className="text-lg font-semibold leading-6 text-slate-100">
            Clear Credentials
          </h3>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onCancel}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-blue-950/40 hover:text-blue-200 active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-blue-500/60"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="space-y-4 pb-6">
        <p className="text-sm leading-6 text-slate-400">
          Are you sure you want to clear this device's saved credentials? This
          removes the local profile, share, password, and relay configuration
          from this device. This action cannot be undone. Other peers and the
          shared group profile are not changed.
        </p>
        <div className="rounded-lg border border-red-600/20 bg-red-600/[0.08] px-3 py-2.5 font-sharetech text-[13px] leading-4 text-red-300">
          {profileSummary}
        </div>
      </div>
      <div className="flex justify-end gap-2.5">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" variant="destructive" onClick={onConfirm}>
          Clear Credentials
        </Button>
      </div>
    </Dialog>
  );
}

export function ProfilePasswordChangeDialog({
  open,
  currentPassword,
  nextPassword,
  confirmPassword,
  error = null,
  busy = false,
  onCurrentPasswordChange,
  onNextPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onCancel,
  testIds,
}: ProfilePasswordChangeDialogProps) {
  const titleId = React.useId();
  const currentPasswordRef = React.useRef<HTMLInputElement>(null);
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      className="max-w-md p-7"
      ariaLabelledBy={titleId}
      initialFocusRef={currentPasswordRef}
    >
      <div className="flex items-start justify-between gap-4 pb-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-blue-500/15 text-blue-300">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 id={titleId} className="text-lg font-semibold leading-6 text-slate-100">
              Change Profile Password
            </h3>
            <p className="mt-1 font-sharetech text-xs leading-4 text-slate-500">
              Local profile encryption
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onCancel}
          disabled={busy}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-blue-950/40 hover:text-blue-200 active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-blue-500/60 disabled:pointer-events-none disabled:opacity-50"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <p className="text-sm leading-6 text-slate-400">
          Re-encrypt this device profile and share package with a new local unlock password.
        </p>

        <div className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium leading-4 text-slate-200">Current Password</span>
            <PasswordField
              ref={currentPasswordRef}
              data-testid={testIds?.current}
              value={currentPassword}
              onChange={(event) => onCurrentPasswordChange(event.target.value)}
              autoComplete="current-password"
              disabled={busy}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium leading-4 text-slate-200">New Password</span>
            <PasswordField
              data-testid={testIds?.next}
              value={nextPassword}
              onChange={(event) => onNextPasswordChange(event.target.value)}
              autoComplete="new-password"
              disabled={busy}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium leading-4 text-slate-200">Confirm New Password</span>
            <PasswordField
              data-testid={testIds?.confirm}
              value={confirmPassword}
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
              autoComplete="new-password"
              disabled={busy}
            />
          </label>
        </div>

        {error ? <div className="text-xs leading-4 text-red-300">{error}</div> : null}

        <div className="flex justify-end gap-2.5 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="submit"
            data-testid={testIds?.submit}
            disabled={busy}
            loading={busy}
            loadingLabel="Saving..."
          >
            Change Password
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export function SettingsUnsavedChangesDialog({
  open,
  onDiscard,
  onKeepEditing,
}: SettingsUnsavedChangesDialogProps) {
  const titleId = React.useId();
  return (
    <Dialog open={open} onClose={onKeepEditing} className="max-w-md" ariaLabelledBy={titleId}>
      <div className="flex items-start justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-red-600/15 text-red-300">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 id={titleId} className="text-lg font-semibold leading-6 text-slate-100">
            Discard unsaved changes?
          </h3>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onKeepEditing}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-blue-950/40 hover:text-blue-200 active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-blue-500/60"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="pb-6">
        <p className="text-sm leading-6 text-slate-400">
          You have unsaved changes in Settings. Close without saving?
        </p>
      </div>
      <div className="flex justify-end gap-2.5">
        <Button type="button" variant="outline" onClick={onKeepEditing}>
          Keep editing
        </Button>
        <Button type="button" variant="destructive" onClick={onDiscard}>
          Discard
        </Button>
      </div>
    </Dialog>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-2">
        <h3 className="shrink-0 font-sharetech text-[13px] uppercase leading-4 tracking-[0.08em] text-blue-300/80">
          {title}
        </h3>
        <div className="h-px min-w-0 flex-1 bg-blue-900/20" />
      </div>
      {children}
    </section>
  );
}

function InfoRows({ rows }: { rows: Array<[string, string | undefined]> }) {
  const visibleRows = rows.filter(([, value]) => value);
  if (!visibleRows.length) return null;
  return (
    <div className="overflow-hidden rounded-lg border border-blue-900/30 bg-slate-950/20">
      {visibleRows.map(([label, value], index) => {
        const isKey = label.toLowerCase().includes('npub');
        return (
          <div
            key={label}
            className={cn(
              'grid grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] items-center gap-3 px-3.5 py-2.5 text-xs leading-4',
              index > 0 && 'border-t border-blue-900/15',
            )}
          >
            <span className="text-slate-400">{label}</span>
            <span
              className={cn(
                'min-w-0 truncate text-right text-slate-100',
                isKey && 'font-sharetech text-[11px] text-blue-400',
              )}
            >
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ActionRow({ action, emphasis = false }: { action: OperatorSettingsSidebarAction; emphasis?: boolean }) {
  const destructive = action.variant === 'destructive';
  const quietBlue = action.variant === 'secondary' || action.variant === 'outline' || (!action.variant && !emphasis);
  return (
    <div
      className={cn(
        'grid gap-3',
        'grid-cols-[minmax(0,1fr)_auto] items-center gap-4',
      )}
    >
      <div className="min-w-0">
        <h4 className="text-sm font-medium leading-[18px] text-slate-200">{action.title}</h4>
        <div className="mt-1 text-xs leading-4 text-slate-500">{action.description}</div>
      </div>
      <Button
        type="button"
        size="sm"
        variant={destructive || quietBlue ? 'outline' : 'default'}
        data-testid={action.testId}
        onClick={action.onAction}
        disabled={action.disabled}
        className={cn(
          'min-h-10 min-w-[68px] justify-self-end px-4 text-sm active:scale-[0.96]',
          emphasis && 'min-w-[9rem] shadow-[0_10px_24px_rgba(59,130,246,0.2)]',
          quietBlue && 'border-blue-500/50 bg-blue-500/5 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200',
          destructive && 'border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/15 hover:text-red-200',
        )}
      >
        {action.actionLabel}
      </Button>
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
    <label className="grid grid-cols-[minmax(0,1fr)_7rem] items-center gap-3 rounded-lg border border-blue-900/30 bg-slate-950/20 px-3.5 py-2.5">
      <span className="text-xs leading-4 text-slate-400">{label}</span>
      <Input
        type="number"
        min={1}
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 border-blue-900/30 bg-slate-950/60 text-right text-xs"
      />
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
    <label className="grid gap-2 rounded-lg border border-blue-900/30 bg-slate-950/20 px-3.5 py-2.5">
      <span className="text-xs leading-4 text-slate-400">{label}</span>
      <select
        className="h-9 w-full rounded border border-blue-900/30 bg-slate-950/60 px-3 text-xs text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        value={value}
        onChange={(event) => onChange(event.target.value as OperatorPeerSelectionStrategy)}
      >
        <option value="deterministic_sorted">Deterministic Sorted</option>
        <option value="random">Random</option>
      </select>
    </label>
  );
}
