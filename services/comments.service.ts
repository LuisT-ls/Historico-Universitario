import {
  collection, addDoc, getDocs, deleteDoc, doc, query, orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { MaterialComment } from '@/types'

function commentsRef(materialId: string) {
  return collection(db!, 'materiais', materialId, 'comments')
}

export async function getComments(materialId: string): Promise<MaterialComment[]> {
  if (!db) return []
  try {
    const q = query(commentsRef(materialId), orderBy('createdAt', 'asc'))
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
  const ref = await addDoc(commentsRef(materialId), data)
  return { id: ref.id, ...data }
}

export async function deleteComment(materialId: string, commentId: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'materiais', materialId, 'comments', commentId))
}
