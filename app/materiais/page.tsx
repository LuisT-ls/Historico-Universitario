import { Metadata } from 'next'
import { MateriaisPage } from '@/components/pages/materiais-page'

export const metadata: Metadata = {
  title: 'Materiais Acadêmicos — ICTI / UFBA',
  description: 'Repositório colaborativo de materiais acadêmicos — listas, apostilas, provas e resumos dos cursos do ICTI.',
  keywords: [
    'materiais acadêmicos',
    'listas de exercícios',
    'apostilas',
    'provas antigas',
    'resumos',
    'ICTI',
    'UFBA',
    'compartilhamento de materiais',
  ],
  openGraph: {
    title: 'Materiais Acadêmicos — ICTI / UFBA',
    description: 'Repositório colaborativo de materiais acadêmicos — listas, apostilas, provas e resumos dos cursos do ICTI.',
    url: 'https://historicoacademico.vercel.app/materiais',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Materiais Acadêmicos — ICTI / UFBA',
    description: 'Repositório colaborativo de materiais acadêmicos — listas, apostilas, provas e resumos dos cursos do ICTI.',
  },
  alternates: {
    canonical: 'https://historicoacademico.vercel.app/materiais',
  },
  robots: { index: true, follow: true },
}

export default function Materiais() {
  return <MateriaisPage />
}
