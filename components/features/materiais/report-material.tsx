'use client'

import { useState } from 'react'
import { Flag, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/auth-provider'
import { toast } from '@/lib/toast'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

const REASONS = [
  'Conteúdo incorreto ou desatualizado',
  'Violação de direitos autorais',
  'Conteúdo inapropriado',
  'Material duplicado',
  'Outro',
]

interface ReportMaterialProps {
  materialId: string
  materialTitle: string
}

export function ReportMaterial({ materialId, materialTitle }: ReportMaterialProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!user) { toast.error('Faça login para denunciar.'); return }
    if (!reason) { toast.error('Selecione um motivo.'); return }
    setSubmitting(true)
    try {
      await addDoc(collection(db!, 'reports'), {
        materialId,
        materialTitle,
        reportedBy: user.uid,
        reason,
        details: details.trim() || null,
        createdAt: new Date(),
      })
      toast.success('Denúncia enviada. Obrigado!')
      setOpen(false)
      setReason('')
      setDetails('')
    } catch {
      toast.error('Erro ao enviar denúncia.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-destructive transition-colors"
      >
        <Flag className="h-3 w-3" />
        Denunciar material
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md dark:border-slate-700 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-destructive" />
              Denunciar Material
            </DialogTitle>
            <DialogDescription>
              Selecione o motivo da denúncia. Nossa equipe irá analisar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              {REASONS.map(r => (
                <label
                  key={r}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    reason === r
                      ? 'border-destructive/50 bg-destructive/5 dark:border-red-700/50 dark:bg-red-900/10'
                      : 'border-border dark:border-slate-700 hover:border-muted-foreground/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-destructive"
                  />
                  <span className="text-sm">{r}</span>
                </label>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="report-details">Detalhes adicionais (opcional)</Label>
              <Textarea
                id="report-details"
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Descreva o problema com mais detalhes..."
                rows={3}
                className="resize-none"
                maxLength={500}
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1 gap-2"
                onClick={handleSubmit}
                disabled={submitting || !reason}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar Denúncia
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
