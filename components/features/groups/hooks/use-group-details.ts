'use client'

import { useState, useEffect } from 'react'
import { collection, doc, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import {
    addGroupMaterial,
    addGroupTask,
    updateGroupTask,
    deleteGroupTask,
    deleteGroupMaterial,
} from '@/services/group.service'
import type { Group, GroupMaterial, GroupTask, GroupTaskStatus, UserId } from '@/types'
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

    const handleAddTask = async (title: string, description?: string) => {
        if (!user || !group?.id) return
        try {
            await addGroupTask({
                groupId: group.id,
                title,
                description,
                status: 'pending',
                createdBy: user.uid as UserId,
            })
            toast.success('Tarefa adicionada!')
            // onSnapshot atualiza o estado automaticamente
        } catch {
            toast.error('Erro ao adicionar tarefa.')
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
            await updateGroupTask(group.id, taskId, { status })
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

    return {
        group,
        materials,
        tasks,
        isLoading,
        isMaterialsLoading,
        isTasksLoading,
        user,
        handleAddTask,
        handleUpdateTaskStatus,
        handleDeleteTask,
        handleAddMaterial,
        handleDeleteMaterial,
    }
}
