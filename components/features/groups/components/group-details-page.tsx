'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useGroupDetails } from '@/components/features/groups/hooks/use-group-details'
import { Loader2, ArrowLeft, Files, CheckSquare, LayoutDashboard, Copy, Info, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// Sub-components (serão movidos para arquivos próprios se crescerem demais)
import { MaterialList } from './material-list'
import { TaskBoard } from './task-board'

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
        handleAddTask,
        handleUpdateTaskStatus,
        handleDeleteTask,
        handleAddMaterial,
        handleDeleteMaterial
    } = useGroupDetails()
    
    const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'tasks'>('overview')

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

    const copyInviteCode = () => {
        navigator.clipboard.writeText(group.inviteCode)
        toast.success('Código de convite copiado para a área de transferência!')
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
                <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 border border-border/50 shadow-2xl shadow-primary/5 mb-10 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                    
                    <div className="relative flex flex-col lg:flex-row justify-between items-start gap-8">
                        <div className="space-y-6 max-w-3xl">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="secondary" className="px-4 py-1.5 rounded-xl font-bold text-[10px] tracking-[0.15em] bg-primary/10 text-primary border-none uppercase">
                                    {group.subjectCode || 'ESTUDO'}
                                </Badge>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold bg-muted/50 px-4 py-1.5 rounded-xl border border-border group-hover:border-primary/30 transition-colors">
                                    <span className="uppercase tracking-widest opacity-60">Código:</span>
                                    <code className="font-mono text-primary text-sm font-black">{group.inviteCode}</code>
                                    <button 
                                        onClick={copyInviteCode} 
                                        className="hover:text-primary transition-colors p-1 hover:bg-primary/5 rounded"
                                        title="Copiar código"
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground sm:text-6xl bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                                {group.name}
                            </h1>
                            
                            <p className="text-lg text-muted-foreground leading-relaxed font-medium opacity-80">
                                {group.description || 'Nenhuma descrição detalhada. Use este painel para colaborar com seu time.'}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-border min-w-[200px] justify-center lg:self-center shadow-inner">
                            <div className="text-center group-hover:scale-110 transition-transform duration-500">
                                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em] mb-2 opacity-60 italic">Equipe</p>
                                <div className="flex flex-col items-center">
                                    <span className="text-5xl font-black text-primary leading-none">{group.members.length}</span>
                                    <span className="text-xs font-bold text-muted-foreground mt-1 uppercase">Membros</span>
                                </div>
                            </div>
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
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-3 px-8 py-3.5 rounded-[1.2rem] text-sm font-black transition-all duration-300 relative",
                                    isActive 
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-[1.03] z-10" 
                                        : "text-muted-foreground hover:bg-muted font-bold"
                                )}
                            >
                                <Icon className={cn("h-4 w-4", isActive ? "animate-pulse" : "opacity-60")} />
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

                                    {/* Helpful Tip/Intro Card */}
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
                                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                                        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                                            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shrink-0">
                                                <Info className="h-10 w-10 text-white" />
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-2xl font-black">Como funciona este painel?</h3>
                                                <p className="text-white/80 leading-relaxed font-medium">
                                                    Use as abas acima para gerenciar a colaboração do seu grupo. Em <b>Materiais</b>, você pode salvar links e PDFs importantes. Em <b>Tarefas</b>, você divide quem faz o que para ninguém ficar sobrecarregado.
                                                </p>
                                                <div className="pt-2">
                                                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" onClick={() => setActiveTab('tasks')}>
                                                        Começar a organizar
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Members List / Activity Mini Sidebar */}
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-border shadow-sm">
                                        <h3 className="text-lg font-black mb-6 uppercase tracking-widest text-muted-foreground opacity-60">Membros do Time</h3>
                                        <div className="space-y-4">
                                            {group.members.slice(0, 5).map((memberId, idx) => (
                                                <div key={memberId} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                                                        {idx === 0 ? '👑' : memberId.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold truncate">Usuário {memberId.substring(0, 5)}</p>
                                                        <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-50">Membro</p>
                                                    </div>
                                                </div>
                                            ))}
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
                                onUpdateStatus={handleUpdateTaskStatus}
                                onDelete={handleDeleteTask}
                                members={group.members}
                             />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
            <Footer />
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
    icon: any, 
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
                    <Icon className="h-8 w-8" />
                </div>
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 opacity-60 italic">{title}</p>
                    <p className="text-4xl font-black tabular-nums">{count}</p>
                </div>
            </div>
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                <Plus className="h-5 w-5 rotate-45" />
            </div>
        </button>
    )
}
