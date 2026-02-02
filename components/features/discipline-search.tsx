'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { logger } from '@/lib/logger'
import type { Curso, Natureza } from '@/types'

import { cn } from '@/lib/utils'

interface DisciplinaData {
  codigo: string
  nome: string
  natureza: Natureza
  ch?: number
}

interface DisciplineSearchProps {
  cursoAtual: Curso
  onSelect: (disciplina: DisciplinaData) => void
}

export function DisciplineSearch({ cursoAtual, onSelect }: DisciplineSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<DisciplinaData[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [disciplinasData, setDisciplinasData] = useState<Record<string, DisciplinaData[]>>({})
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Carregar dados das disciplinas
  useEffect(() => {
    const loadDisciplinas = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/assets/data/disciplinas.json')
        const data = await response.json()
        setDisciplinasData(data)
      } catch (error) {
        logger.error('Erro ao carregar disciplinas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDisciplinas()
  }, [])

  // Fechar resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Limpar busca ao mudar curso
  useEffect(() => {
    setSearchTerm('')
    setResults([])
    setShowResults(false)
    setSelectedIndex(-1)
  }, [cursoAtual])

  // Buscar disciplinas
  useEffect(() => {
    // Verificar se os dados já foram carregados primeiro
    if (!disciplinasData || Object.keys(disciplinasData).length === 0) {
      setResults([])
      setShowResults(false)
      return
    }

    if (searchTerm.trim().length < 2) {
      setResults([])
      setShowResults(false)
      setSelectedIndex(-1)
      return
    }

    const normalizedData = disciplinasData as any
    const cursoDisciplinas = normalizedData.cursos?.[cursoAtual] || []

    // Mapear combinando com o catálogo
    const disciplinasCompletas = cursoDisciplinas.map((d: any) => ({
      ...d,
      ...normalizedData.catalogo?.[d.codigo]
    })) as DisciplinaData[]

    const term = searchTerm.toLowerCase().trim()

    const matches = disciplinasCompletas
      .filter(
        (disciplina) =>
          disciplina.nome.toLowerCase().includes(term) ||
          disciplina.codigo.toLowerCase().includes(term)
      )
      .slice(0, 8) // Limita a 8 resultados

    setResults(matches)
    setShowResults(matches.length > 0)
    setSelectedIndex(-1)
  }, [searchTerm, cursoAtual, disciplinasData])

  const handleSelect = (disciplina: DisciplinaData) => {
    onSelect(disciplina)
    setSearchTerm(disciplina.nome)
    setShowResults(false)
    setResults([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || results.length === 0) return

    // Seta para baixo
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    }
    // Seta para cima
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    }
    // Enter para selecionar
    else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    }
    // Escape para fechar
    else if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

  const highlightMatch = (text: string, term: string) => {
    if (!term) return text
    const regex = new RegExp(`(${term})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Buscar disciplina por nome ou código (ex: Cálculo, CTIA01)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true)
            }
          }}
          className="pl-11 pr-10 h-12 rounded-xl border-none bg-card shadow-sm text-base font-medium placeholder:text-muted-foreground/60 dark:placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-primary/20"
          disabled={isLoading}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('')
              setResults([])
              setShowResults(false)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-background border rounded-xl shadow-xl max-h-[400px] overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-200">
          {results.map((disciplina, index) => (
            <button
              key={`${disciplina.codigo}-${index}`}
              type="button"
              onClick={() => handleSelect(disciplina)}
              className={cn(
                "w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border/50 last:border-0",
                index === selectedIndex && "bg-accent"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">
                    {highlightMatch(disciplina.codigo, searchTerm)}
                  </div>
                  <div className="text-sm font-semibold text-foreground truncate pr-4">
                    {highlightMatch(disciplina.nome, searchTerm)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold bg-muted px-2 py-1 rounded uppercase text-muted-foreground">
                    {disciplina.natureza}
                  </span>
                  {disciplina.ch && (
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                      {disciplina.ch}h
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && searchTerm.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-background border rounded-xl shadow-xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">Nenhuma disciplina encontrada para &quot;{searchTerm}&quot;</p>
        </div>
      )}
    </div>
  )
}


