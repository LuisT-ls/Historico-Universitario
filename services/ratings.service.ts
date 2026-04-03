import { doc, getDoc, setDoc, deleteDoc, runTransaction } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

function ratingRef(materialId: string, userId: string) {
  return doc(db!, 'materiais', materialId, 'ratings', userId)
}

function materialRef(materialId: string) {
  return doc(db!, 'materiais', materialId)
}

export async function getUserRating(materialId: string, userId: string): Promise<number | null> {
  if (!db) return null
  try {
    const snap = await getDoc(ratingRef(materialId, userId))
    if (!snap.exists()) return null
    return snap.data().value as number
  } catch {
    return null
  }
}

export async function setRating(materialId: string, userId: string, value: number): Promise<void> {
  if (!db) return
  await runTransaction(db, async (tx) => {
    const matSnap = await tx.get(materialRef(materialId))
    const ratingSnap = await tx.get(ratingRef(materialId, userId))

    const matData = matSnap.data() ?? {}
    const oldSum: number = matData.ratingSum ?? 0
    const oldCount: number = matData.ratingCount ?? 0
    const isNew = !ratingSnap.exists()
    const oldValue: number = isNew ? 0 : (ratingSnap.data()?.value ?? 0)

    const newSum = oldSum - oldValue + value
    const newCount = isNew ? oldCount + 1 : oldCount
    const newAvg = newCount > 0 ? newSum / newCount : 0

    tx.set(ratingRef(materialId, userId), { value, ratedAt: new Date() })
    tx.update(materialRef(materialId), {
      ratingSum: newSum,
      ratingCount: newCount,
      ratingAvg: newAvg,
    })
  })
}

export async function removeRating(materialId: string, userId: string): Promise<void> {
  if (!db) return
  await runTransaction(db, async (tx) => {
    const matSnap = await tx.get(materialRef(materialId))
    const ratingSnap = await tx.get(ratingRef(materialId, userId))

    if (!ratingSnap.exists()) return

    const matData = matSnap.data() ?? {}
    const oldSum: number = matData.ratingSum ?? 0
    const oldCount: number = matData.ratingCount ?? 0
    const oldValue: number = ratingSnap.data()?.value ?? 0

    const newSum = oldSum - oldValue
    const newCount = Math.max(0, oldCount - 1)
    const newAvg = newCount > 0 ? newSum / newCount : 0

    tx.delete(ratingRef(materialId, userId))
    tx.update(materialRef(materialId), {
      ratingSum: newSum,
      ratingCount: newCount,
      ratingAvg: newAvg,
    })
  })
}
