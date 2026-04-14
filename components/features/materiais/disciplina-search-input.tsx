'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'

interface CatalogEntry {
  codigo: string
  nome: string
  ch?: number
}

interface DisciplinaSearchInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
}

/** Normaliza texto para busca: uppercase, sem acentos. Preserva espaços para nome. */
function normalize(text: string): string {
  return text
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/** Normaliza código: remove espaços também. */
function normalizeCode(text: string): string {
  return normalize(text).replace(/\s+/g, '')
}

export function DisciplinaSearchInput({
  id,
  value,
  onChange,
  onBlur,
  disabled,
}: DisciplinaSearchInputProps) {
  const [catalog, setCatalog] = useState<CatalogEntry[]>([])
  const [suggestions, setSuggestions] = useState<CatalogEntry[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Carrega o catálogo uma vez
  useEffect(() => {
    fetch('/assets/data/disciplinas.json')
      .then(r => r.json())
      .then(data => {
        const entries = Object.values(data.catalogo ?? {}) as CatalogEntry[]
        setCatalog(entries.sort((a, b) => a.codigo.localeCompare(b.codigo)))
      })
      .catch(() => {})
  }, [])

  // Filtra sugestões conforme o valor digitado
  useEffect(() => {
    const term = (value ?? '').trim()
    if (term.length < 2 || catalog.length === 0) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    const termNorm = normalize(term)
    const termCode = normalizeCode(term)

    const matches = catalog
      .filter(entry => {
        const entryCode = normalizeCode(entry.codigo)
        const entryNome = normalize(entry.nome)
        return entryCode.includes(termCode) || entryNome.includes(termNorm)
      })
      .slice(0, 8)

    setSuggestions(matches)
    setShowDropdown(matches.length > 0)
    setActiveIndex(-1)
  }, [value, catalog])

  // Fecha ao clicar fora
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  function handleSelect(entry: CatalogEntry) {
    onChange(`${entry.codigo} — ${entry.nome}`)
    setShowDropdown(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true)
        }}
        placeholder="Ex: CTIA01 ou Introdução à Computação"
        autoComplete="off"
        disabled={disabled}
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
      />

      {showDropdown && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border border-border dark:border-slate-700 bg-background dark:bg-slate-800 shadow-md max-h-56 overflow-y-auto"
        >
          {suggestions.map((entry, i) => (
            <li
              key={entry.codigo}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={e => {
                e.preventDefault() // evita que o blur feche antes do click
                handleSelect(entry)
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex items-baseline gap-2 px-3 py-2 cursor-pointer text-sm transition-colors ${
                i === activeIndex
                  ? 'bg-accent dark:bg-slate-700'
                  : 'hover:bg-accent/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <span className="font-mono text-xs text-muted-foreground shrink-0 tabular-nums">
                {entry.codigo}
              </span>
              <span className="truncate leading-snug">
                {entry.nome.charAt(0) + entry.nome.slice(1).toLowerCase()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
