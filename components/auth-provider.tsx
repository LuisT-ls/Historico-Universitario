'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { logger } from '@/lib/logger'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

/**
 * Provedor de Contexto de Autenticação.
 * Gerencia o estado do usuário logado via Firebase Auth e fornece o contexto
 * para toda a aplicação.
 * 
 * @param children - Componentes filhos que terão acesso ao contexto
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let mounted = true

    const initAuth = async () => {
      try {
        // Importação dinâmica para tirar o Firebase do bundle inicial (reduz ~200KiB do block render)
        const { onAuthStateChanged } = await import('firebase/auth')
        const { doc, getDoc, setDoc } = await import('firebase/firestore')
        const { auth, db } = await import('@/lib/firebase/config')

        if (!auth) {
          if (mounted) setLoading(false)
          return
        }

        const unsub = onAuthStateChanged(auth, async (currentUser) => {
          if (!mounted) return
          setUser(currentUser)

          if (currentUser && db) {
            try {
              const userRef = doc(db, 'users', currentUser.uid)
              const snap = await getDoc(userRef)
              if (!snap.exists()) {
                await setDoc(userRef, {
                  name: currentUser.displayName || '',
                  email: currentUser.email || '',
                  photoURL: currentUser.photoURL || '',
                  settings: { privacy: 'private' },
                  createdAt: new Date(),
                })
              }
            } catch (error) {
              logger.error('Falha ao criar documento do usuário no primeiro login', error)
            }
          }

          if (mounted) setLoading(false)
        })

        if (mounted) {
          unsubscribe = unsub
        } else {
          unsub()
        }
      } catch (err) {
        logger.error('Erro ao carregar Firebase Auth dinamicamente', err)
        if (mounted) setLoading(false)
      }
    }

    // Usamos setTimeout para despriorizar a inicialização do Firebase e do iframe
    // permitindo que o FCP/LCP da landing page aconteça primeiro.
    const timer = setTimeout(() => {
      if (mounted) initAuth()
    }, 10)

    return () => {
      mounted = false
      clearTimeout(timer)
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

/**
 * Hook customizado para acessar o contexto de autenticação de forma simples.
 * 
 * @returns Objeto contendo o usuário atual (User | null) e o estado de carregamento (loading)
 * 
 * @example
 * const { user, loading } = useAuth()
 */
export function useAuth() {
  return useContext(AuthContext)
}

