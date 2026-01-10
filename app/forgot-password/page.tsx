import { Metadata } from 'next'
import { ForgotPasswordPage } from '@/components/pages/forgot-password-page'

export const metadata: Metadata = {
  title: 'Recuperar Senha - Histórico Acadêmico',
  description: 'Recupere sua senha para acessar o Histórico Acadêmico.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function ForgotPassword() {
  return <ForgotPasswordPage />
}
