'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { GraduationCap, User, LogOut, LogIn, Menu, X, Home, Clock } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { cn } from '@/lib/utils'

export function Header() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState('')
  const isHomePage = pathname === '/'

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setCurrentDateTime(
        now.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    if (!auth) return
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const navItems = [
    { href: '/', label: 'Início', icon: Home, show: !isHomePage },
    { href: '/certificados', label: 'Certificados', icon: GraduationCap, show: true },
    { href: '/profile', label: 'Perfil', icon: User, show: !!user },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo e Data/Hora */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground">Histórico Universitário</h1>
                <p className="text-xs text-muted-foreground hidden lg:block">Gerencie seu progresso acadêmico</p>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground border-l border-border pl-4">
              <Clock className="h-4 w-4" />
              <time dateTime={currentDateTime} className="font-mono">
                {currentDateTime}
              </time>
            </div>
          </div>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (!item.show) return null
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'gap-2',
                      isActive && 'bg-primary/10 text-primary font-medium'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}

            <div className="mx-2 h-6 w-px bg-border" />

            <ThemeToggle />

            {user ? (
              <>
                <div className="mx-2 h-6 w-px bg-border" />
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Sair</span>
                </Button>
              </>
            ) : (
              <>
                <div className="mx-2 h-6 w-px bg-border" />
                <Link href="/login">
                  <Button variant="default" size="sm" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Menu Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="relative"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Menu Mobile Expandido */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container mx-auto px-4 py-3 space-y-1">
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border-b border-border mb-2">
                <Clock className="h-4 w-4" />
                <time dateTime={currentDateTime} className="font-mono">
                  {currentDateTime}
                </time>
              </div>

              {navItems.map((item) => {
                if (!item.show) return null
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-2',
                        isActive && 'bg-primary/10 text-primary font-medium'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}

              <div className="border-t border-border pt-2 mt-2">
                {user ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                ) : (
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full justify-start gap-2">
                      <LogIn className="h-4 w-4" />
                      Entrar
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

