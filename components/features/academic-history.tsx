'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Edit } from 'lucide-react'
import type { Disciplina, Curso } from '@/types'
import { calcularResultado, compararPeriodos, cn } from '@/lib/utils'
import { NATUREZA_LABELS } from '@/lib/constants'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

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

  const getResultadoBadgeStyles = (resultado?: string) => {
    switch (resultado) {
      case 'AP':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
      case 'RR':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
      case 'TR':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
      case 'DP':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      default:
        return 'bg-muted text-muted-foreground border-transparent'
    }
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle as="h2" className="flex items-center gap-2 text-2xl font-bold">
              <span>📋</span> Disciplinas Cursadas
            </CardTitle>
            <CardDescription className="text-base">
              {disciplinas.length} disciplina{disciplinas.length !== 1 ? 's' : ''} registrada
              {disciplinas.length !== 1 ? 's' : ''} organizada por semestre
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        {disciplinas.length === 0 ? (
          <div className="text-center py-12 bg-card border rounded-2xl shadow-sm text-muted-foreground">
            <p className="text-lg font-medium">Nenhuma disciplina cadastrada ainda.</p>
            <p className="text-sm mt-2">Clique no botão "+" para adicionar disciplinas ou importe seu histórico.</p>
          </div>
        ) : (
          <Accordion type="multiple" defaultValue={[disciplinasPorPeriodo.periodosOrdenados[0]]} className="space-y-4">
            {disciplinasPorPeriodo.periodosOrdenados.map((periodo, idx) => {
              const disciplinasDoPeriodo = disciplinasPorPeriodo.grupos[periodo]
              const aprovadasCount = disciplinasDoPeriodo.filter(d => d.resultado === 'AP').length
              
              // Cálculo do número sequencial do semestre (do mais antigo para o mais recente)
              const semestreSequencial = disciplinasPorPeriodo.periodosOrdenados.length - idx

              return (
                <AccordionItem
                  key={periodo}
                  value={periodo}
                  className="bg-card border rounded-2xl shadow-sm px-4 overflow-hidden"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 text-left">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20 shadow-inner">
                        {semestreSequencial}º
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Semestre {periodo}</h3>
                        <p className="text-xs text-muted-foreground">
                          {disciplinasDoPeriodo.length} disciplinas • {aprovadasCount} aprovadas
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-6">
                    <div className="grid grid-cols-1 gap-3">
                      {disciplinasDoPeriodo.map((disciplina, index) => {
                        const indexReal = disciplinas.findIndex(
                          (d) => d.id === disciplina.id ||
                            (d.codigo === disciplina.codigo && d.periodo === disciplina.periodo)
                        )

                        const isAC = disciplina.natureza === 'AC'
                        const notaDisplay = isAC || disciplina.trancamento || disciplina.dispensada ? '-' : (disciplina.nota || 0).toFixed(1)

                        return (
                          <div
                            key={disciplina.id || `${disciplina.codigo}-${periodo}-${index}`}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-xl transition-all border border-transparent hover:border-border"
                          >
                            <div className="flex items-start gap-4 flex-1">
                              <div className={cn(
                                "flex items-center justify-center h-10 w-10 rounded-lg border text-xs font-bold shrink-0",
                                getResultadoBadgeStyles(disciplina.resultado)
                              )}>
                                {isAC ? 'AC' : getResultadoLabel(disciplina.resultado, true)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground/70 bg-muted px-1.5 py-0.5 rounded">
                                    {disciplina.codigo}
                                  </span>
                                  <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">
                                    {NATUREZA_LABELS[disciplina.natureza] || disciplina.natureza}
                                  </span>
                                </div>
                                <h4 className="text-sm font-semibold leading-tight truncate pr-4">{disciplina.nome}</h4>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 mt-4 sm:mt-0">
                              <div className="flex gap-8">
                                <div className="text-center">
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">CH</p>
                                  <p className="text-sm font-mono font-bold">{disciplina.ch}h</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Nota</p>
                                  <p className="text-sm font-mono font-bold">{notaDisplay}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                {onEdit && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                                    onClick={() => onEdit(disciplina, indexReal >= 0 ? indexReal : index)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => onRemove(indexReal >= 0 ? indexReal : index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}

