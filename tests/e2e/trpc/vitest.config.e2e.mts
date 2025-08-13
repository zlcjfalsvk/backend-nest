import { resolve } from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: resolve(__dirname, '../../../'),
  resolve: {
    alias: {
      '@libs/adapter': resolve(__dirname, '../../../libs/adapter/src'),
      '@libs/business': resolve(__dirname, '../../../libs/business/src'),
      '@libs/infrastructure': resolve(
        __dirname,
        '../../../libs/infrastructure/src',
      ),
      '@libs/utils': resolve(__dirname, '../../../libs/utils/src'),
      '@prisma-client': resolve(__dirname, '../../../prisma/prisma-clients'),
    },
  },
  test: {
    name: 'trpc-e2e',
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    include: ['apps/trpc/e2e/**/*.e2e-spec.ts'],
    exclude: ['node_modules', 'dist', 'apps/api/e2e', 'apps/api/test'],
    globals: true,
    environment: 'node',
    setupFiles: ['tests/e2e/setup.ts'],
    globalSetup: ['tests/e2e/trpc/global-setup.ts'],
    globalTeardown: ['tests/e2e/trpc/global-teardown.ts'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      enabled: false,
    },
    reporter: ['verbose', 'json'],
    outputFile: {
      json: 'logs/trpc-e2e-results.json',
    },
  },
  esbuild: {
    target: 'node20',
  },
});
