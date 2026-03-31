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
    { id: 'none',   label: 'Sem cor',   hex: null },
    { id: 'red',    label: 'Vermelho',  hex: '#ef4444' },
    { id: 'orange', label: 'Laranja',   hex: '#f97316' },
    { id: 'yellow', label: 'Amarelo',   hex: '#eab308' },
    { id: 'green',  label: 'Verde',     hex: '#22c55e' },
    { id: 'teal',   label: 'Ciano',     hex: '#14b8a6' },
    { id: 'blue',   label: 'Azul',      hex: '#3b82f6' },
    { id: 'purple', label: 'Roxo',      hex: '#a855f7' },
    { id: 'pink',   label: 'Rosa',      hex: '#ec4899' },
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
    const newColumnRef = useRef<HTMLInputElement>(null)

    useEffect(() => { if (addingColumn) newColumnRef.current?.focus() }, [addingColumn])

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
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="board-columns" direction="horizontal" type="COLUMN">
                    {(boardProvided) => (
                        <div
                            ref={boardProvided.innerRef}
                            {...boardProvided.droppableProps}
                            className="flex gap-4 overflow-x-auto pb-6 -mx-1 px-1 items-start"
                        >
                            {columns.map((col, colIndex) => {
                                const colTasks = tasks.filter((t) => t.status === col.id)
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
                                                    onDeleteColumn={col.isCustom ? () => handleDeleteColumn(col.id) : undefined}
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
    dragHandleProps?: DraggableProvidedDragHandleProps | null
}) {
    const [adding, setAdding] = useState(false)
    const [title, setTitle] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (adding) inputRef.current?.focus()
    }, [adding])

    const submit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!title.trim()) { setAdding(false); return }
        setSubmitting(true)
        try {
            await onAdd(title.trim(), undefined, undefined, undefined, col.id)
            setTitle('')
            inputRef.current?.focus()
        } finally {
            setSubmitting(false)
        }
    }

    const cancel = () => { setTitle(''); setAdding(false) }

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
                {onDeleteColumn && (
                    <button
                        type="button"
                        onClick={onDeleteColumn}
                        className="text-muted-foreground/40 hover:text-destructive transition-colors p-0.5 rounded-md hover:bg-destructive/10"
                        aria-label={`Remover lista ${col.label}`}
                        title="Remover lista"
                    >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                )}
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
                        {tasks.map((task, index) => (
                            <TaskCard
                                key={task.id!}
                                task={task}
                                index={index}
                                getUserName={getUserName}
                                onClick={() => onCardClick(task)}
                                onToggleDone={() => onToggleDone(task)}
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
}: {
    task: GroupTask
    index: number
    getUserName: (id: string) => string
    onClick: () => void
    onToggleDone: () => void
}) {
    const isDone = task.done === true
    const due = task.dueDate ? formatDueDate(task.dueDate) : null

    return (
        <Draggable draggableId={task.id!} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                        'bg-white dark:bg-slate-800/80 rounded-xl border shadow-sm',
                        'transition-all duration-150 select-none',
                        snapshot.isDragging
                            ? 'cursor-grabbing shadow-2xl ring-2 ring-primary/40 rotate-2 scale-[1.03] opacity-95'
                            : 'cursor-grab hover:shadow-md',
                        isDone
                            ? 'border-emerald-400/60 dark:border-emerald-600/50 hover:border-emerald-400/80'
                            : 'border-border/40 hover:border-border/70'
                    )}
                    onClick={onClick}
                    aria-label={`Tarefa: ${task.title}. Segure e arraste para mover de coluna, ou clique para editar.`}
                >
                    {/* Faixa de cor */}
                    {task.color && (
                        <div
                            className="h-2 w-full rounded-t-xl"
                            style={{ backgroundColor: task.color }}
                            aria-hidden="true"
                        />
                    )}
                    <div className="p-3 space-y-2.5">
                        {/* Título + botão de conclusão */}
                        <div className="flex items-start gap-2">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onToggleDone() }}
                                aria-label={isDone ? 'Desmarcar como concluída' : 'Marcar como concluída'}
                                className={cn(
                                    'mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150',
                                    isDone
                                        ? 'bg-emerald-500 border-emerald-500 text-white scale-110 shadow shadow-emerald-400/50 dark:shadow-emerald-500/40'
                                        : 'border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:scale-110'
                                )}
                            >
                                {isDone && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
                            </button>
                            <p className={cn(
                                'text-sm font-semibold leading-normal flex-1',
                                isDone && 'line-through text-muted-foreground'
                            )}>
                                {task.title}
                            </p>
                        </div>

                        {/* Description preview */}
                        {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {stripHtml(task.description)}
                            </p>
                        )}



                        {/* Links preview */}
                        {task.links && task.links.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                <Paperclip className="h-3 w-3" aria-hidden="true" />
                                {task.links.length} {task.links.length === 1 ? 'link' : 'links'}
                            </span>
                        )}

                        {/* Footer: due date + assignee */}
                        {(due || task.assignedTo) && (
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {due && (
                                        <span className={cn(
                                            'inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                                            due.overdue
                                                ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400'
                                                : due.soon
                                                    ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                                                    : 'bg-muted text-muted-foreground'
                                        )}>
                                            <Calendar className="h-2.5 w-2.5" aria-hidden="true" />
                                            {due.label}
                                        </span>
                                    )}
                                </div>

                                {task.assignedTo && (
                                    <div
                                        className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[9px] font-black text-primary uppercase shrink-0"
                                        title={getUserName(task.assignedTo)}
                                        aria-label={`Responsável: ${getUserName(task.assignedTo)}`}
                                    >
                                        {getUserName(task.assignedTo).substring(0, 2)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    )
}

// ─── Editor WYSIWYG de Descrição ─────────────────────────────────────────────

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
    onUpdate: (data: Partial<Pick<GroupTask, 'title' | 'description' | 'assignedTo' | 'dueDate' | 'status' | 'color' | 'done' | 'checklist' | 'checklists' | 'links'>>) => Promise<void>
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
    const newLinkRef = useRef<HTMLInputElement>(null)
    const [saving, setSaving] = useState(false)
    const titleRef = useRef<HTMLInputElement>(null)

    useEffect(() => { if (editingTitle) titleRef.current?.focus() }, [editingTitle])
    useEffect(() => { if (addingLink) newLinkRef.current?.focus() }, [addingLink])

    const save = async (patch: Partial<Pick<GroupTask, 'title' | 'description' | 'assignedTo' | 'dueDate' | 'status' | 'color' | 'done' | 'checklist' | 'checklists' | 'links'>>) => {
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
