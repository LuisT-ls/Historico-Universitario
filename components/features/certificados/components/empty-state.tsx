import { memo } from 'react'
import { GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
    hasFilters: boolean
    onClearFilters: () => void
}

export const EmptyState = memo<EmptyStateProps>(({ hasFilters, onClearFilters }) => {
    return (
        <div className="text-center py-16 bg-muted/10 rounded-2xl border border-dashed border-border/50">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
                {hasFilters
                    ? 'Nenhum certificado encontrado com esses filtros'
                    : 'Comece adicionando seu primeiro certificado ou atividade complementar'}
            </p>
            {hasFilters && (
                <Button variant="link" onClick={onClearFilters} className="mt-2 text-primary">
                    Limpar filtros
                </Button>
            )}
        </div>
    )
})

EmptyState.displayName = 'EmptyState'
