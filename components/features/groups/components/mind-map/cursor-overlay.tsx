'use client'

import { useViewport, useReactFlow } from '@xyflow/react'
import type { PresenceEntry } from '@/services/group.service'

// Paleta de cores para cursores (determinística por userId)
const CURSOR_COLORS = [
    '#6366f1', // indigo
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#ef4444', // red
    '#8b5cf6', // violet
    '#14b8a6', // teal
]

function getCursorColor(userId: string): string {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
        hash = (hash * 31 + userId.charCodeAt(i)) | 0
    }
    return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length]
}

interface CursorOverlayProps {
    members: PresenceEntry[]
}

/**
 * Renderiza cursores dos outros usuários sobre o canvas do React Flow.
 * Usa flowToScreenPosition para converter coordenadas de fluxo → tela,
 * e useViewport() para re-renderizar quando o usuário faz zoom/pan.
 */
export function CursorOverlay({ members }: CursorOverlayProps) {
    // useViewport() garante re-render a cada mudança de zoom/pan
    useViewport()
    const { flowToScreenPosition } = useReactFlow()

    const cursors = members.filter(
        (m) => typeof m.cursorX === 'number' && typeof m.cursorY === 'number'
    )

    if (cursors.length === 0) return null

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {cursors.map((member) => {
                const screen = flowToScreenPosition({
                    x: member.cursorX!,
                    y: member.cursorY!,
                })
                const color = getCursorColor(member.userId)
                const name  = member.displayName.split(' ')[0] // primeiro nome

                return (
                    <div
                        key={member.userId}
                        className="absolute transition-transform duration-75 ease-linear"
                        style={{ left: screen.x, top: screen.y }}
                    >
                        {/* Ícone de cursor SVG */}
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="-translate-x-px -translate-y-px"
                        >
                            <path
                                d="M2 2L8.5 16L10.5 10L16 8.5L2 2Z"
                                fill={color}
                                stroke="white"
                                strokeWidth="1.2"
                            />
                        </svg>

                        {/* Badge com o nome */}
                        <div
                            className="absolute left-3 top-4 px-1.5 py-0.5 rounded-md text-white text-[10px] font-semibold whitespace-nowrap shadow-sm"
                            style={{ backgroundColor: color }}
                        >
                            {name}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
