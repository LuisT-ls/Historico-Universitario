import { Metadata } from 'next'
import { PrivacyPage } from '@/components/pages/privacy-page'

export const metadata: Metadata = {
  title: 'Política de Privacidade - Histórico Acadêmico',
  description: 'Política de Privacidade do Histórico Acadêmico. Saiba como protegemos seus dados acadêmicos com transparência, segurança e responsabilidade. Conforme LGPD.',
  keywords: [
    'política de privacidade',
    'proteção de dados',
    'LGPD',
    'privacidade acadêmica',
    'segurança dados',
  ],
  openGraph: {
    title: 'Política de Privacidade - Histórico Acadêmico',
    description: 'Saiba como protegemos seus dados acadêmicos com transparência e responsabilidade.',
    url: 'https://historicoacademico.vercel.app/legal/privacy',
    siteName: 'Histórico Acadêmico - Sistema Acadêmico Gratuito',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: 'https://historicoacademico.vercel.app/assets/img/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Política de Privacidade - Histórico Acadêmico',
        type: 'image/jpeg',
      },
    ],
  },
  alternates: {
    canonical: 'https://historicoacademico.vercel.app/legal/privacy',
  },
}

export default function Privacy() {
  return <PrivacyPage />
}

