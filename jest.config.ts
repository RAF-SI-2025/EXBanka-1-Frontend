import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        useESM: false,
      },
    ],
  },
  moduleNameMapper: {
    '^@/assets/.*\\.(gif|png|svg|jpg|m4a|mp3)$': '<rootDir>/src/__tests__/utils/fileMock.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '\\.(svg|png|jpg|gif|m4a|mp3)$': '<rootDir>/src/__tests__/utils/fileMock.ts',
  },
  setupFiles: ['<rootDir>/jest.setup.globals.js'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/utils/setupTests.ts'],
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
}

export default config
