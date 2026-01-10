import { Metadata } from 'next'
import { HomePage } from '@/components/pages/home-page'

export const metadata: Metadata = {
  title: 'Histórico Acadêmico Online Gratuito',
  description:
    '🎓 Sistema GRATUITO para gerenciar histórico acadêmico! Calcule CR automaticamente, controle disciplinas, requisitos de formatura. BICTI e Engenharias. ✅ Acesse já!',
}

export default function Home() {
  return <HomePage />
}

