import { Metadata } from 'next'
import { ForgotPasswordPage } from '@/components/pages/forgot-password-page'

export const metadata: Metadata = {
  title: 'Recuperar Senha - Histórico Universitário',
  description: 'Recupere sua senha para acessar o Histórico Universitário.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function ForgotPassword() {
  return <ForgotPasswordPage />
}
