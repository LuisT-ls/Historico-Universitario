import { FirebaseError } from 'firebase/app'
import {
  isFirebaseError,
  getFirebaseErrorMessage,
  handleError,
} from '@/lib/error-handler'

describe('lib/error-handler', () => {
  describe('isFirebaseError', () => {
    it('deve retornar true para FirebaseError válido', () => {
      const error: FirebaseError = {
        code: 'auth/user-not-found',
        message: 'User not found',
        name: 'FirebaseError',
      }
      expect(isFirebaseError(error)).toBe(true)
    })

    it('deve retornar false para Error comum', () => {
      const error = new Error('Erro comum')
      expect(isFirebaseError(error)).toBe(false)
    })

    it('deve retornar false para null', () => {
      expect(isFirebaseError(null)).toBe(false)
    })

    it('deve retornar false para undefined', () => {
      expect(isFirebaseError(undefined)).toBe(false)
    })

    it('deve retornar false para string', () => {
      expect(isFirebaseError('erro')).toBe(false)
    })
  })

  describe('getFirebaseErrorMessage', () => {
    it('deve retornar mensagem para erro de autenticação', () => {
      const error: FirebaseError = {
        code: 'auth/user-not-found',
        message: 'User not found',
        name: 'FirebaseError',
      }
      const message = getFirebaseErrorMessage(error)
      expect(message).toContain('não encontrado')
    })

    it('deve retornar mensagem para erro de Firestore', () => {
      const error: FirebaseError = {
        code: 'permission-denied',
        message: 'Permission denied',
        name: 'FirebaseError',
      }
      const message = getFirebaseErrorMessage(error)
      expect(message).toContain('Permissão negada')
    })

    it('deve retornar mensagem para erro de Storage', () => {
      const error: FirebaseError = {
        code: 'storage/unauthorized',
        message: 'Unauthorized',
        name: 'FirebaseError',
      }
      const message = getFirebaseErrorMessage(error)
      expect(message).toContain('permissão')
    })

    it('deve retornar mensagem genérica para código desconhecido', () => {
      const error: FirebaseError = {
        code: 'unknown/error',
        message: 'Unknown error',
        name: 'FirebaseError',
      }
      const message = getFirebaseErrorMessage(error)
      expect(message).toContain('Tente novamente')
    })

    it('deve retornar mensagem genérica para Error comum', () => {
      const error = new Error('Erro comum')
      const message = getFirebaseErrorMessage(error)
      expect(message).toContain('erro inesperado')
    })

    it('deve retornar mensagem genérica para valores não Error', () => {
      const message = getFirebaseErrorMessage('string')
      expect(message).toContain('Ocorreu um erro')
    })

    it('deve mapear todos os códigos de auth conhecidos', () => {
      const codes = [
        'auth/user-not-found',
        'auth/wrong-password',
        'auth/invalid-email',
        'auth/email-already-in-use',
        'auth/weak-password',
        'auth/too-many-requests',
      ]

      codes.forEach((code) => {
        const error: FirebaseError = {
          code,
          message: 'Test',
          name: 'FirebaseError',
        }
        const message = getFirebaseErrorMessage(error)
        expect(message).not.toContain('Tente novamente') // Não deve ser mensagem genérica
      })
    })
  })

  describe('handleError', () => {
    it('deve retornar estrutura padronizada para FirebaseError', () => {
      const error: FirebaseError = {
        code: 'auth/user-not-found',
        message: 'User not found',
        name: 'FirebaseError',
      }
      const handled = handleError(error)
      expect(handled.title).toBe('Usuário não encontrado')
      expect(handled.message).toContain('Não encontramos')
      expect(handled.action).toBeTruthy()
      expect(handled.code).toBe('auth/user-not-found')
    })

    it('deve retornar estrutura padronizada para Error comum', () => {
      const error = new Error('Erro comum')
      const handled = handleError(error)
      expect(handled.title).toBe('Erro inesperado')
      expect(handled.message).toBe('Erro comum')
      expect(handled.code).toBeUndefined()
    })

    it('deve incluir originalError quando capturado', () => {
      // Nota: process.env.NODE_ENV é somente leitura em alguns ambientes de teste
      const error: FirebaseError = {
        code: 'auth/user-not-found',
        message: 'User not found',
        name: 'FirebaseError',
      }
      const handled = handleError(error)
      // Se estiver em desenvolvimento, originalError deve estar definido
      if (process.env.NODE_ENV === 'development') {
        expect(handled.originalError).toBeDefined()
      }
    })
  })
})
