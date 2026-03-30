'use client'

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
import { useState } from 'react'
import { Loader2, KeyRound } from 'lucide-react'

interface JoinGroupDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onJoin: (code: string) => Promise<boolean>
}

/**
 * Diálogo para entrar em um grupo existente usando o código de convite de 6 dígitos.
 */
export function JoinGroupDialog({ open, onOpenChange, onJoin }: JoinGroupDialogProps) {
    const [code, setCode] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleJoin = async () => {
        if (!code || code.length < 6) return
        
        setIsSubmitting(true)
        const success = await onJoin(code)
        setIsSubmitting(false)
        
        if (success) {
            setCode('')
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <KeyRound className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center">Entrar em Grupo</DialogTitle>
                    <DialogDescription className="text-center px-4">
                        Insira o código de convite de 6 caracteres fornecido pelo seu colega para acessar o grupo.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-8">
                    <div className="grid gap-3">
                        <Label htmlFor="inviteCode" className="text-center font-semibold text-muted-foreground uppercase text-[10px] tracking-widest">
                            Código de Convite
                        </Label>
                        <Input
                            id="inviteCode"
                            placeholder="ABC123"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            disabled={isSubmitting}
                            className="text-center font-mono text-3xl tracking-[0.5rem] uppercase h-16 rounded-2xl border-2 focus-visible:ring-primary/20"
                        />
                    </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleJoin} 
                        disabled={isSubmitting || code.length < 6}
                        className="flex-1 min-w-[140px] shadow-lg shadow-primary/10"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Entrando...
                            </>
                        ) : (
                            'Entrar no Grupo'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
