// Branded types for type-safe IDs
export type DisciplinaId = string & { readonly __brand: 'DisciplinaId' }
export type UserId = string & { readonly __brand: 'UserId' }
export type CertificadoId = string & { readonly __brand: 'CertificadoId' }
export type GroupId = string & { readonly __brand: 'GroupId' }
export type GroupMaterialId = string & { readonly __brand: 'GroupMaterialId' }
export type GroupTaskId = string & { readonly __brand: 'GroupTaskId' }

// Institute and course types
export type Instituto = 'ICTI' | 'HUMANIDADES'

export type Curso = 'BICTI' | 'ENG_PROD' | 'ENG_ELET' | 'BI_HUM'

export type ConcentracaoBICTI = 'CIENCIA_DADOS' | 'ESTUDOS_ENGENHARIA'

export type ConcentracaoBIHUM =
  | 'ESTUDOS_JURIDICOS'
  | 'ESCRITA_CRIATIVA'
  | 'ESTUDOS_SUBJETIVIDADE'
  | 'POLITICAS_CULTURA'
  | 'RELACOES_INTERNACIONAIS'

export type Natureza =
  | 'AC'
  | 'LV'
  | 'OB'
  | 'OC'
  | 'OG'
  | 'OH'
  | 'OP'
  | 'OX'
  | 'OZ'

// Discipline result types
// 'AP' = Aprovado, 'RR' = Reprovado (por nota), 'RF' = Reprovado por Falta,
// 'RMF' = Reprovado por Média e Falta, 'TR' = Trancado/Cancelado, 'DP' = Dispensado/Equivalência/Em Curso
export type ResultadoDisciplina = 'AP' | 'RR' | 'RF' | 'RMF' | 'TR' | 'DP'

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
  OC?: number
  OG?: number
  OH?: number
  OP?: number
  OX?: number
  OZ?: number
}

export interface ConfigConcentracao {
  nome: string
  requisitos: RequisitosCurso
  totalHoras?: number
  matrizCurricular?: string
}

export interface ConfigCurso {
  nome: string
  instituto: Instituto
  requisitos: RequisitosCurso
  totalHoras: number
  concentracoes?: Record<string, ConfigConcentracao>
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
  /** Curso ativo atual (legado — mantido para leitura retrocompatível). Use `cursos` para novos dados. */
  curso?: Curso
  /** Instituto da UFBA ao qual o estudante pertence. */
  instituto?: Instituto
  /** Lista de cursos em ordem cronológica. O último é o curso ativo atual. */
  cursos?: Curso[]
  /** Concentração do BICTI, se o estudante optou por uma. */
  concentracaoBICTI?: ConcentracaoBICTI
  /** Concentração do BI em Humanidades, se o estudante optou por uma. */
  concentracaoBIHUM?: ConcentracaoBIHUM
  /** Ano de início do CPL (progressão linear após BICTI). Ex: 2026 */
  cplStartYear?: string | number
  /** Semestre de início do CPL. '1' ou '2' */
  cplStartSemester?: '1' | '2'
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

// ─── Mind Map types ───────────────────────────────────────────────────────────

export interface MindMapNodeAttachment {
  id: string
  name: string
  url: string
}

export interface MindMapNodeData extends Record<string, unknown> {
  label: string
  color?: string       // hex — cor de fundo do nó (ex: '#fef08a')
  textColor?: string   // hex — cor do texto
  shape?: 'rounded' | 'pill' | 'diamond'
  fontSize?: 'sm' | 'base' | 'lg'
  emoji?: string       // prefixo opcional (ex: '📌')
  attachments?: MindMapNodeAttachment[]
}

export interface MindMapNode {
  id: string
  type: 'mindMapNode'
  position: { x: number; y: number }
  data: MindMapNodeData
}

export interface MindMapEdge {
  id: string
  source: string
  target: string
  type?: 'smoothstep' | 'straight' | 'step' | 'default'
  animated?: boolean
  label?: string
  style?: { stroke?: string }
}

export interface GroupMindMap {
  nodes: MindMapNode[]
  edges: MindMapEdge[]
  updatedAt: Date
  updatedBy: string // userId do último editor
}

// ─── Materiais types ──────────────────────────────────────────────────────────

export type MaterialId = string & { readonly __brand: 'MaterialId' }

export type TipoMaterial =
  | 'lista'
  | 'apostila'
  | 'prova'
  | 'resumo'
  | 'slides'
  | 'atividade'
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
  viewsCount?: number
  likesCount?: number
  ratingAvg?: number
  ratingCount?: number
  ratingSum?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface MaterialComment {
  id?: string
  materialId: string
  authorId: string
  authorName: string
  authorPhotoURL?: string
  text: string
  createdAt?: Date
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
  cursos: Record<string, CursoDisciplinaEntry[]>
}

/** Shape of assets/data/matrizes.json — curso → semestre → lista de códigos */
export type MatrizCurricular = Partial<Record<Curso, Record<string, string[]>>>

/** Shape of assets/data/prerequisitos.json — curso → código → lista de pré-requisitos */
export type MapaPrerequisitos = Partial<Record<Curso, Record<string, string[]>>>

