'use client'

import { AuthProvider } from '@/components/auth-provider'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Toaster position="bottom-right" richColors />
      {children}
    </AuthProvider>
  )
}

