'use client'

import { useState, useEffect } from 'react'
import { collection, doc, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import {
    addGroupMaterial,
    addGroupTask,
    addTaskComment,
    updateGroupTask,
    deleteGroupTask,
    deleteGroupMaterial,
    leaveGroup,
    updateGroup,
    deleteGroup,
} from '@/services/group.service'
import type { Group, GroupMaterial, GroupTask, GroupTaskStatus, TaskComment, UserId } from '@/types'
import { createGroupId, createGroupMaterialId, createGroupTaskId } from '@/lib/type-constants'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'

/**
 * Hook para gerenciar o estado e as ações dentro de um grupo específico.
 * Usa onSnapshot para atualizações em tempo real — alterações de outros membros
 * aparecem automaticamente sem necessidade de reload.
 */
export function useGroupDetails() {
    const params = useParams()
    const groupId = params.id as string
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()

    const [group, setGroup] = useState<Group | null>(null)
    const [materials, setMaterials] = useState<GroupMaterial[]>([])
    const [tasks, setTasks] = useState<GroupTask[]>([])

    const [isLoading, setIsLoading] = useState(true)
    const [isMaterialsLoading, setIsMaterialsLoading] = useState(true)
    const [isTasksLoading, setIsTasksLoading] = useState(true)

    // Listeners em tempo real para grupo, tarefas e materiais
    useEffect(() => {
        if (authLoading) return

        if (!user) {
            router.push('/login')
            return
        }

        if (!groupId || !db) return

        // --- Listener do documento do grupo ---
        const groupRef = doc(db, 'groups', groupId)
        const unsubGroup = onSnapshot(
            groupRef,
            (snapshot) => {
                if (!snapshot.exists()) {
                    toast.error('Grupo não encontrado.')
                    router.push('/grupos')
                    return
                }

                const data = snapshot.data()

                if (!data.members.includes(user.uid as UserId)) {
                    toast.error('Você não tem permissão para acessar este grupo.')
                    router.push('/grupos')
                    return
                }

                setGroup({
                    id: createGroupId(snapshot.id),
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                    updatedAt: data.updatedAt?.toDate?.() || new Date(),
                } as Group)

                setIsLoading(false)
            },
            (err) => {
                logger.error('Erro no listener do grupo:', err)
                toast.error('Não foi possível carregar os dados do grupo.')
                setIsLoading(false)
            }
        )

        // --- Listener de tarefas ---
        const tasksQuery = query(
            collection(db, 'groups', groupId, 'tasks'),
            orderBy('createdAt', 'desc')
        )
        const unsubTasks = onSnapshot(
            tasksQuery,
            (snapshot) => {
                setTasks(
                    snapshot.docs.map((d) => ({
                        id: createGroupTaskId(d.id),
                        ...d.data(),
                        createdAt: d.data().createdAt?.toDate?.() || new Date(),
                        updatedAt: d.data().updatedAt?.toDate?.() || new Date(),
                        dueDate: d.data().dueDate?.toDate?.(),
                    } as GroupTask))
                )
                setIsTasksLoading(false)
            },
            (err) => {
                logger.error('Erro no listener de tarefas:', err)
                setIsTasksLoading(false)
            }
        )

        // --- Listener de materiais ---
        const materialsQuery = query(
            collection(db, 'groups', groupId, 'materials'),
            orderBy('createdAt', 'desc')
        )
        const unsubMaterials = onSnapshot(
            materialsQuery,
            (snapshot) => {
                setMaterials(
                    snapshot.docs.map((d) => ({
                        id: createGroupMaterialId(d.id),
                        ...d.data(),
                        createdAt: d.data().createdAt?.toDate?.() || new Date(),
                    } as GroupMaterial))
                )
                setIsMaterialsLoading(false)
            },
            (err) => {
                logger.error('Erro no listener de materiais:', err)
                setIsMaterialsLoading(false)
            }
        )

        return () => {
            unsubGroup()
            unsubTasks()
            unsubMaterials()
        }
    }, [groupId, user, authLoading, router])

    // --- AÇÕES DE TAREFAS ---

    const handleAddTask = async (
        title: string,
        description?: string,
        assignedTo?: string,
        dueDate?: Date,
        status: GroupTaskStatus = 'pending'
    ) => {
        if (!user || !group?.id) return
        try {
            await addGroupTask({
                groupId: group.id,
                title,
                description,
                assignedTo: assignedTo as UserId | undefined,
                dueDate,
                status,
                createdBy: user.uid as UserId,
            })
            toast.success('Tarefa adicionada!')
        } catch {
            toast.error('Erro ao adicionar tarefa.')
        }
    }

    const handleAddTaskComment = async (taskId: string, text: string) => {
        if (!group?.id || !user?.uid) return
        const comment: TaskComment = {
            id: `${Date.now()}-${Math.random()}`,
            text: text.trim(),
            authorId: user.uid as UserId,
            createdAt: new Date(),
        }
        // Atualização otimista
        setTasks((prev) => prev.map((t) =>
            t.id === taskId ? { ...t, comments: [...(t.comments ?? []), comment] } : t
        ))
        try {
            await addTaskComment(group.id, taskId, comment)
        } catch {
            setTasks((prev) => prev.map((t) =>
                t.id === taskId ? { ...t, comments: (t.comments ?? []).filter((c) => c.id !== comment.id) } : t
            ))
            toast.error('Erro ao adicionar comentário.')
        }
    }

    const handleUpdateTaskStatus = async (taskId: string, status: GroupTaskStatus) => {
        if (!group?.id) return
        // Atualização otimista para resposta visual imediata
        const previousStatus = tasks.find((t) => t.id === taskId)?.status
        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status, updatedAt: new Date() } : t))
        )
        try {
            const statusLabels: Record<string, string> = {
                pending: 'A fazer',
                in_progress: 'Em andamento',
                completed: 'Concluído',
            }
            // Adiciona labels das colunas customizadas
            group.customColumns?.forEach(col => { statusLabels[col.id] = col.label })
            await updateGroupTask(group.id, taskId, { status }, user?.uid as string, 'status_changed', `→ ${statusLabels[status] ?? status}`)
        } catch {
            // Rollback: restaura status anterior se o Firestore falhar
            if (previousStatus !== undefined) {
                setTasks((prev) =>
                    prev.map((t) => (t.id === taskId ? { ...t, status: previousStatus } : t))
                )
            }
            toast.error('Erro ao atualizar tarefa. Verifique sua conexão.')
        }
    }

    const handleUpdateTask = async (taskId: string, data: Partial<Pick<GroupTask, 'title' | 'description' | 'assignedTo' | 'dueDate' | 'status' | 'color' | 'done' | 'checklist' | 'checklists' | 'links'>>) => {
        if (!group?.id) return
        const currentTask = tasks.find((t) => t.id === taskId)
        const snapshot = [...tasks]
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...data, updatedAt: new Date() } : t)))
        try {
            let action: import('@/types').TaskActivityAction = 'edited'
            let detail: string

            if ('done' in data) {
                action = 'done_toggled'
                detail = data.done ? 'marcou como concluída' : 'desmarcou como concluída'
            } else {
                const changes: string[] = []
                if ('title' in data)       changes.push('alterou o título')
                if ('description' in data) changes.push('alterou a descrição')
                if ('color' in data)       changes.push(data.color ? 'alterou a cor' : 'removeu a cor')
                if ('dueDate' in data)     changes.push(data.dueDate ? 'definiu o prazo' : 'removeu o prazo')
                if ('assignedTo' in data)  changes.push(data.assignedTo ? 'alterou o responsável' : 'removeu o responsável')
                if ('checklists' in data) {
                    const oldTotal = (currentTask?.checklists ?? []).reduce((s, l) => s + l.items.length, 0)
                    const newTotal = (data.checklists ?? []).reduce((s, l) => s + l.items.length, 0)
                    const oldListLen = currentTask?.checklists?.length ?? 0
                    const newListLen = data.checklists?.length ?? 0
                    if (newListLen > oldListLen)      changes.push('adicionou uma lista')
                    else if (newListLen < oldListLen) changes.push('removeu uma lista')
                    else if (newTotal > oldTotal)     changes.push('adicionou um item à lista')
                    else if (newTotal < oldTotal)     changes.push('removeu um item da lista')
                    else                              changes.push('alterou a lista de verificação')
                } else if ('checklist' in data) {
                    const oldLen = currentTask?.checklist?.length ?? 0
                    const newLen = data.checklist?.length ?? 0
                    if (newLen > oldLen)      changes.push('adicionou um item à lista')
                    else if (newLen < oldLen) changes.push('removeu um item da lista')
                    else                      changes.push('alterou a lista de verificação')
                }
                if ('links' in data) {
                    const oldLen = currentTask?.links?.length ?? 0
                    const newLen = data.links?.length ?? 0
                    if (newLen > oldLen)      changes.push('adicionou um link')
                    else if (newLen < oldLen) changes.push('removeu um link')
                    else                      changes.push('alterou um link')
                }
                detail = changes.length > 0 ? changes.join(', ') : 'editou o cartão'
            }

            await updateGroupTask(group.id, taskId, data, user?.uid as string, action, detail)
        } catch {
            setTasks(snapshot)
            toast.error('Erro ao atualizar tarefa.')
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        if (!group?.id) return
        const snapshot = [...tasks] // snapshot para rollback
        setTasks((prev) => prev.filter((t) => t.id !== taskId)) // otimismo
        try {
            await deleteGroupTask(group.id, taskId)
            toast.success('Tarefa removida.')
        } catch {
            setTasks(snapshot) // rollback
            toast.error('Erro ao remover tarefa. Tente novamente.')
        }
    }

    // --- AÇÕES DE MATERIAIS ---

    const handleAddMaterial = async (
        title: string,
        type: 'file' | 'link',
        url: string,
        storagePath?: string,
        sizeBytes?: number
    ) => {
        if (!user || !group?.id) return
        try {
            await addGroupMaterial({
                groupId: group.id,
                title,
                type,
                url,
                storagePath,
                sizeBytes,
                uploadedBy: user.uid as UserId,
            })
            toast.success('Material adicionado!')
            // onSnapshot atualiza o estado automaticamente
        } catch {
            toast.error('Erro ao adicionar material.')
        }
    }

    const handleDeleteMaterial = async (materialId: string) => {
        if (!group?.id) return
        const snapshot = [...materials] // snapshot para rollback
        setMaterials((prev) => prev.filter((m) => m.id !== materialId)) // otimismo
        try {
            await deleteGroupMaterial(group.id, materialId)
            toast.success('Material removido.')
        } catch {
            setMaterials(snapshot) // rollback
            toast.error('Erro ao remover material. Tente novamente.')
        }
    }

    const handleLeaveGroup = async () => {
        if (!user || !group?.id) return
        try {
            await leaveGroup(group.id, user.uid as UserId)
            toast.success('Você saiu do grupo.')
            router.push('/grupos')
        } catch {
            toast.error('Erro ao sair do grupo.')
        }
    }

    const handleUpdateGroup = async (
        data: Partial<Pick<Group, 'name' | 'description' | 'subjectCode' | 'customColumns' | 'columnOrder'>>
    ) => {
        if (!group?.id) return
        try {
            await updateGroup(group.id, data)
            toast.success('Grupo atualizado!')
        } catch {
            toast.error('Erro ao atualizar grupo.')
        }
    }

    const handleDeleteGroup = async () => {
        if (!group?.id) return
        try {
            await deleteGroup(group.id)
            toast.success('Grupo excluído.')
            router.push('/grupos')
        } catch {
            toast.error('Erro ao excluir grupo.')
        }
    }

    return {
        group,
        materials,
        tasks,
        isLoading,
        isMaterialsLoading,
        isTasksLoading,
        user,
        handleAddTask,
        handleUpdateTask,
        handleAddTaskComment,
        handleUpdateTaskStatus,
        handleDeleteTask,
        handleAddMaterial,
        handleDeleteMaterial,
        handleLeaveGroup,
        handleUpdateGroup,
        handleDeleteGroup,
    }
}
