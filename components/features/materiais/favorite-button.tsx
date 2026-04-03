'use client'

import { useEffect, useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { isFavorite, addFavorite, removeFavorite } from '@/services/favorites.service'
import { toast } from '@/lib/toast'

interface FavoriteButtonProps {
  materialId: string
  variant?: 'icon' | 'full'
}

export function FavoriteButton({ materialId, variant = 'icon' }: FavoriteButtonProps) {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    isFavorite(user.uid, materialId).then(setSaved)
  }, [user, materialId])

  async function toggle() {
    if (!user) { toast.error('Faça login para salvar materiais.'); return }
    setLoading(true)
    try {
      if (saved) {
        await removeFavorite(user.uid, materialId)
        setSaved(false)
        toast.success('Removido dos favoritos.')
      } else {
        await addFavorite(user.uid, materialId)
        setSaved(true)
        toast.success('Salvo nos favoritos!')
      }
    } catch {
      toast.error('Erro ao atualizar favoritos.')
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'full') {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={toggle}
        disabled={loading}
        aria-label={saved ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
        className={`transition-colors ${saved ? 'text-amber-500 border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:hover:bg-amber-900/20' : ''}`}
      >
        {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      className={`transition-colors ${saved ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground hover:text-foreground'}`}
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
    </Button>
  )
}
