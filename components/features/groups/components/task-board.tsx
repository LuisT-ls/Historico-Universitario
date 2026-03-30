'use client'

import { GroupTask, GroupTaskStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
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
    GripVertical,
    ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface TaskBoardProps {
    groupId: string
    tasks: GroupTask[]
    isLoading: boolean
    onAdd: (title: string, description?: string, assignedTo?: string, dueDate?: Date) => Promise<void>
    onUpdateStatus: (id: string, status: GroupTaskStatus) => Promise<void>
    onDelete: (id: string) => Promise<void>
    members: string[]
    getUserName: (userId: string) => string
}

const COLUMNS: { id: GroupTaskStatus; label: string; icon: React.ElementType; color: string; bg: string }[] = [
    { id: 'pending',     label: 'Pendente',     icon: Circle,       color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/20' },
    { id: 'in_progress', label: 'Em Progresso', icon: Clock,        color: 'text-blue-500',    bg: 'bg-blue-500/10 border-blue-500/20' },
    { id: 'completed',   label: 'Concluída',    icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
]

/**
 * Quadro Kanban de tarefas com drag-and-drop entre colunas.
 * Atualizações de outros membros aparecem em tempo real via onSnapshot.
 */
export function TaskBoard({ tasks, isLoading, onAdd, onUpdateStatus, onDelete, members, getUserName }: TaskBoardProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [assignedTo, setAssignedTo] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setAssignedTo('')
        setDueDate('')
    }

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return
        setIsSubmitting(true)
        try {
            await onAdd(
                title.trim(),
                description.trim() || undefined,
                assignedTo || undefined,
                dueDate ? new Date(dueDate + 'T00:00:00') : undefined
            )
            resetForm()
            setIsDialogOpen(false)
        } finally {
            setIsSubmitting(false)
        }
    }

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
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COLUMNS.map((col) => (
                    <div key={col.id} className="space-y-3">
                        <div className="h-8 w-32 bg-muted/40 rounded-xl animate-pulse" />
                        {[1, 2].map((i) => (
                            <div key={i} className="h-20 bg-muted/40 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight text-center sm:text-left">Quadro de Tarefas</h2>
                    <p className="text-sm text-muted-foreground font-medium text-center sm:text-left">
                        Arraste as tarefas entre as colunas para atualizar o status.
                    </p>
                </div>
                <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="gap-2 rounded-[1.2rem] h-12 px-6 shadow-lg shadow-primary/20 font-black shrink-0"
                >
                    <Plus className="h-5 w-5" aria-hidden="true" />
                    Nova Tarefa
                </Button>
            </div>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {COLUMNS.map((col) => {
                        const colTasks = tasks.filter((t) => t.status === col.id)
                        const Icon = col.icon
                        return (
                            <div key={col.id} className="flex flex-col gap-3">
                                {/* Cabeçalho da coluna */}
                                <div className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border', col.bg)}>
                                    <Icon className={cn('h-4 w-4', col.color)} aria-hidden="true" />
                                    <span className={cn('text-xs font-black uppercase tracking-widest', col.color)}>
                                        {col.label}
                                    </span>
                                    <span className={cn('ml-auto text-xs font-black tabular-nums', col.color)}>
                                        {colTasks.length}
                                    </span>
                                </div>

                                {/* Área droppable */}
                                <Droppable droppableId={col.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={cn(
                                                'flex flex-col gap-3 min-h-[120px] rounded-2xl p-2 transition-colors duration-200',
                                                snapshot.isDraggingOver && 'bg-primary/5 ring-2 ring-primary/20'
                                            )}
                                            aria-label={`Coluna ${col.label}`}
                                        >
                                            {colTasks.length === 0 && !snapshot.isDraggingOver && (
                                                <div className="flex-1 flex items-center justify-center py-8 text-center">
                                                    <p className="text-xs text-muted-foreground/40 font-bold uppercase tracking-widest">
                                                        Nenhuma tarefa
                                                    </p>
                                                </div>
                                            )}
                                            {colTasks.map((task, index) => (
                                                <TaskCard
                                                    key={task.id!}
                                                    task={task}
                                                    index={index}
                                                    getUserName={getUserName}
                                                    onDelete={() => setConfirmDeleteId(task.id!)}
                                                />
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        )
                    })}
                </div>
            </DragDropContext>

            {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 bg-white/40 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-border/40 text-center animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-muted/40 rounded-[2rem] flex items-center justify-center mb-6">
                        <ListTodo className="h-10 w-10 text-muted-foreground/30" aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl font-black mb-2 opacity-70">A união faz a força!</h3>
                    <p className="text-muted-foreground mb-8 max-w-xs mx-auto leading-relaxed font-medium">
                        Ninguém adicionou tarefas ainda. Divida o trabalho para garantir o 10!
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)} className="rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/10">
                        Criar primeira tarefa
                    </Button>
                </div>
            )}

            {/* Dialog: Nova Tarefa */}
            <Dialog open={isDialogOpen} onOpenChange={(o) => { if (!isSubmitting) { setIsDialogOpen(o); if (!o) resetForm() } }}>
                <DialogContent className="sm:max-w-[480px] rounded-[2rem]">
                    <form onSubmit={handleAddTask}>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black">Nova Tarefa</DialogTitle>
                            <DialogDescription className="font-medium">
                                Adicione uma tarefa ao quadro. Preencha os detalhes para facilitar a distribuição do trabalho.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-5 py-6">
                            <div className="grid gap-2">
                                <Label htmlFor="task-title" className="font-semibold">
                                    Título *
                                </Label>
                                <Input
                                    id="task-title"
                                    autoFocus
                                    placeholder="O que precisa ser feito?"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    aria-required="true"
                                    className="h-11"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="task-description" className="font-semibold">
                                    Descrição <span className="text-muted-foreground font-normal">(Opcional)</span>
                                </Label>
                                <Textarea
                                    id="task-description"
                                    placeholder="Detalhes adicionais, instruções ou links relevantes..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[80px] resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="task-assignee" className="font-semibold">
                                        Responsável
                                    </Label>
                                    <Select
                                        id="task-assignee"
                                        value={assignedTo}
                                        onChange={(e) => setAssignedTo(e.target.value)}
                                        className="h-11 rounded-xl"
                                        aria-label="Selecionar responsável"
                                    >
                                        <option value="">Ninguém</option>
                                        {members.map((memberId) => (
                                            <option key={memberId} value={memberId}>
                                                {getUserName(memberId)}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="task-due-date" className="font-semibold">
                                        Prazo
                                    </Label>
                                    <Input
                                        id="task-due-date"
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="h-11 rounded-xl"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                className="rounded-xl"
                                onClick={() => { setIsDialogOpen(false); resetForm() }}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !title.trim()}
                                className="rounded-xl px-8 font-black shadow-lg shadow-primary/20"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Salvando..." /> : 'Criar Tarefa'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog de confirmação de exclusão */}
            <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
                <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Remover tarefa?</DialogTitle>
                        <DialogDescription className="font-medium">
                            Esta ação não pode ser desfeita. A tarefa será permanentemente removida do quadro.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 mt-2">
                        <Button variant="ghost" className="rounded-xl" onClick={() => setConfirmDeleteId(null)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" className="rounded-xl" onClick={handleConfirmDelete}>
                            Remover
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

/**
 * Card individual de tarefa — draggável. Suporta expansão para ver a descrição.
 */
function TaskCard({
    task,
    index,
    getUserName,
    onDelete,
}: {
    task: GroupTask
    index: number
    getUserName: (id: string) => string
    onDelete: () => void
}) {
    const [expanded, setExpanded] = useState(false)
    const isDone = task.status === 'completed'

    return (
        <Draggable draggableId={task.id!} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(
                        'group bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-border/40 shadow-sm',
                        'flex flex-col gap-2 transition-all duration-200',
                        snapshot.isDragging && 'shadow-2xl shadow-primary/20 ring-2 ring-primary/30 rotate-1 scale-105',
                        isDone && 'opacity-60 saturate-50'
                    )}
                >
                    <div className="flex items-start gap-3">
                        {/* Handle de drag */}
                        <div
                            {...provided.dragHandleProps}
                            className="mt-0.5 shrink-0 text-muted-foreground/30 hover:text-muted-foreground/60 cursor-grab active:cursor-grabbing transition-colors"
                            aria-label="Arrastar tarefa"
                        >
                            <GripVertical className="h-4 w-4" aria-hidden="true" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                            <p className={cn(
                                'text-sm font-bold leading-snug',
                                isDone && 'line-through text-muted-foreground'
                            )}>
                                {task.title}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 bg-muted/50 px-2 py-0.5 rounded-lg">
                                    <UserIcon className="h-3 w-3" aria-hidden="true" />
                                    <span>{task.assignedTo ? getUserName(task.assignedTo) : getUserName(task.createdBy)}</span>
                                </div>
                                {task.dueDate && (
                                    <div className="flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                                        <Calendar className="h-3 w-3" aria-hidden="true" />
                                        <span>{task.dueDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            {task.description && (
                                <button
                                    onClick={() => setExpanded((v) => !v)}
                                    className="w-7 h-7 flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 rounded-xl transition-all"
                                    aria-label={expanded ? 'Recolher descrição' : 'Ver descrição'}
                                    aria-expanded={expanded}
                                >
                                    <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', expanded && 'rotate-180')} aria-hidden="true" />
                                </button>
                            )}
                            {/* Botão de remover */}
                            <button
                                onClick={onDelete}
                                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                aria-label={`Remover tarefa: ${task.title}`}
                            >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {/* Expandable description */}
                    <AnimatePresence>
                        {expanded && task.description && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <p className="text-xs text-muted-foreground leading-relaxed pl-7 pt-1 border-t border-border/30">
                                    {task.description}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </Draggable>
    )
}
