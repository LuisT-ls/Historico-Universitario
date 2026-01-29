// Branded types for type-safe IDs
export type DisciplinaId = string & { readonly __brand: 'DisciplinaId' }
export type UserId = string & { readonly __brand: 'UserId' }
export type CertificadoId = string & { readonly __brand: 'CertificadoId' }

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
  curso?: Curso
  matricula?: string
  institution?: string
  startYear?: string | number
  startSemester?: '1' | '2'
  settings?: {
    notifications?: boolean
    privacy?: 'private' | 'public'
  }
  createdAt?: Date
  updatedAt?: Date
}

export interface UserStatistics {
  totalDisciplines: number
  completedDisciplines: number
  inProgressDisciplines: number
  averageGrade: number
  horasPorNatureza?: Record<Natureza, number>
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

