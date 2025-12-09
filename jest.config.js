module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!jest.config.js',
    '!script.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],
  testMatch: [
    '**/*.test.js'
  ],
  verbose: true
};
