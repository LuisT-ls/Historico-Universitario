import { parseCertificadoPDF } from '@/lib/certificate-ocr'

const mockExtractTextFromPDF = jest.fn()

jest.mock('@/lib/pdf-parser', () => ({
    extractTextFromPDF: (...args: any[]) => mockExtractTextFromPDF(...args),
}))

// jsdom doesn't implement File.arrayBuffer() — use a minimal stub instead
const makeFile = () => ({
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
} as unknown as File)

beforeEach(() => {
    jest.clearAllMocks()
})

// ===== parseCargaHoraria — via parseCertificadoPDF =====

describe('parseCargaHoraria (via parseCertificadoPDF)', () => {
    it('extracts carga horária from "carga horária: N" pattern', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Carga Horária: 40 horas')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.cargaHoraria).toBe(40)
        expect(result.camposEncontrados).toContain('cargaHoraria')
    })

    it('extracts from "duração: Nh" pattern', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Duração: 20h de atividades')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.cargaHoraria).toBe(20)
    })

    it('extracts from "total: N horas" pattern', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Total: 60 horas de conteúdo')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.cargaHoraria).toBe(60)
    })

    it('extracts from "N horas/aula" pattern', async () => {
        mockExtractTextFromPDF.mockResolvedValue('30 horas/aula presenciais')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.cargaHoraria).toBe(30)
    })

    it('extracts from standalone "N horas" pattern', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Certificamos a participação em 10 horas de atividade.')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.cargaHoraria).toBe(10)
    })

    it('extracts from short "Nh" pattern', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Certificado de 8h')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.cargaHoraria).toBe(8)
    })

    it('returns undefined and does not add field when no hours found', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Este certificado não menciona duração.')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.cargaHoraria).toBeUndefined()
        expect(result.camposEncontrados).not.toContain('cargaHoraria')
    })
})

// ===== parseDates — via parseCertificadoPDF =====

describe('parseDates (via parseCertificadoPDF)', () => {
    it('extracts start and end dates from numeric DD/MM/YYYY format', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Realizado de 01/03/2024 a 15/03/2024.')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.dataInicio).toBe('2024-03-01')
        expect(result.dataFim).toBe('2024-03-15')
        expect(result.camposEncontrados).toContain('dataInicio')
        expect(result.camposEncontrados).toContain('dataFim')
    })

    it('extracts dates from DD-MM-YYYY format', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Período: 10-06-2023 a 20-06-2023')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.dataInicio).toBe('2023-06-10')
        expect(result.dataFim).toBe('2023-06-20')
    })

    it('extracts dates from DD.MM.YYYY format', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Evento: 05.08.2022 a 07.08.2022')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.dataInicio).toBe('2022-08-05')
        expect(result.dataFim).toBe('2022-08-07')
    })

    it('extracts dates from written Brazilian format', async () => {
        // \w+ only matches ASCII, so use unaccented "marco" as the code supports
        mockExtractTextFromPDF.mockResolvedValue('Realizado em 10 de marco de 2024 a 15 de junho de 2024.')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.dataInicio).toBe('2024-03-10')
        expect(result.dataFim).toBe('2024-06-15')
    })

    it('sets same dataInicio and dataFim for single date', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Realizado em 20/07/2024.')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.dataInicio).toBe('2024-07-20')
        expect(result.dataFim).toBe('2024-07-20')
        // dataFim === dataInicio, so only dataInicio should be in camposEncontrados
        expect(result.camposEncontrados).toContain('dataInicio')
        expect(result.camposEncontrados).not.toContain('dataFim')
    })

    it('ignores dates outside 2000–2099 range', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Data histórica: 15/06/1999 e 20/06/2100')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.dataInicio).toBeUndefined()
        expect(result.dataFim).toBeUndefined()
    })

    it('returns no dates when text has none', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Certificado sem datas.')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.dataInicio).toBeUndefined()
        expect(result.dataFim).toBeUndefined()
    })

    it('sorts multiple dates and picks earliest as dataInicio', async () => {
        mockExtractTextFromPDF.mockResolvedValue('15/12/2024 e 10/01/2024 e 20/06/2024')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.dataInicio).toBe('2024-01-10')
        expect(result.dataFim).toBe('2024-12-15')
    })

    it('handles all Portuguese month names', async () => {
        const months = [
            ['janeiro', '01'], ['fevereiro', '02'], ['marco', '03'], ['abril', '04'],
            ['maio', '05'], ['junho', '06'], ['julho', '07'], ['agosto', '08'],
            ['setembro', '09'], ['outubro', '10'], ['novembro', '11'], ['dezembro', '12'],
        ]
        for (const [month, num] of months) {
            mockExtractTextFromPDF.mockResolvedValue(`1 de ${month} de 2024`)
            const result = await parseCertificadoPDF(makeFile())
            expect(result.dataInicio).toBe(`2024-${num}-01`)
        }
    })
})

// ===== parseTitulo — via parseCertificadoPDF =====

describe('parseTitulo (via parseCertificadoPDF)', () => {
    it('extracts title after "participou do curso" verb pattern', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Certificamos que o aluno participou do curso: Python para Iniciantes')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.titulo).toContain('Python para Iniciantes')
        expect(result.camposEncontrados).toContain('titulo')
    })

    it('extracts title after "concluiu" verb pattern', async () => {
        mockExtractTextFromPDF.mockResolvedValue('O aluno concluiu o workshop: Machine Learning na Prática')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.titulo).toContain('Machine Learning na Prática')
    })

    it('extracts title from quoted pattern', async () => {
        mockExtractTextFromPDF.mockResolvedValue('curso: "Introdução ao React"')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.titulo).toContain('Introdução ao React')
    })

    it('falls back to first line containing activity keyword', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Certificado de Participação\nWorkshop de Agilidade\nRealizado em 2024')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.titulo).toBe('Workshop de Agilidade')
    })

    it('returns undefined when no title can be found', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Texto simples sem palavras-chave de atividade acadêmica.')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.titulo).toBeUndefined()
        expect(result.camposEncontrados).not.toContain('titulo')
    })
})

// ===== parseInstituicao — via parseCertificadoPDF =====

describe('parseInstituicao (via parseCertificadoPDF)', () => {
    it('extracts institution from "promovido por" pattern', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Evento promovido por Instituto Federal da Bahia, em Salvador.')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.instituicao).toContain('Instituto Federal da Bahia')
        expect(result.camposEncontrados).toContain('instituicao')
    })

    it('extracts institution from "da Universidade" pattern', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Certificado expedido pela Universidade Federal da Bahia.')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.instituicao).toContain('Universidade Federal da Bahia')
    })

    it('extracts institution from known acronyms', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Certificado expedido pela UFBA — Universidade Federal da Bahia.')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.instituicao).toBeDefined()
    })

    it('extracts institution from "instituição: X" pattern', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Instituição: Escola de Tecnologia Digital')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.instituicao).toContain('Escola de Tecnologia Digital')
    })

    it('returns undefined when no institution can be found', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Texto simples sem menção de instituição.')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.instituicao).toBeUndefined()
        expect(result.camposEncontrados).not.toContain('instituicao')
    })
})

// ===== parseCertificadoPDF — integration =====

describe('parseCertificadoPDF integration', () => {
    it('populates all fields from a rich certificate text', async () => {
        mockExtractTextFromPDF.mockResolvedValue(`
            Certificado de Conclusão
            Certificamos que participou do curso: Desenvolvimento Web com React
            Promovido pela Universidade Federal da Bahia
            Carga Horária: 80 horas
            Período: 01/02/2024 a 28/02/2024
        `)
        const result = await parseCertificadoPDF(makeFile())
        expect(result.cargaHoraria).toBe(80)
        expect(result.dataInicio).toBe('2024-02-01')
        expect(result.dataFim).toBe('2024-02-28')
        expect(result.camposEncontrados.length).toBeGreaterThan(0)
    })

    it('returns empty camposEncontrados for unrecognized text', async () => {
        mockExtractTextFromPDF.mockResolvedValue('Lorem ipsum dolor sit amet.')
        const result = await parseCertificadoPDF(makeFile())
        expect(result.camposEncontrados).toEqual([])
        expect(result.titulo).toBeUndefined()
        expect(result.instituicao).toBeUndefined()
        expect(result.cargaHoraria).toBeUndefined()
    })

    it('handles PDF parser throwing an error', async () => {
        mockExtractTextFromPDF.mockRejectedValue(new Error('PDF corrupted'))
        await expect(parseCertificadoPDF(makeFile())).rejects.toThrow('PDF corrupted')
    })
})
