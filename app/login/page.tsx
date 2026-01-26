import { Metadata } from 'next'
import { LoginPage } from '@/components/pages/login-page'

export const metadata: Metadata = {
  title: 'Login - Acesse seu Histórico Acadêmico',
  description:
    'Faça login para acessar o Histórico Acadêmico. Gerencie seu progresso acadêmico, visualize disciplinas, calcule CR e acompanhe requisitos para formatura. Login seguro com Google ou email.',
  keywords: [
    'login histórico acadêmico',
    'acessar sistema acadêmico',
    'entrar histórico universitário',
    'autenticação acadêmica',
  ],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Login - Histórico Acadêmico',
    description: 'Faça login para acessar seu histórico acadêmico e gerenciar seu progresso universitário.',
    url: 'https://historicoacademico.vercel.app/login',
    type: 'website',
  },
  alternates: {
    canonical: 'https://historicoacademico.vercel.app/login',
  },
}

export default function Login() {
  return <LoginPage />
}

