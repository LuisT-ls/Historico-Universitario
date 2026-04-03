const mockCollection = jest.fn()
const mockDoc = jest.fn()
const mockGetDocs = jest.fn()
const mockDeleteDoc = jest.fn()
const mockQuery = jest.fn()
const mockOrderBy = jest.fn()

jest.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  doc: (...args: any[]) => mockDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  query: (...args: any[]) => mockQuery(...args),
  orderBy: (...args: any[]) => mockOrderBy(...args),
}))

jest.mock('@/lib/firebase/config', () => ({
  db: { _settings: {} },
}))

import { getReports, dismissReport } from '@/services/reports.service'

function makeReportSnap(id: string, data: Record<string, any> = {}) {
  return {
    id,
    data: () => ({
      materialId: 'mat-1',
      materialTitle: 'Lista Final',
      reportedBy: 'uid-1',
      reason: 'Conteúdo incorreto ou desatualizado',
      details: null,
      createdAt: { toDate: () => new Date('2024-04-01') },
      ...data,
    }),
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockCollection.mockReturnValue('reports-ref')
  mockDoc.mockReturnValue('doc-ref')
  mockQuery.mockImplementation((...args: any[]) => args[0])
  mockOrderBy.mockReturnValue('order-clause')
})

describe('getReports', () => {
  it('retorna lista de denúncias mapeada corretamente', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        makeReportSnap('r1', { reason: 'Material duplicado', reporterName: 'João' }),
        makeReportSnap('r2', { reason: 'Conteúdo inapropriado', reporterName: 'Maria' }),
      ],
    })

    const result = await getReports()
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('r1')
    expect(result[0].reason).toBe('Material duplicado')
    expect(result[0].reporterName).toBe('João')
    expect(result[1].reporterName).toBe('Maria')
  })

  it('mapeia campos corretamente', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        makeReportSnap('r1', {
          materialId: 'mat-abc',
          materialTitle: 'Prova Final',
          reportedBy: 'uid-99',
          details: 'Mais detalhes',
        }),
      ],
    })

    const result = await getReports()
    const r = result[0]
    expect(r.materialId).toBe('mat-abc')
    expect(r.materialTitle).toBe('Prova Final')
    expect(r.reportedBy).toBe('uid-99')
    expect(r.details).toBe('Mais detalhes')
    expect(r.createdAt).toBeInstanceOf(Date)
  })

  it('retorna array vazio quando não há denúncias', async () => {
    mockGetDocs.mockResolvedValue({ docs: [] })
    const result = await getReports()
    expect(result).toEqual([])
  })

  it('retorna array vazio em caso de erro', async () => {
    mockGetDocs.mockRejectedValue(new Error('Offline'))
    const result = await getReports()
    expect(result).toEqual([])
  })

  it('trata reporterName ausente como undefined', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [makeReportSnap('r1', { reporterName: undefined })],
    })
    const result = await getReports()
    expect(result[0].reporterName).toBeUndefined()
  })
})

describe('dismissReport', () => {
  it('chama deleteDoc com o doc correto', async () => {
    mockDeleteDoc.mockResolvedValue(undefined)

    await dismissReport('r1')

    expect(mockDeleteDoc).toHaveBeenCalledTimes(1)
  })

  it('não lança erro quando chamado com ID válido', async () => {
    mockDeleteDoc.mockResolvedValue(undefined)
    await expect(dismissReport('r1')).resolves.not.toThrow()
  })
})
