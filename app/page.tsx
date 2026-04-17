import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { RootPage } from '@/components/pages/root-page'
export const metadata: Metadata = {
  title: 'Histórico Acadêmico Online Gratuito - Gerencie seu Histórico Acadêmico',
  description:
    'Gerencie seu histórico acadêmico! Calcule CR, controle disciplinas e acompanhe seu progresso. Sistema completo para estudantes do ICTI-UFBA. Acesse agora!',
  keywords: [
    'histórico acadêmico online',
    'calcular CR universitário',
    'sistema acadêmico gratuito',
    'gerenciar disciplinas',
    'controle notas acadêmicas',
    'BICTI',
    'engenharia',
    'coeficiente de rendimento',
    'requisitos formatura',
    'grade curricular online',
  ],
  openGraph: {
    title: 'Histórico Acadêmico Online Gratuito - Gerencie seu Histórico Acadêmico',
    description: 'Gerencie seu histórico acadêmico GRATUITAMENTE! Calcule CR, controle disciplinas e acompanhe seu progresso em BICTI e Engenharias.',
    url: 'https://historicoacademico.vercel.app',
    siteName: 'Histórico Acadêmico - Sistema Acadêmico Gratuito',
    images: [
      {
        url: 'https://historicoacademico.vercel.app/assets/img/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Histórico Acadêmico Online - Sistema gratuito para gerenciar histórico acadêmico',
        type: 'image/jpeg',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Histórico Acadêmico Online Gratuito - Sistema para BICTI e Engenharias',
    description: 'Gerencie seu histórico acadêmico GRATUITAMENTE! Calcule CR, controle disciplinas e acompanhe seu progresso.',
    images: ['https://historicoacademico.vercel.app/assets/img/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://historicoacademico.vercel.app',
  },
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <RootPage />
      <Footer />
    </div>
  )
}
