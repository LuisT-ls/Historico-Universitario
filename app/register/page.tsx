import { Metadata } from 'next'
import { RegisterPage } from '@/components/pages/register-page'

export const metadata: Metadata = {
  title: 'Criar Conta Gratuita - Histórico Acadêmico Online',
  description: 'Crie sua conta gratuita no Histórico Acadêmico para gerenciar seu progresso universitário. Cadastro rápido e seguro. Comece a organizar suas disciplinas, calcular CR e planejar sua formatura hoje mesmo!',
  keywords: [
    'cadastro histórico acadêmico',
    'criar conta sistema acadêmico',
    'registro gratuito universitário',
    'cadastro estudante',
    'conta acadêmica gratuita',
  ],
  openGraph: {
    title: 'Criar Conta Gratuita - Histórico Acadêmico',
    description: 'Crie sua conta gratuita para gerenciar seu progresso universitário de forma simples e eficiente.',
    url: 'https://historicoacademico.vercel.app/register',
    type: 'website',
  },
  alternates: {
    canonical: 'https://historicoacademico.vercel.app/register',
  },
}

export default function Register() {
  return <RegisterPage />
}
