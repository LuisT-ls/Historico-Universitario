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
    type Firestore,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Disciplina, Certificado, Profile } from '@/types'
import { createDisciplinaId, createCertificadoId, createUserId } from '@/lib/constants'
import { logger } from '@/lib/logger'

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
            disciplinas.push({
                id: createDisciplinaId(doc.id),
                periodo: data.periodo || '',
                codigo: data.codigo || '',
                nome: data.nome || '',
                natureza: data.natureza || 'OB',
                ch: data.ch || 0,
                nota: data.nota || 0,
                trancamento: data.trancamento || false,
                dispensada: data.dispensada || false,
                emcurso: data.emcurso || false,
                resultado: data.resultado,
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
        logger.info('Disciplina adicionada com sucesso', { id: docRef.id })
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
        logger.info('Disciplina atualizada com sucesso', { id })
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
        logger.info('Disciplina removida com sucesso', { id })
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
        logger.info('Certificado adicionado com sucesso', { id: docRef.id })
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
        logger.info('Certificado atualizado com sucesso', { id })
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
        logger.info('Certificado removido com sucesso', { id })
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
        return {
            uid: createUserId(userId),
            nome: data.name || '',
            email: data.email || '',
            curso: data.profile?.course || 'BICTI',
            matricula: data.profile?.enrollment || '',
            institution: data.profile?.institution || '',
            startYear: data.profile?.startYear,
            startSemester: data.profile?.startSemester,
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
 * Atualiza o perfil do usuário
 */
export async function updateProfile(userId: string, data: Partial<Profile>): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const userRef = doc(db, 'users', userId)
        await updateDoc(userRef, {
            ...data,
            updatedAt: new Date(),
        })
        logger.info('Perfil atualizado com sucesso', { userId })
    } catch (error) {
        logger.error('Erro ao atualizar perfil:', error)
        throw error
    }
}
