'use client'

import { Download, FileText, Calendar, BookOpen, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Material } from '@/types'
import { TIPO_MATERIAL_LABELS, CURSO_LABELS, STATUS_MATERIAL_LABELS } from '@/lib/materiais-constants'
import Link from 'next/link'

interface MaterialCardProps {
  material: Material
  showStatus?: boolean
}

const TIPO_COLORS: Record<string, string> = {
  lista:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  apostila: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  prova:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  resumo:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  slides:   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  outro:    'bg-muted text-muted-foreground',
}

const STATUS_COLORS: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export function MaterialCard({ material, showStatus = false }: MaterialCardProps) {
  const formattedDate = material.createdAt
    ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
        material.createdAt instanceof Date ? material.createdAt : new Date(material.createdAt)
      )
    : '—'

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200 border-border dark:border-slate-700 dark:bg-slate-800/50">
      <CardContent className="p-5">
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 min-w-0">
              <div className="shrink-0 mt-0.5 p-2 rounded-lg bg-primary/10 dark:bg-blue-500/10">
                <FileText className="h-4 w-4 text-primary dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground dark:text-slate-100 line-clamp-2 leading-snug">
                  {material.titulo}
                </h3>
                {material.uploaderName && (
                  <p className="text-xs text-muted-foreground mt-0.5">{material.uploaderName}</p>
                )}
              </div>
            </div>
            {showStatus && (
              <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_COLORS[material.status]}`}>
                {STATUS_MATERIAL_LABELS[material.status]}
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${TIPO_COLORS[material.tipo] ?? TIPO_COLORS.outro}`}>
              {TIPO_MATERIAL_LABELS[material.tipo]}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {CURSO_LABELS[material.curso] ?? material.curso}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {material.semestre}
            </span>
          </div>

          {/* Discipline */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3 shrink-0" />
            <span className="truncate">{material.disciplina}</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-border/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {material.downloadsCount}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
            </div>
            <Link href={`/materiais/${material.id}`}>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-3 text-xs text-primary dark:text-blue-400 hover:bg-primary/10 dark:hover:bg-blue-500/10 font-medium"
              >
                Ver
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
