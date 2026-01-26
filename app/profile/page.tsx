import { Metadata } from 'next'
import { ProfilePage } from '@/components/pages/profile-page'

export const metadata: Metadata = {
  title: 'Meu Perfil - Configurações e Estatísticas Acadêmicas',
  description: 'Gerencie seu perfil acadêmico, visualize estatísticas detalhadas, exporte seus dados e configure preferências de privacidade. Controle total sobre suas informações acadêmicas.',
  keywords: [
    'perfil acadêmico',
    'estatísticas universitárias',
    'exportar histórico acadêmico',
    'configurações acadêmicas',
    'privacidade dados acadêmicos',
  ],
  openGraph: {
    title: 'Meu Perfil - Histórico Acadêmico',
    description: 'Gerencie seu perfil acadêmico, visualize estatísticas e configure preferências.',
    url: 'https://historicoacademico.vercel.app/profile',
    type: 'website',
  },
  alternates: {
    canonical: 'https://historicoacademico.vercel.app/profile',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function Profile() {
  return <ProfilePage />
}

