'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Carregar preferência do localStorage apenas uma vez
    if (typeof window === 'undefined') return

    try {
      const darkModeEnabled = localStorage.getItem('historico-ufba-dark-mode') === 'true'
      setIsDark(darkModeEnabled)

      // Sincronizar com o estado atual do DOM (caso o script inline já tenha aplicado)
      const hasDarkMode = document.documentElement.classList.contains('dark-mode')
      if (darkModeEnabled !== hasDarkMode) {
        if (darkModeEnabled) {
          document.documentElement.classList.add('dark-mode')
          document.documentElement.style.colorScheme = 'dark'
        } else {
          document.documentElement.classList.remove('dark-mode')
          document.documentElement.style.colorScheme = 'light'
        }
      }

      setMounted(true)
    } catch (error) {
      logger.error('Erro ao carregar tema:', error)
      setMounted(true)
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    try {
      if (newIsDark) {
        document.documentElement.classList.add('dark-mode')
        document.documentElement.style.colorScheme = 'dark'
        localStorage.setItem('historico-ufba-dark-mode', 'true')
      } else {
        document.documentElement.classList.remove('dark-mode')
        document.documentElement.style.colorScheme = 'light'
        localStorage.setItem('historico-ufba-dark-mode', 'false')
      }
    } catch (error) {
      logger.error('Erro ao alternar tema:', error)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'rounded-full w-9 h-9 p-0 transition-all duration-300',
        'hover:scale-110 active:scale-95',
        'flex items-center justify-center',
        'border border-border',
        isDark
          ? 'bg-background text-foreground hover:bg-primary hover:text-primary-foreground'
          : 'bg-background text-foreground hover:bg-primary hover:text-primary-foreground'
      )}
      aria-label={isDark ? 'Mudar para modo claro' : 'Alternar modo escuro'}
      title={isDark ? 'Mudar para modo claro' : 'Alternar modo escuro'}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
      )}
    </button>
  )
}

