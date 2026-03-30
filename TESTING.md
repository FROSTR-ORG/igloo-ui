# Testing

`igloo-ui` owns reusable presentational and workflow UI components for the Igloo hosts.

## Fast Baseline

```bash
npm install
npm test
```

The Vitest suite is the primary validation layer for shared UI behavior and exported component contracts.

When changing host-shell or create-flow components, keep both levels green:

- direct `igloo-ui` Vitest coverage for prop and layout contracts
- consuming-host validation in the browser and desktop apps

## Consumer Validation

When changing shared workflow components, also validate the consuming hosts that render them:

- `igloo-home`
- `igloo-pwa`
- `igloo-chrome`

Use host tests when a UI change affects real workflow composition rather than just the component contract itself.

For host-shell and create-flow changes, the root Playwright suites under `test/` are part of the expected downstream validation surface.
