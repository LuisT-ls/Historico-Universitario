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

export interface Disciplina {
  id?: string
  periodo: string
  codigo: string
  nome: string
  natureza: Natureza
  ch: number
  nota: number
  trancamento?: boolean
  dispensada?: boolean
  emcurso?: boolean
  resultado?: 'AP' | 'RR' | 'TR' | 'DP'
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

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export interface Profile {
  uid: string
  nome?: string
  email?: string
  curso?: Curso
  matricula?: string
  institution?: string
  startYear?: number
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

export interface Certificado {
  id?: string
  userId: string
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

