import type { ResultadoDisciplina, StatusCertificado, TipoCertificado } from '@/types'

/**
 * Mapeamento de resultados de disciplinas para labels em português
 */
export const RESULTADO_LABELS: Record<ResultadoDisciplina, string> = {
    AP: 'Aprovado',
    RR: 'Reprovado',
    TR: 'Trancado',
    DP: 'Dispensado',
} as const

/**
 * Mapeamento de status de certificados para labels em português
 */
export const STATUS_CERTIFICADO_LABELS: Record<StatusCertificado, string> = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    reprovado: 'Reprovado',
} as const

/**
 * Mapeamento de tipos de certificados para labels em português
 */
export const TIPO_CERTIFICADO_LABELS: Record<TipoCertificado, string> = {
    curso: 'Curso',
    workshop: 'Workshop',
    palestra: 'Palestra',
    evento: 'Evento',
    congresso: 'Congresso',
    projeto: 'Projeto de Extensão',
    pesquisa: 'Projeto de Pesquisa',
    monitoria: 'Monitoria',
    estagio: 'Estágio',
    outro: 'Outro',
} as const

/**
 * Helper para criar um ID de disciplina com tipo seguro
 */
export const createDisciplinaId = (id: string) => id as import('@/types').DisciplinaId

/**
 * Helper para criar um ID de usuário com tipo seguro
 */
export const createUserId = (id: string) => id as import('@/types').UserId

/**
 * Helper para criar um ID de certificado com tipo seguro
 */
export const createCertificadoId = (id: string) => id as import('@/types').CertificadoId
