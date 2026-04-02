import { Metadata } from 'next'
import { MateriaisPage } from '@/components/pages/materiais-page'

export const metadata: Metadata = {
  title: 'Materiais Acadêmicos — ICTI / UFBA',
  description: 'Repositório colaborativo de materiais acadêmicos — listas, apostilas, provas e resumos dos cursos do ICTI.',
  robots: { index: true, follow: true },
}

export default function Materiais() {
  return <MateriaisPage />
}
