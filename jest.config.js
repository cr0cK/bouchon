module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: ['**/*.{ts,tsx}', '!**/node_modules/**'],
  setupFiles: ['jest-localstorage-mock'],
  testEnvironment: 'node',
  bail: false,
  forceExit: true,
  verbose: true,
  globals: {
    'ts-jest': {
      skipBabel: true
    }
  }
}
