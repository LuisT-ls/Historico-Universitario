'use client'

import { useCallback, useRef } from 'react'
import { updateCursorPosition } from '@/services/group.service'

const CURSOR_DEBOUNCE_MS = 50 // 50ms ≈ 20fps de atualização de cursor

interface UseCursorBroadcastOptions {
    groupId: string | undefined
    userId: string | undefined
}

/**
 * Retorna um handler `onPointerMove` debounced que transmite
 * a posição do cursor (em coordenadas de fluxo) para o Firestore.
 *
 * As coordenadas devem ser pré-convertidas de tela para fluxo
 * antes de chamar broadcastCursor.
 */
export function useCursorBroadcast({ groupId, userId }: UseCursorBroadcastOptions) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const broadcastCursor = useCallback(
        (flowX: number, flowY: number) => {
            if (!groupId || !userId) return

            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => {
                updateCursorPosition(groupId, userId, flowX, flowY)
            }, CURSOR_DEBOUNCE_MS)
        },
        [groupId, userId]
    )

    return broadcastCursor
}
