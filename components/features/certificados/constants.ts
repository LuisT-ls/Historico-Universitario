import type { TipoCertificado, StatusCertificado } from '@/types'

export const TIPOS_CERTIFICADO: { value: TipoCertificado; label: string }[] = [
    { value: 'curso', label: 'Curso' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'palestra', label: 'Palestra' },
    { value: 'evento', label: 'Evento' },
    { value: 'congresso', label: 'Congresso' },
    { value: 'projeto', label: 'Projeto de Extensão' },
    { value: 'pesquisa', label: 'Projeto de Pesquisa' },
    { value: 'monitoria', label: 'Monitoria' },
    { value: 'estagio', label: 'Estágio' },
    { value: 'outro', label: 'Outro' },
]

export const META_AC_BICTI = 240 // Meta de horas AC para BICTI

export const getStatusColor = (status: StatusCertificado): string => {
    switch (status) {
        case 'aprovado':
            return 'text-green-600 bg-green-500/10 border-green-500/20 dark:text-green-400 dark:bg-green-500/5'
        case 'reprovado':
            return 'text-red-600 bg-red-500/10 border-red-500/20 dark:text-red-400 dark:bg-red-500/5'
        case 'pendente':
            return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20 dark:text-yellow-400 dark:bg-yellow-500/5'
        default:
            return 'text-muted-foreground bg-muted border-transparent'
    }
}

export const getStatusLabel = (status: StatusCertificado): string => {
    switch (status) {
        case 'aprovado':
            return 'Aprovado'
        case 'reprovado':
            return 'Reprovado'
        case 'pendente':
            return 'Pendente'
        default:
            return status
    }
}
