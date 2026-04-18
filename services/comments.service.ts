import { addDoc, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { refs } from '@/lib/firebase/collection-refs'
import type { MaterialComment } from '@/types'

export async function getComments(materialId: string): Promise<MaterialComment[]> {
  if (!db) return []
  try {
    const q = query(refs.materialSubCollection(materialId, 'comments'), orderBy('createdAt', 'asc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<MaterialComment, 'id'>),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
    }))
  } catch {
    return []
  }
}

export async function addComment(
  materialId: string,
  authorId: string,
  authorName: string,
  authorPhotoURL: string | undefined,
  text: string
): Promise<MaterialComment> {
  if (!db) throw new Error('Firestore não inicializado')
  const data: Omit<MaterialComment, 'id'> = {
    materialId,
    authorId,
    authorName,
    authorPhotoURL,
    text: text.trim(),
    createdAt: new Date(),
  }
  const docRef = await addDoc(refs.materialSubCollection(materialId, 'comments'), data)
  return { id: docRef.id, ...data }
}

export async function deleteComment(materialId: string, commentId: string): Promise<void> {
  if (!db) return
  await deleteDoc(refs.materialSubDoc(materialId, 'comments', commentId))
}
