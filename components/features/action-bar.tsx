'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileUp, Loader2, Info } from 'lucide-react'
import { parseSigaaHistory, ParsedHistory } from '@/lib/pdf-parser'
import { toast } from '@/lib/toast'
import { logger } from '@/lib/logger'
import { Disciplina, Instituto } from '@/types'
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
  onImport: (disciplinas: Disciplina[]) => Promise<void>
  instituto?: Instituto
}

export function ActionBar({ onImport, instituto = 'ICTI' }: ActionBarProps) {
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
      event.target.value = ''
    }
  }

  return (
    <div className="flex items-center justify-end gap-2 p-2 px-4 mb-6 bg-card border rounded-xl shadow-sm">
      <AcademicCalendar />
      <Button
        variant="outline"
        size="sm"
        aria-label="Informações úteis do instituto"
        className="gap-2 border-primary/20 hover:bg-primary/5 rounded-lg"
        onClick={() => setInfoOpen(true)}
      >
        <Info className="h-3.5 w-3.5 shrink-0" />
        <span className="max-sm:hidden">Informações</span>
      </Button>
      {infoOpen && <InfoDialog open={infoOpen} onOpenChange={setInfoOpen} instituto={instituto} />}
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
  )
}
