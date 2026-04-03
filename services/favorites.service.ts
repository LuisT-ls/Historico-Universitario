import { doc, setDoc, deleteDoc, getDoc, getDocs, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

function favRef(userId: string, materialId: string) {
  return doc(db!, 'users', userId, 'favorites', materialId)
}

export async function isFavorite(userId: string, materialId: string): Promise<boolean> {
  if (!db) return false
  try {
    const snap = await getDoc(favRef(userId, materialId))
    return snap.exists()
  } catch {
    return false
  }
}

export async function addFavorite(userId: string, materialId: string): Promise<void> {
  if (!db) return
  await setDoc(favRef(userId, materialId), { savedAt: new Date() })
}

export async function removeFavorite(userId: string, materialId: string): Promise<void> {
  if (!db) return
  await deleteDoc(favRef(userId, materialId))
}

export async function getFavoriteIds(userId: string): Promise<string[]> {
  if (!db) return []
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'favorites'))
    return snap.docs.map(d => d.id)
  } catch {
    return []
  }
}
