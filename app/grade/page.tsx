import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { GradePage } from '@/components/pages/grade-page'

export const metadata: Metadata = {
  title: 'Grade Curricular | Histórico Acadêmico',
  description: 'Acompanhe as disciplinas obrigatórias e optativas do seu curso.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <GradePage />
      </main>
      <Footer />
    </div>
  )
}
