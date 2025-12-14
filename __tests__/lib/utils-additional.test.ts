import {
  calcularPrevisaoFormaturaCompleta,
  clearUserData,
} from '@/lib/utils'
import type { Disciplina } from '@/types'

describe('lib/utils - Funções Adicionais', () => {
  describe('calcularPrevisaoFormaturaCompleta', () => {
    it('deve retornar mensagem quando não há disciplinas', () => {
      const resultado = calcularPrevisaoFormaturaCompleta(
        [],
        0,
        0,
        0,
        3600,
        []
      )
      expect(resultado.texto).toContain('Adicione disciplinas')
      expect(resultado.semestresRestantes).toBe(0)
      expect(resultado.podeFormarEsteSemestre).toBe(false)
    })

    it('deve indicar que pode formar quando CH suficiente', () => {
      const disciplinas: Disciplina[] = [
        {
          periodo: '2024.1',
          codigo: 'D1',
          nome: 'Disciplina 1',
          natureza: 'OB',
          ch: 60,
          nota: 8,
          resultado: 'AP',
        },
      ]
      const resultado = calcularPrevisaoFormaturaCompleta(
        disciplinas,
        3600,
        3600,
        0,
        3600,
        []
      )
      expect(resultado.podeFormarEsteSemestre).toBe(true)
      expect(resultado.semestresRestantes).toBe(0)
    })

    it('deve calcular semestres restantes corretamente', () => {
      const disciplinas: Disciplina[] = [
        {
          periodo: '2024.1',
          codigo: 'D1',
          nome: 'Disciplina 1',
          natureza: 'OB',
          ch: 60,
          nota: 8,
          resultado: 'AP',
        },
      ]
      const resultado = calcularPrevisaoFormaturaCompleta(
        disciplinas,
        1800,
        1800,
        0,
        3600,
        []
      )
      expect(resultado.semestresRestantes).toBeGreaterThan(0)
    })

    it('deve considerar disciplinas em curso', () => {
      const disciplinas: Disciplina[] = [
        {
          periodo: '2024.1',
          codigo: 'D1',
          nome: 'Disciplina 1',
          natureza: 'OB',
          ch: 60,
          nota: 0,
          emcurso: true,
        },
      ]
      const resultado = calcularPrevisaoFormaturaCompleta(
        disciplinas,
        0,
        60,
        60,
        3600,
        disciplinas
      )
      expect(resultado.texto).toContain('em curso')
    })
  })

  describe('clearUserData', () => {
    beforeEach(() => {
      // Limpar localStorage antes de cada teste
      localStorage.clear()
      sessionStorage.clear()
    })

    it('deve limpar dados do localStorage', () => {
      localStorage.setItem('test-key', 'test-value')
      localStorage.setItem('disciplinas_BICTI', '[]')
      
      clearUserData()
      
      expect(localStorage.getItem('test-key')).toBeNull()
      expect(localStorage.getItem('disciplinas_BICTI')).toBeNull()
    })

    it('deve preservar preferências globais', () => {
      localStorage.setItem('historico-ufba-dark-mode', 'true')
      localStorage.setItem('test-key', 'test-value')
      
      clearUserData()
      
      expect(localStorage.getItem('historico-ufba-dark-mode')).toBe('true')
      expect(localStorage.getItem('test-key')).toBeNull()
    })

    it('deve limpar sessionStorage', () => {
      sessionStorage.setItem('test-session', 'value')
      
      clearUserData()
      
      expect(sessionStorage.getItem('test-session')).toBeNull()
    })

    it('deve lidar com erros graciosamente', () => {
      // Mock localStorage para lançar erro
      const originalRemoveItem = localStorage.removeItem
      localStorage.removeItem = jest.fn(() => {
        throw new Error('Storage error')
      })
      
      expect(() => clearUserData()).not.toThrow()
      
      localStorage.removeItem = originalRemoveItem
    })
  })
})
