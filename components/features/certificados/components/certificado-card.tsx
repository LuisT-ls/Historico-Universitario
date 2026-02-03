import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, Pencil, Download, Trash2, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Certificado } from '@/types'
import { TIPOS_CERTIFICADO, getStatusLabel } from '../constants'

interface CertificadoCardProps {
    certificado: Certificado
    onView: (certificado: Certificado) => void
    onEdit: (certificado: Certificado) => void
    onDelete: (id: string) => void
    onDownload?: (certificado: Certificado) => void
}

export const CertificadoCard = memo<CertificadoCardProps>(
    ({ certificado, onView, onEdit, onDelete, onDownload }) => {
        const hasDownload = certificado.linkExterno || certificado.arquivoURL

        return (
            <Card className="group relative rounded-xl border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-card overflow-hidden">
                {/* Badge de Status Discreto */}
                <div
                    className={cn(
                        'absolute top-3 right-3 h-2 w-2 rounded-full shadow-sm z-10',
                        certificado.status === 'aprovado'
                            ? 'bg-green-500 shadow-green-500/50'
                            : certificado.status === 'pendente'
                                ? 'bg-yellow-500 shadow-yellow-500/50'
                                : 'bg-red-500 shadow-red-500/50'
                    )}
                    title={getStatusLabel(certificado.status)}
                />

                <CardContent className="p-4 pt-5">
                    <div className="space-y-3">
                        <div className="min-w-0">
                            <h3
                                className="font-bold text-sm leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1"
                                title={certificado.titulo}
                            >
                                {certificado.titulo}
                            </h3>
                            <p className="text-[11px] text-muted-foreground font-medium truncate">
                                {certificado.instituicao}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                                    Carga Horária
                                </span>
                                <span className="text-xs font-black text-foreground">{certificado.cargaHoraria}h</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                                    Categoria
                                </span>
                                <span className="text-xs font-bold text-foreground truncate">
                                    {TIPOS_CERTIFICADO.find((t) => t.value === certificado.tipo)?.label ||
                                        certificado.tipo}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 flex-1 text-[11px] font-bold rounded-lg bg-primary/5 text-primary hover:bg-primary/10"
                                onClick={() => onView(certificado)}
                            >
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                Detalhes
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted">
                                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                    <DropdownMenuItem onClick={() => onEdit(certificado)} className="gap-2 cursor-pointer">
                                        <Pencil className="h-4 w-4" />
                                        <span>Editar</span>
                                    </DropdownMenuItem>
                                    {hasDownload && onDownload && (
                                        <DropdownMenuItem
                                            onClick={() => onDownload(certificado)}
                                            className="gap-2 cursor-pointer"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span>Download</span>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        onClick={() => onDelete(certificado.id || '')}
                                        className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Excluir</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    },
    (prevProps, nextProps) => {
        // Custom comparison para evitar re-renders desnecessários
        return (
            prevProps.certificado.id === nextProps.certificado.id &&
            prevProps.certificado.titulo === nextProps.certificado.titulo &&
            prevProps.certificado.status === nextProps.certificado.status &&
            prevProps.certificado.cargaHoraria === nextProps.certificado.cargaHoraria
        )
    }
)

CertificadoCard.displayName = 'CertificadoCard'
