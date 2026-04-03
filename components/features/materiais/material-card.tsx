'use client'

import { Download, FileText, Calendar, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Material } from '@/types'
import { TIPO_MATERIAL_LABELS, CURSO_LABELS, STATUS_MATERIAL_LABELS } from '@/lib/materiais-constants'
import Link from 'next/link'

interface MaterialCardProps {
  material: Material
  showStatus?: boolean
}

const TIPO_STYLE: Record<string, {
  leftBorder: string
  iconBg: string
  iconText: string
  badge: string
}> = {
  lista:    { leftBorder: 'border-l-blue-500',    iconBg: 'bg-blue-500/10',    iconText: 'text-blue-500 dark:text-blue-400',    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  apostila: { leftBorder: 'border-l-purple-500',  iconBg: 'bg-purple-500/10',  iconText: 'text-purple-500 dark:text-purple-400', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  prova:    { leftBorder: 'border-l-red-500',     iconBg: 'bg-red-500/10',     iconText: 'text-red-500 dark:text-red-400',      badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  resumo:   { leftBorder: 'border-l-emerald-500', iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-500 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  slides:   { leftBorder: 'border-l-orange-500',  iconBg: 'bg-orange-500/10',  iconText: 'text-orange-500 dark:text-orange-400', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  outro:    { leftBorder: 'border-l-slate-400',   iconBg: 'bg-slate-500/10',   iconText: 'text-slate-500 dark:text-slate-400',  badge: 'bg-muted text-muted-foreground' },
}

const STATUS_STYLE: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export function MaterialCard({ material, showStatus = false }: MaterialCardProps) {
  const formattedDate = material.createdAt
    ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
        material.createdAt instanceof Date ? material.createdAt : new Date(material.createdAt)
      )
    : '—'

  const style = TIPO_STYLE[material.tipo] ?? TIPO_STYLE.outro

  return (
    <Link href={`/materiais/${material.id}`} className="block group h-full">
      <Card className={`h-full flex flex-col border border-l-4 border-border dark:border-slate-700 dark:bg-slate-800/50 ${style.leftBorder} transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer`}>
        <CardContent className="p-5 flex flex-col gap-3 h-full">

          {/* Header: icon + title + status */}
          <div className="flex items-start gap-3">
            <div className={`shrink-0 p-2.5 rounded-xl ${style.iconBg}`}>
              <FileText className={`h-4 w-4 ${style.iconText}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                {material.titulo}
              </h3>
              {material.uploaderName && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{material.uploaderName}</p>
              )}
            </div>
            {showStatus && (
              <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_STYLE[material.status]}`}>
                {STATUS_MATERIAL_LABELS[material.status]}
              </span>
            )}
          </div>

          {/* Description */}
          {material.descricao && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {material.descricao}
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${style.badge}`}>
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
          <div className="flex items-center justify-between pt-2 border-t border-border/50 dark:border-slate-700/50 mt-auto">
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
            <span className="text-xs font-medium text-primary dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Ver →
            </span>
          </div>

        </CardContent>
      </Card>
    </Link>
  )
}
