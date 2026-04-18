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

    it('deve retornar AP para nota >= 5.0', () => {
      expect(calcularResultado(5.0)).toBe('AP')
      expect(calcularResultado(7.0)).toBe('AP')
      expect(calcularResultado(8.5)).toBe('AP')
      expect(calcularResultado(10)).toBe('AP')
    })

    it('deve retornar RR para nota < 5.0', () => {
      expect(calcularResultado(4.9)).toBe('RR')
      expect(calcularResultado(3.0)).toBe('RR')
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

    it('deve ignorar disciplinas em curso', () => {
      const disciplinas = [
        { nota: 8, ch: 60, emcurso: false },
        { nota: 0, ch: 60, emcurso: true },
      ]
      expect(calcularMediaGeral(disciplinas)).toBe(8)
    })
  })

  describe('calcularCR', () => {
    it('deve retornar 0 para array vazio', () => {
      expect(calcularCR([])).toBe(0)
    })

    it('deve ignorar disciplinas dispensadas', () => {
      const disciplinas = [
        { nota: 8, ch: 60, dispensada: true, resultado: 'AP' },
        { nota: 7, ch: 60, dispensada: false, resultado: 'AP' },
      ]
      expect(calcularCR(disciplinas)).toBe(7)
    })

    it('deve ignorar AC', () => {
      const disciplinas = [
        { nota: 8, ch: 60, natureza: 'AC', resultado: 'AP' },
        { nota: 7, ch: 60, natureza: 'OB', resultado: 'AP' },
      ]
      expect(calcularCR(disciplinas)).toBe(7)
    })

    it('deve calcular CR corretamente', () => {
      const disciplinas = [
        { nota: 8, ch: 60, resultado: 'AP' },
        { nota: 7, ch: 60, resultado: 'RR' },
      ]
      expect(calcularCR(disciplinas)).toBe(7.5)
    })

    it('deve ignorar disciplinas em curso', () => {
      const disciplinas = [
        { nota: 8, ch: 60, emcurso: false, resultado: 'AP' },
        { nota: 0, ch: 60, emcurso: true, resultado: undefined },
      ]
      expect(calcularCR(disciplinas)).toBe(8)
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
        { nota: 9, periodo: '2023.1' },
        { nota: 8, periodo: '2023.2' },
        { nota: 7, periodo: '2024.1' },
        { nota: 6, periodo: '2024.2' },
      ]
      const tendencia = calcularTendenciaNotas(disciplinas)
      // Ordenado (mais recente primeiro): [6 (2024.2), 7 (2024.1), 8 (2023.2), 9 (2023.1)]
      // Recentes (metade): [6, 7] = média 6.5
      // Antigas: [8, 9] = média 8.5
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

  describe('validação de bounds - dados inválidos', () => {
    describe('calcularMediaGeral', () => {
      it('deve ignorar nota negativa', () => {
        const disciplinas = [
          { nota: 8, ch: 60 },
          { nota: -5, ch: 60 }, // inválida
        ]
        expect(calcularMediaGeral(disciplinas)).toBe(8)
      })

      it('deve ignorar nota acima de 10', () => {
        const disciplinas = [
          { nota: 8, ch: 60 },
          { nota: 15, ch: 60 }, // inválida
        ]
        expect(calcularMediaGeral(disciplinas)).toBe(8)
      })

      it('deve ignorar ch <= 0', () => {
        const disciplinas = [
          { nota: 8, ch: 60 },
          { nota: 7, ch: 0 },  // inválida
          { nota: 6, ch: -30 }, // inválida
        ]
        expect(calcularMediaGeral(disciplinas)).toBe(8)
      })

      it('deve retornar 0 quando todos os registros são inválidos', () => {
        const disciplinas = [
          { nota: -1, ch: 60 },
          { nota: 8, ch: 0 },
        ]
        expect(calcularMediaGeral(disciplinas)).toBe(0)
      })
    })

    describe('calcularCR', () => {
      it('deve ignorar nota negativa no cálculo do CR', () => {
        const disciplinas = [
          { nota: 8, ch: 60, resultado: 'AP' },
          { nota: -3, ch: 60, resultado: 'RR' }, // nota inválida
        ]
        expect(calcularCR(disciplinas)).toBe(8)
      })

      it('deve ignorar nota acima de 10 no cálculo do CR', () => {
        const disciplinas = [
          { nota: 7, ch: 60, resultado: 'AP' },
          { nota: 11, ch: 60, resultado: 'AP' }, // nota inválida
        ]
        expect(calcularCR(disciplinas)).toBe(7)
      })

      it('deve ignorar ch <= 0 no cálculo do CR', () => {
        const disciplinas = [
          { nota: 8, ch: 60, resultado: 'AP' },
          { nota: 9, ch: 0, resultado: 'AP' },  // ch inválida
        ]
        expect(calcularCR(disciplinas)).toBe(8)
      })
    })

    describe('calcularCreditos', () => {
      it('deve ignorar ch zero', () => {
        const disciplinas = [
          { ch: 60 },
          { ch: 0 }, // inválida
        ]
        expect(calcularCreditos(disciplinas)).toBe(4)
      })

      it('deve ignorar ch negativo', () => {
        const disciplinas = [
          { ch: 60 },
          { ch: -30 }, // inválida
        ]
        expect(calcularCreditos(disciplinas)).toBe(4)
      })
    })

    describe('calcularPCH', () => {
      it('deve ignorar dados inválidos no cálculo do PCH', () => {
        const disciplinas = [
          { nota: 8, ch: 60 },   // 8 * 60 = 480
          { nota: -1, ch: 60 },  // inválida
          { nota: 9, ch: 0 },    // inválida
        ]
        expect(calcularPCH(disciplinas)).toBe(480)
      })
    })

    describe('calcularPCR', () => {
      it('deve ignorar dados inválidos no cálculo do PCR', () => {
        const disciplinas = [
          { nota: 8, ch: 60 },   // (60/15) * 8 = 32
          { nota: 11, ch: 60 },  // inválida
          { nota: 8, ch: -30 },  // inválida
        ]
        expect(calcularPCR(disciplinas)).toBe(32)
      })
    })

    describe('calcularTendenciaNotas', () => {
      it('deve ignorar notas fora da faixa ao analisar tendência', () => {
        // 1 válida + 1 inválida → apenas 1 aproveitável → "insuficientes"
        const disciplinas = [
          { nota: 8, periodo: '2023.1' },   // válida
          { nota: -5, periodo: '2024.1' },  // inválida (nota < 0)
        ]
        const tendencia = calcularTendenciaNotas(disciplinas)
        expect(tendencia.text).toContain('insuficientes')
      })

      it('não deve distorcer a tendência por causa de notas inválidas', () => {
        const validas = [
          { nota: 6, periodo: '2023.1' },
          { nota: 8, periodo: '2023.2' },
        ]
        const comInvalidas = [
          ...validas,
          { nota: -5, periodo: '2024.1' }, // inválida
          { nota: 15, periodo: '2024.2' }, // inválida
        ]
        // O resultado com inválidas deve ser idêntico ao resultado sem elas
        expect(calcularTendenciaNotas(comInvalidas).icon)
          .toBe(calcularTendenciaNotas(validas).icon)
      })
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

    it('redistribui horas de OP para LV quando requisito de OP é 0 (BICTI)', () => {
      // No BICTI, OP tem requisito=0, então qualquer hora de OP deve ir para LV
      const disciplinas: Disciplina[] = [
        { periodo: '2024.1', codigo: 'D1', nome: 'Optativa', natureza: 'OP', ch: 60, nota: 8, resultado: 'AP' },
      ]

      const stats = calcularEstatisticas(disciplinas, [], 'BICTI')
      // OP deve ser 0h (redistribuído para LV)
      expect(stats.horasPorNatureza?.OP).toBe(0)
      // As 60h devem estar em LV
      expect(stats.horasPorNatureza?.LV).toBeGreaterThan(0)
    })

    it('dispensadas e transferidas contam como completedDisciplines e não como inProgressDisciplines', () => {
      const disciplinas: Disciplina[] = [
        { periodo: '0000.0', codigo: 'D1', nome: 'Transferida', natureza: 'OP', ch: 75, nota: 0, resultado: 'DP', dispensada: true },
        { periodo: '2024.1', codigo: 'D2', nome: 'Em Curso', natureza: 'OB', ch: 60, nota: 0, emcurso: true },
      ]

      const stats = calcularEstatisticas(disciplinas)
      expect(stats.completedDisciplines).toBe(1)
      expect(stats.inProgressDisciplines).toBe(1)
    })
  })
})
