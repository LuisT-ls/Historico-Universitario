'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Loader2, CheckCircle2, XCircle, FileText, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getMateriaisPendentes, updateMaterialStatus } from '@/services/materials.service'
import { getUserRole } from '@/services/firestore.service'
import { useAuth } from '@/components/auth-provider'
import { toast } from '@/lib/toast'
import type { Material } from '@/types'
import { TIPO_MATERIAL_LABELS, CURSO_LABELS } from '@/lib/materiais-constants'

export function AdminMateriaisPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [materiais, setMateriais] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login'); return }

    getUserRole(user.uid).then(role => {
      if (role !== 'admin') { router.replace('/'); return }
      return getMateriaisPendentes()
    }).then(data => {
      if (data) setMateriais(data)
    }).finally(() => setLoading(false))
  }, [user, authLoading, router])

  async function handleAction(id: string, status: 'approved' | 'rejected') {
    setActionId(id)
    try {
      await updateMaterialStatus(id, status)
      setMateriais(prev => prev.filter(m => m.id !== id))
      toast.success(status === 'approved' ? 'Material aprovado!' : 'Material rejeitado.')
    } catch {
      toast.error('Erro ao processar ação.')
    } finally {
      setActionId(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <main className="container py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-primary/10 dark:bg-blue-500/10">
          <ShieldCheck className="h-6 w-6 text-primary dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-slate-100">
            Aprovação de Materiais
          </h1>
          <p className="text-sm text-muted-foreground">
            {materiais.length} {materiais.length === 1 ? 'material pendente' : 'materiais pendentes'}
          </p>
        </div>
      </div>

      {/* Lista */}
      {materiais.length === 0 ? (
        <div className="text-center py-24">
          <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">Nenhum material aguardando aprovação.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {materiais.map(m => (
            <Card key={m.id} className="dark:border-slate-700 dark:bg-slate-800/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="shrink-0 mt-0.5 p-2 rounded-lg bg-primary/10 dark:bg-blue-500/10">
                      <FileText className="h-4 w-4 text-primary dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground dark:text-slate-100 truncate">
                        {m.titulo}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {CURSO_LABELS[m.curso] ?? m.curso} · {m.disciplina} · {m.semestre} · {TIPO_MATERIAL_LABELS[m.tipo]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Enviado por {m.uploaderName ?? 'Anônimo'}
                        {m.createdAt && ` em ${new Intl.DateTimeFormat('pt-BR').format(m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt))}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={actionId === m.id}
                      onClick={() => handleAction(m.id!, 'approved')}
                      className="gap-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700"
                    >
                      {actionId === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={actionId === m.id}
                      onClick={() => handleAction(m.id!, 'rejected')}
                      className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
