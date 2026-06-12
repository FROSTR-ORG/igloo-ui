// Stable hooks for the cross-repo Playwright suite. These data-testids are
// ALWAYS present (no production stripping) — the app already ships them and the
// e2e page objects depend on them; do not add a build-time strip without
// updating test/igloo-pwa/support/pages/*.
//
// Repeated elements (profile rows, share options, distribution cards, relay
// rows) carry the static id value below plus a `data-*` discriminator
// (data-profile-id / data-member-idx / data-status / data-relay-url) so page
// objects can target a specific instance without depending on copy or on
// mutating CSS classes.
export const CRITICAL_E2E_TEST_IDS = {
  // Welcome (HostShell)
  landingContinueOnboarding: 'landing-continue-onboarding',
  welcomeEntryGenerate: 'welcome-entry-generate',
  welcomeEntryImport: 'welcome-entry-import',
  welcomeEntryOnboard: 'welcome-entry-onboard',
  welcomeProfileRow: 'welcome-profile-row',
  welcomeProfileUnlock: 'welcome-profile-unlock',
  // Resumable devices: other browser partitions surfaced for one-click resume
  // after a restart clears this tab's instance id (igloo-pwa instance registry).
  welcomeResumeDevices: 'welcome-resume-devices',
  welcomeResumeDevice: 'welcome-resume-device',
  welcomeResumeDeviceButton: 'welcome-resume-device-button',
  welcomeProfileMenuTrigger: 'welcome-profile-menu-trigger',
  welcomeProfileMenuRotate: 'welcome-profile-menu-rotate',
  welcomeProfileMenuRecover: 'welcome-profile-menu-recover',
  welcomeProfileMenuDelete: 'welcome-profile-menu-delete',
  welcomeUnlockPassword: 'welcome-unlock-password',
  welcomeUnlockSubmit: 'welcome-unlock-submit',

  // Create / Select Share / Save Profile (CreateFlow)
  createBack: 'create-back',
  createModeNew: 'create-mode-new',
  createModeRotate: 'create-mode-rotate',
  createGenerateNext: 'create-generate-next',
  rotateSourceProfile: 'rotate-source-profile',
  rotateAddSource: 'rotate-add-source',
  rotateSubmit: 'rotate-submit',
  selectShareOption: 'select-share-option',
  selectShareCopyGroupKey: 'select-share-copy-group-key',
  selectShareNext: 'select-share-next',
  saveProfileName: 'save-profile-name',
  saveProfilePassword: 'save-profile-password',
  saveProfileConfirm: 'save-profile-confirm',
  saveProfileNext: 'save-profile-next',
  relayList: 'relay-list',
  relayRow: 'relay-row',
  relayAddInput: 'relay-add-input',
  relayAddSubmit: 'relay-add-submit',

  // Distribute Shares (CreateFlow)
  distributionCard: 'distribution-card',
  distributionPackagePassword: 'distribution-package-password',
  distributionPrepare: 'distribution-prepare',
  distributionCopy: 'distribution-copy',
  distributionSave: 'distribution-save',
  distributionQr: 'distribution-qr',
  distributionCancel: 'distribution-cancel',
  distributionMark: 'distribution-mark',
  distributionRevert: 'distribution-revert',
  distributionFinish: 'distribution-finish',

  // Recover private key (CreateFlow collect + recover-key success view). The
  // reconstructed nsec is masked until revealed; recoverKeyValue carries the
  // revealed value so specs can verify the real recovered key (not a stub).
  recoverDevicePassphrase: 'recover-device-passphrase',
  recoverNext: 'recover-next',
  recoverRevealKey: 'recover-reveal-key',
  recoverKeyValue: 'recover-key-value',

  // Onboard / Import (CreateFlow)
  onboardPackageInput: 'onboard-package-input',
  onboardPasswordInput: 'onboard-password-input',
  onboardConnectSubmit: 'onboard-connect-submit',
  onboardSaveName: 'onboard-save-name',
  onboardSavePassword: 'onboard-save-password',
  onboardSaveConfirm: 'onboard-save-confirm',
  onboardSaveSubmit: 'onboard-save-submit',
  importProfileInput: 'import-profile-input',
  importPasswordInput: 'import-password-input',
  importNext: 'import-next',

  // Dashboard (OperatorDashboardTabs / routed nav)
  dashboardRoot: 'dashboard-root',
  dashboardTabSigner: 'dashboard-tab-signer',
  dashboardTabPermissions: 'dashboard-tab-permissions',
  dashboardTabSettings: 'dashboard-tab-settings',
  // Merged identity/runtime card — split copy controls (npub default + hex caret)
  dashboardGroupKeyCopy: 'dashboard-group-key-copy',
  dashboardGroupKeyFormat: 'dashboard-group-key-format',
  dashboardShareKeyCopy: 'dashboard-share-key-copy',
  dashboardShareKeyFormat: 'dashboard-share-key-format',
  dashboardPendingApprovals: 'dashboard-pending-approvals',

  // Operator permissions (peer policy editor). The single toggle id is repeated
  // per peer × direction × method and disambiguated by data-peer-pubkey /
  // data-direction / data-method; data-allowed exposes the current effective
  // value so page objects can assert state without reading copy.
  permissionToggle: 'permission-toggle',

  // Operator settings — Device Profile form. Number fields share one id plus a
  // data-field discriminator; relay rows share one id plus data-relay-url.
  settingsSignerName: 'settings-signer-name',
  settingsRelayAddInput: 'settings-relay-add-input',
  settingsRelayAddSubmit: 'settings-relay-add-submit',
  settingsRelayRow: 'settings-relay-row',
  settingsNumberField: 'settings-number-field',
  settingsSave: 'settings-save',

  // Operator settings / maintenance / rotation / stored profiles
  settingsCopyProfile: 'settings-copy-profile',
  settingsCopyShare: 'settings-copy-share',
  settingsLogout: 'settings-logout',
  // Export package modal (password re-encrypt → complete state)
  exportPassword: 'export-password',
  exportConfirm: 'export-confirm',
  exportSubmit: 'export-submit',
  exportComplete: 'export-complete',
  exportResult: 'export-result',
  exportCopy: 'export-copy',
  exportDownload: 'export-download',
  settingsAutoOpenToggle: 'settings-auto-open-toggle',
  maintenanceRotateShare: 'maintenance-rotate-share',
  rotationPackageInput: 'rotation-package-input',
  rotationPasswordInput: 'rotation-password-input',
  rotationConfirmSubmit: 'rotation-confirm-submit',
  rotationConnectSubmit: 'rotation-connect-submit',
  storedProfileEntry: 'stored-profile-entry',
  storedProfileLoad: 'stored-profile-load',
  storedProfileUnlockSubmit: 'stored-profile-unlock-submit',
} as const;

export type CriticalE2ETestId =
  (typeof CRITICAL_E2E_TEST_IDS)[keyof typeof CRITICAL_E2E_TEST_IDS];
