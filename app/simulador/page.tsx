import { Metadata } from 'next'
import { SimuladorPageClient } from './simulador-client'

export const metadata: Metadata = {
  title: 'Simulador "E Se?" - Planeje seu Próximo Semestre',
  description: 'Simule diferentes cenários acadêmicos e veja o impacto no seu CR e previsão de formatura. Planeje seu próximo semestre com o simulador "E Se?" do Histórico Acadêmico.',
  keywords: [
    'simulador acadêmico',
    'planejamento semestre',
    'simular CR',
    'previsão formatura',
    'calcular impacto notas',
    'planejamento acadêmico',
    'simulador universitário',
  ],
  openGraph: {
    title: 'Simulador "E Se?" - Planeje seu Próximo Semestre',
    description: 'Simule diferentes cenários acadêmicos e veja o impacto no seu CR e previsão de formatura.',
    url: 'https://historicoacademico.vercel.app/simulador',
    type: 'website',
  },
  alternates: {
    canonical: 'https://historicoacademico.vercel.app/simulador',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function SimuladorPage() {
  return <SimuladorPageClient />
}
