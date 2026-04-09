import {
    getDisciplines, addDiscipline, updateDiscipline, deleteDiscipline,
    getCertificates, addCertificate, updateCertificate, deleteCertificate,
    getProfile, updateProfile, getScheduleCodes, saveScheduleCodes, getUserRole,
} from '@/services/firestore.service'

jest.mock('@/lib/logger', () => ({
    logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}))

jest.mock('@/lib/utils', () => ({
    calcularResultado: jest.fn().mockReturnValue('AP'),
}))

const mockCollection = jest.fn()
const mockDoc = jest.fn()
const mockGetDocs = jest.fn()
const mockGetDoc = jest.fn()
const mockAddDoc = jest.fn()
const mockUpdateDoc = jest.fn()
const mockDeleteDoc = jest.fn()
const mockSetDoc = jest.fn()
const mockQuery = jest.fn()
const mockWhere = jest.fn()

jest.mock('firebase/firestore', () => ({
    collection: (...args: any[]) => mockCollection(...args),
    doc: (...args: any[]) => mockDoc(...args),
    getDocs: (...args: any[]) => mockGetDocs(...args),
    getDoc: (...args: any[]) => mockGetDoc(...args),
    addDoc: (...args: any[]) => mockAddDoc(...args),
    updateDoc: (...args: any[]) => mockUpdateDoc(...args),
    deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
    setDoc: (...args: any[]) => mockSetDoc(...args),
    query: (...args: any[]) => mockQuery(...args),
    where: (...args: any[]) => mockWhere(...args),
}))

const disciplinaDocData = {
    periodo: '2024.1',
    codigo: 'MAT001',
    nome: 'Cálculo I',
    natureza: 'OB',
    ch: 60,
    nota: 8.5,
    trancamento: false,
    dispensada: false,
    emcurso: false,
    resultado: 'AP',
    curso: 'BICTI',
    createdAt: { toDate: () => new Date('2024-01-01') },
    updatedAt: { toDate: () => new Date('2024-01-01') },
}

const disciplinaDoc = { id: 'disc123', data: () => disciplinaDocData }

const certificadoDocData = {
    userId: 'user123',
    titulo: 'Curso de TypeScript',
    tipo: 'curso',
    instituicao: 'Udemy',
    cargaHoraria: 20,
    dataInicio: '2024-01-01',
    dataFim: '2024-01-30',
    descricao: 'Curso completo',
    linkExterno: 'https://example.com',
    status: 'aprovado',
    dataCadastro: '2024-01-30',
    createdAt: { toDate: () => new Date('2024-01-01') },
    updatedAt: { toDate: () => new Date('2024-01-01') },
}

const certificadoDoc = { id: 'cert123', data: () => certificadoDocData }

beforeEach(() => {
    jest.clearAllMocks()
    mockCollection.mockReturnValue('collectionRef')
    mockDoc.mockReturnValue('docRef')
    mockQuery.mockReturnValue('queryRef')
    mockWhere.mockReturnValue('whereClause')
})

// ===== getDisciplines =====

describe('getDisciplines', () => {
    it('returns disciplines mapped from Firestore', async () => {
        mockGetDocs.mockResolvedValue({ forEach: (cb: any) => [disciplinaDoc].forEach(cb) })
        const result = await getDisciplines('user123')
        expect(result).toHaveLength(1)
        expect(result[0].codigo).toBe('MAT001')
        expect(result[0].nome).toBe('Cálculo I')
        expect(result[0].ch).toBe(60)
        expect(result[0].nota).toBe(8.5)
        expect(result[0].curso).toBe('BICTI')
    })

    it('returns empty array when user has no disciplines', async () => {
        mockGetDocs.mockResolvedValue({ forEach: jest.fn() })
        const result = await getDisciplines('user123')
        expect(result).toEqual([])
    })

    it('calculates resultado when not stored', async () => {
        const docSemResultado = {
            id: 'disc456',
            data: () => ({ ...disciplinaDocData, resultado: undefined }),
        }
        mockGetDocs.mockResolvedValue({ forEach: (cb: any) => [docSemResultado].forEach(cb) })
        const { calcularResultado } = require('@/lib/utils')
        await getDisciplines('user123')
        expect(calcularResultado).toHaveBeenCalled()
    })

    it('sets resultado undefined for AC natureza', async () => {
        const acDoc = {
            id: 'disc789',
            data: () => ({ ...disciplinaDocData, natureza: 'AC', resultado: undefined }),
        }
        mockGetDocs.mockResolvedValue({ forEach: (cb: any) => [acDoc].forEach(cb) })
        const result = await getDisciplines('user123')
        expect(result[0].resultado).toBeUndefined()
    })

    it('applies defaults for missing fields', async () => {
        const minimalDoc = { id: 'min1', data: () => ({}) }
        mockGetDocs.mockResolvedValue({ forEach: (cb: any) => [minimalDoc].forEach(cb) })
        const result = await getDisciplines('user123')
        expect(result[0].natureza).toBe('OB')
        expect(result[0].nota).toBe(0)
        expect(result[0].curso).toBe('BICTI')
        expect(result[0].trancamento).toBe(false)
    })

    it('throws and propagates Firestore errors', async () => {
        mockGetDocs.mockRejectedValue(new Error('Firestore offline'))
        await expect(getDisciplines('user123')).rejects.toThrow('Firestore offline')
    })
})

// ===== addDiscipline =====

describe('addDiscipline', () => {
    const disciplina = {
        periodo: '2024.1', codigo: 'MAT001', nome: 'Cálculo I',
        natureza: 'OB' as any, ch: 60, nota: 8.5,
        trancamento: false, dispensada: false, emcurso: false,
        curso: 'BICTI' as any, createdAt: new Date(), updatedAt: new Date(),
    }

    it('adds discipline and returns document id', async () => {
        mockAddDoc.mockResolvedValue({ id: 'newDisc123' })
        const id = await addDiscipline(disciplina, 'user123')
        expect(id).toBe('newDisc123')
        expect(mockAddDoc).toHaveBeenCalledWith('collectionRef', expect.objectContaining({
            userId: 'user123',
            codigo: 'MAT001',
        }))
    })

    it('throws and propagates Firestore errors', async () => {
        mockAddDoc.mockRejectedValue(new Error('Add failed'))
        await expect(addDiscipline(disciplina, 'user123')).rejects.toThrow('Add failed')
    })
})

// ===== updateDiscipline =====

describe('updateDiscipline', () => {
    it('calls updateDoc with data and updatedAt', async () => {
        mockUpdateDoc.mockResolvedValue(undefined)
        await updateDiscipline('disc123', { nota: 9.0 })
        expect(mockUpdateDoc).toHaveBeenCalledWith('docRef', expect.objectContaining({ nota: 9.0 }))
        expect(mockUpdateDoc.mock.calls[0][1]).toHaveProperty('updatedAt')
    })

    it('throws and propagates Firestore errors', async () => {
        mockUpdateDoc.mockRejectedValue(new Error('Update failed'))
        await expect(updateDiscipline('disc123', {})).rejects.toThrow('Update failed')
    })
})

// ===== deleteDiscipline =====

describe('deleteDiscipline', () => {
    it('calls deleteDoc with correct reference', async () => {
        mockDeleteDoc.mockResolvedValue(undefined)
        await deleteDiscipline('disc123')
        expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'disciplines', 'disc123')
        expect(mockDeleteDoc).toHaveBeenCalledWith('docRef')
    })

    it('throws and propagates Firestore errors', async () => {
        mockDeleteDoc.mockRejectedValue(new Error('Delete failed'))
        await expect(deleteDiscipline('disc123')).rejects.toThrow('Delete failed')
    })
})

// ===== getCertificates =====

describe('getCertificates', () => {
    it('returns certificates mapped from Firestore', async () => {
        mockGetDocs.mockResolvedValue({ forEach: (cb: any) => [certificadoDoc].forEach(cb) })
        const result = await getCertificates('user123')
        expect(result).toHaveLength(1)
        expect(result[0].titulo).toBe('Curso de TypeScript')
        expect(result[0].cargaHoraria).toBe(20)
        expect(result[0].status).toBe('aprovado')
    })

    it('returns empty array when user has no certificates', async () => {
        mockGetDocs.mockResolvedValue({ forEach: jest.fn() })
        const result = await getCertificates('user123')
        expect(result).toEqual([])
    })

    it('throws and propagates Firestore errors', async () => {
        mockGetDocs.mockRejectedValue(new Error('Fetch failed'))
        await expect(getCertificates('user123')).rejects.toThrow('Fetch failed')
    })
})

// ===== addCertificate =====

describe('addCertificate', () => {
    it('adds certificate and returns document id', async () => {
        mockAddDoc.mockResolvedValue({ id: 'newCert123' })
        const id = await addCertificate({ titulo: 'Cert', cargaHoraria: 10 } as any, 'user123')
        expect(id).toBe('newCert123')
        expect(mockAddDoc).toHaveBeenCalledWith('collectionRef', expect.objectContaining({
            titulo: 'Cert',
            userId: 'user123',
        }))
    })

    it('throws and propagates Firestore errors', async () => {
        mockAddDoc.mockRejectedValue(new Error('Add cert failed'))
        await expect(addCertificate({} as any, 'user123')).rejects.toThrow('Add cert failed')
    })
})

// ===== updateCertificate =====

describe('updateCertificate', () => {
    it('calls updateDoc with data and updatedAt', async () => {
        mockUpdateDoc.mockResolvedValue(undefined)
        await updateCertificate('cert123', { titulo: 'Novo Título' })
        expect(mockUpdateDoc).toHaveBeenCalledWith('docRef', expect.objectContaining({ titulo: 'Novo Título' }))
    })

    it('throws and propagates Firestore errors', async () => {
        mockUpdateDoc.mockRejectedValue(new Error('Update cert failed'))
        await expect(updateCertificate('cert123', {})).rejects.toThrow('Update cert failed')
    })
})

// ===== deleteCertificate =====

describe('deleteCertificate', () => {
    it('calls deleteDoc with correct reference', async () => {
        mockDeleteDoc.mockResolvedValue(undefined)
        await deleteCertificate('cert123')
        expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'certificados', 'cert123')
        expect(mockDeleteDoc).toHaveBeenCalledWith('docRef')
    })

    it('throws and propagates Firestore errors', async () => {
        mockDeleteDoc.mockRejectedValue(new Error('Delete cert failed'))
        await expect(deleteCertificate('cert123')).rejects.toThrow('Delete cert failed')
    })
})

// ===== getProfile =====

describe('getProfile', () => {
    it('returns full profile when user document exists', async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({
                name: 'João Silva',
                email: 'joao@example.com',
                photoURL: 'https://photo.url',
                profile: {
                    course: 'BICTI',
                    enrollment: '202101001',
                    institution: 'UFBA',
                    startYear: 2021,
                    startSemester: '1',
                    suspensions: 0,
                    currentSemester: '5',
                },
                settings: { privacy: 'private' },
                createdAt: { toDate: () => new Date('2021-01-01') },
                updatedAt: { toDate: () => new Date('2024-01-01') },
            }),
        })
        const result = await getProfile('user123')
        expect(result).not.toBeNull()
        expect(result?.nome).toBe('João Silva')
        expect(result?.email).toBe('joao@example.com')
        expect(result?.curso).toBe('BICTI')
        expect(result?.matricula).toBe('202101001')
        expect(result?.institution).toBe('UFBA')
        expect(result?.startYear).toBe(2021)
        expect(result?.suspensions).toBe(0)
        expect(result?.currentSemester).toBe('5')
    })

    it('returns null when user document does not exist', async () => {
        mockGetDoc.mockResolvedValue({ exists: () => false })
        const result = await getProfile('nonexistent')
        expect(result).toBeNull()
    })

    it('applies defaults for missing profile fields', async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ createdAt: null, updatedAt: null }),
        })
        const result = await getProfile('user123')
        expect(result?.nome).toBe('')
        expect(result?.curso).toBe('BICTI')
        expect(result?.matricula).toBe('')
        expect(result?.suspensions).toBe(0)
    })

    it('throws and propagates Firestore errors', async () => {
        mockGetDoc.mockRejectedValue(new Error('Get profile failed'))
        await expect(getProfile('user123')).rejects.toThrow('Get profile failed')
    })
})

// ===== updateProfile =====

describe('updateProfile', () => {
    beforeEach(() => {
        mockUpdateDoc.mockResolvedValue(undefined)
    })

    it('maps root-level fields correctly', async () => {
        await updateProfile('user123', { nome: 'Maria', photoURL: 'https://photo.url' })
        expect(mockUpdateDoc).toHaveBeenCalledWith('docRef', expect.objectContaining({
            name: 'Maria',
            photoURL: 'https://photo.url',
        }))
    })

    it('uses dot-notation for nested profile fields', async () => {
        await updateProfile('user123', {
            curso: 'ENG_PROD' as any,
            matricula: '202201001',
            institution: 'UFBA',
            startYear: 2022,
            startSemester: '1',
            suspensions: 1,
            currentSemester: '3',
        })
        expect(mockUpdateDoc).toHaveBeenCalledWith('docRef', expect.objectContaining({
            'profile.course': 'ENG_PROD',
            'profile.enrollment': '202201001',
            'profile.institution': 'UFBA',
            'profile.startYear': 2022,
            'profile.startSemester': '1',
            'profile.suspensions': 1,
            'profile.currentSemester': '3',
        }))
    })

    it('updates settings field', async () => {
        await updateProfile('user123', { settings: { privacy: 'public' } as any })
        expect(mockUpdateDoc).toHaveBeenCalledWith('docRef', expect.objectContaining({
            settings: { privacy: 'public' },
        }))
    })

    it('always includes updatedAt', async () => {
        await updateProfile('user123', {})
        const callArgs = mockUpdateDoc.mock.calls[0][1]
        expect(callArgs).toHaveProperty('updatedAt')
    })

    it('only sends fields that are explicitly provided', async () => {
        await updateProfile('user123', { nome: 'Só Nome' })
        const callArgs = mockUpdateDoc.mock.calls[0][1]
        expect(callArgs).toHaveProperty('name', 'Só Nome')
        expect(callArgs).not.toHaveProperty('profile.course')
        expect(callArgs).not.toHaveProperty('profile.enrollment')
    })

    it('throws and propagates Firestore errors', async () => {
        mockUpdateDoc.mockRejectedValue(new Error('Update profile failed'))
        await expect(updateProfile('user123', {})).rejects.toThrow('Update profile failed')
    })
})

// ===== getScheduleCodes =====

describe('getScheduleCodes', () => {
    it('returns horarioCodes when document exists with codes', async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ horarioCodes: { 'MAT001': '46T56', 'FIS001': '24M34' } }),
        })
        const result = await getScheduleCodes('user123')
        expect(result).toEqual({ 'MAT001': '46T56', 'FIS001': '24M34' })
    })

    it('returns empty object when document does not exist', async () => {
        mockGetDoc.mockResolvedValue({ exists: () => false })
        const result = await getScheduleCodes('user123')
        expect(result).toEqual({})
    })

    it('returns empty object when horarioCodes field is absent', async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ name: 'João' }),
        })
        const result = await getScheduleCodes('user123')
        expect(result).toEqual({})
    })

    it('throws and propagates Firestore errors', async () => {
        mockGetDoc.mockRejectedValue(new Error('Get codes failed'))
        await expect(getScheduleCodes('user123')).rejects.toThrow('Get codes failed')
    })
})

// ===== saveScheduleCodes =====

describe('saveScheduleCodes', () => {
    it('calls setDoc with horarioCodes and merge option', async () => {
        mockSetDoc.mockResolvedValue(undefined)
        const codes = { 'MAT001': '46T56' }
        await saveScheduleCodes('user123', codes)
        expect(mockSetDoc).toHaveBeenCalledWith(
            'docRef',
            { horarioCodes: codes },
            { merge: true },
        )
    })

    it('calls setDoc with empty codes object', async () => {
        mockSetDoc.mockResolvedValue(undefined)
        await saveScheduleCodes('user123', {})
        expect(mockSetDoc).toHaveBeenCalledWith('docRef', { horarioCodes: {} }, { merge: true })
    })

    it('throws and propagates Firestore errors', async () => {
        mockSetDoc.mockRejectedValue(new Error('Save codes failed'))
        await expect(saveScheduleCodes('user123', {})).rejects.toThrow('Save codes failed')
    })
})

// ===== getUserRole =====

describe('getUserRole', () => {
    it('returns the role when user document exists with a role', async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ role: 'admin' }),
        })
        const result = await getUserRole('user123')
        expect(result).toBe('admin')
    })

    it('returns "usuario" when user document does not exist', async () => {
        mockGetDoc.mockResolvedValue({ exists: () => false })
        const result = await getUserRole('user123')
        expect(result).toBe('usuario')
    })

    it('returns "usuario" when role field is absent', async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ name: 'João' }),
        })
        const result = await getUserRole('user123')
        expect(result).toBe('usuario')
    })

    it('returns "usuario" on Firestore errors (swallows error)', async () => {
        mockGetDoc.mockRejectedValue(new Error('Get role failed'))
        const result = await getUserRole('user123')
        expect(result).toBe('usuario')
    })
})

// ===== updateProfile — cursos branch =====

describe('updateProfile — cursos array', () => {
    beforeEach(() => {
        mockUpdateDoc.mockResolvedValue(undefined)
    })

    it('maps cursos array to profile.courses and sets profile.course to last element', async () => {
        await updateProfile('user123', { cursos: ['BICTI', 'CPL'] as any[] })
        expect(mockUpdateDoc).toHaveBeenCalledWith('docRef', expect.objectContaining({
            'profile.courses': ['BICTI', 'CPL'],
            'profile.course': 'CPL',
        }))
    })

    it('falls back profile.course to "BICTI" when cursos array is empty', async () => {
        await updateProfile('user123', { cursos: [] as any[] })
        expect(mockUpdateDoc).toHaveBeenCalledWith('docRef', expect.objectContaining({
            'profile.courses': [],
            'profile.course': 'BICTI',
        }))
    })

    it('maps cplStartYear and cplStartSemester fields', async () => {
        await updateProfile('user123', { cplStartYear: 2023, cplStartSemester: '2' })
        expect(mockUpdateDoc).toHaveBeenCalledWith('docRef', expect.objectContaining({
            'profile.cplStartYear': 2023,
            'profile.cplStartSemester': '2',
        }))
    })
})

// ===== getProfile — cursos array branch =====

describe('getProfile — cursos array normalization', () => {
    it('uses profile.courses array when it exists and is non-empty', async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({
                name: 'Ana',
                email: 'ana@example.com',
                profile: {
                    courses: ['BICTI', 'CPL'],
                    course: 'BICTI',
                    enrollment: '2022001',
                    institution: 'UFBA',
                    suspensions: 0,
                },
                createdAt: null,
                updatedAt: null,
            }),
        })
        const result = await getProfile('user123')
        expect(result?.cursos).toEqual(['BICTI', 'CPL'])
        expect(result?.curso).toBe('CPL')
    })
})
