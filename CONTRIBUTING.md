# Contributing

This file explains the editing boundaries for `igloo-ui`.

## Ownership Rules

`igloo-ui` owns:

- reusable presentational components
- shared workflow components
- shared host-shell flow composition for the Igloo hosts
- shared create, review, and distribution flow UI contracts
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
- Update `CHANGELOG.md` when the shared host-shell or create-flow surface changes in a user-visible way.
- Keep host-specific persistence, runtime orchestration, and routing out of shared flow components; pass those in through props and callbacks only.
