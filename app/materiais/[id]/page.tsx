import { Metadata } from 'next'
import { MaterialDetailPage } from '@/components/pages/material-detail-page'

export const metadata: Metadata = {
  title: 'Material — Histórico Acadêmico',
  robots: { index: false, follow: true },
}

export default function MaterialDetail() {
  return <MaterialDetailPage />
}
