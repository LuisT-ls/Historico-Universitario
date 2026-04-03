const mockDoc = jest.fn()
const mockGetDoc = jest.fn()
const mockRunTransaction = jest.fn()

// Mock tx object used inside runTransaction callbacks
const mockTxGet = jest.fn()
const mockTxSet = jest.fn()
const mockTxUpdate = jest.fn()
const mockTxDelete = jest.fn()

const mockTx = {
  get: mockTxGet,
  set: mockTxSet,
  update: mockTxUpdate,
  delete: mockTxDelete,
}

jest.mock('firebase/firestore', () => ({
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  runTransaction: (db: any, fn: any) => mockRunTransaction(db, fn),
}))

jest.mock('@/lib/firebase/config', () => ({
  db: { _settings: {} },
}))

import { getUserRating, setRating, removeRating } from '@/services/ratings.service'

beforeEach(() => {
  jest.clearAllMocks()
  mockDoc.mockReturnValue('doc-ref')
  // Por padrão, runTransaction executa o callback com mockTx
  mockRunTransaction.mockImplementation(async (_db: any, fn: any) => fn(mockTx))
})

// ─── getUserRating ────────────────────────────────────────────────────────────

describe('getUserRating', () => {
  it('retorna o valor quando o documento existe', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ value: 4 }) })
    expect(await getUserRating('mat-1', 'uid-1')).toBe(4)
  })

  it('retorna null quando o documento não existe', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false })
    expect(await getUserRating('mat-1', 'uid-1')).toBeNull()
  })

  it('retorna null em caso de erro', async () => {
    mockGetDoc.mockRejectedValue(new Error('Offline'))
    expect(await getUserRating('mat-1', 'uid-1')).toBeNull()
  })
})

// ─── setRating ────────────────────────────────────────────────────────────────

describe('setRating — nova avaliação', () => {
  beforeEach(() => {
    // Material sem avaliações ainda; usuário sem rating anterior
    mockTxGet
      .mockResolvedValueOnce({ data: () => ({ ratingSum: 0, ratingCount: 0 }) }) // matSnap
      .mockResolvedValueOnce({ exists: () => false })                              // ratingSnap
  })

  it('chama tx.set com o valor correto', async () => {
    await setRating('mat-1', 'uid-1', 5)
    expect(mockTxSet).toHaveBeenCalledTimes(1)
    const setData = mockTxSet.mock.calls[0][1]
    expect(setData.value).toBe(5)
    expect(setData.ratedAt).toBeInstanceOf(Date)
  })

  it('calcula avg e count corretos para primeira avaliação', async () => {
    await setRating('mat-1', 'uid-1', 4)
    const updateData = mockTxUpdate.mock.calls[0][1]
    expect(updateData.ratingCount).toBe(1)
    expect(updateData.ratingSum).toBe(4)
    expect(updateData.ratingAvg).toBe(4)
  })
})

describe('setRating — atualização de avaliação existente', () => {
  beforeEach(() => {
    // Material já tem 2 avaliações (soma=8, média=4); usuário já avaliou com 3
    mockTxGet
      .mockResolvedValueOnce({ data: () => ({ ratingSum: 8, ratingCount: 2 }) })
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ value: 3 }) })
  })

  it('não altera ratingCount ao atualizar', async () => {
    await setRating('mat-1', 'uid-1', 5)
    const updateData = mockTxUpdate.mock.calls[0][1]
    expect(updateData.ratingCount).toBe(2) // mantém
  })

  it('recalcula sum e avg corretamente', async () => {
    await setRating('mat-1', 'uid-1', 5)
    // soma = 8 - 3 + 5 = 10, avg = 10/2 = 5
    const updateData = mockTxUpdate.mock.calls[0][1]
    expect(updateData.ratingSum).toBe(10)
    expect(updateData.ratingAvg).toBe(5)
  })
})

// ─── removeRating ─────────────────────────────────────────────────────────────

describe('removeRating', () => {
  it('chama tx.delete e recalcula avg', async () => {
    // Material: 3 avaliações, soma=12, média=4; usuário avaliou com 3
    mockTxGet
      .mockResolvedValueOnce({ data: () => ({ ratingSum: 12, ratingCount: 3 }) })
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ value: 3 }) })

    await removeRating('mat-1', 'uid-1')

    expect(mockTxDelete).toHaveBeenCalledTimes(1)
    const updateData = mockTxUpdate.mock.calls[0][1]
    // soma = 12 - 3 = 9, count = 2, avg = 9/2 = 4.5
    expect(updateData.ratingSum).toBe(9)
    expect(updateData.ratingCount).toBe(2)
    expect(updateData.ratingAvg).toBe(4.5)
  })

  it('não faz nada quando o usuário não tem avaliação', async () => {
    mockTxGet
      .mockResolvedValueOnce({ data: () => ({ ratingSum: 0, ratingCount: 0 }) })
      .mockResolvedValueOnce({ exists: () => false })

    await removeRating('mat-1', 'uid-1')

    expect(mockTxDelete).not.toHaveBeenCalled()
    expect(mockTxUpdate).not.toHaveBeenCalled()
  })

  it('zera avg quando removida a última avaliação', async () => {
    mockTxGet
      .mockResolvedValueOnce({ data: () => ({ ratingSum: 5, ratingCount: 1 }) })
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ value: 5 }) })

    await removeRating('mat-1', 'uid-1')

    const updateData = mockTxUpdate.mock.calls[0][1]
    expect(updateData.ratingCount).toBe(0)
    expect(updateData.ratingAvg).toBe(0)
  })
})
