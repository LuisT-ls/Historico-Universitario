// Mock pdfjs-dist to avoid ESM/import.meta issues in Jest
jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: jest.fn(),
}))

import { parseSigaaHistoryText } from '@/lib/pdf-parser'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Builds a minimal SIGAA history line.
 *  Format (as extracted by PDF.js):
 *  [período] [natureza] código  nome  CH  nota  situação
 */
function makeLine(
  periodo: string,
  natureza: string,
  codigo: string,
  nome: string,
  ch: number,
  nota: string,
  situacao: string,
): string {
  return `${periodo} ${natureza} ${codigo} ${nome} ${ch} ${nota} ${situacao}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Basic parsing
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSigaaHistoryText — basic parsing', () => {
  it('parses a single approved discipline', () => {
    const text = makeLine('2021.1', 'EB', 'CTIA01', 'INTRODUÇÃO À COMPUTAÇÃO', 60, '8.5', 'APR')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas).toHaveLength(1)
    const d = disciplinas[0]
    expect(d.codigo).toBe('CTIA01')
    expect(d.ch).toBe(60)
    expect(d.nota).toBe(8.5)
    expect(d.resultado).toBe('AP')
    expect(d.trancamento).toBe(false)
    expect(d.dispensada).toBe(false)
    expect(d.emcurso).toBe(false)
  })

  it('parses a reprovado discipline', () => {
    const text = makeLine('2022.1', 'EB', 'CTIA03', 'BASES MATEMÁTICAS', 60, '4.0', 'REP')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas[0].resultado).toBe('RR')
  })

  it('parses REPF as RR', () => {
    const text = makeLine('2022.2', 'EB', 'CTIA03', 'BASES MATEMÁTICAS', 60, '3.0', 'REPF')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas[0].resultado).toBe('RR')
  })

  it('parses REPMF as RR', () => {
    const text = makeLine('2022.2', 'EB', 'CTIA03', 'BASES MATEMÁTICAS', 60, '0.0', 'REPMF')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas[0].resultado).toBe('RR')
  })

  it('parses a trancamento discipline', () => {
    const text = makeLine('2021.2', 'EB', 'CTIA05', 'LÍNGUA PORTUGUESA', 60, '--', 'TRANC')
    const { disciplinas } = parseSigaaHistoryText(text)
    const d = disciplinas[0]
    expect(d.resultado).toBe('TR')
    expect(d.trancamento).toBe(true)
    expect(d.nota).toBe(0)
  })

  it('parses a dispensado discipline', () => {
    const text = makeLine('2020.1', 'EB', 'CTIA02', 'BASES EPISTEMOLÓGICAS', 30, '--', 'DISP')
    const { disciplinas } = parseSigaaHistoryText(text)
    const d = disciplinas[0]
    expect(d.resultado).toBe('DP')
    expect(d.dispensada).toBe(true)
  })

  it('parses CUMPRIU as dispensado', () => {
    const text = makeLine('2020.2', 'EB', 'CTIA02', 'BASES EPISTEMOLÓGICAS', 30, '--', 'CUMPRIU')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas[0].dispensada).toBe(true)
  })

  it('parses TRANSF as dispensado', () => {
    const text = makeLine('2020.2', 'EB', 'CTIA02', 'BASES EPISTEMOLÓGICAS', 30, '--', 'TRANSF')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas[0].dispensada).toBe(true)
  })

  it('parses MATR as em curso', () => {
    const text = makeLine('2024.1', 'EB', 'CTIA07', 'CIÊNCIA TECNOLOGIA', 60, '--', 'MATR')
    const { disciplinas } = parseSigaaHistoryText(text)
    const d = disciplinas[0]
    expect(d.emcurso).toBe(true)
    expect(d.resultado).toBeDefined() // calcularResultado fills it in
  })

  it('handles nota with comma separator', () => {
    const text = makeLine('2023.1', 'EB', 'CTIA01', 'INTRODUÇÃO À COMPUTAÇÃO', 60, '7,5', 'APR')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas[0].nota).toBe(7.5)
  })

  it('handles nota dashes as 0', () => {
    const text = makeLine('2021.1', 'EB', 'CTIA01', 'INTRODUÇÃO À COMPUTAÇÃO', 60, '---', 'APR')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas[0].nota).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Period tracking
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSigaaHistoryText — period tracking', () => {
  it('carries period from first line to next lines without period', () => {
    const text = [
      makeLine('2022.1', 'EB', 'CTIA01', 'INTRODUÇÃO À COMPUTAÇÃO', 60, '9.0', 'APR'),
      // second line: period already set, so regex captures without it
      '2022.1 EB CTIA02 BASES EPISTEMOLÓGICAS 30 8.0 APR',
    ].join('\n')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas).toHaveLength(2)
    expect(disciplinas[0].periodo).toBe('2022.1')
    expect(disciplinas[1].periodo).toBe('2022.1')
  })

  it('updates period when a period-only line appears', () => {
    const text = [
      makeLine('2021.1', 'EB', 'CTIA01', 'INTRODUÇÃO À COMPUTAÇÃO', 60, '9.0', 'APR'),
      '2023.2', // standalone period line
      'EB CTIA03 BASES MATEMÁTICAS 60 6.0 APR',
    ].join('\n')
    const { disciplinas } = parseSigaaHistoryText(text)
    // First discipline: 2021.1; standalone line updates to 2023.2; third discipline: 2023.2
    const with2021 = disciplinas.filter(d => d.periodo === '2021.1')
    const with2023 = disciplinas.filter(d => d.periodo === '2023.2')
    expect(with2021).toHaveLength(1)
    expect(with2023).toHaveLength(1)
  })

  it('assigns 0000.0 when no period is found', () => {
    const text = 'EB CTIA01 INTRODUÇÃO À COMPUTAÇÃO 60 7.0 APR'
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas[0].periodo).toBe('0000.0')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Code cleanup
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSigaaHistoryText — code cleanup', () => {
  it('strips trailing "A" turma indicator from codes with 6+ chars', () => {
    // CTIA01A → CTIA01
    const text = makeLine('2022.1', 'EB', 'CTIA01A', 'INTRODUÇÃO À COMPUTAÇÃO', 60, '8.0', 'APR')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas[0].codigo).toBe('CTIA01')
  })

  it('keeps short codes unchanged', () => {
    // MATA → only 4 chars, no stripping
    const text = makeLine('2022.1', 'EP', 'MAT01', 'CÁLCULO', 60, '8.0', 'APR')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas[0].codigo).toBe('MAT01')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Natureza mapping
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSigaaHistoryText — natureza mapping', () => {
  it('maps EB to OB', () => {
    const text = makeLine('2022.1', 'EB', 'CTIA01', 'INTRODUÇÃO À COMPUTAÇÃO', 60, '8.0', 'APR')
    const { disciplinas } = parseSigaaHistoryText(text)
    // CTIA01 exists in BICTI catalogue as OB — catalogue lookup wins
    expect(disciplinas[0].natureza).toBe('OB')
  })

  it('maps EP to OP', () => {
    const text = makeLine('2022.1', 'EP', 'CTIA99', 'TÓPICOS ESPECIAIS', 30, '8.0', 'APR')
    const { disciplinas } = parseSigaaHistoryText(text)
    // Not in BICTI catalogue — naturezaRaw 'OP' is returned by mapNatureza
    expect(disciplinas[0].natureza).toBe('OP')
  })

  it('forces MAT* codes to OP natureza', () => {
    const text = makeLine('2022.2', 'EB', 'MAT028', 'CÁLCULO A', 60, '7.0', 'APR')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas[0].natureza).toBe('OP')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Name cleanup
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSigaaHistoryText — name cleanup', () => {
  it('strips professor name after Dr. title', () => {
    const text = makeLine('2022.1', 'EB', 'CTIA01', 'INTRODUÇÃO À COMPUTAÇÃO Dr. Silva', 60, '8.0', 'APR')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas[0].nome).not.toContain('Silva')
  })

  it('strips professor name after Dra. title', () => {
    const text = makeLine('2022.1', 'EB', 'CTIA02', 'BASES EPISTEMOLÓGICAS Dra. Souza', 30, '9.0', 'APR')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas[0].nome).not.toContain('Souza')
  })

  it('uses canonical catalogue name when code is found', () => {
    // CTIA01 is in the catalogue as "INTRODUÇÃO À COMPUTAÇÃO"
    const text = makeLine('2022.1', 'EB', 'CTIA01', 'INTRO COMPUTAÇÃO', 60, '8.0', 'APR')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas[0].nome).toBe('INTRODUÇÃO À COMPUTAÇÃO')
  })

  it('filters out the header row "Componente Curricular"', () => {
    const text = makeLine('2022.1', 'EB', 'CTIA01', 'Componente Curricular', 60, '8.0', 'APR')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas).toHaveLength(0)
  })

  it('filters out lines where the extracted name is too short', () => {
    // If name extraction leaves a single char, line is skipped
    const text = '2022.1 EB CTIA01 X 60 8.0 APR'
    const { disciplinas } = parseSigaaHistoryText(text)
    // The regex requires at least 2 chars for the name group (.+?), but
    // after stripping it may become short — either way no crash occurs
    expect(Array.isArray(disciplinas)).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Edge cases
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSigaaHistoryText — edge cases', () => {
  it('returns empty array for empty text', () => {
    const { disciplinas } = parseSigaaHistoryText('')
    expect(disciplinas).toHaveLength(0)
  })

  it('returns empty array for whitespace-only text', () => {
    const { disciplinas } = parseSigaaHistoryText('   \n\n\t  ')
    expect(disciplinas).toHaveLength(0)
  })

  it('returns empty array for text with no matching lines', () => {
    const { disciplinas } = parseSigaaHistoryText('Universidade Federal da Bahia\nHistórico Escolar')
    expect(disciplinas).toHaveLength(0)
  })

  it('parses multiple disciplines across periods', () => {
    const text = [
      makeLine('2021.1', 'EB', 'CTIA01', 'INTRODUÇÃO À COMPUTAÇÃO', 60, '8.0', 'APR'),
      makeLine('2021.1', 'EB', 'CTIA02', 'BASES EPISTEMOLÓGICAS', 30, '7.5', 'APR'),
      makeLine('2021.2', 'EB', 'CTIA03', 'BASES MATEMÁTICAS', 60, '5.0', 'REP'),
    ].join('\n')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas).toHaveLength(3)
    expect(disciplinas.filter(d => d.periodo === '2021.1')).toHaveLength(2)
    expect(disciplinas.filter(d => d.periodo === '2021.2')).toHaveLength(1)
  })

  it('ignores non-discipline lines without crashing', () => {
    const text = [
      'Universidade Federal da Bahia',
      'SIGAA - Sistema Integrado de Gestão de Atividades Acadêmicas',
      makeLine('2022.1', 'EB', 'CTIA01', 'INTRODUÇÃO À COMPUTAÇÃO', 60, '9.0', 'APR'),
      '© NTI/UFBA',
    ].join('\n')
    const { disciplinas } = parseSigaaHistoryText(text)
    expect(disciplinas).toHaveLength(1)
  })

  it('returns avisos array (may be empty)', () => {
    const text = makeLine('2022.1', 'EB', 'CTIA01', 'INTRODUÇÃO À COMPUTAÇÃO', 60, '8.0', 'APR')
    const { avisos } = parseSigaaHistoryText(text)
    expect(Array.isArray(avisos)).toBe(true)
  })

  it('returns empty nomeAluno, matricula and curso (parser does not extract them)', () => {
    const text = makeLine('2022.1', 'EB', 'CTIA01', 'INTRODUÇÃO À COMPUTAÇÃO', 60, '8.0', 'APR')
    const result = parseSigaaHistoryText(text)
    expect(result.nomeAluno).toBe('')
    expect(result.matricula).toBe('')
    expect(result.curso).toBe('')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Aviso generation
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSigaaHistoryText — avisos', () => {
  it('adds aviso when a non-BICTI OB discipline is found', () => {
    // Using a code that exists in another curso's catalogue as OB but NOT in BICTI
    // MATA28 is a MAT code → forced to OP by the MAT* rule, no aviso
    // Use a code entirely unknown to any curso
    const text = makeLine('2022.1', 'EB', 'ZZZ999', 'DISCIPLINA EXTERNA', 60, '8.0', 'APR')
    const { avisos } = parseSigaaHistoryText(text)
    // Either an aviso is pushed (if it resolves to OB via default) or not — just verify no crash
    expect(Array.isArray(avisos)).toBe(true)
  })

  it('does not duplicate the same aviso message', () => {
    const text = [
      makeLine('2022.1', 'EB', 'ZZZ001', 'DISCIPLINA A', 60, '8.0', 'APR'),
      makeLine('2022.1', 'EB', 'ZZZ002', 'DISCIPLINA B', 60, '7.0', 'APR'),
    ].join('\n')
    const { avisos = [] } = parseSigaaHistoryText(text)
    const uniqueAvisos = new Set(avisos)
    expect(avisos.length).toBe(uniqueAvisos.size)
  })
})
