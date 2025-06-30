import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  target: 'node16',
  outDir: 'dist',
  banner: {
    js: '#!/usr/bin/env node',
  },
  publicDir: 'src/templates/static',
});
