import { Metadata } from 'next'
import { TermsPage } from '@/components/pages/terms-page'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos de Uso do Histórico Acadêmico - Conheça as regras e responsabilidades do uso do nosso aplicativo',
}

export default function Terms() {
  return <TermsPage />
}

