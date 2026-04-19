import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { config as loadEnv } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envTestPath = resolve(__dirname, '.env.test');
const envTestExamplePath = resolve(__dirname, '.env.test.example');

if (existsSync(envTestPath)) {
  loadEnv({ path: envTestPath });
} else if (existsSync(envTestExamplePath)) {
  loadEnv({ path: envTestExamplePath });
}
if (process.env.DATABASE_URL_E2E) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_E2E;
}
process.env.NODE_ENV = 'test';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: './',
    include: ['test/e2e/**/*.e2e-spec.ts'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    globalSetup: ['./test/e2e/global-setup.ts'],
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
