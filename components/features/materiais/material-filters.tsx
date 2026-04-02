'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { CURSO_LABELS, TIPO_MATERIAL_LABELS, TIPOS_MATERIAL, getSemestres } from '@/lib/materiais-constants'
import type { MaterialFilters } from '@/services/materials.service'
import { CURSOS } from '@/lib/constants'

interface MaterialFiltersProps {
  filters: MaterialFilters
  onChange: (filters: MaterialFilters) => void
}

export function MaterialFiltersBar({ filters, onChange }: MaterialFiltersProps) {
  const hasActiveFilters = !!(filters.curso || filters.tipo || filters.semestre || filters.search)

  function set(key: keyof MaterialFilters, value: string) {
    onChange({ ...filters, [key]: value || undefined })
  }

  function reset() {
    onChange({})
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Busca */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por título ou disciplina..."
          value={filters.search ?? ''}
          onChange={e => set('search', e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Curso */}
      <Select
        value={filters.curso ?? ''}
        onChange={e => set('curso', e.target.value)}
        className="sm:w-44"
        aria-label="Filtrar por curso"
      >
        <option value="">Todos os cursos</option>
        {Object.keys(CURSOS).map(curso => (
          <option key={curso} value={curso}>
            {CURSO_LABELS[curso as keyof typeof CURSO_LABELS] ?? curso}
          </option>
        ))}
      </Select>

      {/* Tipo */}
      <Select
        value={filters.tipo ?? ''}
        onChange={e => set('tipo', e.target.value)}
        className="sm:w-44"
        aria-label="Filtrar por tipo"
      >
        <option value="">Todos os tipos</option>
        {TIPOS_MATERIAL.map(tipo => (
          <option key={tipo} value={tipo}>
            {TIPO_MATERIAL_LABELS[tipo]}
          </option>
        ))}
      </Select>

      {/* Semestre */}
      <Select
        value={filters.semestre ?? ''}
        onChange={e => set('semestre', e.target.value)}
        className="sm:w-36"
        aria-label="Filtrar por semestre"
      >
        <option value="">Semestre</option>
        {getSemestres().map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </Select>

      {/* Limpar */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Limpar filtros"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
