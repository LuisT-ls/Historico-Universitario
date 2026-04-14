import type { TipoMaterial, StatusMaterial, Curso } from '@/types'

export const TIPO_MATERIAL_LABELS: Record<TipoMaterial, string> = {
  lista:     'Lista de Exercícios',
  apostila:  'Apostila',
  prova:     'Prova',
  resumo:    'Resumo',
  slides:    'Slides',
  atividade: 'Atividade',
  outro:     'Outro',
}

export const STATUS_MATERIAL_LABELS: Record<StatusMaterial, string> = {
  pending:  'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
}

export const CURSO_LABELS: Record<Curso, string> = {
  BICTI:    'BICTI',
  ENG_PROD: 'Eng. Produção',
  ENG_ELET: 'Eng. Elétrica',
}

export const TIPOS_MATERIAL: TipoMaterial[] = [
  'lista', 'apostila', 'prova', 'resumo', 'slides', 'atividade', 'outro',
]

export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

/** Gera lista de semestres de 2020.1 até o próximo semestre disponível */
export function getSemestres(): string[] {
  const semestres: string[] = []
  const now = new Date()
  const maxYear = now.getFullYear() + 1

  for (let year = 2020; year <= maxYear; year++) {
    semestres.push(`${year}.1`, `${year}.2`)
  }

  return semestres.reverse() // mais recentes primeiro
}
