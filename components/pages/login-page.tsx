'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase/config'
import { handleError, type AppError } from '@/lib/error-handler'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    if (!auth) return

    setIsLoading(true)
    setError(null)

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
      router.push('/')
    } catch (err: unknown) {
      setError(handleError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!auth || !googleProvider) return

    setIsLoading(true)
    setError(null)

    try {
      await signInWithPopup(auth, googleProvider)
      router.push('/')
    } catch (err: unknown) {
      setError(handleError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Ambient Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <Card className="w-full max-w-[400px] border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <CardHeader className="text-center space-y-2 pb-6">
          <Link href="/" className="mx-auto block w-fit hover:scale-105 transition-transform duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Image
                src="/assets/img/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="object-contain brightness-0 invert"
                priority
              />
            </div>
          </Link>
          <div className="space-y-1">
            <CardTitle as="h1" className="text-2xl font-bold tracking-tight text-white">Histórico Acadêmico</CardTitle>
            <CardDescription className="text-slate-400">Bem-vindo(a) de volta! Acesse sua conta.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <div className="flex-1">
                <AlertTitle className="text-sm font-bold m-0">{error.title}</AlertTitle>
                <AlertDescription className="text-xs opacity-90">{error.message}</AlertDescription>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-500 group-focus-within:text-blue-500 transition-colors">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors duration-300" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10 h-11 bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder:text-slate-600 text-slate-200 rounded-lg"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold uppercase text-slate-500 group-focus-within:text-blue-500 transition-colors">Senha</Label>
                <Link href="/forgot-password" className="text-xs text-slate-400 hover:text-blue-400 transition-colors">Esqueceu a senha?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors duration-300" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11 bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder:text-slate-600 text-slate-200 rounded-lg"
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 transition-all duration-300 shadow-lg shadow-blue-500/20 border-0" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <span className="flex items-center">Entrar <ArrowRight className="ml-2 h-4 w-4 opacity-50" /></span>}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-800" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900/50 px-2 text-slate-500">Ou entre com</span></div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-300"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>

          <div className="text-center text-sm">
            <span className="text-slate-500">Não tem uma conta? </span>
            <Link href="/register" className="font-semibold text-blue-500 hover:text-blue-400 transition-colors">Criar cadastro</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
