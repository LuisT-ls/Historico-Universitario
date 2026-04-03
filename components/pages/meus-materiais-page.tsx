'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Loader2, Plus, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MaterialCard } from '@/components/features/materiais/material-card'
import { getMeusMateriais } from '@/services/materials.service'
import { useAuth } from '@/components/auth-provider'
import type { Material } from '@/types'
import Link from 'next/link'

export function MeusMateriaisPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [materiais, setMateriais] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return }
    if (!user) return

    getMeusMateriais(user.uid)
      .then(setMateriais)
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const totalDownloads = materiais.reduce((sum, m) => sum + m.downloadsCount, 0)

  return (
    <main className="container py-8 px-4 max-w-6xl">

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent dark:from-blue-500/10 dark:via-blue-500/5 dark:to-transparent border border-border/50 dark:border-slate-700/50 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-blue-500/15">
                <BookOpen className="h-6 w-6 text-primary dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-slate-100">
                  Meus Materiais
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie os materiais que você enviou
                </p>
              </div>
            </div>

            {materiais.length > 0 && (
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/70 dark:bg-slate-800/70 border border-border/50 dark:border-slate-700 text-xs text-muted-foreground backdrop-blur-sm">
                  <FileText className="h-3 w-3" />
                  <span className="font-medium text-foreground dark:text-slate-200">{materiais.length}</span>
                  {materiais.length === 1 ? 'material enviado' : 'materiais enviados'}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/70 dark:bg-slate-800/70 border border-border/50 dark:border-slate-700 text-xs text-muted-foreground backdrop-blur-sm">
                  <Download className="h-3 w-3" />
                  <span className="font-medium text-foreground dark:text-slate-200">{totalDownloads}</span>
                  downloads no total
                </div>
              </div>
            )}
          </div>

          <Link href="/materiais" className="shrink-0">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Enviar novo
            </Button>
          </Link>
        </div>
      </div>

      {/* Lista */}
      {materiais.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-foreground font-semibold">Nenhum material enviado ainda</p>
          <p className="text-sm text-muted-foreground mt-1">
            Compartilhe seus resumos, provas e apostilas com a comunidade.
          </p>
          <Link href="/materiais">
            <Button variant="outline" className="mt-5 gap-2">
              <Plus className="h-4 w-4" />
              Enviar primeiro material
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiais.map(m => (
            <MaterialCard key={m.id} material={m} showStatus />
          ))}
        </div>
      )}
    </main>
  )
}
