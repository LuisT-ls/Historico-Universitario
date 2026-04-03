'use client'

import { useEffect, useState, useRef } from 'react'
import { MessageSquare, Send, Trash2, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/components/auth-provider'
import { getComments, addComment, deleteComment } from '@/services/comments.service'
import { toast } from '@/lib/toast'
import type { MaterialComment } from '@/types'

interface MaterialCommentsProps {
  materialId: string
  uploadedBy: string
  isAdmin: boolean
}

export function MaterialComments({ materialId, uploadedBy, isAdmin }: MaterialCommentsProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<MaterialComment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    getComments(materialId).then(setComments).finally(() => setLoading(false))
  }, [materialId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { toast.error('Faça login para comentar.'); return }
    if (!text.trim()) return
    setSubmitting(true)
    try {
      const newComment = await addComment(
        materialId,
        user.uid,
        user.displayName ?? user.email ?? 'Anônimo',
        user.photoURL ?? undefined,
        text
      )
      setComments(prev => [...prev, newComment])
      setText('')
      textareaRef.current?.focus()
    } catch {
      toast.error('Erro ao enviar comentário.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(commentId: string) {
    setDeletingId(commentId)
    try {
      await deleteComment(materialId, commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch {
      toast.error('Erro ao excluir comentário.')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (date?: Date) =>
    date
      ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
      : '—'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground dark:text-slate-200">
          Comentários
          {comments.length > 0 && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">({comments.length})</span>
          )}
        </span>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground/60">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhum comentário ainda. Seja o primeiro!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => {
            const canDelete = user?.uid === comment.authorId || user?.uid === uploadedBy || isAdmin
            return (
              <div
                key={comment.id}
                className="flex gap-3 p-3 rounded-xl bg-muted/40 dark:bg-slate-700/30 border border-border/40 dark:border-slate-700/40"
              >
                <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 dark:bg-blue-500/10 flex items-center justify-center overflow-hidden">
                  {comment.authorPhotoURL ? (
                    <img src={comment.authorPhotoURL} alt="" className="h-8 w-8 object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-primary dark:text-blue-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground dark:text-slate-200 truncate">
                      {comment.authorName}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 dark:text-slate-300 mt-0.5 leading-relaxed whitespace-pre-line break-words">
                    {comment.text}
                  </p>
                </div>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(comment.id!)}
                    disabled={deletingId === comment.id}
                    className="shrink-0 self-start text-muted-foreground/50 hover:text-destructive transition-colors"
                    aria-label="Excluir comentário"
                  >
                    {deletingId === comment.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />
                    }
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Escreva um comentário ou dúvida..."
            rows={2}
            className="resize-none flex-1 text-sm"
            maxLength={1000}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) }
            }}
          />
          <Button type="submit" size="icon" disabled={submitting || !text.trim()} className="shrink-0">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-3">
          <a href="/login" className="text-primary dark:text-blue-400 hover:underline">Faça login</a> para comentar.
        </p>
      )}
    </div>
  )
}
