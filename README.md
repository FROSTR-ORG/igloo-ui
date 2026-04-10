# igloo-ui

Shared React UI package for the Igloo applications.

## Status

- Beta.

## Owns

- reusable UI primitives
- shared shell/layout components
- reusable FROSTR workflow components
- the compiled package stylesheet at `igloo-ui/styles.css`

## Does Not Own

- signer runtime orchestration
- storage or profile persistence
- Tauri, browser extension, or server APIs
- app-specific bootstrapping and session lifecycle

## Consumer Contract

Import the package stylesheet once at app startup:

```ts
import 'igloo-ui/styles.css';
```

For local development and tests, prefer resolving `igloo-ui` from source so React stays deduped.

## Ownership Note

- `igloo-shared` owns profile package export and rotation semantics.
- `igloo-ui` owns reusable presentation only.
- `igloo-chrome`, `igloo-pwa`, and `igloo-home` own storage, runtime transport, lifecycle wiring, and UI state.
- Operator settings actions are intentionally aligned across hosts: `copy profile`, `copy share`, `rotate share`, and `logout`.

## Shared Surface

Primary flow exports:

- `HostEntryTile`
- `HostFlowShell`
- `StoredProfilesLandingCard`
- `StepProgress`
- `CreateFlowTaskBanner`
- `CreateFlowGenerateCard`
- `CreateFlowLocalSaveCard`
- `CreateFlowReviewPanel`
- `CreateFlowDistributionCards`
- `CreateFlowDistributionSection`
- `DesktopAppShell`
- `CreateImportPanel`
- `ManagedProfilesPanel`
- `OperatorDashboardTabs`
- `OperatorSignerPanel`
- `OperatorPermissionsPanel`
- `OperatorSettingsPanel`
- `ProfileConfirmationCard`
- `RecoveryWorkspace`

These flows are reusable UI only. Consumers pass data, callbacks, and async actions in through props.

## Additional Docs

- [CHANGELOG.md](./CHANGELOG.md)
- [TESTING.md](./TESTING.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
