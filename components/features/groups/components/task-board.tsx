'use client'

import { GroupTask, UserId } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Plus, CheckCircle2, Circle, Trash2, Calendar, User as UserIcon, Loader2, ListTodo } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface TaskBoardProps {
    groupId: string
    tasks: GroupTask[]
    isLoading: boolean
    onAdd: (title: string, description?: string) => Promise<void>
    onUpdateStatus: (id: string, status: GroupTask['status']) => Promise<void>
    onDelete: (id: string) => Promise<void>
    members: UserId[]
}

/**
 * Quadro de tarefas do grupo. 
 * Implementa uma lista simples de To-Do com animações e divisões por status.
 */
export function TaskBoard({ tasks, isLoading, onAdd, onUpdateStatus, onDelete }: TaskBoardProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return
        await onDelete(confirmDeleteId)
        setConfirmDeleteId(null)
    }

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTaskTitle.trim()) return
        
        setIsSubmitting(true)
        try {
            await onAdd(newTaskTitle)
            setNewTaskTitle('')
            setIsAdding(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 bg-muted/40 rounded-2xl" />
                ))}
            </div>
        )
    }

    const pendingTasks = tasks.filter(t => t.status !== 'completed')
    const completedTasks = tasks.filter(t => t.status === 'completed')

    return (
        <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-border/40 pb-8">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight text-center sm:text-left">Quadro de Tarefas</h2>
                    <p className="text-sm text-muted-foreground font-medium text-center sm:text-left">Divida as responsabilidades e acompanhe o progresso em tempo real.</p>
                </div>
                {!isAdding && (
                     <Button 
                        onClick={() => setIsAdding(true)} 
                        className="gap-2.5 rounded-[1.2rem] h-14 px-8 shadow-xl shadow-primary/20 transition-all active:scale-95 font-black shrink-0"
                     >
                        <Plus className="h-5 w-5" />
                        Nova Tarefa
                     </Button>
                )}
            </div>

            {/* Input Form de Nova Tarefa */}
            <AnimatePresence>
                {isAdding && (
                    <motion.form 
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        onSubmit={handleAddTask}
                        className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-primary/30 shadow-[0_20px_50px_rgba(0,0,0,0.1)] shadow-primary/5 flex flex-col sm:flex-row items-center gap-6 z-10 relative"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 hidden sm:flex">
                             <ListTodo className="h-6 w-6" />
                        </div>
                        <Input 
                            autoFocus
                            placeholder="O que precisa ser feito pelo time?"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="flex-1 h-14 bg-transparent border-none focus-visible:ring-0 text-xl font-bold placeholder:text-muted-foreground/30 shadow-none p-0 px-2"
                        />
                        <div className="flex gap-3 w-full sm:w-auto">
                             <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setIsAdding(false)} 
                                disabled={isSubmitting} 
                                className="rounded-xl flex-1 sm:flex-initial h-14 px-6 font-bold"
                             >
                                Cancelar
                             </Button>
                             <Button 
                                type="submit" 
                                disabled={isSubmitting || !newTaskTitle.trim()} 
                                className="rounded-xl flex-1 sm:flex-initial h-14 px-10 font-black shadow-lg shadow-primary/25"
                             >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Criar Tarefa'}
                             </Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {tasks.length === 0 && !isAdding ? (
                 <div className="flex flex-col items-center justify-center py-28 bg-white/40 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-border/40 text-center animate-in zoom-in duration-700">
                    <div className="w-20 h-20 bg-muted/40 rounded-[2rem] flex items-center justify-center mb-6">
                        <ListTodo className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-2xl font-black mb-2 opacity-70">A união faz a força!</h3>
                    <p className="text-muted-foreground mb-10 max-w-xs mx-auto leading-relaxed font-medium">Ninguém adicionou tarefas ainda. Divida o trabalho para garantir o 10!</p>
                    <Button onClick={() => setIsAdding(true)} className="rounded-full px-10 h-12 font-bold shadow-lg shadow-primary/10 transition-transform active:scale-95">
                        Adicionar minha primeira tarefa
                    </Button>
                 </div>
            ) : (
                <div className="space-y-12">
                     {/* Seção Pendentes */}
                     <div className="space-y-5">
                        <div className="flex items-center gap-3 px-2">
                            <h4 className="text-[11px] uppercase font-black tracking-[0.25em] text-muted-foreground opacity-60">
                                EM ANDAMENTO ({pendingTasks.length})
                            </h4>
                            <div className="h-[1px] flex-1 bg-border/40" />
                        </div>
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {pendingTasks.map(task => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onToggle={() => onUpdateStatus(task.id!, 'completed')}
                                        onDelete={() => setConfirmDeleteId(task.id!)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                     </div>

                     {/* Seção Concluídas */}
                     {completedTasks.length > 0 && (
                        <div className="space-y-5 pt-4">
                            <div className="flex items-center gap-3 px-2">
                                <h4 className="text-[11px] uppercase font-black tracking-[0.25em] text-muted-foreground opacity-40">
                                    CONCLUÍDAS ({completedTasks.length})
                                </h4>
                                <div className="h-[1px] flex-1 bg-border/20" />
                            </div>
                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {completedTasks.map(task => (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            isDone
                                            onToggle={() => onUpdateStatus(task.id!, 'pending')}
                                            onDelete={() => setConfirmDeleteId(task.id!)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                     )}
                </div>
            )}
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
 * Componente individual de item de tarefa.
 */
function TaskItem({ 
    task, 
    onToggle, 
    onDelete, 
    isDone = false 
}: { 
    task: GroupTask, 
    onToggle: () => void, 
    onDelete: () => void,
    isDone?: boolean
}) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={cn(
                "group bg-white dark:bg-slate-900/60 p-5 rounded-[2rem] border border-border/40 shadow-sm flex items-center justify-between gap-5 transition-all duration-300 hover:shadow-xl hover:border-primary/20",
                isDone && "bg-muted/30 border-transparent saturate-[0.1] opacity-70"
            )}
        >
            <div className="flex items-center gap-5 flex-1 min-w-0">
                <button 
                    onClick={onToggle}
                    className={cn(
                        "w-10 h-10 rounded-[1rem] flex items-center justify-center transition-all animate-in zoom-in duration-500 shrink-0 shadow-sm",
                        isDone ? "bg-primary text-primary-foreground rotate-[360deg]" : "bg-muted text-transparent hover:border-primary/50 hover:bg-primary/5 hover:text-primary/40 border-2 border-transparent"
                    )}
                    title={isDone ? "Marcar como pendente" : "Concluir tarefa"}
                >
                    {isDone ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                </button>
                <div className="min-w-0 space-y-1">
                    <p className={cn(
                        "text-lg font-black transition-all truncate",
                        isDone && "line-through text-muted-foreground font-bold opacity-60"
                    )}>
                        {task.title}
                    </p>
                    <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50 bg-muted/50 px-2 py-0.5 rounded-lg">
                            <UserIcon className="h-3 w-3" />
                            <span>{task.createdBy.substring(0, 6)}</span>
                         </div>
                         {task.dueDate && (
                             <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                                <Calendar className="h-3 w-3" />
                                <span>{task.dueDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                             </div>
                         )}
                    </div>
                </div>
            </div>
            
            <button 
                onClick={onDelete}
                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all shrink-0"
                title="Remover tarefa"
            >
                <Trash2 className="h-4.5 w-4.5" />
            </button>
        </motion.div>
    )
}
