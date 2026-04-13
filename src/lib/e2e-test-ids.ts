export const CRITICAL_E2E_TEST_IDS = {
  landingContinueOnboarding: 'landing-continue-onboarding',
  maintenanceRotateShare: 'maintenance-rotate-share',
  rotationConfirmSubmit: 'rotation-confirm-submit',
  rotationConnectSubmit: 'rotation-connect-submit',
  storedProfileEntry: 'stored-profile-entry',
  storedProfileLoad: 'stored-profile-load',
  storedProfileUnlockSubmit: 'stored-profile-unlock-submit',
} as const;

export type CriticalE2ETestId =
  (typeof CRITICAL_E2E_TEST_IDS)[keyof typeof CRITICAL_E2E_TEST_IDS];
