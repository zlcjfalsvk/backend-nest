import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@libs/adapter': resolve(__dirname, '../../libs/adapter/src'),
      '@libs/business': resolve(__dirname, '../../libs/business/src'),
      '@libs/infrastructure': resolve(__dirname, '../../libs/infrastructure/src'),
      '@libs/utils': resolve(__dirname, '../../libs/utils/src'),
      '@prisma-client': resolve(__dirname, '../../prisma/prisma-clients'),
    },
  },
  test: {
    name: 'e2e',
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    include: ['**/*.e2e-spec.ts'],
    exclude: ['node_modules', 'dist'],
    globals: true,
    environment: 'node',
    setupFiles: ['tests/e2e/setup.ts'],
    globalSetup: ['tests/e2e/global-setup.ts'],
    globalTeardown: ['tests/e2e/global-teardown.ts'],
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
      json: 'logs/e2e-results.json',
    },
  },
  esbuild: {
    target: 'node20',
  },
});