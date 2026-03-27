# Contributing

This file explains the editing boundaries for `igloo-ui`.

## Ownership Rules

`igloo-ui` owns:

- reusable presentational components
- shared workflow components
- exported styles and package surface for host apps

It does not own:

- signer/runtime orchestration
- host storage or persistence
- app-specific lifecycle and routing logic

## Editing Guidance

- Keep the package consumer-neutral.
- Prefer prop-driven composition over host-specific branching.
- Preserve the published package contract in `dist/` outputs and exported styles.
- Update `README.md` and `TESTING.md` when exported components or consumer expectations change.
