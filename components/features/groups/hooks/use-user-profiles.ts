'use client'

import { useState, useEffect } from 'react'
import { getProfile } from '@/services/firestore.service'

// Cache em memória compartilhado entre instâncias do hook na mesma sessão
const profileCache = new Map<string, string>()

/**
 * Resolve nomes de exibição de usuários a partir de seus UIDs.
 * Resultados são cacheados em memória para evitar requests redundantes.
 *
 * @param userIds - Lista de UIDs a resolver
 * @returns Função que recebe um UID e retorna o nome ou fragmento do UID como fallback
 */
export function useUserProfiles(userIds: string[]) {
    const [names, setNames] = useState<Map<string, string>>(new Map(profileCache))

    useEffect(() => {
        const missing = userIds.filter((id) => id && !profileCache.has(id))
        if (!missing.length) return

        Promise.all(
            missing.map((id) =>
                getProfile(id)
                    .then((p) => ({ id, name: p?.nome || p?.email?.split('@')[0] || id.substring(0, 6) }))
                    .catch(() => ({ id, name: id.substring(0, 6) }))
            )
        ).then((results) => {
            results.forEach(({ id, name }) => profileCache.set(id, name))
            setNames(new Map(profileCache))
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userIds.join(',')])

    return (userId: string): string => names.get(userId) ?? userId.substring(0, 6)
}
