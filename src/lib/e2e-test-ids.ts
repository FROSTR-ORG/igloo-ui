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
  welcomeResumeDeviceForget: 'welcome-resume-device-forget',
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
  rotateLocalPassphrase: 'rotate-local-passphrase',
  rotateLocalPassphraseSubmit: 'rotate-local-passphrase-submit',
  recoverLocalPassphrase: 'recover-local-passphrase',
  recoverLocalPassphraseSubmit: 'recover-local-passphrase-submit',
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
  dashboardSettingsSidebar: 'dashboard-settings-sidebar',
  dashboardSettingsSidebarBody: 'dashboard-settings-sidebar-body',
  dashboardSettingsSidebarClose: 'dashboard-settings-sidebar-close',
  // Merged identity/runtime card — group/keyset split copy control (npub default + hex caret).
  // Share key ids remain reserved for older harnesses, but the signer dashboard
  // no longer renders a share public key row.
  dashboardGroupKeyCopy: 'dashboard-group-key-copy',
  dashboardGroupKeyFormat: 'dashboard-group-key-format',
  dashboardShareKeyCopy: 'dashboard-share-key-copy',
  dashboardShareKeyFormat: 'dashboard-share-key-format',
  dashboardPendingApprovals: 'dashboard-pending-approvals',

  // Operator settings / maintenance / rotation / stored profiles
  settingsCopyProfile: 'settings-copy-profile',
  settingsCopyShare: 'settings-copy-share',
  settingsLogout: 'settings-logout',
  settingsProfilePassword: 'settings-profile-password',
  settingsOnboardDevice: 'settings-onboard-device',
  settingsOnboardDeviceLabel: 'settings-onboard-device-label',
  settingsOnboardSourcePackage: 'settings-onboard-source-package',
  settingsOnboardSourcePassword: 'settings-onboard-source-password',
  settingsOnboardPackagePassword: 'settings-onboard-package-password',
  settingsOnboardPackageConfirm: 'settings-onboard-package-confirm',
  settingsOnboardCreate: 'settings-onboard-create',
  settingsOnboardResult: 'settings-onboard-result',
  settingsOnboardCopy: 'settings-onboard-copy',
  settingsOnboardSave: 'settings-onboard-save',
  settingsOnboardQr: 'settings-onboard-qr',
  settingsClearCredentials: 'settings-clear-credentials',
  settingsPasswordCurrent: 'settings-password-current',
  settingsPasswordNext: 'settings-password-next',
  settingsPasswordConfirm: 'settings-password-confirm',
  settingsPasswordSubmit: 'settings-password-submit',
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
