import { Metadata } from 'next'
import { CertificadosPage } from '@/components/pages/certificados-page'

export const metadata: Metadata = {
  title: 'Certificados Acadêmicos - Gerencie suas Atividades Complementares',
  description: 'Visualize, gerencie e valide seus certificados acadêmicos e atividades complementares. Controle sua carga horária de AC e organize seus documentos acadêmicos de forma simples e eficiente.',
  keywords: [
    'certificados acadêmicos',
    'atividades complementares',
    'carga horária AC',
    'validação certificados',
    'documentos acadêmicos',
    'gestão certificados universitários',
  ],
  openGraph: {
    title: 'Certificados Acadêmicos - Gerencie suas Atividades Complementares',
    description: 'Visualize, gerencie e valide seus certificados acadêmicos e atividades complementares. Controle sua carga horária de AC.',
    url: 'https://historicoacademico.vercel.app/certificados',
    siteName: 'Histórico Acadêmico - Sistema Acadêmico Gratuito',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: 'https://historicoacademico.vercel.app/assets/img/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Certificados Acadêmicos - Gerencie suas Atividades Complementares',
        type: 'image/jpeg',
      },
    ],
  },
  alternates: {
    canonical: 'https://historicoacademico.vercel.app/certificados',
  },
}

export default function Certificados() {
  return <CertificadosPage />
}

