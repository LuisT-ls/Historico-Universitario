import { setDoc, deleteDoc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { refs } from '@/lib/firebase/collection-refs'

export async function isFavorite(userId: string, materialId: string): Promise<boolean> {
  if (!db) return false
  try {
    const snap = await getDoc(refs.userSubDoc(userId, 'favorites', materialId))
    return snap.exists()
  } catch {
    return false
  }
}

export async function addFavorite(userId: string, materialId: string): Promise<void> {
  if (!db) return
  await setDoc(refs.userSubDoc(userId, 'favorites', materialId), { savedAt: new Date() })
}

export async function removeFavorite(userId: string, materialId: string): Promise<void> {
  if (!db) return
  await deleteDoc(refs.userSubDoc(userId, 'favorites', materialId))
}

export async function getFavoriteIds(userId: string): Promise<string[]> {
  if (!db) return []
  try {
    const snap = await getDocs(refs.userSubCollection(userId, 'favorites'))
    return snap.docs.map(d => d.id)
  } catch {
    return []
  }
}
