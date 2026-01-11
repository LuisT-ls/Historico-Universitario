import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HomePage } from '@/components/pages/home-page'
import Image from 'next/image'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Histórico Acadêmico Online Gratuito - Gerencie seu Histórico Acadêmico',
  description:
    'Sistema GRATUITO para gerenciar histórico acadêmico! Calcule CR automaticamente, controle disciplinas, requisitos de formatura. BICTI e Engenharias. Acesse já!',
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="bottom-right" richColors />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <header className="mb-10">
          <div className="mb-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 overflow-hidden mx-auto mb-4 shadow-sm border border-primary/5">
              <Image 
                src="/assets/img/logo.png" 
                alt="Logo" 
                width={56} 
                height={56}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Histórico Acadêmico
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Gerencie seu histórico acadêmico, monitore seu progresso e acompanhe os requisitos
              para formatura nos cursos de <strong className="text-foreground">BICTI</strong>,{' '}
              <strong className="text-foreground">Engenharia de Produção</strong> e{' '}
              <strong className="text-foreground">Engenharia Elétrica</strong>.
            </p>
          </div>
        </header>
        
        <HomePage />
      </main>
      <Footer />
    </div>
  )
}
