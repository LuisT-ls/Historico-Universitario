'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Paperclip, ExternalLink, FileText, Link2, Check } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getGroupMaterials } from '@/services/group.service'
import type { GroupMaterial, MindMapNodeAttachment } from '@/types'

interface AttachMaterialModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    groupId: string
    currentAttachments: MindMapNodeAttachment[]
    onConfirm: (attachments: MindMapNodeAttachment[]) => void
}

export function AttachMaterialModal({
    open,
    onOpenChange,
    groupId,
    currentAttachments,
    onConfirm,
}: AttachMaterialModalProps) {
    const [materials, setMaterials]   = useState<GroupMaterial[]>([])
    const [isLoading, setIsLoading]   = useState(false)
    const [selected, setSelected]     = useState<Set<string>>(new Set())

    // Carrega materiais ao abrir
    useEffect(() => {
        if (!open) return
        setIsLoading(true)
        getGroupMaterials(groupId)
            .then((mats) => setMaterials(mats))
            .finally(() => setIsLoading(false))
    }, [open, groupId])

    // Pré-seleciona os anexos atuais do nó
    useEffect(() => {
        if (open) {
            setSelected(new Set(currentAttachments.map((a) => a.id)))
        }
    }, [open, currentAttachments])

    const toggleMaterial = useCallback((id: string) => {
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }, [])

    const handleConfirm = useCallback(() => {
        const attachments: MindMapNodeAttachment[] = materials
            .filter((m) => m.id && selected.has(m.id))
            .map((m) => ({
                id:   m.id as string,
                name: m.title,
                url:  m.url,
            }))
        onConfirm(attachments)
        onOpenChange(false)
    }, [materials, selected, onConfirm, onOpenChange])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] rounded-[2rem]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-black">
                        <Paperclip className="h-5 w-5 text-primary" aria-hidden="true" />
                        Vincular Material
                    </DialogTitle>
                    <DialogDescription className="font-medium">
                        Selecione os materiais do grupo para associar a este nó.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-2 max-h-[320px] overflow-y-auto space-y-1 pr-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm font-medium">Carregando materiais...</span>
                        </div>
                    ) : materials.length === 0 ? (
                        <div className="text-center py-10 text-sm text-muted-foreground font-medium">
                            Nenhum material encontrado neste grupo.
                        </div>
                    ) : (
                        materials.map((material) => {
                            const id       = material.id as string
                            const isActive = selected.has(id)

                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => toggleMaterial(id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                                        isActive
                                            ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                                            : 'hover:bg-muted/60'
                                    }`}
                                >
                                    {material.type === 'link'
                                        ? <Link2 className="h-4 w-4 shrink-0 opacity-60" />
                                        : <FileText className="h-4 w-4 shrink-0 opacity-60" />
                                    }
                                    <span className="flex-1 text-sm font-semibold truncate">
                                        {material.title}
                                    </span>
                                    {isActive && (
                                        <Check className="h-4 w-4 shrink-0 text-primary" />
                                    )}
                                </button>
                            )
                        })
                    )}
                </div>

                <div className="flex gap-2 mt-4">
                    <Button
                        variant="ghost"
                        className="rounded-xl flex-1"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="rounded-xl flex-1"
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
                        Salvar vínculos ({selected.size})
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
