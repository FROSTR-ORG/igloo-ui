#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cp, mkdir } from 'node:fs/promises';

import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

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

await mkdir(path.join(rootDir, 'dist', 'tokens'), { recursive: true });
await cp(
  path.join(rootDir, 'src', 'tokens', 'paper-tokens.css'),
  path.join(rootDir, 'dist', 'tokens', 'paper-tokens.css')
);
