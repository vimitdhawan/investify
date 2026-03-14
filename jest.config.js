/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // Coverage configuration with low thresholds initially
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/app/**/*', // Exclude Next.js app pages
    '!src/types/**/*', // Exclude type definitions
  ],

  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },

  // Test patterns
  testMatch: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/out/', '/build/', '/coverage/'],

  // Transform ESM modules
  transformIgnorePatterns: ['node_modules/(?!(uuid|gaxios)/)'],

  // Test environment options
  testEnvironmentOptions: {
    customExportConditions: [''],
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Globals
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
