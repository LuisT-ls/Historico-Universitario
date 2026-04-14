import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  increment,
  type QueryDocumentSnapshot,
  type DocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { deleteFile } from '@/services/storage.service'
import type { Material, MaterialId, UserId, StatusMaterial } from '@/types'
import { logger } from '@/lib/logger'

// ─── helpers ──────────────────────────────────────────────────────────────────

function createMaterialId(id: string): MaterialId {
  return id as MaterialId
}

function docToMaterial(docSnap: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): Material {
  const data = docSnap.data() as DocumentData
  return {
    id: createMaterialId(docSnap.id),
    titulo: data.titulo,
    descricao: data.descricao,
    curso: data.curso,
    disciplina: data.disciplina,
    semestre: data.semestre,
    tipo: data.tipo,
    status: data.status,
    uploadedBy: data.uploadedBy,
    uploaderName: data.uploaderName,
    arquivoURL: data.arquivoURL,
    storagePath: data.storagePath,
    nomeArquivo: data.nomeArquivo,
    sizeBytes: data.sizeBytes,
    downloadsCount: data.downloadsCount ?? 0,
    viewsCount: data.viewsCount ?? 0,
    likesCount: data.likesCount ?? 0,
    ratingAvg: data.ratingAvg ?? 0,
    ratingCount: data.ratingCount ?? 0,
    ratingSum: data.ratingSum ?? 0,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  } as Material
}

// ─── public queries ───────────────────────────────────────────────────────────

export interface MaterialFilters {
  curso?: string
  disciplina?: string
  semestre?: string
  tipo?: string
  search?: string
}

/**
 * Busca materiais aprovados com filtros opcionais.
 * Filtros de texto (search, disciplina, semestre) são aplicados no cliente
 * para evitar necessidade de índices compostos no Firestore.
 */
export async function getMateriais(filters: MaterialFilters = {}): Promise<Material[]> {
  if (!db) throw new Error('Firestore não inicializado')

  try {
    const ref = collection(db, 'materiais')
    const q = query(ref, where('status', '==', 'approved'))

    const snapshot = await getDocs(q)
    let materiais: Material[] = snapshot.docs.map(docToMaterial)

    // ordenação client-side (mais recentes primeiro)
    materiais.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))

    // filtros client-side
    if (filters.curso) {
      materiais = materiais.filter(m => m.curso === filters.curso)
    }
    if (filters.tipo) {
      materiais = materiais.filter(m => m.tipo === filters.tipo)
    }
    if (filters.semestre) {
      materiais = materiais.filter(m => m.semestre === filters.semestre)
    }
    if (filters.disciplina) {
      const d = filters.disciplina.toLowerCase()
      materiais = materiais.filter(m => m.disciplina.toLowerCase().includes(d))
    }
    if (filters.search) {
      const s = filters.search.toLowerCase()
      materiais = materiais.filter(m =>
        m.titulo.toLowerCase().includes(s) ||
        m.disciplina.toLowerCase().includes(s) ||
        m.descricao?.toLowerCase().includes(s)
      )
    }

    return materiais
  } catch (error) {
    logger.error('Erro ao buscar materiais:', error)
    throw error
  }
}

export async function getMaterialById(id: string): Promise<Material | null> {
  if (!db) throw new Error('Firestore não inicializado')

  try {
    const snap = await getDoc(doc(db, 'materiais', id))
    if (!snap.exists()) return null
    return docToMaterial(snap)
  } catch (error) {
    logger.error('Erro ao buscar material:', error)
    throw error
  }
}

// ─── user queries ─────────────────────────────────────────────────────────────

export async function getMeusMateriais(userId: string): Promise<Material[]> {
  if (!db) throw new Error('Firestore não inicializado')

  try {
    const ref = collection(db, 'materiais')
    const q = query(ref, where('uploadedBy', '==', userId))
    const snapshot = await getDocs(q)
    const materiais = snapshot.docs.map(docToMaterial)
    return materiais.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
  } catch (error) {
    logger.error('Erro ao buscar meus materiais:', error)
    throw error
  }
}

// ─── mutations ────────────────────────────────────────────────────────────────

export async function addMaterial(
  material: Omit<Material, 'id' | 'downloadsCount' | 'status' | 'createdAt' | 'updatedAt'>,
  userId: UserId
): Promise<string> {
  if (!db) throw new Error('Firestore não inicializado')

  try {
    const data = {
      ...material,
      uploadedBy: userId,
      status: 'approved' as StatusMaterial,
      downloadsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const docRef = await addDoc(collection(db, 'materiais'), data)
    return docRef.id
  } catch (error) {
    logger.error('Erro ao adicionar material:', error)
    throw error
  }
}

export async function updateMaterial(
  id: string,
  data: Pick<Material, 'titulo' | 'descricao' | 'curso' | 'disciplina' | 'semestre' | 'tipo'>
): Promise<void> {
  if (!db) throw new Error('Firestore não inicializado')

  try {
    await updateDoc(doc(db, 'materiais', id), { ...data, updatedAt: new Date() })
  } catch (error) {
    logger.error('Erro ao atualizar material:', error)
    throw error
  }
}

export async function deleteMaterial(id: string, storagePath: string): Promise<void> {
  if (!db) throw new Error('Firestore não inicializado')

  try {
    await deleteFile(storagePath)
    await deleteDoc(doc(db, 'materiais', id))
  } catch (error) {
    logger.error('Erro ao remover material:', error)
    throw error
  }
}

export async function incrementDownloads(id: string): Promise<void> {
  if (!db) return
  try {
    await updateDoc(doc(db, 'materiais', id), { downloadsCount: increment(1) })
  } catch (error) {
    logger.warn('Falha ao incrementar downloads:', { error })
  }
}

export async function incrementViews(id: string): Promise<void> {
  if (!db) return
  try {
    await updateDoc(doc(db, 'materiais', id), { viewsCount: increment(1) })
  } catch {
    // falha silenciosa
  }
}

export async function getRelatedMateriais(disciplina: string, excludeId: string): Promise<Material[]> {
  if (!db) return []
  try {
    const ref = collection(db, 'materiais')
    const q = query(ref, where('status', '==', 'approved'), where('disciplina', '==', disciplina))
    const snapshot = await getDocs(q)
    return snapshot.docs
      .map(docToMaterial)
      .filter(m => m.id !== excludeId)
      .sort((a, b) => (b.downloadsCount ?? 0) - (a.downloadsCount ?? 0))
      .slice(0, 4)
  } catch {
    return []
  }
}

export async function getDisciplinas(): Promise<string[]> {
  if (!db) return []
  try {
    const q = query(collection(db, 'materiais'), where('status', '==', 'approved'))
    const snapshot = await getDocs(q)
    const unique = new Set(snapshot.docs.map(d => d.data().disciplina as string).filter(Boolean))
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  } catch {
    return []
  }
}

// ─── admin ────────────────────────────────────────────────────────────────────

/** Retorna todos os materiais sem filtro de status — uso exclusivo do admin. */
export async function getAllMateriais(): Promise<Material[]> {
  if (!db) throw new Error('Firestore não inicializado')

  try {
    const snapshot = await getDocs(collection(db, 'materiais'))
    const materiais = snapshot.docs.map(docToMaterial)
    return materiais.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
  } catch (error) {
    logger.error('Erro ao buscar todos os materiais:', error)
    throw error
  }
}
