const mockCollection = jest.fn()
const mockAddDoc = jest.fn()
const mockGetDocs = jest.fn()
const mockDeleteDoc = jest.fn()
const mockDoc = jest.fn()
const mockQuery = jest.fn()
const mockOrderBy = jest.fn()

jest.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  doc: (...args: any[]) => mockDoc(...args),
  query: (...args: any[]) => mockQuery(...args),
  orderBy: (...args: any[]) => mockOrderBy(...args),
}))

jest.mock('@/lib/firebase/config', () => ({
  db: { _settings: {} },
}))

import { getComments, addComment, deleteComment } from '@/services/comments.service'

function makeCommentSnap(id: string, data: Record<string, any>) {
  return {
    id,
    data: () => ({
      materialId: data.materialId ?? 'mat-1',
      authorId: data.authorId ?? 'uid-1',
      authorName: data.authorName ?? 'Aluno',
      authorPhotoURL: data.authorPhotoURL,
      text: data.text ?? 'Ótimo material!',
      createdAt: { toDate: () => new Date('2024-03-01') },
      ...data,
    }),
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockCollection.mockReturnValue('comments-ref')
  mockDoc.mockReturnValue('doc-ref')
  mockQuery.mockImplementation((...args: any[]) => args[0])
  mockOrderBy.mockReturnValue('order-clause')
})

describe('getComments', () => {
  it('retorna lista de comentários', async () => {
    const docs = [
      makeCommentSnap('c1', { text: 'Muito bom!' }),
      makeCommentSnap('c2', { text: 'Ajudou bastante.' }),
    ]
    mockGetDocs.mockResolvedValue({ docs })

    const result = await getComments('mat-1')
    expect(result).toHaveLength(2)
    expect(result[0].text).toBe('Muito bom!')
    expect(result[0].id).toBe('c1')
  })

  it('converte createdAt para Date', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [makeCommentSnap('c1', {})],
    })

    const result = await getComments('mat-1')
    expect(result[0].createdAt).toBeInstanceOf(Date)
  })

  it('retorna array vazio em caso de erro', async () => {
    mockGetDocs.mockRejectedValue(new Error('Offline'))
    const result = await getComments('mat-1')
    expect(result).toEqual([])
  })

  it('retorna array vazio quando sem comentários', async () => {
    mockGetDocs.mockResolvedValue({ docs: [] })
    const result = await getComments('mat-1')
    expect(result).toEqual([])
  })
})

describe('addComment', () => {
  it('cria um comentário com os dados corretos', async () => {
    mockAddDoc.mockResolvedValue({ id: 'new-comment-id' })

    const result = await addComment('mat-1', 'uid-1', 'Aluno', undefined, 'Ótimo material!')

    expect(mockAddDoc).toHaveBeenCalledTimes(1)
    const data = mockAddDoc.mock.calls[0][1]
    expect(data.materialId).toBe('mat-1')
    expect(data.authorId).toBe('uid-1')
    expect(data.authorName).toBe('Aluno')
    expect(data.text).toBe('Ótimo material!')
    expect(data.createdAt).toBeInstanceOf(Date)
    expect(result.id).toBe('new-comment-id')
  })

  it('faz trim no texto do comentário', async () => {
    mockAddDoc.mockResolvedValue({ id: 'c1' })

    await addComment('mat-1', 'uid-1', 'Aluno', undefined, '  texto com espaços  ')

    const data = mockAddDoc.mock.calls[0][1]
    expect(data.text).toBe('texto com espaços')
  })

  it('lança erro quando Firestore falha', async () => {
    mockAddDoc.mockRejectedValue(new Error('Permission denied'))
    await expect(
      addComment('mat-1', 'uid-1', 'Aluno', undefined, 'Texto')
    ).rejects.toThrow()
  })
})

describe('deleteComment', () => {
  it('chama deleteDoc com a referência correta', async () => {
    mockDeleteDoc.mockResolvedValue(undefined)

    await deleteComment('mat-1', 'c1')

    expect(mockDeleteDoc).toHaveBeenCalledTimes(1)
  })
})
