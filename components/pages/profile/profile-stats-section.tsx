'use client'

import { Card } from '@/components/ui/card'
import { Book, CheckCircle, Clock, Star } from 'lucide-react'
import type { UserStatistics } from '@/types'
import { cn } from '@/lib/utils'

interface ProfileStatsSectionProps {
  statistics: UserStatistics
}

export function ProfileStatsSection({ statistics }: ProfileStatsSectionProps) {
  const stats = [
    {
      label: 'Disciplinas',
      value: statistics.totalDisciplines,
      icon: Book,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      trend: 'Total Cadastrado',
    },
    {
      label: 'Concluídas',
      value: statistics.completedDisciplines,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      trend: `${Math.round((statistics.completedDisciplines / (statistics.totalDisciplines || 1)) * 100)}% Conclusão`,
    },
    {
      label: 'Em Andamento',
      value: statistics.inProgressDisciplines,
      icon: Clock,
      color: 'text-sky-500',
      bg: 'bg-sky-500/10',
      trend: 'Total no Semestre',
    },
    {
      label: 'Semestralização',
      value: statistics.semestralization !== undefined ? statistics.semestralization : '-',
      icon: Star,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      trend: 'Período Letivo SIGAA',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card
          key={i}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md p-6 transition-all hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-3xl font-black text-foreground mb-1">{stat.value}</h3>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">{stat.label}</p>
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                {stat.trend}
              </span>
            </div>
            <div className={cn('p-3 rounded-2xl', stat.bg, stat.color)}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
