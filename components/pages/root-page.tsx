'use client'

import { useAuth } from '@/components/auth-provider'
import { HomePage } from '@/components/pages/home-page'
import { LandingPage } from '@/components/pages/landing-page'
import { Loader2 } from 'lucide-react'

export function RootPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return <LandingPage />

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <HomePage />
    </main>
  )
}
