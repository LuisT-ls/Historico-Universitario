'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Edit } from 'lucide-react'
import type { Disciplina, Curso } from '@/types'
import { calcularResultado, compararPeriodos } from '@/lib/utils'
import { NATUREZA_LABELS } from '@/lib/constants'

interface AcademicHistoryProps {
  disciplinas: Disciplina[]
  cursoAtual: Curso
  onRemove: (index: number) => void
  onEdit?: (disciplina: Disciplina, index: number) => void
}

export function AcademicHistory({
  disciplinas,
  cursoAtual,
  onRemove,
  onEdit,
}: AcademicHistoryProps) {
  // Agrupar disciplinas por período
  const disciplinasPorPeriodo = useMemo(() => {
    const grupos: Record<string, Disciplina[]> = {}

    disciplinas.forEach((disc) => {
      const periodo = disc.periodo || 'Sem período'
      if (!grupos[periodo]) {
        grupos[periodo] = []
      }
      grupos[periodo].push(disc)
    })

    // Ordenar períodos (mais recente primeiro)
    const periodosOrdenados = Object.keys(grupos).sort(compararPeriodos)

    // Ordenar disciplinas dentro de cada período
    periodosOrdenados.forEach((periodo) => {
      grupos[periodo].sort((a, b) => {
        // Primeiro por código
        if (a.codigo < b.codigo) return -1
        if (a.codigo > b.codigo) return 1
        // Depois por status (AP primeiro, depois TR, depois RR)
        const statusOrder: Record<string, number> = { AP: 0, TR: 1, RR: 2, DP: 3 }
        const orderA = statusOrder[a.resultado || ''] ?? 4
        const orderB = statusOrder[b.resultado || ''] ?? 4
        return orderA - orderB
      })
    })

    return { grupos, periodosOrdenados }
  }, [disciplinas])

  const getResultadoLabel = (resultado?: string, short: boolean = false) => {
    if (short) {
      // Retornar apenas a sigla
      return resultado || '-'
    }
    switch (resultado) {
      case 'AP':
        return 'Aprovado'
      case 'RR':
        return 'Reprovado'
      case 'TR':
        return 'Trancado'
      case 'DP':
        return 'Em Curso'
      default:
        return '-'
    }
  }

  const getResultadoColor = (resultado?: string) => {
    switch (resultado) {
      case 'AP':
        return 'text-green-600 dark:text-green-400'
      case 'RR':
        return 'text-red-600 dark:text-red-400'
      case 'TR':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'DP':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle as="h2" className="flex items-center gap-2">
              <span>📋</span> Disciplinas Cursadas
            </CardTitle>
            <CardDescription>
              {disciplinas.length} disciplina{disciplinas.length !== 1 ? 's' : ''} registrada
              {disciplinas.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {disciplinas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma disciplina cadastrada ainda.</p>
            <p className="text-sm mt-2">Adicione disciplinas usando o formulário acima.</p>
          </div>
        ) : (
          <>
            {/* Mobile View - Cards */}
            <div className="block md:hidden space-y-4">
              {disciplinasPorPeriodo.periodosOrdenados.map((periodo) => {
                const disciplinasDoPeriodo = disciplinasPorPeriodo.grupos[periodo]

                return (
                  <div key={periodo} className="space-y-3">
                    {/* Cabeçalho do período */}
                    <div className="bg-muted/50 px-3 py-2 rounded-md">
                      <h3 className="text-sm font-semibold">Período {periodo}</h3>
                    </div>

                    {/* Cards das disciplinas */}
                    {disciplinasDoPeriodo.map((disciplina, index) => {
                      const indexReal = disciplinas.findIndex(
                        (d) => d.id === disciplina.id ||
                          (d.codigo === disciplina.codigo && d.periodo === disciplina.periodo)
                      )

                      const isAC = disciplina.natureza === 'AC'
                      const pch = isAC || disciplina.trancamento ? 0 : disciplina.ch * (disciplina.nota || 0)
                      const notaDisplay = isAC || disciplina.trancamento || disciplina.dispensada ? '-' : (disciplina.nota || 0).toFixed(1)
                      const pchDisplay = isAC ? '-' : pch.toFixed(1)

                      return (
                        <div
                          key={disciplina.id || `${disciplina.codigo}-${periodo}-${index}`}
                          className="bg-card border border-border rounded-lg p-3 space-y-2"
                        >
                          {/* Header com código e ações */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono font-semibold bg-muted px-2 py-0.5 rounded">
                                  {disciplina.codigo}
                                </span>
                                <span className="text-xs bg-muted px-2 py-0.5 rounded">
                                  {disciplina.natureza || '-'}
                                </span>
                              </div>
                              <h4 className="text-sm font-medium leading-tight">{disciplina.nome}</h4>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              {onEdit && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => onEdit(disciplina, indexReal >= 0 ? indexReal : index)}
                                  aria-label={`Editar ${disciplina.nome}`}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onRemove(indexReal >= 0 ? indexReal : index)}
                                aria-label={`Remover ${disciplina.nome}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Informações em grid */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs pt-2 border-t border-border/50">
                            <div>
                              <span className="text-muted-foreground">CH:</span>{' '}
                              <span className="font-medium">{disciplina.ch}h</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Nota:</span>{' '}
                              <span className="font-medium">{notaDisplay}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">PCH:</span>{' '}
                              <span className="font-medium">{pchDisplay}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Status:</span>{' '}
                              <span className={`font-semibold ${getResultadoColor(disciplina.resultado)}`}>
                                {isAC ? 'AC' : getResultadoLabel(disciplina.resultado, true)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* Desktop/Tablet View - Table with Horizontal Scroll */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-xs min-w-[800px]">
                <thead>
                  <tr className="border-b-2 border-border bg-muted/30">
                    <th className="text-left px-2 py-2 text-xs font-semibold min-w-[80px]">Semestre</th>
                    <th className="text-left px-2 py-2 text-xs font-semibold min-w-[90px]">Código</th>
                    <th className="text-left px-2 py-2 text-xs font-semibold min-w-[200px]">Disciplina</th>
                    <th className="text-center px-2 py-2 text-xs font-semibold min-w-[70px]">Natureza</th>
                    <th className="text-center px-2 py-2 text-xs font-semibold min-w-[50px]">CH</th>
                    <th className="text-center px-2 py-2 text-xs font-semibold min-w-[60px]">Nota</th>
                    <th className="text-center px-2 py-2 text-xs font-semibold min-w-[60px]">PCH</th>
                    <th className="text-center px-2 py-2 text-xs font-semibold min-w-[70px]">RES</th>
                    <th className="text-center px-2 py-2 text-xs font-semibold min-w-[90px]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {disciplinasPorPeriodo.periodosOrdenados.map((periodo, periodoIndex) => {
                    const disciplinasDoPeriodo = disciplinasPorPeriodo.grupos[periodo]

                    return (
                      <React.Fragment key={periodo}>
                        {/* Espaçamento antes do primeiro período */}
                        {periodoIndex === 0 && (
                          <tr>
                            <td colSpan={9} className="h-1"></td>
                          </tr>
                        )}

                        {/* Cabeçalho do período */}
                        <tr className="periodo-header">
                          <td colSpan={9} className="px-2 py-2 text-xs font-semibold bg-muted/20">
                            Período {periodo}
                          </td>
                        </tr>

                        {/* Disciplinas do período */}
                        {disciplinasDoPeriodo.map((disciplina, index) => {
                          const indexReal = disciplinas.findIndex(
                            (d) => d.id === disciplina.id ||
                              (d.codigo === disciplina.codigo && d.periodo === disciplina.periodo)
                          )

                          const isAC = disciplina.natureza === 'AC'
                          const pch = isAC || disciplina.trancamento ? 0 : disciplina.ch * (disciplina.nota || 0)
                          const notaDisplay = isAC || disciplina.trancamento || disciplina.dispensada ? '-' : (disciplina.nota || 0).toFixed(1)
                          const pchDisplay = isAC ? '-' : pch.toFixed(1)

                          return (
                            <tr
                              key={disciplina.id || `${disciplina.codigo}-${periodo}-${index}`}
                              className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                            >
                              <td className="px-2 py-2 text-xs">{disciplina.periodo}</td>
                              <td className="px-2 py-2 text-xs font-mono font-medium">{disciplina.codigo}</td>
                              <td className="px-2 py-2 text-xs" title={disciplina.nome}>
                                {disciplina.nome}
                              </td>
                              <td className="px-2 py-2 text-xs text-center">
                                <span className="font-medium" title={NATUREZA_LABELS[disciplina.natureza] || disciplina.natureza}>
                                  {disciplina.natureza || '-'}
                                </span>
                              </td>
                              <td className="px-2 py-2 text-xs text-center">{disciplina.ch}</td>
                              <td className="px-2 py-2 text-xs text-center">{notaDisplay}</td>
                              <td className="px-2 py-2 text-xs text-center">{pchDisplay}</td>
                              <td className={`px-2 py-2 text-xs font-medium text-center ${getResultadoColor(disciplina.resultado)}`} title={isAC ? 'Atividade Complementar' : getResultadoLabel(disciplina.resultado)}>
                                {isAC ? 'AC' : getResultadoLabel(disciplina.resultado, true)}
                              </td>
                              <td className="px-2 py-2">
                                <div className="flex gap-1 justify-center">
                                  {onEdit && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => onEdit(disciplina, indexReal >= 0 ? indexReal : index)}
                                      aria-label={`Editar ${disciplina.nome}`}
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => onRemove(indexReal >= 0 ? indexReal : index)}
                                    aria-label={`Remover ${disciplina.nome}`}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}

                        {/* Espaçamento entre períodos (exceto no último) */}
                        {periodoIndex < disciplinasPorPeriodo.periodosOrdenados.length - 1 && (
                          <tr>
                            <td colSpan={9} className="h-3"></td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

