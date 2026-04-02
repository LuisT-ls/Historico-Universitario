'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Loader2 } from 'lucide-react'
import { MaterialCard } from '@/components/features/materiais/material-card'
import { MaterialFiltersBar } from '@/components/features/materiais/material-filters'
import { getMateriais, type MaterialFilters } from '@/services/materials.service'
import type { Material } from '@/types'

export function MateriaisPage() {
  const [materiais, setMateriais] = useState<Material[]>([])
  const [filters, setFilters] = useState<MaterialFilters>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getMateriais(filters)
      .then(setMateriais)
      .catch(() => setError('Erro ao carregar materiais.'))
      .finally(() => setLoading(false))
  }, [filters])

  return (
    <main className="container py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-primary/10 dark:bg-blue-500/10">
            <BookOpen className="h-6 w-6 text-primary dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-slate-100">
            Materiais Acadêmicos
          </h1>
        </div>
        <p className="text-muted-foreground ml-14">
          Repositório colaborativo de materiais do ICTI / UFBA
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <MaterialFiltersBar filters={filters} onChange={setFilters} />
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-24 text-muted-foreground">{error}</div>
      ) : materiais.length === 0 ? (
        <div className="text-center py-24">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">Nenhum material encontrado.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Tente ajustar os filtros ou seja o primeiro a contribuir!
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-4">
            {materiais.length} {materiais.length === 1 ? 'material encontrado' : 'materiais encontrados'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {materiais.map(m => (
              <MaterialCard key={m.id} material={m} />
            ))}
          </div>
        </>
      )}
    </main>
  )
}
