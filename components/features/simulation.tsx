'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CURSOS, NATUREZA_LABELS } from '@/lib/constants'
import { getPeriodoMaisRecente, sanitizeInput, calcularCR, calcularCreditos, calcularPCH, calcularPCR, calcularPrevisaoFormaturaCompleta } from '@/lib/utils'
import { PlusCircle, X, TrendingUp, TrendingDown, Calculator, Trash2, Search, GraduationCap } from 'lucide-react'
import type { Curso, Disciplina, Natureza } from '@/types'

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
      // AC não precisa de nota
      if (data.natureza === 'AC') return true
      // Outras naturezas precisam de nota
      return data.nota !== undefined && data.nota !== null
    },
    {
      message: 'Nota é obrigatória para esta natureza',
      path: ['nota'],
    }
  )

type SimulationFormData = z.infer<typeof simulationSchema>

interface SimulationProps {
  disciplinas: Disciplina[]
  cursoAtual: Curso
}

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

export function Simulation({ disciplinas, cursoAtual }: SimulationProps) {
  const [disciplinasSimuladas, setDisciplinasSimuladas] = useState<Disciplina[]>([])
  const [isOpen, setIsOpen] = useState(false)
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
      periodo: getPeriodoMaisRecente(disciplinas) || '',
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
  const naturezasDisponiveis = Object.keys(CURSOS[cursoAtual].requisitos) as Natureza[]

  // Carregar dados das disciplinas
  useEffect(() => {
    const loadDisciplinas = async () => {
      try {
        const response = await fetch('/assets/data/disciplinas.json')
        const data = await response.json()
        setDisciplinasData(data)
      } catch (error) {
        console.error('Erro ao carregar disciplinas:', error)
      }
    }

    loadDisciplinas()
  }, [])

  // Fechar resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar disciplinas conforme o usuário digita
  useEffect(() => {
    if (!disciplinasData || Object.keys(disciplinasData).length === 0) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    if (!nome || nome.trim().length < 2) {
      setSearchResults([])
      setShowResults(false)
      setSelectedIndex(-1)
      return
    }

    const disciplinasDoCurso = disciplinasData[cursoAtual] || []
    if (disciplinasDoCurso.length === 0) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const term = nome.toLowerCase().trim()
    const matches = disciplinasDoCurso
      .filter(
        (disciplina) =>
          disciplina.nome.toLowerCase().includes(term) ||
          disciplina.codigo.toLowerCase().includes(term)
      )
      .slice(0, 8) // Limita a 8 resultados

    setSearchResults(matches)
    setShowResults(matches.length > 0)
    setSelectedIndex(-1)
  }, [nome, cursoAtual, disciplinasData])

  // Preencher campos quando uma disciplina é selecionada
  const handleSelectDisciplina = (disciplina: DisciplinaData) => {
    setValue('codigo', disciplina.codigo)
    setValue('nome', disciplina.nome)
    setValue('natureza', disciplina.natureza)
    if (disciplina.ch) {
      setValue('ch', disciplina.ch)
    }
    setShowResults(false)
    setSearchResults([])
    // Focar no campo de nota após preencher
    setTimeout(() => {
      const notaInput = document.getElementById('sim-nota')
      if (notaInput) {
        notaInput.focus()
      }
    }, 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || searchResults.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelectDisciplina(searchResults[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

  const highlightMatch = (text: string, term: string) => {
    if (!term) return text
    const regex = new RegExp(`(${term})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const cursoConfig = CURSOS[cursoAtual]

  // Calcular métricas atuais (sem simulação)
  const metricasAtuais = useMemo(() => {
    const disciplinasAprovadas = disciplinas.filter((d) => d.resultado === 'AP')
    const disciplinasAC = disciplinas.filter((d) => d.natureza === 'AC')
    const disciplinasEmCurso = disciplinas.filter(
      (d) => (d.resultado === 'DP' || d.emcurso === true) && !d.dispensada && d.natureza !== 'AC'
    )
    const totalCH = disciplinasAprovadas.reduce((sum, d) => sum + d.ch, 0) + 
                    disciplinasAC.reduce((sum, d) => sum + d.ch, 0)
    const chEmCurso = disciplinasEmCurso.reduce((sum, d) => sum + d.ch, 0)
    const totalCHComEmCurso = totalCH + chEmCurso

    const previsaoFormatura = calcularPrevisaoFormaturaCompleta(
      disciplinas,
      totalCH,
      totalCHComEmCurso,
      chEmCurso,
      cursoConfig.totalHoras,
      disciplinasEmCurso
    )

    return {
      cr: calcularCR(disciplinas),
      ch: totalCH,
      creditos: calcularCreditos(disciplinas),
      pch: calcularPCH(disciplinas),
      pcr: calcularPCR(disciplinas),
      previsaoFormatura,
      horasFaltantes: Math.max(0, cursoConfig.totalHoras - totalCHComEmCurso),
    }
  }, [disciplinas, cursoConfig])

  // Calcular métricas simuladas (com disciplinas simuladas)
  const metricasSimuladas = useMemo(() => {
    const todasDisciplinas = [...disciplinas, ...disciplinasSimuladas]
    const disciplinasAprovadas = todasDisciplinas.filter((d) => d.resultado === 'AP')
    const disciplinasAC = todasDisciplinas.filter((d) => d.natureza === 'AC')
    const disciplinasEmCurso = todasDisciplinas.filter(
      (d) => (d.resultado === 'DP' || d.emcurso === true) && !d.dispensada && d.natureza !== 'AC'
    )
    const totalCH = disciplinasAprovadas.reduce((sum, d) => sum + d.ch, 0) + 
                    disciplinasAC.reduce((sum, d) => sum + d.ch, 0)
    const chEmCurso = disciplinasEmCurso.reduce((sum, d) => sum + d.ch, 0)
    const totalCHComEmCurso = totalCH + chEmCurso

    const previsaoFormatura = calcularPrevisaoFormaturaCompleta(
      todasDisciplinas,
      totalCH,
      totalCHComEmCurso,
      chEmCurso,
      cursoConfig.totalHoras,
      disciplinasEmCurso
    )

    return {
      cr: calcularCR(todasDisciplinas),
      ch: totalCH,
      creditos: calcularCreditos(todasDisciplinas),
      pch: calcularPCH(todasDisciplinas),
      pcr: calcularPCR(todasDisciplinas),
      previsaoFormatura,
      horasFaltantes: Math.max(0, cursoConfig.totalHoras - totalCHComEmCurso),
    }
  }, [disciplinas, disciplinasSimuladas, cursoConfig])

  // Calcular impacto
  const impacto = useMemo<ImpactMetrics>(() => {
    return {
      cr: {
        atual: metricasAtuais.cr,
        simulado: metricasSimuladas.cr,
        diferenca: metricasSimuladas.cr - metricasAtuais.cr,
      },
      ch: {
        atual: metricasAtuais.ch,
        simulado: metricasSimuladas.ch,
        diferenca: metricasSimuladas.ch - metricasAtuais.ch,
      },
      creditos: {
        atual: metricasAtuais.creditos,
        simulado: metricasSimuladas.creditos,
        diferenca: metricasSimuladas.creditos - metricasAtuais.creditos,
      },
      pch: {
        atual: metricasAtuais.pch,
        simulado: metricasSimuladas.pch,
        diferenca: metricasSimuladas.pch - metricasAtuais.pch,
      },
      pcr: {
        atual: metricasAtuais.pcr,
        simulado: metricasSimuladas.pcr,
        diferenca: metricasSimuladas.pcr - metricasAtuais.pcr,
      },
      formatura: {
        atual: {
          horasFaltantes: metricasAtuais.horasFaltantes,
          semestresRestantes: metricasAtuais.previsaoFormatura.semestresRestantes,
          podeFormar: metricasAtuais.previsaoFormatura.podeFormarEsteSemestre,
        },
        simulado: {
          horasFaltantes: metricasSimuladas.horasFaltantes,
          semestresRestantes: metricasSimuladas.previsaoFormatura.semestresRestantes,
          podeFormar: metricasSimuladas.previsaoFormatura.podeFormarEsteSemestre,
        },
      },
    }
  }, [metricasAtuais, metricasSimuladas])

  const onSubmit = (data: SimulationFormData) => {
    const isAC = data.natureza === 'AC'

    // Todas as disciplinas simuladas são consideradas aprovadas (exceto AC que não tem resultado)
    const disciplinaSimulada: Disciplina = {
      periodo: sanitizeInput(data.periodo),
      codigo: sanitizeInput(data.codigo),
      nome: sanitizeInput(data.nome),
      natureza: data.natureza as Natureza,
      ch: data.ch,
      nota: isAC ? 0 : (data.nota || 0),
      trancamento: false,
      dispensada: false,
      emcurso: false,
      // Sempre aprovada (exceto AC que não tem resultado)
      resultado: isAC ? undefined : 'AP',
      curso: cursoAtual,
    }

    setDisciplinasSimuladas([...disciplinasSimuladas, disciplinaSimulada])

    // Manter o semestre digitado pelo usuário para facilitar adicionar mais disciplinas
    reset({
      periodo: data.periodo, // Manter o semestre que o usuário digitou
      codigo: '',
      nome: '',
      natureza: '',
      ch: '' as any,
      nota: '' as any,
    })
  }

  const handleRemoveSimulada = (index: number) => {
    setDisciplinasSimuladas(disciplinasSimuladas.filter((_, i) => i !== index))
  }

  const handleClearAll = () => {
    setDisciplinasSimuladas([])
  }

  const formatarNumero = (num: number, casasDecimais: number = 2): string => {
    return num.toFixed(casasDecimais)
  }

  const formatarDiferenca = (diferenca: number, casasDecimais: number = 2): string => {
    const sinal = diferenca >= 0 ? '+' : ''
    return `${sinal}${diferenca.toFixed(casasDecimais)}`
  }

  return (
    <Card className="simulation-container mt-8">
      <CardHeader className="simulation-header border-b pb-4">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <CardTitle as="h2" className="text-2xl font-bold flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              Simulador "E Se?"
            </CardTitle>
            <CardDescription className="mt-2">
              Simule como será sua vida acadêmica após cursar as disciplinas desejadas no próximo semestre. 
              Todas as disciplinas simuladas são consideradas aprovadas para planejar sua trajetória até a formatura.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="btn-simulation flex-shrink-0"
          >
            {isOpen ? 'Ocultar' : 'Abrir Simulador'}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-6 space-y-6">
          {/* Formulário de Simulação */}
          <div className="simulation-form-container border rounded-lg p-6 bg-muted/30">
            <h3 className="text-lg font-semibold mb-4">Adicionar Disciplina Simulada</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sim-periodo">Semestre *</Label>
                  <Input
                    id="sim-periodo"
                    {...register('periodo')}
                    placeholder="Ex: 2026.2"
                    className={errors.periodo ? 'border-red-500' : ''}
                  />
                  {errors.periodo && (
                    <p className="text-sm text-red-500 mt-1">{errors.periodo.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="sim-codigo">Código *</Label>
                  <Input
                    id="sim-codigo"
                    {...register('codigo')}
                    placeholder="Ex: CTIA01"
                    className={errors.codigo ? 'border-red-500' : ''}
                  />
                  {errors.codigo && (
                    <p className="text-sm text-red-500 mt-1">{errors.codigo.message}</p>
                  )}
                </div>
              </div>

              <div ref={searchRef} className="relative">
                <Label htmlFor="sim-nome">Nome da Disciplina *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="sim-nome"
                    {...register('nome')}
                    placeholder="Digite o nome ou código da disciplina..."
                    className={`pl-10 pr-10 ${errors.nome ? 'border-red-500' : ''}`}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (searchResults.length > 0) {
                        setShowResults(true)
                      }
                    }}
                  />
                  {nome && (
                    <button
                      type="button"
                      onClick={() => {
                        setValue('nome', '')
                        setSearchResults([])
                        setShowResults(false)
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Limpar busca"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {errors.nome && (
                  <p className="text-sm text-red-500 mt-1">{errors.nome.message}</p>
                )}

                {/* Dropdown de resultados */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                    {searchResults.map((disciplina, index) => (
                      <button
                        key={`${disciplina.codigo}-${index}`}
                        type="button"
                        onClick={() => handleSelectDisciplina(disciplina)}
                        className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors ${
                          index === selectedIndex ? 'bg-accent' : ''
                        } ${index !== searchResults.length - 1 ? 'border-b' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-sm font-semibold text-primary">
                              {highlightMatch(disciplina.codigo, nome)}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {highlightMatch(disciplina.nome, nome)}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                            {disciplina.natureza}
                            {disciplina.ch && ` • ${disciplina.ch}h`}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showResults && nome && nome.length >= 2 && searchResults.length === 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-background border rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground">
                    <Search className="h-5 w-5 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma disciplina encontrada para &quot;{nome}&quot;</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sim-natureza">Natureza *</Label>
                  <select
                    id="sim-natureza"
                    {...register('natureza')}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.natureza ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Selecione...</option>
                    {naturezasDisponiveis.map((nat) => (
                      <option key={nat} value={nat}>
                        {NATUREZA_LABELS[nat]}
                      </option>
                    ))}
                  </select>
                  {errors.natureza && (
                    <p className="text-sm text-red-500 mt-1">{errors.natureza.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="sim-ch">Carga Horária *</Label>
                  <Input
                    id="sim-ch"
                    type="number"
                    {...register('ch', { valueAsNumber: true })}
                    placeholder="Ex: 60"
                    min="1"
                    className={errors.ch ? 'border-red-500' : ''}
                  />
                  {errors.ch && (
                    <p className="text-sm text-red-500 mt-1">{errors.ch.message}</p>
                  )}
                </div>
              </div>

              {!isAC && (
                <div>
                  <Label htmlFor="sim-nota">Nota Esperada (0-10) *</Label>
                  <Input
                    id="sim-nota"
                    type="number"
                    step="0.1"
                    {...register('nota', { valueAsNumber: true })}
                    placeholder="Ex: 8.5"
                    min="0"
                    max="10"
                    className={errors.nota ? 'border-red-500' : ''}
                  />
                  {errors.nota && (
                    <p className="text-sm text-red-500 mt-1">{errors.nota.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Nota que você espera obter nesta disciplina
                  </p>
                </div>
              )}

              <Button type="submit" variant="default" className="w-full btn-simulation bg-primary text-primary-foreground hover:bg-primary/90">
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar à Simulação
              </Button>
            </form>
          </div>

          {/* Cards de Impacto */}
          {disciplinasSimuladas.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Impacto da Simulação</h3>
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Todas
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* CR */}
                <Card className="impact-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Coeficiente de Rendimento (CR)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="impact-value">
                      <span className="label text-sm text-muted-foreground">Atual: </span>
                      <span className="value font-semibold">{formatarNumero(impacto.cr.atual)}</span>
                    </div>
                    <div className="impact-value">
                      <span className="label text-sm text-muted-foreground">Simulado: </span>
                      <span
                        className={`value font-semibold ${
                          impacto.cr.diferenca >= 0 ? 'positive text-green-600' : 'negative text-red-600'
                        }`}
                      >
                        {formatarNumero(impacto.cr.simulado)}
                      </span>
                    </div>
                    <div className="impact-value border-t pt-2">
                      <span className="label text-sm text-muted-foreground">Diferença: </span>
                      <span
                        className={`value font-bold ${
                          impacto.cr.diferenca >= 0 ? 'positive text-green-600' : 'negative text-red-600'
                        }`}
                      >
                        {impacto.cr.diferenca >= 0 ? (
                          <TrendingUp className="h-4 w-4 inline mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 inline mr-1" />
                        )}
                        {formatarDiferenca(impacto.cr.diferenca)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* CH */}
                <Card className="impact-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Carga Horária (CH)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="impact-value">
                      <span className="label text-sm text-muted-foreground">Atual: </span>
                      <span className="value font-semibold">{impacto.ch.atual}h</span>
                    </div>
                    <div className="impact-value">
                      <span className="label text-sm text-muted-foreground">Simulado: </span>
                      <span className="value font-semibold positive text-green-600">
                        {impacto.ch.simulado}h
                      </span>
                    </div>
                    <div className="impact-value border-t pt-2">
                      <span className="label text-sm text-muted-foreground">Diferença: </span>
                      <span className="value font-bold positive text-green-600">
                        <TrendingUp className="h-4 w-4 inline mr-1" />
                        +{impacto.ch.diferenca}h
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Formatura */}
                <Card className="impact-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Formatura
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="impact-value">
                      <span className="label text-sm text-muted-foreground">Horas faltantes (Atual): </span>
                      <span className="value font-semibold">
                        {impacto.formatura.atual.horasFaltantes}h
                      </span>
                    </div>
                    <div className="impact-value">
                      <span className="label text-sm text-muted-foreground">Horas faltantes (Simulado): </span>
                      <span
                        className={`value font-semibold ${
                          impacto.formatura.simulado.horasFaltantes < impacto.formatura.atual.horasFaltantes
                            ? 'positive text-green-600'
                            : ''
                        }`}
                      >
                        {impacto.formatura.simulado.horasFaltantes}h
                      </span>
                    </div>
                    <div className="impact-value border-t pt-2">
                      <span className="label text-sm text-muted-foreground">Semestres restantes: </span>
                      <span className="value font-bold">
                        {impacto.formatura.simulado.semestresRestantes === 0 ? (
                          <span className="text-green-600">
                            <TrendingUp className="h-4 w-4 inline mr-1" />
                            Pode formar!
                          </span>
                        ) : (
                          <span>
                            {impacto.formatura.simulado.semestresRestantes} semestre(s)
                          </span>
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Tabela de Disciplinas Simuladas */}
          {disciplinasSimuladas.length > 0 && (
            <div className="simulation-table-container border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted/50 border-b">
                <h3 className="text-lg font-semibold">
                  Disciplinas Simuladas ({disciplinasSimuladas.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Semestre</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Código</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Natureza</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">CH</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Nota</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Resultado</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disciplinasSimuladas.map((disc, index) => (
                      <tr
                        key={index}
                        className={`${
                          disc.resultado === 'AP'
                            ? 'simulada-aprovada'
                            : disc.resultado === 'RR'
                              ? 'simulada-reprovada'
                              : ''
                        } hover:bg-muted/20 transition-colors`}
                      >
                        <td className="px-4 py-3 text-sm">{disc.periodo}</td>
                        <td className="px-4 py-3 text-sm font-mono">{disc.codigo}</td>
                        <td className="px-4 py-3 text-sm">{disc.nome}</td>
                        <td className="px-4 py-3 text-sm">
                          {NATUREZA_LABELS[disc.natureza] || disc.natureza}
                        </td>
                        <td className="px-4 py-3 text-sm">{disc.ch}h</td>
                        <td className="px-4 py-3 text-sm">
                          {disc.natureza === 'AC' ? '-' : disc.nota.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {disc.resultado || '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSimulada(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {disciplinasSimuladas.length === 0 && (
            <div className="empty-message text-center py-8 text-muted-foreground border rounded-lg">
              <p>Nenhuma disciplina simulada ainda.</p>
              <p className="text-sm mt-2">
                Adicione as disciplinas que você planeja cursar no próximo semestre para ver como será sua vida acadêmica após concluí-las.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

