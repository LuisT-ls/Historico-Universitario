'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileUp, Loader2, BookOpen } from 'lucide-react'
import { parseSigaaHistory, ParsedHistory } from '@/lib/pdf-parser'
import { toast } from '@/lib/toast'
import { logger } from '@/lib/logger'
import { Disciplina, Curso } from '@/types'

interface ActionBarProps {
  cursoAtual: Curso
  onCursoChange: (curso: Curso) => void
  onImport: (disciplinas: Disciplina[]) => void
}

export function ActionBar({ cursoAtual, onCursoChange, onImport }: ActionBarProps) {
  const [isParsing, setIsParsing] = useState(false)

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
        onImport(result.disciplinas)
        
        if (result.avisos && result.avisos.length > 0) {
          result.avisos.forEach(aviso => {
            toast.info('Aviso de Importação', {
              description: aviso,
              duration: 6000
            })
          })
        }

        toast.success(`${result.disciplinas.length} disciplinas importadas com sucesso!`)
        
        if (result.nomeAluno) {
          logger.info(`Histórico de ${result.nomeAluno} importado.`)
        }
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
          <span>Curso:</span>
        </div>
        <select
          value={cursoAtual}
          onChange={(e) => onCursoChange(e.target.value as Curso)}
          className="flex h-9 w-full sm:w-[280px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="BICTI">BICTI</option>
          <option value="ENG_PROD">Engenharia de Produção</option>
          <option value="ENG_ELET">Engenharia Elétrica</option>
        </select>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
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
