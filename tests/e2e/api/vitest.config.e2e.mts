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
    name: 'api-e2e',
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    include: ['apps/api/e2e/**/*.e2e-spec.ts'],
    exclude: ['node_modules', 'dist', 'apps/api/test', 'apps/trpc/e2e'],
    globals: true,
    environment: 'node',
    setupFiles: ['tests/e2e/setup.ts'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: 'v8',
      enabled: false,
    },
    reporters: ['verbose', 'json'],
    outputFile: {
      json: 'logs/api-e2e-results.json',
    },
  },
  esbuild: {
    target: 'node20',
  },
});
