// Public API surface for @frostr/igloo-ui.
//
// Exports are enumerated explicitly (rather than `export *`) so the package's
// public surface is auditable and stable. This intentionally reproduces the
// exact set of names previously re-exported via wildcard. Pruning the surface
// is out of scope here; add new names to the appropriate group when modules
// gain exports.

/* ------------------------------------------------------------------ */
/* utils                                                              */
/* ------------------------------------------------------------------ */
export { cn } from './lib/utils';
export { CRITICAL_E2E_TEST_IDS } from './lib/e2e-test-ids';
export type { CriticalE2ETestId } from './lib/e2e-test-ids';

/* ------------------------------------------------------------------ */
/* primitives (components/ui)                                         */
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
export { Collapsible } from './components/ui/collapsible';
export type { CollapsibleProps } from './components/ui/collapsible';
export { ConfirmModal } from './components/ui/confirm-modal';
export { ContentCard } from './components/ui/content-card';
export { EventLog } from './components/ui/event-log';
export type { LogEntry } from './components/ui/event-log';
export { IconButton, iconButtonVariants } from './components/ui/icon-button';
export type { IconButtonProps } from './components/ui/icon-button';
export { Input } from './components/ui/input';
export type { InputProps } from './components/ui/input';
export { InputWithValidation } from './components/ui/input-with-validation';
export type { InputWithValidationProps } from './components/ui/input-with-validation';
export { Label } from './components/ui/label';
export type { LabelProps } from './components/ui/label';
export { LogEntryComponent } from './components/ui/log-entry';
export type { LogEntryData } from './components/ui/log-entry';
export { Modal } from './components/ui/modal';
export type { ModalProps } from './components/ui/modal';
export { PageLayout } from './components/ui/page-layout';
export { PeerList } from './components/ui/peer-list';
export type { PeerPolicy } from './components/ui/peer-list';
export { RelayInput } from './components/ui/relay-input';
export { StatusDot, StatusBadge } from './components/ui/status-indicator';
export type { StatusState } from './components/ui/status-indicator';
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
/* flow composites (components + components/flows)                    */
/* ------------------------------------------------------------------ */
export { OnboardingInstructions } from './components/OnboardingInstructions';
export {
  CreateFlowTaskBanner,
  CreateFlowGenerateCard,
  CreateFlowSharePicker,
  CreateFlowLocalSaveCard,
  CreateFlowReviewPanel,
  CreateFlowDistributionCards,
  CreateFlowDistributionSection,
} from './components/flows/CreateFlow';
export type {
  SharedCreateFormState,
  SharedRotationSource,
  SharedGeneratedShare,
  SharedDistributionDraft,
  SharedDistributionResult,
  SharedDistributionTrackingStage,
  SharedDistributionTrackingStatus,
  SharedLocalSaveDraft,
} from './components/flows/CreateFlow';
export { CreateImportPanel } from './components/flows/CreateImportPanel';
export type {
  GeneratedShareDraft,
  GeneratedShareCard,
  GeneratedKeysetView,
} from './components/flows/CreateImportPanel';
export {
  HostEntryTile,
  HostFlowShell,
  StepProgress,
  StoredProfilesLandingCard,
} from './components/flows/HostShell';
export type { HostStoredProfileSummary } from './components/flows/HostShell';
export { DesktopAppShell } from './components/flows/DesktopAppShell';
export type {
  DesktopShellTab,
  DesktopShellPath,
  DesktopShellStatus,
} from './components/flows/DesktopAppShell';
export { ManagedProfilesPanel } from './components/flows/ManagedProfilesPanel';
export type { ManagedProfileSummary } from './components/flows/ManagedProfilesPanel';
export { OperatorDashboardTabs } from './components/flows/OperatorDashboardTabs';
export type {
  OperatorDashboardTab,
  OperatorDashboardTabItem,
} from './components/flows/OperatorDashboardTabs';
export { OperatorPermissionsPanel } from './components/flows/OperatorPermissionsPanel';
export type {
  OperatorSitePermission,
  OperatorPeerPermission,
  OperatorPolicyOverrideValue,
  OperatorMethodPermission,
  OperatorMethodPermissionOverride,
  OperatorPeerPermissionState,
} from './components/flows/OperatorPermissionsPanel';
export { OperatorSettingsPanel } from './components/flows/OperatorSettingsPanel';
export type {
  OperatorPeerSelectionStrategy,
  OperatorSignerSettings,
  OperatorMaintenanceAction,
} from './components/flows/OperatorSettingsPanel';
export { OperatorSignerPanel } from './components/flows/OperatorSignerPanel';
export type {
  OperatorRuntimeState,
  OperatorPendingOperation,
  OperatorProfileSummary,
} from './components/flows/OperatorSignerPanel';
export { ProfileConfirmationCard } from './components/flows/ProfileConfirmationCard';
export { QrPayloadModal } from './components/flows/QrPayloadModal';
export { RecoveryWorkspace } from './components/flows/RecoveryWorkspace';
