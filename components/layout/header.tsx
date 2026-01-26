'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { GraduationCap, User, LogOut, LogIn, Menu, X, Home, Clock } from 'lucide-react'
import { signOut } from 'firebase/auth'
import Image from 'next/image'
import { auth } from '@/lib/firebase/config'
import { cn, clearUserData } from '@/lib/utils'
import { logger } from '@/lib/logger'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

export function Header() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
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
      // Limpar todos os dados do usuário antes de fazer logout
      clearUserData()

      // Fazer logout do Firebase
      await signOut(auth)

      // Redirecionar para a página inicial
      router.push('/')
      router.refresh() // Forçar atualização da página para limpar estado
    } catch (error) {
      logger.error('Erro ao fazer logout:', error)
    }
  }

  const navItems = [
    { href: '/', label: 'Início', icon: Home, show: !isHomePage },
    { href: '/simulador', label: 'Simulador', icon: Calculator, show: true },
    { href: '/certificados', label: 'Certificados', icon: GraduationCap, show: true },
    { href: '/profile', label: 'Perfil', icon: User, show: !!user },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 overflow-hidden border border-blue-500/20">
                <Image
                  src="/assets/img/logo.png"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-base font-bold tracking-tight text-slate-100">
                Histórico Acadêmico
              </h1>
            </Link>
          </div>

          {/* Navegação Central */}
          <nav className="hidden md:flex items-center gap-2 flex-1 justify-center">
            {navItems.map((item) => {
              if (!item.show) return null
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'gap-2 h-9 px-4 rounded-lg transition-all duration-200',
                      'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-100',
                      isActive && 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 font-semibold'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Ações de Sistema e Data/Hora */}
          <div className="flex items-center gap-3">
            {/* Data/Hora Discreta */}
            <div className="hidden xl:flex items-center gap-2 text-[10px] font-medium text-slate-500 uppercase tracking-widest bg-slate-800/30 px-3 py-1.5 rounded-full border border-slate-800/50">
              <Clock className="h-3 w-3" />
              <time dateTime={currentDateTime} className="font-mono">
                {currentDateTime}
              </time>
            </div>

            <div className="flex items-center gap-1 pl-3 border-l border-slate-700">
              <ThemeToggle />

              {user ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="h-9 w-9 p-0 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              ) : (
                <Link href="/login">
                  <Button variant="default" size="sm" className="h-8 gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg px-4 shadow-lg shadow-blue-900/20">
                    <LogIn className="h-3.5 w-3.5" />
                    Entrar
                  </Button>
                </Link>
              )}

              {/* Menu Mobile Trigger */}
              <div className="md:hidden ml-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                  className="h-9 w-9 rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sheet Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-slate-900 border-slate-800 p-0">
            <SheetHeader className="p-6 border-b border-slate-800">
              <SheetTitle className="flex items-center gap-3 text-slate-100">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Image
                    src="/assets/img/logo.png"
                    alt="Logo"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                Menu
              </SheetTitle>
            </SheetHeader>

            <div className="p-4 space-y-8">
              <nav className="flex flex-col gap-2">
                {/* Links de navegação */}
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
                        variant="ghost"
                        className={cn(
                          'w-full justify-start gap-3 h-11 px-4 rounded-xl transition-all',
                          'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-100',
                          isActive && 'bg-blue-500/10 text-blue-400 font-bold'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{item.label}</span>
                      </Button>
                    </Link>
                  )
                })}
              </nav>

              <div className="space-y-4">
                <div className="px-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Sistema</p>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-300 font-medium">Tema</span>
                    <ThemeToggle />
                  </div>
                </div>

                <div className="px-2">
                  {user ? (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-11 px-4 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm font-medium">Sair da Conta</span>
                    </Button>
                  ) : (
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="default" className="w-full justify-center gap-2 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/20">
                        <LogIn className="h-4 w-4" />
                        Entrar
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Data/Hora no mobile */}
              <div className="mt-auto pt-6 border-t border-slate-800 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium text-slate-500 bg-slate-800/30 rounded-full border border-slate-800/50">
                  <Clock className="h-3 w-3" />
                  <time dateTime={currentDateTime} className="font-mono">
                    {currentDateTime}
                  </time>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

