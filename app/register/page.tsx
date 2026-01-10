import { Metadata } from 'next'
import { RegisterPage } from '@/components/pages/register-page'

export const metadata: Metadata = {
  title: 'Criar Cadastro - Histórico Acadêmico',
  description: 'Crie sua conta no Histórico Acadêmico para gerenciar seu progresso universitário.',
}

export default function Register() {
  return <RegisterPage />
}
