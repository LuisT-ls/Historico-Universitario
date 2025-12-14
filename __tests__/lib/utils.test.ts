import {
  cn,
  formatDate,
  getPeriodoMaisRecente,
  compararPeriodos,
  calcularResultado,
  calcularMediaGeral,
  calcularCR,
  calcularCreditos,
  calcularPCH,
  calcularPCR,
  getStatusCR,
  calcularTendenciaNotas,
  sanitizeInput,
  sanitizeLongText,
  calcularEstatisticas,
} from '@/lib/utils'
import type { Disciplina } from '@/types'

describe('lib/utils', () => {
  describe('cn', () => {
    it('deve combinar classes CSS corretamente', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
      expect(cn('foo', null, 'bar')).toBe('foo bar')
      expect(cn('foo', undefined, 'bar')).toBe('foo bar')
    })
  })

  describe('formatDate', () => {
    it('deve formatar data corretamente', () => {
      const date = new Date('2024-01-15T10:30:00')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })

    it('deve formatar string de data', () => {
      const formatted = formatDate('2024-01-15T10:30:00')
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })
  })

  describe('getPeriodoMaisRecente', () => {
    it('deve retornar null para array vazio', () => {
      expect(getPeriodoMaisRecente([])).toBeNull()
    })

    it('deve retornar o período mais recente', () => {
      const disciplinas = [
        { periodo: '2023.1' },
        { periodo: '2024.2' },
        { periodo: '2024.1' },
      ]
      expect(getPeriodoMaisRecente(disciplinas)).toBe('2024.2')
    })

    it('deve ignorar períodos vazios', () => {
      const disciplinas = [
        { periodo: '2023.1' },
        { periodo: '' },
        { periodo: '2024.1' },
      ]
      expect(getPeriodoMaisRecente(disciplinas)).toBe('2024.1')
    })
  })

  describe('compararPeriodos', () => {
    it('deve comparar períodos corretamente', () => {
      expect(compararPeriodos('2024.2', '2024.1')).toBeLessThan(0)
      expect(compararPeriodos('2024.1', '2024.2')).toBeGreaterThan(0)
      expect(compararPeriodos('2024.1', '2023.2')).toBeLessThan(0)
    })
  })

  describe('calcularResultado', () => {
    it('deve retornar undefined para AC', () => {
      expect(calcularResultado(8, false, false, false, 'AC')).toBeUndefined()
    })

    it('deve retornar TR para trancamento', () => {
      expect(calcularResultado(8, true)).toBe('TR')
    })

    it('deve retornar AP para dispensada', () => {
      expect(calcularResultado(8, false, true)).toBe('AP')
    })

    it('deve retornar DP para em curso', () => {
      expect(calcularResultado(8, false, false, true)).toBe('DP')
    })

    it('deve retornar AP para nota >= 7.0', () => {
      expect(calcularResultado(7.0)).toBe('AP')
      expect(calcularResultado(8.5)).toBe('AP')
      expect(calcularResultado(10)).toBe('AP')
    })

    it('deve retornar RR para nota < 7.0', () => {
      expect(calcularResultado(6.9)).toBe('RR')
      expect(calcularResultado(5.0)).toBe('RR')
      expect(calcularResultado(0)).toBe('RR')
    })
  })

  describe('calcularMediaGeral', () => {
    it('deve retornar 0 para array vazio', () => {
      expect(calcularMediaGeral([])).toBe(0)
    })

    it('deve calcular média ponderada corretamente', () => {
      const disciplinas = [
        { nota: 8, ch: 60 },
        { nota: 7, ch: 60 },
        { nota: 9, ch: 30 },
      ]
      // (8*60 + 7*60 + 9*30) / (60+60+30) = (480 + 420 + 270) / 150 = 1170 / 150 = 7.8
      expect(calcularMediaGeral(disciplinas)).toBeCloseTo(7.8, 1)
    })
  })

  describe('calcularCR', () => {
    it('deve retornar 0 para array vazio', () => {
      expect(calcularCR([])).toBe(0)
    })

    it('deve ignorar disciplinas dispensadas', () => {
      const disciplinas = [
        { nota: 8, ch: 60, dispensada: true },
        { nota: 7, ch: 60, dispensada: false },
      ]
      expect(calcularCR(disciplinas)).toBe(7)
    })

    it('deve ignorar AC', () => {
      const disciplinas = [
        { nota: 8, ch: 60, natureza: 'AC' },
        { nota: 7, ch: 60, natureza: 'OB' },
      ]
      expect(calcularCR(disciplinas)).toBe(7)
    })

    it('deve calcular CR corretamente', () => {
      const disciplinas = [
        { nota: 8, ch: 60 },
        { nota: 7, ch: 60 },
      ]
      expect(calcularCR(disciplinas)).toBe(7.5)
    })
  })

  describe('calcularCreditos', () => {
    it('deve calcular créditos corretamente', () => {
      const disciplinas = [
        { ch: 60 }, // 60/15 = 4 créditos
        { ch: 30 }, // 30/15 = 2 créditos
      ]
      expect(calcularCreditos(disciplinas)).toBe(6)
    })

    it('deve ignorar disciplinas dispensadas e AC', () => {
      const disciplinas = [
        { ch: 60, dispensada: true },
        { ch: 30, natureza: 'AC' },
        { ch: 60 },
      ]
      expect(calcularCreditos(disciplinas)).toBe(4)
    })
  })

  describe('calcularPCH', () => {
    it('deve calcular PCH corretamente', () => {
      const disciplinas = [
        { nota: 8, ch: 60 }, // 8 * 60 = 480
        { nota: 7, ch: 60 }, // 7 * 60 = 420
      ]
      expect(calcularPCH(disciplinas)).toBe(900)
    })
  })

  describe('calcularPCR', () => {
    it('deve calcular PCR corretamente', () => {
      const disciplinas = [
        { nota: 8, ch: 60 }, // (60/15) * 8 = 4 * 8 = 32
        { nota: 7, ch: 30 }, // (30/15) * 7 = 2 * 7 = 14
      ]
      expect(calcularPCR(disciplinas)).toBe(46)
    })
  })

  describe('getStatusCR', () => {
    it('deve retornar status excelente para CR >= 8.5', () => {
      const status = getStatusCR(8.5)
      expect(status.class).toBe('excellent')
      expect(status.text).toContain('Excelente')
    })

    it('deve retornar status bom para CR >= 7.0', () => {
      const status = getStatusCR(7.0)
      expect(status.class).toBe('good')
      expect(status.text).toContain('Bom')
    })

    it('deve retornar status regular para CR >= 6.0', () => {
      const status = getStatusCR(6.0)
      expect(status.class).toBe('regular')
      expect(status.text).toContain('Regular')
    })

    it('deve retornar status precisa melhorar para CR < 6.0', () => {
      const status = getStatusCR(5.9)
      expect(status.class).toBe('needs-improvement')
      expect(status.text).toContain('Precisa melhorar')
    })
  })

  describe('calcularTendenciaNotas', () => {
    it('deve retornar dados insuficientes para menos de 2 disciplinas', () => {
      const disciplinas = [{ nota: 8, periodo: '2024.1' }]
      const tendencia = calcularTendenciaNotas(disciplinas)
      expect(tendencia.text).toContain('insuficientes')
    })

    it('deve detectar tendência de melhoria', () => {
      const disciplinas = [
        { nota: 6, periodo: '2023.1' },
        { nota: 7, periodo: '2023.2' },
        { nota: 8, periodo: '2024.1' },
        { nota: 9, periodo: '2024.2' },
      ]
      const tendencia = calcularTendenciaNotas(disciplinas)
      // A função ordena por período (mais recente primeiro), então:
      // Ordenado: [9 (2024.2), 8 (2024.1), 7 (2023.2), 6 (2023.1)]
      // Primeiras (metade): [9, 8] = média 8.5
      // Últimas (metade): [7, 6] = média 6.5
      // Diferença: 8.5 - 6.5 = 2.0 > 0.5, então trending-up
      expect(tendencia.icon).toBe('trending-up')
      expect(tendencia.text).toContain('melhoria')
    })

    it('deve detectar tendência de queda', () => {
      const disciplinas = [
        { nota: 9, periodo: '2024.2' },
        { nota: 8, periodo: '2024.1' },
        { nota: 7, periodo: '2023.2' },
        { nota: 6, periodo: '2023.1' },
      ]
      const tendencia = calcularTendenciaNotas(disciplinas)
      // Ordenado: [9 (2024.2), 8 (2024.1), 7 (2023.2), 6 (2023.1)]
      // Primeiras: [9, 8] = média 8.5
      // Últimas: [7, 6] = média 6.5
      // Diferença: 6.5 - 8.5 = -2.0 < -0.5, então trending-down
      expect(tendencia.icon).toBe('trending-down')
      expect(tendencia.text).toContain('queda')
    })
  })

  describe('sanitizeInput', () => {
    it('deve remover tags HTML', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
      expect(sanitizeInput('texto <b>negrito</b>')).toBe('texto bnegrito/b')
    })

    it('deve remover protocolos JavaScript', () => {
      expect(sanitizeInput('javascript:alert("xss")')).toBe('alert("xss")')
    })

    it('deve remover event handlers', () => {
      expect(sanitizeInput('onclick="alert(1)"')).toBe('"alert(1)"')
    })

    it('deve normalizar espaços', () => {
      expect(sanitizeInput('texto    com    espaços')).toBe('texto com espaços')
    })

    it('deve fazer trim', () => {
      expect(sanitizeInput('  texto  ')).toBe('texto')
    })

    it('deve retornar string vazia para valores não string', () => {
      expect(sanitizeInput(null as any)).toBe('')
      expect(sanitizeInput(undefined as any)).toBe('')
    })
  })

  describe('sanitizeLongText', () => {
    it('deve sanitizar texto longo mantendo quebras de linha', () => {
      const texto = 'Linha 1\nLinha 2\n\nLinha 3'
      const sanitizado = sanitizeLongText(texto)
      expect(sanitizado).toContain('\n')
    })

    it('deve limitar múltiplas quebras de linha', () => {
      const texto = 'Texto\n\n\n\nMuitas quebras'
      const sanitizado = sanitizeLongText(texto)
      expect(sanitizado).not.toMatch(/\n{3,}/)
    })

    it('deve remover tags HTML', () => {
      // sanitizeLongText remove < e >, então <p>Texto</p> vira pTexto/p
      const resultado = sanitizeLongText('<p>Texto</p>')
      expect(resultado).toBe('pTexto/p')
      expect(resultado).not.toContain('<')
      expect(resultado).not.toContain('>')
    })
  })

  describe('calcularEstatisticas', () => {
    it('deve calcular estatísticas corretamente', () => {
      const disciplinas: Disciplina[] = [
        { periodo: '2024.1', codigo: 'D1', nome: 'Disciplina 1', natureza: 'OB', ch: 60, nota: 8, resultado: 'AP' },
        { periodo: '2024.1', codigo: 'D2', nome: 'Disciplina 2', natureza: 'OB', ch: 60, nota: 6, resultado: 'RR' },
        { periodo: '2024.2', codigo: 'D3', nome: 'Disciplina 3', natureza: 'OB', ch: 60, nota: 0, emcurso: true },
      ]

      const stats = calcularEstatisticas(disciplinas)
      expect(stats.totalDisciplines).toBe(3)
      expect(stats.completedDisciplines).toBe(2)
      expect(stats.inProgressDisciplines).toBe(1)
      expect(stats.averageGrade).toBe(7) // (8 + 6) / 2
    })
  })
})
