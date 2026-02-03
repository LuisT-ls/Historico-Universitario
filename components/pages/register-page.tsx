'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { handleError, type AppError } from '@/lib/error-handler'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, User, Loader2, ArrowLeft, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from '@/lib/toast'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const registerSchema = z
  .object({
    name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    if (!auth) return

    setIsLoading(true)
    setError(null)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      await updateProfile(userCredential.user, { displayName: data.name })
      toast.success('Cadastro realizado com sucesso!')
      router.push('/')
    } catch (err: unknown) {
      const appError = handleError(err)
      setError(appError)
      toast.error(appError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Ambient Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-[440px] z-10"
      >
        <Card className="w-full border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden">
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
              <CardTitle as="h1" className="text-2xl font-bold tracking-tight text-white">Criar Cadastro</CardTitle>
              <CardDescription className="text-slate-400">Comece sua jornada acadêmica hoje.</CardDescription>
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
                <Label htmlFor="name" className="text-xs font-bold uppercase text-slate-500 group-focus-within:text-blue-500 transition-colors">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors duration-300" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    className="pl-10 h-11 bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder:text-slate-600 text-slate-200 rounded-lg"
                    {...register('name')}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
              </div>

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
                <Label htmlFor="password" className="text-xs font-bold uppercase text-slate-500 group-focus-within:text-blue-500 transition-colors">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors duration-300" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-10 pr-10 h-11 bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder:text-slate-600 text-slate-200 rounded-lg"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase text-slate-500 group-focus-within:text-blue-500 transition-colors">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors duration-300" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repita sua senha"
                    className="pl-10 h-11 bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder:text-slate-600 text-slate-200 rounded-lg"
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 transition-all duration-300 shadow-lg shadow-blue-500/20 border-0" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <span className="flex items-center">Cadastrar <ArrowRight className="ml-2 h-4 w-4 opacity-50" /></span>}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-white/5 bg-slate-950/30 py-6">
            <div className="text-center text-sm">
              <span className="text-slate-500">Já tem uma conta? </span>
              <Link href="/login" className="font-semibold text-blue-500 hover:text-blue-400 transition-colors">Fazer login</Link>
            </div>
            <Link href="/login" className="flex items-center text-xs text-slate-500 hover:text-white transition-colors">
              <ArrowLeft className="mr-2 h-3 w-3" />
              Voltar
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
