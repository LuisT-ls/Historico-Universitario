import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export interface Report {
  id: string
  materialId: string
  materialTitle: string
  reportedBy: string
  reporterName?: string
  reason: string
  details?: string | null
  createdAt: Date
}

export async function getReports(): Promise<Report[]> {
  if (!db) return []
  try {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => {
      const data = d.data()
      return {
        id: d.id,
        materialId: data.materialId,
        materialTitle: data.materialTitle,
        reportedBy: data.reportedBy,
        reporterName: data.reporterName,
        reason: data.reason,
        details: data.details ?? null,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      }
    })
  } catch {
    return []
  }
}

export async function dismissReport(id: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'reports', id))
}
