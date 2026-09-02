/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.spec.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@pathforge/shared-enums$': '<rootDir>/../../packages/shared-enums/src',
    '^@pathforge/shared-constants$': '<rootDir>/../../packages/shared-constants/src',
    '^@pathforge/shared-types$': '<rootDir>/../../packages/shared-types/src',
    '^@pathforge/shared-zod$': '<rootDir>/../../packages/shared-zod/src',
    '^@pathforge/shared-utils$': '<rootDir>/../../packages/shared-utils/src',
  },
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/server.ts',
    '!prisma/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};

module.exports = config;
