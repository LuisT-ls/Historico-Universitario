const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Caminho para o app Next.js para carregar next.config.js e arquivos .env
  dir: './',
})

// Configuração customizada do Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Mapear imports do Next.js
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
  collectCoverageFrom: [
    'lib/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/*.config.{js,ts}',
    // Excluir componentes sem testes (TODO: adicionar testes)
    '!components/error-boundary.tsx',
    '!components/providers.tsx',
    '!components/theme-toggle.tsx',
    '!components/ui/skeleton.tsx',
    '!components/ui/textarea.tsx',
    '!components/ui/select.tsx',
    '!components/ui/sheet.tsx',
    '!components/ui/input.tsx',
    '!components/ui/label.tsx',
    '!components/ui/progress.tsx',
    '!components/ui/checkbox.tsx',
    '!components/ui/dialog.tsx',
    '!components/ui/dropdown-menu.tsx',
    '!components/ui/breadcrumbs.tsx',
    '!components/ui/badge.tsx',
    '!components/ui/card.tsx',
    '!lib/export-utils.ts',
    '!lib/constants.ts',
    '!lib/logger.ts',
    '!lib/toast.ts',
    '!lib/type-constants.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 12,
      functions: 13,
      lines: 15,
      statements: 15,
    },
    'lib/pdf-parser.ts': {
      branches: 50,
      functions: 50,
      lines: 65,
      statements: 65,
    },
    // lib — lógica de negócio crítica
    'lib/error-handler.ts': {
      branches: 85,
      functions: 100,
      lines: 85,
      statements: 85,
    },
    'lib/certificate-ocr.ts': {
      branches: 90,
      functions: 100,
      lines: 90,
      statements: 90,
    },
    // services — camada de acesso a dados
    'services/firestore.service.ts': {
      branches: 75,
      functions: 100,
      lines: 90,
      statements: 90,
    },
    'services/auth.service.ts': {
      branches: 50,
      functions: 100,
      lines: 90,
      statements: 90,
    },
  },
  transformIgnorePatterns: [
    'node_modules/(?!(lucide-react)/)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/e2e/',
  ],
}

module.exports = createJestConfig(customJestConfig)
