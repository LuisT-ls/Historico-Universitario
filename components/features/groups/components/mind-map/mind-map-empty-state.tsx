'use client'

import { Network, MousePointerClick } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MindMapEmptyStateProps {
    onAddFirstNode: () => void
}

export function MindMapEmptyState({ onAddFirstNode }: MindMapEmptyStateProps) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-none">
            <div className="flex flex-col items-center gap-4 text-center">
                {/* Ilustração */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center">
                        <Network className="w-12 h-12 text-primary/50" aria-hidden="true" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center animate-bounce">
                        <MousePointerClick className="w-4 h-4 text-primary" aria-hidden="true" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-black text-foreground">
                        Mapa Mental vazio
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground max-w-xs leading-relaxed">
                        Organize as ideias do grupo visualmente. Crie nós, conecte conceitos e colabore em tempo real.
                    </p>
                </div>

                <div className="pointer-events-auto">
                    <Button
                        onClick={onAddFirstNode}
                        className="rounded-2xl px-6 font-black gap-2 shadow-lg shadow-primary/20"
                    >
                        <Network className="w-4 h-4" aria-hidden="true" />
                        Criar primeiro nó
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground font-medium opacity-60 pointer-events-none">
                    <span className="hidden sm:inline">Dica: duplo clique no nó para editar</span>
                    <span className="sm:hidden">Dica: toque duplo no nó para editar</span>
                </p>
            </div>
        </div>
    )
}
