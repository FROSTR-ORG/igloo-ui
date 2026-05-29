#!/usr/bin/env node

import { cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Ship vendored fonts alongside the emitted styles.css so the @font-face
// url("./fonts/...") in dist/styles.css resolves for consumers.
await cp(
  path.resolve(rootDir, 'src/fonts'),
  path.resolve(rootDir, 'dist/fonts'),
  { recursive: true }
);

await esbuild.build({
  absWorkingDir: rootDir,
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  jsx: 'automatic',
  external: ['react', 'react-dom'],
  logLevel: 'silent'
});
