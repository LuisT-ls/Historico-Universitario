'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Loader2, FileText, Trash2, Pencil, BookOpen, ArrowLeft, Flag, CheckCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { getAllMateriais, deleteMaterial } from '@/services/materials.service'
import { getReports, dismissReport, type Report } from '@/services/reports.service'
import { getUserRole } from '@/services/firestore.service'
import { EditMaterialDialog } from '@/components/features/materiais/edit-material-dialog'
import { useAuth } from '@/components/auth-provider'
import { toast } from '@/lib/toast'
import type { Material } from '@/types'
import { TIPO_MATERIAL_LABELS, CURSO_LABELS } from '@/lib/materiais-constants'

type Tab = 'materiais' | 'denuncias'

export function AdminMateriaisPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('materiais')
  const [materiais, setMateriais] = useState<Material[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dismissingId, setDismissingId] = useState<string | null>(null)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login'); return }

    getUserRole(user.uid).then(role => {
      if (role !== 'admin') { router.replace('/'); return }
      return Promise.all([getAllMateriais(), getReports()])
    }).then(data => {
      if (data) {
        setMateriais(data[0])
        setReports(data[1])
      }
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

  async function handleDismiss(report: Report) {
    setDismissingId(report.id)
    try {
      await dismissReport(report.id)
      setReports(prev => prev.filter(r => r.id !== report.id))
      toast.success('Denúncia arquivada.')
    } catch {
      toast.error('Erro ao arquivar denúncia.')
    } finally {
      setDismissingId(null)
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
      <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent dark:from-blue-500/10 dark:via-blue-500/5 dark:to-transparent border border-border/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-blue-500/15">
            <ShieldCheck className="h-6 w-6 text-primary dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-slate-100">
              Painel Admin
            </h1>
            <p className="text-sm text-muted-foreground">
              {materiais.length} {materiais.length === 1 ? 'material' : 'materiais'} · {reports.length} {reports.length === 1 ? 'denúncia pendente' : 'denúncias pendentes'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted/50 dark:bg-slate-800/50 p-1 rounded-xl border border-border/50 dark:border-slate-700/50 w-fit">
        <button
          onClick={() => setTab('materiais')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'materiais'
              ? 'bg-background dark:bg-slate-800 text-foreground dark:text-slate-100 shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" />
          Materiais
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-muted dark:bg-slate-700 text-muted-foreground">
            {materiais.length}
          </span>
        </button>
        <button
          onClick={() => setTab('denuncias')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'denuncias'
              ? 'bg-background dark:bg-slate-800 text-foreground dark:text-slate-100 shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Flag className="h-4 w-4" />
          Denúncias
          {reports.length > 0 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold">
              {reports.length}
            </span>
          )}
        </button>
      </div>

      {/* Aba: Materiais */}
      {tab === 'materiais' && (
        materiais.length === 0 ? (
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
                      <Link href={`/materiais/${m.id}`} target="_blank">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Ver material">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
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
        )
      )}

      {/* Aba: Denúncias */}
      {tab === 'denuncias' && (
        reports.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
              <Flag className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-foreground font-semibold">Nenhuma denúncia pendente.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(r => (
              <Card key={r.id} className="dark:border-slate-700 dark:bg-slate-800/50 border-l-4 border-l-red-400 dark:border-l-red-500/60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                          {r.reason}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {r.createdAt
                            ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(r.createdAt)
                            : '—'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground dark:text-slate-200 truncate">
                        Material: {r.materialTitle}
                      </p>
                      {r.details && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{r.details}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground/60">uid: {r.reportedBy}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/materiais/${r.materialId}`} target="_blank">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Ver material">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={dismissingId === r.id}
                        onClick={() => handleDismiss(r)}
                        className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10"
                        aria-label="Arquivar denúncia"
                      >
                        {dismissingId === r.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <CheckCircle className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
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
