import { collection, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export const refs = {
  material: (materialId: string) =>
    doc(db!, 'materiais', materialId),

  materialSubDoc: (materialId: string, sub: string, docId: string) =>
    doc(db!, 'materiais', materialId, sub, docId),

  materialSubCollection: (materialId: string, sub: string) =>
    collection(db!, 'materiais', materialId, sub),

  userSubDoc: (userId: string, sub: string, docId: string) =>
    doc(db!, 'users', userId, sub, docId),

  userSubCollection: (userId: string, sub: string) =>
    collection(db!, 'users', userId, sub),
}
