import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HorariosPage } from '@/components/pages/horarios-page'

export const metadata: Metadata = {
  title: 'Grade de Horários',
  description: 'Visualize sua grade de horários do semestre atual.',
  robots: { index: false, follow: false },
}

export default function Horarios() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <HorariosPage />
      </main>
      <Footer />
    </div>
  )
}
