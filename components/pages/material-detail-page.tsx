'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Download, FileText, Loader2, Trash2,
  BookOpen, Calendar, User, Pencil, Eye, EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMaterialById, incrementDownloads, incrementViews, deleteMaterial, getRelatedMateriais } from '@/services/materials.service'
import { getUserRole } from '@/services/firestore.service'
import { useAuth } from '@/components/auth-provider'
import { EditMaterialDialog } from '@/components/features/materiais/edit-material-dialog'
import { LikeButton } from '@/components/features/materiais/like-button'
import { FavoriteButton } from '@/components/features/materiais/favorite-button'
import { ReportMaterial } from '@/components/features/materiais/report-material'
import { MaterialComments } from '@/components/features/materiais/material-comments'
import { MaterialCard } from '@/components/features/materiais/material-card'
import dynamic from 'next/dynamic'
import { ShareMaterial } from '@/components/features/materiais/share-material'
import { toast } from '@/lib/toast'
import type { Material, UserRole } from '@/types'
import { TIPO_MATERIAL_LABELS, CURSO_LABELS } from '@/lib/materiais-constants'
import Link from 'next/link'

const PdfPreview = dynamic(
  () => import('@/components/features/materiais/pdf-preview').then(m => m.PdfPreview),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-xl bg-muted/30" /> }
)

const TIPO_BADGE: Record<string, string> = {
  lista:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  apostila: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  prova:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  resumo:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  slides:   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  outro:    'bg-muted text-muted-foreground',
}

export function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const [material, setMaterial] = useState<Material | null>(null)
  const [related, setRelated] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>('usuario')
  const [previewOpen, setPreviewOpen] = useState(true)

  useEffect(() => {
    getMaterialById(id)
      .then(m => {
        setMaterial(m)
        if (m) {
          incrementViews(id)
          getRelatedMateriais(m.disciplina, id).then(setRelated)
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (user) getUserRole(user.uid).then(setUserRole).catch(() => {})
  }, [user])

  async function handleDownload() {
    if (!material?.arquivoURL) return
    await incrementDownloads(id)
    window.open(material.arquivoURL, '_blank', 'noopener,noreferrer')
    setMaterial(prev => prev ? { ...prev, downloadsCount: prev.downloadsCount + 1 } : prev)
  }

  async function handleDelete() {
    if (!material || !window.confirm('Tem certeza que deseja excluir este material?')) return
    setDeleting(true)
    try {
      await deleteMaterial(id, material.storagePath)
      toast.success('Material excluído.')
      router.push('/materiais')
    } catch {
      toast.error('Erro ao excluir material.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!material) {
    return (
      <div className="container py-12 px-4 text-center">
        <p className="text-muted-foreground">Material não encontrado.</p>
        <Link href="/materiais">
          <Button variant="ghost" className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" />Voltar
          </Button>
        </Link>
      </div>
    )
  }

  const isOwner = user?.uid === material.uploadedBy
  const isAdmin = userRole === 'admin'
  const canManage = isOwner || isAdmin

  const formattedDate = material.createdAt
    ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(
        material.createdAt instanceof Date ? material.createdAt : new Date(material.createdAt)
      )
    : '—'

  const materialUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://historicoacademico.vercel.app'}/materiais/${material.id}`

  return (
    <main className="container py-8 px-4 max-w-6xl space-y-10">

      {/* Breadcrumb / voltar */}
      <Link href="/materiais">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar para materiais
        </Button>
      </Link>

      {/* Cabeçalho — título e badges */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${TIPO_BADGE[material.tipo] ?? TIPO_BADGE.outro}`}>
            {TIPO_MATERIAL_LABELS[material.tipo]}
          </span>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            {CURSO_LABELS[material.curso] ?? material.curso}
          </span>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            {material.semestre}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-slate-100 leading-snug">
          {material.titulo}
        </h1>

        {material.descricao && (
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            {material.descricao}
          </p>
        )}
      </div>

      {/* Layout principal: preview + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

        {/* Coluna esquerda — preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground dark:text-slate-200 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Pré-visualização
            </span>
            <button
              onClick={() => setPreviewOpen(v => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {previewOpen ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {previewOpen ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          {previewOpen
            ? <PdfPreview url={material.arquivoURL} />
            : (
              <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-xl border border-dashed border-border dark:border-slate-700 text-muted-foreground/50">
                <FileText className="h-10 w-10" />
                <span className="text-sm">Preview oculto</span>
              </div>
            )
          }
        </div>

        {/* Coluna direita — sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-6">

          {/* Informações */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Informações
            </h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5 text-foreground/80 dark:text-slate-300">
                <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{material.disciplina}</span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground/80 dark:text-slate-300">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{material.uploaderName ?? 'Anônimo'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground/80 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground pt-1">
                <Download className="h-3.5 w-3.5 shrink-0" />
                <span>{material.downloadsCount} downloads · {material.viewsCount ?? 0} visualizações</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 dark:border-slate-700/50" />

          {/* Ações */}
          <div className="space-y-2.5">
            <Button onClick={handleDownload} className="w-full gap-2">
              <Download className="h-4 w-4" />
              Baixar PDF
            </Button>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <LikeButton materialId={id} initialCount={material.likesCount ?? 0} />
              </div>
              <FavoriteButton materialId={id} variant="full" />
              {canManage && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditOpen(true)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Editar material"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label="Excluir material"
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-border/50 dark:border-slate-700/50" />

          {/* Compartilhar */}
          <ShareMaterial title={material.titulo} materialUrl={materialUrl} />

          {/* Materiais relacionados */}
          {related.length > 0 && (
            <>
              <div className="border-t border-border/50 dark:border-slate-700/50" />
              <div className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Mesma disciplina
                </h2>
                <div className="space-y-2">
                  {related.map(m => <MaterialCard key={m.id} material={m} />)}
                </div>
              </div>
            </>
          )}

        </aside>
      </div>

      {/* Comentários — largura total */}
      <div className="border-t border-border/50 dark:border-slate-700/50 pt-8">
        <MaterialComments
          materialId={id}
          uploadedBy={material.uploadedBy}
          isAdmin={isAdmin}
        />
      </div>

      {/* Denúncia */}
      <div className="flex justify-center pb-4">
        <ReportMaterial materialId={id} materialTitle={material.titulo} />
      </div>

      {material && (
        <EditMaterialDialog
          material={material}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSaved={(updated) => setMaterial(prev => prev ? { ...prev, ...updated } : prev)}
        />
      )}
    </main>
  )
}
