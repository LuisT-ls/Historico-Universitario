'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PdfPreviewProps {
  url: string
}

export function PdfPreview({ url }: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null)

  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [pdfDoc, setPdfDoc] = useState<any>(null)

  // Carrega o documento uma vez
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

        const doc = await pdfjsLib.getDocument({ url, withCredentials: false }).promise
        if (cancelled) return
        setPdfDoc(doc)
        setTotalPages(doc.numPages)
      } catch {
        if (!cancelled) setError(true)
      }
    }

    load()
    return () => { cancelled = true }
  }, [url])

  // Renderiza a página atual no canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return

    let cancelled = false

    async function renderPage() {
      setLoading(true)
      try {
        // Cancela render anterior se ainda estiver em curso
        renderTaskRef.current?.cancel()

        const page = await pdfDoc.getPage(currentPage)
        if (cancelled) return

        const canvas = canvasRef.current!
        const container = canvas.parentElement!
        const containerWidth = container.clientWidth || 640

        const baseViewport = page.getViewport({ scale: 1 })
        const scale = containerWidth / baseViewport.width
        const viewport = page.getViewport({ scale })

        canvas.width = viewport.width
        canvas.height = viewport.height

        const ctx = canvas.getContext('2d')!
        const task = page.render({ canvasContext: ctx, viewport })
        renderTaskRef.current = task

        await task.promise
        if (!cancelled) setLoading(false)
      } catch (e: any) {
        // 'RenderingCancelledException' é esperado ao trocar de página rapidamente
        if (!cancelled && e?.name !== 'RenderingCancelledException') {
          setError(true)
          setLoading(false)
        }
      }
    }

    renderPage()
    return () => { cancelled = true }
  }, [pdfDoc, currentPage])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground rounded-lg border border-border dark:border-slate-700 bg-muted/30">
        <AlertCircle className="h-8 w-8 opacity-40" />
        <p className="text-sm">Não foi possível carregar o preview.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Canvas */}
      <div className="relative rounded-lg overflow-hidden border border-border dark:border-slate-700 bg-muted/20">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-auto block"
          aria-label={`Página ${currentPage} de ${totalPages}`}
        />
      </div>

      {/* Navegação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1 || loading}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages || loading}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
