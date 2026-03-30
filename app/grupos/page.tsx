import { Metadata } from 'next'
import { GroupsPage } from '../../components/pages/groups-page'

export const metadata: Metadata = {
  title: 'Grupos de Estudo - Organize seus Trabalhos Acadêmicos',
  description: 'Crie e gerencie grupos de estudo, compartilhe materiais e organize tarefas com seus colegas de faculdade. Uma plataforma para colaboração entre estudantes.',
  keywords: [
    'grupos de estudo',
    'trabalhos em grupo',
    'organização acadêmica',
    'compartilhamento de arquivos',
    'tarefas acadêmicas',
    'estudantes UFBA',
    'gestão de estudos',
  ],
  openGraph: {
    title: 'Grupos de Estudo - Histórico Acadêmico',
    description: 'Crie e gerencie grupos de estudo, compartilhe materiais e organize tarefas com seus colegas.',
    url: 'https://historicoacademico.vercel.app/grupos',
    type: 'website',
  },
  alternates: {
    canonical: 'https://historicoacademico.vercel.app/grupos',
  },
}

export default function Grupos() {
  return <GroupsPage />
}
