import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    deleteField,
    query,
    where,
    orderBy,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { deleteFile } from '@/services/storage.service'
import { logger } from '@/lib/logger'
import type { Group, GroupId, GroupMaterial, GroupMaterialId, GroupMindMap, GroupTask, GroupTaskId, MindMapEdge, MindMapNode, TaskActivity, TaskActivityAction, TaskComment, UserId } from '@/types'
import { createGroupId, createGroupMaterialId, createGroupTaskId } from '@/lib/type-constants'

/**
 * Gera um código de convite aleatório de 6 caracteres (letras maiúsculas e números)
 */
function generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const bytes = new Uint8Array(6)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

// ===== GRUPOS =====

/**
 * Cria um novo grupo
 */
export async function createGroup(groupData: Omit<Group, 'id' | 'inviteCode' | 'members' | 'createdAt' | 'updatedAt'>): Promise<GroupId> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const newGroup: Omit<Group, 'id'> = {
            ...groupData,
            members: [groupData.ownerId],
            inviteCode: generateInviteCode(),
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const docRef = await addDoc(collection(db, 'groups'), newGroup)
        logger.info('Grupo criado com sucesso', { id: docRef.id })
        return createGroupId(docRef.id)
    } catch (error) {
        logger.error('Erro ao criar grupo:', error)
        throw error
    }
}

/**
 * Busca os grupos de um usuário (onde ele é membro)
 */
export async function getGroupsByUser(userId: UserId): Promise<Group[]> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const groupsRef = collection(db, 'groups')
        const q = query(groupsRef, where('members', 'array-contains', userId), orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(q)

        const groups: Group[] = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            groups.push({
                id: createGroupId(doc.id),
                ...data,
                createdAt: data.createdAt?.toDate?.() || new Date(),
                updatedAt: data.updatedAt?.toDate?.() || new Date(),
            } as Group)
        })

        return groups
    } catch (error) {
        logger.error('Erro ao buscar grupos do usuário:', error)
        throw error
    }
}

/**
 * Busca um grupo pelo ID
 */
export async function getGroupById(groupId: string): Promise<Group | null> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const groupRef = doc(db, 'groups', groupId)
        const groupSnap = await getDoc(groupRef)

        if (!groupSnap.exists()) return null

        const data = groupSnap.data()
        return {
            id: createGroupId(groupSnap.id),
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as Group
    } catch (error) {
        logger.error('Erro ao buscar grupo por ID:', error)
        throw error
    }
}

/**
 * Entra em um grupo usando o código de convite
 */
export async function joinGroupByCode(userId: UserId, inviteCode: string): Promise<GroupId> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const groupsRef = collection(db, 'groups')
        const q = query(groupsRef, where('inviteCode', '==', inviteCode.toUpperCase()))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
            throw new Error('Código de convite inválido')
        }

        const groupDoc = querySnapshot.docs[0]
        const groupData = groupDoc.data() as Group

        if (groupData.members.includes(userId)) {
            return createGroupId(groupDoc.id)
        }

        // arrayUnion garante atomicidade: evita race condition quando dois usuários entram simultaneamente
        await updateDoc(doc(db, 'groups', groupDoc.id), {
            members: arrayUnion(userId),
            updatedAt: new Date()
        })

        return createGroupId(groupDoc.id)
    } catch (error) {
        logger.error('Erro ao entrar no grupo:', error)
        throw error
    }
}

/**
 * Remove o usuário do grupo (sair do grupo)
 */
export async function leaveGroup(groupId: string, userId: UserId): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado')
    try {
        await updateDoc(doc(db, 'groups', groupId), {
            members: arrayRemove(userId),
            updatedAt: new Date(),
        })
        logger.info('Usuário saiu do grupo', { groupId, userId })
    } catch (error) {
        logger.error('Erro ao sair do grupo:', error)
        throw error
    }
}

/**
 * Atualiza os dados editáveis de um grupo (apenas owner)
 */
export async function updateGroup(
    groupId: string,
    data: Partial<Pick<Group, 'name' | 'description' | 'subjectCode' | 'customColumns' | 'columnOrder'>>
): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado')
    try {
        const payload = Object.fromEntries(
            Object.entries({ ...data, updatedAt: new Date() }).filter(([, v]) => v !== undefined)
        )
        await updateDoc(doc(db, 'groups', groupId), payload)
        logger.info('Grupo atualizado', { groupId })
    } catch (error) {
        logger.error('Erro ao atualizar grupo:', error)
        throw error
    }
}

/**
 * Exclui o grupo (apenas owner). Subcoleções tornam-se inativas sem o documento pai.
 */
export async function deleteGroup(groupId: string): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado')
    try {
        await deleteDoc(doc(db, 'groups', groupId))
        logger.info('Grupo excluído', { groupId })
    } catch (error) {
        logger.error('Erro ao excluir grupo:', error)
        throw error
    }
}

// ===== MATERIAIS =====

/**
 * Adiciona um material ao grupo (link ou arquivo)
 */
export async function addGroupMaterial(material: Omit<GroupMaterial, 'id' | 'createdAt'>): Promise<GroupMaterialId> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const materialData = Object.fromEntries(
            Object.entries({
                ...material,
                createdAt: new Date(),
            }).filter(([, v]) => v !== undefined)
        )

        const docRef = await addDoc(collection(db, 'groups', material.groupId, 'materials'), materialData)
        return createGroupMaterialId(docRef.id)
    } catch (error) {
        logger.error('Erro ao adicionar material ao grupo:', error)
        throw error
    }
}

/**
 * Busca materiais do grupo
 */
export async function getGroupMaterials(groupId: string): Promise<GroupMaterial[]> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const materialsRef = collection(db, 'groups', groupId, 'materials')
        const q = query(materialsRef, orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(q)

        const materials: GroupMaterial[] = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            materials.push({
                id: createGroupMaterialId(doc.id),
                ...data,
                createdAt: data.createdAt?.toDate?.() || new Date(),
            } as GroupMaterial)
        })

        return materials
    } catch (error) {
        logger.error('Erro ao buscar materiais do grupo:', error)
        throw error
    }
}

/**
 * Remove um material e o arquivo correspondente no Storage (se houver)
 */
export async function deleteGroupMaterial(groupId: string, materialId: string): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const materialRef = doc(db, 'groups', groupId, 'materials', materialId)

        // Busca o material para verificar se há arquivo no Storage a ser removido
        const materialSnap = await getDoc(materialRef)
        if (materialSnap.exists()) {
            const material = materialSnap.data()
            if (material.type === 'file' && material.storagePath) {
                try {
                    await deleteFile(material.storagePath)
                } catch (storageError) {
                    // Loga mas não bloqueia: o documento Firestore deve ser removido mesmo se o arquivo já não existir
                    logger.error('Não foi possível remover o arquivo do Storage:', storageError)
                }
            }
        }

        await deleteDoc(materialRef)
    } catch (error) {
        logger.error('Erro ao remover material do grupo:', error)
        throw error
    }
}

// ===== TAREFAS =====

/**
 * Adiciona uma tarefa ao grupo
 */
export async function addGroupTask(task: Omit<GroupTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<GroupTaskId> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        // Firestore não aceita campos undefined — filtra antes de persistir
        const createdActivity: TaskActivity = {
            userId: task.createdBy,
            action: 'created',
            detail: 'adicionou este cartão',
            timestamp: new Date(),
        }

        const taskData = Object.fromEntries(
            Object.entries({
                ...task,
                activity: [createdActivity],
                createdAt: new Date(),
                updatedAt: new Date(),
            }).filter(([, v]) => v !== undefined)
        )

        const docRef = await addDoc(collection(db, 'groups', task.groupId, 'tasks'), taskData)
        return createGroupTaskId(docRef.id)
    } catch (error) {
        logger.error('Erro ao adicionar tarefa ao grupo:', error)
        throw error
    }
}

/**
 * Busca tarefas do grupo
 */
export async function getGroupTasks(groupId: string): Promise<GroupTask[]> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const tasksRef = collection(db, 'groups', groupId, 'tasks')
        const q = query(tasksRef, orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(q)

        const tasks: GroupTask[] = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            tasks.push({
                id: createGroupTaskId(doc.id),
                ...data,
                createdAt: data.createdAt?.toDate?.() || new Date(),
                updatedAt: data.updatedAt?.toDate?.() || new Date(),
                dueDate: data.dueDate?.toDate?.(),
            } as GroupTask)
        })

        return tasks
    } catch (error) {
        logger.error('Erro ao buscar tarefas do grupo:', error)
        throw error
    }
}

/**
 * Atualiza uma tarefa (status, atribuição, etc)
 */
export async function updateGroupTask(
    groupId: string,
    taskId: string,
    data: Partial<GroupTask>,
    actorId?: string,
    action?: TaskActivityAction,
    detail?: string,
    actorDisplayName?: string
): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const taskRef = doc(db, 'groups', groupId, 'tasks', taskId)
        // Firestore não aceita undefined — substitui por deleteField() para remover o campo
        const payload = Object.fromEntries(
            Object.entries({ ...data, updatedAt: new Date() })
                .map(([k, v]) => [k, v === undefined ? deleteField() : v])
        )

        if (actorId && action) {
            const entry: TaskActivity = {
                userId: actorId,
                ...(actorDisplayName ? { displayName: actorDisplayName } : {}),
                action,
                ...(detail ? { detail } : {}),
                timestamp: new Date(),
            }
            payload.activity = arrayUnion(entry)
        }

        await updateDoc(taskRef, payload)
    } catch (error) {
        logger.error('Erro ao atualizar tarefa do grupo:', error)
        throw error
    }
}

/**
 * Adiciona um comentário a uma tarefa via arrayUnion (atômico)
 */
export async function addTaskComment(groupId: string, taskId: string, comment: TaskComment): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado')
    try {
        const taskRef = doc(db, 'groups', groupId, 'tasks', taskId)
        await updateDoc(taskRef, {
            comments: arrayUnion({ ...comment, createdAt: comment.createdAt }),
            updatedAt: new Date(),
        })
    } catch (error) {
        logger.error('Erro ao adicionar comentário:', error)
        throw error
    }
}

/**
 * Remove uma tarefa
 */
export async function deleteGroupTask(groupId: string, taskId: string): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado')

    try {
        const taskRef = doc(db, 'groups', groupId, 'tasks', taskId)
        await deleteDoc(taskRef)
    } catch (error) {
        logger.error('Erro ao remover tarefa do grupo:', error)
        throw error
    }
}

// ===== MAPA MENTAL =====

const MIND_MAP_DOC = 'board'

/**
 * Salva (cria ou sobrescreve) o mapa mental do grupo.
 * Usa setDoc com merge:false para garantir substituição atômica completa.
 */
export async function saveMindMap(
    groupId: string,
    nodes: MindMapNode[],
    edges: MindMapEdge[],
    updatedBy: string
): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado')
    try {
        const ref = doc(db, 'groups', groupId, 'mindMap', MIND_MAP_DOC)
        await setDoc(ref, {
            nodes,
            edges,
            updatedAt: new Date(),
            updatedBy,
        })
    } catch (error) {
        logger.error('Erro ao salvar mapa mental:', error)
        throw error
    }
}

/**
 * Busca o mapa mental do grupo (leitura única).
 * Retorna null se ainda não foi criado.
 */
export async function getMindMap(groupId: string): Promise<GroupMindMap | null> {
    if (!db) throw new Error('Firestore não inicializado')
    try {
        const ref = doc(db, 'groups', groupId, 'mindMap', MIND_MAP_DOC)
        const snap = await getDoc(ref)
        if (!snap.exists()) return null
        const data = snap.data()
        return {
            nodes: data.nodes ?? [],
            edges: data.edges ?? [],
            updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
            updatedBy: data.updatedBy ?? '',
        } as GroupMindMap
    } catch (error) {
        logger.error('Erro ao buscar mapa mental:', error)
        throw error
    }
}

// ===== PRESENÇA =====

export interface PresenceEntry {
    userId: string
    displayName: string
    lastSeen: Date
}

/**
 * Registra ou atualiza a presença do usuário no grupo
 */
export async function setPresence(groupId: string, userId: string, displayName: string): Promise<void> {
    if (!db) return
    try {
        await setDoc(doc(db, 'groups', groupId, 'presence', userId), {
            displayName,
            lastSeen: serverTimestamp(),
        })
    } catch (error) {
        logger.error('Erro ao registrar presença:', error)
    }
}

/**
 * Remove a presença do usuário do grupo
 */
export async function removePresence(groupId: string, userId: string): Promise<void> {
    if (!db) return
    try {
        await deleteDoc(doc(db, 'groups', groupId, 'presence', userId))
    } catch (error) {
        logger.error('Erro ao remover presença:', error)
    }
}
