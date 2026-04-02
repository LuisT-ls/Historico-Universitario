'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { GraduationCap, User, LogOut, LogIn, Menu, Home, Clock, Calculator, CalendarRange, LayoutGrid, Users, ChevronDown, BookOpen, Upload, ShieldCheck } from 'lucide-react'
import { getUserRole } from '@/services/firestore.service'
import type { UserRole } from '@/types'
import { signOut } from '@/services/auth.service'
import { getProfile } from '@/services/firestore.service'
import Image from 'next/image'
import { cn, clearUserData } from '@/lib/utils'
import { logger } from '@/lib/logger'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState('')
  const [profilePhotoURL, setProfilePhotoURL] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<UserRole>('usuario')
  const isHomePage = pathname === '/'

  // Carrega a foto de perfil personalizada do Firestore
  useEffect(() => {
    if (!user) { setProfilePhotoURL(null); setUserRole('usuario'); return }
    getProfile(user.uid).then((profile) => {
      setProfilePhotoURL(profile?.photoURL || null)
    }).catch(() => {})
    getUserRole(user.uid).then(setUserRole).catch(() => {})
  }, [user])

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
    try {
      clearUserData()
      await signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      logger.error('Erro ao fazer logout:', error)
    }
  }

  const navItems = [
    { href: '/', label: 'Início', icon: Home, show: !isHomePage },
    { href: '/simulador', label: 'Simulador', icon: Calculator, show: true },
    { href: '/horarios', label: 'Horários', icon: CalendarRange, show: true },
    { href: '/grade', label: 'Grade Curricular', icon: LayoutGrid, show: true },
    { href: '/materiais', label: 'Materiais', icon: BookOpen, show: true },
    { href: '/grupos', label: 'Grupos', icon: Users, show: !!user },
  ]

  const userMenuItems = [
    { href: '/profile', label: 'Perfil', icon: User },
    { href: '/certificados', label: 'Certificados', icon: GraduationCap },
    { href: '/materiais/meus', label: 'Meus Materiais', icon: BookOpen },
    { href: '/materiais/upload', label: 'Enviar Material', icon: Upload },
    ...(userRole === 'admin' ? [{ href: '/admin/materiais', label: 'Admin', icon: ShieldCheck }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border dark:border-slate-800 bg-background/95 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 dark:bg-blue-500/10 overflow-hidden border border-primary/20 dark:border-blue-500/20">
                <Image
                  src="/assets/img/logo.png"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground dark:text-slate-100">
                Histórico Acadêmico
              </span>
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
                      'bg-transparent hover:bg-accent dark:hover:bg-slate-800 text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-100',
                      isActive && 'bg-primary/10 dark:bg-blue-500/10 text-primary dark:text-blue-400 hover:bg-primary/20 dark:hover:bg-blue-500/20 hover:text-primary dark:hover:text-blue-300 font-semibold'
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
            <div className="hidden xl:flex items-center gap-2 text-[10px] font-medium text-muted-foreground dark:text-slate-500 uppercase tracking-widest bg-muted dark:bg-slate-800/30 px-3 py-1.5 rounded-full border border-border dark:border-slate-800/50">
              <Clock className="h-3 w-3" />
              <time dateTime={currentDateTime} className="font-mono">
                {currentDateTime}
              </time>
            </div>

            <div className="flex items-center gap-1 pl-3 border-l border-border dark:border-slate-700">
              <ThemeToggle />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 gap-1.5 px-2 rounded-lg text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-100 hover:bg-accent dark:hover:bg-slate-800 transition-colors"
                      aria-label="Menu do usuário"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-blue-500/10 border border-primary/20 dark:border-blue-500/20 flex items-center justify-center text-[10px] font-black text-primary dark:text-blue-400 uppercase overflow-hidden shrink-0">
                        {profilePhotoURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profilePhotoURL} alt="Foto de perfil" className="object-cover w-full h-full" />
                        ) : user.photoURL && user.providerData?.[0]?.providerId === 'google.com' ? (
                          <Image src={user.photoURL} alt="Foto de perfil" width={24} height={24} className="object-cover w-full h-full" />
                        ) : (
                          user.displayName?.[0] ?? user.email?.[0] ?? 'U'
                        )}
                      </div>
                      <ChevronDown className="h-3 w-3 opacity-50" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link key={item.href} href={item.href}>
                          <DropdownMenuItem className={cn('gap-2 rounded-xl font-medium cursor-pointer', isActive && 'text-primary font-bold')}>
                            <Icon className="h-4 w-4 opacity-60" aria-hidden="true" />
                            {item.label}
                          </DropdownMenuItem>
                        </Link>
                      )
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="gap-2 rounded-xl font-medium cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="default" size="sm" className="h-8 gap-2 bg-primary dark:bg-blue-600 hover:bg-primary/90 dark:hover:bg-blue-500 text-primary-foreground dark:text-white text-xs font-bold rounded-lg px-4 shadow-lg shadow-primary/20 dark:shadow-blue-900/20">
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
                  className="h-9 w-9 rounded-lg text-muted-foreground dark:text-slate-400 hover:bg-accent dark:hover:bg-slate-800"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sheet Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-background dark:bg-slate-900 border-border dark:border-slate-800 p-0">
            <SheetHeader className="p-6 border-b border-border dark:border-slate-800">
              <SheetTitle className="flex items-center gap-3 text-foreground dark:text-slate-100">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 dark:bg-blue-500/10 border border-primary/20 dark:border-blue-500/20">
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
                          'bg-transparent text-muted-foreground dark:text-slate-400 hover:bg-accent dark:hover:bg-slate-800 hover:text-foreground dark:hover:text-slate-100',
                          isActive && 'bg-primary/10 dark:bg-blue-500/10 text-primary dark:text-blue-400 font-bold'
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
                {user && (
                  <div className="px-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-500 mb-2 px-2">Conta</p>
                    {userMenuItems.map((item) => {
                      const isActive = pathname === item.href
                      const Icon = item.icon
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                          <Button
                            variant="ghost"
                            className={cn(
                              'w-full justify-start gap-3 h-11 px-4 rounded-xl transition-all',
                              'bg-transparent text-muted-foreground dark:text-slate-400 hover:bg-accent dark:hover:bg-slate-800 hover:text-foreground dark:hover:text-slate-100',
                              isActive && 'bg-primary/10 dark:bg-blue-500/10 text-primary dark:text-blue-400 font-bold'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm">{item.label}</span>
                          </Button>
                        </Link>
                      )
                    })}
                  </div>
                )}

                <div className="px-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-500 mb-3">Sistema</p>
                  <div className="flex items-center justify-between p-3 bg-muted dark:bg-slate-800/50 rounded-xl border border-border dark:border-slate-800">
                    <span className="text-xs text-foreground dark:text-slate-300 font-medium">Tema</span>
                    <ThemeToggle />
                  </div>
                </div>

                <div className="px-2">
                  {user ? (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-11 px-4 rounded-xl text-muted-foreground dark:text-slate-400 hover:text-destructive dark:hover:text-red-400 hover:bg-destructive/10 dark:hover:bg-red-500/10 transition-all"
                      onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm font-medium">Sair da Conta</span>
                    </Button>
                  ) : (
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="default" className="w-full justify-center gap-2 h-11 rounded-xl bg-primary dark:bg-blue-600 hover:bg-primary/90 dark:hover:bg-blue-500 text-primary-foreground dark:text-white font-bold shadow-lg shadow-primary/20 dark:shadow-blue-900/20">
                        <LogIn className="h-4 w-4" />
                        Entrar
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Data/Hora no mobile */}
              <div className="mt-auto pt-6 border-t border-border dark:border-slate-800 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium text-muted-foreground dark:text-slate-500 bg-muted dark:bg-slate-800/30 rounded-full border border-border dark:border-slate-800/50">
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

