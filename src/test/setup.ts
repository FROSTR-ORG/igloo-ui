import '@testing-library/jest-dom/vitest';

// Register vitest-axe's accessibility matcher (`toHaveNoViolations`) and its
// TypeScript augmentation so axe-based a11y assertions are available in tests.
import 'vitest-axe/extend-expect';
import * as axeMatchers from 'vitest-axe/matchers';
import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';

expect.extend(axeMatchers);

// Vitest does not auto-run Testing Library cleanup unless `globals` is enabled,
// so unmount rendered trees between tests to avoid cross-test DOM pollution
// (duplicate elements, stale focus targets, leftover Escape-stack handlers).
afterEach(() => {
  cleanup();
});

// axe-core probes HTMLCanvasElement.getContext for its icon-ligature / contrast
// heuristics; jsdom does not implement canvas and logs a noisy "Not implemented"
// error per call. Those rules are disabled in the axe options anyway, so stub
// getContext to return null and keep test output readable.
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = (() => null) as never;
}
