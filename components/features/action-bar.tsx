'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileUp, Loader2, BookOpen, Info } from 'lucide-react'
import { parseSigaaHistory, ParsedHistory } from '@/lib/pdf-parser'
import { toast } from '@/lib/toast'
import { logger } from '@/lib/logger'
import { Disciplina, Curso } from '@/types'
import dynamic from 'next/dynamic'

const AcademicCalendar = dynamic(
  () => import('@/components/features/academic-calendar').then(mod => mod.AcademicCalendar),
  { ssr: false }
)

const InfoDialog = dynamic(
  () => import('@/components/features/info-dialog').then(mod => mod.InfoDialog),
  { ssr: false }
)

interface ActionBarProps {
  cursoAtual: Curso
  onCursoChange: (curso: Curso) => void
  onImport: (disciplinas: Disciplina[]) => Promise<void>
  /** Cursos disponíveis para o select. Se não informado, exibe todos os cursos. */
  cursosDisponiveis?: Curso[]
}

export function ActionBar({ cursoAtual, onCursoChange, onImport, cursosDisponiveis }: ActionBarProps) {
  const [isParsing, setIsParsing] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Por favor, selecione um arquivo PDF.')
      return
    }

    setIsParsing(true)
    try {
      const result: ParsedHistory = await parseSigaaHistory(file)

      if (result.disciplinas.length === 0) {
        toast.error('Não foi possível encontrar disciplinas no arquivo. Verifique se o PDF é um histórico oficial do SIGAA.')
      } else {
        await onImport(result.disciplinas)
      }
    } catch (error) {
      logger.error('Erro ao processar PDF:', error)
      toast.error('Ocorreu um erro ao processar o arquivo. Tente novamente.')
    } finally {
      setIsParsing(false)
      // Reset input
      event.target.value = ''
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 px-4 mb-6 bg-card border rounded-xl shadow-sm">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground whitespace-nowrap">
          <BookOpen className="h-4 w-4" />
          <label htmlFor="curso-select">Curso:</label>
        </div>
        <select
          id="curso-select"
          value={cursoAtual}
          onChange={(e) => onCursoChange(e.target.value as Curso)}
          className="flex h-9 w-full sm:w-[280px] rounded-md border border-input bg-background dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {cursosDisponiveis ? (
            cursosDisponiveis.map((curso) => (
              <option key={curso} value={curso}>
                {curso === 'BICTI' ? 'BICTI' : curso === 'ENG_PROD' ? 'Engenharia de Produção' : 'Engenharia Elétrica'}
              </option>
            ))
          ) : (
            <>
              <option value="BICTI">BICTI</option>
              <option value="ENG_PROD">Engenharia de Produção</option>
              <option value="ENG_ELET">Engenharia Elétrica</option>
            </>
          )}
        </select>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <AcademicCalendar />
        <Button
          variant="outline"
          size="sm"
          aria-label="Informações úteis do ICTI"
          className="gap-2 border-primary/20 hover:bg-primary/5 rounded-lg"
          onClick={() => setInfoOpen(true)}
        >
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span className="max-sm:hidden">Informações</span>
        </Button>
        {infoOpen && <InfoDialog open={infoOpen} onOpenChange={setInfoOpen} />}
        <label className="w-full sm:w-auto">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
            disabled={isParsing}
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto gap-2 border-primary/20 hover:bg-primary/5 rounded-lg"
            asChild
          >
            <span>
              {isParsing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileUp className="h-3.5 w-3.5" />
              )}
              {isParsing ? 'Processando...' : 'Importar SIGAA (PDF)'}
            </span>
          </Button>
        </label>
      </div>
    </div>
  )
}
