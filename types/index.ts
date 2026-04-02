// Branded types for type-safe IDs
export type DisciplinaId = string & { readonly __brand: 'DisciplinaId' }
export type UserId = string & { readonly __brand: 'UserId' }
export type CertificadoId = string & { readonly __brand: 'CertificadoId' }
export type GroupId = string & { readonly __brand: 'GroupId' }
export type GroupMaterialId = string & { readonly __brand: 'GroupMaterialId' }
export type GroupTaskId = string & { readonly __brand: 'GroupTaskId' }

// Course types
export type Curso = 'BICTI' | 'ENG_PROD' | 'ENG_ELET'

export type Natureza =
  | 'AC'
  | 'LV'
  | 'OB'
  | 'OG'
  | 'OH'
  | 'OP'
  | 'OX'
  | 'OZ'

// Discipline result types
export type ResultadoDisciplina = 'AP' | 'RR' | 'TR' | 'DP'

// Discipline interface
export interface Disciplina {
  id?: DisciplinaId
  periodo: string
  codigo: string
  nome: string
  natureza: Natureza
  ch: number
  nota: number
  trancamento?: boolean
  dispensada?: boolean
  emcurso?: boolean
  resultado?: ResultadoDisciplina
  curso?: Curso
  createdAt?: Date
  updatedAt?: Date
}

export interface RequisitosCurso {
  AC?: number
  LV?: number
  OB?: number
  OG?: number
  OH?: number
  OP?: number
  OX?: number
  OZ?: number
}

export interface ConfigCurso {
  nome: string
  requisitos: RequisitosCurso
  totalHoras: number
  metadata?: {
    codigo?: string
    matrizCurricular?: string
    entradaVigor?: string
    totalMinima?: number
    prazos?: {
      minimo: number
      medio: number
      maximo: number
    }
    matriz?: Record<number, string[]> // Map of semester (1, 2...) to array of mandatory subject codes
    limites?: {
      chObrigatoriaAula?: number
      chOptativaMinima?: number
      chComplementarMinima?: number
      chEletivaMaxima?: number
      chPeriodoMaxima?: number
    }
  }
}

export interface Resumo {
  mediaGeral: number
  totalHoras: number
  totalDisciplinas: number
  horasPorNatureza: Record<Natureza, number>
}

// User interface
export interface User {
  uid: UserId
  email: string | null
  displayName: string | null
  photoURL: string | null
}

// Profile interface
export interface Profile {
  uid: UserId
  nome?: string
  email?: string
  photoURL?: string
  curso?: Curso
  matricula?: string
  institution?: string
  startYear?: string | number
  startSemester?: '1' | '2'
  settings?: {
    notifications?: boolean
    privacy?: 'private' | 'public'
    schedulePrivacy?: 'private' | 'public'
  }
  suspensions?: number
  currentSemester?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface UserStatistics {
  totalDisciplines: number
  completedDisciplines: number
  inProgressDisciplines: number
  averageGrade: number
  horasPorNatureza?: Record<Natureza, number>
  totalCH?: number
  semestralization?: number
}

export type TipoCertificado =
  | 'curso'
  | 'workshop'
  | 'palestra'
  | 'evento'
  | 'congresso'
  | 'projeto'
  | 'pesquisa'
  | 'monitoria'
  | 'estagio'
  | 'visita_tecnica'
  | 'outro'

export type StatusCertificado = 'pendente' | 'aprovado' | 'reprovado'

// Certificate interface
export interface Certificado {
  id?: CertificadoId
  userId: UserId
  titulo: string
  tipo: TipoCertificado
  instituicao: string
  cargaHoraria: number
  dataInicio: string
  dataFim: string
  descricao?: string
  arquivoURL?: string
  nomeArquivo?: string
  linkExterno?: string
  status: StatusCertificado
  dataCadastro: string
  createdAt?: Date
  updatedAt?: Date
}

// ─── Group Module types ──────────────────────────────────────────────────────

export interface GroupMember {
  userId: UserId
  role: 'owner' | 'member'
  joinedAt: Date
}

export interface Group {
  id?: GroupId
  name: string
  description?: string
  subjectCode?: string // Código da disciplina, opcional
  ownerId: UserId
  members: UserId[] // Array rápido para consultas no Firestore
  inviteCode: string // Código de 6 caracteres para entrar no grupo
  customColumns?: KanbanColumn[] // Colunas personalizadas do quadro Kanban
  columnOrder?: string[] // Ordem de todas as colunas (IDs)
  createdAt?: Date
  updatedAt?: Date
}

export type GroupMaterialType = 'file' | 'link'

export interface GroupMaterial {
  id?: GroupMaterialId
  groupId: GroupId
  title: string
  type: GroupMaterialType
  url: string // Firebase Storage URL ou Link Externo
  storagePath?: string // Caminho no Storage para poter deletar depois
  uploadedBy: UserId
  sizeBytes?: number
  createdAt?: Date
}

export type GroupTaskStatus = 'pending' | 'in_progress' | 'completed' | (string & {})

export interface KanbanColumn {
  id: string
  label: string
}

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface Checklist {
  id: string
  title: string
  items: ChecklistItem[]
}

export interface TaskLink {
  id: string
  url: string
  label?: string
}

export interface TaskComment {
  id: string
  text: string
  authorId: string
  createdAt: Date
}

export type TaskActivityAction = 'created' | 'edited' | 'status_changed' | 'done_toggled'

export interface TaskActivity {
  userId: string
  displayName?: string
  action: TaskActivityAction
  detail?: string // ex: "→ Em andamento", "título alterado"
  timestamp: Date
}

export interface GroupTask {
  id?: GroupTaskId
  groupId: GroupId
  title: string
  description?: string
  status: GroupTaskStatus
  color?: string // Cor do card no kanban (hex)
  done?: boolean // Marcado como concluído pelo usuário (independente da coluna)
  checklists?: Checklist[] // Múltiplas listas de verificação nomeadas
  activity?: TaskActivity[] // Histórico de edições
  assignedTo?: UserId // Para quem a tarefa está atribuída
  dueDate?: Date
  checklist?: ChecklistItem[] // Legado — mantido para compatibilidade com dados antigos
  labels?: string[] // IDs das etiquetas fixas selecionadas
  links?: TaskLink[]
  comments?: TaskComment[]
  createdBy: UserId
  createdAt?: Date
  updatedAt?: Date
}

// ─── Materiais types ──────────────────────────────────────────────────────────

export type MaterialId = string & { readonly __brand: 'MaterialId' }

export type TipoMaterial =
  | 'lista'
  | 'apostila'
  | 'prova'
  | 'resumo'
  | 'slides'
  | 'outro'

export type StatusMaterial = 'pending' | 'approved' | 'rejected'

export type UserRole = 'usuario' | 'admin'

export interface Material {
  id?: MaterialId
  titulo: string
  descricao?: string
  curso: Curso
  disciplina: string
  semestre: string
  tipo: TipoMaterial
  status: StatusMaterial
  uploadedBy: UserId
  uploaderName?: string
  arquivoURL: string
  storagePath: string
  nomeArquivo: string
  sizeBytes?: number
  downloadsCount: number
  createdAt?: Date
  updatedAt?: Date
}

// ─── Catalog JSON data types ─────────────────────────────────────────────────

/** Entry in assets/data/disciplinas.json > catalogo */
export interface CatalogoDisciplina {
  codigo: string
  nome: string
  ch: number
}

/** Entry in assets/data/disciplinas.json > cursos[curso] */
export interface CursoDisciplinaEntry {
  codigo: string
  natureza: Natureza
}

/** Shape of assets/data/disciplinas.json */
export interface DisciplinasCatalogo {
  catalogo: Record<string, CatalogoDisciplina>
  cursos: Record<Curso, CursoDisciplinaEntry[]>
}

/** Shape of assets/data/matrizes.json — curso → semestre → lista de códigos */
export type MatrizCurricular = Record<Curso, Record<string, string[]>>

