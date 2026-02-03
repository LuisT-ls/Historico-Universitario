import { memo } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface DeleteModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
}

export const DeleteModal = memo<DeleteModalProps>(({ open, onClose, onConfirm }) => {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Confirmar Exclusão
                    </DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja excluir este certificado?
                        <br />
                        <strong>Esta ação não pode ser desfeita.</strong>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
})

DeleteModal.displayName = 'DeleteModal'
