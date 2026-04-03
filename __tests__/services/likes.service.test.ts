const mockDoc = jest.fn()
const mockGetDoc = jest.fn()
const mockSetDoc = jest.fn()
const mockDeleteDoc = jest.fn()
const mockUpdateDoc = jest.fn()
const mockIncrement = jest.fn((n: number) => n)

jest.mock('firebase/firestore', () => ({
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  increment: (n: number) => mockIncrement(n),
}))

jest.mock('@/lib/firebase/config', () => ({
  db: { _settings: {} },
}))

import { isLiked, addLike, removeLike } from '@/services/likes.service'

beforeEach(() => {
  jest.clearAllMocks()
  mockDoc.mockReturnValue('doc-ref')
})

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

describe('addLike', () => {
  it('cria documento de like e incrementa likesCount', async () => {
    mockSetDoc.mockResolvedValue(undefined)
    mockUpdateDoc.mockResolvedValue(undefined)

    await addLike('mat-1', 'uid-1')

    expect(mockSetDoc).toHaveBeenCalledTimes(1)
    const likeData = mockSetDoc.mock.calls[0][1]
    expect(likeData.likedAt).toBeInstanceOf(Date)

    expect(mockUpdateDoc).toHaveBeenCalledTimes(1)
    const updateData = mockUpdateDoc.mock.calls[0][1]
    expect(updateData.likesCount).toBe(1)
  })
})

describe('removeLike', () => {
  it('remove documento de like e decrementa likesCount', async () => {
    mockDeleteDoc.mockResolvedValue(undefined)
    mockUpdateDoc.mockResolvedValue(undefined)

    await removeLike('mat-1', 'uid-1')

    expect(mockDeleteDoc).toHaveBeenCalledTimes(1)
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1)
    const updateData = mockUpdateDoc.mock.calls[0][1]
    expect(updateData.likesCount).toBe(-1)
  })
})
