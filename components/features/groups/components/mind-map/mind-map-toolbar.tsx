'use client'

import { useState } from 'react'
import { Loader2, Plus, Trash2, ZoomIn, ZoomOut, Maximize2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface MindMapToolbarProps {
    isSaving: boolean
    hasNodes: boolean
    onAddNode: () => void
    onClearAll: () => void
    onZoomIn: () => void
    onZoomOut: () => void
    onFitView: () => void
}

export function MindMapToolbar({
    isSaving,
    hasNodes,
    onAddNode,
    onClearAll,
    onZoomIn,
    onZoomOut,
    onFitView,
}: MindMapToolbarProps) {
    const [confirmClear, setConfirmClear] = useState(false)

    return (
        <>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-border/60 rounded-[1.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none">
                {/* Adicionar nó */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddNode}
                    className="gap-2 px-4 font-black text-sm text-primary hover:bg-primary hover:text-primary-foreground transition-colors rounded-xl"
                    aria-label="Adicionar nó"
                >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Adicionar nó</span>
                </Button>

                <div className="w-px h-5 bg-border/60 mx-1" aria-hidden="true" />

                {/* Zoom controls */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onZoomIn}
                    className="h-9 w-9 rounded-xl"
                    aria-label="Aproximar"
                    title="Aproximar"
                >
                    <ZoomIn className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onZoomOut}
                    className="h-9 w-9 rounded-xl"
                    aria-label="Afastar"
                    title="Afastar"
                >
                    <ZoomOut className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onFitView}
                    className="h-9 w-9 rounded-xl"
                    aria-label="Ajustar tela"
                    title="Ajustar tela"
                >
                    <Maximize2 className="h-4 w-4" aria-hidden="true" />
                </Button>

                <div className="w-px h-5 bg-border/60 mx-1" aria-hidden="true" />

                {/* Status de salvamento */}
                <div
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-300 select-none',
                        isSaving
                            ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
                            : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                    )}
                    aria-live="polite"
                    aria-label={isSaving ? 'Salvando...' : 'Salvo automaticamente'}
                >
                    {isSaving
                        ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                        : <Save className="h-3 w-3" aria-hidden="true" />
                    }
                    <span className="hidden sm:inline">{isSaving ? 'Salvando...' : 'Salvo'}</span>
                </div>

                {/* Limpar tudo */}
                {hasNodes && (
                    <>
                        <div className="w-px h-5 bg-border/60 mx-1" aria-hidden="true" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setConfirmClear(true)}
                            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            aria-label="Limpar mapa"
                            title="Limpar mapa"
                        >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </>
                )}
            </div>

            {/* Confirmação de limpeza */}
            <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
                <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Limpar mapa mental?</DialogTitle>
                        <DialogDescription className="font-medium">
                            Todos os nós e conexões serão removidos permanentemente. Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 mt-2">
                        <Button variant="ghost" className="rounded-xl" onClick={() => setConfirmClear(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            className="rounded-xl"
                            onClick={() => { setConfirmClear(false); onClearAll() }}
                        >
                            Limpar tudo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
