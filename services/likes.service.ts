import { getDoc, runTransaction } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { refs } from '@/lib/firebase/collection-refs'

export async function isLiked(materialId: string, userId: string): Promise<boolean> {
  if (!db) return false
  try {
    const snap = await getDoc(refs.materialSubDoc(materialId, 'likes', userId))
    return snap.exists()
  } catch {
    return false
  }
}

export async function addLike(materialId: string, userId: string): Promise<void> {
  if (!db) return
  await runTransaction(db, async (tx) => {
    const likeRef = refs.materialSubDoc(materialId, 'likes', userId)
    const materialRef = refs.material(materialId)

    const likeSnap = await tx.get(likeRef)
    if (likeSnap.exists()) return // already liked — idempotent

    const matSnap = await tx.get(materialRef)
    const current: number = matSnap.data()?.likesCount ?? 0

    tx.set(likeRef, { likedAt: new Date() })
    tx.update(materialRef, { likesCount: current + 1 })
  })
}

export async function removeLike(materialId: string, userId: string): Promise<void> {
  if (!db) return
  await runTransaction(db, async (tx) => {
    const likeRef = refs.materialSubDoc(materialId, 'likes', userId)
    const materialRef = refs.material(materialId)

    const likeSnap = await tx.get(likeRef)
    if (!likeSnap.exists()) return // not liked — idempotent

    const matSnap = await tx.get(materialRef)
    const current: number = matSnap.data()?.likesCount ?? 0

    tx.delete(likeRef)
    tx.update(materialRef, { likesCount: Math.max(0, current - 1) })
  })
}
