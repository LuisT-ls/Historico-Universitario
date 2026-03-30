import { Metadata } from 'next'
import { GroupDetailsPage } from '@/components/features/groups/components/group-details-page'

export const metadata: Metadata = {
    title: 'Painel do Grupo - Histórico Acadêmico',
    description: 'Gerencie materiais, tarefas e membros do seu grupo de estudos. Colabore em tempo real com seus colegas.',
}

/**
 * Rota dinâmica para detalhes de um grupo específico.
 */
export default function GroupPage() {
    return <GroupDetailsPage />
}
