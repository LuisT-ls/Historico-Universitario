import { Metadata } from 'next'
import { ForgotPasswordPage } from '@/components/pages/forgot-password-page'

export const metadata: Metadata = {
  title: 'Recuperar Senha - Histórico Acadêmico',
  description: 'Recupere sua senha para acessar o Histórico Acadêmico. Receba um link de recuperação por email de forma segura e rápida.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://historicoacademico.vercel.app/forgot-password',
  },
}

export default function ForgotPassword() {
  return <ForgotPasswordPage />
}
