'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { BookOpen, Upload, Users, TrendingUp } from 'lucide-react'
import { MaterialCard } from '@/components/features/materiais/material-card'
import { MaterialFiltersBar } from '@/components/features/materiais/material-filters'
import { AddMaterialSheet } from '@/components/features/materiais/add-material-sheet'
import { Select } from '@/components/ui/select'
import { getMateriais, getDisciplinas, type MaterialFilters } from '@/services/materials.service'
import { getProfile } from '@/services/firestore.service'
import { useAuth } from '@/components/auth-provider'
import { CURSOS, INSTITUTOS } from '@/lib/constants'
import type { Instituto, Material } from '@/types'

type SortOption = 'recent' | 'oldest' | 'most_downloaded' | 'most_liked' | 'most_rated' | 'most_viewed'

const SORT_LABELS: Record<SortOption, string> = {
  recent:          'Mais recentes',
  oldest:          'Mais antigos',
  most_downloaded: 'Mais baixados',
  most_liked:      'Mais curtidos',
  most_rated:      'Melhor avaliados',
  most_viewed:     'Mais visualizados',
}

function sortMateriais(list: Material[], sort: SortOption): Material[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case 'oldest':          return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)
      case 'most_downloaded': return (b.downloadsCount ?? 0) - (a.downloadsCount ?? 0)
      case 'most_liked':      return (b.likesCount ?? 0) - (a.likesCount ?? 0)
      case 'most_rated':      return (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0) || (b.ratingCount ?? 0) - (a.ratingCount ?? 0)
      case 'most_viewed':     return (b.viewsCount ?? 0) - (a.viewsCount ?? 0)
      default:                return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    }
  })
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-l-4 border-border dark:border-slate-700 bg-card dark:bg-slate-800/50 p-5 space-y-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-muted rounded w-3/4" />
          <div className="h-2.5 bg-muted rounded w-1/3" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="h-4 w-16 bg-muted rounded-full" />
        <div className="h-4 w-12 bg-muted rounded-full" />
        <div className="h-4 w-10 bg-muted rounded-full" />
      </div>
      <div className="h-2.5 bg-muted rounded w-2/3" />
      <div className="flex justify-between pt-2 border-t border-border/50 dark:border-slate-700/50">
        <div className="h-2.5 bg-muted rounded w-24" />
      </div>
    </div>
  )
}

export function MateriaisPage() {
  const { user } = useAuth()
  const [materiais, setMateriais] = useState<Material[]>([])
  const [filters, setFilters] = useState<MaterialFilters>({})
  const [instituto, setInstituto] = useState<string>('')
  const [sort, setSort] = useState<SortOption>('recent')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [disciplinas, setDisciplinas] = useState<string[]>([])

  const sorted = useMemo(() => sortMateriais(materiais, sort), [materiais, sort])

  // Load user profile to default the instituto filter
  useEffect(() => {
    if (!user) return
    getProfile(user.uid).then(profile => {
      const cursoAtivo = profile?.cursos?.at(-1)
      if (cursoAtivo) {
        const inst = CURSOS[cursoAtivo]?.instituto
        if (inst) setInstituto(inst)
      }
    })
  }, [user])

  useEffect(() => {
    getDisciplinas().then(setDisciplinas)
  }, [])

  // Compute effective filters: when no specific curso, scope to the selected instituto
  const effectiveFilters = useMemo<MaterialFilters>(() => {
    if (filters.curso || !instituto) return filters
    const cursosDoInstituto = INSTITUTOS[instituto as Instituto]?.cursos
    return cursosDoInstituto ? { ...filters, cursos: cursosDoInstituto } : filters
  }, [filters, instituto])

  const loadMateriais = useCallback(() => {
    setLoading(true)
    setError(null)
    getMateriais(effectiveFilters)
      .then(setMateriais)
      .catch(() => setError('Erro ao carregar materiais.'))
      .finally(() => setLoading(false))
  }, [effectiveFilters])

  useEffect(() => {
    loadMateriais()
  }, [loadMateriais])

  return (
    <main className="container py-8 px-4 max-w-6xl">

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent dark:from-blue-500/10 dark:via-blue-500/5 dark:to-transparent border border-border/50 dark:border-slate-700/50 p-6 sm:p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-blue-500/15">
              <BookOpen className="h-6 w-6 text-primary dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-slate-100">
                Materiais Acadêmicos
              </h1>
              <p className="text-sm text-muted-foreground">
                Repositório colaborativo {instituto ? `do ${INSTITUTOS[instituto as Instituto]?.sigla}` : 'ICTI / IHAC'} / UFBA
              </p>
            </div>
          </div>

          {!loading && !error && (
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/70 dark:bg-slate-800/70 border border-border/50 dark:border-slate-700 text-xs text-muted-foreground backdrop-blur-sm">
                <BookOpen className="h-3 w-3" />
                <span className="font-medium text-foreground dark:text-slate-200">{materiais.length}</span>
                {materiais.length === 1 ? 'material disponível' : 'materiais disponíveis'}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/70 dark:bg-slate-800/70 border border-border/50 dark:border-slate-700 text-xs text-muted-foreground backdrop-blur-sm">
                <Users className="h-3 w-3" />
                Contribuição da comunidade
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/70 dark:bg-slate-800/70 border border-border/50 dark:border-slate-700 text-xs text-muted-foreground backdrop-blur-sm">
                <Upload className="h-3 w-3" />
                Envie seus materiais
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filtros + Ordenação */}
      <div className="mb-6 space-y-3">
        <MaterialFiltersBar
          filters={filters}
          onChange={setFilters}
          instituto={instituto}
          onInstitutoChange={inst => { setInstituto(inst); setFilters(f => ({ ...f, curso: undefined })) }}
          total={loading ? undefined : materiais.length}
          disciplinas={disciplinas}
        />
        <div className="flex justify-end">
          <Select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="w-48 h-8 text-xs"
            aria-label="Ordenar por"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map(k => (
              <option key={k} value={k}>{SORT_LABELS[k]}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-24 text-muted-foreground">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{error}</p>
          <button
            onClick={loadMateriais}
            className="mt-3 text-sm text-primary dark:text-blue-400 hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : materiais.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-foreground font-semibold">Nenhum material encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            Tente ajustar os filtros ou seja o primeiro a contribuir!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(m => (
            <MaterialCard key={m.id} material={m} />
          ))}
        </div>
      )}

      <AddMaterialSheet onSuccess={loadMateriais} />
    </main>
  )
}
