'use client'

import { useState, useEffect, useRef } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { setPresence, removePresence, type PresenceEntry } from '@/services/group.service'

const HEARTBEAT_INTERVAL = 20_000 // 20s
const ONLINE_THRESHOLD = 45_000   // considera online se visto nos últimos 45s

/**
 * Gerencia a presença em tempo real de membros no grupo.
 * - Escreve/atualiza presença do usuário atual a cada 20s
 * - Remove ao desmontar ou fechar a aba
 * - Retorna lista de membros online (vistos nos últimos 45s), excluindo o próprio usuário
 */
export function usePresence(groupId: string | undefined, userId: string | undefined, displayName: string) {
    const [onlineMembers, setOnlineMembers] = useState<PresenceEntry[]>([])
    const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // Registra presença e inicia heartbeat
    useEffect(() => {
        if (!groupId || !userId || !db) return

        setPresence(groupId, userId, displayName)

        heartbeatRef.current = setInterval(() => {
            setPresence(groupId, userId, displayName)
        }, HEARTBEAT_INTERVAL)

        const cleanup = () => removePresence(groupId, userId)
        window.addEventListener('beforeunload', cleanup)

        return () => {
            if (heartbeatRef.current) clearInterval(heartbeatRef.current)
            window.removeEventListener('beforeunload', cleanup)
            removePresence(groupId, userId)
        }
    }, [groupId, userId, displayName])

    // Escuta presença em tempo real e filtra membros ativos
    useEffect(() => {
        if (!groupId || !userId || !db) return

        const presenceRef = collection(db, 'groups', groupId, 'presence')
        const unsub = onSnapshot(presenceRef, (snapshot) => {
            const now = Date.now()
            const entries: PresenceEntry[] = []

            snapshot.docs.forEach((d) => {
                if (d.id === userId) return // exclui o próprio usuário
                const data = d.data()
                const lastSeen: Date = data.lastSeen?.toDate?.() ?? new Date(0)
                if (now - lastSeen.getTime() < ONLINE_THRESHOLD) {
                    entries.push({
                        userId: d.id,
                        displayName: data.displayName ?? d.id.substring(0, 6),
                        lastSeen,
                        cursorX: typeof data.cursorX === 'number' ? data.cursorX : undefined,
                        cursorY: typeof data.cursorY === 'number' ? data.cursorY : undefined,
                    })
                }
            })

            setOnlineMembers(entries)
        })

        return () => unsub()
    }, [groupId, userId])

    return onlineMembers
}
