module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!uuid)/'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'server/src/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/e2e/**'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  testTimeout: 20000,
  globals: {
    jest: {
      useESM: true
    }
  }
};
