'use client'

import { memo, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import {
    ArrowRight,
    ArrowDown,
    CopyPlus,
    Pencil,
    Trash2,
    Palette,
    Check,
    Copy,
    Plus,
    CheckSquare,
    Paperclip,
    ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { MindMapContext } from './mind-map-context'
import type { MindMapNode } from '@/types'

// ─── Temas WCAG (bg + textColor com contraste garantido) ─────────────────────

const NODE_THEMES = [
    {
        label:   'Padrão',
        bg:      undefined,
        text:    undefined,
        preview: 'bg-white dark:bg-slate-800 border-2 border-dashed border-border/60',
    },
    {
        label:   'Destaque Escuro',
        bg:      '#1e293b',
        text:    '#f8fafc',
        preview: 'bg-[#1e293b]',
    },
    {
        label:   'Alerta',
        bg:      '#fee2e2',
        text:    '#7f1d1d',
        preview: 'bg-[#fee2e2]',
    },
    {
        label:   'Sucesso',
        bg:      '#dcfce7',
        text:    '#14532d',
        preview: 'bg-[#dcfce7]',
    },
    {
        label:   'Atenção',
        bg:      '#fef9c3',
        text:    '#713f12',
        preview: 'bg-[#fef9c3]',
    },
] as const

// ─── Classes de estilo ────────────────────────────────────────────────────────

const FONT_SIZE_CLASSES = {
    sm:   'text-xs',
    base: 'text-sm',
    lg:   'text-base',
} as const

const SHAPE_CLASSES = {
    rounded: 'rounded-2xl',
    pill:    'rounded-full',
    diamond: 'rotate-45',
} as const

// ─── Componente ───────────────────────────────────────────────────────────────

function MindMapNodeInner({
    id,
    data,
    selected,
    positionAbsoluteX,
    positionAbsoluteY,
}: NodeProps<MindMapNode>) {
    const {
        updateNodeData, deleteNode, addChildNode, addSiblingNode,
        duplicateNode, convertToTask, openAttachModal,
        deleteNodes, updateNodesData, getSelectedIds,
    } = useContext(MindMapContext)

    // Retorna o conjunto de IDs a operar:
    // se este nó está selecionado → aplica em todos os selecionados (bulk)
    // caso contrário → opera só neste nó
    const getTargetIds = useCallback(
        () => selected ? getSelectedIds() : [id],
        [selected, id, getSelectedIds]
    )

    const [isEditing, setIsEditing] = useState(false)
    const [draft, setDraft]         = useState(data.label)
    const inputRef                  = useRef<HTMLTextAreaElement>(null)

    const shape    = data.shape    ?? 'rounded'
    const fontSize = data.fontSize ?? 'base'
    const pos      = { x: positionAbsoluteX, y: positionAbsoluteY }

    // Foca o input ao entrar no modo de edição
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing])

    // Sincroniza com atualizações remotas
    useEffect(() => {
        if (!isEditing) setDraft(data.label)
    }, [data.label, isEditing])

    const commitEdit = useCallback(() => {
        const trimmed = draft.trim()
        if (trimmed && trimmed !== data.label) updateNodeData(id, { label: trimmed })
        else setDraft(data.label)
        setIsEditing(false)
    }, [draft, data.label, id, updateNodeData])

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit() }
        if (e.key === 'Escape') { setDraft(data.label); setIsEditing(false) }
    }, [commitEdit, data.label])

    // Bloqueia propagação do clique direito para o canvas não interferir
    const stopRightClick = useCallback((e: React.MouseEvent) => e.stopPropagation(), [])

    const handleCopyText = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(data.label)
            toast.success('Texto copiado!', { duration: 1500 })
        } catch {
            toast.error('Não foi possível copiar o texto.')
        }
    }, [data.label])

    const handleConvertToTask = useCallback(async () => {
        try {
            await convertToTask(data.label)
            toast.success(`Tarefa "${data.label}" criada no Kanban!`, { duration: 3000 })
        } catch {
            toast.error('Não foi possível criar a tarefa.')
        }
    }, [data.label, convertToTask])

    // ── Conteúdo interno do nó ────────────────────────────────────────────────
    const innerContent = (
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
                        'font-semibold leading-snug text-center break-words max-w-[200px] pointer-events-none',
                        FONT_SIZE_CLASSES[fontSize]
                    )}
                    style={data.textColor ? { color: data.textColor } : undefined}
                >
                    {data.label}
                </span>
            )}
        </div>
    )

    // ── Cápsula visual ────────────────────────────────────────────────────────
    const nodeCapsule = (
        <div
            onDoubleClick={() => setIsEditing(true)}
            onContextMenu={stopRightClick}
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
            title="Duplo clique para editar • Clique direito para mais opções"
        >
            <Handle
                type="target"
                position={Position.Left}
                className="!w-3 !h-3 !bg-primary/70 !border-2 !border-background !rounded-full"
            />

            {shape === 'diamond'
                ? <div className="-rotate-45">{innerContent}</div>
                : innerContent
            }

            <Handle
                type="source"
                position={Position.Right}
                className="!w-3 !h-3 !bg-primary/70 !border-2 !border-background !rounded-full"
            />

            {/* Badge de anexos */}
            {data.attachments && data.attachments.length > 0 && (
                <span
                    className="absolute -top-2 -right-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-primary text-primary-foreground text-[9px] font-black rounded-full shadow"
                    title={`${data.attachments.length} material(is) vinculado(s)`}
                >
                    <Paperclip className="h-2.5 w-2.5" />
                    {data.attachments.length}
                </span>
            )}
        </div>
    )

    // ── Menu de contexto ──────────────────────────────────────────────────────
    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {nodeCapsule}
            </ContextMenuTrigger>

            <ContextMenuContent className="w-56 rounded-2xl p-1.5 shadow-2xl">

                {/* ── Grupo 1: Copiar & Editar ── */}
                <ContextMenuLabel>Ações</ContextMenuLabel>

                <ContextMenuItem
                    onClick={handleCopyText}
                    className="gap-2.5 rounded-xl font-semibold cursor-pointer"
                >
                    <Copy className="h-3.5 w-3.5 opacity-60 shrink-0" aria-hidden="true" />
                    Copiar texto
                </ContextMenuItem>

                <ContextMenuItem
                    onClick={() => setIsEditing(true)}
                    className="gap-2.5 rounded-xl font-semibold cursor-pointer"
                >
                    <Pencil className="h-3.5 w-3.5 opacity-60 shrink-0" aria-hidden="true" />
                    Editar texto
                    <Shortcut>2×</Shortcut>
                </ContextMenuItem>

                <ContextMenuSeparator />

                {/* ── Grupo 2: Adicionar Conexão ── */}
                <ContextMenuSub>
                    <ContextMenuSubTrigger className="gap-2.5 rounded-xl font-semibold cursor-pointer">
                        <Plus className="h-3.5 w-3.5 opacity-60 shrink-0" aria-hidden="true" />
                        Adicionar conexão...
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-52 rounded-2xl p-1.5 shadow-2xl">
                        <ContextMenuLabel>Criar nó</ContextMenuLabel>

                        <ContextMenuItem
                            onClick={() => addChildNode(id, pos)}
                            className="gap-2.5 rounded-xl font-semibold cursor-pointer"
                        >
                            <ArrowRight className="h-3.5 w-3.5 text-primary/70 shrink-0" aria-hidden="true" />
                            <div className="flex flex-col">
                                <span>Novo nó filho</span>
                                <span className="text-[10px] font-medium text-muted-foreground leading-tight">
                                    Cria à direita e conecta
                                </span>
                            </div>
                        </ContextMenuItem>

                        <ContextMenuItem
                            onClick={() => addSiblingNode(pos)}
                            className="gap-2.5 rounded-xl font-semibold cursor-pointer"
                        >
                            <ArrowDown className="h-3.5 w-3.5 text-primary/70 shrink-0" aria-hidden="true" />
                            <div className="flex flex-col">
                                <span>Novo nó irmão</span>
                                <span className="text-[10px] font-medium text-muted-foreground leading-tight">
                                    Cria abaixo, sem conexão
                                </span>
                            </div>
                        </ContextMenuItem>

                        <ContextMenuItem
                            onClick={() => duplicateNode(pos, data)}
                            className="gap-2.5 rounded-xl font-semibold cursor-pointer"
                        >
                            <CopyPlus className="h-3.5 w-3.5 text-primary/70 shrink-0" aria-hidden="true" />
                            <div className="flex flex-col">
                                <span>Duplicar nó</span>
                                <span className="text-[10px] font-medium text-muted-foreground leading-tight">
                                    Cópia idêntica com offset
                                </span>
                            </div>
                        </ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>

                <ContextMenuSeparator />

                {/* ── Grupo 3: Tema e Cores WCAG ── */}
                <ContextMenuSub>
                    <ContextMenuSubTrigger className="gap-2.5 rounded-xl font-semibold cursor-pointer">
                        <Palette className="h-3.5 w-3.5 opacity-60 shrink-0" aria-hidden="true" />
                        Tema e cores
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-52 rounded-2xl p-1.5 shadow-2xl">
                        <ContextMenuLabel>Contraste WCAG</ContextMenuLabel>

                        {NODE_THEMES.map(({ label, bg, text, preview }) => {
                            const isActive = data.color === bg
                            return (
                                <ContextMenuItem
                                    key={label}
                                    onClick={() => {
                                        const ids = getTargetIds()
                                        ids.length > 1
                                            ? updateNodesData(ids, { color: bg, textColor: text })
                                            : updateNodeData(id, { color: bg, textColor: text })
                                    }}
                                    className="gap-2.5 rounded-xl font-semibold cursor-pointer"
                                >
                                    {/* Preview da combinação bg + text */}
                                    <span
                                        className={cn(
                                            'w-5 h-5 rounded-md shrink-0 ring-1 ring-inset ring-black/10 flex items-center justify-center text-[8px] font-black',
                                            preview
                                        )}
                                        style={bg ? { color: text } : undefined}
                                        aria-hidden="true"
                                    >
                                        Aa
                                    </span>
                                    <span className="flex-1">{label}</span>
                                    {isActive && (
                                        <Check className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                                    )}
                                </ContextMenuItem>
                            )
                        })}
                    </ContextMenuSubContent>
                </ContextMenuSub>

                <ContextMenuSeparator />

                {/* ── Grupo 4: Integração Kanban ── */}
                <ContextMenuItem
                    onClick={handleConvertToTask}
                    className="gap-2.5 rounded-xl font-semibold cursor-pointer text-emerald-700 dark:text-emerald-400 focus:text-emerald-700 dark:focus:text-emerald-400 focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                >
                    <CheckSquare className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Converter em tarefa
                    <span className="ml-auto text-[10px] font-medium text-muted-foreground opacity-60">Kanban</span>
                </ContextMenuItem>

                <ContextMenuSeparator />

                {/* ── Grupo 5: Materiais vinculados ── */}
                <ContextMenuItem
                    onClick={() => openAttachModal(id, data.attachments)}
                    className="gap-2.5 rounded-xl font-semibold cursor-pointer text-sky-700 dark:text-sky-400 focus:text-sky-700 dark:focus:text-sky-400 focus:bg-sky-50 dark:focus:bg-sky-950/30"
                >
                    <Paperclip className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Vincular material
                    <span className="ml-auto text-[10px] font-medium text-muted-foreground opacity-60">
                        {data.attachments?.length ?? 0}
                    </span>
                </ContextMenuItem>

                {/* Listar anexos existentes */}
                {data.attachments && data.attachments.length > 0 && (
                    <>
                        <ContextMenuSeparator />
                        {data.attachments.map((att) => (
                            <ContextMenuItem
                                key={att.id}
                                onClick={() => window.open(att.url, '_blank', 'noopener,noreferrer')}
                                className="gap-2.5 rounded-xl font-medium cursor-pointer text-xs"
                            >
                                <ExternalLink className="h-3 w-3 opacity-50 shrink-0" aria-hidden="true" />
                                <span className="truncate max-w-[160px]">{att.name}</span>
                            </ContextMenuItem>
                        ))}
                    </>
                )}

                <ContextMenuSeparator />

                {/* ── Grupo 6: Ação destrutiva ── */}
                <ContextMenuItem
                    onClick={() => {
                        const ids = getTargetIds()
                        ids.length > 1 ? deleteNodes(ids) : deleteNode(id)
                    }}
                    className="gap-2.5 rounded-xl font-semibold cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                    <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {selected && getSelectedIds().length > 1
                        ? `Excluir ${getSelectedIds().length} nós`
                        : 'Excluir nó'
                    }
                    <Shortcut>Del</Shortcut>
                </ContextMenuItem>

            </ContextMenuContent>
        </ContextMenu>
    )
}

export const MindMapNodeComponent = memo(MindMapNodeInner)

// ─── Helper inline ────────────────────────────────────────────────────────────
function Shortcut({ children }: { children: React.ReactNode }) {
    return (
        <span className="ml-auto text-xs tracking-widest text-muted-foreground opacity-60">
            {children}
        </span>
    )
}
