# igloo-ui

Shared React UI package for the Igloo applications.

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

In the monorepo, prefer resolving `igloo-ui` from source for local development and tests so React stays deduped. `igloo-home` is the reference setup.

## Shared Surface

Primary flow exports:

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
