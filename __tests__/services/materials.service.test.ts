import type { Material } from '@/types'

jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}))

jest.mock('@/services/storage.service', () => ({
  deleteFile: jest.fn().mockResolvedValue(undefined),
}))

const mockCollection = jest.fn()
const mockDoc = jest.fn()
const mockGetDocs = jest.fn()
const mockGetDoc = jest.fn()
const mockAddDoc = jest.fn()
const mockUpdateDoc = jest.fn()
const mockDeleteDoc = jest.fn()
const mockQuery = jest.fn()
const mockWhere = jest.fn()
const mockIncrement = jest.fn((n: number) => n)

jest.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  doc: (...args: any[]) => mockDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: (...args: any[]) => mockWhere(...args),
  increment: (n: number) => mockIncrement(n),
}))

jest.mock('@/lib/firebase/config', () => ({
  db: { _settings: {} },
}))

import {
  getMateriais,
  getMaterialById,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  incrementDownloads,
  incrementViews,
  getRelatedMateriais,
  getDisciplinas,
} from '@/services/materials.service'

// ─── helpers ────────────────────────────────────────────────────────────────

function makeDocSnap(id: string, data: Partial<Material> & Record<string, any>) {
  return {
    id,
    exists: () => true,
    data: () => ({
      titulo: data.titulo ?? 'Título',
      descricao: data.descricao,
      curso: data.curso ?? 'BICTI',
      disciplina: data.disciplina ?? 'Cálculo A',
      semestre: data.semestre ?? '2024.1',
      tipo: data.tipo ?? 'lista',
      status: data.status ?? 'approved',
      uploadedBy: data.uploadedBy ?? 'uid-1',
      uploaderName: data.uploaderName ?? 'Aluno',
      arquivoURL: data.arquivoURL ?? 'https://storage.example.com/file.pdf',
      storagePath: data.storagePath ?? 'materiais/uid-1/file.pdf',
      nomeArquivo: data.nomeArquivo ?? 'file.pdf',
      sizeBytes: data.sizeBytes ?? 1024,
      downloadsCount: data.downloadsCount ?? 0,
      viewsCount: data.viewsCount ?? 0,
      likesCount: data.likesCount ?? 0,
      createdAt: { toDate: () => new Date('2024-03-01') },
      updatedAt: { toDate: () => new Date('2024-03-01') },
      ...data,
    }),
  }
}

function makeSnapshot(docs: ReturnType<typeof makeDocSnap>[]) {
  return { docs }
}

// ─── testes ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  mockCollection.mockReturnValue('materiais-ref')
  mockDoc.mockReturnValue('doc-ref')
  mockQuery.mockImplementation((...args: any[]) => args[0])
  mockWhere.mockReturnValue('where-clause')
})

describe('getMateriais', () => {
  it('retorna lista de materiais aprovados', async () => {
    const docs = [
      makeDocSnap('m1', { titulo: 'Lista 1', status: 'approved' }),
      makeDocSnap('m2', { titulo: 'Lista 2', status: 'approved' }),
    ]
    mockGetDocs.mockResolvedValue(makeSnapshot(docs))

    const result = await getMateriais()
    expect(result).toHaveLength(2)
    expect(result[0].titulo).toBe('Lista 1')
  })

  it('filtra por curso', async () => {
    const docs = [
      makeDocSnap('m1', { curso: 'BICTI' }),
      makeDocSnap('m2', { curso: 'ENG_PROD' }),
    ]
    mockGetDocs.mockResolvedValue(makeSnapshot(docs))

    const result = await getMateriais({ curso: 'BICTI' })
    expect(result).toHaveLength(1)
    expect(result[0].curso).toBe('BICTI')
  })

  it('filtra por tipo', async () => {
    const docs = [
      makeDocSnap('m1', { tipo: 'prova' }),
      makeDocSnap('m2', { tipo: 'resumo' }),
    ]
    mockGetDocs.mockResolvedValue(makeSnapshot(docs))

    const result = await getMateriais({ tipo: 'prova' })
    expect(result).toHaveLength(1)
    expect(result[0].tipo).toBe('prova')
  })

  it('filtra por busca no título', async () => {
    const docs = [
      makeDocSnap('m1', { titulo: 'Lista de Cálculo', disciplina: 'Matematica' }),
      makeDocSnap('m2', { titulo: 'Prova de Biologia', disciplina: 'Biologia' }),
    ]
    mockGetDocs.mockResolvedValue(makeSnapshot(docs))

    const result = await getMateriais({ search: 'cálculo' })
    expect(result).toHaveLength(1)
    expect(result[0].titulo).toBe('Lista de Cálculo')
  })

  it('filtra por busca na disciplina', async () => {
    const docs = [
      makeDocSnap('m1', { titulo: 'Lista 1', disciplina: 'Física Básica' }),
      makeDocSnap('m2', { titulo: 'Lista 2', disciplina: 'Algebra Linear' }),
    ]
    mockGetDocs.mockResolvedValue(makeSnapshot(docs))

    const result = await getMateriais({ search: 'física' })
    expect(result).toHaveLength(1)
    expect(result[0].disciplina).toBe('Física Básica')
  })

  it('ordena por mais recentes por padrão', async () => {
    const docs = [
      makeDocSnap('m1', { titulo: 'Antigo', createdAt: { toDate: () => new Date('2023-01-01') } as any }),
      makeDocSnap('m2', { titulo: 'Recente', createdAt: { toDate: () => new Date('2024-06-01') } as any }),
    ]
    mockGetDocs.mockResolvedValue(makeSnapshot(docs))

    const result = await getMateriais()
    expect(result[0].titulo).toBe('Recente')
    expect(result[1].titulo).toBe('Antigo')
  })

  it('lança erro quando Firestore falha', async () => {
    mockGetDocs.mockRejectedValue(new Error('Network error'))
    await expect(getMateriais()).rejects.toThrow()
  })
})

describe('getMaterialById', () => {
  it('retorna o material quando encontrado', async () => {
    mockGetDoc.mockResolvedValue(makeDocSnap('m1', { titulo: 'Lista Final' }))

    const result = await getMaterialById('m1')
    expect(result).not.toBeNull()
    expect(result!.titulo).toBe('Lista Final')
  })

  it('retorna null quando não encontrado', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false, data: () => null })

    const result = await getMaterialById('inexistente')
    expect(result).toBeNull()
  })
})

describe('addMaterial', () => {
  it('cria um material com status approved e downloadsCount 0', async () => {
    mockAddDoc.mockResolvedValue({ id: 'new-id' })

    await addMaterial(
      {
        titulo: 'Novo Material',
        curso: 'BICTI',
        disciplina: 'Cálculo A',
        semestre: '2024.1',
        tipo: 'resumo',
        uploadedBy: 'uid-1' as any,
        uploaderName: 'Aluno',
        arquivoURL: 'https://example.com/file.pdf',
        storagePath: 'materiais/uid-1/file.pdf',
        nomeArquivo: 'file.pdf',
      },
      'uid-1' as any
    )

    expect(mockAddDoc).toHaveBeenCalledTimes(1)
    const callData = mockAddDoc.mock.calls[0][1]
    expect(callData.status).toBe('approved')
    expect(callData.downloadsCount).toBe(0)
  })
})

describe('updateMaterial', () => {
  it('atualiza metadados com updatedAt', async () => {
    mockUpdateDoc.mockResolvedValue(undefined)

    await updateMaterial('m1', {
      titulo: 'Título Atualizado',
      curso: 'BICTI',
      disciplina: 'Cálculo B',
      semestre: '2024.2',
      tipo: 'slides',
    })

    expect(mockUpdateDoc).toHaveBeenCalledTimes(1)
    const data = mockUpdateDoc.mock.calls[0][1]
    expect(data.titulo).toBe('Título Atualizado')
    expect(data.updatedAt).toBeInstanceOf(Date)
  })
})

describe('deleteMaterial', () => {
  it('remove o arquivo do Storage e o documento do Firestore', async () => {
    const { deleteFile } = require('@/services/storage.service')
    mockDeleteDoc.mockResolvedValue(undefined)

    await deleteMaterial('m1', 'materiais/uid-1/file.pdf')

    expect(deleteFile).toHaveBeenCalledWith('materiais/uid-1/file.pdf')
    expect(mockDeleteDoc).toHaveBeenCalledTimes(1)
  })
})

describe('incrementDownloads', () => {
  it('incrementa o campo downloadsCount', async () => {
    mockUpdateDoc.mockResolvedValue(undefined)

    await incrementDownloads('m1')

    expect(mockUpdateDoc).toHaveBeenCalledTimes(1)
    const data = mockUpdateDoc.mock.calls[0][1]
    expect(data.downloadsCount).toBe(1)
  })

  it('não lança erro em caso de falha (falha silenciosa)', async () => {
    mockUpdateDoc.mockRejectedValue(new Error('Offline'))
    await expect(incrementDownloads('m1')).resolves.not.toThrow()
  })
})

describe('incrementViews', () => {
  it('incrementa o campo viewsCount', async () => {
    mockUpdateDoc.mockResolvedValue(undefined)

    await incrementViews('m1')

    expect(mockUpdateDoc).toHaveBeenCalledTimes(1)
    const data = mockUpdateDoc.mock.calls[0][1]
    expect(data.viewsCount).toBe(1)
  })

  it('não lança erro em caso de falha', async () => {
    mockUpdateDoc.mockRejectedValue(new Error('Offline'))
    await expect(incrementViews('m1')).resolves.not.toThrow()
  })
})

describe('getRelatedMateriais', () => {
  it('exclui o material atual da lista', async () => {
    const docs = [
      makeDocSnap('m1', { disciplina: 'Cálculo A' }),
      makeDocSnap('m2', { disciplina: 'Cálculo A' }),
    ]
    mockGetDocs.mockResolvedValue(makeSnapshot(docs))

    const result = await getRelatedMateriais('Cálculo A', 'm1')
    expect(result.every(m => m.id !== 'm1')).toBe(true)
    expect(result).toHaveLength(1)
  })

  it('limita a 4 materiais', async () => {
    const docs = Array.from({ length: 6 }, (_, i) =>
      makeDocSnap(`m${i}`, { disciplina: 'Cálculo A', downloadsCount: i })
    )
    mockGetDocs.mockResolvedValue(makeSnapshot(docs))

    const result = await getRelatedMateriais('Cálculo A', 'm99')
    expect(result.length).toBeLessThanOrEqual(4)
  })

  it('ordena por downloads (mais baixados primeiro)', async () => {
    const docs = [
      makeDocSnap('m1', { disciplina: 'Cálculo A', downloadsCount: 5 }),
      makeDocSnap('m2', { disciplina: 'Cálculo A', downloadsCount: 20 }),
      makeDocSnap('m3', { disciplina: 'Cálculo A', downloadsCount: 1 }),
    ]
    mockGetDocs.mockResolvedValue(makeSnapshot(docs))

    const result = await getRelatedMateriais('Cálculo A', 'm99')
    expect(result[0].downloadsCount).toBe(20)
  })

  it('retorna array vazio em caso de erro', async () => {
    mockGetDocs.mockRejectedValue(new Error('Offline'))
    const result = await getRelatedMateriais('Cálculo A', 'm1')
    expect(result).toEqual([])
  })
})

describe('getDisciplinas', () => {
  it('retorna disciplinas únicas e ordenadas', async () => {
    const docs = [
      makeDocSnap('m1', { disciplina: 'Física Básica' }),
      makeDocSnap('m2', { disciplina: 'Cálculo A' }),
      makeDocSnap('m3', { disciplina: 'Cálculo A' }),
    ]
    mockGetDocs.mockResolvedValue(makeSnapshot(docs))

    const result = await getDisciplinas()
    expect(result).toHaveLength(2)
    expect(result[0]).toBe('Cálculo A')
    expect(result[1]).toBe('Física Básica')
  })

  it('retorna array vazio em caso de erro', async () => {
    mockGetDocs.mockRejectedValue(new Error('Offline'))
    const result = await getDisciplinas()
    expect(result).toEqual([])
  })
})
