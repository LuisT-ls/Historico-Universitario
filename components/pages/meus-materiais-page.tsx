'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Loader2, Plus } from 'lucide-react'
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

  return (
    <main className="container py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 dark:bg-blue-500/10">
            <BookOpen className="h-6 w-6 text-primary dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-slate-100">
              Meus Materiais
            </h1>
            <p className="text-sm text-muted-foreground">
              {materiais.length} {materiais.length === 1 ? 'material enviado' : 'materiais enviados'}
            </p>
          </div>
        </div>
        <Link href="/materiais/upload">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Enviar
          </Button>
        </Link>
      </div>

      {/* Lista */}
      {materiais.length === 0 ? (
        <div className="text-center py-24">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">Você ainda não enviou nenhum material.</p>
          <Link href="/materiais/upload">
            <Button variant="ghost" className="mt-4 gap-2">
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
