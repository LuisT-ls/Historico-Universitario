'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth, db } from '@/lib/firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

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
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user && db) {
        try {
          const userRef = doc(db, 'users', user.uid)
          const snap = await getDoc(userRef)
          if (!snap.exists()) {
            await setDoc(userRef, {
              name: user.displayName || '',
              email: user.email || '',
              photoURL: user.photoURL || '',
              profile: { course: 'BICTI' },
              settings: { privacy: 'private' },
              createdAt: new Date(),
            })
          }
        } catch {
          // Falha silenciosa: o documento pode ser criado manualmente na página de perfil
        }
      }

      setLoading(false)
    })

    return () => unsubscribe()
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

