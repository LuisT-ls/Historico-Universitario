'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { UploadMaterialForm } from '@/components/features/materiais/upload-form'
import { Loader2 } from 'lucide-react'

export function UploadMaterialPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <main className="container py-8 px-4">
      <UploadMaterialForm />
    </main>
  )
}
