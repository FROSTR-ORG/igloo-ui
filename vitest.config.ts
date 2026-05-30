import { defineConfig } from 'vitest/config';

// igloo-ui does not depend on igloo-shared, so the shared base + dom setup are
// copied into src/test/ and kept in lockstep by test/scripts/check-shared-test-setup.sh.
import { createVitestBaseConfig } from './src/test/vitest-base';

export default defineConfig({
  test: createVitestBaseConfig({
    setupFiles: ['./src/test/setup.ts'],
    include: ['test/**/*.test.tsx'],
  }),
});
