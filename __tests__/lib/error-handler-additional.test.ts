import { FirebaseError } from 'firebase/app'
import {
  isFirebaseError,
  getFirebaseErrorMessage,
  handleError,
} from '@/lib/error-handler'

describe('lib/error-handler - Testes Adicionais de Cobertura', () => {
  describe('isFirebaseError - Casos de Borda', () => {
    it('deve retornar false para objeto sem code', () => {
      const error = { message: 'Erro' }
      expect(isFirebaseError(error)).toBe(false)
    })

    it('deve retornar false para objeto sem message', () => {
      const error = { code: 'error' }
      expect(isFirebaseError(error)).toBe(false)
    })

    it('deve retornar false para objeto com code não string', () => {
      const error = { code: 123, message: 'Erro' }
      expect(isFirebaseError(error)).toBe(false)
    })

    it('deve retornar true para FirebaseError completo', () => {
      const error: FirebaseError = {
        code: 'auth/error',
        message: 'Error',
        name: 'FirebaseError',
      }
      expect(isFirebaseError(error)).toBe(true)
    })
  })

  describe('getFirebaseErrorMessage - Cobertura Completa', () => {
    it('deve mapear todos os códigos de auth', () => {
      const authCodes = [
        'auth/user-not-found',
        'auth/wrong-password',
        'auth/invalid-email',
        'auth/user-disabled',
        'auth/email-already-in-use',
        'auth/weak-password',
        'auth/operation-not-allowed',
        'auth/too-many-requests',
        'auth/network-request-failed',
        'auth/invalid-credential',
        'auth/requires-recent-login',
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request',
        'auth/popup-blocked',
      ]

      authCodes.forEach((code) => {
        const error: FirebaseError = {
          code,
          message: 'Test',
          name: 'FirebaseError',
        }
        const message = getFirebaseErrorMessage(error)
        expect(message).toBeTruthy()
        expect(typeof message).toBe('string')
      })
    })

    it('deve mapear todos os códigos de Firestore', () => {
      const firestoreCodes = [
        'permission-denied',
        'unavailable',
        'not-found',
        'already-exists',
        'failed-precondition',
        'aborted',
        'out-of-range',
        'unimplemented',
        'internal',
        'deadline-exceeded',
        'cancelled',
        'data-loss',
        'unauthenticated',
        'resource-exhausted',
        'invalid-argument',
      ]

      firestoreCodes.forEach((code) => {
        const error: FirebaseError = {
          code,
          message: 'Test',
          name: 'FirebaseError',
        }
        const message = getFirebaseErrorMessage(error)
        expect(message).toBeTruthy()
        expect(typeof message).toBe('string')
      })
    })

    it('deve mapear todos os códigos de Storage', () => {
      const storageCodes = [
        'storage/unauthorized',
        'storage/canceled',
        'storage/unknown',
        'storage/invalid-format',
        'storage/invalid-checksum',
        'storage/invalid-event-name',
        'storage/invalid-url',
        'storage/invalid-argument',
        'storage/no-default-bucket',
        'storage/cannot-slice-blob',
        'storage/server-file-wrong-size',
        'storage/quota-exceeded',
        'storage/unauthenticated',
        'storage/retry-limit-exceeded',
        'storage/download-file-not-found',
      ]

      storageCodes.forEach((code) => {
        const error: FirebaseError = {
          code,
          message: 'Test',
          name: 'FirebaseError',
        }
        const message = getFirebaseErrorMessage(error)
        expect(message).toBeTruthy()
        expect(typeof message).toBe('string')
      })
    })

    it('deve retornar mensagem genérica para código desconhecido de auth', () => {
      const error: FirebaseError = {
        code: 'auth/unknown-code',
        message: 'Unknown',
        name: 'FirebaseError',
      }
      const message = getFirebaseErrorMessage(error)
      expect(message).toContain('Tente novamente')
    })

    it('deve retornar mensagem genérica para código desconhecido de storage', () => {
      const error: FirebaseError = {
        code: 'storage/unknown-code',
        message: 'Unknown',
        name: 'FirebaseError',
      }
      const message = getFirebaseErrorMessage(error)
      expect(message).toContain('Tente novamente')
    })

    it('deve lidar com Error em modo desenvolvimento', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const error = new Error('Test error')
      getFirebaseErrorMessage(error)

      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
      process.env.NODE_ENV = originalEnv
    })

    it('deve não logar em modo produção', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const error = new Error('Test error')
      getFirebaseErrorMessage(error)

      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('handleError - Cobertura Completa', () => {
    it('deve não incluir originalError em produção', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const error: FirebaseError = {
        code: 'auth/user-not-found',
        message: 'User not found',
        name: 'FirebaseError',
      }
      const handled = handleError(error)
      expect(handled.originalError).toBeUndefined()

      process.env.NODE_ENV = originalEnv
    })

    it('deve não incluir originalError para Error comum em produção', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const error = new Error('Test')
      const handled = handleError(error)
      expect(handled.originalError).toBeUndefined()

      process.env.NODE_ENV = originalEnv
    })
  })
})
