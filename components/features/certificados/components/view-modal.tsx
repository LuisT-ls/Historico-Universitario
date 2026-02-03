import { memo } from 'react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Eye, Download } from 'lucide-react'
import type { Certificado } from '@/types'
import { TIPOS_CERTIFICADO, getStatusColor, getStatusLabel } from '../constants'

interface ViewModalProps {
    certificado: Certificado | null
    open: boolean
    onClose: () => void
    onDownload: (certificado: Certificado) => void
}

export const ViewModal = memo<ViewModalProps>(({ certificado, open, onClose, onDownload }) => {
    if (!certificado) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Visualizar Certificado
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Título</Label>
                            <p className="font-medium">{certificado.titulo}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Tipo</Label>
                            <p className="font-medium">
                                {TIPOS_CERTIFICADO.find((t) => t.value === certificado.tipo)?.label ||
                                    certificado.tipo}
                            </p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Instituição</Label>
                            <p className="font-medium">{certificado.instituicao}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Carga Horária</Label>
                            <p className="font-medium">{certificado.cargaHoraria}h</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Data de Início</Label>
                            <p className="font-medium">
                                {new Date(certificado.dataInicio).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Data de Conclusão</Label>
                            <p className="font-medium">
                                {certificado.dataFim
                                    ? new Date(certificado.dataFim).toLocaleDateString('pt-BR')
                                    : '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Status</Label>
                            <p className="font-medium">
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(
                                        certificado.status
                                    )}`}
                                >
                                    {getStatusLabel(certificado.status)}
                                </span>
                            </p>
                        </div>
                    </div>
                    {certificado.descricao && (
                        <div>
                            <Label className="text-muted-foreground">Descrição</Label>
                            <p className="text-sm">{certificado.descricao}</p>
                        </div>
                    )}
                    {certificado.linkExterno && (
                        <div className="pt-2">
                            <Label className="text-muted-foreground">Link do Comprovante</Label>
                            <p className="text-sm break-all">
                                <a
                                    href={certificado.linkExterno}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    {certificado.linkExterno}
                                </a>
                            </p>
                        </div>
                    )}
                    {certificado.arquivoURL && (
                        <div className="pt-4 border-t">
                            <iframe
                                src={certificado.arquivoURL}
                                className="w-full h-96 border rounded"
                                title="Visualização do certificado"
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Fechar
                    </Button>
                    {(certificado.linkExterno || certificado.arquivoURL) && (
                        <Button onClick={() => onDownload(certificado)}>
                            <Download className="mr-2 h-4 w-4" />
                            Abrir Comprovante
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
})

ViewModal.displayName = 'ViewModal'
