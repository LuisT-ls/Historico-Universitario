'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Loader2, AlertCircle, Plus, Hash, Users, GraduationCap } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useGroups } from '@/components/features/groups/hooks/use-groups'
import { GroupList } from '@/components/features/groups/components/group-list'
import { CreateGroupDialog } from '@/components/features/groups/components/create-group-dialog'
import { JoinGroupDialog } from '@/components/features/groups/components/join-group-dialog'
import { useState } from 'react'
import Link from 'next/link'

/**
 * Página principal do módulo de Grupos.
 * Exibe a lista de grupos do usuário e permite criar ou entrar em grupos existentes.
 */
export function GroupsPage() {
    const { 
        groups, 
        isLoading, 
        authLoading, 
        error, 
        user, 
        loadGroups, 
        handleJoinGroup 
    } = useGroups()
    
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isJoinOpen, setIsJoinOpen] = useState(false)

    // Estado de carregamento inicial (Autenticação)
    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                        <p className="text-sm font-medium text-muted-foreground animate-pulse">Carregando seus grupos...</p>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    // Estado de erro/Login necessário
    if (!user) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                    <div className="text-center space-y-6 max-w-lg mx-auto bg-card p-10 rounded-[2.5rem] border border-border shadow-2xl shadow-primary/5">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="h-10 w-10 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight">Colabore com seus Colegas</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Para criar grupos de estudo, compartilhar documentos e gerenciar tarefas, você precisa estar logado na sua conta.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                            <Link href="/login">
                                <Button size="lg" className="w-full sm:w-auto px-10 rounded-full shadow-lg shadow-primary/20">
                                    Entrar Agora
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto px-10 rounded-full">
                                    Criar Conta
                                </Button>
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#fcfcfd] dark:bg-[#020617]">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
                {/* Cabeçalho da Página */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
                            <GraduationCap className="h-4 w-4" />
                            <span>Trabalho Colaborativo</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Meus Grupos</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl font-medium opacity-80">
                            Centralize seus trabalhos em grupo, compartilhe materiais de estudo e organize tarefas com facilidade.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <Button 
                            variant="outline" 
                            size="lg"
                            className="gap-2.5 rounded-2xl h-14 px-6 border-2 font-bold hover:bg-muted transition-all active:scale-95"
                            onClick={() => setIsJoinOpen(true)}
                        >
                            <Hash className="h-5 w-5 text-muted-foreground" />
                            Entrar no Grupo
                        </Button>
                        <Button 
                            size="lg"
                            className="gap-2.5 rounded-2xl h-14 px-8 font-bold shadow-xl shadow-primary/20 transition-all active:scale-95"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <Plus className="h-5 w-5" />
                            Novo Grupo
                        </Button>
                    </div>
                </div>

                {/* Mensagens de Erro */}
                {error && (
                    <Alert variant="destructive" className="mb-8 rounded-2xl border-2 animate-in slide-in-from-top-4 duration-300">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle className="font-bold text-base leading-tight ml-2">{error.title}</AlertTitle>
                        <AlertDescription className="text-sm opacity-90 ml-2">
                            {error.message}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Lista de Grupos */}
                <div className="relative">
                    <GroupList 
                        groups={groups} 
                        isLoading={isLoading} 
                        onCreateRequest={() => setIsCreateOpen(true)}
                        onJoinRequest={() => setIsJoinOpen(true)}
                    />
                </div>
            </main>
            <Footer />

            {/* Diálogos */}
            <CreateGroupDialog 
                open={isCreateOpen} 
                onOpenChange={setIsCreateOpen} 
                onSuccess={loadGroups} 
                userId={user.uid}
            />
            
            <JoinGroupDialog 
                open={isJoinOpen} 
                onOpenChange={setIsJoinOpen}
                onJoin={handleJoinGroup}
            />
        </div>
    )
}
