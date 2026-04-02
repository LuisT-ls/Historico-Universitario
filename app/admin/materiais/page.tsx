import { Metadata } from 'next'
import { AdminMateriaisPage } from '@/components/pages/admin-materiais-page'

export const metadata: Metadata = {
  title: 'Admin — Aprovação de Materiais',
  robots: { index: false, follow: false },
}

export default function AdminMateriais() {
  return <AdminMateriaisPage />
}
