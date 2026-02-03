import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Plus, Download, LayoutGrid, List } from 'lucide-react'
import type { Certificado } from '@/types'
import { CertificadoCard } from './certificado-card'
import { CertificadoListItem } from './certificado-list-item'
import { EmptyState } from './empty-state'
import { CertificadoFilters } from './certificado-filters'

interface CertificadoListProps {
    certificados: Certificado[]
    filteredCertificados: Certificado[]
    isLoading: boolean
    viewMode: 'grid' | 'list'
    setViewMode: (mode: 'grid' | 'list') => void
    showForm: boolean
    setShowForm: (show: boolean) => void
    searchTerm: string
    setSearchTerm: (value: string) => void
    filterType: string
    setFilterType: (value: string) => void
    onView: (certificado: Certificado) => void
    onEdit: (certificado: Certificado) => void
    onDelete: (id: string) => void
    onDownload: (certificado: Certificado) => void
    onExport: () => void
}

export const CertificadoList = memo<CertificadoListProps>(
    ({
        certificados,
        filteredCertificados,
        isLoading,
        viewMode,
        setViewMode,
        showForm,
        setShowForm,
        searchTerm,
        setSearchTerm,
        filterType,
        setFilterType,
        onView,
        onEdit,
        onDelete,
        onDownload,
        onExport,
    }) => {
        const hasFilters = searchTerm !== '' || filterType !== 'todos'

        return (
            <Card className="rounded-2xl border-none shadow-sm bg-card overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle as="h2" className="flex items-center gap-2 text-xl font-bold">
                                <FileText className="h-5 w-5 text-primary" />
                                Meus Certificados
                            </CardTitle>
                            <CardDescription>
                                {certificados.length === 0
                                    ? 'Comece adicionando seu primeiro certificado'
                                    : `${certificados.length} certificado(s) cadastrado(s)`}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-muted/50 rounded-lg p-1 mr-2">
                                <Button
                                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    className="h-8 w-8 rounded-md"
                                    onClick={() => setViewMode('grid')}
                                    title="Visualização em Grade"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    className="h-8 w-8 rounded-md"
                                    onClick={() => setViewMode('list')}
                                    title="Visualização em Lista"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                            {certificados.length > 0 && (
                                <Button variant="outline" size="sm" onClick={onExport} className="h-9 rounded-lg">
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar
                                </Button>
                            )}
                            <Button size="sm" onClick={() => setShowForm(!showForm)} className="h-9 rounded-lg">
                                <Plus className="mr-2 h-4 w-4" />
                                {showForm ? 'Cancelar' : 'Adicionar'}
                            </Button>
                        </div>
                    </div>

                    {/* Barra de Filtros */}
                    {certificados.length > 0 && (
                        <CertificadoFilters
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            filterType={filterType}
                            setFilterType={setFilterType}
                        />
                    )}
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="rounded-xl border-border/50">
                                    <CardContent className="p-4 space-y-4">
                                        <div className="flex justify-between">
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-5 w-3/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <Skeleton className="h-3 w-full" />
                                            <Skeleton className="h-3 w-2/3" />
                                        </div>
                                        <div className="flex gap-2 pt-2 border-t border-border/50">
                                            <Skeleton className="h-8 flex-1 rounded-lg" />
                                            <Skeleton className="h-8 w-8 rounded-lg" />
                                            <Skeleton className="h-8 w-8 rounded-lg" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : filteredCertificados.length === 0 ? (
                        <EmptyState
                            hasFilters={hasFilters}
                            onClearFilters={() => {
                                setSearchTerm('')
                                setFilterType('todos')
                            }}
                        />
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCertificados.map((certificado) => (
                                <CertificadoCard
                                    key={certificado.id}
                                    certificado={certificado}
                                    onView={onView}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onDownload={onDownload}
                                />
                            ))}
                        </div>
                    ) : (
                        /* Visualização em Lista (Tabela Compacta) */
                        <div className="overflow-x-auto rounded-xl border border-border/50">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border/50 text-left">
                                        <th className="p-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                                            Status
                                        </th>
                                        <th className="p-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                                            Título
                                        </th>
                                        <th className="p-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                                            Instituição
                                        </th>
                                        <th className="p-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground text-center">
                                            CH
                                        </th>
                                        <th className="p-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                                            Categoria
                                        </th>
                                        <th className="p-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground text-right">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCertificados.map((certificado) => (
                                        <CertificadoListItem
                                            key={certificado.id}
                                            certificado={certificado}
                                            onView={onView}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }
)

CertificadoList.displayName = 'CertificadoList'
