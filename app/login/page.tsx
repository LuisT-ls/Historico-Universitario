import { Metadata } from 'next'
import { LoginPage } from '@/components/pages/login-page'

export const metadata: Metadata = {
  title: 'Login - Histórico Universitário',
  description:
    'Faça login para acessar o Histórico Universitário, gerencie seu progresso acadêmico, visualize disciplinas e requisitos para formatura.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function Login() {
  return <LoginPage />
}

