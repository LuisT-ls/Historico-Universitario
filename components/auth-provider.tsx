'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

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

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
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

