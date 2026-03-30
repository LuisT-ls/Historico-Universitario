import {
    createGroup,
    getGroupsByUser,
    getGroupById,
    joinGroupByCode,
    addGroupMaterial,
    getGroupMaterials,
    deleteGroupMaterial,
    addGroupTask,
    getGroupTasks,
    updateGroupTask,
    deleteGroupTask,
} from '@/services/group.service'

jest.mock('@/lib/logger', () => ({
    logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}))

const mockDeleteFile = jest.fn()
jest.mock('@/services/storage.service', () => ({
    deleteFile: (...args: any[]) => mockDeleteFile(...args),
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
const mockOrderBy = jest.fn()
const mockArrayUnion = jest.fn()

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
    orderBy: (...args: any[]) => mockOrderBy(...args),
    arrayUnion: (...args: any[]) => mockArrayUnion(...args),
}))

jest.mock('@/lib/firebase/config', () => ({
    db: {},
}))

jest.mock('@/lib/type-constants', () => ({
    createGroupId: (id: string) => id,
    createGroupMaterialId: (id: string) => id,
    createGroupTaskId: (id: string) => id,
}))

const mockDate = new Date('2024-01-01')

const groupDocData = {
    name: 'Grupo de Cálculo',
    description: 'Grupo para estudar Cálculo I',
    ownerId: 'user123',
    members: ['user123'],
    inviteCode: 'ABC123',
    subjectCode: 'MAT001',
    createdAt: { toDate: () => mockDate },
    updatedAt: { toDate: () => mockDate },
}

const materialDocData = {
    groupId: 'group123',
    title: 'Apostila de Cálculo',
    type: 'file',
    url: 'https://storage.example.com/file.pdf',
    storagePath: 'groups/group123/file.pdf',
    sizeBytes: 1024,
    uploadedBy: 'user123',
    createdAt: { toDate: () => mockDate },
}

const taskDocData = {
    groupId: 'group123',
    title: 'Resolver exercícios',
    description: 'Capítulo 3',
    status: 'pending',
    createdBy: 'user123',
    createdAt: { toDate: () => mockDate },
    updatedAt: { toDate: () => mockDate },
    dueDate: { toDate: () => mockDate },
}

beforeEach(() => {
    jest.clearAllMocks()
    mockCollection.mockReturnValue('collectionRef')
    mockDoc.mockReturnValue('docRef')
    mockQuery.mockReturnValue('queryRef')
    mockWhere.mockReturnValue('whereClause')
    mockOrderBy.mockReturnValue('orderByClause')
    mockArrayUnion.mockImplementation((...args) => ({ arrayUnion: args }))
    mockAddDoc.mockResolvedValue({ id: 'newDoc123' })
    mockUpdateDoc.mockResolvedValue(undefined)
    mockDeleteDoc.mockResolvedValue(undefined)
    mockDeleteFile.mockResolvedValue(undefined)
})

// ===== createGroup =====

describe('createGroup', () => {
    it('cria um grupo e retorna o ID', async () => {
        mockAddDoc.mockResolvedValue({ id: 'group123' })

        const result = await createGroup({
            name: 'Grupo de Cálculo',
            description: 'Grupo para estudar Cálculo I',
            ownerId: 'user123' as any,
            subjectCode: 'MAT001',
        })

        expect(mockAddDoc).toHaveBeenCalledTimes(1)
        expect(result).toBe('group123')
    })

    it('lança erro quando addDoc falha', async () => {
        mockAddDoc.mockRejectedValue(new Error('Firestore error'))

        await expect(createGroup({
            name: 'Grupo',
            description: '',
            ownerId: 'user123' as any,
            subjectCode: '',
        })).rejects.toThrow('Firestore error')
    })
})

// ===== getGroupsByUser =====

describe('getGroupsByUser', () => {
    it('retorna lista de grupos do usuário', async () => {
        mockGetDocs.mockResolvedValue({
            forEach: (cb: (doc: any) => void) => {
                cb({ id: 'group123', data: () => groupDocData })
            },
        })

        const result = await getGroupsByUser('user123' as any)

        expect(mockGetDocs).toHaveBeenCalledTimes(1)
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('group123')
        expect(result[0].name).toBe('Grupo de Cálculo')
    })

    it('retorna lista vazia quando usuário não tem grupos', async () => {
        mockGetDocs.mockResolvedValue({ forEach: jest.fn() })

        const result = await getGroupsByUser('user123' as any)

        expect(result).toHaveLength(0)
    })

    it('lança erro quando query falha', async () => {
        mockGetDocs.mockRejectedValue(new Error('Query error'))

        await expect(getGroupsByUser('user123' as any)).rejects.toThrow('Query error')
    })
})

// ===== getGroupById =====

describe('getGroupById', () => {
    it('retorna grupo pelo ID', async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            id: 'group123',
            data: () => groupDocData,
        })

        const result = await getGroupById('group123')

        expect(result).not.toBeNull()
        expect(result!.id).toBe('group123')
        expect(result!.inviteCode).toBe('ABC123')
    })

    it('retorna null quando grupo não existe', async () => {
        mockGetDoc.mockResolvedValue({ exists: () => false })

        const result = await getGroupById('nonexistent')

        expect(result).toBeNull()
    })

    it('lança erro quando getDoc falha', async () => {
        mockGetDoc.mockRejectedValue(new Error('Not found'))

        await expect(getGroupById('group123')).rejects.toThrow('Not found')
    })
})

// ===== joinGroupByCode =====

describe('joinGroupByCode', () => {
    it('entra no grupo usando código de convite', async () => {
        mockGetDocs.mockResolvedValue({
            empty: false,
            docs: [{
                id: 'group123',
                data: () => ({ ...groupDocData, members: ['owner123'] }),
            }],
        })

        const result = await joinGroupByCode('user456' as any, 'ABC123')

        expect(mockUpdateDoc).toHaveBeenCalledTimes(1)
        expect(mockArrayUnion).toHaveBeenCalledWith('user456')
        expect(result).toBe('group123')
    })

    it('retorna ID sem atualizar se usuário já é membro', async () => {
        mockGetDocs.mockResolvedValue({
            empty: false,
            docs: [{
                id: 'group123',
                data: () => ({ ...groupDocData, members: ['user123'] }),
            }],
        })

        const result = await joinGroupByCode('user123' as any, 'ABC123')

        expect(mockUpdateDoc).not.toHaveBeenCalled()
        expect(result).toBe('group123')
    })

    it('lança erro quando código de convite é inválido', async () => {
        mockGetDocs.mockResolvedValue({ empty: true, docs: [] })

        await expect(joinGroupByCode('user123' as any, 'INVALID')).rejects.toThrow('Código de convite inválido')
    })

    it('normaliza o código para maiúsculas', async () => {
        mockGetDocs.mockResolvedValue({
            empty: false,
            docs: [{
                id: 'group123',
                data: () => ({ ...groupDocData, members: [] }),
            }],
        })

        await joinGroupByCode('user123' as any, 'abc123')

        expect(mockWhere).toHaveBeenCalledWith('inviteCode', '==', 'ABC123')
    })
})

// ===== addGroupMaterial =====

describe('addGroupMaterial', () => {
    it('adiciona material ao grupo e retorna ID', async () => {
        mockAddDoc.mockResolvedValue({ id: 'material123' })

        const result = await addGroupMaterial({
            groupId: 'group123' as any,
            title: 'Apostila',
            type: 'file',
            url: 'https://storage.example.com/file.pdf',
            storagePath: 'groups/group123/file.pdf',
            sizeBytes: 1024,
            uploadedBy: 'user123' as any,
        })

        expect(mockAddDoc).toHaveBeenCalledTimes(1)
        expect(result).toBe('material123')
    })

    it('adiciona link externo ao grupo', async () => {
        mockAddDoc.mockResolvedValue({ id: 'material456' })

        const result = await addGroupMaterial({
            groupId: 'group123' as any,
            title: 'Link do Drive',
            type: 'link',
            url: 'https://drive.google.com/file',
            uploadedBy: 'user123' as any,
        })

        expect(result).toBe('material456')
    })
})

// ===== getGroupMaterials =====

describe('getGroupMaterials', () => {
    it('retorna lista de materiais do grupo', async () => {
        mockGetDocs.mockResolvedValue({
            forEach: (cb: (doc: any) => void) => {
                cb({ id: 'material123', data: () => materialDocData })
            },
        })

        const result = await getGroupMaterials('group123')

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('material123')
        expect(result[0].title).toBe('Apostila de Cálculo')
    })

    it('retorna lista vazia quando grupo não tem materiais', async () => {
        mockGetDocs.mockResolvedValue({ forEach: jest.fn() })

        const result = await getGroupMaterials('group123')

        expect(result).toHaveLength(0)
    })
})

// ===== deleteGroupMaterial =====

describe('deleteGroupMaterial', () => {
    it('remove material e arquivo do storage', async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => materialDocData,
        })

        await deleteGroupMaterial('group123', 'material123')

        expect(mockDeleteFile).toHaveBeenCalledWith('groups/group123/file.pdf')
        expect(mockDeleteDoc).toHaveBeenCalledTimes(1)
    })

    it('remove material sem arquivo no storage (link)', async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ ...materialDocData, type: 'link', storagePath: undefined }),
        })

        await deleteGroupMaterial('group123', 'material123')

        expect(mockDeleteFile).not.toHaveBeenCalled()
        expect(mockDeleteDoc).toHaveBeenCalledTimes(1)
    })

    it('remove documento mesmo quando deleteFile falha', async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => materialDocData,
        })
        mockDeleteFile.mockRejectedValue(new Error('Storage error'))

        await deleteGroupMaterial('group123', 'material123')

        expect(mockDeleteDoc).toHaveBeenCalledTimes(1)
    })

    it('remove documento quando material não existe no Firestore', async () => {
        mockGetDoc.mockResolvedValue({ exists: () => false })

        await deleteGroupMaterial('group123', 'material123')

        expect(mockDeleteFile).not.toHaveBeenCalled()
        expect(mockDeleteDoc).toHaveBeenCalledTimes(1)
    })
})

// ===== addGroupTask =====

describe('addGroupTask', () => {
    it('adiciona tarefa ao grupo e retorna ID', async () => {
        mockAddDoc.mockResolvedValue({ id: 'task123' })

        const result = await addGroupTask({
            groupId: 'group123' as any,
            title: 'Resolver exercícios',
            description: 'Capítulo 3',
            status: 'pending',
            createdBy: 'user123' as any,
        })

        expect(mockAddDoc).toHaveBeenCalledTimes(1)
        expect(result).toBe('task123')
    })
})

// ===== getGroupTasks =====

describe('getGroupTasks', () => {
    it('retorna lista de tarefas do grupo', async () => {
        mockGetDocs.mockResolvedValue({
            forEach: (cb: (doc: any) => void) => {
                cb({ id: 'task123', data: () => taskDocData })
            },
        })

        const result = await getGroupTasks('group123')

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('task123')
        expect(result[0].title).toBe('Resolver exercícios')
    })

    it('converte dueDate de Timestamp para Date', async () => {
        mockGetDocs.mockResolvedValue({
            forEach: (cb: (doc: any) => void) => {
                cb({ id: 'task123', data: () => taskDocData })
            },
        })

        const result = await getGroupTasks('group123')

        expect(result[0].dueDate).toEqual(mockDate)
    })

    it('retorna lista vazia quando grupo não tem tarefas', async () => {
        mockGetDocs.mockResolvedValue({ forEach: jest.fn() })

        const result = await getGroupTasks('group123')

        expect(result).toHaveLength(0)
    })
})

// ===== updateGroupTask =====

describe('updateGroupTask', () => {
    it('atualiza status da tarefa', async () => {
        await updateGroupTask('group123', 'task123', { status: 'completed' })

        expect(mockUpdateDoc).toHaveBeenCalledTimes(1)
        expect(mockUpdateDoc).toHaveBeenCalledWith(
            'docRef',
            expect.objectContaining({ status: 'completed', updatedAt: expect.any(Date) })
        )
    })

    it('lança erro quando updateDoc falha', async () => {
        mockUpdateDoc.mockRejectedValue(new Error('Update failed'))

        await expect(updateGroupTask('group123', 'task123', { status: 'completed' }))
            .rejects.toThrow('Update failed')
    })
})

// ===== deleteGroupTask =====

describe('deleteGroupTask', () => {
    it('remove tarefa do grupo', async () => {
        await deleteGroupTask('group123', 'task123')

        expect(mockDeleteDoc).toHaveBeenCalledTimes(1)
    })

    it('lança erro quando deleteDoc falha', async () => {
        mockDeleteDoc.mockRejectedValue(new Error('Delete failed'))

        await expect(deleteGroupTask('group123', 'task123')).rejects.toThrow('Delete failed')
    })
})
