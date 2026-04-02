import { Metadata } from 'next'
import { NotFoundPage } from '@/components/pages/not-found-page'

export const metadata: Metadata = {
  title: 'Página não encontrada - Histórico Acadêmico',
  description: 'A página que você procura não foi encontrada.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return <NotFoundPage />
}
