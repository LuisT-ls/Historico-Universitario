'use client'

import { useState } from 'react'
import { PlusCircle, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { UploadMaterialForm } from '@/components/features/materiais/upload-form'
import { useAuth } from '@/components/auth-provider'
import Link from 'next/link'

interface AddMaterialSheetProps {
  onSuccess?: () => void
}

export function AddMaterialSheet({ onSuccess }: AddMaterialSheetProps) {
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)

  // Aguarda a auth carregar para evitar flash do botão de login
  if (loading) return null

  function handleSuccess() {
    setOpen(false)
    onSuccess?.()
  }

  // Usuário não autenticado: botão fixo que leva ao login
  if (!user) {
    return (
      <Link href="/login">
        <Button
          className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg z-40 sm:h-16 sm:w-16"
          size="icon"
          variant="outline"
          aria-label="Entrar para enviar material"
          title="Entre para enviar materiais"
        >
          <LogIn className="h-6 w-6" />
        </Button>
      </Link>
    )
  }

  // Usuário autenticado: FAB que abre o Sheet
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg z-40 sm:h-16 sm:w-16"
        size="icon"
        aria-label="Enviar material"
      >
        <PlusCircle className="h-8 w-8" />
      </Button>

      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto dark:border-slate-700 dark:bg-slate-900">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <PlusCircle className="h-6 w-6 text-primary" />
            Enviar Material
          </SheetTitle>
          <SheetDescription>
            Preencha os dados e selecione o PDF. O material será publicado após aprovação.
          </SheetDescription>
        </SheetHeader>

        <div className="pb-8">
          <UploadMaterialForm onSuccess={handleSuccess} bare />
        </div>
      </SheetContent>
    </Sheet>
  )
}
