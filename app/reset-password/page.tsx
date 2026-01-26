import { Metadata } from 'next'
import { ResetPasswordPage } from '@/components/pages/reset-password-page'

export const metadata: Metadata = {
  title: 'Redefinir Senha - Histórico Acadêmico',
  description: 'Crie uma nova senha segura para sua conta no Histórico Acadêmico. Use um token válido para redefinir sua senha.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://historicoacademico.vercel.app/reset-password',
  },
}

export default function ResetPassword() {
  return <ResetPasswordPage />
}
