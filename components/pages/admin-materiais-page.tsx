'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Loader2, FileText, Trash2, Pencil, BookOpen, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { getAllMateriais, deleteMaterial } from '@/services/materials.service'
import { getUserRole } from '@/services/firestore.service'
import { EditMaterialDialog } from '@/components/features/materiais/edit-material-dialog'
import { useAuth } from '@/components/auth-provider'
import { toast } from '@/lib/toast'
import type { Material } from '@/types'
import { TIPO_MATERIAL_LABELS, CURSO_LABELS } from '@/lib/materiais-constants'

export function AdminMateriaisPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [materiais, setMateriais] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login'); return }

    getUserRole(user.uid).then(role => {
      if (role !== 'admin') { router.replace('/'); return }
      return getAllMateriais()
    }).then(data => {
      if (data) setMateriais(data)
    }).finally(() => setLoading(false))
  }, [user, authLoading, router])

  async function handleDelete(material: Material) {
    if (!window.confirm(`Excluir "${material.titulo}"?`)) return
    setDeletingId(material.id!)
    try {
      await deleteMaterial(material.id!, material.storagePath)
      setMateriais(prev => prev.filter(m => m.id !== material.id))
      toast.success('Material excluído.')
    } catch {
      toast.error('Erro ao excluir material.')
    } finally {
      setDeletingId(null)
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
    <main className="container py-8 px-4 max-w-4xl">
      <Link href="/materiais">
        <Button variant="ghost" size="sm" className="gap-2 mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar para materiais
        </Button>
      </Link>

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent dark:from-blue-500/10 dark:via-blue-500/5 dark:to-transparent border border-border/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-blue-500/15">
            <ShieldCheck className="h-6 w-6 text-primary dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-slate-100">
              Gerenciar Materiais
            </h1>
            <p className="text-sm text-muted-foreground">
              {materiais.length} {materiais.length === 1 ? 'material' : 'materiais'} no total
            </p>
          </div>
        </div>
      </div>

      {/* Lista */}
      {materiais.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-foreground font-semibold">Nenhum material cadastrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {materiais.map(m => (
            <Card key={m.id} className="dark:border-slate-700 dark:bg-slate-800/50 transition-all duration-150 hover:shadow-md">
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
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Enviado por {m.uploaderName ?? 'Anônimo'}
                        {m.createdAt && ` · ${new Intl.DateTimeFormat('pt-BR').format(m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt))}`}
                        {' · '}{m.downloadsCount} downloads
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingMaterial(m)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={deletingId === m.id}
                      onClick={() => handleDelete(m)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      aria-label="Excluir"
                    >
                      {deletingId === m.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingMaterial && (
        <EditMaterialDialog
          material={editingMaterial}
          open={!!editingMaterial}
          onOpenChange={(open) => { if (!open) setEditingMaterial(null) }}
          onSaved={(updated) => {
            setMateriais(prev =>
              prev.map(m => m.id === editingMaterial.id ? { ...m, ...updated } : m)
            )
            setEditingMaterial(null)
          }}
        />
      )}
    </main>
  )
}
