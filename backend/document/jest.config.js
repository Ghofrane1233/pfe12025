module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: '.', outputName: 'junit.xml' }]
  ]
};