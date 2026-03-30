# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, adapted for this repository.

## [Unreleased]

### Added
- Shared host-shell flow components for landing, onboarding, and create-flow composition.
- Shared create-flow sections for generation, local-save, review, and distribution steps.
- Direct Vitest coverage for the new shared create-flow contract.

### Changed
- `igloo-home` and `igloo-pwa` now consume a deeper shared host-shell and create-flow surface from `igloo-ui`.
- Shared host-flow docs now describe `igloo-ui` as the owner of the host-shell and create/distribution UI contract.
