'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { logger } from '@/lib/logger'
import type { Curso, Natureza } from '@/types'

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

    const disciplinasDoCurso = disciplinasData[cursoAtual] || []
    if (disciplinasDoCurso.length === 0) {
      setResults([])
      setShowResults(false)
      return
    }

    const term = searchTerm.toLowerCase().trim()

    const matches = disciplinasDoCurso
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
    <Card className="mb-8">
      <CardHeader>
        <CardTitle as="h2" className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Buscar Disciplina
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Digite o código ou nome da disciplina..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (results.length > 0) {
                  setShowResults(true)
                }
              }}
              className="pl-10 pr-10"
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {showResults && results.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
              {results.map((disciplina, index) => (
                <button
                  key={`${disciplina.codigo}-${index}`}
                  type="button"
                  onClick={() => handleSelect(disciplina)}
                  className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors ${index === selectedIndex ? 'bg-accent' : ''
                    } ${index !== results.length - 1 ? 'border-b' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-semibold text-primary">
                        {highlightMatch(disciplina.codigo, searchTerm)}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {highlightMatch(disciplina.nome, searchTerm)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                      {disciplina.natureza}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showResults && searchTerm.length >= 2 && results.length === 0 && (
            <div className="absolute z-50 w-full mt-2 bg-background border rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground">
              <Search className="h-5 w-5 mx-auto mb-2 opacity-50" />
              <p>Nenhuma disciplina encontrada para &quot;{searchTerm}&quot;</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

