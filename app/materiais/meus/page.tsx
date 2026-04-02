import { Metadata } from 'next'
import { MeusMateriaisPage } from '@/components/pages/meus-materiais-page'

export const metadata: Metadata = {
  title: 'Meus Materiais — Histórico Acadêmico',
  robots: { index: false, follow: false },
}

export default function MeusMateriais() {
  return <MeusMateriaisPage />
}
