import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    setDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Disciplina, Certificado, Profile, Curso } from '@/types'
import { createDisciplinaId, createCertificadoId, createUserId } from '@/lib/constants'
import { logger } from '@/lib/logger'
import { calcularResultado } from '@/lib/utils'

/**
 * Serviço de Firestore para operações de banco de dados
 */

// ===== DISCIPLINAS =====

/**
 * Busca todas as disciplinas do usuário
 */
export async function getDisciplines(userId: string): Promise<Disciplina[]> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const disciplinesRef = collection(db, 'disciplines')
        const q = query(disciplinesRef, where('userId', '==', userId))
        const querySnapshot = await getDocs(q)

        const disciplinas: Disciplina[] = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            const natureza = data.natureza || 'OB'
            const nota = data.nota !== undefined && data.nota !== null ? data.nota : 0

            // Normalizar resultado: calcular se não estiver armazenado
            let resultado = data.resultado
            if (!resultado && natureza !== 'AC' && data.nota !== undefined && data.nota !== null) {
                resultado = calcularResultado(nota, data.trancamento, data.dispensada, data.emcurso, natureza)
            } else if (natureza === 'AC') {
                resultado = undefined
            }

            disciplinas.push({
                id: createDisciplinaId(doc.id),
                periodo: data.periodo || '',
                codigo: data.codigo || '',
                nome: data.nome || '',
                natureza,
                ch: data.ch || 0,
                nota,
                trancamento: data.trancamento || false,
                dispensada: data.dispensada || false,
                emcurso: data.emcurso || false,
                resultado,
                curso: data.curso || 'BICTI',
                createdAt: data.createdAt?.toDate?.() || new Date(),
                updatedAt: data.updatedAt?.toDate?.() || new Date(),
            } as Disciplina)
        })

        return disciplinas
    } catch (error) {
        logger.error('Erro ao buscar disciplinas:', error)
        throw error
    }
}

/**
 * Adiciona uma nova disciplina
 */
export async function addDiscipline(disciplina: Omit<Disciplina, 'id'>, userId: string): Promise<string> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const disciplineData = {
            ...disciplina,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const docRef = await addDoc(collection(db, 'disciplines'), disciplineData)
        return docRef.id
    } catch (error) {
        logger.error('Erro ao adicionar disciplina:', error)
        throw error
    }
}

/**
 * Atualiza uma disciplina existente
 */
export async function updateDiscipline(id: string, data: Partial<Disciplina>): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const disciplineRef = doc(db, 'disciplines', id)
        await updateDoc(disciplineRef, {
            ...data,
            updatedAt: new Date(),
        })
    } catch (error) {
        logger.error('Erro ao atualizar disciplina:', error)
        throw error
    }
}

/**
 * Remove uma disciplina
 */
export async function deleteDiscipline(id: string): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const disciplineRef = doc(db, 'disciplines', id)
        await deleteDoc(disciplineRef)
    } catch (error) {
        logger.error('Erro ao remover disciplina:', error)
        throw error
    }
}

// ===== CERTIFICADOS =====

/**
 * Busca todos os certificados do usuário
 */
export async function getCertificates(userId: string): Promise<Certificado[]> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const certificadosRef = collection(db, 'certificados')
        const q = query(certificadosRef, where('userId', '==', userId))
        const querySnapshot = await getDocs(q)

        const certificados: Certificado[] = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            certificados.push({
                id: createCertificadoId(doc.id),
                userId: createUserId(data.userId),
                titulo: data.titulo,
                tipo: data.tipo,
                instituicao: data.instituicao,
                cargaHoraria: data.cargaHoraria,
                dataInicio: data.dataInicio,
                dataFim: data.dataFim,
                descricao: data.descricao,
                arquivoURL: data.arquivoURL,
                nomeArquivo: data.nomeArquivo,
                linkExterno: data.linkExterno,
                status: data.status,
                dataCadastro: data.dataCadastro,
                createdAt: data.createdAt?.toDate?.() || new Date(),
                updatedAt: data.updatedAt?.toDate?.() || new Date(),
            } as Certificado)
        })

        return certificados
    } catch (error) {
        logger.error('Erro ao buscar certificados:', error)
        throw error
    }
}

/**
 * Adiciona um novo certificado
 */
export async function addCertificate(certificado: Omit<Certificado, 'id'>, userId: string): Promise<string> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const certificadoData = {
            ...certificado,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const docRef = await addDoc(collection(db, 'certificados'), certificadoData)
        return docRef.id
    } catch (error) {
        logger.error('Erro ao adicionar certificado:', error)
        throw error
    }
}

/**
 * Atualiza um certificado existente
 */
export async function updateCertificate(id: string, data: Partial<Certificado>): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const certificadoRef = doc(db, 'certificados', id)
        await updateDoc(certificadoRef, {
            ...data,
            updatedAt: new Date(),
        })
    } catch (error) {
        logger.error('Erro ao atualizar certificado:', error)
        throw error
    }
}

/**
 * Remove um certificado
 */
export async function deleteCertificate(id: string): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const certificadoRef = doc(db, 'certificados', id)
        await deleteDoc(certificadoRef)
    } catch (error) {
        logger.error('Erro ao remover certificado:', error)
        throw error
    }
}

// ===== PERFIL =====

/**
 * Busca o perfil do usuário
 */
export async function getProfile(userId: string): Promise<Profile | null> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const userRef = doc(db, 'users', userId)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
            return null
        }

        const data = userSnap.data()
        const cursosRaw: Curso[] | undefined = data.profile?.courses
        const cursoLegado: Curso | undefined = data.profile?.course || undefined
        // Normaliza: se `courses` array existir e não estiver vazio usa ele;
        // senão, usa o campo legado `course` se existir; senão array vazio (onboarding)
        const cursos: Curso[] = Array.isArray(cursosRaw) && cursosRaw.length > 0
            ? cursosRaw
            : cursoLegado ? [cursoLegado] : []
        return {
            uid: createUserId(userId),
            nome: data.name || '',
            email: data.email || '',
            photoURL: data.photoURL || '',
            curso: cursos[cursos.length - 1],
            cursos,
            instituto: data.profile?.instituto,
            concentracaoBICTI: data.profile?.concentracaoBICTI,
            concentracaoBIHUM: data.profile?.concentracaoBIHUM,
            matricula: data.profile?.enrollment || '',
            institution: data.profile?.institution || '',
            startYear: data.profile?.startYear,
            startSemester: data.profile?.startSemester,
            cplStartYear: data.profile?.cplStartYear,
            cplStartSemester: data.profile?.cplStartSemester,
            suspensions: data.profile?.suspensions || 0,
            currentSemester: data.profile?.currentSemester,
            settings: data.settings,
            createdAt: data.createdAt?.toDate?.(),
            updatedAt: data.updatedAt?.toDate?.(),
        } as Profile
    } catch (error) {
        logger.error('Erro ao buscar perfil:', error)
        throw error
    }
}

/**
 * Atualiza o perfil do usuário.
 *
 * O documento `users/{userId}` usa a seguinte estrutura no Firestore:
 *   - name          (raiz)
 *   - email         (raiz)
 *   - photoURL      (raiz)
 *   - settings      (raiz)
 *   - profile.course
 *   - profile.enrollment
 *   - profile.institution
 *   - profile.startYear
 *   - profile.startSemester
 *   - profile.suspensions
 *   - profile.currentSemester
 *
 * Usamos dot-notation para atualizar campos aninhados individualmente
 * sem sobrescrever o objeto `profile` inteiro.
 */
// ===== HORÁRIOS =====

/**
 * Retorna os códigos de horário salvos para o usuário.
 * Armazenados no campo `horarioCodes` do documento `users/{userId}`.
 */
export async function getScheduleCodes(userId: string): Promise<Record<string, string>> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const userRef = doc(db, 'users', userId)
        const snap = await getDoc(userRef)
        if (!snap.exists()) return {}
        return (snap.data().horarioCodes as Record<string, string>) ?? {}
    } catch (error) {
        logger.error('Erro ao buscar códigos de horário:', error)
        throw error
    }
}

/**
 * Persiste os códigos de horário do usuário.
 */
export async function saveScheduleCodes(userId: string, codes: Record<string, string>): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const userRef = doc(db, 'users', userId)
        await setDoc(userRef, { horarioCodes: codes }, { merge: true })
    } catch (error) {
        logger.error('Erro ao salvar códigos de horário:', error)
        throw error
    }
}

// ===== ROLES =====

/**
 * Retorna o papel (role) do usuário. Padrão: 'usuario'.
 */
export async function getUserRole(userId: string): Promise<import('@/types').UserRole> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const userRef = doc(db, 'users', userId)
        const snap = await getDoc(userRef)
        if (!snap.exists()) return 'usuario'
        return (snap.data().role as import('@/types').UserRole) ?? 'usuario'
    } catch (error) {
        logger.error('Erro ao buscar role do usuário:', error)
        return 'usuario'
    }
}

export async function updateProfile(userId: string, data: Partial<Profile>): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const userRef = doc(db, 'users', userId)

        // Mapeia Profile → estrutura real do documento Firestore
        const firestoreData: Record<string, unknown> = { updatedAt: new Date() }

        // Campos na raiz do documento
        if (data.nome !== undefined) firestoreData['name'] = data.nome
        if (data.email !== undefined) firestoreData['email'] = data.email
        if (data.photoURL !== undefined) firestoreData['photoURL'] = data.photoURL
        if (data.settings !== undefined) firestoreData['settings'] = data.settings

        // Campos aninhados em `profile` — dot-notation atualiza sem sobrescrever os demais
        if (data.cursos !== undefined) {
            firestoreData['profile.courses'] = data.cursos
            // Mantém `profile.course` em sincronia com o curso ativo (último da lista)
            firestoreData['profile.course'] = data.cursos[data.cursos.length - 1] ?? 'BICTI'
        } else if (data.curso !== undefined) {
            firestoreData['profile.course'] = data.curso
        }
        if (data.instituto !== undefined) firestoreData['profile.instituto'] = data.instituto
        if (data.concentracaoBICTI !== undefined) firestoreData['profile.concentracaoBICTI'] = data.concentracaoBICTI
        if (data.concentracaoBIHUM !== undefined) firestoreData['profile.concentracaoBIHUM'] = data.concentracaoBIHUM
        if (data.matricula !== undefined) firestoreData['profile.enrollment'] = data.matricula
        if (data.institution !== undefined) firestoreData['profile.institution'] = data.institution
        if (data.startYear !== undefined) firestoreData['profile.startYear'] = data.startYear
        if (data.startSemester !== undefined) firestoreData['profile.startSemester'] = data.startSemester
        if (data.cplStartYear !== undefined) firestoreData['profile.cplStartYear'] = data.cplStartYear
        if (data.cplStartSemester !== undefined) firestoreData['profile.cplStartSemester'] = data.cplStartSemester
        if (data.suspensions !== undefined) firestoreData['profile.suspensions'] = data.suspensions
        if (data.currentSemester !== undefined) firestoreData['profile.currentSemester'] = data.currentSemester

        await updateDoc(userRef, firestoreData)
    } catch (error) {
        logger.error('Erro ao atualizar perfil:', error)
        throw error
    }
}
