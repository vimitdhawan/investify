/** @type {import('ts-jest').JestConfigWithTsJest}
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
  // An array of regexp patterns that are matched against all source file paths before transformation
  transformIgnorePatterns: ['/node_modules/(?!some-module-you-want-to-transform)/'],
  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\.tsx?$': 'ts-jest',
  },
  // Module file extensions for importing
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Map @/ imports to src folder
  },
};
