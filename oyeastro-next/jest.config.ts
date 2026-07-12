import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^swisseph-wasm$': '<rootDir>/node_modules/swisseph-wasm/src/swisseph.js',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.json' }],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testMatch: ['**/tests/**/*.test.ts'],
  testPathIgnorePatterns: ['/tests/.*\\.ui\\.test\\.ts$'],
  modulePathIgnorePatterns: ['<rootDir>/.netlify/'],
}

export default config
