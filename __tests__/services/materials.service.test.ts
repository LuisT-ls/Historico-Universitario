import type { Material } from '@/types'

jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}))

jest.mock('@/services/storage.service', () => ({
  deleteFile: jest.fn().mockResolvedValue(undefined),
}))

import * as storageServiceModule from '@/services/storage.service'

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
  getMeusMateriais,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  incrementDownloads,
  incrementViews,
  getRelatedMateriais,
  getDisciplinas,
  getAllMateriais,
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
  // restore deleteFile default after clearAllMocks
  jest.mocked(storageServiceModule.deleteFile).mockResolvedValue(undefined)
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

  it('filtra por lista de cursos (cursos[])', async () => {
    const docs = [
      makeDocSnap('m1', { curso: 'BICTI' }),
      makeDocSnap('m2', { curso: 'ENG_PROD' }),
      makeDocSnap('m3', { curso: 'BI_HUM' }),
    ]
    mockGetDocs.mockResolvedValue(makeSnapshot(docs))

    const result = await getMateriais({ cursos: ['BICTI', 'BI_HUM'] })
    expect(result).toHaveLength(2)
    expect(result.map(m => m.curso)).toEqual(expect.arrayContaining(['BICTI', 'BI_HUM']))
  })

  it('não aplica filtro cursos quando o array está vazio', async () => {
    const docs = [
      makeDocSnap('m1', { curso: 'BICTI' }),
      makeDocSnap('m2', { curso: 'ENG_PROD' }),
    ]
    mockGetDocs.mockResolvedValue(makeSnapshot(docs))

    const result = await getMateriais({ cursos: [] })
    expect(result).toHaveLength(2)
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

  it('filtra por semestre', async () => {
    const docs = [
      makeDocSnap('m1', { semestre: '2024.1' }),
      makeDocSnap('m2', { semestre: '2024.2' }),
    ]
    mockGetDocs.mockResolvedValue(makeSnapshot(docs))

    const result = await getMateriais({ semestre: '2024.1' })
    expect(result).toHaveLength(1)
    expect(result[0].semestre).toBe('2024.1')
  })

  it('filtra por disciplina (case-insensitive, parcial)', async () => {
    const docs = [
      makeDocSnap('m1', { disciplina: 'Cálculo A' }),
      makeDocSnap('m2', { disciplina: 'Álgebra Linear' }),
    ]
    mockGetDocs.mockResolvedValue(makeSnapshot(docs))

    const result = await getMateriais({ disciplina: 'cálculo' })
    expect(result).toHaveLength(1)
    expect(result[0].disciplina).toBe('Cálculo A')
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
    const createdAtOld: any = { toDate: () => new Date('2023-01-01') }
    const createdAtNew: any = { toDate: () => new Date('2024-06-01') }
    const docs = [
      makeDocSnap('m1', { titulo: 'Antigo', createdAt: createdAtOld }),
      makeDocSnap('m2', { titulo: 'Recente', createdAt: createdAtNew }),
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

  it('lança erro quando Firestore não está inicializado', async () => {
    jest.resetModules()
    jest.doMock('@/lib/firebase/config', () => ({ db: null }))
    const { getMaterialById: getMaterialByIdNoDb } = require('@/services/materials.service')
    await expect(getMaterialByIdNoDb('m1')).rejects.toThrow('Firestore não inicializado')
    jest.dontMock('@/lib/firebase/config')
  })

  it('lança erro quando Firestore falha', async () => {
    mockGetDoc.mockRejectedValue(new Error('Network error'))
    await expect(getMaterialById('m1')).rejects.toThrow()
  })
})

describe('getMeusMateriais', () => {
  it('retorna materiais do usuário ordenados por data', async () => {
    const createdAtOld: any = { toDate: () => new Date('2023-01-01') }
    const createdAtNew: any = { toDate: () => new Date('2024-06-01') }
    const docs = [
      makeDocSnap('m1', { uploadedBy: 'uid-1' as any, titulo: 'Antigo', createdAt: createdAtOld }),
      makeDocSnap('m2', { uploadedBy: 'uid-1' as any, titulo: 'Recente', createdAt: createdAtNew }),
    ]
    mockGetDocs.mockResolvedValue(makeSnapshot(docs))

    const result = await getMeusMateriais('uid-1')
    expect(result).toHaveLength(2)
    expect(result[0].titulo).toBe('Recente')
    expect(result[1].titulo).toBe('Antigo')
  })

  it('lança erro quando Firestore falha', async () => {
    mockGetDocs.mockRejectedValue(new Error('Permission denied'))
    await expect(getMeusMateriais('uid-1')).rejects.toThrow()
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

  it('lança erro quando Firestore falha', async () => {
    mockAddDoc.mockRejectedValue(new Error('Write failed'))
    await expect(
      addMaterial(
        {
          titulo: 'Novo',
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
    ).rejects.toThrow()
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

  it('lança erro quando Firestore falha', async () => {
    mockUpdateDoc.mockRejectedValue(new Error('Update failed'))
    await expect(
      updateMaterial('m1', {
        titulo: 'Título',
        curso: 'BICTI',
        disciplina: 'Cálculo A',
        semestre: '2024.1',
        tipo: 'resumo',
      })
    ).rejects.toThrow()
  })
})

describe('deleteMaterial', () => {
  it('remove o arquivo do Storage e o documento do Firestore', async () => {
    mockDeleteDoc.mockResolvedValue(undefined)

    await deleteMaterial('m1', 'materiais/uid-1/file.pdf')

    expect(storageServiceModule.deleteFile).toHaveBeenCalledWith('materiais/uid-1/file.pdf')
    expect(mockDeleteDoc).toHaveBeenCalledTimes(1)
  })

  it('lança erro quando deleteFile falha', async () => {
    jest.mocked(storageServiceModule.deleteFile).mockRejectedValueOnce(new Error('Storage error'))
    await expect(deleteMaterial('m1', 'materiais/uid-1/file.pdf')).rejects.toThrow('Storage error')
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

describe('getAllMateriais', () => {
  it('retorna todos os materiais sem filtro de status, ordenados por data', async () => {
    const createdAtOld: any = { toDate: () => new Date('2023-01-01') }
    const createdAtNew: any = { toDate: () => new Date('2024-06-01') }
    const docs = [
      makeDocSnap('m1', { titulo: 'Antigo', status: 'pending', createdAt: createdAtOld }),
      makeDocSnap('m2', { titulo: 'Aprovado', status: 'approved', createdAt: createdAtNew }),
    ]
    mockGetDocs.mockResolvedValue(makeSnapshot(docs))

    const result = await getAllMateriais()
    expect(result).toHaveLength(2)
    expect(result[0].titulo).toBe('Aprovado')
    expect(result[1].titulo).toBe('Antigo')
  })

  it('lança erro quando Firestore falha', async () => {
    mockGetDocs.mockRejectedValue(new Error('Permission denied'))
    await expect(getAllMateriais()).rejects.toThrow()
  })
})
