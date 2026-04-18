import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth-provider'
import { getGroupsByUser, joinGroupByCode } from '@/services/group.service'
import type { Group, UserId } from '@/types'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

/**
 * Hook para gerenciar a lógica da página de grupos.
 * Lida com carregamento de lista e ações básicas (entrar/criar).
 */
export function useGroups() {
    const { user, loading: authLoading } = useAuth()
    const [groups, setGroups] = useState<Group[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<{ title: string; message: string } | null>(null)

    const loadGroups = useCallback(async () => {
        if (!user) {
            setIsLoading(false)
            return
        }
        
        setIsLoading(true)
        setError(null)
        
        try {
            const data = await getGroupsByUser(user.uid as UserId)
            setGroups(data)
        } catch (err) {
            logger.error('Erro ao carregar grupos:', err)
            setError({
                title: 'Erro ao carregar grupos',
                message: 'Não foi possível carregar a lista de grupos. Tente novamente mais tarde.'
            })
        } finally {
            setIsLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (!authLoading) {
            loadGroups()
        }
    }, [authLoading, loadGroups])

    /**
     * Tenta entrar em um grupo usando código de convite
     */
    const handleJoinGroup = async (inviteCode: string) => {
        if (!user) return false
        
        try {
            await joinGroupByCode(user.uid as UserId, inviteCode)
            toast.success('Você entrou no grupo com sucesso!')
            await loadGroups()
            return true
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Código de convite inválido')
            return false
        }
    }

    return {
        groups,
        isLoading,
        authLoading,
        error,
        setError,
        user,
        loadGroups,
        handleJoinGroup
    }
}
