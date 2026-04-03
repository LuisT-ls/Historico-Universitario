'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { getUserRating, setRating, removeRating } from '@/services/ratings.service'
import { toast } from '@/lib/toast'

interface StarRatingProps {
  materialId: string
  initialAvg?: number
  initialCount?: number
  readonly?: boolean
  size?: 'sm' | 'md'
}

export function StarRating({
  materialId,
  initialAvg = 0,
  initialCount = 0,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const { user } = useAuth()
  const [userRating, setUserRating] = useState<number | null>(null)
  const [avg, setAvg] = useState(initialAvg)
  const [count, setCount] = useState(initialCount)
  const [hovered, setHovered] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || readonly) return
    getUserRating(materialId, user.uid).then(setUserRating)
  }, [user, materialId, readonly])

  async function handleClick(star: number) {
    if (readonly) return
    if (!user) { toast.error('Faça login para avaliar materiais.'); return }
    if (loading) return

    setLoading(true)
    try {
      if (userRating === star) {
        // clicou na mesma estrela → remove avaliação
        await removeRating(materialId, user.uid)
        setAvg(prev => count > 1 ? (prev * count - star) / (count - 1) : 0)
        setCount(c => Math.max(0, c - 1))
        setUserRating(null)
      } else {
        const isNew = userRating === null
        await setRating(materialId, user.uid, star)
        if (isNew) {
          setAvg(prev => (prev * count + star) / (count + 1))
          setCount(c => c + 1)
        } else {
          setAvg(prev => (prev * count - (userRating ?? 0) + star) / count)
        }
        setUserRating(star)
      }
    } catch {
      toast.error('Erro ao salvar avaliação.')
    } finally {
      setLoading(false)
    }
  }

  const display = hovered ?? userRating ?? Math.round(avg)
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-sm'

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => !readonly && setHovered(null)}
        aria-label={`Avaliação: ${avg.toFixed(1)} de 5 (${count} ${count === 1 ? 'avaliação' : 'avaliações'})`}
      >
        {[1, 2, 3, 4, 5].map(star => {
          const filled = star <= display
          const isUserStar = star === userRating
          return (
            <button
              key={star}
              type="button"
              disabled={readonly || loading}
              onClick={() => handleClick(star)}
              onMouseEnter={() => !readonly && setHovered(star)}
              aria-label={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
              className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'} disabled:cursor-default`}
            >
              <Star
                className={`${starSize} transition-colors ${
                  filled
                    ? isUserStar
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-amber-300 text-amber-300'
                    : 'fill-transparent text-muted-foreground/40'
                }`}
              />
            </button>
          )
        })}
      </div>

      {count > 0 && (
        <span className={`${textSize} text-muted-foreground tabular-nums`}>
          {avg.toFixed(1)}
          <span className="text-muted-foreground/60"> ({count})</span>
        </span>
      )}

      {count === 0 && !readonly && (
        <span className={`${textSize} text-muted-foreground/60`}>Sem avaliações</span>
      )}
    </div>
  )
}
