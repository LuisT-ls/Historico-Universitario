'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createGroup } from '@/services/group.service'
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
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { UserId } from '@/types'

const groupSchema = z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(50, 'Nome muito longo'),
    description: z.string().max(300, 'Descrição muito longa').optional(),
    subjectCode: z.string().max(20, 'Código inválido').optional(),
})

type GroupFormValues = z.infer<typeof groupSchema>

interface CreateGroupDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    userId: string
}

/**
 * Diálogo para criação de um novo grupo de estudo.
 */
export function CreateGroupDialog({ open, onOpenChange, onSuccess, userId }: CreateGroupDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<GroupFormValues>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            name: '',
            description: '',
            subjectCode: '',
        },
    })

    const onSubmit = async (values: GroupFormValues) => {
        setIsSubmitting(true)
        try {
            await createGroup({
                name: values.name,
                description: values.description,
                subjectCode: values.subjectCode,
                ownerId: userId as UserId,
            })
            toast.success('Grupo criado com sucesso! Agora você já pode convidar seus colegas.')
            form.reset()
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            toast.error('Erro ao criar grupo. Tente novamente daqui a pouco.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Criar Grupo de Estudo</DialogTitle>
                        <DialogDescription>
                            Organize seus trabalhos e documentos em um espaço colaborativo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="font-semibold">Nome do Grupo *</Label>
                            <Input
                                id="name"
                                placeholder="Ex. Introdução à Computação"
                                {...form.register('name')}
                                className={form.formState.errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {form.formState.errors.name && (
                                <p className="text-[10px] uppercase font-bold text-destructive">{form.formState.errors.name.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="subjectCode" className="font-semibold">Código da Disciplina (Opcional)</Label>
                            <Input
                                id="subjectCode"
                                placeholder="Ex. CTIA01"
                                {...form.register('subjectCode')}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description" className="font-semibold">Descrição</Label>
                            <Textarea
                                id="description"
                                placeholder="Explique brevemente do que se trata este grupo..."
                                className="min-h-[100px] resize-none"
                                {...form.register('description')}
                            />
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
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                'Criar Grupo'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
