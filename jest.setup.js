// Configuração do ambiente de testes
import '@testing-library/jest-dom'

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock do Firebase (pode ser expandido conforme necessário)
jest.mock('@/lib/firebase/config', () => ({
  auth: {},
  db: {},
  storage: {},
  analytics: {},
  googleProvider: {},
}))

// Suprimir console.error em testes (opcional)
// global.console = {
//   ...console,
//   error: jest.fn(),
//   warn: jest.fn(),
// }
