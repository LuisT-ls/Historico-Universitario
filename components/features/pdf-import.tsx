'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileUp, Loader2 } from 'lucide-react'
import { parseSigaaHistory, ParsedHistory } from '@/lib/pdf-parser'
import { toast } from '@/lib/toast'
import { logger } from '@/lib/logger'
import { Disciplina } from '@/types'

interface PDFImportProps {
  onImport: (disciplinas: Disciplina[]) => void
}

export function PDFImport({ onImport }: PDFImportProps) {
  const [isParsing, setIsParsing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className="mb-8 bg-muted/30 border-dashed border-2">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <FileUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Importação Automática</h3>
              <p className="text-xs text-muted-foreground">
                Importe seu histórico do SIGAA (PDF) para preencher tudo em segundos.
              </p>
              <div className="mt-2 text-[10px] text-muted-foreground/80 leading-tight border-l-2 border-primary/20 pl-2">
                <strong>Como obter o PDF:</strong> Acesse o SIGAA {'>'} Menu Discente {'>'} Ensino {'>'} Emitir Histórico.
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
            <Button 
              onClick={triggerFileInput} 
              disabled={isParsing}
              variant="outline"
              size="sm"
              className="w-full md:w-auto border-primary/20 hover:bg-primary/5"
            >
              {isParsing ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <FileUp className="mr-2 h-3 w-3" />
                  Selecionar PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
