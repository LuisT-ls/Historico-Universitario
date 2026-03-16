'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { DisciplineFormRef } from '@/components/features/discipline-form'
import { useAuth } from '@/components/auth-provider'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { getDisciplines, addDiscipline, updateDiscipline, deleteDiscipline, getCertificates, getProfile } from '@/services/firestore.service'
import { normalizeText } from '@/lib/utils'
import { handleError } from '@/lib/error-handler'
import type { Curso, Disciplina, Certificado, Profile } from '@/types'
import { toast } from '@/lib/toast'
import { logger } from '@/lib/logger'
import { createDisciplinaId } from '@/lib/constants'

const ActionBar = dynamic(() => import('@/components/features/action-bar').then(mod => mod.ActionBar), {
  ssr: false,
  loading: () => <div className="h-14 animate-pulse bg-muted/10 rounded-xl mb-6" />
})

const DisciplineSearch = dynamic(() => import('@/components/features/discipline-search').then(mod => mod.DisciplineSearch), {
  ssr: false,
  loading: () => <div className="h-12 animate-pulse bg-muted/10 rounded-xl mt-4" />
})

const DisciplineForm = dynamic(() => import('@/components/features/discipline-form').then(mod => mod.DisciplineForm), {
  ssr: false,
})

const AcademicHistory = dynamic(() => import('@/components/features/academic-history').then(mod => mod.AcademicHistory), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse bg-muted/10 rounded-2xl" />
})

const Summary = dynamic(() => import('@/components/features/summary').then(mod => mod.Summary), {
  loading: () => <Skeleton className="h-64 w-full rounded-2xl" />,
  ssr: false
})

const Recommendations = dynamic(() => import('@/components/features/recommendations').then(mod => mod.Recommendations), {
  ssr: false,
})

const PrintView = dynamic(() => import('@/components/features/print-view').then(mod => mod.PrintView), {
  ssr: false,
})

const AcademicCalendar = dynamic(() => import('@/components/features/academic-calendar').then(mod => mod.AcademicCalendar), {
  ssr: false,
})

export function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const [cursoAtual, setCursoAtual] = useState<Curso>('BICTI')
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef<DisciplineFormRef>(null)

  const loadDisciplinas = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const [todasDisciplinas, certificadosData, profileData] = await Promise.all([
        getDisciplines(user.uid),
        getCertificates(user.uid),
        getProfile(user.uid),
      ])

      setCertificados(certificadosData)

      const disciplinasDoCurso = todasDisciplinas
        .filter((d) => d.curso === cursoAtual)
        .sort((a, b) => {
          const [anoA, semA] = a.periodo.split('.').map(Number)
          const [anoB, semB] = b.periodo.split('.').map(Number)
          if (anoA !== anoB) return anoB - anoA
          return semB - semA
        })

      setDisciplinas(disciplinasDoCurso)

      if (profileData) setProfile(profileData)
    } catch (error: unknown) {
      logger.error('Erro ao carregar disciplinas:', error)
    } finally {
      setIsLoading(false)
    }
  }, [cursoAtual, user])

  useEffect(() => {
    if (typeof window === 'undefined' || authLoading) return
    if (!user) {
      setDisciplinas([])
      return
    }
    loadDisciplinas()
  }, [cursoAtual, user, authLoading, loadDisciplinas])

  const handleCursoChange = (curso: Curso) => {
    if (curso === cursoAtual) return
    setCursoAtual(curso)
  }

  const handleAddDisciplina = async (disciplina: Disciplina) => {
    try {
      if (user) {
        const { id, ...disciplinaWithoutId } = disciplina
        const docId = await addDiscipline(disciplinaWithoutId, user.uid)
        disciplina.id = createDisciplinaId(docId)
      }
      const novas = [...disciplinas, disciplina]
      setDisciplinas(novas)
      if (!user) localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(novas))
      toast.success('Disciplina adicionada!')
    } catch (error) {
      logger.error('Error adding discipline:', error)
    }
  }

  const handleUpdateDisciplina = async (disciplina: Disciplina, index: number) => {
    try {
      if (user && disciplina.id) {
        await updateDiscipline(disciplina.id, disciplina)
      }
      const novas = [...disciplinas]
      novas[index] = disciplina
      setDisciplinas(novas)
      if (!user) localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(novas))
      toast.success('Disciplina atualizada!')
    } catch (error) {
      logger.error('Error saving data:', error)
    }
  }

  const handleRemoveDisciplina = (index: number) => {
    const disc = disciplinas[index]
    const disciplinasAntes = [...disciplinas]

    // Atualiza a UI imediatamente (otimista)
    const novas = disciplinas.filter((_, i) => i !== index)
    setDisciplinas(novas)
    if (!user) localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(novas))

    let undone = false

    const timeoutId = setTimeout(async () => {
      if (undone) return
      try {
        if (user && disc.id) {
          await deleteDiscipline(disc.id)
        }
      } catch (error) {
        logger.error('Error removing discipline:', error)
        setDisciplinas(disciplinasAntes)
        if (!user) localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(disciplinasAntes))
      }
    }, 5000)

    toast.success(`"${disc.nome}" removida`, {
      action: {
        label: 'Desfazer',
        onClick: () => {
          undone = true
          clearTimeout(timeoutId)
          setDisciplinas(disciplinasAntes)
          if (!user) localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(disciplinasAntes))
          toast.success('Remoção desfeita.')
        },
      },
      duration: 5000,
    })
  }

  const handleImportDisciplinas = async (disciplinasImportadas: Disciplina[]) => {
    setIsLoading(true)
    try {
      logger.info(`Iniciando importação de ${disciplinasImportadas.length} disciplinas`)

      // Adicionar curso atual às disciplinas importadas se não tiver
      const disciplinasProcessadas = disciplinasImportadas.map((d, index) => ({
        ...d,
        curso: d.curso || cursoAtual,
      }))

      let novas = 0
      let puladas = 0
      const batchProcessed = new Set<string>() // Para evitar duplicatas internas no mesmo PDF

      if (user) {
        // Usuário logado: salvar no Firebase
        logger.info('Usuário autenticado - processando no Firebase')

        for (const disciplina of disciplinasProcessadas) {
          const key = `${normalizeText(disciplina.codigo)}-${normalizeText(disciplina.periodo)}`

          // Verificar duplicata interna no PDF
          if (batchProcessed.has(key)) {
            puladas++
            continue
          }

          try {
            // Verificar se disciplina já existe no histórico atual (Firebase)
            const jaExiste = disciplinas.find(
              (d) =>
                normalizeText(d.codigo) === normalizeText(disciplina.codigo) &&
                normalizeText(d.periodo) === normalizeText(disciplina.periodo)
            )

            if (jaExiste) {
              // Conforme solicitado pelo usuário, não duplicar e nem atualizar (apenas pular)
              puladas++
              batchProcessed.add(key)
              continue
            }

            // Criar nova via service layer
            const { id, ...disciplinaWithoutId } = disciplina
            await addDiscipline({
              ...disciplinaWithoutId,
              curso: disciplina.curso || cursoAtual,
            }, user.uid)
            novas++
            batchProcessed.add(key)
          } catch (error) {
            logger.error(`Erro ao salvar disciplina ${disciplina.codigo}:`, error)
          }
        }

        // Recarregar disciplinas do Firebase para garantir sincronização
        await loadDisciplinas()
      } else {
        // Usuário não logado: salvar apenas no localStorage
        logger.info('Usuário não autenticado - salvando apenas localmente')

        const listaAtualizada = [...disciplinas]

        disciplinasProcessadas.forEach((disciplina) => {
          const key = `${normalizeText(disciplina.codigo)}-${normalizeText(disciplina.periodo)}`

          if (batchProcessed.has(key)) {
            puladas++
            return
          }

          const jaExiste = listaAtualizada.find(
            (d) =>
              normalizeText(d.codigo) === normalizeText(disciplina.codigo) &&
              normalizeText(d.periodo) === normalizeText(disciplina.periodo)
          )

          if (jaExiste) {
            puladas++
            batchProcessed.add(key)
            return
          }

          // Criar nova local
          listaAtualizada.push({
            ...disciplina,
            id: disciplina.id || createDisciplinaId(`local-${Date.now()}-${batchProcessed.size}`),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          novas++
          batchProcessed.add(key)
        })

        // Filtrar e ordenar
        const disciplinasDoCurso = listaAtualizada.filter((d) => d.curso === cursoAtual)
        disciplinasDoCurso.sort((a, b) => {
          const [anoA, semA] = a.periodo.split('.').map(Number)
          const [anoB, semB] = b.periodo.split('.').map(Number)
          if (anoA !== anoB) return anoB - anoA
          return semB - semA
        })

        setDisciplinas(disciplinasDoCurso)
        localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(disciplinasDoCurso))
      }

      const msg = `Importação concluída: ${novas} novas adicionadas.`
      if (puladas > 0) {
        toast.info(`${msg} (${puladas} duplicatas ignoradas).`)
      } else {
        toast.success(msg)
      }
    } catch (error) {
      logger.error('Erro ao importar disciplinas:', error)
      toast.error('Erro ao importar disciplinas. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      <ActionBar cursoAtual={cursoAtual} onCursoChange={handleCursoChange} onImport={handleImportDisciplinas} />

      <AcademicCalendar />

      <div className="space-y-1">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground dark:text-muted-foreground/60 px-1">Busca Rápida</h2>
        <DisciplineSearch cursoAtual={cursoAtual} onSelect={(d) => formRef.current?.fillForm(d)} />
      </div>

      <Summary disciplinas={disciplinas} certificados={certificados} cursoAtual={cursoAtual} profile={profile || undefined} />

      <Recommendations
        disciplinas={disciplinas}
        cursoAtual={cursoAtual}
        onSelect={(d) => formRef.current?.fillForm(d)}
      />

      <AcademicHistory disciplinas={disciplinas} cursoAtual={cursoAtual} onRemove={handleRemoveDisciplina} onEdit={(d, i) => formRef.current?.editDiscipline(d, i)} />

      <DisciplineForm ref={formRef} cursoAtual={cursoAtual} onAdd={handleAddDisciplina} onUpdate={handleUpdateDisciplina} disciplinas={disciplinas} />

      {/* Componente invisível na tela — renderizado apenas na impressão */}
      <PrintView disciplinas={disciplinas} certificados={certificados} cursoAtual={cursoAtual} profile={profile} />
    </div>
  )
}
