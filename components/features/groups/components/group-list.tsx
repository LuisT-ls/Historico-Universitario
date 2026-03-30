'use client'

import { Group } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Users, ArrowRight, BookOpen, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

interface GroupListProps {
    groups: Group[]
    isLoading: boolean
    onCreateRequest: () => void
    onJoinRequest: () => void
}

/**
 * Lista de grupos do estudante, com estados de carregamento e vazio.
 */
export function GroupList({ groups, isLoading, onCreateRequest, onJoinRequest }: GroupListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-[70%]" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-10 w-full mt-4" />
                        </div>
                    </Card>
                ))}
            </div>
        )
    }

    if (groups.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6 rounded-3xl border border-dashed border-muted-foreground/30 bg-muted/10 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                    <Users className="h-10 w-10 text-primary opacity-40" />
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Comece a colaborar</h3>
                <p className="text-muted-foreground max-w-sm mb-10 leading-relaxed">
                    Você ainda não participa de nenhum grupo. Crie um espaço para o seu trabalho ou peça o código de acesso para seu colega.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Button onClick={onCreateRequest} size="lg" className="px-8 shadow-lg shadow-primary/20">
                        Criar Novo Grupo
                    </Button>
                    <Button variant="outline" onClick={onJoinRequest} size="lg" className="px-8">
                        Entrar com Código
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
            ))}
        </div>
    )
}

/**
 * Card individual de grupo com botão de cópia do código de convite.
 */
function GroupCard({ group }: { group: Group }) {
    const [copied, setCopied] = useState(false)

    const copyCode = (e: React.MouseEvent) => {
        e.preventDefault()
        navigator.clipboard.writeText(group.inviteCode)
        toast.success('Código copiado! Compartilhe com seus colegas.')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className="group border border-border/50 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/50">
                        {group.subjectCode || 'ESTUDO'}
                    </span>
                </div>
                <CardTitle className="text-xl font-bold line-clamp-1">{group.name}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-[40px] text-sm leading-relaxed">
                    {group.description || 'Sem descrição cadastrada. Use este espaço para organizar sua colaboração.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-6 flex-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 opacity-50" aria-hidden="true" />
                        <span>{group.members.length} {group.members.length === 1 ? 'membro' : 'membros'}</span>
                    </div>
                    <button
                        onClick={copyCode}
                        className="flex items-center gap-1.5 text-primary font-mono bg-primary/5 hover:bg-primary/15 px-2.5 py-1 rounded-lg transition-colors border border-primary/10 hover:border-primary/30"
                        aria-label={`Copiar código de convite: ${group.inviteCode}`}
                        title="Copiar código de convite"
                    >
                        <span className="font-black tracking-wider">{group.inviteCode}</span>
                        {copied
                            ? <Check className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                            : <Copy className="h-3 w-3 opacity-60" aria-hidden="true" />
                        }
                    </button>
                </div>
            </CardContent>
            <CardFooter className="pt-0 px-6 pb-6">
                <Link href={`/grupos/${group.id}`} className="w-full">
                    <Button className="w-full gap-2 group-hover:gap-3 transition-all duration-300 shadow-sm" variant="secondary">
                        Acessar Painel
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
