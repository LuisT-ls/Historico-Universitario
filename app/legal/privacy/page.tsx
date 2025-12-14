import { Metadata } from 'next'
import { PrivacyPage } from '@/components/pages/privacy-page'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Política de Privacidade do Histórico Universitário - Protegemos seus dados com transparência e responsabilidade',
}

export default function Privacy() {
  return <PrivacyPage />
}

