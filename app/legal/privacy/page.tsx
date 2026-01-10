import { Metadata } from 'next'
import { PrivacyPage } from '@/components/pages/privacy-page'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Política de Privacidade do Histórico Acadêmico - Protegemos seus dados com transparência e responsabilidade',
}

export default function Privacy() {
  return <PrivacyPage />
}

