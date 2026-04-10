'use client'

import { memo, useState } from 'react'
import {
    Loader2, Plus, Trash2, ZoomIn, ZoomOut, Maximize2,
    Save, Maximize, Minimize, ImageDown, Wand2, Undo2, Redo2,
} from 'lucide-react'
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
    isFullscreen: boolean
    canUndo: boolean
    canRedo: boolean
    onAddNode: () => void
    onClearAll: () => void
    onZoomIn: () => void
    onZoomOut: () => void
    onFitView: () => void
    onToggleFullscreen: () => void
    onExport: () => void
    onAutoLayout: () => void
    onUndo: () => void
    onRedo: () => void
}

// Separador vertical reutilizável
function Sep() {
    return <div className="w-px h-5 bg-border/60 mx-0.5 sm:mx-1 shrink-0" aria-hidden="true" />
}

function MindMapToolbarInner({
    isSaving,
    hasNodes,
    isFullscreen,
    canUndo,
    canRedo,
    onAddNode,
    onClearAll,
    onZoomIn,
    onZoomOut,
    onFitView,
    onToggleFullscreen,
    onExport,
    onAutoLayout,
    onUndo,
    onRedo,
}: MindMapToolbarProps) {
    const [confirmClear, setConfirmClear] = useState(false)

    return (
        <>
            {/*
             * A barra flutua no topo e é centralizada.
             * Em mobile: max-w contido na largura do canvas + overflow-x-auto caso necessário.
             * Em desktop: exibe todos os controles.
             */}
            <div
                className={cn(
                    'absolute top-3 left-1/2 -translate-x-1/2 z-10',
                    'flex items-center gap-0.5 sm:gap-1',
                    'px-1.5 sm:px-2 py-1 sm:py-1.5',
                    'max-w-[calc(100%-1rem)] overflow-x-auto scrollbar-none',
                    'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md',
                    'border border-border/60 rounded-2xl sm:rounded-[1.5rem]',
                    'shadow-lg shadow-slate-200/50 dark:shadow-none',
                )}
            >
                {/* ── Adicionar nó ── */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddNode}
                    className="gap-1.5 px-2 sm:px-4 font-black text-sm text-primary hover:bg-primary hover:text-primary-foreground transition-colors rounded-xl shrink-0"
                    aria-label="Adicionar nó"
                >
                    <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">Adicionar nó</span>
                </Button>

                <Sep />

                {/* ── Undo / Redo ── */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onUndo}
                    disabled={!canUndo}
                    className={cn(
                        'h-8 w-8 sm:h-9 sm:w-9 rounded-xl transition-colors shrink-0',
                        canUndo
                            ? 'text-foreground hover:text-primary hover:bg-primary/10'
                            : 'text-muted-foreground opacity-30 cursor-not-allowed'
                    )}
                    aria-label="Desfazer (Ctrl+Z)"
                    title="Desfazer (Ctrl+Z)"
                >
                    <Undo2 className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRedo}
                    disabled={!canRedo}
                    className={cn(
                        'h-8 w-8 sm:h-9 sm:w-9 rounded-xl transition-colors shrink-0',
                        canRedo
                            ? 'text-foreground hover:text-primary hover:bg-primary/10'
                            : 'text-muted-foreground opacity-30 cursor-not-allowed'
                    )}
                    aria-label="Refazer (Ctrl+Y)"
                    title="Refazer (Ctrl+Y)"
                >
                    <Redo2 className="h-4 w-4" aria-hidden="true" />
                </Button>

                <Sep />

                {/* ── Zoom (oculto em mobile — pinch-to-zoom substitui) ── */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onZoomIn}
                    className="hidden sm:inline-flex h-9 w-9 rounded-xl shrink-0"
                    aria-label="Aproximar"
                    title="Aproximar"
                >
                    <ZoomIn className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onZoomOut}
                    className="hidden sm:inline-flex h-9 w-9 rounded-xl shrink-0"
                    aria-label="Afastar"
                    title="Afastar"
                >
                    <ZoomOut className="h-4 w-4" aria-hidden="true" />
                </Button>

                {/* FitView: visível em todos os tamanhos */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onFitView}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl shrink-0"
                    aria-label="Ajustar ao canvas"
                    title="Ajustar ao canvas"
                >
                    <Maximize2 className="h-4 w-4" aria-hidden="true" />
                </Button>

                {/* ── Auto-layout (oculto em mobile) ── */}
                {hasNodes && (
                    <>
                        <Sep />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onAutoLayout}
                            className="hidden sm:inline-flex gap-2 px-3 font-semibold text-sm text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors rounded-xl shrink-0"
                            aria-label="Auto-organizar nós"
                            title="Organizar automaticamente"
                        >
                            <Wand2 className="h-4 w-4" aria-hidden="true" />
                            <span className="hidden md:inline">Organizar</span>
                        </Button>
                    </>
                )}

                <Sep />

                {/* ── Status de salvamento ── */}
                <div
                    className={cn(
                        'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-xl',
                        'text-xs font-semibold transition-all duration-300 select-none shrink-0',
                        isSaving
                            ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
                            : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                    )}
                    aria-live="polite"
                    aria-label={isSaving ? 'Salvando...' : 'Salvo automaticamente'}
                >
                    {isSaving
                        ? <Loader2 className="h-3 w-3 animate-spin shrink-0" aria-hidden="true" />
                        : <Save className="h-3 w-3 shrink-0" aria-hidden="true" />
                    }
                    <span className="hidden sm:inline">{isSaving ? 'Salvando...' : 'Salvo'}</span>
                </div>

                <Sep />

                {/* ── Exportar como PNG ── */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onExport}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl text-muted-foreground hover:text-foreground shrink-0"
                    aria-label="Exportar como imagem"
                    title="Exportar como imagem PNG"
                >
                    <ImageDown className="h-4 w-4" aria-hidden="true" />
                </Button>

                <Sep />

                {/* ── Fullscreen ── */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleFullscreen}
                    className={cn(
                        'h-8 w-8 sm:h-9 sm:w-9 rounded-xl transition-colors shrink-0',
                        isFullscreen
                            ? 'text-primary bg-primary/10 hover:bg-primary/20'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                    aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                    title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                >
                    {isFullscreen
                        ? <Minimize className="h-4 w-4" aria-hidden="true" />
                        : <Maximize className="h-4 w-4" aria-hidden="true" />
                    }
                </Button>

                {/* ── Limpar tudo (oculto em mobile — acessível pelo menu de contexto) ── */}
                {hasNodes && (
                    <>
                        <Sep />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setConfirmClear(true)}
                            className="hidden sm:inline-flex h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
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

export const MindMapToolbar = memo(MindMapToolbarInner)
