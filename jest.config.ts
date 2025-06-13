import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps/', '<rootDir>/libs/'],
  moduleNameMapper: {
    '^@libs/business(|/.*)$': '<rootDir>/libs/business/src/$1',
    '^@libs/infrastructure(|/.*)$': '<rootDir>/libs/infrastructure/src/$1',
    '^@prisma-client/client(|/.*)$': '<rootDir>/prisma/prisma-clients/$1',
    '^@libs/utils(|/.*)$': '<rootDir>/libs/utils/src/$1',
  },
};

export default config;
