'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useGroupDetails } from '@/components/features/groups/hooks/use-group-details'
import { useUserProfiles } from '@/components/features/groups/hooks/use-user-profiles'
import { Loader2, ArrowLeft, Files, CheckSquare, LayoutDashboard, Copy, Plus, MoreVertical, Pencil, LogOut, Trash2, Users, CalendarDays, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

import { MaterialList } from './material-list'
import { TaskBoard } from './task-board'
import { EditGroupDialog } from './edit-group-dialog'

/**
 * Página de Detalhes do Grupo (Painel).
 * Permite gerenciar materiais e tarefas do trabalho em grupo.
 */
export function GroupDetailsPage() {
    const {
        group,
        materials,
        tasks,
        isLoading,
        isMaterialsLoading,
        isTasksLoading,
        user,
        handleAddTask,
        handleUpdateTask,
        handleAddTaskComment,
        handleUpdateTaskStatus,
        handleDeleteTask,
        handleAddMaterial,
        handleDeleteMaterial,
        handleLeaveGroup,
        handleUpdateGroup,
        handleDeleteGroup,
    } = useGroupDetails()

    const getUserName = useUserProfiles(group?.members ?? [])

    const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'tasks'>('overview')
    const [editOpen, setEditOpen] = useState(false)
    const [confirmLeave, setConfirmLeave] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [codeCopied, setCodeCopied] = useState(false)

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40" />
                        <p className="text-sm font-medium text-muted-foreground animate-pulse">Carregando painel do grupo...</p>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (!group) return null

    const isOwner = group.ownerId === user?.uid

    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const totalTasks = tasks.length
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const copyInviteCode = () => {
        navigator.clipboard.writeText(group.inviteCode)
        setCodeCopied(true)
        setTimeout(() => setCodeCopied(false), 2000)
    }

    const tabs = [
        { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'materials', label: 'Materiais', icon: Files },
        { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-[#fcfcfd] dark:bg-[#020617]">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/grupos">
                        <Button variant="ghost" className="group gap-2 text-muted-foreground hover:text-primary rounded-full px-4 -ml-4 transition-all">
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Voltar para meus grupos
                        </Button>
                    </Link>
                </div>

                {/* Header Information Card */}
                <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-border/50 shadow-xl shadow-primary/5 mb-10">
                    {/* Decoração de fundo */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full -mr-36 -mt-36 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/3 rounded-full -ml-24 -mb-24 blur-2xl pointer-events-none" />

                    <div className="relative p-6 md:p-8 space-y-5">
                        {/* Linha 1: disciplina + código + ações */}
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Badge da disciplina */}
                                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-black uppercase tracking-widest">
                                    {group.subjectCode || 'ESTUDO'}
                                </span>

                                {/* Chip do código de convite */}
                                <button
                                    onClick={copyInviteCode}
                                    className={cn(
                                        'inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-bold transition-all duration-200',
                                        codeCopied
                                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-muted/40 border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5'
                                    )}
                                    aria-label="Copiar código de convite"
                                >
                                    <span className="opacity-60 text-[10px] uppercase tracking-wider font-bold">Código</span>
                                    <code className="font-mono font-black text-sm tracking-wider">{group.inviteCode}</code>
                                    {codeCopied
                                        ? <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
                                        : <Copy className="h-3 w-3 shrink-0" aria-hidden="true" />
                                    }
                                </button>
                            </div>

                            {/* Dropdown de ações */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 border border-border/60 shrink-0" aria-label="Opções do grupo">
                                        <MoreVertical className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                                    {isOwner && (
                                        <DropdownMenuItem onClick={() => setEditOpen(true)} className="gap-2 rounded-xl font-medium cursor-pointer">
                                            <Pencil className="h-4 w-4 opacity-60" aria-hidden="true" />
                                            Editar Grupo
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => setConfirmLeave(true)} className="gap-2 rounded-xl font-medium cursor-pointer">
                                        <LogOut className="h-4 w-4 opacity-60" aria-hidden="true" />
                                        Sair do Grupo
                                    </DropdownMenuItem>
                                    {isOwner && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => setConfirmDelete(true)} className="gap-2 rounded-xl font-medium cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                Excluir Grupo
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Linha 2: nome + descrição */}
                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
                                {group.name}
                            </h1>
                            {group.description && (
                                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                                    {group.description}
                                </p>
                            )}
                        </div>

                        {/* Separador */}
                        <div className="h-px bg-border/50" />

                        {/* Linha 3: stats */}
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Membros */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                                </div>
                                <div>
                                    <span className="font-black text-foreground">{group.members.length}</span>
                                    <span className="ml-1">{group.members.length === 1 ? 'membro' : 'membros'}</span>
                                </div>
                            </div>

                            <div className="h-4 w-px bg-border/60 hidden sm:block" aria-hidden="true" />

                            {/* Tarefas */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                                </div>
                                <div>
                                    <span className="font-black text-foreground">{completedTasks}</span>
                                    <span>/{totalTasks}</span>
                                    <span className="ml-1">tarefas concluídas</span>
                                </div>
                            </div>

                            {/* Barra de progresso inline */}
                            {totalTasks > 0 && (
                                <>
                                    <div className="h-4 w-px bg-border/60 hidden sm:block" aria-hidden="true" />
                                    <div className="flex items-center gap-2 flex-1 min-w-[120px] max-w-xs">
                                        <Progress value={progressPercent} className="h-2 flex-1" />
                                        <span className={cn(
                                            'text-xs font-black tabular-nums shrink-0',
                                            progressPercent === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                                        )}>
                                            {progressPercent}%
                                        </span>
                                    </div>
                                </>
                            )}

                            {/* Data de criação */}
                            {group.createdAt && (
                                <>
                                    <div className="h-4 w-px bg-border/60 hidden sm:block" aria-hidden="true" />
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                        <CalendarDays className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden="true" />
                                        <span>
                                            {new Date(group.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tab Navigation Menu */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-border/60 rounded-[1.5rem] mb-10 w-fit shadow-xl shadow-slate-200/50 dark:shadow-none mx-auto sm:mx-0">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'overview' | 'materials' | 'tasks')}
                                className={cn(
                                    "flex items-center gap-3 px-8 py-3.5 rounded-[1.2rem] text-sm font-black transition-all duration-300 relative",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-[1.03] z-10"
                                        : "text-muted-foreground hover:bg-muted font-bold"
                                )}
                            >
                                <Icon className={cn("h-4 w-4", isActive ? "animate-pulse" : "opacity-60")} aria-hidden="true" />
                                <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Main Content Area with Animated Tabs */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="min-h-[500px]"
                    >
                        {activeTab === 'overview' && (
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Stats Cards Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <CardInfo
                                            title="Tarefas Ativas"
                                            icon={CheckSquare}
                                            count={tasks.filter(t => t.status !== 'completed').length}
                                            color="blue"
                                            onClick={() => setActiveTab('tasks')}
                                        />
                                        <CardInfo
                                            title="Arquivos do Grupo"
                                            icon={Files}
                                            count={materials.length}
                                            color="emerald"
                                            onClick={() => setActiveTab('materials')}
                                        />
                                    </div>

                                    {/* Task Progress Bar */}
                                    {totalTasks > 0 && (
                                        <div
                                            className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-border shadow-sm cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                                            onClick={() => setActiveTab('tasks')}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === 'Enter' && setActiveTab('tasks')}
                                            aria-label={`Progresso das tarefas: ${completedTasks} de ${totalTasks} concluídas`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 italic">Progresso das Tarefas</p>
                                                <span className="text-sm font-black text-primary tabular-nums">{progressPercent}%</span>
                                            </div>
                                            <Progress value={progressPercent} className="h-3 rounded-full" />
                                            <p className="text-xs text-muted-foreground font-medium mt-3">
                                                {completedTasks} de {totalTasks} {totalTasks === 1 ? 'tarefa concluída' : 'tarefas concluídas'}
                                            </p>
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setActiveTab('tasks')}
                                            className="group flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-border/50 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 text-left"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                                                <CheckSquare className="h-6 w-6 text-blue-500" aria-hidden="true" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-sm">Quadro de Tarefas</p>
                                                <p className="text-xs text-muted-foreground font-medium mt-0.5 leading-relaxed">Divida responsabilidades e acompanhe o progresso.</p>
                                            </div>
                                            <Plus className="h-4 w-4 text-muted-foreground/40 group-hover:text-blue-500 group-hover:rotate-90 transition-all duration-300 shrink-0" aria-hidden="true" />
                                        </button>

                                        <button
                                            onClick={() => setActiveTab('materials')}
                                            className="group flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-border/50 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 transition-all duration-300 text-left"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                                                <Files className="h-6 w-6 text-emerald-500" aria-hidden="true" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-sm">Materiais & Links</p>
                                                <p className="text-xs text-muted-foreground font-medium mt-0.5 leading-relaxed">Salve PDFs, links do Drive e referências do grupo.</p>
                                            </div>
                                            <Plus className="h-4 w-4 text-muted-foreground/40 group-hover:text-emerald-500 group-hover:rotate-90 transition-all duration-300 shrink-0" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>

                                {/* Members List Sidebar */}
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-border shadow-sm">
                                        <h3 className="text-lg font-black mb-6 uppercase tracking-widest text-muted-foreground opacity-60">Membros do Time</h3>
                                        <div className="space-y-4">
                                            {group.members.slice(0, 5).map((memberId, idx) => {
                                                const name = getUserName(memberId)
                                                const isCreator = memberId === group.ownerId
                                                return (
                                                    <div key={memberId} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors">
                                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm" aria-hidden="true">
                                                            {isCreator ? '👑' : name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold truncate">{name}</p>
                                                            <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-50">
                                                                {isCreator ? 'Criador' : 'Membro'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            {group.members.length > 5 && (
                                                <p className="text-xs text-center text-muted-foreground font-bold py-2">
                                                    + {group.members.length - 5} outros membros
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                             </div>
                        )}

                        {activeTab === 'materials' && (
                            <MaterialList
                                groupId={group.id!}
                                materials={materials}
                                isLoading={isMaterialsLoading}
                                onAdd={handleAddMaterial}
                                onDelete={handleDeleteMaterial}
                            />
                        )}

                        {activeTab === 'tasks' && (
                             <TaskBoard
                                groupId={group.id!}
                                tasks={tasks}
                                isLoading={isTasksLoading}
                                onAdd={handleAddTask}
                                onUpdate={handleUpdateTask}
                                onAddComment={handleAddTaskComment}
                                onUpdateStatus={handleUpdateTaskStatus}
                                onDelete={handleDeleteTask}
                                members={group.members}
                                getUserName={getUserName}
                                currentUserId={user?.uid ?? ''}
                             />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
            <Footer />

            {/* Edit Group Dialog */}
            {editOpen && (
                <EditGroupDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    group={group}
                    onSave={handleUpdateGroup}
                />
            )}

            {/* Confirm Leave */}
            <Dialog open={confirmLeave} onOpenChange={setConfirmLeave}>
                <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Sair do grupo?</DialogTitle>
                        <DialogDescription className="font-medium">
                            Você perderá acesso ao painel e aos materiais do grupo. Para voltar, precisará de um novo código de convite.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 mt-2">
                        <Button variant="ghost" className="rounded-xl" onClick={() => setConfirmLeave(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            className="rounded-xl"
                            onClick={() => { setConfirmLeave(false); handleLeaveGroup() }}
                        >
                            Sair do Grupo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete */}
            <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Excluir grupo permanentemente?</DialogTitle>
                        <DialogDescription className="font-medium">
                            Esta ação não pode ser desfeita. Todos os membros perderão o acesso e os dados do grupo serão removidos.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 mt-2">
                        <Button variant="ghost" className="rounded-xl" onClick={() => setConfirmDelete(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            className="rounded-xl"
                            onClick={() => { setConfirmDelete(false); handleDeleteGroup() }}
                        >
                            Excluir Grupo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

/**
 * Card de informação resumida para a dashboard do grupo.
 */
function CardInfo({
    title,
    icon: Icon,
    count,
    color,
    onClick
}: {
    title: string,
    icon: React.ElementType,
    count: number,
    color: 'blue' | 'emerald',
    onClick: () => void
}) {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    }

    return (
        <button
            onClick={onClick}
            className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-border shadow-sm flex items-center justify-between group hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full text-left"
        >
            <div className="flex items-center gap-6">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", colorClasses[color])}>
                    <Icon className="h-8 w-8" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 opacity-60 italic">{title}</p>
                    <p className="text-4xl font-black tabular-nums">{count}</p>
                </div>
            </div>
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all" aria-hidden="true">
                <Plus className="h-5 w-5 rotate-45" />
            </div>
        </button>
    )
}
