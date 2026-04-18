import { calcularCR } from '@/lib/utils'

describe('calcularCR', () => {
  it('should calculate weighted CR correctly for a simple case', () => {
    const disciplinas = [
      { nota: 8.0, ch: 60, natureza: 'OB', resultado: 'AP' },
      { nota: 6.0, ch: 60, natureza: 'OB', resultado: 'RR' },
    ]
    // (8*60 + 6*60) / 120 = 840/120 = 7.0
    expect(calcularCR(disciplinas)).toBe(7.0)
  })

  it('should use CH as weight (not simple mean)', () => {
    const disciplinas = [
      { nota: 10.0, ch: 30, natureza: 'OB', resultado: 'AP' },
      { nota: 5.0,  ch: 60, natureza: 'OB', resultado: 'RR' },
    ]
    // (10*30 + 5*60) / 90 = 600/90 ≈ 6.667 — média simples daria 7.5
    expect(calcularCR(disciplinas)).toBeCloseTo(6.667, 2)
  })

  // ── REPF exclusion — o bug real reportado ─────────────────────────────────

  it('should EXCLUDE REPF (RF) from both numerator AND denominator', () => {
    const disciplinas = [
      { nota: 9.0, ch: 60, natureza: 'OB', resultado: 'AP' },
      { nota: 5.0, ch: 60, natureza: 'OB', resultado: 'RR' },
      { nota: 0.0, ch: 60, natureza: 'OB', resultado: 'RF' }, // REPF — não entra em nada
    ]
    // Sem REPF: (9*60 + 5*60) / 120 = 840/120 = 7.0
    // COM REPF errado: (9*60 + 5*60 + 0*60) / 180 = 840/180 = 4.67
    expect(calcularCR(disciplinas)).toBe(7.0)
  })

  it('should EXCLUDE REPMF (RF) from both numerator AND denominator', () => {
    const disciplinas = [
      { nota: 9.0, ch: 60, natureza: 'OB', resultado: 'AP' },
      { nota: 0.0, ch: 60, natureza: 'OB', resultado: 'RF' }, // REPMF — não entra
    ]
    expect(calcularCR(disciplinas)).toBe(9.0)
  })

  it('reproduces the exact reported bug: 7434/960=7.74 wrong vs 7434/900=8.26 correct', () => {
    // Engenharia reversa do histórico real:
    // soma ponderada = 7434, disciplinas AP+RR somam 900h, REPF soma 60h extra (900+60=960)
    // Criar um conjunto que produza exatamente essa soma ponderada e distribuição de CH.
    // 7434 / 900 = 8.26 (correto — sem REPF no denominador)
    // 7434 / 960 = 7.7437... (errado — com REPF no denominador)
    const disciplinas = [
      // 15 disciplinas de 60h cada = 900h, com notas que somam 7434 de PCH
      // Distribuição: médias ponderadas que resultam em 7434
      { nota: 9.5, ch: 60, natureza: 'OB', resultado: 'AP' },  // 570
      { nota: 9.0, ch: 60, natureza: 'OB', resultado: 'AP' },  // 540
      { nota: 8.5, ch: 60, natureza: 'OB', resultado: 'AP' },  // 510
      { nota: 8.5, ch: 60, natureza: 'OB', resultado: 'AP' },  // 510
      { nota: 8.5, ch: 60, natureza: 'OB', resultado: 'AP' },  // 510
      { nota: 8.4, ch: 60, natureza: 'OB', resultado: 'AP' },  // 504
      { nota: 8.0, ch: 60, natureza: 'OB', resultado: 'AP' },  // 480
      { nota: 8.0, ch: 60, natureza: 'OB', resultado: 'AP' },  // 480
      { nota: 8.0, ch: 60, natureza: 'OB', resultado: 'AP' },  // 480
      { nota: 8.0, ch: 60, natureza: 'OB', resultado: 'AP' },  // 480
      { nota: 8.0, ch: 60, natureza: 'OB', resultado: 'AP' },  // 480
      { nota: 7.5, ch: 60, natureza: 'OB', resultado: 'AP' },  // 450
      { nota: 7.0, ch: 60, natureza: 'OB', resultado: 'AP' },  // 420  → total = 5904
      { nota: 6.5, ch: 60, natureza: 'OB', resultado: 'AP' },  // 390  → 6294
      { nota: 5.5, ch: 60, natureza: 'OB', resultado: 'RR' },  // 330  → 6624
      // Ajuste para atingir 7434: substituir última por 13.5 ch extra...
      // Melhor: usar valores diretos que reproduzam a proporção
    ]
    // Simplificação: testar a proporção exata com valores controlados
    const simpleDisciplinas = [
      { nota: 8.26, ch: 900, natureza: 'OB', resultado: 'AP' }, // PCH = 7434, CH = 900
      { nota: 0.0,  ch: 60,  natureza: 'OB', resultado: 'RF' }, // REPF — excluído
    ]
    // Sem o REPF no denominador: 7434 / 900 = 8.26
    expect(calcularCR(simpleDisciplinas)).toBeCloseTo(8.26, 2)

    // Verificar que incluir REPF erroneamente daria 7.74
    const erradoDisciplinas = [
      { nota: 8.26, ch: 900, natureza: 'OB', resultado: 'AP' },
      { nota: 0.0,  ch: 60,  natureza: 'OB', resultado: 'RR' }, // se REPF fosse RR
    ]
    // (8.26*900 + 0*60) / (900+60) = 7434/960 ≈ 7.74
    expect(calcularCR(erradoDisciplinas)).toBeCloseTo(7.74375, 3)
  })

  // ── Edge cases ───────────────────────────────────────────────────────────

  it('should ignore withdrawn courses (resultado=TR)', () => {
    const disciplinas = [
      { nota: 8.0, ch: 60, natureza: 'OB', resultado: 'AP', trancamento: false },
      { nota: 0.0, ch: 60, natureza: 'OB', resultado: 'TR', trancamento: true },
    ]
    expect(calcularCR(disciplinas)).toBe(8.0)
  })

  it('should ignore resultado=TR even without trancamento flag (defensive)', () => {
    const disciplinas = [
      { nota: 8.0, ch: 60, natureza: 'OB', resultado: 'AP' },
      { nota: 0.0, ch: 60, natureza: 'OB', resultado: 'TR' }, // flag não setado
    ]
    expect(calcularCR(disciplinas)).toBe(8.0)
  })

  it('should ignore exempted courses (dispensada=true / resultado=DP)', () => {
    const disciplinas = [
      { nota: 8.0, ch: 60, natureza: 'OB', resultado: 'AP' },
      { nota: 0.0, ch: 60, natureza: 'OB', resultado: 'DP', dispensada: true },
    ]
    expect(calcularCR(disciplinas)).toBe(8.0)
  })

  it('should ignore resultado=undefined (unknown SIGAA codes like EQUIV)', () => {
    const disciplinas = [
      { nota: 8.0, ch: 60, natureza: 'OB', resultado: 'AP' },
      { nota: 0.0, ch: 60, natureza: 'OB', resultado: undefined },
    ]
    expect(calcularCR(disciplinas)).toBe(8.0)
  })

  it('should ignore in-progress courses (emcurso=true)', () => {
    const disciplinas = [
      { nota: 8.0, ch: 60, natureza: 'OB', resultado: 'AP', emcurso: false },
      { nota: 0.0, ch: 60, natureza: 'OB', resultado: undefined, emcurso: true },
    ]
    expect(calcularCR(disciplinas)).toBe(8.0)
  })

  it('should ignore complementary activities (AC)', () => {
    const disciplinas = [
      { nota: 8.0, ch: 60, natureza: 'OB', resultado: 'AP' },
      { nota: 10.0, ch: 30, natureza: 'AC', resultado: 'AP' },
    ]
    expect(calcularCR(disciplinas)).toBe(8.0)
  })

  it('should return 0 if no valid disciplines', () => {
    const disciplinas = [
      { nota: 0.0, ch: 60, resultado: 'TR', trancamento: true },
      { nota: 0.0, ch: 60, resultado: 'DP', dispensada: true },
      { nota: 0.0, ch: 60, resultado: 'RF' },
      { nota: 0.0, ch: 60, resultado: undefined },
    ]
    expect(calcularCR(disciplinas)).toBe(0)
  })

  it('full history simulation: APR+REP included, REPF+TRANC+DISP+AC excluded', () => {
    const disciplinas = [
      { nota: 9.0,  ch: 60, natureza: 'OB', resultado: 'AP' },  // entra
      { nota: 8.5,  ch: 60, natureza: 'OB', resultado: 'AP' },  // entra
      { nota: 7.0,  ch: 60, natureza: 'OB', resultado: 'AP' },  // entra
      { nota: 5.0,  ch: 60, natureza: 'OB', resultado: 'RR' },  // entra (rep por nota)
      { nota: 0.0,  ch: 60, natureza: 'OB', resultado: 'RF' },  // excluído (REPF)
      { nota: 0.0,  ch: 60, natureza: 'OB', resultado: 'TR', trancamento: true }, // excluído
      { nota: 0.0,  ch: 60, natureza: 'OB', resultado: 'DP', dispensada: true },  // excluído
      { nota: 10.0, ch: 30, natureza: 'AC', resultado: 'AP' },  // excluído (AC)
    ]
    // Apenas as 4 primeiras: (9*60 + 8.5*60 + 7*60 + 5*60) / 240
    // = (540 + 510 + 420 + 300) / 240 = 1770/240 = 7.375
    expect(calcularCR(disciplinas)).toBeCloseTo(7.375, 3)
  })
})
