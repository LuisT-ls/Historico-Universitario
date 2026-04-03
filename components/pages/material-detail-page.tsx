'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, FileText, Loader2, Trash2, BookOpen, Calendar, User, Pencil, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-lg bg-muted/30" /> }
)

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
          <Button variant="ghost" className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" />Voltar</Button>
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

  return (
    <main className="container py-8 px-4 max-w-2xl">
      <Link href="/materiais">
        <Button variant="ghost" size="sm" className="gap-2 mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar para materiais
        </Button>
      </Link>

      <Card className="dark:border-slate-700 dark:bg-slate-800/50 overflow-hidden">
        {/* Accent strip */}
        <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary/30 to-transparent dark:from-blue-500/60 dark:via-blue-500/30" />
        <CardContent className="p-6 space-y-6">
          {/* Ícone + Título */}
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 dark:bg-blue-500/10 shrink-0">
              <FileText className="h-7 w-7 text-primary dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground dark:text-slate-100 leading-snug">
                {material.titulo}
              </h1>
              {material.descricao && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {material.descricao}
                </p>
              )}
            </div>
          </div>

          {/* Metadados */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>{material.disciplina}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium text-foreground dark:text-slate-200">
                {TIPO_MATERIAL_LABELS[material.tipo]}
              </span>
            </div>
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground dark:text-slate-200">
                {CURSO_LABELS[material.curso] ?? material.curso}
              </span>
              {' · '}
              {material.semestre}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span>{material.uploaderName ?? 'Anônimo'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Download className="h-4 w-4 shrink-0" />
              <span>{material.downloadsCount} downloads · {material.viewsCount ?? 0} visualizações</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <button
              onClick={() => setPreviewOpen(v => !v)}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {previewOpen ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {previewOpen ? 'Ocultar preview' : 'Visualizar documento'}
            </button>
            {previewOpen && <PdfPreview url={material.arquivoURL} />}
          </div>

          {/* Compartilhar */}
          <div className="pt-2 border-t border-border/50 dark:border-slate-700/50">
            <ShareMaterial
              title={material.titulo}
              materialUrl={`${typeof window !== 'undefined' ? window.location.origin : 'https://historicoacademico.vercel.app'}/materiais/${material.id}`}
            />
          </div>

          {/* Ações */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/50 dark:border-slate-700/50">
            <Button onClick={handleDownload} className="flex-1 gap-2 min-w-[120px]">
              <Download className="h-4 w-4" />
              Baixar PDF
            </Button>
            <LikeButton materialId={id} initialCount={material.likesCount ?? 0} />
            <FavoriteButton materialId={id} variant="full" />
            {canManage && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditOpen(true)}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent"
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
        </CardContent>
      </Card>

      {/* Comentários */}
      <Card className="dark:border-slate-700 dark:bg-slate-800/50">
        <CardContent className="p-6">
          <MaterialComments
            materialId={id}
            uploadedBy={material.uploadedBy}
            isAdmin={isAdmin}
          />
        </CardContent>
      </Card>

      {/* Materiais relacionados */}
      {related.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground dark:text-slate-200 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            Outros materiais de {material.disciplina}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map(m => <MaterialCard key={m.id} material={m} />)}
          </div>
        </div>
      )}

      {/* Denúncia */}
      <div className="flex justify-center pb-2">
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
