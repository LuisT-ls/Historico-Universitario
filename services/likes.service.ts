import { doc, getDoc, runTransaction } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

function likeRef(materialId: string, userId: string) {
  return doc(db!, 'materiais', materialId, 'likes', userId)
}

function materialRef(materialId: string) {
  return doc(db!, 'materiais', materialId)
}

export async function isLiked(materialId: string, userId: string): Promise<boolean> {
  if (!db) return false
  try {
    const snap = await getDoc(likeRef(materialId, userId))
    return snap.exists()
  } catch {
    return false
  }
}

export async function addLike(materialId: string, userId: string): Promise<void> {
  if (!db) return
  await runTransaction(db, async (tx) => {
    const likeSnap = await tx.get(likeRef(materialId, userId))
    if (likeSnap.exists()) return // already liked — idempotent

    const matSnap = await tx.get(materialRef(materialId))
    const current: number = matSnap.data()?.likesCount ?? 0

    tx.set(likeRef(materialId, userId), { likedAt: new Date() })
    tx.update(materialRef(materialId), { likesCount: current + 1 })
  })
}

export async function removeLike(materialId: string, userId: string): Promise<void> {
  if (!db) return
  await runTransaction(db, async (tx) => {
    const likeSnap = await tx.get(likeRef(materialId, userId))
    if (!likeSnap.exists()) return // not liked — idempotent

    const matSnap = await tx.get(materialRef(materialId))
    const current: number = matSnap.data()?.likesCount ?? 0

    tx.delete(likeRef(materialId, userId))
    tx.update(materialRef(materialId), { likesCount: Math.max(0, current - 1) })
  })
}
