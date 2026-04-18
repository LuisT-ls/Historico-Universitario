'use client'

import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { CURSO_LABELS, TIPO_MATERIAL_LABELS, TIPOS_MATERIAL } from '@/lib/materiais-constants'
import type { MaterialFilters } from '@/services/materials.service'
import { CURSOS, INSTITUTOS } from '@/lib/constants'
import type { Curso, Instituto } from '@/types'

interface MaterialFiltersProps {
  filters: MaterialFilters
  onChange: (filters: MaterialFilters) => void
  instituto: string
  onInstitutoChange: (v: string) => void
  total?: number
  disciplinas?: string[]
}

export function MaterialFiltersBar({
  filters,
  onChange,
  instituto,
  onInstitutoChange,
  total,
  disciplinas = [],
}: MaterialFiltersProps) {
  function set(key: keyof MaterialFilters, value: string) {
    onChange({ ...filters, [key]: value || undefined })
  }

  function reset() {
    onChange({})
    onInstitutoChange('')
  }

  const cursosDoInstituto = instituto
    ? (INSTITUTOS[instituto as Instituto]?.cursos ?? [])
    : Object.keys(CURSOS)

  const hasActiveFilters = !!(filters.curso || filters.tipo || filters.search || instituto)

  const activeChips = [
    instituto      && { key: 'instituto' as const, label: INSTITUTOS[instituto as Instituto]?.sigla ?? instituto },
    filters.search && { key: 'search'    as const, label: `"${filters.search}"` },
    filters.curso  && { key: 'curso'     as const, label: CURSO_LABELS[filters.curso as Curso] ?? filters.curso },
    filters.tipo   && { key: 'tipo'      as const, label: TIPO_MATERIAL_LABELS[filters.tipo as keyof typeof TIPO_MATERIAL_LABELS] },
    filters.disciplina && { key: 'disciplina' as const, label: filters.disciplina },
  ].filter(Boolean) as { key: string; label: string }[]

  function removeChip(key: string) {
    if (key === 'instituto') { onInstitutoChange(''); onChange({ ...filters, curso: undefined }); return }
    set(key as keyof MaterialFilters, '')
  }

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
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:flex-nowrap">
          <Select
            value={instituto}
            onChange={e => { onInstitutoChange(e.target.value); onChange({ ...filters, curso: undefined }) }}
            className="h-9 text-sm sm:w-40"
            aria-label="Filtrar por instituto"
          >
            <option value="">Todos os institutos</option>
            {(Object.keys(INSTITUTOS) as Instituto[]).map(inst => (
              <option key={inst} value={inst}>{INSTITUTOS[inst].sigla}</option>
            ))}
          </Select>

          <Select
            value={filters.curso ?? ''}
            onChange={e => set('curso', e.target.value)}
            className="h-9 text-sm sm:w-44"
            aria-label="Filtrar por curso"
          >
            <option value="">{instituto ? 'Todos os cursos' : 'Todos os cursos'}</option>
            {cursosDoInstituto.map(curso => (
              <option key={curso} value={curso}>
                {CURSO_LABELS[curso as keyof typeof CURSO_LABELS] ?? curso}
              </option>
            ))}
          </Select>

          <Select
            value={filters.tipo ?? ''}
            onChange={e => set('tipo', e.target.value)}
            className="h-9 text-sm sm:w-40"
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
              className="col-span-2 h-9 text-sm sm:w-48 sm:col-span-1"
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
                  onClick={() => removeChip(chip.key)}
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
