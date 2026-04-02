import { Metadata } from 'next'
import { UploadMaterialPage } from '@/components/pages/upload-material-page'

export const metadata: Metadata = {
  title: 'Enviar Material — Histórico Acadêmico',
  robots: { index: false, follow: false },
}

export default function UploadMaterial() {
  return <UploadMaterialPage />
}
