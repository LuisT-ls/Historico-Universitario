import {
  TIPO_MATERIAL_LABELS,
  STATUS_MATERIAL_LABELS,
  CURSO_LABELS,
  TIPOS_MATERIAL,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
  getSemestres,
} from '@/lib/materiais-constants'

describe('materiais-constants', () => {
  describe('TIPO_MATERIAL_LABELS', () => {
    it('contém todos os tipos esperados', () => {
      expect(TIPO_MATERIAL_LABELS.lista).toBe('Lista de Exercícios')
      expect(TIPO_MATERIAL_LABELS.apostila).toBe('Apostila')
      expect(TIPO_MATERIAL_LABELS.prova).toBe('Prova')
      expect(TIPO_MATERIAL_LABELS.resumo).toBe('Resumo')
      expect(TIPO_MATERIAL_LABELS.slides).toBe('Slides')
      expect(TIPO_MATERIAL_LABELS.outro).toBe('Outro')
    })

    it('cobre exatamente os tipos em TIPOS_MATERIAL', () => {
      TIPOS_MATERIAL.forEach(tipo => {
        expect(TIPO_MATERIAL_LABELS[tipo]).toBeDefined()
      })
    })
  })

  describe('STATUS_MATERIAL_LABELS', () => {
    it('contém todos os status', () => {
      expect(STATUS_MATERIAL_LABELS.pending).toBe('Pendente')
      expect(STATUS_MATERIAL_LABELS.approved).toBe('Aprovado')
      expect(STATUS_MATERIAL_LABELS.rejected).toBe('Rejeitado')
    })
  })

  describe('CURSO_LABELS', () => {
    it('mapeia cursos corretamente', () => {
      expect(CURSO_LABELS.BICTI).toBe('BICTI')
      expect(CURSO_LABELS.ENG_PROD).toBe('Eng. Produção')
      expect(CURSO_LABELS.ENG_ELET).toBe('Eng. Elétrica')
    })
  })

  describe('MAX_FILE_SIZE', () => {
    it('é 10 MB', () => {
      expect(MAX_FILE_SIZE_MB).toBe(10)
    })

    it('converte corretamente para bytes', () => {
      expect(MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024)
    })
  })

  describe('getSemestres', () => {
    it('retorna lista não vazia', () => {
      expect(getSemestres().length).toBeGreaterThan(0)
    })

    it('começa com semestres mais recentes', () => {
      const semestres = getSemestres()
      const first = semestres[0]
      const last = semestres[semestres.length - 1]
      expect(first > last).toBe(true)
    })

    it('tem formato YYYY.N', () => {
      getSemestres().forEach(s => {
        expect(s).toMatch(/^\d{4}\.[12]$/)
      })
    })

    it('inclui 2020.1 como semestre mais antigo', () => {
      const semestres = getSemestres()
      expect(semestres).toContain('2020.1')
    })

    it('inclui o ano atual', () => {
      const currentYear = new Date().getFullYear()
      const semestres = getSemestres()
      expect(semestres.some(s => s.startsWith(String(currentYear)))).toBe(true)
    })

    it('cada ano tem exatamente 2 semestres', () => {
      const semestres = getSemestres()
      const years = new Set(semestres.map(s => s.split('.')[0]))
      years.forEach(year => {
        const count = semestres.filter(s => s.startsWith(year)).length
        expect(count).toBe(2)
      })
    })
  })
})
