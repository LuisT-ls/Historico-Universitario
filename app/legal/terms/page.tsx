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
    siteName: 'Histórico Acadêmico - Sistema Acadêmico Gratuito',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: 'https://historicoacademico.vercel.app/assets/img/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Termos de Uso - Histórico Acadêmico',
        type: 'image/jpeg',
      },
    ],
  },
  alternates: {
    canonical: 'https://historicoacademico.vercel.app/legal/terms',
  },
}

export default function Terms() {
  return <TermsPage />
}

