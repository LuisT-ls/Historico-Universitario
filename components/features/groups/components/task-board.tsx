'use client'

import { GroupTask, GroupTaskStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult,
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
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TaskBoardProps {
    groupId: string
    tasks: GroupTask[]
    isLoading: boolean
    onAdd: (title: string, description?: string, assignedTo?: string, dueDate?: Date, status?: GroupTaskStatus) => Promise<void>
    onUpdate: (taskId: string, data: Partial<Pick<GroupTask, 'title' | 'description' | 'assignedTo' | 'dueDate' | 'status'>>) => Promise<void>
    onUpdateStatus: (id: string, status: GroupTaskStatus) => Promise<void>
    onDelete: (id: string) => Promise<void>
    members: string[]
    getUserName: (userId: string) => string
}

const COLUMNS: { id: GroupTaskStatus; label: string; icon: React.ElementType; color: string; bg: string; dot: string }[] = [
    { id: 'pending',     label: 'A fazer',      icon: Circle,       color: 'text-slate-500',   bg: 'bg-slate-100 dark:bg-slate-800',        dot: 'bg-slate-400' },
    { id: 'in_progress', label: 'Em andamento', icon: Clock,        color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/40',         dot: 'bg-blue-500' },
    { id: 'completed',   label: 'Concluído',    icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40',   dot: 'bg-emerald-500' },
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
export function TaskBoard({ tasks, isLoading, onAdd, onUpdate, onUpdateStatus, onDelete, members, getUserName }: TaskBoardProps) {
    const [detailTask, setDetailTask] = useState<GroupTask | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return
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

    if (isLoading) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((col) => (
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
                <div className="flex gap-4 overflow-x-auto pb-6 -mx-1 px-1 items-start">
                    {COLUMNS.map((col) => {
                        const colTasks = tasks.filter((t) => t.status === col.id)
                        return (
                            <KanbanColumn
                                key={col.id}
                                col={col}
                                tasks={colTasks}
                                allTasks={tasks}
                                members={members}
                                getUserName={getUserName}
                                onAdd={onAdd}
                                onCardClick={setDetailTask}
                            />
                        )
                    })}
                </div>
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
                    members={members}
                    getUserName={getUserName}
                    onUpdate={async (data) => {
                        await onUpdate(detailTask.id!, data)
                        setDetailTask((prev) => prev ? { ...prev, ...data } : prev)
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
}: {
    col: typeof COLUMNS[number]
    tasks: GroupTask[]
    allTasks: GroupTask[]
    members: string[]
    getUserName: (id: string) => string
    onAdd: TaskBoardProps['onAdd']
    onCardClick: (task: GroupTask) => void
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
            {/* Cabeçalho da coluna */}
            <div className="flex items-center gap-2 px-3 pt-3 pb-2">
                <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', col.dot)} />
                <span className="text-sm font-black text-foreground flex-1">{col.label}</span>
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full tabular-nums">
                    {tasks.length}
                </span>
            </div>

            {/* Cards */}
            <Droppable droppableId={col.id}>
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
}: {
    task: GroupTask
    index: number
    getUserName: (id: string) => string
    onClick: () => void
}) {
    const isDone = task.status === 'completed'
    const due = task.dueDate ? formatDueDate(task.dueDate) : null

    return (
        <Draggable draggableId={task.id!} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                        'bg-white dark:bg-slate-800/80 rounded-xl border border-border/40 shadow-sm',
                        'transition-all duration-150 select-none',
                        snapshot.isDragging
                            ? 'cursor-grabbing shadow-2xl ring-2 ring-primary/40 rotate-2 scale-[1.03] opacity-95'
                            : 'cursor-grab hover:border-border/70 hover:shadow-md',
                        isDone && 'opacity-60'
                    )}
                    onClick={onClick}
                    aria-label={`Tarefa: ${task.title}. Segure e arraste para mover de coluna, ou clique para editar.`}
                >
                    <div className="p-3 space-y-2.5">
                        {/* Título */}
                        <p className={cn(
                            'text-sm font-semibold leading-normal',
                            isDone && 'line-through text-muted-foreground'
                        )}>
                            {task.title}
                        </p>

                        {/* Description preview */}
                        {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {task.description}
                            </p>
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

// ─── Modal de Detalhe ─────────────────────────────────────────────────────────

function TaskDetailDialog({
    task,
    members,
    getUserName,
    onUpdate,
    onDelete,
    onClose,
}: {
    task: GroupTask
    members: string[]
    getUserName: (id: string) => string
    onUpdate: (data: Partial<Pick<GroupTask, 'title' | 'description' | 'assignedTo' | 'dueDate' | 'status'>>) => Promise<void>
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
    const [saving, setSaving] = useState(false)
    const titleRef = useRef<HTMLInputElement>(null)
    const descRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => { if (editingTitle) titleRef.current?.focus() }, [editingTitle])
    useEffect(() => { if (editingDesc) descRef.current?.focus() }, [editingDesc])

    const save = async (patch: Partial<Pick<GroupTask, 'title' | 'description' | 'assignedTo' | 'dueDate' | 'status'>>) => {
        setSaving(true)
        try { await onUpdate(patch) } finally { setSaving(false) }
    }

    const commitTitle = async () => {
        setEditingTitle(false)
        if (title.trim() && title.trim() !== task.title) await save({ title: title.trim() })
        else setTitle(task.title)
    }

    const commitDesc = async () => {
        setEditingDesc(false)
        const val = description.trim() || undefined
        if (val !== (task.description?.trim() || undefined)) await save({ description: val })
    }

    const handleAssigneeChange = async (val: string) => {
        setAssignedTo(val)
        await save({ assignedTo: (val || undefined) as import('@/types').UserId | undefined })
    }

    const handleDueDateChange = async (val: string) => {
        setDueDate(val)
        await save({ dueDate: val ? new Date(val + 'T00:00:00') : undefined })
    }

    const currentCol = COLUMNS.find((c) => c.id === task.status)!

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-[540px] rounded-[1.5rem] p-0 overflow-hidden gap-0">
                {/* Faixa de cor da coluna atual */}
                <div className={cn('h-1.5 w-full', currentCol.dot)} />

                <div className="p-6 space-y-5">
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
                                <option value="">Ninguém</option>
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

                    {/* Descrição */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">
                            <AlignLeft className="h-3 w-3 inline-block mr-1" aria-hidden="true" />
                            Descrição
                        </Label>
                        {editingDesc ? (
                            <Textarea
                                ref={descRef}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={commitDesc}
                                onKeyDown={(e) => { if (e.key === 'Escape') { setDescription(task.description ?? ''); setEditingDesc(false) } }}
                                placeholder="Adicione uma descrição..."
                                className="min-h-[100px] resize-none rounded-xl text-sm"
                                aria-label="Descrição da tarefa"
                            />
                        ) : (
                            <div
                                onClick={() => setEditingDesc(true)}
                                className={cn(
                                    'min-h-[72px] px-3 py-2.5 rounded-xl text-sm cursor-text transition-colors',
                                    'bg-muted/50 hover:bg-muted border border-transparent hover:border-border',
                                    description ? 'text-foreground' : 'text-muted-foreground/50'
                                )}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingDesc(true)}
                                aria-label="Editar descrição"
                            >
                                {description || 'Clique para adicionar uma descrição...'}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <button
                            onClick={onDelete}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors font-bold"
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
                </div>
            </DialogContent>
        </Dialog>
    )
}
