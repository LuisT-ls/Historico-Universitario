'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CURSOS, NATUREZA_LABELS } from '@/lib/constants'
import {
  calcularMediaGeral,
  calcularCR,
  calcularCreditos,
  calcularPCH,
  calcularPCR,
  getStatusCR,
  calcularTendenciaNotas,
  calcularPrevisaoFormaturaCompleta,
  calcularSemestralizacao,
  cn,
} from '@/lib/utils'
import {
  Calculator,
  Clock,
  Book,
  TrendingUp,
  Star,
  CheckCircle,
  XCircle,
  GraduationCap,
  Lightbulb,
  BarChart3,
  PieChart as PieChartIcon,
  Loader2,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import type { Disciplina, Curso, Natureza, Certificado, Profile } from '@/types'

// Importação dinâmica dos gráficos para reduzir o bundle inicial
const PieChartSummary = dynamic(() => import('./charts/pie-chart-summary'), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

const BarChartSummary = dynamic(() => import('./charts/bar-chart-summary'), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

interface SummaryProps {
  disciplinas: Disciplina[]
  certificados?: Certificado[]
  cursoAtual: Curso
  profile?: Profile
}

export function Summary({ disciplinas, certificados = [], cursoAtual, profile }: SummaryProps) {
  const cursoConfig = CURSOS[cursoAtual]

  const estatisticas = useMemo(() => {
    // Filtrar disciplinas válidas para cálculos
    const disciplinasValidas = disciplinas.filter(
      (d) =>
        (d.resultado === 'AP' || d.resultado === 'RR') &&
        !d.dispensada &&
        d.natureza !== 'AC'
    )

    // Disciplinas aprovadas (não inclui AC, pois AC não tem resultado)
    const disciplinasAprovadas = disciplinas.filter((d) => d.resultado === 'AP')

    // Disciplinas AC (para contabilizar horas, mas não como aprovadas)
    const disciplinasAC = disciplinas.filter((d) => d.natureza === 'AC')

    // Disciplinas com nota válida
    const disciplinasComNota = disciplinas.filter(
      (d) =>
        d.nota !== null &&
        d.nota !== undefined &&
        !d.dispensada &&
        d.natureza !== 'AC' &&
        d.resultado !== 'TR' &&
        !d.emcurso &&
        d.resultado !== 'DP'
    )

    // Disciplinas em curso
    const disciplinasEmCurso = disciplinas.filter(
      (d) => (d.resultado === 'DP' || d.emcurso === true) && !d.dispensada && d.natureza !== 'AC'
    )

    const totalDisciplinasCadastradas = disciplinas.length
    const totalDisciplinas = disciplinas.filter((d) => !d.dispensada && d.natureza !== 'AC').length
    const totalAprovacoes = disciplinasAprovadas.filter(
      (d) => !d.dispensada && d.natureza !== 'AC'
    ).length
    const totalReprovacoes = disciplinas.filter(
      (d) => d.resultado === 'RR' && d.natureza !== 'AC'
    ).length
    const totalTrancamentos = disciplinas.filter((d) => d.resultado === 'TR').length
    const totalDispensadas = disciplinas.filter((d) => d.dispensada).length

    // Horas de certificados aprovados
    const totalHorasCertificados = certificados
      .filter((c) => c.status === 'aprovado')
      .reduce((sum, c) => sum + c.cargaHoraria, 0)

    const chEmCurso = disciplinasEmCurso.reduce((sum, d) => sum + d.ch, 0)

    // Horas por natureza - cálculo correto considerando LV
    const horasPorNatureza: Record<Natureza, number> = {
      AC: 0,
      LV: 0,
      OB: 0,
      OG: 0,
      OH: 0,
      OP: 0,
      OX: 0,
      OZ: 0,
    }

    // Primeiro, calcular horas por natureza considerando disciplinas dispensadas como LV
    disciplinasAprovadas.forEach((d) => {
      // Disciplinas dispensadas contam como LV
      const natureza = d.dispensada ? 'LV' : d.natureza
      if (natureza && horasPorNatureza[natureza as Natureza] !== undefined) {
        horasPorNatureza[natureza as Natureza] += d.ch
      }
    })

    // Adicionar horas de AC (AC não tem resultado, apenas horas)
    disciplinasAC.forEach((d) => {
      if (horasPorNatureza.AC !== undefined) {
        horasPorNatureza.AC += d.ch
      }
    })

    // Adicionar horas dos certificados aprovados
    horasPorNatureza.AC += totalHorasCertificados

    // Redistribuir excesso de horas optativas para LV e limitar ao requisito
    const naturezasParaLimitar = ['AC', 'OX', 'OG', 'OH', 'OZ', 'OB', 'OP']
    let totalExcessoLV = 0

    naturezasParaLimitar.forEach((nat) => {
      const natureza = nat as Natureza
      const requisito = cursoConfig.requisitos[natureza]

      if (horasPorNatureza[natureza] && requisito && requisito > 0) {
        if (horasPorNatureza[natureza] > requisito) {
          const excesso = horasPorNatureza[natureza] - requisito

          // Apenas naturezas optativas específicas redistribuem excesso para LV
          const naturezasRedistribuemParaLV = ['OX', 'OG', 'OH', 'OZ']
          if (naturezasRedistribuemParaLV.includes(natureza)) {
            totalExcessoLV += excesso
          }

          horasPorNatureza[natureza] = requisito // Limitar ao requisito para o cálculo do total
        }
      }
    })

    // Adicionar excesso de optativas ao LV e limitar LV também
    horasPorNatureza.LV += totalExcessoLV
    if (cursoConfig.requisitos.LV && horasPorNatureza.LV > cursoConfig.requisitos.LV) {
      horasPorNatureza.LV = cursoConfig.requisitos.LV
    }

    // Total CH recalculado com as horas limitadas
    const totalCHLimitado = Object.values(horasPorNatureza).reduce((sum, h) => sum + h, 0)

    // Para o progresso e métricas, usamos o total limitado
    const totalCHParaProgresso = totalCHLimitado
    const totalCHComEmCursoParaProgresso = totalCHParaProgresso + chEmCurso

    const mediaGeral =
      disciplinasComNota.length > 0
        ? disciplinasComNota.reduce((sum, d) => sum + d.nota, 0) / disciplinasComNota.length
        : 0

    const cr = calcularCR(disciplinas)
    const creditos = calcularCreditos(disciplinas)
    const pch = calcularPCH(disciplinas)
    const pcr = calcularPCR(disciplinas)

    const percentualAprovacao =
      totalDisciplinas > 0 ? (totalAprovacoes / totalDisciplinas) * 100 : 0

    const progressoFormatura =
      totalCHComEmCursoParaProgresso > 0
        ? Math.min((totalCHComEmCursoParaProgresso / cursoConfig.totalHoras) * 100, 100)
        : 0

    const statusCR = getStatusCR(cr)
    const tendenciaNotas = calcularTendenciaNotas(disciplinas)

    // Calcular previsão de formatura
    const previsaoFormatura = calcularPrevisaoFormaturaCompleta(
      disciplinas,
      totalCHParaProgresso,
      totalCHComEmCursoParaProgresso,
      chEmCurso,
      cursoConfig.totalHoras,
      disciplinasEmCurso
    )

    // Dados para gráfico de pizza
    const dadosGraficoPizza = Object.entries(horasPorNatureza)
      .filter(([_, horas]) => horas > 0)
      .map(([natureza, horas]) => ({
        name: natureza, // Apenas a sigla para o gráfico
        nameFull: NATUREZA_LABELS[natureza] || natureza, // Nome completo para tooltip
        value: horas,
        natureza,
      }))

    // Dados para gráfico de barras por período (excluindo AC)
    const periodos: Record<string, { total: number; aprovadas: number }> = {}
    disciplinas
      .filter((d) => !d.dispensada && d.natureza !== 'AC')
      .forEach((d) => {
        if (!periodos[d.periodo]) {
          periodos[d.periodo] = { total: 0, aprovadas: 0 }
        }
        periodos[d.periodo].total++
        if (d.resultado === 'AP') periodos[d.periodo].aprovadas++
      })

    const dadosGraficoBarras = Object.entries(periodos)
      .sort(([a], [b]) => {
        const [anoA, semA] = a.split('.').map(Number)
        const [anoB, semB] = b.split('.').map(Number)
        if (anoA !== anoB) return anoA - anoB
        return semA - semB
      })
      .map(([periodo, dados]) => ({
        periodo,
        aprovadas: dados.aprovadas,
        total: dados.total,
      }))

    const coresGrafico = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#84cc16', // lime
    ]

    const semestralization = profile ? calcularSemestralizacao(profile, disciplinas, profile.currentSemester || '2025.2') : undefined

    return {
      totalDisciplinasCadastradas,
      totalDisciplinas,
      totalAprovacoes,
      totalReprovacoes,
      totalTrancamentos,
      totalDispensadas,
      mediaGeral,
      cr,
      creditos,
      pch,
      pcr,
      totalCH: totalCHParaProgresso,
      totalCHComEmCurso: totalCHComEmCursoParaProgresso,
      chEmCurso,
      percentualAprovacao,
      progressoFormatura,
      statusCR,
      tendenciaNotas,
      previsaoFormatura,
      horasPorNatureza,
      dadosGraficoPizza,
      dadosGraficoBarras,
      coresGrafico,
      semestralization,
    }
  }, [disciplinas, certificados, cursoConfig.totalHoras, cursoAtual, profile])

  const requisitos = cursoConfig.requisitos

  return (
    <div className="space-y-6">
      {/* Métricas Gerais - Cards Horizontais Compactos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3">
        <Card className="rounded-xl shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <Book className="h-4 w-4 text-primary mb-1" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Disciplinas</p>
            <p className="text-lg font-bold">{estatisticas.totalDisciplinasCadastradas}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <GraduationCap className="h-4 w-4 text-primary mb-1" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Semestre</p>
            <p className="text-lg font-bold">{estatisticas.semestralization || '-'}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <Calculator className="h-4 w-4 text-primary mb-1" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Média</p>
            <p className="text-lg font-bold">{estatisticas.mediaGeral.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <TrendingUp className="h-4 w-4 text-primary mb-1" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">CR</p>
            <p className="text-lg font-bold">{estatisticas.cr.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <Clock className="h-4 w-4 text-primary mb-1" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Horas</p>
            <p className="text-lg font-bold">{estatisticas.totalCHComEmCurso}h</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <Star className="h-4 w-4 text-primary mb-1" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Créditos</p>
            <p className="text-lg font-bold">{estatisticas.creditos.toFixed(1)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <BarChart3 className="h-4 w-4 text-primary mb-1" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">PCH</p>
            <p className="text-lg font-bold">{estatisticas.pch.toFixed(1)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-4 w-4 text-green-500 mb-1" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Aprov.</p>
            <p className="text-lg font-bold">{estatisticas.totalAprovacoes}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <XCircle className="h-4 w-4 text-red-500 mb-1" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Reprov.</p>
            <p className="text-lg font-bold">{estatisticas.totalReprovacoes}</p>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores de Progresso */}
      <Card className="rounded-2xl shadow-sm border-none bg-card">
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2 text-xl font-bold">
            <GraduationCap className="h-5 w-5 text-primary" />
            Progresso para Formatura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Status Geral</span>
                <p className="text-2xl font-black">{estatisticas.progressoFormatura.toFixed(1)}%</p>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {estatisticas.totalCHComEmCurso}h de {cursoConfig.totalHoras}h
              </span>
            </div>
            <div className="w-full bg-secondary/50 rounded-full h-4 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${estatisticas.progressoFormatura}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Previsão de Formatura */}
            <div className={cn(
              "p-4 rounded-2xl border transition-all",
              estatisticas.previsaoFormatura.podeFormarEsteSemestre
                ? 'bg-green-500/10 border-green-500/20 dark:bg-green-500/5'
                : estatisticas.previsaoFormatura.semestresRestantes <= 2
                  ? 'bg-blue-500/10 border-blue-500/20 dark:bg-blue-500/5'
                  : 'bg-muted/50 border-transparent'
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-xl",
                  estatisticas.previsaoFormatura.podeFormarEsteSemestre ? "bg-green-500/20 text-green-600 dark:text-green-400" :
                    estatisticas.previsaoFormatura.semestresRestantes <= 2 ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-primary/10 text-primary"
                )}>
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Previsão</h3>
                  <p className="text-sm font-semibold leading-snug">{estatisticas.previsaoFormatura.texto}</p>
                </div>
              </div>
            </div>

            {/* Status CR */}
            <div className={cn(
              "p-4 rounded-2xl border transition-all",
              estatisticas.statusCR.class === 'excellent' ? 'bg-green-500/10 border-green-500/20 dark:bg-green-500/5' :
                estatisticas.statusCR.class === 'good' ? 'bg-blue-500/10 border-blue-500/20 dark:bg-blue-500/5' :
                  estatisticas.statusCR.class === 'regular' ? 'bg-yellow-500/10 border-yellow-500/20 dark:bg-yellow-500/5' :
                    'bg-red-500/10 border-red-500/20 dark:bg-red-500/5'
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-xl",
                  estatisticas.statusCR.class === 'excellent' ? "bg-green-500/20 text-green-600 dark:text-green-400" :
                    estatisticas.statusCR.class === 'good' ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" :
                      estatisticas.statusCR.class === 'regular' ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" :
                        "bg-red-500/20 text-red-600 dark:text-red-400"
                )}>
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Status Acadêmico</h3>
                  <p className="text-sm font-semibold leading-snug">{estatisticas.statusCR.text}</p>
                  <p className="text-lg font-black mt-1">CR {estatisticas.cr.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Insights</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{estatisticas.tendenciaNotas.text}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos em Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {estatisticas.dadosGraficoPizza.length > 0 && (
          <Card className="rounded-2xl shadow-sm border-none bg-card">
            <CardHeader>
              <CardTitle as="h2" className="flex items-center gap-2 text-lg font-bold">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Horas por Natureza
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PieChartSummary
                data={estatisticas.dadosGraficoPizza}
                colors={estatisticas.coresGrafico}
              />
            </CardContent>
          </Card>
        )}

        {estatisticas.dadosGraficoBarras.length > 0 && (
          <Card className="rounded-2xl shadow-sm border-none bg-card">
            <CardHeader>
              <CardTitle as="h2" className="flex items-center gap-2 text-lg font-bold">
                <BarChart3 className="h-5 w-5 text-primary" />
                Evolução por Semestre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChartSummary data={estatisticas.dadosGraficoBarras} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Requisitos para Formatura */}
      <Card className="rounded-2xl shadow-sm border-none bg-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle as="h2" className="flex items-center gap-2 text-xl font-bold">
            <GraduationCap className="h-5 w-5 text-primary" />
            Detalhamento de Requisitos
          </CardTitle>
        </CardHeader>
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
                {Object.entries(requisitos).map(([natureza, meta]) => {
                  const cursado = estatisticas.horasPorNatureza[natureza as Natureza] || 0
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
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                progresso >= 100 ? "bg-green-500" : "bg-primary"
                              )}
                              style={{ width: `${progresso}%` }}
                            />
                          </div>
                          <span className={cn(
                            "text-[10px] font-bold w-8",
                            progresso >= 100 ? "text-green-500" : "text-muted-foreground"
                          )}>
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
    </div>
  )
}
