import { doc, setDoc, deleteDoc, getDoc, increment, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

function likeRef(materialId: string, userId: string) {
  return doc(db!, 'materiais', materialId, 'likes', userId)
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
  await setDoc(likeRef(materialId, userId), { likedAt: new Date() })
  await updateDoc(doc(db, 'materiais', materialId), { likesCount: increment(1) })
}

export async function removeLike(materialId: string, userId: string): Promise<void> {
  if (!db) return
  await deleteDoc(likeRef(materialId, userId))
  await updateDoc(doc(db, 'materiais', materialId), { likesCount: increment(-1) })
}
