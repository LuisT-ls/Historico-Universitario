'use client'

import { GroupTask, GroupTaskStatus, Group, KanbanColumn as KanbanColumnType, TaskActivity, TaskLink } from '@/types'
import { isSafeExternalUrl } from '@/lib/utils/text'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogPortal,
    DialogOverlay,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult,
    type DraggableProvidedDragHandleProps,
} from '@hello-pangea/dnd'
import {
    Plus,
    CheckCircle2,
    Circle,
    Clock,
    Trash2,
    Calendar,
    User as UserIcon,
    Loader2,
    ListTodo,
    X,
    AlignLeft,
    LayoutList,
    Paperclip,
    ExternalLink,
    Bold,
    Italic,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Undo,
    Redo,
    MoreHorizontal,
    ArrowLeft,
    ArrowRight,
    Copy,
    SortAsc,
    SortDesc,
    ArrowUpAZ,
    ArrowDownAZ,
    ChevronRight,
} from 'lucide-react'
import { useState, useRef, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface TaskBoardProps {
    groupId: string
    tasks: GroupTask[]
    isLoading: boolean
    currentUserId: string
    onAdd: (title: string, description?: string, assignedTo?: string, dueDate?: Date, status?: GroupTaskStatus) => Promise<void>
    onUpdate: (taskId: string, data: Partial<Pick<GroupTask, 'title' | 'description' | 'assignedTo' | 'dueDate' | 'status' | 'color' | 'done' | 'checklist' | 'checklists' | 'links'>>) => Promise<void>
    onAddComment: (taskId: string, text: string) => Promise<void>
    onUpdateStatus: (id: string, status: GroupTaskStatus) => Promise<void>
    onDelete: (id: string) => Promise<void>
    members: string[]
    getUserName: (userId: string) => string
    customColumns?: KanbanColumnType[]
    columnOrder?: string[]
    onUpdateGroup?: (data: Partial<Pick<Group, 'name' | 'description' | 'subjectCode' | 'customColumns' | 'columnOrder'>>) => Promise<void>
}

interface ColumnDef {
    id: string
    label: string
    icon: React.ElementType
    color: string
    bg: string
    dot: string
    isCustom?: boolean
}

const CARD_COLORS: { id: string; label: string; hex: string | null }[] = [
    { id: 'none',   label: 'Amarelo (padrão)',   hex: null },
    { id: 'red',    label: 'Vermelho',  hex: '#ef4444' },
    { id: 'orange', label: 'Laranja',   hex: '#f97316' },
    { id: 'yellow', label: 'Amarelo',   hex: '#eab308' },
    { id: 'green',  label: 'Verde',     hex: '#22c55e' },
    { id: 'teal',   label: 'Ciano',     hex: '#14b8a6' },
    { id: 'blue',   label: 'Azul',      hex: '#3b82f6' },
    { id: 'purple', label: 'Roxo',      hex: '#a855f7' },
    { id: 'pink',   label: 'Rosa',      hex: '#ec4899' },
]

const TASK_LABELS: { id: string; name: string; color: string }[] = [
    { id: 'green',  name: 'Concluído',          color: '#22c55e' },
    { id: 'yellow', name: 'Em revisão',          color: '#eab308' },
    { id: 'orange', name: 'Bloqueado',           color: '#f97316' },
    { id: 'red',    name: 'Prioridade',          color: '#ef4444' },
    { id: 'blue',   name: 'Em andamento',        color: '#3b82f6' },
    { id: 'purple', name: 'Design',              color: '#a855f7' },
    { id: 'pink',   name: 'Marketing',           color: '#ec4899' },
    { id: 'gray',   name: 'Informativo',         color: '#94a3b8' },
]

const DEFAULT_COLUMNS: ColumnDef[] = [
    { id: 'pending',     label: 'A fazer',      icon: Circle,       color: 'text-slate-500',   bg: 'bg-slate-100 dark:bg-slate-800',        dot: 'bg-slate-400' },
    { id: 'in_progress', label: 'Em andamento', icon: Clock,        color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/40',         dot: 'bg-blue-500' },
    { id: 'completed',   label: 'Concluído',    icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40',   dot: 'bg-emerald-500' },
]

const CUSTOM_COLUMN_STYLES: { color: string; bg: string; dot: string }[] = [
    { color: 'text-violet-600',  bg: 'bg-violet-50 dark:bg-violet-950/40',  dot: 'bg-violet-500' },
    { color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-950/40',    dot: 'bg-amber-500' },
    { color: 'text-rose-600',    bg: 'bg-rose-50 dark:bg-rose-950/40',      dot: 'bg-rose-500' },
    { color: 'text-cyan-600',    bg: 'bg-cyan-50 dark:bg-cyan-950/40',      dot: 'bg-cyan-500' },
    { color: 'text-orange-600',  bg: 'bg-orange-50 dark:bg-orange-950/40',  dot: 'bg-orange-500' },
    { color: 'text-teal-600',    bg: 'bg-teal-50 dark:bg-teal-950/40',      dot: 'bg-teal-500' },
    { color: 'text-pink-600',    bg: 'bg-pink-50 dark:bg-pink-950/40',      dot: 'bg-pink-500' },
    { color: 'text-indigo-600',  bg: 'bg-indigo-50 dark:bg-indigo-950/40',  dot: 'bg-indigo-500' },
]

function formatDueDate(date: Date): { label: string; overdue: boolean; soon: boolean } {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    const diff = Math.round((d.getTime() - now.getTime()) / 86400000)
    const label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    return { label, overdue: diff < 0, soon: diff >= 0 && diff <= 2 }
}

/**
 * Quadro Kanban estilo Trello — colunas com add inline, cards clicáveis com modal de edição.
 */
export function TaskBoard({ tasks, isLoading, currentUserId, onAdd, onUpdate, onAddComment, onUpdateStatus, onDelete, members, getUserName, customColumns = [], columnOrder, onUpdateGroup }: TaskBoardProps) {
    const [detailTask, setDetailTask] = useState<GroupTask | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [addingColumn, setAddingColumn] = useState(false)
    const [newColumnName, setNewColumnName] = useState('')
    const [compact, setCompact] = useState(false)
    const newColumnRef = useRef<HTMLInputElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)
    const firstColAddRef = useRef<(() => void) | null>(null)

    // Filtros
    const [searchQuery, setSearchQuery] = useState('')
    const [filterLabel, setFilterLabel] = useState<string | null>(null)
    const [filterAssignee, setFilterAssignee] = useState<string | null>(null)
    const [filterDue, setFilterDue] = useState<'overdue' | 'soon' | null>(null)

    const hasFilters = searchQuery.trim() !== '' || filterLabel !== null || filterAssignee !== null || filterDue !== null

    const filteredTasks = useMemo(() => {
        if (!hasFilters) return tasks
        const q = searchQuery.trim().toLowerCase()
        return tasks.filter((t) => {
            if (q && !t.title.toLowerCase().includes(q)) return false
            if (filterLabel && !(t.labels ?? []).includes(filterLabel)) return false
            if (filterAssignee && t.assignedTo !== filterAssignee) return false
            if (filterDue) {
                if (!t.dueDate) return false
                const due = formatDueDate(t.dueDate)
                if (filterDue === 'overdue' && !due.overdue) return false
                if (filterDue === 'soon' && (!due.soon || due.overdue)) return false
            }
            return true
        })
    }, [tasks, searchQuery, filterLabel, filterAssignee, filterDue, hasFilters])

    useEffect(() => { if (addingColumn) newColumnRef.current?.focus() }, [addingColumn])

    // Atalhos de teclado globais
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement).tagName
            const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable
            if (isInput) return
            if (e.key === '/' || e.key === 'f') {
                e.preventDefault()
                searchRef.current?.focus()
            }
            if (e.key === 'n' || e.key === 'N') {
                e.preventDefault()
                firstColAddRef.current?.()
            }
            if (e.key === 'c' || e.key === 'C') {
                setCompact((v) => !v)
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    // Build all column definitions (unordered map)
    const allColumnDefs = useMemo<Record<string, ColumnDef>>(() => {
        const map: Record<string, ColumnDef> = {}
        DEFAULT_COLUMNS.forEach(c => { map[c.id] = c })
        customColumns.forEach((c, i) => {
            const style = CUSTOM_COLUMN_STYLES[i % CUSTOM_COLUMN_STYLES.length]
            map[c.id] = { id: c.id, label: c.label, icon: LayoutList, isCustom: true, ...style }
        })
        return map
    }, [customColumns])

    // Build ordered columns list: use columnOrder if available, else default order
    const columns = useMemo<ColumnDef[]>(() => {
        const defaultOrder = [...DEFAULT_COLUMNS.map(c => c.id), ...customColumns.map(c => c.id)]
        const order = columnOrder ?? defaultOrder
        // Map ordered IDs to ColumnDef, filter out any stale IDs
        const ordered = order
            .filter(id => allColumnDefs[id])
            .map(id => allColumnDefs[id])
        // Add any new columns not yet in the order (e.g. just created)
        const inOrder = new Set(order)
        defaultOrder.forEach(id => { if (!inOrder.has(id) && allColumnDefs[id]) ordered.push(allColumnDefs[id]) })
        return ordered
    }, [columnOrder, allColumnDefs, customColumns])

    const handleToggleDone = (task: GroupTask) => {
        onUpdate(task.id!, { done: !task.done })
    }

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return

        // Column reordering
        if (result.type === 'COLUMN') {
            const newOrder = columns.map(c => c.id)
            const [moved] = newOrder.splice(result.source.index, 1)
            newOrder.splice(result.destination.index, 0, moved)
            onUpdateGroup?.({ columnOrder: newOrder })
            return
        }

        // Card reordering (between columns)
        const newStatus = result.destination.droppableId as GroupTaskStatus
        const task = tasks.find((t) => t.id === result.draggableId)
        if (!task || task.status === newStatus) return
        onUpdateStatus(result.draggableId, newStatus)
    }

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return
        await onDelete(confirmDeleteId)
        setConfirmDeleteId(null)
        setDetailTask(null)
    }

    const handleAddColumn = async () => {
        const label = newColumnName.trim()
        if (!label || !onUpdateGroup) { setAddingColumn(false); return }
        const id = `custom-${Date.now()}`
        const updatedCols = [...customColumns, { id, label }]
        const updatedOrder = [...columns.map(c => c.id), id]
        setNewColumnName('')
        setAddingColumn(false)
        await onUpdateGroup({ customColumns: updatedCols, columnOrder: updatedOrder })
    }

    const handleDeleteColumn = async (colId: string) => {
        if (!onUpdateGroup) return
        const updatedCols = customColumns.filter(c => c.id !== colId)
        const updatedOrder = columns.filter(c => c.id !== colId).map(c => c.id)
        await onUpdateGroup({ customColumns: updatedCols, columnOrder: updatedOrder })
    }

    if (isLoading) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-4">
                {DEFAULT_COLUMNS.map((col) => (
                    <div key={col.id} className="w-72 shrink-0 space-y-3">
                        <div className="h-8 w-32 bg-muted/40 rounded-xl animate-pulse" />
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-muted/40 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <>
            {/* Barra de busca e filtros */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                {/* Busca por texto */}
                <div className="relative flex-1 min-w-[160px] max-w-xs">
                    <ListTodo className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" aria-hidden="true" />
                    <input
                        ref={searchRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar cartão... (/)"
                        className="w-full h-9 pl-8 pr-3 text-sm rounded-xl border border-border/60 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    {searchQuery && (
                        <button type="button" onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Filtro por etiqueta */}
                <div className="flex items-center gap-1 flex-wrap">
                    {TASK_LABELS.map((label) => (
                        <button
                            key={label.id}
                            type="button"
                            onClick={() => setFilterLabel(filterLabel === label.id ? null : label.id)}
                            title={label.name}
                            className={cn(
                                'h-5 w-8 rounded-full border-2 transition-all duration-150',
                                filterLabel === label.id ? 'border-foreground scale-110' : 'border-transparent opacity-50 hover:opacity-80'
                            )}
                            style={{ backgroundColor: label.color }}
                            aria-pressed={filterLabel === label.id}
                            aria-label={label.name}
                        />
                    ))}
                </div>

                {/* Filtro por responsável */}
                {members.length > 0 && (
                    <select
                        value={filterAssignee ?? ''}
                        onChange={(e) => setFilterAssignee(e.target.value || null)}
                        className="h-9 px-3 text-sm rounded-xl border border-border/60 bg-white dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        aria-label="Filtrar por responsável"
                    >
                        <option value="">Responsável</option>
                        {members.map((id) => (
                            <option key={id} value={id}>{getUserName(id)}</option>
                        ))}
                    </select>
                )}

                {/* Filtro por prazo */}
                <div className="flex items-center gap-1">
                    {(['overdue', 'soon'] as const).map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFilterDue(filterDue === type ? null : type)}
                            className={cn(
                                'h-9 px-3 text-xs font-bold rounded-xl border transition-all duration-150',
                                filterDue === type
                                    ? type === 'overdue'
                                        ? 'bg-red-500 text-white border-red-500'
                                        : 'bg-amber-500 text-white border-amber-500'
                                    : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary bg-white dark:bg-slate-900'
                            )}
                            aria-pressed={filterDue === type}
                        >
                            {type === 'overdue' ? 'Atrasados' : 'Próximos'}
                        </button>
                    ))}
                </div>

                {/* Limpar filtros */}
                {hasFilters && (
                    <button
                        type="button"
                        onClick={() => { setSearchQuery(''); setFilterLabel(null); setFilterAssignee(null); setFilterDue(null) }}
                        className="h-9 px-3 text-xs font-bold rounded-xl border border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors bg-white dark:bg-slate-900 flex items-center gap-1.5"
                    >
                        <X className="h-3.5 w-3.5" />
                        Limpar
                    </button>
                )}

                {/* Modo compacto */}
                <button
                    type="button"
                    onClick={() => setCompact((v) => !v)}
                    title={compact ? 'Modo normal (C)' : 'Modo compacto (C)'}
                    aria-pressed={compact}
                    className={cn(
                        'h-9 w-9 rounded-xl border flex items-center justify-center transition-all duration-150 ml-auto shrink-0',
                        compact
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary bg-white dark:bg-slate-900'
                    )}
                >
                    <LayoutList className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="board-columns" direction="horizontal" type="COLUMN">
                    {(boardProvided) => (
                        <div
                            ref={boardProvided.innerRef}
                            {...boardProvided.droppableProps}
                            className="flex gap-4 overflow-x-auto pb-6 -mx-1 px-1 items-start"
                        >
                            {columns.map((col, colIndex) => {
                                const colTasks = filteredTasks.filter((t) => t.status === col.id)
                                return (
                                    <Draggable key={col.id} draggableId={`col-${col.id}`} index={colIndex}>
                                        {(dragProvided, dragSnapshot) => (
                                            <div
                                                ref={dragProvided.innerRef}
                                                {...dragProvided.draggableProps}
                                                className={cn(
                                                    'w-72 shrink-0 transition-shadow',
                                                    dragSnapshot.isDragging && 'shadow-2xl opacity-90 rotate-[2deg]'
                                                )}
                                            >
                                                <KanbanColumn
                                                    col={col}
                                                    tasks={colTasks}
                                                    allTasks={tasks}
                                                    members={members}
                                                    getUserName={getUserName}
                                                    onAdd={onAdd}
                                                    onCardClick={setDetailTask}
                                                    onToggleDone={handleToggleDone}
                                                    compact={compact}
                                                    addTriggerRef={colIndex === 0 ? firstColAddRef : undefined}
                                                    onDeleteColumn={col.isCustom ? () => handleDeleteColumn(col.id) : undefined}
                                                    onMoveLeft={colIndex > 0 ? () => {
                                                        const newOrder = columns.map(c => c.id)
                                                        const [moved] = newOrder.splice(colIndex, 1)
                                                        newOrder.splice(colIndex - 1, 0, moved)
                                                        onUpdateGroup?.({ columnOrder: newOrder })
                                                    } : undefined}
                                                    onMoveRight={colIndex < columns.length - 1 ? () => {
                                                        const newOrder = columns.map(c => c.id)
                                                        const [moved] = newOrder.splice(colIndex, 1)
                                                        newOrder.splice(colIndex + 1, 0, moved)
                                                        onUpdateGroup?.({ columnOrder: newOrder })
                                                    } : undefined}
                                                    dragHandleProps={dragProvided.dragHandleProps}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                )
                            })}
                            {boardProvided.placeholder}

                            {/* Botão para adicionar nova coluna */}
                            <div className="w-72 shrink-0">
                                {addingColumn ? (
                                    <div className="bg-slate-50 dark:bg-slate-900/60 border border-border/50 rounded-2xl p-3 space-y-2">
                                        <Input
                                            ref={newColumnRef}
                                            value={newColumnName}
                                            onChange={(e) => setNewColumnName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddColumn()
                                                if (e.key === 'Escape') { setNewColumnName(''); setAddingColumn(false) }
                                            }}
                                            placeholder="Nome da lista..."
                                            className="h-9 text-sm rounded-xl bg-white dark:bg-slate-800 shadow-sm"
                                        />
                                        <div className="flex gap-1.5">
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={handleAddColumn}
                                                disabled={!newColumnName.trim()}
                                                className="h-8 px-4 rounded-xl text-xs font-bold flex-1 shadow-sm"
                                            >
                                                Criar lista
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => { setNewColumnName(''); setAddingColumn(false) }}
                                                className="h-8 w-8 p-0 rounded-xl"
                                                aria-label="Cancelar"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setAddingColumn(true)}
                                        className={cn(
                                            'w-full flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200',
                                            'border-2 border-dashed border-border/40 text-muted-foreground',
                                            'hover:border-primary/40 hover:text-primary hover:bg-primary/5 hover:border-solid',
                                            'active:scale-[0.98]'
                                        )}
                                        aria-label="Adicionar nova lista"
                                    >
                                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-muted/60 shrink-0">
                                            <Plus className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                        <span>Nova lista</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-border/40 text-center mt-4">
                    <div className="w-16 h-16 bg-muted/40 rounded-[1.5rem] flex items-center justify-center mb-5">
                        <ListTodo className="h-8 w-8 text-muted-foreground/30" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-black mb-2 opacity-70">Nenhuma tarefa ainda</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed font-medium">
                        Clique em <strong>+ Adicionar cartão</strong> em qualquer coluna para começar.
                    </p>
                </div>
            )}

            {/* Modal de detalhe / edição da tarefa */}
            {detailTask && (
                <TaskDetailDialog
                    task={detailTask}
                    columns={columns}
                    members={members}
                    getUserName={getUserName}
                    currentUserId={currentUserId}
                    onUpdate={async (data) => {
                        await onUpdate(detailTask.id!, data)
                        setDetailTask((prev) => prev ? { ...prev, ...data } : prev)
                    }}
                    onAddComment={async (text) => {
                        await onAddComment(detailTask.id!, text)
                        setDetailTask((prev) => prev ? {
                            ...prev,
                            comments: [...(prev.comments ?? []), {
                                id: `${Date.now()}`,
                                text,
                                authorId: currentUserId,
                                createdAt: new Date(),
                            }],
                        } : prev)
                    }}
                    onDelete={() => setConfirmDeleteId(detailTask.id!)}
                    onClose={() => setDetailTask(null)}
                />
            )}

            {/* Confirm delete */}
            <Dialog open={!!confirmDeleteId} onOpenChange={(o) => !o && setConfirmDeleteId(null)}>
                <DialogContent className="sm:max-w-[380px] rounded-[1.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black">Remover tarefa?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground font-medium -mt-2">
                        Esta ação não pode ser desfeita.
                    </p>
                    <div className="flex justify-end gap-2 mt-2">
                        <Button variant="ghost" className="rounded-xl" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
                        <Button variant="destructive" className="rounded-xl" onClick={handleConfirmDelete}>Remover</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

// ─── Coluna Kanban ────────────────────────────────────────────────────────────

type SortOption = 'default' | 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'

function KanbanColumn({
    col,
    tasks,
    allTasks,
    members,
    getUserName,
    onAdd,
    onCardClick,
    onToggleDone,
    onDeleteColumn,
    onMoveLeft,
    onMoveRight,
    compact,
    addTriggerRef,
    dragHandleProps,
}: {
    col: ColumnDef
    tasks: GroupTask[]
    allTasks: GroupTask[]
    members: string[]
    getUserName: (id: string) => string
    onAdd: TaskBoardProps['onAdd']
    onCardClick: (task: GroupTask) => void
    onToggleDone: (task: GroupTask) => void
    onDeleteColumn?: () => void
    onMoveLeft?: () => void
    onMoveRight?: () => void
    compact?: boolean
    addTriggerRef?: React.MutableRefObject<(() => void) | null>
    dragHandleProps?: DraggableProvidedDragHandleProps | null
}) {
    const [adding, setAdding] = useState(false)
    const [title, setTitle] = useState('')
    const [newDueDate, setNewDueDate] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [sortBy, setSortBy] = useState<SortOption>('default')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (adding) inputRef.current?.focus()
    }, [adding])

    useEffect(() => {
        if (addTriggerRef) addTriggerRef.current = () => setAdding(true)
    }, [addTriggerRef])

    const submit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!title.trim()) { setAdding(false); return }
        setSubmitting(true)
        try {
            const due = newDueDate ? new Date(newDueDate + 'T00:00:00') : undefined
            await onAdd(title.trim(), undefined, undefined, due, col.id)
            setTitle('')
            setNewDueDate('')
            setAdding(false)
        } finally {
            setSubmitting(false)
        }
    }

    const cancel = () => { setTitle(''); setNewDueDate(''); setAdding(false) }

    const sortedTasks = useMemo(() => {
        if (sortBy === 'default') return tasks
        return [...tasks].sort((a, b) => {
            if (sortBy === 'date-desc') return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
            if (sortBy === 'date-asc')  return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)
            if (sortBy === 'name-asc')  return a.title.localeCompare(b.title, 'pt-BR')
            if (sortBy === 'name-desc') return b.title.localeCompare(a.title, 'pt-BR')
            return 0
        })
    }, [tasks, sortBy])

    const copyList = () => {
        const text = tasks.map((t) => `• ${t.title}`).join('\n')
        navigator.clipboard.writeText(`${col.label}\n${text}`)
    }

    const Icon = col.icon

    return (
        <div className="w-72 shrink-0 flex flex-col rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border/50">
            {/* Cabeçalho da coluna — serve como drag handle */}
            <div {...(dragHandleProps ?? {})} className="flex items-center gap-2 px-3 pt-3 pb-2 cursor-grab active:cursor-grabbing select-none">
                <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', col.dot)} />
                <span className="text-sm font-black text-foreground flex-1">{col.label}</span>
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full tabular-nums">
                    {tasks.length}
                </span>

                {/* Menu de 3 pontinhos */}
                <DropdownMenu>
                    <DropdownMenuPrimitive.Trigger asChild>
                        <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="text-muted-foreground/50 hover:text-foreground transition-colors p-0.5 rounded-md hover:bg-muted"
                            aria-label="Opções da lista"
                        >
                            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </DropdownMenuPrimitive.Trigger>
                    <DropdownMenuContent align="end" className="w-52 rounded-2xl" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem
                            onClick={() => setAdding(true)}
                            className="gap-2 rounded-xl cursor-pointer"
                        >
                            <Plus className="h-4 w-4 opacity-60" />
                            Adicionar cartão
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Ordenar por */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="gap-2 rounded-xl cursor-pointer">
                                <SortAsc className="h-4 w-4 opacity-60" />
                                Ordenar por
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-52 rounded-2xl">
                                {([
                                    { value: 'date-desc', label: 'Mais recentes primeiro', icon: SortDesc },
                                    { value: 'date-asc',  label: 'Mais antigos primeiro',  icon: SortAsc  },
                                    { value: 'name-asc',  label: 'Nome (A → Z)',            icon: ArrowUpAZ },
                                    { value: 'name-desc', label: 'Nome (Z → A)',            icon: ArrowDownAZ },
                                ] as const).map(({ value, label, icon: Icon }) => (
                                    <DropdownMenuItem
                                        key={value}
                                        onClick={() => setSortBy(value)}
                                        className="gap-2 rounded-xl cursor-pointer"
                                    >
                                        <Icon className="h-4 w-4 opacity-60" />
                                        <span className="flex-1">{label}</span>
                                        {sortBy === value && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                                    </DropdownMenuItem>
                                ))}
                                {sortBy !== 'default' && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => setSortBy('default')}
                                            className="gap-2 rounded-xl cursor-pointer text-muted-foreground"
                                        >
                                            <X className="h-4 w-4 opacity-60" />
                                            Remover ordenação
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={copyList}
                            className="gap-2 rounded-xl cursor-pointer"
                        >
                            <Copy className="h-4 w-4 opacity-60" />
                            Copiar lista
                        </DropdownMenuItem>

                        {(onMoveLeft || onMoveRight) && (
                            <>
                                {onMoveLeft && (
                                    <DropdownMenuItem
                                        onClick={onMoveLeft}
                                        className="gap-2 rounded-xl cursor-pointer"
                                    >
                                        <ArrowLeft className="h-4 w-4 opacity-60" />
                                        Mover para esquerda
                                    </DropdownMenuItem>
                                )}
                                {onMoveRight && (
                                    <DropdownMenuItem
                                        onClick={onMoveRight}
                                        className="gap-2 rounded-xl cursor-pointer"
                                    >
                                        <ArrowRight className="h-4 w-4 opacity-60" />
                                        Mover para direita
                                    </DropdownMenuItem>
                                )}
                            </>
                        )}

                        {onDeleteColumn && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={onDeleteColumn}
                                    className="gap-2 rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Remover lista
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Cards */}
            <Droppable droppableId={col.id} type="CARD">
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                            'flex flex-col gap-2 px-2 transition-all duration-150 rounded-xl',
                            'min-h-[48px]',
                            snapshot.isDraggingOver
                                ? 'bg-primary/8 ring-2 ring-primary/25 ring-inset min-h-[72px]'
                                : 'bg-transparent'
                        )}
                        aria-label={`Coluna ${col.label}`}
                    >
                        {sortedTasks.map((task, index) => (
                            <TaskCard
                                key={task.id!}
                                task={task}
                                index={index}
                                getUserName={getUserName}
                                onClick={() => onCardClick(task)}
                                onToggleDone={() => onToggleDone(task)}
                                compact={compact}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>

            {/* Inline add */}
            <div className="px-2 pb-2 pt-1">
                {adding ? (
                    <form onSubmit={submit} className="flex flex-col gap-1.5">
                        <Input
                            ref={inputRef}
                            placeholder="Título da tarefa..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Escape' && cancel()}
                            className="h-9 text-sm rounded-xl bg-white dark:bg-slate-800 shadow-sm"
                        />
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                            <input
                                type="date"
                                value={newDueDate}
                                onChange={(e) => setNewDueDate(e.target.value)}
                                className="flex-1 h-7 text-xs rounded-lg border border-border/60 bg-white dark:bg-slate-800 px-2 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                                aria-label="Prazo (opcional)"
                            />
                        </div>
                        <div className="flex gap-1.5">
                            <Button
                                type="submit"
                                size="sm"
                                disabled={submitting || !title.trim()}
                                className="h-8 px-4 rounded-xl text-xs font-bold flex-1 shadow-sm"
                            >
                                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Adicionar'}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={cancel}
                                className="h-8 w-8 p-0 rounded-xl"
                                aria-label="Cancelar"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setAdding(true)}
                        className={cn(
                            'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                            'border border-dashed border-border/60 text-muted-foreground',
                            'hover:border-primary/40 hover:text-primary hover:bg-primary/5 hover:border-solid',
                            'active:scale-[0.98]'
                        )}
                    >
                        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-muted group-hover:bg-primary/10 transition-colors shrink-0">
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        <span>Adicionar cartão</span>
                    </button>
                )}
            </div>
        </div>
    )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function TaskCard({
    task,
    index,
    getUserName,
    onClick,
    onToggleDone,
    compact,
}: {
    task: GroupTask
    index: number
    getUserName: (id: string) => string
    onClick: () => void
    onToggleDone: () => void
    compact?: boolean
}) {
    const isDone = task.done === true
    const due = task.dueDate ? formatDueDate(task.dueDate) : null

    const cardBg = task.color || '#fef9c3'
    const contrast = getTextContrast(cardBg)
    const isDark = contrast === 'dark'

    // Detect drag-end for settle animation
    const wasDraggingRef = useRef(false)
    const [justDropped, setJustDropped] = useState(false)

    return (
        <Draggable draggableId={task.id!} index={index}>
            {(provided, snapshot) => {
                if (wasDraggingRef.current && !snapshot.isDragging) {
                    wasDraggingRef.current = false
                    // Schedule animation trigger after render
                    setTimeout(() => { setJustDropped(true); setTimeout(() => setJustDropped(false), 320) }, 0)
                }
                if (snapshot.isDragging) wasDraggingRef.current = true

                return (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                        ...provided.draggableProps.style,
                        backgroundColor: cardBg,
                        boxShadow: snapshot.isDragging
                            ? '4px 8px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)'
                            : '2px 3px 8px rgba(0,0,0,0.13), 0 0 0 1px rgba(0,0,0,0.04)',
                        animation: justDropped ? 'card-settle 300ms ease-out' : undefined,
                    }}
                    className={cn(
                        'rounded-sm relative select-none overflow-hidden',
                        'transition-[transform,box-shadow] duration-200',
                        snapshot.isDragging
                            ? 'cursor-grabbing rotate-2 scale-[1.04] opacity-95'
                            : 'cursor-grab hover:-translate-y-0.5 hover:scale-[1.01]',
                        isDone && 'opacity-75'
                    )}
                    onClick={onClick}
                    aria-label={`Tarefa: ${task.title}. Segure e arraste para mover de coluna, ou clique para editar.`}
                >
                    {compact ? (
                        /* ── Modo compacto: linha única sem ornamentos ── */
                        <div
                            className="flex items-center gap-2 px-2.5 py-1.5"
                            style={{ color: isDark ? '#1e293b' : '#ffffff' }}
                        >
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onToggleDone() }}
                                aria-label={isDone ? 'Desmarcar como concluída' : 'Marcar como concluída'}
                                className={cn(
                                    'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150',
                                    isDone
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : isDark
                                            ? 'border-current/40 bg-black/10 hover:border-emerald-600'
                                            : 'border-white/60 bg-white/20 hover:border-emerald-300'
                                )}
                                style={{ borderColor: isDone ? undefined : 'currentColor' }}
                            >
                                {isDone && <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />}
                            </button>
                            <p className={cn(
                                'text-xs font-semibold leading-tight truncate flex-1',
                                isDone && 'line-through opacity-50'
                            )}>
                                {task.title}
                            </p>
                            {/* Mini-indicators */}
                            <div className="flex items-center gap-1 shrink-0 opacity-50">
                                {task.labels && task.labels.length > 0 && (
                                    <span className="flex gap-0.5">
                                        {task.labels.slice(0, 3).map((id) => {
                                            const l = TASK_LABELS.find((x) => x.id === id)
                                            return l ? <span key={id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color }} /> : null
                                        })}
                                    </span>
                                )}
                                {due && (
                                    <span className={cn(
                                        'text-[9px] font-bold px-1 py-0.5 rounded',
                                        due.overdue ? 'bg-red-500/25' : due.soon ? 'bg-amber-500/25' : 'bg-black/10'
                                    )}>
                                        {due.label}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* ── Modo normal: post-it completo ── */
                        <>
                            {/* Faixa superior (efeito adesivo) */}
                            <div
                                className="h-5 w-full shrink-0"
                                style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}
                                aria-hidden="true"
                            />

                            {/* Etiquetas */}
                            {task.labels && task.labels.length > 0 && (
                                <div className="flex flex-wrap gap-1 px-3 pt-2">
                                    {task.labels.map((labelId) => {
                                        const label = TASK_LABELS.find((l) => l.id === labelId)
                                        if (!label) return null
                                        return (
                                            <span
                                                key={labelId}
                                                className="h-2 w-10 rounded-full opacity-80"
                                                style={{ backgroundColor: label.color }}
                                                title={label.name}
                                                aria-label={label.name}
                                            />
                                        )
                                    })}
                                </div>
                            )}

                            <div
                                className="px-3 pb-4 pt-2.5 space-y-2.5"
                                style={{ color: isDark ? '#1e293b' : '#ffffff' }}
                            >
                                {/* Título + botão de conclusão */}
                                <div className="flex items-start gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onToggleDone() }}
                                        aria-label={isDone ? 'Desmarcar como concluída' : 'Marcar como concluída'}
                                        className={cn(
                                            'mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150',
                                            isDone
                                                ? 'bg-emerald-500 border-emerald-500 text-white scale-110 shadow shadow-emerald-500/40'
                                                : isDark
                                                    ? 'border-current/40 bg-black/10 hover:border-emerald-600 hover:bg-black/20 hover:scale-110'
                                                    : 'border-white/60 bg-white/20 hover:border-emerald-300 hover:bg-white/30 hover:scale-110'
                                        )}
                                        style={{ borderColor: isDone ? undefined : 'currentColor', opacity: isDone ? 1 : undefined }}
                                    >
                                        {isDone && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
                                    </button>
                                    <p className={cn(
                                        'text-sm font-bold leading-normal flex-1',
                                        isDone && 'line-through opacity-50'
                                    )}>
                                        {task.title}
                                    </p>
                                </div>

                                {/* Indicators row */}
                                {(
                                    (task.description && stripHtml(task.description)) ||
                                    (task.checklists && task.checklists.length > 0) ||
                                    (task.links && task.links.length > 0)
                                ) && (
                                    <div className="flex items-center gap-2 flex-wrap opacity-60">
                                        {task.description && stripHtml(task.description) && (
                                            <AlignLeft className="h-3.5 w-3.5" aria-label="Contém descrição" />
                                        )}
                                        {task.checklists && task.checklists.length > 0 && (() => {
                                            const allItems = task.checklists.flatMap((l) => l.items)
                                            const doneItems = allItems.filter((i) => i.done).length
                                            return (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold">
                                                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                    {doneItems}/{allItems.length}
                                                </span>
                                            )
                                        })()}
                                        {task.links && task.links.length > 0 && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold">
                                                <Paperclip className="h-3 w-3" aria-hidden="true" />
                                                {task.links.length}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Footer: due date + assignee */}
                                {(due || task.assignedTo) && (
                                    <div className="flex items-center justify-between gap-2 pt-0.5">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {due && (
                                                <span className={cn(
                                                    'inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                                                    due.overdue
                                                        ? 'bg-red-500/25'
                                                        : due.soon
                                                            ? 'bg-amber-500/25'
                                                            : 'bg-black/10'
                                                )}>
                                                    <Calendar className="h-2.5 w-2.5" aria-hidden="true" />
                                                    {due.label}
                                                </span>
                                            )}
                                        </div>

                                        {task.assignedTo && (
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black uppercase shrink-0 bg-black/15"
                                                title={getUserName(task.assignedTo)}
                                                aria-label={`Responsável: ${getUserName(task.assignedTo)}`}
                                            >
                                                {getUserName(task.assignedTo).substring(0, 2)}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Cantinho dobrado */}
                            <div
                                className="absolute bottom-0 right-0 w-5 h-5"
                                aria-hidden="true"
                                style={{
                                    background: `linear-gradient(225deg, rgba(0,0,0,0.12) 50%, transparent 50%)`,
                                }}
                            />
                        </>
                    )}
                </div>
                )
            }}
        </Draggable>
    )
}

// ─── Editor WYSIWYG de Descrição ─────────────────────────────────────────────

/** Retorna 'dark' se o texto deve ser escuro sobre a cor de fundo, ou 'light' se deve ser claro */
function getTextContrast(hex: string): 'dark' | 'light' {
    const clean = hex.replace('#', '')
    const r = parseInt(clean.substring(0, 2), 16) / 255
    const g = parseInt(clean.substring(2, 4), 16) / 255
    const b = parseInt(clean.substring(4, 6), 16) / 255
    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
    return L > 0.40 ? 'dark' : 'light'
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
}

interface DescriptionEditorProps {
    initialContent: string
    editable: boolean
    onChange: (html: string) => void
    onClickEdit: () => void
}

function DescriptionEditor({ initialContent, editable, onChange, onClickEdit }: DescriptionEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: false }),
            Placeholder.configure({ placeholder: 'Clique para adicionar uma descrição...' }),
        ],
        content: initialContent || '',
        editable,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'tiptap-content min-h-[80px] px-3 py-2.5 text-sm leading-relaxed focus:outline-none',
                'data-placeholder': 'Clique para adicionar uma descrição...',
            },
        },
    })

    // Sync editable state when it changes
    useEffect(() => {
        if (!editor) return
        editor.setEditable(editable)
        if (editable) {
            requestAnimationFrame(() => {
                editor.commands.focus('end')
            })
        }
    }, [editor, editable])

    // Reset content when task changes (cancel)
    useEffect(() => {
        if (!editor || editable) return
        const current = editor.getHTML()
        if (current !== initialContent) {
            editor.commands.setContent(initialContent || '')
        }
    }, [editor, initialContent, editable])

    const toolbarBtn = (
        active: boolean,
        onClick: () => void,
        icon: React.ReactNode,
        label: string
    ) => (
        <button
            type="button"
            title={label}
            aria-label={label}
            onMouseDown={(e) => { e.preventDefault(); onClick() }}
            className={cn(
                'w-7 h-7 flex items-center justify-center rounded-md transition-colors',
                active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80'
            )}
        >
            {icon}
        </button>
    )

    return (
        <div className="rounded-xl border border-border overflow-hidden ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
            {/* Toolbar — só aparece no modo de edição */}
            {editable && editor && (
                <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/20">
                    {toolbarBtn(editor.isActive('bold'),   () => editor.chain().focus().toggleBold().run(),          <Bold className="h-3.5 w-3.5" />,          'Negrito (Ctrl+B)')}
                    {toolbarBtn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(),        <Italic className="h-3.5 w-3.5" />,        'Itálico (Ctrl+I)')}
                    {toolbarBtn(editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(),        <Strikethrough className="h-3.5 w-3.5" />, 'Tachado')}
                    <span className="w-px h-4 bg-border mx-1 shrink-0" aria-hidden="true" />
                    {toolbarBtn(editor.isActive('code'),   () => editor.chain().focus().toggleCode().run(),          <Code className="h-3.5 w-3.5" />,          'Código inline')}
                    <span className="w-px h-4 bg-border mx-1 shrink-0" aria-hidden="true" />
                    {toolbarBtn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(),  <List className="h-3.5 w-3.5" />,          'Lista não ordenada')}
                    {toolbarBtn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered className="h-3.5 w-3.5" />,   'Lista ordenada')}
                    <span className="w-px h-4 bg-border mx-1 shrink-0" aria-hidden="true" />
                    {toolbarBtn(false, () => editor.chain().focus().undo().run(), <Undo className="h-3.5 w-3.5" />, 'Desfazer (Ctrl+Z)')}
                    {toolbarBtn(false, () => editor.chain().focus().redo().run(), <Redo className="h-3.5 w-3.5" />, 'Refazer (Ctrl+Y)')}
                </div>
            )}

            {/* Área do editor */}
            <div
                onClick={!editable ? onClickEdit : undefined}
                className={cn(
                    'relative',
                    !editable && 'cursor-text group'
                )}
            >
                {!editable && editor?.isEmpty ? (
                    <p className="px-3 py-2.5 text-sm text-muted-foreground/50 min-h-[80px]">
                        Clique para adicionar uma descrição...
                    </p>
                ) : (
                    <EditorContent editor={editor} />
                )}
                {!editable && !editor?.isEmpty && (
                    <span className="absolute top-2 right-2 text-[10px] font-semibold text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors pointer-events-none">
                        Clique para editar
                    </span>
                )}
            </div>
        </div>
    )
}

// ─── Modal de Detalhe ─────────────────────────────────────────────────────────

function TaskDetailDialog({
    task,
    columns,
    members,
    getUserName,
    currentUserId,
    onUpdate,
    onAddComment,
    onDelete,
    onClose,
}: {
    task: GroupTask
    columns: ColumnDef[]
    members: string[]
    getUserName: (id: string) => string
    currentUserId: string
    onUpdate: (data: Partial<Pick<GroupTask, 'title' | 'description' | 'assignedTo' | 'dueDate' | 'status' | 'color' | 'done' | 'checklist' | 'checklists' | 'links' | 'labels'>>) => Promise<void>
    onAddComment: (text: string) => Promise<void>
    onDelete: () => void
    onClose: () => void
}) {
    const [title, setTitle] = useState(task.title)
    const [editingTitle, setEditingTitle] = useState(false)
    const [description, setDescription] = useState(task.description ?? '')
    const [editingDesc, setEditingDesc] = useState(false)
    const [assignedTo, setAssignedTo] = useState(task.assignedTo ?? '')
    const [dueDate, setDueDate] = useState(
        task.dueDate ? task.dueDate.toISOString().split('T')[0] : ''
    )
    const [mobilePanel, setMobilePanel] = useState<'details' | 'comments'>('details')
    const [comments, setComments] = useState<import('@/types').TaskComment[]>(task.comments ?? [])
    const [commentText, setCommentText] = useState('')
    const [submittingComment, setSubmittingComment] = useState(false)
    const commentsEndRef = useRef<HTMLDivElement>(null)

    const [links, setLinks] = useState<TaskLink[]>(task.links ?? [])
    const [addingLink, setAddingLink] = useState(false)
    const [newLinkUrl, setNewLinkUrl] = useState('')
    const [newLinkLabel, setNewLinkLabel] = useState('')
    const [linkUrlError, setLinkUrlError] = useState(false)
    const [cardColor, setCardColor] = useState(task.color ?? '')
    const [selectedLabels, setSelectedLabels] = useState<string[]>(task.labels ?? [])
    const [showLabels, setShowLabels] = useState(false)
    const newLinkRef = useRef<HTMLInputElement>(null)
    const [saving, setSaving] = useState(false)
    const titleRef = useRef<HTMLInputElement>(null)

    // Checklists
    const [checklists, setChecklists] = useState<import('@/types').Checklist[]>(
        task.checklists && task.checklists.length > 0 ? task.checklists : []
    )
    const [addingItemFor, setAddingItemFor] = useState<string | null>(null)
    const [newItemText, setNewItemText] = useState('')
    const [addingList, setAddingList] = useState(false)
    const [newListTitle, setNewListTitle] = useState('')
    const newItemRef = useRef<HTMLInputElement>(null)
    const newListRef = useRef<HTMLInputElement>(null)

    useEffect(() => { if (editingTitle) titleRef.current?.focus() }, [editingTitle])
    useEffect(() => { if (addingLink) newLinkRef.current?.focus() }, [addingLink])

    const save = async (patch: Partial<Pick<GroupTask, 'title' | 'description' | 'assignedTo' | 'dueDate' | 'status' | 'color' | 'done' | 'checklist' | 'checklists' | 'links' | 'labels'>>) => {
        setSaving(true)
        try { await onUpdate(patch) } finally { setSaving(false) }
    }

    const commitTitle = async () => {
        setEditingTitle(false)
        if (title.trim() && title.trim() !== task.title) await save({ title: title.trim() })
        else setTitle(task.title)
    }

    const saveDesc = async () => {
        const html = description
        // Trata conteúdo vazio do editor (<p></p>) como ausência de descrição
        const isEmpty = !html || html === '<p></p>'
        const val = isEmpty ? undefined : html
        if (val !== task.description) await save({ description: val })
        setEditingDesc(false)
    }

    const cancelDesc = () => {
        setDescription(task.description ?? '')
        setEditingDesc(false)
    }

    const handleAssigneeChange = async (val: string) => {
        setAssignedTo(val)
        await save({ assignedTo: (val || undefined) as import('@/types').UserId | undefined })
    }

    const handleDueDateChange = async (val: string) => {
        setDueDate(val)
        await save({ dueDate: val ? new Date(val + 'T00:00:00') : undefined })
    }

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [comments])

    const submitComment = async () => {
        const text = commentText.trim()
        if (!text) return
        setSubmittingComment(true)
        const optimistic: import('@/types').TaskComment = {
            id: `${Date.now()}`,
            text,
            authorId: currentUserId,
            createdAt: new Date(),
        }
        setComments((prev) => [...prev, optimistic])
        setCommentText('')
        try {
            await onAddComment(text)
        } catch {
            setComments((prev) => prev.filter((c) => c.id !== optimistic.id))
            setCommentText(text)
        } finally {
            setSubmittingComment(false)
        }
    }


    const saveLinks = async (updated: TaskLink[]) => {
        setLinks(updated)
        await save({ links: updated })
    }

    const addLink = async () => {
        const url = newLinkUrl.trim()
        if (!url) { setAddingLink(false); return }
        if (!isSafeExternalUrl(url)) { setLinkUrlError(true); return }
        const updated: TaskLink[] = [...links, { id: `${Date.now()}-${Math.random()}`, url, label: newLinkLabel.trim() || undefined }]
        setNewLinkUrl('')
        setNewLinkLabel('')
        setLinkUrlError(false)
        await saveLinks(updated)
        newLinkRef.current?.focus()
    }

    const deleteLink = (id: string) => {
        saveLinks(links.filter((l) => l.id !== id))
    }

    // ── Checklist helpers ──
    useEffect(() => { if (addingItemFor) newItemRef.current?.focus() }, [addingItemFor])
    useEffect(() => { if (addingList) newListRef.current?.focus() }, [addingList])

    const saveChecklists = async (updated: import('@/types').Checklist[]) => {
        setChecklists(updated)
        await save({ checklists: updated })
    }

    const toggleChecklistItem = (listId: string, itemId: string) => {
        const updated = checklists.map((l) =>
            l.id !== listId ? l : {
                ...l,
                items: l.items.map((i) => i.id === itemId ? { ...i, done: !i.done } : i),
            }
        )
        saveChecklists(updated)
    }

    const addChecklistItem = (listId: string) => {
        const text = newItemText.trim()
        if (!text) { setAddingItemFor(null); return }
        const updated = checklists.map((l) =>
            l.id !== listId ? l : {
                ...l,
                items: [...l.items, { id: `${Date.now()}-${Math.random()}`, text, done: false }],
            }
        )
        setNewItemText('')
        saveChecklists(updated)
    }

    const deleteChecklistItem = (listId: string, itemId: string) => {
        const updated = checklists.map((l) =>
            l.id !== listId ? l : { ...l, items: l.items.filter((i) => i.id !== itemId) }
        )
        saveChecklists(updated)
    }

    const addChecklist = () => {
        const title = newListTitle.trim()
        if (!title) { setAddingList(false); return }
        const updated = [...checklists, { id: `${Date.now()}-${Math.random()}`, title, items: [] }]
        setNewListTitle('')
        setAddingList(false)
        saveChecklists(updated)
    }

    const deleteChecklist = (listId: string) => {
        saveChecklists(checklists.filter((l) => l.id !== listId))
    }

    const currentCol = columns.find((c) => c.id === task.status) ?? DEFAULT_COLUMNS[0]

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogPortal>
                <DialogOverlay />
                <DialogPrimitive.Content
                    aria-describedby={undefined}
                    className={cn(
                        // Sempre centralizado
                        'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 focus:outline-none',
                        // Animações
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                        'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
                        'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
                        // Visual
                        'bg-background border border-border/50 rounded-[1.5rem] shadow-2xl overflow-hidden',
                        // Tamanho responsivo
                        'w-[calc(100vw-1rem)] max-h-[calc(100vh-1rem)] flex flex-col',
                        'md:w-full md:max-w-[900px] md:max-h-[82vh] md:flex-row',
                    )}
                >
                    {/* Faixa de cor — topo (mobile) / escondida no desktop pois cada painel tem a sua */}
                    <div className={cn('h-1 w-full shrink-0 md:hidden', currentCol.dot)} />

                    {/* Abas — mobile only */}
                    <div className="flex shrink-0 border-b border-border/60 md:hidden">
                        <button
                            type="button"
                            onClick={() => setMobilePanel('details')}
                            className={cn(
                                'flex-1 py-2.5 text-xs font-bold transition-colors border-b-2 -mb-px',
                                mobilePanel === 'details'
                                    ? 'text-foreground border-primary'
                                    : 'text-muted-foreground border-transparent hover:text-foreground'
                            )}
                        >
                            Detalhes
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobilePanel('comments')}
                            className={cn(
                                'flex-1 py-2.5 text-xs font-bold transition-colors border-b-2 -mb-px',
                                mobilePanel === 'comments'
                                    ? 'text-foreground border-primary'
                                    : 'text-muted-foreground border-transparent hover:text-foreground'
                            )}
                        >
                            Comentários{comments.length > 0 ? ` (${comments.length})` : ''}
                        </button>
                    </div>

                    {/* Botão fechar */}
                    <DialogPrimitive.Close className="absolute right-3 top-3 z-20 rounded-md opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-muted p-1">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Fechar</span>
                    </DialogPrimitive.Close>

                {/* ── Painel de detalhes ── */}
                <div className={cn(
                    'flex-col flex-1 min-h-0 overflow-hidden',
                    mobilePanel === 'details' ? 'flex' : 'hidden',
                    'md:flex md:flex-1 md:min-h-0',
                )}>
                    {/* Faixa de cor — desktop */}
                    <div className={cn('h-1.5 w-full shrink-0 hidden md:block', currentCol.dot)} />
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    <DialogHeader className="space-y-1">
                        {/* Título editável */}
                        {editingTitle ? (
                            <Input
                                ref={titleRef}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={commitTitle}
                                onKeyDown={(e) => { if (e.key === 'Enter') commitTitle(); if (e.key === 'Escape') { setTitle(task.title); setEditingTitle(false) } }}
                                className="text-xl font-black border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                                aria-label="Editar título"
                            />
                        ) : (
                            <DialogTitle
                                className="text-xl font-black leading-snug cursor-text hover:opacity-70 transition-opacity text-left"
                                onClick={() => setEditingTitle(true)}
                                title="Clique para editar o título"
                            >
                                {title}
                            </DialogTitle>
                        )}
                        <p className="text-xs text-muted-foreground font-medium">
                            Criado por {getUserName(task.createdBy)}
                        </p>
                    </DialogHeader>

                    {/* Indicador de coluna atual + campos */}
                    <div className="flex items-center gap-2 px-1">
                        <span className={cn('w-2 h-2 rounded-full shrink-0', currentCol.dot)} />
                        <span className={cn('text-xs font-bold uppercase tracking-widest', currentCol.color)}>
                            {currentCol.label}
                        </span>
                        <span className="text-xs text-muted-foreground/50 font-medium">— arraste o cartão para mudar</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Responsável */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                <UserIcon className="h-3 w-3 inline-block mr-1" aria-hidden="true" />
                                Responsável
                            </Label>
                            <Select
                                value={assignedTo}
                                onChange={(e) => handleAssigneeChange(e.target.value)}
                                className="h-9 rounded-xl text-sm"
                                aria-label="Responsável"
                            >
                                <option value="">Todos</option>
                                {members.map((id) => (
                                    <option key={id} value={id}>{getUserName(id)}</option>
                                ))}
                            </Select>
                        </div>

                        {/* Prazo */}
                        <div className="space-y-1.5">
                            <Label htmlFor="detail-due" className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                <Calendar className="h-3 w-3 inline-block mr-1" aria-hidden="true" />
                                Prazo
                            </Label>
                            <Input
                                id="detail-due"
                                type="date"
                                value={dueDate}
                                onChange={(e) => handleDueDateChange(e.target.value)}
                                className="h-9 rounded-xl text-sm"
                            />
                        </div>
                    </div>

                    {/* Etiquetas */}
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => setShowLabels((v) => !v)}
                            className="flex items-center justify-between w-full group"
                        >
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60 cursor-pointer flex items-center gap-1.5">
                                Etiquetas
                                {selectedLabels.length > 0 && (
                                    <span className="flex gap-1 ml-1">
                                        {selectedLabels.map((id) => {
                                            const l = TASK_LABELS.find((x) => x.id === id)
                                            return l ? (
                                                <span key={id} className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: l.color }} />
                                            ) : null
                                        })}
                                    </span>
                                )}
                            </Label>
                            <span className="text-[10px] font-semibold text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                                {showLabels ? 'Fechar' : 'Editar'}
                            </span>
                        </button>

                        {showLabels && (
                            <div className="space-y-1">
                                {TASK_LABELS.map((label) => {
                                    const active = selectedLabels.includes(label.id)
                                    return (
                                        <button
                                            key={label.id}
                                            type="button"
                                            onClick={async () => {
                                                const updated = active
                                                    ? selectedLabels.filter((id) => id !== label.id)
                                                    : [...selectedLabels, label.id]
                                                setSelectedLabels(updated)
                                                await save({ labels: updated.length > 0 ? updated : undefined })
                                            }}
                                            className={cn(
                                                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors text-left',
                                                active ? 'bg-muted' : 'hover:bg-muted/60'
                                            )}
                                            aria-pressed={active}
                                        >
                                            <span
                                                className="w-10 h-4 rounded shrink-0"
                                                style={{ backgroundColor: label.color }}
                                                aria-hidden="true"
                                            />
                                            <span className="flex-1 text-sm font-medium">{label.name}</span>
                                            {active && (
                                                <svg className="w-4 h-4 text-foreground shrink-0" fill="none" viewBox="0 0 16 16">
                                                    <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Cor do card */}
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">
                            Cor do card
                        </Label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {CARD_COLORS.map(({ id, label, hex }) => (
                                <button
                                    key={id}
                                    type="button"
                                    title={label}
                                    aria-label={label}
                                    onClick={async () => {
                                        const newColor = hex ?? ''
                                        setCardColor(newColor)
                                        await save({ color: newColor || undefined })
                                    }}
                                    className={cn(
                                        'w-6 h-6 rounded-full border-2 transition-all duration-150',
                                        cardColor === (hex ?? '')
                                            ? 'border-foreground scale-110 shadow-md'
                                            : 'border-transparent hover:scale-110 hover:border-muted-foreground/40'
                                    )}
                                    style={hex ? { backgroundColor: hex } : undefined}
                                >
                                    {!hex && (
                                        <span className="w-full h-full rounded-full border border-border/60 flex items-center justify-center bg-muted">
                                            <span className="w-4 border-t border-muted-foreground/40 rotate-45 block" />
                                        </span>
                                    )}
                                </button>
                            ))}

                            {/* Seletor de cor personalizada */}
                            <label
                                title="Cor personalizada"
                                aria-label="Cor personalizada"
                                className={cn(
                                    'w-6 h-6 rounded-full border-2 cursor-pointer transition-all duration-150 overflow-hidden relative',
                                    !CARD_COLORS.some(({ hex }) => hex && cardColor === hex) && cardColor
                                        ? 'border-foreground scale-110 shadow-md'
                                        : 'border-transparent hover:scale-110 hover:border-muted-foreground/40'
                                )}
                                style={
                                    !CARD_COLORS.some(({ hex }) => hex && cardColor === hex) && cardColor
                                        ? { backgroundColor: cardColor }
                                        : undefined
                                }
                            >
                                {!((!CARD_COLORS.some(({ hex }) => hex && cardColor === hex)) && cardColor) && (
                                    <span className="w-full h-full rounded-full border border-border/60 flex items-center justify-center bg-muted absolute inset-0">
                                        <Plus className="h-3 w-3 text-muted-foreground/60" aria-hidden="true" />
                                    </span>
                                )}
                                <input
                                    type="color"
                                    value={cardColor || '#fef9c3'}
                                    onChange={async (e) => {
                                        const newColor = e.target.value
                                        setCardColor(newColor)
                                        await save({ color: newColor })
                                    }}
                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                    aria-label="Escolher cor personalizada"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">
                            <AlignLeft className="h-3 w-3 inline-block mr-1" aria-hidden="true" />
                            Descrição
                        </Label>

                        <DescriptionEditor
                            initialContent={task.description ?? ''}
                            editable={editingDesc}
                            onChange={setDescription}
                            onClickEdit={() => setEditingDesc(true)}
                        />

                        {editingDesc && (
                            <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-muted-foreground/60 font-medium">
                                    Ctrl+Enter para salvar · Esc para cancelar
                                </span>
                                <div className="flex gap-1.5">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={cancelDesc}
                                        className="h-7 px-3 rounded-lg text-xs"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={saveDesc}
                                        disabled={saving}
                                        className="h-7 px-3 rounded-lg text-xs font-bold"
                                    >
                                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Salvar'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Checklists */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                <CheckCircle2 className="h-3 w-3 inline-block mr-1" aria-hidden="true" />
                                Listas de verificação
                            </Label>
                            {!addingList && (
                                <button
                                    type="button"
                                    onClick={() => setAddingList(true)}
                                    className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Plus className="h-3 w-3" aria-hidden="true" />
                                    Nova lista
                                </button>
                            )}
                        </div>

                        {checklists.map((list) => {
                            const total = list.items.length
                            const done = list.items.filter((i) => i.done).length
                            const pct = total > 0 ? Math.round((done / total) * 100) : 0
                            return (
                                <div key={list.id} className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-2">
                                    {/* Header da lista */}
                                    <div className="flex items-center gap-2">
                                        <span className="flex-1 text-sm font-bold truncate">{list.title}</span>
                                        {total > 0 && (
                                            <span className="text-[10px] font-bold text-muted-foreground shrink-0">
                                                {done}/{total}
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => deleteChecklist(list.id)}
                                            className="text-muted-foreground/40 hover:text-destructive transition-colors p-0.5 rounded"
                                            aria-label="Remover lista"
                                        >
                                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                                        </button>
                                    </div>

                                    {/* Barra de progresso */}
                                    {total > 0 && (
                                        <div className="w-full h-1.5 rounded-full bg-border/60 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    )}

                                    {/* Itens */}
                                    <ul className="space-y-1">
                                        {list.items.map((item) => (
                                            <li key={item.id} className="group flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleChecklistItem(list.id, item.id)}
                                                    className={cn(
                                                        'w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition-colors',
                                                        item.done
                                                            ? 'bg-emerald-500 border-emerald-500'
                                                            : 'border-border hover:border-emerald-500'
                                                    )}
                                                    aria-label={item.done ? 'Desmarcar item' : 'Marcar item como concluído'}
                                                >
                                                    {item.done && (
                                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                                                            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <span className={cn(
                                                    'flex-1 text-sm leading-snug',
                                                    item.done && 'line-through text-muted-foreground'
                                                )}>
                                                    {item.text}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteChecklistItem(list.id, item.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-destructive p-0.5 rounded"
                                                    aria-label="Remover item"
                                                >
                                                    <X className="h-3 w-3" aria-hidden="true" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Adicionar item */}
                                    {addingItemFor === list.id ? (
                                        <div className="flex gap-1.5 pt-1">
                                            <Input
                                                ref={newItemRef}
                                                value={newItemText}
                                                onChange={(e) => setNewItemText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') addChecklistItem(list.id)
                                                    if (e.key === 'Escape') { setNewItemText(''); setAddingItemFor(null) }
                                                }}
                                                placeholder="Novo item..."
                                                className="h-7 text-xs rounded-lg flex-1"
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => addChecklistItem(list.id)}
                                                disabled={!newItemText.trim()}
                                                className="h-7 px-2.5 rounded-lg text-xs font-bold"
                                            >
                                                Adicionar
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => { setNewItemText(''); setAddingItemFor(null) }}
                                                className="h-7 w-7 p-0 rounded-lg"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setAddingItemFor(list.id)}
                                            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors pt-0.5"
                                        >
                                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                            Adicionar item
                                        </button>
                                    )}
                                </div>
                            )
                        })}

                        {/* Formulário de nova lista */}
                        {addingList && (
                            <div className="flex gap-1.5">
                                <Input
                                    ref={newListRef}
                                    value={newListTitle}
                                    onChange={(e) => setNewListTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') addChecklist()
                                        if (e.key === 'Escape') { setNewListTitle(''); setAddingList(false) }
                                    }}
                                    placeholder="Nome da lista..."
                                    className="h-8 text-sm rounded-xl flex-1"
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={addChecklist}
                                    disabled={!newListTitle.trim()}
                                    className="h-8 px-3 rounded-xl text-xs font-bold"
                                >
                                    Criar
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => { setNewListTitle(''); setAddingList(false) }}
                                    className="h-8 w-8 p-0 rounded-xl"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Links / Anexos */}
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">
                            <Paperclip className="h-3 w-3 inline-block mr-1" aria-hidden="true" />
                            Anexos
                            {links.length > 0 && (
                                <span className="ml-1.5 font-bold normal-case tracking-normal opacity-80">
                                    {links.length} {links.length === 1 ? 'link' : 'links'}
                                </span>
                            )}
                        </Label>

                        {links.length > 0 && (
                            <ul className="space-y-1">
                                {links.map((link) => (
                                    <li key={link.id} className="group flex items-center gap-2 py-1 px-1 rounded-lg hover:bg-muted/50 transition-colors">
                                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 text-sm text-primary hover:underline truncate"
                                            title={link.url}
                                        >
                                            {link.label || link.url}
                                        </a>
                                        <ExternalLink className="h-3 w-3 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors" aria-hidden="true" />
                                        <button
                                            type="button"
                                            onClick={() => deleteLink(link.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                            aria-label="Remover link"
                                        >
                                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {addingLink ? (
                            <div className="space-y-1.5">
                                <Input
                                    ref={newLinkRef}
                                    value={newLinkUrl}
                                    onChange={(e) => { setNewLinkUrl(e.target.value); setLinkUrlError(false) }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') addLink(); if (e.key === 'Escape') { setNewLinkUrl(''); setNewLinkLabel(''); setLinkUrlError(false); setAddingLink(false) } }}
                                    placeholder="https://..."
                                    className={cn('h-8 text-sm rounded-xl', linkUrlError && 'border-destructive focus-visible:ring-destructive')}
                                    aria-label="URL do link"
                                />
                                {linkUrlError && (
                                    <p className="text-xs text-destructive font-medium px-1">URL inválida. Use https:// ou http://</p>
                                )}
                                <Input
                                    value={newLinkLabel}
                                    onChange={(e) => setNewLinkLabel(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') addLink(); if (e.key === 'Escape') { setNewLinkUrl(''); setNewLinkLabel(''); setLinkUrlError(false); setAddingLink(false) } }}
                                    placeholder="Nome do link (opcional)"
                                    className="h-8 text-sm rounded-xl"
                                    aria-label="Nome do link"
                                />
                                <div className="flex gap-1.5">
                                    <Button type="button" size="sm" onClick={addLink} disabled={!newLinkUrl.trim()} className="h-8 px-3 rounded-xl text-xs font-bold">
                                        Adicionar
                                    </Button>
                                    <Button type="button" size="sm" variant="ghost" onClick={() => { setNewLinkUrl(''); setNewLinkLabel(''); setLinkUrlError(false); setAddingLink(false) }} className="h-8 w-8 p-0 rounded-xl">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setAddingLink(true)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                Adicionar link
                            </button>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <button
                            onClick={onDelete}
                            className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg text-destructive bg-destructive/8 hover:bg-destructive/15 transition-colors"
                            aria-label="Remover tarefa"
                        >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Remover tarefa
                        </button>
                        {saving && (
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                                Salvando...
                            </span>
                        )}
                    </div>
                </div>{/* fim scroll detalhes */}
                </div>{/* fim painel detalhes */}

                {/* Linha divisória vertical */}
                <div className="hidden md:block w-px bg-border shrink-0 self-stretch" aria-hidden="true" />

                {/* ── Painel de comentários ── */}
                <div className={cn(
                    'flex-col min-h-0 overflow-hidden',
                    mobilePanel === 'comments' ? 'flex flex-1' : 'hidden',
                    'md:flex md:flex-col md:w-72 md:shrink-0',
                )}>
                    {/* Cabeçalho */}
                    <div className="px-4 py-3 border-b border-border/60 shrink-0">
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">
                            Comentários
                            {comments.length > 0 && (
                                <span className="ml-1.5 normal-case tracking-normal opacity-80 font-bold">
                                    ({comments.length})
                                </span>
                            )}
                        </span>
                    </div>

                    {/* Lista de comentários */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-[120px]">
                        {comments.length === 0 ? (
                            <p className="text-xs text-muted-foreground/50 text-center py-6 font-medium">
                                Nenhum comentário ainda.<br />Seja o primeiro a comentar!
                            </p>
                        ) : (
                            comments.map((c) => {
                                const name = getUserName(c.authorId)
                                const initial = name?.[0]?.toUpperCase() ?? '?'
                                const isMe = c.authorId === currentUserId
                                const date = c.createdAt instanceof Date ? c.createdAt : new Date((c.createdAt as { seconds: number }).seconds * 1000)
                                const timeAgo = (() => {
                                    const diff = Date.now() - date.getTime()
                                    const mins = Math.floor(diff / 60000)
                                    if (mins < 1) return 'agora'
                                    if (mins < 60) return `há ${mins}min`
                                    const hrs = Math.floor(mins / 60)
                                    if (hrs < 24) return `há ${hrs}h`
                                    const days = Math.floor(hrs / 24)
                                    return `há ${days}d`
                                })()
                                return (
                                    <div key={c.id} className="flex gap-2.5">
                                        <div className={cn(
                                            'w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white',
                                            isMe ? 'bg-primary' : 'bg-slate-400 dark:bg-slate-600'
                                        )}>
                                            {initial}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-1.5 mb-0.5">
                                                <span className="text-xs font-bold truncate">{isMe ? 'Você' : name}</span>
                                                <span className="text-[10px] text-muted-foreground/50 shrink-0">{timeAgo}</span>
                                            </div>
                                            <p className="text-xs leading-relaxed text-foreground/80 break-words whitespace-pre-wrap">{c.text}</p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={commentsEndRef} />
                    </div>

                    {/* Histórico de atividade */}
                    {task.activity && task.activity.length > 0 && (
                        <div className="px-4 pb-3 border-t border-border/40 pt-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-3">
                                Histórico
                            </p>
                            <div className="space-y-3 max-h-[176px] overflow-y-auto pr-1">
                                {[...task.activity]
                                    .sort((a, b) => {
                                        const ta = a.timestamp instanceof Date ? a.timestamp.getTime() : (a.timestamp as { seconds: number }).seconds * 1000
                                        const tb = b.timestamp instanceof Date ? b.timestamp.getTime() : (b.timestamp as { seconds: number }).seconds * 1000
                                        return tb - ta
                                    })
                                    .slice(0, 15)
                                    .map((entry, i) => {
                                        const name = getUserName(entry.userId)
                                        const isMe = entry.userId === currentUserId
                                        const date = entry.timestamp instanceof Date ? entry.timestamp : new Date((entry.timestamp as { seconds: number }).seconds * 1000)

                                        // Data e hora formatadas
                                        const now = new Date()
                                        const isToday = date.toDateString() === now.toDateString()
                                        const isYesterday = date.toDateString() === new Date(now.getTime() - 86400000).toDateString()
                                        const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                                        const dateStr = isToday
                                            ? `hoje às ${timeStr}`
                                            : isYesterday
                                                ? `ontem às ${timeStr}`
                                                : `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })} às ${timeStr}`

                                        const label = entry.detail ?? (
                                            entry.action === 'created' ? 'adicionou este cartão' :
                                            entry.action === 'status_changed' ? `moveu ${entry.detail}` :
                                            'editou o cartão'
                                        )

                                        return (
                                            <div key={i} className="flex items-start gap-2">
                                                <div className={cn(
                                                    'w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5',
                                                    isMe ? 'bg-primary' : 'bg-slate-400 dark:bg-slate-600'
                                                )}>
                                                    {name?.[0]?.toUpperCase() ?? '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] leading-snug">
                                                        <span className="font-bold text-foreground">{isMe ? 'Você' : name}</span>
                                                        {' '}
                                                        <span className="text-muted-foreground">{label}</span>
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">{dateStr}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>
                    )}

                    {/* Caixa de novo comentário */}
                    <div className="px-4 py-3 border-t border-border/60 space-y-2 shrink-0">
                        <Textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submitComment() }
                            }}
                            placeholder="Escreva um comentário..."
                            className="resize-none text-xs rounded-xl min-h-[72px] max-h-[140px] leading-relaxed"
                            aria-label="Novo comentário"
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground/50">Ctrl+Enter para enviar</span>
                            <Button
                                type="button"
                                size="sm"
                                onClick={submitComment}
                                disabled={!commentText.trim() || submittingComment}
                                className="h-7 px-3 rounded-xl text-xs font-bold"
                            >
                                {submittingComment ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Comentar'}
                            </Button>
                        </div>
                    </div>
                </div>{/* fim card comentários */}

                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>

    )
}
