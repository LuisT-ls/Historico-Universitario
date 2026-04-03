'use client'

import { useEffect, useState } from 'react'
import { ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { isLiked, addLike, removeLike } from '@/services/likes.service'
import { toast } from '@/lib/toast'

interface LikeButtonProps {
  materialId: string
  initialCount: number
}

export function LikeButton({ materialId, initialCount }: LikeButtonProps) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    isLiked(materialId, user.uid).then(setLiked)
  }, [user, materialId])

  async function toggle() {
    if (!user) { toast.error('Faça login para curtir materiais.'); return }
    setLoading(true)
    try {
      if (liked) {
        await removeLike(materialId, user.uid)
        setLiked(false)
        setCount(c => Math.max(0, c - 1))
      } else {
        await addLike(materialId, user.uid)
        setLiked(true)
        setCount(c => c + 1)
      }
    } catch {
      toast.error('Erro ao atualizar curtida.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={`gap-2 transition-colors ${liked ? 'text-blue-600 border-blue-300 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:border-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/30' : ''}`}
    >
      <ThumbsUp className="h-4 w-4" />
      <span>{count > 0 ? count : ''} {count === 1 ? 'curtida' : 'curtidas'}</span>
    </Button>
  )
}
