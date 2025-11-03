module.exports = {
  testEnvironment: 'node',
  verbose: true,
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  // Transform uuid package from node_modules to handle ESM
  transformIgnorePatterns: [
    '/node_modules/(?!uuid)/'
  ],
};
