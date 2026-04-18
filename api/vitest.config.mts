import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: './',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        target: 'es2022',
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          decoratorMetadata: true,
          legacyDecorator: true,
        },
      },
    }),
  ],
});
