import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HomePage } from '@/components/pages/home-page'
import Image from 'next/image'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Histórico Acadêmico Online Gratuito - Gerencie seu Histórico Acadêmico',
  description:
    'Gerencie seu histórico acadêmico GRATUITAMENTE! Calcule CR, controle disciplinas e acompanhe seu progresso em BICTI e Engenharias. Acesse agora!',
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="bottom-right" richColors />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <header className="mb-10">
          <div className="mb-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-100 mb-3 tracking-tight">
              Histórico Acadêmico
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
              Gerencie seu progresso, monitore requisitos e planeje sua formatura nos cursos de <strong className="text-blue-400 font-bold">BICTI</strong> e <strong className="text-blue-400 font-bold">Engenharias</strong>.
            </p>
          </div>
        </header>

        <HomePage />
      </main>
      <Footer />
    </div>
  )
}
