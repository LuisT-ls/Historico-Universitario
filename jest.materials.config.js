const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathPattern: '(materials|favorites|likes|comments|materiais-constants)',
  collectCoverageFrom: [
    'services/materials.service.ts',
    'services/favorites.service.ts',
    'services/likes.service.ts',
    'services/comments.service.ts',
    'lib/materiais-constants.ts',
  ],
  coverageThreshold: {
    'services/materials.service.ts': {
      branches: 35,
      functions: 76,
      lines: 72,
      statements: 65,
    },
    'services/favorites.service.ts': {
      branches: 0,
      functions: 100,
      lines: 85,
      statements: 84,
    },
    'services/likes.service.ts': {
      branches: 0,
      functions: 100,
      lines: 85,
      statements: 85,
    },
    'services/comments.service.ts': {
      branches: 20,
      functions: 100,
      lines: 85,
      statements: 85,
    },
    'lib/materiais-constants.ts': {
      branches: 80,
      functions: 100,
      lines: 90,
      statements: 90,
    },
  },
  transformIgnorePatterns: [
    'node_modules/(?!(lucide-react)/)',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/e2e/',
  ],
}

module.exports = createJestConfig(customJestConfig)
