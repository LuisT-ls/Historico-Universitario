'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
    getGroupById, 
    getGroupMaterials, 
    getGroupTasks, 
    addGroupMaterial, 
    addGroupTask, 
    updateGroupTask, 
    deleteGroupTask, 
    deleteGroupMaterial 
} from '@/services/group.service'
import type { Group, GroupMaterial, GroupTask, UserId } from '@/types'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'

/**
 * Hook para gerenciar o estado e as ações dentro de um grupo específico.
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
    const [isMaterialsLoading, setIsMaterialsLoading] = useState(false)
    const [isTasksLoading, setIsTasksLoading] = useState(false)

    const loadGroupData = useCallback(async () => {
        if (!groupId || !user) return
        
        setIsLoading(true)
        try {
            const data = await getGroupById(groupId)
            
            if (!data) {
                toast.error('Grupo não encontrado.')
                router.push('/grupos')
                return
            }

            // Verificar se o usuário é membro
            if (!data.members.includes(user.uid as UserId)) {
                toast.error('Você não tem permissão para acessar este grupo.')
                router.push('/grupos')
                return
            }

            setGroup(data)
            
            // Carregar sub-coleções em paralelo
            setIsMaterialsLoading(true)
            setIsTasksLoading(true)
            
            const [materialsData, tasksData] = await Promise.all([
                getGroupMaterials(groupId),
                getGroupTasks(groupId)
            ])
            
            setMaterials(materialsData)
            setTasks(tasksData)
        } catch (err) {
            logger.error('Erro ao carregar detalhes do grupo:', err)
            toast.error('Não foi possível carregar os dados do grupo.')
        } finally {
            setIsLoading(false)
            setIsMaterialsLoading(false)
            setIsTasksLoading(false)
        }
    }, [groupId, user, router])

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login')
            } else {
                loadGroupData()
            }
        }
    }, [authLoading, user, loadGroupData, router])

    // --- AÇÕES DE TAREFAS ---

    const handleAddTask = async (title: string, description?: string) => {
        if (!user || !group?.id) return
        try {
            await addGroupTask({
                groupId: group.id,
                title,
                description,
                status: 'pending',
                createdBy: user.uid as UserId
            })
            toast.success('Tarefa adicionada com sucesso!')
            const data = await getGroupTasks(group.id)
            setTasks(data)
        } catch (err) {
            toast.error('Erro ao adicionar tarefa.')
        }
    }

    const handleUpdateTaskStatus = async (taskId: string, status: GroupTask['status']) => {
        if (!group?.id) return
        try {
            await updateGroupTask(group.id, taskId, { status })
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status, updatedAt: new Date() } : t))
        } catch (err) {
            toast.error('Erro ao atualizar tarefa.')
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        if (!group?.id) return
        try {
            await deleteGroupTask(group.id, taskId)
            setTasks(prev => prev.filter(t => t.id !== taskId))
            toast.success('Tarefa removida.')
        } catch (err) {
            toast.error('Erro ao remover tarefa.')
        }
    }

    // --- AÇÕES DE MATERIAIS ---

    const handleAddMaterial = async (title: string, type: 'file' | 'link', url: string, storagePath?: string, sizeBytes?: number) => {
        if (!user || !group?.id) return
        try {
            await addGroupMaterial({
                groupId: group.id,
                title,
                type,
                url,
                storagePath,
                sizeBytes,
                uploadedBy: user.uid as UserId
            })
            toast.success('Material adicionado com sucesso!')
            const data = await getGroupMaterials(group.id)
            setMaterials(data)
        } catch (err) {
            toast.error('Erro ao adicionar material.')
        }
    }

    const handleDeleteMaterial = async (materialId: string) => {
        if (!group?.id) return
        try {
            await deleteGroupMaterial(group.id, materialId)
            setMaterials(prev => prev.filter(m => m.id !== materialId))
            toast.success('Material removido.')
        } catch (err) {
            toast.error('Erro ao remover material.')
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
        refresh: loadGroupData
    }
}
