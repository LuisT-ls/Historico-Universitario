import { Metadata } from 'next'
import { CertificadosPage } from '@/components/pages/certificados-page'

export const metadata: Metadata = {
  title: 'Certificados - Histórico Acadêmico',
  description: 'Visualize e gerencie seus certificados acadêmicos',
}

export default function Certificados() {
  return <CertificadosPage />
}

