'use client'

import { memo, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'
import type { MindMapNode, MindMapNodeData } from '@/types'
import { MindMapContext } from './mind-map-context'

const FONT_SIZE_CLASSES = {
    sm: 'text-xs',
    base: 'text-sm',
    lg: 'text-base',
} as const

const SHAPE_CLASSES = {
    rounded: 'rounded-2xl',
    pill: 'rounded-full',
    diamond: 'rotate-45',
} as const

function MindMapNodeInner({ id, data, selected }: NodeProps<MindMapNode>) {
    const { updateNodeData } = useContext(MindMapContext)
    const [isEditing, setIsEditing] = useState(false)
    const [draft, setDraft] = useState(data.label)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const shape = data.shape ?? 'rounded'
    const fontSize = data.fontSize ?? 'base'

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing])

    useEffect(() => {
        if (!isEditing) setDraft(data.label)
    }, [data.label, isEditing])

    const commitEdit = useCallback(() => {
        const trimmed = draft.trim()
        if (trimmed && trimmed !== data.label) {
            updateNodeData(id, { label: trimmed })
        } else {
            setDraft(data.label)
        }
        setIsEditing(false)
    }, [draft, data.label, id, updateNodeData])

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit() }
        if (e.key === 'Escape') { setDraft(data.label); setIsEditing(false) }
    }, [commitEdit, data.label])

    const textContent = (
        <div className="flex items-center justify-center gap-1">
            {data.emoji && (
                <span className="text-base leading-none" aria-hidden="true">
                    {data.emoji}
                </span>
            )}
            {isEditing ? (
                <textarea
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    className={cn(
                        'resize-none bg-transparent outline-none text-center font-semibold leading-snug min-w-[60px] max-w-[200px]',
                        FONT_SIZE_CLASSES[fontSize]
                    )}
                    style={data.textColor ? { color: data.textColor } : undefined}
                    aria-label="Editar rótulo do nó"
                />
            ) : (
                <span
                    className={cn(
                        'font-semibold leading-snug text-center break-words max-w-[200px]',
                        FONT_SIZE_CLASSES[fontSize]
                    )}
                    style={data.textColor ? { color: data.textColor } : undefined}
                >
                    {data.label}
                </span>
            )}
        </div>
    )

    return (
        <div
            onDoubleClick={() => setIsEditing(true)}
            className={cn(
                'relative flex items-center justify-center px-4 py-2.5 min-w-[80px] min-h-[40px]',
                'border-2 cursor-pointer shadow-md transition-all duration-200',
                SHAPE_CLASSES[shape],
                selected
                    ? 'border-primary shadow-primary/30 shadow-lg scale-[1.04]'
                    : 'border-border/60 hover:border-primary/50 hover:shadow-lg',
                !data.color && 'bg-white dark:bg-slate-800'
            )}
            style={data.color ? { backgroundColor: data.color } : undefined}
            title="Duplo clique para editar"
        >
            <Handle
                type="target"
                position={Position.Left}
                className="!w-3 !h-3 !bg-primary/70 !border-2 !border-background !rounded-full"
            />

            {shape === 'diamond' ? (
                <div className="-rotate-45">{textContent}</div>
            ) : (
                textContent
            )}

            <Handle
                type="source"
                position={Position.Right}
                className="!w-3 !h-3 !bg-primary/70 !border-2 !border-background !rounded-full"
            />
        </div>
    )
}

export const MindMapNodeComponent = memo(MindMapNodeInner)
