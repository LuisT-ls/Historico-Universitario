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
import type { Disciplina, Curso, Natureza, Certificado } from '@/types'

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
}

export function Summary({ disciplinas, certificados = [], cursoAtual }: SummaryProps) {
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
        d.resultado !== 'TR'
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
    // Total CH: disciplinas aprovadas + AC + certificados aprovados
    const totalCH = disciplinasAprovadas.reduce((sum, d) => sum + d.ch, 0) + 
                    disciplinasAC.reduce((sum, d) => sum + d.ch, 0) +
                    totalHorasCertificados
    const totalCHComEmCurso = totalCH + chEmCurso

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
      totalCHComEmCurso > 0
        ? Math.min((totalCHComEmCurso / cursoConfig.totalHoras) * 100, 100)
        : 0

    const statusCR = getStatusCR(cr)
    const tendenciaNotas = calcularTendenciaNotas(disciplinas)
    
    // Calcular previsão de formatura
    const previsaoFormatura = calcularPrevisaoFormaturaCompleta(
      disciplinas,
      totalCH,
      totalCHComEmCurso,
      chEmCurso,
      cursoConfig.totalHoras,
      disciplinasEmCurso
    )

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

    // Redistribuir excesso de horas optativas para LV
    const naturezasParaLV = ['OX', 'OG', 'OH', 'OZ'] // Naturezas cujo excesso vai para LV
    let totalExcessoLV = 0

    naturezasParaLV.forEach((nat) => {
      const natureza = nat as Natureza
      const requisito = cursoConfig.requisitos[natureza]
      if (horasPorNatureza[natureza] && requisito) {
        if (horasPorNatureza[natureza] > requisito) {
          const excesso = horasPorNatureza[natureza] - requisito
          totalExcessoLV += excesso
          horasPorNatureza[natureza] = requisito // Limitar ao requisito
        }
      }
    })

    // OB pode ultrapassar o teto (até 680h para BICTI), mas o excesso não é redistribuído
    if (horasPorNatureza.OB && cursoConfig.requisitos.OB) {
      // Para BICTI, OB pode ir até 680h (requisito é 600h)
      const tetoOB = cursoAtual === 'BICTI' ? 680 : cursoConfig.requisitos.OB
      if (horasPorNatureza.OB > tetoOB) {
        horasPorNatureza.OB = tetoOB
      }
      // Não redistribuir excesso de OB para LV
    }

    // Adicionar excesso de optativas ao LV
    horasPorNatureza.LV += totalExcessoLV

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
      totalCH,
      totalCHComEmCurso,
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
    }
  }, [disciplinas, certificados, cursoConfig.totalHoras, cursoAtual])

  const requisitos = cursoConfig.requisitos

  return (
    <div className="space-y-6">
      {/* Indicadores de Progresso */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Progresso para Formatura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Progresso</span>
              <span className="text-sm font-semibold">{estatisticas.progressoFormatura.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${estatisticas.progressoFormatura}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>
                {estatisticas.totalCHComEmCurso}h de {cursoConfig.totalHoras}h
                {estatisticas.chEmCurso > 0 && ` (${estatisticas.chEmCurso}h em curso)`}
              </span>
              <span>{cursoConfig.totalHoras - estatisticas.totalCHComEmCurso}h restantes</span>
            </div>
          </div>

          {/* Previsão de Formatura */}
          <div className={`p-4 rounded-lg border ${
            estatisticas.previsaoFormatura.podeFormarEsteSemestre
              ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
              : estatisticas.previsaoFormatura.semestresRestantes <= 2
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800'
              : 'bg-muted/50 border-border'
          }`}>
            <div className="flex items-start gap-3">
              <Clock className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                estatisticas.previsaoFormatura.podeFormarEsteSemestre
                  ? 'text-green-700 dark:text-green-400'
                  : estatisticas.previsaoFormatura.semestresRestantes <= 2
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-primary'
              }`} />
              <div className="flex-1">
                <h3 className={`text-sm font-semibold mb-1 ${
                  estatisticas.previsaoFormatura.podeFormarEsteSemestre
                    ? 'text-green-900 dark:text-green-100'
                    : estatisticas.previsaoFormatura.semestresRestantes <= 2
                    ? 'text-blue-900 dark:text-blue-100'
                    : 'text-foreground'
                }`}>
                  Previsão de Formatura
                </h3>
                <p className={`text-sm ${
                  estatisticas.previsaoFormatura.podeFormarEsteSemestre
                    ? 'text-green-800 dark:text-green-200'
                    : estatisticas.previsaoFormatura.semestresRestantes <= 2
                    ? 'text-blue-800 dark:text-blue-200'
                    : 'text-foreground/90'
                }`}>
                  {estatisticas.previsaoFormatura.texto}
                </p>
                {estatisticas.previsaoFormatura.disciplinasNecessarias && (
                  <p className={`text-xs mt-2 italic ${
                    estatisticas.previsaoFormatura.podeFormarEsteSemestre
                      ? 'text-green-700/80 dark:text-green-300/80'
                      : 'text-muted-foreground'
                  }`}>
                    Baseado em 6 disciplinas por semestre
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            estatisticas.statusCR.class === 'excellent'
              ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
              : estatisticas.statusCR.class === 'good'
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800'
              : estatisticas.statusCR.class === 'regular'
              ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800'
              : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-3">
              <Star className={`h-5 w-5 mt-0.5 ${
                estatisticas.statusCR.class === 'excellent' ? 'text-green-700 dark:text-green-400' :
                estatisticas.statusCR.class === 'good' ? 'text-blue-700 dark:text-blue-400' :
                estatisticas.statusCR.class === 'regular' ? 'text-yellow-700 dark:text-yellow-400' :
                'text-red-700 dark:text-red-400'
              }`} />
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${
                  estatisticas.statusCR.class === 'excellent' ? 'text-green-900 dark:text-green-100' :
                  estatisticas.statusCR.class === 'good' ? 'text-blue-900 dark:text-blue-100' :
                  estatisticas.statusCR.class === 'regular' ? 'text-yellow-900 dark:text-yellow-100' :
                  'text-red-900 dark:text-red-100'
                }`}>
                  Status Acadêmico
                </h3>
                <p className={`text-sm mb-1 ${
                  estatisticas.statusCR.class === 'excellent' ? 'text-green-800 dark:text-green-200' :
                  estatisticas.statusCR.class === 'good' ? 'text-blue-800 dark:text-blue-200' :
                  estatisticas.statusCR.class === 'regular' ? 'text-yellow-800 dark:text-yellow-200' :
                  'text-red-800 dark:text-red-200'
                }`}>
                  {estatisticas.statusCR.text}
                </p>
                <p className={`text-lg font-bold ${
                  estatisticas.statusCR.class === 'excellent' ? 'text-green-900 dark:text-green-50' :
                  estatisticas.statusCR.class === 'good' ? 'text-blue-900 dark:text-blue-50' :
                  estatisticas.statusCR.class === 'regular' ? 'text-yellow-900 dark:text-yellow-50' :
                  'text-red-900 dark:text-red-50'
                }`}>
                  CR: {estatisticas.cr.toFixed(2)}
                </p>
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

      {/* Métricas Gerais */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Métricas Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Book className="h-4 w-4" />
                <span>Total Disciplinas</span>
              </div>
              <p className="text-2xl font-bold">{estatisticas.totalDisciplinasCadastradas}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calculator className="h-4 w-4" />
                <span>Média Geral</span>
              </div>
              <p className="text-2xl font-bold">{estatisticas.mediaGeral.toFixed(2)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>CR</span>
              </div>
              <p className="text-2xl font-bold">{estatisticas.cr.toFixed(2)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Total Horas</span>
              </div>
              <p className="text-2xl font-bold">{estatisticas.totalCHComEmCurso}h</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                <span>Créditos</span>
              </div>
              <p className="text-2xl font-bold">{estatisticas.creditos.toFixed(1)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>PCH</span>
              </div>
              <p className="text-2xl font-bold">{estatisticas.pch.toFixed(1)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Aprovações</span>
              </div>
              <p className="text-2xl font-bold">
                {estatisticas.totalAprovacoes}
                <span className="text-sm text-muted-foreground ml-1">
                  ({estatisticas.percentualAprovacao.toFixed(1)}%)
                </span>
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <XCircle className="h-4 w-4 text-red-600" />
                <span>Reprovações</span>
              </div>
              <p className="text-2xl font-bold">{estatisticas.totalReprovacoes}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horas por Natureza - Gráfico */}
      {estatisticas.dadosGraficoPizza.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Horas por Natureza
            </CardTitle>
            <CardDescription>Distribuição de horas cursadas por tipo de disciplina</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChartSummary 
              data={estatisticas.dadosGraficoPizza} 
              colors={estatisticas.coresGrafico} 
            />
          </CardContent>
        </Card>
      )}

      {/* Progresso por Semestre - Gráfico */}
      {estatisticas.dadosGraficoBarras.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Progresso por Semestre
            </CardTitle>
            <CardDescription>Disciplinas aprovadas e total por período</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartSummary data={estatisticas.dadosGraficoBarras} />
          </CardContent>
        </Card>
      )}

      {/* Requisitos para Formatura */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Requisitos para Formatura
          </CardTitle>
          <CardDescription>
            Acompanhe seu progresso em relação aos requisitos mínimos de carga horária
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Natureza</th>
                  <th className="text-right p-2 font-medium">Meta (h)</th>
                  <th className="text-right p-2 font-medium">Cursado (h)</th>
                  <th className="text-right p-2 font-medium">Falta (h)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(requisitos).map(([natureza, meta]) => {
                  const cursado = estatisticas.horasPorNatureza[natureza as Natureza] || 0
                  const falta = Math.max(0, meta - cursado)
                  const progresso = meta > 0 ? (cursado / meta) * 100 : 0

                  return (
                    <tr key={natureza} className="border-b">
                      <td className="p-2">{NATUREZA_LABELS[natureza] || natureza}</td>
                      <td className="p-2 text-right">{meta}</td>
                      <td className="p-2 text-right">
                        <span
                          className={
                            cursado >= meta
                              ? 'text-green-600 dark:text-green-400 font-semibold'
                              : ''
                          }
                        >
                          {cursado}
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        <span
                          className={
                            falta === 0
                              ? 'text-green-600 dark:text-green-400 font-semibold'
                              : ''
                          }
                        >
                          {falta}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                <tr className="border-t-2 font-bold">
                  <td className="p-2">TOTAL</td>
                  <td className="p-2 text-right">{cursoConfig.totalHoras}</td>
                  <td className="p-2 text-right">{estatisticas.totalCH}</td>
                  <td className="p-2 text-right">
                    {Math.max(0, cursoConfig.totalHoras - estatisticas.totalCH)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
