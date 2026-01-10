import { Metadata } from 'next'
import { ResetPasswordPage } from '@/components/pages/reset-password-page'

export const metadata: Metadata = {
  title: 'Redefinir Senha - Histórico Universitário',
  description: 'Crie uma nova senha para sua conta.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ResetPassword() {
  return <ResetPasswordPage />
}
