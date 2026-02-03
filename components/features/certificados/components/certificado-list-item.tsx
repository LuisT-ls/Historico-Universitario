import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Certificado } from '@/types'
import { TIPOS_CERTIFICADO, getStatusLabel } from '../constants'

interface CertificadoListItemProps {
    certificado: Certificado
    onView: (certificado: Certificado) => void
    onEdit: (certificado: Certificado) => void
    onDelete: (id: string) => void
}

export const CertificadoListItem = memo<CertificadoListItemProps>(
    ({ certificado, onView, onEdit, onDelete }) => {
        return (
            <tr className="border-b border-border/30 hover:bg-muted/20 transition-colors group">
                <td className="p-3">
                    <div
                        className={cn(
                            'h-2 w-2 rounded-full',
                            certificado.status === 'aprovado'
                                ? 'bg-green-500'
                                : certificado.status === 'pendente'
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                        )}
                        title={getStatusLabel(certificado.status)}
                    />
                </td>
                <td className="p-3 font-semibold text-xs max-w-[200px] truncate">{certificado.titulo}</td>
                <td className="p-3 text-xs text-muted-foreground truncate max-w-[150px]">
                    {certificado.instituicao}
                </td>
                <td className="p-3 text-xs font-black text-center">{certificado.cargaHoraria}h</td>
                <td className="p-3 text-xs">
                    <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground uppercase">
                        {TIPOS_CERTIFICADO.find((t) => t.value === certificado.tipo)?.label ||
                            certificado.tipo}
                    </span>
                </td>
                <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md"
                            onClick={() => onView(certificado)}
                        >
                            <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md"
                            onClick={() => onEdit(certificado)}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(certificado.id || '')}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </td>
            </tr>
        )
    },
    (prevProps, nextProps) => {
        // Custom comparison para evitar re-renders desnecessários
        return prevProps.certificado.id === nextProps.certificado.id &&
            prevProps.certificado.titulo === nextProps.certificado.titulo &&
            prevProps.certificado.status === nextProps.certificado.status
    }
)

CertificadoListItem.displayName = 'CertificadoListItem'
