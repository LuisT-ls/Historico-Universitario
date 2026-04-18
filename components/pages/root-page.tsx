'use client'

import dynamic from 'next/dynamic'
import { useAuth } from '@/components/auth-provider'
import { LandingPage } from '@/components/pages/landing-page'

// Carregado apenas quando o usuário está autenticado — não afeta o bundle da landing page
const HomePage = dynamic(
  () => import('@/components/pages/home-page').then(m => ({ default: m.HomePage })),
  {
    loading: () => (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    ),
  }
)

export function RootPage() {
  const { user, loading } = useAuth()

  // Usuários não autenticados veem a landing page imediatamente,
  // sem esperar a resolução do estado de auth (evita spinner no LCP).
  if (!loading && !user) return <LandingPage />

  // Enquanto o auth resolve, mostra a landing page como fallback
  // (sem spinner — melhora FCP/LCP para usuários não autenticados).
  if (loading) return <LandingPage />

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <HomePage />
    </main>
  )
}
