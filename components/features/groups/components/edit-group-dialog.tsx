'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import type { Group } from '@/types'
import { useAuth } from '@/components/auth-provider'
import { getProfile } from '@/services/firestore.service'
import { CURSOS } from '@/lib/constants'

const editGroupSchema = z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(50, 'Nome muito longo'),
    description: z.string().max(300, 'Descrição muito longa').optional(),
    subjectCode: z.string().max(20, 'Código inválido').optional(),
})

type EditGroupFormValues = z.infer<typeof editGroupSchema>

interface EditGroupDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    group: Pick<Group, 'name' | 'description' | 'subjectCode'>
    onSave: (data: Partial<Pick<Group, 'name' | 'description' | 'subjectCode'>>) => Promise<void>
}

/**
 * Diálogo para editar nome, código da disciplina e descrição de um grupo.
 */
export function EditGroupDialog({ open, onOpenChange, group, onSave }: EditGroupDialogProps) {
    const { user } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [subjectPlaceholder, setSubjectPlaceholder] = useState('Ex. CTIA01')
    const [namePlaceholder, setNamePlaceholder] = useState('Ex. Introdução à Computação')

    useEffect(() => {
        if (!open || !user) return
        getProfile(user.uid).then(profile => {
            const cursoAtivo = profile?.cursos?.at(-1)
            if (cursoAtivo && CURSOS[cursoAtivo]?.instituto === 'HUMANIDADES') {
                setSubjectPlaceholder('Ex. HACA01')
                setNamePlaceholder('Ex. Estudos das Humanidades')
            } else {
                setSubjectPlaceholder('Ex. CTIA01')
                setNamePlaceholder('Ex. Introdução à Computação')
            }
        })
    }, [open, user])

    const form = useForm<EditGroupFormValues>({
        resolver: zodResolver(editGroupSchema),
        defaultValues: {
            name: group.name,
            description: group.description ?? '',
            subjectCode: group.subjectCode ?? '',
        },
    })

    // Sync form values when the group prop changes (e.g. real-time update from another member)
    useEffect(() => {
        if (open) {
            form.reset({
                name: group.name,
                description: group.description ?? '',
                subjectCode: group.subjectCode ?? '',
            })
        }
    }, [open, group, form])

    const onSubmit = async (values: EditGroupFormValues) => {
        setIsSubmitting(true)
        try {
            await onSave({
                name: values.name,
                description: values.description || undefined,
                subjectCode: values.subjectCode || undefined,
            })
            onOpenChange(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !isSubmitting && onOpenChange(o)}>
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Editar Grupo</DialogTitle>
                        <DialogDescription>
                            Atualize as informações do grupo. As alterações são visíveis para todos os membros.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name" className="font-semibold">Nome do Grupo *</Label>
                            <Input
                                id="edit-name"
                                placeholder={namePlaceholder}
                                {...form.register('name')}
                                className={form.formState.errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                                aria-invalid={!!form.formState.errors.name}
                                aria-describedby={form.formState.errors.name ? 'edit-name-error' : undefined}
                            />
                            {form.formState.errors.name && (
                                <p id="edit-name-error" className="text-[10px] uppercase font-bold text-destructive">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-subjectCode" className="font-semibold">Código da Disciplina (Opcional)</Label>
                            <Input
                                id="edit-subjectCode"
                                placeholder={subjectPlaceholder}
                                {...form.register('subjectCode')}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description" className="font-semibold">Descrição</Label>
                            <Textarea
                                id="edit-description"
                                placeholder="Explique brevemente do que se trata este grupo..."
                                className="min-h-[100px] resize-none"
                                {...form.register('description')}
                                aria-invalid={!!form.formState.errors.description}
                            />
                            {form.formState.errors.description && (
                                <p className="text-[10px] uppercase font-bold text-destructive">
                                    {form.formState.errors.description.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                    Salvando...
                                </>
                            ) : (
                                'Salvar Alterações'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
