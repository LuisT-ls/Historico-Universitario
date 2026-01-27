'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CURSOS, NATUREZA_LABELS } from '@/lib/constants'
import { getPeriodoMaisRecente, sanitizeInput, calcularCR, calcularCreditos, calcularPCH, calcularPCR, calcularPrevisaoFormaturaCompleta, cn } from '@/lib/utils'
import { PlusCircle, X, TrendingUp, TrendingDown, Calculator, Trash2, Search, GraduationCap, Book, CheckCircle, Clock, Star, Loader2 } from 'lucide-react'
import { logger } from '@/lib/logger'
import { useAuth } from '@/components/auth-provider'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Curso, Disciplina, Natureza } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

interface DisciplinaData {
  codigo: string
  nome: string
  natureza: Natureza
  ch?: number
}

const simulationSchema = z
  .object({
    periodo: z.string().min(1, 'Semestre é obrigatório'),
    codigo: z.string().min(1, 'Código é obrigatório'),
    nome: z.string().min(1, 'Nome é obrigatório'),
    natureza: z.string().min(1, 'Natureza é obrigatória'),
    ch: z.preprocess(
      (val) => (val === '' || val === undefined ? undefined : Number(val)),
      z.number().min(1, 'Carga horária deve ser maior que 0')
    ),
    nota: z.preprocess(
      (val) => (val === '' || val === undefined ? undefined : Number(val)),
      z.number().min(0).max(10, 'Nota deve estar entre 0 e 10').optional()
    ),
  })
  .refine(
    (data) => {
      if (data.natureza === 'AC') return true
      return data.nota !== undefined && data.nota !== null
    },
    {
      message: 'Nota é obrigatória para esta natureza',
      path: ['nota'],
    }
  )

type SimulationFormData = z.infer<typeof simulationSchema>

interface ImpactMetrics {
  cr: { atual: number; simulado: number; diferenca: number }
  ch: { atual: number; simulado: number; diferenca: number }
  creditos: { atual: number; simulado: number; diferenca: number }
  pch: { atual: number; simulado: number; diferenca: number }
  pcr: { atual: number; simulado: number; diferenca: number }
  formatura: {
    atual: { horasFaltantes: number; semestresRestantes: number; podeFormar: boolean }
    simulado: { horasFaltantes: number; semestresRestantes: number; podeFormar: boolean }
  }
}

export function SimuladorPageClient() {
  const { user, loading: authLoading } = useAuth()
  const [cursoAtual, setCursoAtual] = useState<Curso>('BICTI')
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [disciplinasSimuladas, setDisciplinasSimuladas] = useState<Disciplina[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [disciplinasData, setDisciplinasData] = useState<Record<string, DisciplinaData[]>>({})
  const [searchResults, setSearchResults] = useState<DisciplinaData[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<SimulationFormData>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      periodo: '',
      codigo: '',
      nome: '',
      natureza: '',
      ch: '' as any,
      nota: '' as any,
    },
  })

  const natureza = watch('natureza')
  const nome = watch('nome')
  const isAC = natureza === 'AC'
  const naturezasDisponiveis = Object.keys(CURSOS[cursoAtual]?.requisitos || {}) as Natureza[]

  // Carregar disciplinas reais do usuário
  const loadDisciplinas = useCallback(async () => {
    if (!user || !db) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const disciplinesRef = collection(db, 'disciplines')
      const q = query(disciplinesRef, where('userId', '==', user.uid))
      const querySnapshot = await getDocs(q)

      const docs: Disciplina[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        docs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
        } as Disciplina)
      })

      // Filtrar pelo curso (simplificado para o simulador)
      // Em uma implementação real, poderíamos pegar o curso do perfil
      setDisciplinas(docs)
      
      // Tentar pegar o curso mais comum nas disciplinas
      if (docs.length > 0) {
        const counts: Record<string, number> = {}
        docs.forEach(d => {
          if (d.curso) counts[d.curso] = (counts[d.curso] || 0) + 1
        })
        const mainCourse = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as Curso
        if (mainCourse) setCursoAtual(mainCourse)
      }

      // Definir período padrão para simulação
      const ultimo = getPeriodoMaisRecente(docs)
      if (ultimo) {
        const [ano, sem] = ultimo.split('.').map(Number)
        const proximo = sem === 1 ? `${ano}.2` : `${ano + 1}.1`
        setValue('periodo', proximo)
      }
    } catch (error) {
      logger.error('Erro ao carregar disciplinas:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, setValue])

  useEffect(() => {
    if (!authLoading) {
      loadDisciplinas()
    }
  }, [authLoading, loadDisciplinas])

  // Carregar base de dados de disciplinas
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/assets/data/disciplinas.json')
        const data = await response.json()
        setDisciplinasData(data)
      } catch (error) {
        logger.error('Erro ao carregar base de disciplinas:', error)
      }
    }
    loadData()
  }, [])

  // Lógica de busca (mesma do componente original)
  useEffect(() => {
    if (!disciplinasData || !nome || nome.trim().length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const term = nome.toLowerCase().trim()
    const matches = (disciplinasData[cursoAtual] || [])
      .filter(d => d.nome.toLowerCase().includes(term) || d.codigo.toLowerCase().includes(term))
      .slice(0, 8)

    setSearchResults(matches)
    setShowResults(matches.length > 0)
  }, [nome, cursoAtual, disciplinasData])

  const handleSelectDisciplina = (disciplina: DisciplinaData) => {
    setValue('codigo', disciplina.codigo)
    setValue('nome', disciplina.nome)
    setValue('natureza', disciplina.natureza)
    if (disciplina.ch) setValue('ch', disciplina.ch)
    setShowResults(false)
  }

  const cursoConfig = CURSOS[cursoAtual]

  const metricasAtuais = useMemo(() => {
    const aprovadas = disciplinas.filter(d => d.resultado === 'AP')
    const acs = disciplinas.filter(d => d.natureza === 'AC')
    const emCurso = disciplinas.filter(d => d.resultado === 'DP' || d.emcurso)
    
    const totalCH = aprovadas.reduce((sum, d) => sum + d.ch, 0) + acs.reduce((sum, d) => sum + d.ch, 0)
    const totalCHComEmCurso = totalCH + emCurso.reduce((sum, d) => sum + d.ch, 0)

    return {
      cr: calcularCR(disciplinas),
      ch: totalCH,
      creditos: calcularCreditos(disciplinas),
      pch: calcularPCH(disciplinas),
      pcr: calcularPCR(disciplinas),
      previsao: calcularPrevisaoFormaturaCompleta(disciplinas, totalCH, totalCHComEmCurso, totalCHComEmCurso - totalCH, cursoConfig?.totalHoras || 2400, emCurso),
      faltantes: Math.max(0, (cursoConfig?.totalHoras || 2400) - totalCHComEmCurso)
    }
  }, [disciplinas, cursoConfig])

  const metricasSimuladas = useMemo(() => {
    const todas = [...disciplinas, ...disciplinasSimuladas]
    const aprovadas = todas.filter(d => d.resultado === 'AP' || d.resultado === undefined && d.natureza === 'AC')
    const acs = todas.filter(d => d.natureza === 'AC')
    const emCurso = todas.filter(d => d.resultado === 'DP' || d.emcurso)
    
    const totalCH = aprovadas.reduce((sum, d) => sum + d.ch, 0)
    const totalCHComEmCurso = totalCH + emCurso.reduce((sum, d) => sum + d.ch, 0)

    return {
      cr: calcularCR(todas),
      ch: totalCH,
      creditos: calcularCreditos(todas),
      pch: calcularPCH(todas),
      pcr: calcularPCR(todas),
      previsao: calcularPrevisaoFormaturaCompleta(todas, totalCH, totalCHComEmCurso, totalCHComEmCurso - totalCH, cursoConfig?.totalHoras || 2400, emCurso),
      faltantes: Math.max(0, (cursoConfig?.totalHoras || 2400) - totalCHComEmCurso)
    }
  }, [disciplinas, disciplinasSimuladas, cursoConfig])

  const impacto = useMemo<ImpactMetrics>(() => ({
    cr: { atual: metricasAtuais.cr, simulado: metricasSimuladas.cr, diferenca: metricasSimuladas.cr - metricasAtuais.cr },
    ch: { atual: metricasAtuais.ch, simulado: metricasSimuladas.ch, diferenca: metricasSimuladas.ch - metricasAtuais.ch },
    creditos: { atual: metricasAtuais.creditos, simulado: metricasSimuladas.creditos, diferenca: metricasSimuladas.creditos - metricasAtuais.creditos },
    pch: { atual: metricasAtuais.pch, simulado: metricasSimuladas.pch, diferenca: metricasSimuladas.pch - metricasAtuais.pch },
    pcr: { atual: metricasAtuais.pcr, simulado: metricasSimuladas.pcr, diferenca: metricasSimuladas.pcr - metricasAtuais.pcr },
    formatura: {
      atual: { horasFaltantes: metricasAtuais.faltantes, semestresRestantes: metricasAtuais.previsao.semestresRestantes, podeFormar: metricasAtuais.previsao.podeFormarEsteSemestre },
      simulado: { horasFaltantes: metricasSimuladas.faltantes, semestresRestantes: metricasSimuladas.previsao.semestresRestantes, podeFormar: metricasSimuladas.previsao.podeFormarEsteSemestre }
    }
  }), [metricasAtuais, metricasSimuladas])

  const onSubmit = (data: SimulationFormData) => {
    const isAC = data.natureza === 'AC'
    const nova: Disciplina = {
      periodo: sanitizeInput(data.periodo),
      codigo: sanitizeInput(data.codigo),
      nome: sanitizeInput(data.nome),
      natureza: data.natureza as Natureza,
      ch: data.ch,
      nota: isAC ? 0 : (data.nota || 0),
      resultado: isAC ? undefined : 'AP',
      curso: cursoAtual,
    }
    setDisciplinasSimuladas([...disciplinasSimuladas, nova])
    reset({ ...data, codigo: '', nome: '', natureza: '', ch: '' as any, nota: '' as any })
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight mb-2 text-foreground">Simulador "E Se?"</h1>
          <p className="text-sm text-muted-foreground dark:text-slate-400 font-medium">
            Planeje seu próximo semestre e veja o impacto no seu CR e previsão de formatura.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna da Esquerda: Formulário e Lista */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl border-none shadow-sm bg-card overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-primary" />
                  Adicionar Disciplina para Simulação
                </CardTitle>
                <CardDescription>As disciplinas simuladas são consideradas aprovadas para os cálculos.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400">Semestre</Label>
                      <Input {...register('periodo')} placeholder="Ex: 2026.1" className="rounded-xl bg-background dark:bg-slate-800/50 border-border dark:border-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400">Código</Label>
                      <Input {...register('codigo')} placeholder="Ex: CTIA01" className="rounded-xl bg-background dark:bg-slate-800/50 border-border dark:border-slate-700" />
                    </div>
                  </div>

                  <div className="space-y-2 relative" ref={searchRef}>
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400">Nome da Disciplina</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-slate-500" />
                      <Input 
                        {...register('nome')} 
                        placeholder="Busque por nome ou código..." 
                        className="pl-10 rounded-xl bg-background dark:bg-slate-800/50 border-border dark:border-slate-700"
                        onFocus={() => setShowResults(true)}
                      />
                    </div>
                    {showResults && searchResults.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-background dark:bg-slate-900 border border-border dark:border-slate-800 rounded-xl shadow-xl overflow-hidden">
                        {searchResults.map((d, i) => (
                          <button
                            key={i}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-accent dark:hover:bg-slate-800 transition-colors text-sm border-b border-border dark:border-slate-800 last:border-0 text-foreground dark:text-slate-200"
                            onClick={() => handleSelectDisciplina(d)}
                          >
                            <span className="font-bold text-primary dark:text-blue-400 mr-2">{d.codigo}</span>
                            <span>{d.nome}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400">Natureza</Label>
                      <select 
                        {...register('natureza')} 
                        className="flex h-10 w-full rounded-xl border border-border dark:border-slate-700 bg-background dark:bg-slate-800/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
                      >
                        <option value="">Selecione...</option>
                        {naturezasDisponiveis.map(n => <option key={n} value={n}>{NATUREZA_LABELS[n] || n}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400">CH</Label>
                      <Input type="number" {...register('ch')} placeholder="Ex: 60" className="rounded-xl bg-background dark:bg-slate-800/50 border-border dark:border-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400">Nota Esperada</Label>
                      <Input type="number" step="0.1" {...register('nota')} placeholder="0.0 a 10.0" className="rounded-xl bg-background dark:bg-slate-800/50 border-border dark:border-slate-700" />
                    </div>
                  </div>

                  <Button type="submit" className="w-full rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar à Simulação
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Tabela de Simuladas */}
            <Card className="rounded-2xl border-none shadow-sm bg-card overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Disciplinas Simuladas</CardTitle>
                  <CardDescription>{disciplinasSimuladas.length} matérias no plano</CardDescription>
                </div>
                {disciplinasSimuladas.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setDisciplinasSimuladas([])} className="text-muted-foreground dark:text-slate-400 hover:text-destructive dark:hover:text-red-400">
                    Limpar Tudo
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {disciplinasSimuladas.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground dark:text-slate-500">
                    <Calculator className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Nenhuma disciplina adicionada para simulação.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted dark:bg-slate-800/50 border-b border-border dark:border-slate-700">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold text-muted-foreground dark:text-slate-400 uppercase text-[10px]">Semestre</th>
                          <th className="px-4 py-3 text-left font-bold text-muted-foreground dark:text-slate-400 uppercase text-[10px]">Código</th>
                          <th className="px-4 py-3 text-left font-bold text-muted-foreground dark:text-slate-400 uppercase text-[10px]">Nome</th>
                          <th className="px-4 py-3 text-center font-bold text-muted-foreground dark:text-slate-400 uppercase text-[10px]">CH</th>
                          <th className="px-4 py-3 text-center font-bold text-muted-foreground dark:text-slate-400 uppercase text-[10px]">Nota</th>
                          <th className="px-4 py-3 text-right font-bold text-muted-foreground dark:text-slate-400 uppercase text-[10px]">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {disciplinasSimuladas.map((d, i) => (
                          <tr key={i} className="border-b border-border dark:border-slate-800/50 hover:bg-accent dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{d.periodo}</td>
                            <td className="px-4 py-3 font-mono text-primary dark:text-blue-400">{d.codigo}</td>
                            <td className="px-4 py-3 truncate max-w-[200px] text-foreground">{d.nome}</td>
                            <td className="px-4 py-3 text-center font-bold text-foreground">{d.ch}h</td>
                            <td className="px-4 py-3 text-center font-black text-green-600 dark:text-green-400">{d.nota.toFixed(1)}</td>
                            <td className="px-4 py-3 text-right">
                              <Button variant="ghost" size="icon" onClick={() => setDisciplinasSimuladas(prev => prev.filter((_, idx) => idx !== i))} className="h-8 w-8 text-muted-foreground dark:text-slate-500 hover:text-destructive dark:hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna da Direita: Impacto e Métricas */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-none shadow-xl bg-card dark:bg-slate-900 border-t-4 border-t-primary overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Impacto no CR
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted dark:bg-slate-800/50 rounded-2xl border border-border dark:border-slate-700/50">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground dark:text-slate-500 mb-1">CR Atual</p>
                    <p className="text-2xl font-black text-foreground">{impacto.cr.atual.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground dark:text-slate-500 mb-1">CR Simulado</p>
                    <p className={cn(
                      "text-2xl font-black",
                      impacto.cr.diferenca > 0 ? "text-green-600 dark:text-green-400" : impacto.cr.diferenca < 0 ? "text-red-600 dark:text-red-400" : "text-foreground"
                    )}>
                      {impacto.cr.simulado.toFixed(2)}
                    </p>
                  </div>
                </div>

                {impacto.cr.diferenca !== 0 && (
                  <div className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border",
                    impacto.cr.diferenca > 0 ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                  )}>
                    {impacto.cr.diferenca > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                    <span className="text-sm font-bold">
                      {impacto.cr.diferenca > 0 ? 'Aumento' : 'Redução'} de {Math.abs(impacto.cr.diferenca).toFixed(3)} pontos no seu CR geral.
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary dark:text-blue-400">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground dark:text-slate-500">Carga Horária</p>
                      <p className="text-sm font-bold text-foreground">+{impacto.ch.diferenca}h concluídas</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground dark:text-slate-500">Previsão</p>
                      <p className="text-sm font-bold text-foreground">{metricasSimuladas.previsao.texto}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumo de Requisitos */}
            <Card className="rounded-2xl border-none shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Book className="h-5 w-5 text-primary" />
                  Progresso do Curso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-muted-foreground dark:text-slate-400 uppercase">Status Geral</span>
                    <span className="text-primary">{((metricasSimuladas.ch / (cursoConfig?.totalHoras || 2400)) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: `${(metricasSimuladas.ch / (cursoConfig?.totalHoras || 2400)) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground dark:text-slate-500 text-center italic">
                  Faltam {metricasSimuladas.faltantes}h para a formatura com este plano.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
