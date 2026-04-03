const mockDoc = jest.fn()
const mockGetDoc = jest.fn()
const mockSetDoc = jest.fn()
const mockDeleteDoc = jest.fn()
const mockGetDocs = jest.fn()
const mockCollection = jest.fn()

jest.mock('firebase/firestore', () => ({
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  collection: (...args: any[]) => mockCollection(...args),
}))

jest.mock('@/lib/firebase/config', () => ({
  db: { _settings: {} },
}))

import { isFavorite, addFavorite, removeFavorite, getFavoriteIds } from '@/services/favorites.service'

beforeEach(() => {
  jest.clearAllMocks()
  mockDoc.mockReturnValue('doc-ref')
  mockCollection.mockReturnValue('col-ref')
})

describe('isFavorite', () => {
  it('retorna true quando o documento existe', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => true })
    expect(await isFavorite('uid-1', 'mat-1')).toBe(true)
  })

  it('retorna false quando o documento não existe', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false })
    expect(await isFavorite('uid-1', 'mat-1')).toBe(false)
  })

  it('retorna false em caso de erro', async () => {
    mockGetDoc.mockRejectedValue(new Error('Offline'))
    expect(await isFavorite('uid-1', 'mat-1')).toBe(false)
  })
})

describe('addFavorite', () => {
  it('chama setDoc com savedAt', async () => {
    mockSetDoc.mockResolvedValue(undefined)

    await addFavorite('uid-1', 'mat-1')

    expect(mockSetDoc).toHaveBeenCalledTimes(1)
    const data = mockSetDoc.mock.calls[0][1]
    expect(data.savedAt).toBeInstanceOf(Date)
  })
})

describe('removeFavorite', () => {
  it('chama deleteDoc', async () => {
    mockDeleteDoc.mockResolvedValue(undefined)

    await removeFavorite('uid-1', 'mat-1')

    expect(mockDeleteDoc).toHaveBeenCalledTimes(1)
  })
})

describe('getFavoriteIds', () => {
  it('retorna lista de IDs dos favoritos', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [{ id: 'mat-1' }, { id: 'mat-2' }, { id: 'mat-3' }],
    })

    const result = await getFavoriteIds('uid-1')
    expect(result).toEqual(['mat-1', 'mat-2', 'mat-3'])
  })

  it('retorna array vazio em caso de erro', async () => {
    mockGetDocs.mockRejectedValue(new Error('Offline'))
    const result = await getFavoriteIds('uid-1')
    expect(result).toEqual([])
  })

  it('retorna array vazio quando sem favoritos', async () => {
    mockGetDocs.mockResolvedValue({ docs: [] })
    const result = await getFavoriteIds('uid-1')
    expect(result).toEqual([])
  })
})
