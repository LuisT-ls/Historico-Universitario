import { memo } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { TIPOS_CERTIFICADO } from '../constants'

interface CertificadoFiltersProps {
    searchTerm: string
    setSearchTerm: (value: string) => void
    filterType: string
    setFilterType: (value: string) => void
}

export const CertificadoFilters = memo<CertificadoFiltersProps>(
    ({ searchTerm, setSearchTerm, filterType, setFilterType }) => {
        return (
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-4 border-t border-border/50">
                <div className="relative w-full sm:flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                        placeholder="Buscar por título ou instituição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="h-10 w-full sm:w-[200px] rounded-xl border-none bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                >
                    <option value="todos">Todas as categorias</option>
                    {TIPOS_CERTIFICADO.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                        </option>
                    ))}
                </select>
            </div>
        )
    }
)

CertificadoFilters.displayName = 'CertificadoFilters'
