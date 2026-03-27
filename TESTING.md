# Testing

`igloo-ui` owns reusable presentational and workflow UI components for the Igloo hosts.

## Fast Baseline

```bash
npm install
npm test
```

The Vitest suite is the primary validation layer for shared UI behavior and exported component contracts.

## Consumer Validation

When changing shared workflow components, also validate the consuming hosts that render them:

- `igloo-home`
- `igloo-pwa`
- `igloo-chrome`

Use host tests when a UI change affects real workflow composition rather than just the component contract itself.
