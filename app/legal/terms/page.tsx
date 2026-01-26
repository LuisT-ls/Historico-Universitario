import { Metadata } from 'next'
import { TermsPage } from '@/components/pages/terms-page'

export const metadata: Metadata = {
  title: 'Termos de Uso - Histórico Acadêmico',
  description: 'Termos de Uso do Histórico Acadêmico. Conheça as regras, responsabilidades e condições de uso do nosso sistema acadêmico gratuito. Leia antes de usar.',
  keywords: [
    'termos de uso',
    'condições de uso',
    'regras sistema acadêmico',
    'política de uso',
  ],
  openGraph: {
    title: 'Termos de Uso - Histórico Acadêmico',
    description: 'Conheça as regras e responsabilidades do uso do Histórico Acadêmico.',
    url: 'https://historicoacademico.vercel.app/legal/terms',
    type: 'website',
  },
  alternates: {
    canonical: 'https://historicoacademico.vercel.app/legal/terms',
  },
}

export default function Terms() {
  return <TermsPage />
}

