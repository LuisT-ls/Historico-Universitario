'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/50">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Ícone Animado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="relative inline-block"
        >
          <Link href="/" className="mx-auto block hover:opacity-80 transition-opacity">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
              <Image
                src="/assets/img/logo.png"
                alt="Logo"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-2 rounded-lg shadow-lg"
          >
            <Search className="h-5 w-5" />
          </motion.div>
        </motion.div>

        {/* Texto explicativo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h1 className="text-7xl font-bold tracking-tighter text-primary">404</h1>
          <h2 className="text-2xl font-semibold tracking-tight">Página não encontrada</h2>
          <p className="text-muted-foreground text-base">
            Parece que a disciplina ou o caminho que você está procurando não consta na nossa grade curricular.
          </p>
        </motion.div>

        {/* Botões de Ação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
        >
          <Button asChild variant="default" className="h-11 px-8 font-medium">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-11 px-8 font-medium"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Página Anterior
          </Button>
        </motion.div>

        {/* Rodapé sutil */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-muted-foreground pt-8"
        >
          © 2026 Histórico Acadêmico - Organizando sua jornada acadêmica.
        </motion.p>
      </div>
    </div>
  )
}
