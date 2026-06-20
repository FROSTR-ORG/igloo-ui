// Public API surface for @frostr/igloo-ui.
//
// Exports are enumerated explicitly (rather than `export *`) so the package's
// public surface is auditable and stable. Add new names to the appropriate
// group when a module gains exports; values use `export { … }` and types use
// `export type { … }`.

/* ------------------------------------------------------------------ */
/* utils & ids                                                        */
/* ------------------------------------------------------------------ */
export { cn } from './lib/utils';
export { downloadText } from './lib/download';
export { CRITICAL_E2E_TEST_IDS } from './lib/e2e-test-ids';
export type { CriticalE2ETestId } from './lib/e2e-test-ids';
export { passwordManagerOptOutProps } from './lib/password-manager';

/* ------------------------------------------------------------------ */
/* design tokens, view models & runtime adapters                      */
/* ------------------------------------------------------------------ */
export {
  IGLOO_COLOR_TOKENS,
  IGLOO_TYPOGRAPHY_TOKENS,
  iglooTokenCssVariables,
} from './tokens/design-tokens';
export type {
  IglooColorTokens,
  IglooTypographyTokens,
} from './tokens/design-tokens';
export type {
  FlowStepState,
  FlowStepModel,
  DashboardKeyModel,
  DashboardKeyFormat,
  SignerDashboardViewModel,
  PendingApprovalRowModel,
  PeerReadinessRowModel,
  PolicyDashboardViewModel,
  PeerPolicyRowModel,
  SitePolicyRowModel,
  PolicyMethodState,
  PolicyOverrideValue,
  PolicyMethodOverrideState,
  PendingOperationRowModel,
  EventLogRowModel,
} from './models/view-models';
export {
  buildPeerReadinessRows,
  buildPendingApprovalRows,
  deriveDashboardState,
  runtimePeerPermissionStatesToPolicyDashboardView,
  observabilityEventsToEventRows,
} from './adapters/runtime-view-models';
export type { DashboardStateInput } from './adapters/runtime-view-models';
// Adapter input shapes — exported so a consumer that depends on both igloo-ui
// and igloo-shared (igloo-chrome) can host the wire-type drift contract test
// without igloo-ui taking an igloo-shared dependency. See
// igloo-chrome/src/extension/runtime-types.contract.ts.
export type {
  RuntimeStatusSummaryInput,
  RuntimePeerStatusInput,
  RuntimePendingApprovalInput,
  RuntimePeerPermissionStateInput,
  RuntimeOperationFailureInput,
} from './adapters/runtime-view-models';
export type {
  DashboardState,
  DashboardBanner,
  SigningBlockedReason,
} from './models/dashboard-state';
export type { ObservabilityEventInput } from './adapters/runtime-view-models';

/* ------------------------------------------------------------------ */
/* primitives (components/ui)                                          */
/* ------------------------------------------------------------------ */
export { Alert } from './components/ui/alert';
export type { AlertProps } from './components/ui/alert';
export { AppHeader } from './components/ui/app-header';
export { Badge } from './components/ui/badge';
export type { BadgeProps } from './components/ui/badge';
export { Button, buttonVariants } from './components/ui/button';
export type { ButtonProps } from './components/ui/button';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './components/ui/card';
export { Checkbox } from './components/ui/checkbox';
export type { CheckboxProps } from './components/ui/checkbox';
export { Backdrop } from './components/ui/backdrop';
export type { BackdropProps } from './components/ui/backdrop';
export { Collapsible } from './components/ui/collapsible';
export type { CollapsibleProps } from './components/ui/collapsible';
export { ContentCard } from './components/ui/content-card';
export { Dialog, ConfirmDialog } from './components/ui/dialog';
export type { DialogProps, ConfirmDialogProps } from './components/ui/dialog';
export { EventLog } from './components/ui/event-log';
export type { LogEntry } from './components/ui/event-log';
export { HelpHint } from './components/ui/help-hint';
export type { HelpHintProps } from './components/ui/help-hint';
export { IconButton, iconButtonVariants } from './components/ui/icon-button';
export type { IconButtonProps } from './components/ui/icon-button';
export { Input } from './components/ui/input';
export type { InputProps } from './components/ui/input';
export { InputWithValidation } from './components/ui/input-with-validation';
export type { InputWithValidationProps } from './components/ui/input-with-validation';
export { Label } from './components/ui/label';
export type { LabelProps } from './components/ui/label';
export { LogEntryComponent } from './components/ui/log-entry';
export type { LogEntryData, LogEntryComponentProps } from './components/ui/log-entry';
export { Modal } from './components/ui/modal';
export type { ModalProps } from './components/ui/modal';
export { PageLayout } from './components/ui/page-layout';
export { PageBackLink } from './components/ui/page-back-link';
export type { PageBackLinkProps } from './components/ui/page-back-link';
export { PasswordField } from './components/ui/password-field';
export type { PasswordFieldProps } from './components/ui/password-field';
export {
  PERMISSION_METHODS,
  PermissionToken,
  PermissionTokenGroup,
  normalizePermissionMethod,
} from './components/ui/permission-token';
export type {
  PermissionMethod,
  PermissionTokenGroupProps,
  PermissionTokenInactiveTone,
  PermissionTokenProps,
  PermissionTokenVariant,
} from './components/ui/permission-token';
export { PeerList } from './components/ui/peer-list';
export type { PeerPolicy } from './components/ui/peer-list';
export { RelayInput } from './components/ui/relay-input';
export { SensitiveField } from './components/ui/sensitive-field';
export type { SensitiveFieldProps } from './components/ui/sensitive-field';
export { SensitiveTextarea } from './components/ui/sensitive-textarea';
export type { SensitiveTextareaProps } from './components/ui/sensitive-textarea';
export { StatusDot, StatusBadge } from './components/ui/status-indicator';
export type { StatusState } from './components/ui/status-indicator';
export { StepIndicator } from './components/ui/step-indicator';
export type { StepIndicatorProps, StepIndicatorStep } from './components/ui/step-indicator';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
export type {
  TabsProps,
  TabsTriggerProps,
  TabsContentProps,
} from './components/ui/tabs';
export { Textarea } from './components/ui/textarea';
export type { TextareaProps } from './components/ui/textarea';
export { Tooltip } from './components/ui/tooltip';
export type { TooltipProps } from './components/ui/tooltip';

/* ------------------------------------------------------------------ */
/* flow composites (components + components/flows)                     */
/* ------------------------------------------------------------------ */
export { OnboardingInstructions } from './components/OnboardingInstructions';
export {
  CreateFlowTaskBanner,
  CreateFlowGenerateCard,
  RotateKeysetPanel,
  ReplaceSharePackageEntry,
  ReplaceShareProgressPanel,
  ReplaceShareFailedPanel,
  ReplaceShareSuccessPanel,
  CreateFlowSharePicker,
  CreateFlowLocalSaveCard,
  CreateFlowShareSelection,
  CreateFlowProfileSetup,
  CreateFlowReviewPanel,
  OnboardingClientCard,
  CreateFlowDistributionCards,
  CreateFlowDistributionSection,
  OnboardPackageEntry,
  ImportProfileEntry,
  RecoverCollectSharesPanel,
  OnboardHandshakePanel,
  WarningCard,
  OnboardFailedPanel,
  OnboardCompletePanel,
} from './components/flows/create';
export type {
  SharedCreateFormState,
  SharedRotationSource,
  SharedGeneratedShare,
  SharedDistributionDraft,
  SharedDistributionStatus,
  SharedDistributionResult,
  SharedDistributionAction,
  SharedLocalSaveDraft,
  SharedOnboardProfilePreview,
  SharedPeerPermissionRow,
  SharedDistributionPermission,
  RelayPingFn,
  SharedRecoverSource,
  OnboardTimelineStepKey,
} from './components/flows/create';
export { ExportPackageModal } from './components/flows/ExportPackageModal';
export {
  HostFlowShell,
  StepProgress,
  WelcomeEntryHero,
  WelcomeReturningHero,
  WelcomeUnlockModal,
  WelcomeDeleteModal,
  PublicFocusFooter,
  PublicTaskShell,
  PublicTaskTitle,
} from './components/flows/HostShell';
export type {
  WelcomeHeroAction,
  WelcomeEntryPrimaryAction,
  WelcomeReturningProfileModel,
} from './components/flows/HostShell';
export { OperatorDashboardTabs } from './components/flows/OperatorDashboardTabs';
export type {
  OperatorDashboardTab,
  OperatorDashboardTabItem,
} from './components/flows/OperatorDashboardTabs';
export { OperatorPermissionsPanel } from './components/flows/OperatorPermissionsPanel';
export {
  ClearCredentialsDialog,
  OnboardDeviceSponsorDialog,
  OnboardDeviceSponsorshipDialog,
  OperatorSettingsSidebar,
  OnboardDeviceSponsorshipPanel,
  ProfilePasswordChangeDialog,
  SettingsUnsavedChangesDialog,
} from './components/flows/OperatorSettingsSidebar';
export type {
  ClearCredentialsDialogProps,
  OnboardDeviceSponsorDialogProps,
  OnboardDeviceSponsorDraft,
  OnboardDeviceSponsorResult,
  OnboardDeviceSponsorshipDialogProps,
  OnboardDeviceSponsorshipPanelProps,
  OnboardDeviceSponsorshipReadiness,
  OperatorSettingsSidebarAction,
  OperatorSettingsSidebarGroupProfile,
  OperatorSettingsSidebarProps,
  ProfilePasswordChangeDialogProps,
  SettingsUnsavedChangesDialogProps,
} from './components/flows/OperatorSettingsSidebar';
export { OperatorSettingsPanel } from './components/flows/OperatorSettingsPanel';
export type {
  OperatorPeerSelectionStrategy,
  OperatorSignerSettings,
  OperatorMaintenanceAction,
  OperatorSettingsSection,
} from './components/flows/OperatorSettingsPanel';
export { OperatorSignerPanel } from './components/flows/OperatorSignerPanel';
export {
  DashboardLoadingScreen,
  DashboardLoadFailedScreen,
  DashboardConditionBanner,
} from './components/flows/DashboardStateScreens';
export { ProfileConfirmationCard } from './components/flows/ProfileConfirmationCard';
export { QrPayloadModal } from './components/flows/QrPayloadModal';
