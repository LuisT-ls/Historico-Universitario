const mockDoc = jest.fn()
const mockGetDoc = jest.fn()
const mockRunTransaction = jest.fn()

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

import { isLiked, addLike, removeLike } from '@/services/likes.service'

beforeEach(() => {
  jest.clearAllMocks()
  mockDoc.mockReturnValue('doc-ref')
  mockRunTransaction.mockImplementation(async (_db: any, fn: any) => fn(mockTx))
})

// ─── isLiked ─────────────────────────────────────────────────────────────────

describe('isLiked', () => {
  it('retorna true quando o documento existe', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => true })
    expect(await isLiked('mat-1', 'uid-1')).toBe(true)
  })

  it('retorna false quando o documento não existe', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false })
    expect(await isLiked('mat-1', 'uid-1')).toBe(false)
  })

  it('retorna false em caso de erro', async () => {
    mockGetDoc.mockRejectedValue(new Error('Offline'))
    expect(await isLiked('mat-1', 'uid-1')).toBe(false)
  })
})

// ─── addLike ──────────────────────────────────────────────────────────────────

describe('addLike', () => {
  it('cria documento de like e incrementa likesCount atomicamente', async () => {
    mockTxGet
      .mockResolvedValueOnce({ exists: () => false })               // like doc: não existe
      .mockResolvedValueOnce({ data: () => ({ likesCount: 3 }) })   // material doc

    await addLike('mat-1', 'uid-1')

    expect(mockRunTransaction).toHaveBeenCalledTimes(1)
    expect(mockTxSet).toHaveBeenCalledTimes(1)
    const likeData = mockTxSet.mock.calls[0][1]
    expect(likeData.likedAt).toBeInstanceOf(Date)

    expect(mockTxUpdate).toHaveBeenCalledTimes(1)
    const updateData = mockTxUpdate.mock.calls[0][1]
    expect(updateData.likesCount).toBe(4)
  })

  it('é idempotente: não duplica like se já existir', async () => {
    mockTxGet.mockResolvedValueOnce({ exists: () => true }) // like já existe

    await addLike('mat-1', 'uid-1')

    expect(mockTxSet).not.toHaveBeenCalled()
    expect(mockTxUpdate).not.toHaveBeenCalled()
  })

  it('usa 0 como likesCount inicial quando campo não existe no material', async () => {
    mockTxGet
      .mockResolvedValueOnce({ exists: () => false })
      .mockResolvedValueOnce({ data: () => ({}) }) // sem likesCount

    await addLike('mat-1', 'uid-1')

    const updateData = mockTxUpdate.mock.calls[0][1]
    expect(updateData.likesCount).toBe(1)
  })
})

// ─── removeLike ───────────────────────────────────────────────────────────────

describe('removeLike', () => {
  it('remove documento de like e decrementa likesCount atomicamente', async () => {
    mockTxGet
      .mockResolvedValueOnce({ exists: () => true })                // like existe
      .mockResolvedValueOnce({ data: () => ({ likesCount: 5 }) })   // material doc

    await removeLike('mat-1', 'uid-1')

    expect(mockRunTransaction).toHaveBeenCalledTimes(1)
    expect(mockTxDelete).toHaveBeenCalledTimes(1)

    expect(mockTxUpdate).toHaveBeenCalledTimes(1)
    const updateData = mockTxUpdate.mock.calls[0][1]
    expect(updateData.likesCount).toBe(4)
  })

  it('é idempotente: não faz nada se like não existir', async () => {
    mockTxGet.mockResolvedValueOnce({ exists: () => false }) // like não existe

    await removeLike('mat-1', 'uid-1')

    expect(mockTxDelete).not.toHaveBeenCalled()
    expect(mockTxUpdate).not.toHaveBeenCalled()
  })

  it('garante que likesCount não vai abaixo de 0', async () => {
    mockTxGet
      .mockResolvedValueOnce({ exists: () => true })
      .mockResolvedValueOnce({ data: () => ({ likesCount: 0 }) }) // já em 0

    await removeLike('mat-1', 'uid-1')

    const updateData = mockTxUpdate.mock.calls[0][1]
    expect(updateData.likesCount).toBe(0)
  })
})
