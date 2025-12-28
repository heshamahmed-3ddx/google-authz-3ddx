export default {
  rootDir: '.',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {},
  collectCoverage: true,
  collectCoverageFrom: [
    'server/src/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/e2e/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/server/**/*.test.js',
    '!**/client/**'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
    '/client/'
  ],
  testTimeout: 60000
};
