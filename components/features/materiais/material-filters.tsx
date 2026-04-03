'use client'

import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { CURSO_LABELS, TIPO_MATERIAL_LABELS, TIPOS_MATERIAL } from '@/lib/materiais-constants'
import type { MaterialFilters } from '@/services/materials.service'
import { CURSOS } from '@/lib/constants'
import type { Curso } from '@/types'

interface MaterialFiltersProps {
  filters: MaterialFilters
  onChange: (filters: MaterialFilters) => void
  total?: number
  disciplinas?: string[]
}

export function MaterialFiltersBar({ filters, onChange, total, disciplinas = [] }: MaterialFiltersProps) {
  const hasActiveFilters = !!(filters.curso || filters.tipo || filters.search)

  function set(key: keyof MaterialFilters, value: string) {
    onChange({ ...filters, [key]: value || undefined })
  }

  function reset() {
    onChange({})
  }

  const activeChips = [
    filters.search      && { key: 'search',      label: `"${filters.search}"` },
    filters.curso       && { key: 'curso',       label: CURSO_LABELS[filters.curso as Curso] ?? filters.curso },
    filters.tipo        && { key: 'tipo',        label: TIPO_MATERIAL_LABELS[filters.tipo as keyof typeof TIPO_MATERIAL_LABELS] },
    filters.disciplina  && { key: 'disciplina',  label: filters.disciplina },
  ].filter(Boolean) as { key: keyof MaterialFilters; label: string }[]

  return (
    <div className="space-y-3">
      {/* Inputs row */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por título ou disciplina..."
            value={filters.search ?? ''}
            onChange={e => set('search', e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Selects */}
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Select
            value={filters.curso ?? ''}
            onChange={e => set('curso', e.target.value)}
            className="sm:w-48 h-9 text-sm"
            aria-label="Filtrar por curso"
          >
            <option value="">Todos os cursos</option>
            {Object.keys(CURSOS).map(curso => (
              <option key={curso} value={curso}>
                {CURSO_LABELS[curso as keyof typeof CURSO_LABELS] ?? curso}
              </option>
            ))}
          </Select>

          <Select
            value={filters.tipo ?? ''}
            onChange={e => set('tipo', e.target.value)}
            className="sm:w-40 h-9 text-sm"
            aria-label="Filtrar por tipo"
          >
            <option value="">Todos os tipos</option>
            {TIPOS_MATERIAL.map(tipo => (
              <option key={tipo} value={tipo}>
                {TIPO_MATERIAL_LABELS[tipo]}
              </option>
            ))}
          </Select>

          {disciplinas.length > 0 && (
            <Select
              value={filters.disciplina ?? ''}
              onChange={e => set('disciplina', e.target.value)}
              className="sm:w-48 h-9 text-sm"
              aria-label="Filtrar por disciplina"
            >
              <option value="">Todas as disciplinas</option>
              {disciplinas.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          )}

        </div>
      </div>

      {/* Active filters + count */}
      <div className="flex items-center justify-between min-h-[24px]">
        <div className="flex flex-wrap gap-1.5 items-center">
          {activeChips.length > 0 && (
            <>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <SlidersHorizontal className="h-3 w-3" />
                Filtros ativos:
              </span>
              {activeChips.map(chip => (
                <button
                  key={chip.key}
                  onClick={() => set(chip.key, '')}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary dark:bg-blue-500/10 dark:text-blue-400 hover:bg-primary/20 dark:hover:bg-blue-500/20 transition-colors"
                  aria-label={`Remover filtro ${chip.label}`}
                >
                  {chip.label}
                  <X className="h-2.5 w-2.5" />
                </button>
              ))}
              <button
                onClick={reset}
                className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Limpar tudo
              </button>
            </>
          )}
        </div>
        {total !== undefined && (
          <span className="text-xs text-muted-foreground shrink-0">
            {total} {total === 1 ? 'resultado' : 'resultados'}
          </span>
        )}
      </div>
    </div>
  )
}
