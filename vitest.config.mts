import { resolve } from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    swc.vite({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
          dynamicImport: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
        target: 'es2022',
        keepClassNames: true,
      },
      module: {
        type: 'es6',
        strict: false,
        strictMode: true,
        lazy: false,
        noInterop: false,
      },
      sourceMaps: true,
      inlineSourcesContent: true,
    }),
  ],

  resolve: {
    alias: {
      '@libs/adapter': resolve(__dirname, 'libs/adapter/src'),
      '@libs/business': resolve(__dirname, 'libs/business/src'),
      '@libs/infrastructure': resolve(__dirname, 'libs/infrastructure/src'),
      '@libs/utils': resolve(__dirname, 'libs/utils/src'),
      '@prisma-client': resolve(__dirname, 'prisma/prisma-clients'),
    },
  },

  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.spec.ts'],
    setupFiles: ['./vitest-setup.ts'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: 'v8',
      include: ['**/*.(t|j)s'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        '**/*.config.*',
        '**/*.setup.*',
        '**/main.ts',
        '**/*.module.ts',
        '**/index.ts',
      ],
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
