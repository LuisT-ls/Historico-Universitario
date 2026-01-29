'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    GraduationCap,
    Book,
    CheckCircle,
    Clock,
    Star,
    Award,
    AlertCircle,
    School,
    Calendar,
    User as UserIcon,
    ShieldAlert,
    ArrowUpRight
} from 'lucide-react'
import { CURSOS, NATUREZA_LABELS } from '@/lib/constants'
import { calcularEstatisticas } from '@/lib/utils'
import type { Profile, Disciplina, Certificado, UserStatistics, Natureza } from '@/types'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

interface PublicProfilePageProps {
    userId: string
}

export function PublicProfilePage({ userId }: PublicProfilePageProps) {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [stats, setStats] = useState<UserStatistics | null>(null)
    const [disciplines, setDisciplines] = useState<Disciplina[]>([])
    const [certificates, setCertificates] = useState<Certificado[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPrivate, setIsPrivate] = useState(false)

    useEffect(() => {
        async function loadPublicData() {
            if (!userId || !db) return

            try {
                setLoading(true)

                // 1. Fetch User Profile
                const userRef = doc(db, 'users', userId)
                const userSnap = await getDoc(userRef)

                if (!userSnap.exists()) {
                    setError('Perfil não encontrado.')
                    setLoading(false)
                    return
                }

                const userData = userSnap.data()

                // 2. Check Privacy
                // If settings.privacy is NOT 'public', access is denied.
                if (userData.settings?.privacy !== 'public') {
                    setIsPrivate(true)
                    setLoading(false)
                    return
                }

                setProfile({
                    uid: userId as any,
                    nome: userData.name || 'Estudante',
                    email: userData.email,
                    photoURL: userData.photoURL || '',
                    curso: userData.profile?.course || 'BICTI',
                    institution: userData.profile?.institution || '',
                    startYear: userData.profile?.startYear,
                    startSemester: userData.profile?.startSemester,
                })

                // 3. Fetch Disciplines for Stats
                const disciplinesQ = query(collection(db, 'disciplines'), where('userId', '==', userId))
                const disciplinesSnap = await getDocs(disciplinesQ)
                const disciplines: Disciplina[] = []
                disciplinesSnap.forEach(d => disciplines.push({ ...d.data(), id: d.id } as any))

                // Sort disciplines by period (newest first)
                disciplines.sort((a, b) => {
                    const [anoA, semA] = (a.periodo || '0.0').split('.').map(Number)
                    const [anoB, semB] = (b.periodo || '0.0').split('.').map(Number)
                    if (anoA !== anoB) return anoB - anoA
                    return semB - semA
                })

                setDisciplines(disciplines)

                // 4. Fetch Approved Certificates
                const certsQ = query(
                    collection(db, 'certificados'),
                    where('userId', '==', userId),
                    where('status', '==', 'aprovado')
                )
                const certsSnap = await getDocs(certsQ)
                const certs: Certificado[] = []
                certsSnap.forEach(c => certs.push({ ...c.data(), id: c.id } as any))

                setCertificates(certs)

                // Use the course from the fetched user data
                const userCourse = userData.profile?.course || 'BICTI'
                setStats(calcularEstatisticas(disciplines, certs, userCourse))

            } catch (err) {
                console.error('Error loading public profile:', err)
                setError('Erro ao carregar perfil público.')
            } finally {
                setLoading(false)
            }
        }

        loadPublicData()
    }, [userId])

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center space-y-4">
                <div className="w-full max-w-4xl space-y-8">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
                    </div>
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        )
    }

    if (isPrivate) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <ShieldAlert className="h-24 w-24 text-muted-foreground/20 mb-6" />
                <h1 className="text-3xl font-bold mb-2">Perfil Privado</h1>
                <p className="text-muted-foreground max-w-md">
                    Este perfil está configurado como privado pelo usuário.
                </p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="h-24 w-24 text-destructive/20 mb-6" />
                <h1 className="text-3xl font-bold mb-2">Perfil Não Encontrado</h1>
                <p className="text-muted-foreground">{error}</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header / Hero */}
            <div className="bg-muted/30 border-b border-border">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 max-w-5xl mx-auto">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-xl overflow-hidden relative">
                            {profile?.photoURL ? (
                                <img src={profile.photoURL} alt={profile.nome} className="h-full w-full object-cover" />
                            ) : (
                                <UserIcon className="h-10 w-10 text-primary" />
                            )}
                        </div>
                        <div className="text-center md:text-left space-y-2 flex-1">
                            <div className="flex flex-col md:flex-row items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tight">{profile?.nome}</h1>
                                <Badge variant="secondary" className="text-xs font-bold uppercase tracking-wider">
                                    Estudante Verificado
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <GraduationCap className="h-4 w-4" />
                                    {CURSOS[profile?.curso || 'BICTI']?.nome || profile?.curso}
                                </span>
                                {profile?.institution && (
                                    <span className="flex items-center gap-1.5">
                                        <School className="h-4 w-4" />
                                        {profile.institution}
                                    </span>
                                )}
                                {profile?.startYear && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        Início: {profile.startYear}
                                    </span>
                                )}
                                {/* Enrollment Number in Header */}
                                {profile?.matricula && (
                                    <span className="flex items-center gap-1.5">
                                        <ShieldAlert className="h-4 w-4" />
                                        Matrícula: {profile.matricula}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-5xl space-y-12">
                {/* Stats Grid */}
                <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Book className="h-5 w-5 text-primary" />
                        Resumo Acadêmico
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Disciplinas', value: stats?.totalDisciplines || 0, icon: Book, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                            { label: 'Concluídas', value: stats?.completedDisciplines || 0, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
                            { label: 'Em Andamento', value: stats?.inProgressDisciplines || 0, icon: Clock, color: 'text-sky-500', bg: 'bg-sky-500/10' },
                            { label: 'Média Global', value: stats?.averageGrade?.toFixed(1) || '-', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                        ].map((stat, i) => (
                            <Card key={i} className="border-none shadow-sm bg-card hover:bg-accent/5 transition-colors">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{stat.label}</p>
                                        <p className="text-2xl font-black">{stat.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Requirements Detail Section */}
                {stats && profile && profile.curso && CURSOS[profile.curso] && (
                    <section>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            Detalhamento de Requisitos
                        </h2>
                        <Card className="rounded-2xl shadow-sm border-none bg-card overflow-hidden">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-muted/30">
                                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Natureza</th>
                                                <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Meta</th>
                                                <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Cursado</th>
                                                <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Falta</th>
                                                <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Progresso</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(CURSOS[profile.curso].requisitos).map(([natureza, meta]) => {
                                                const cursado = stats.horasPorNatureza?.[natureza as Natureza] || 0
                                                const falta = Math.max(0, meta - cursado)
                                                const progresso = meta > 0 ? Math.min((cursado / meta) * 100, 100) : 0

                                                return (
                                                    <tr key={natureza} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                                        <td className="p-4">
                                                            <p className="font-semibold text-sm">{NATUREZA_LABELS[natureza] || natureza}</p>
                                                        </td>
                                                        <td className="p-4 text-right font-mono text-sm">{meta}h</td>
                                                        <td className="p-4 text-right font-mono text-sm font-bold">{cursado}h</td>
                                                        <td className="p-4 text-right font-mono text-sm font-bold text-muted-foreground">{falta}h</td>
                                                        <td className="p-4 text-right w-32">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-500 ${progresso >= 100 ? "bg-green-500" : "bg-primary"}`}
                                                                        style={{ width: `${progresso}%` }}
                                                                    />
                                                                </div>
                                                                <span className={`text-[10px] font-bold w-8 ${progresso >= 100 ? "text-green-500" : "text-muted-foreground"}`}>
                                                                    {progresso.toFixed(0)}%
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                )}

                {/* Approved Disciplines List */}
                {stats && (
                    <section>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            Disciplinas Concluídas
                        </h2>
                        <Card className="rounded-2xl shadow-sm border-none bg-card overflow-hidden">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-muted/30">
                                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Período</th>
                                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Código</th>
                                                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Disciplina</th>
                                                <th className="text-center p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">CH</th>
                                                <th className="text-center p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Nota</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {disciplines
                                                .filter(d => (d.resultado === 'AP' || d.nota >= 5) && d.natureza !== 'AC')
                                                .map((d) => (
                                                    <tr key={d.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                                        <td className="p-4 font-mono text-sm">{d.periodo}</td>
                                                        <td className="p-4 font-mono text-xs text-muted-foreground">{d.codigo}</td>
                                                        <td className="p-4 font-medium text-sm">{d.nome}</td>
                                                        <td className="p-4 text-center font-mono text-sm text-muted-foreground">{d.ch}h</td>
                                                        <td className="p-4 text-center">
                                                            <Badge variant={d.nota >= 5 ? "default" : "secondary"} className={d.nota >= 5 ? "bg-green-500 hover:bg-green-600" : ""}>
                                                                {d.nota.toFixed(1)}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            {disciplines.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                        Nenhuma disciplina concluída encontrada.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                )}

                {/* Certificates Section */}
                <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Certificados e Atividades
                    </h2>

                    {certificates.length === 0 ? (
                        <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
                            <Award className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                            <p className="text-muted-foreground font-medium">Nenhum certificado público disponível.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {certificates.map((cert) => (
                                <Card key={cert.id} className="border-border/50 bg-card hover:shadow-md transition-all group relative">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base font-bold leading-tight flex items-center gap-2">
                                                    {cert.titulo}
                                                    {cert.linkExterno && (
                                                        <a href={cert.linkExterno} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ArrowUpRight className="h-4 w-4 text-primary" />
                                                        </a>
                                                    )}
                                                </CardTitle>
                                                <CardDescription className="text-xs font-medium">{cert.instituicao}</CardDescription>
                                            </div>
                                            <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-500/20 text-[10px] uppercase">
                                                Verificado
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
                                            <span className="font-bold text-foreground">{cert.cargaHoraria} horas</span>
                                            <span>•</span>
                                            <span className="uppercase">{cert.tipo}</span>
                                            {cert.dataInicio && (
                                                <>
                                                    <span>•</span>
                                                    <span>{new Date(cert.dataInicio).toLocaleDateString('pt-BR')}</span>
                                                </>
                                            )}
                                        </div>
                                        {(cert.arquivoURL || cert.linkExterno) && (
                                            <a
                                                href={cert.arquivoURL || cert.linkExterno}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-0 ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl"
                                            >
                                                <span className="sr-only">Ver certificado</span>
                                            </a>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Footer Simple */}
            <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border mt-12 bg-muted/10">
                <p>
                    Gerado por <strong>Histórico Acadêmico</strong>
                </p>
            </footer>
        </div>
    )
}
