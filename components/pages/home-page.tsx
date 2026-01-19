'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { DisciplineFormRef } from '@/components/features/discipline-form'
import { useAuth } from '@/components/auth-provider'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { collection, query, where, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { calcularResultado } from '@/lib/utils'
import { handleError } from '@/lib/error-handler'
import type { Curso, Disciplina, Certificado } from '@/types'
import { toast } from '@/lib/toast'
import { logger } from '@/lib/logger'
import { createDisciplinaId } from '@/lib/constants'

// Carregamento dinâmico para componentes pesados ou que usam libs grandes
const CourseSelection = dynamic(() => import('@/components/features/course-selection').then(mod => mod.CourseSelection), {
  ssr: true,
  loading: () => <div className="h-20 animate-pulse bg-muted/10 rounded-lg" />
})

const DisciplineSearch = dynamic(() => import('@/components/features/discipline-search').then(mod => mod.DisciplineSearch), {
  ssr: false,
  loading: () => <div className="h-24 animate-pulse bg-muted/10 rounded-lg mt-4" />
})

const DisciplineForm = dynamic(() => import('@/components/features/discipline-form').then(mod => mod.DisciplineForm), {
  ssr: false,
  loading: () => <div className="h-40 animate-pulse bg-muted/10 rounded-lg mt-8" />
})

const AcademicHistory = dynamic(() => import('@/components/features/academic-history').then(mod => mod.AcademicHistory), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse bg-muted/10 rounded-lg" />
})

const Summary = dynamic(() => import('@/components/features/summary').then(mod => mod.Summary), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false
})

const Simulation = dynamic(() => import('@/components/features/simulation').then(mod => mod.Simulation), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false
})

export function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const [cursoAtual, setCursoAtual] = useState<Curso>('BICTI')
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef<DisciplineFormRef>(null)

  const loadDisciplinas = useCallback(async () => {
    setIsLoading(true)
    try {
      if (user && db) {
        // Carregar do Firebase se usuário estiver autenticado
        const disciplinesRef = collection(db, 'disciplines')
        const q = query(disciplinesRef, where('userId', '==', user.uid))
        const querySnapshot = await getDocs(q)

        const disciplinasFirebase: Disciplina[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()

          // Calcular resultado se não existir (AC não tem resultado)
          let resultado = data.resultado
          if (!resultado && data.natureza !== 'AC' && data.nota !== undefined && data.nota !== null) {
            resultado = calcularResultado(
              data.nota,
              data.trancamento,
              data.dispensada,
              data.emcurso,
              data.natureza
            )
          } else if (data.natureza === 'AC') {
            // AC não tem resultado
            resultado = undefined
          }

          disciplinasFirebase.push({
            id: doc.id,
            periodo: data.periodo || '',
            codigo: data.codigo || '',
            nome: data.nome || '',
            natureza: data.natureza || 'OB',
            ch: data.ch || data.horas || data.hours || 0,
            nota: data.nota !== undefined && data.nota !== null ? data.nota : 0,
            trancamento: data.trancamento || false,
            dispensada: data.dispensada || false,
            emcurso: data.emcurso || false,
            resultado: resultado as 'AP' | 'RR' | 'TR' | 'DP' | undefined,
            curso: data.curso || 'BICTI',
            createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
          } as Disciplina)
        })

        // Carregar certificados do Firebase
        const certificadosRef = collection(db, 'certificados')
        const qCert = query(certificadosRef, where('userId', '==', user.uid))
        const certSnapshot = await getDocs(qCert)

        const certificadosFirebase: Certificado[] = []
        certSnapshot.forEach((doc) => {
          const data = doc.data()
          certificadosFirebase.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
          } as Certificado)
        })

        setCertificados(certificadosFirebase)

        // Filtrar por curso atual
        let disciplinasDoCurso = disciplinasFirebase.filter((d) => d.curso === cursoAtual)

        // Ordenar por período (mais recente primeiro) e depois por data de criação
        disciplinasDoCurso.sort((a, b) => {
          // Primeiro ordenar por período
          const [anoA, semA] = a.periodo.split('.').map(Number)
          const [anoB, semB] = b.periodo.split('.').map(Number)

          if (anoA !== anoB) {
            return anoB - anoA // Ano mais recente primeiro
          }
          if (semA !== semB) {
            return semB - semA // Semestre mais recente primeiro
          }

          // Se período igual, ordenar por data de criação
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || 0)
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || 0)
          return dateB.getTime() - dateA.getTime()
        })

        setDisciplinas(disciplinasDoCurso)

        // Sincronizar com localStorage também
        localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(disciplinasDoCurso))
      } else {
        // Fallback para localStorage se não estiver autenticado
        const stored = localStorage.getItem(`disciplinas_${cursoAtual}`)
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            setDisciplinas(Array.isArray(parsed) ? parsed : [])
          } catch (error) {
            logger.error('Erro ao parsear disciplinas do localStorage:', error)
            setDisciplinas([])
          }
        } else {
          setDisciplinas([])
        }
      }
    } catch (error: unknown) {
      logger.error('Erro ao carregar disciplinas:', error)
      // Fallback para localStorage em caso de erro
      try {
        const stored = localStorage.getItem(`disciplinas_${cursoAtual}`)
        if (stored) {
          const parsed = JSON.parse(stored)
          setDisciplinas(Array.isArray(parsed) ? parsed : [])
        } else {
          setDisciplinas([])
        }
      } catch (e) {
        setDisciplinas([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [cursoAtual, user])

  // Carregar disciplinas do Firebase ou localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (authLoading) return

    // Se não houver usuário autenticado, limpar disciplinas
    if (!user) {
      setDisciplinas([])
      return
    }

    // Carregar disciplinas do Firestore quando usuário estiver autenticado
    loadDisciplinas()
  }, [cursoAtual, user, authLoading, loadDisciplinas])

  const handleCursoChange = (curso: Curso) => {
    // Evitar atualização se o curso for o mesmo
    if (curso === cursoAtual) return

    // Salvar disciplinas do curso atual no localStorage antes de mudar
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(disciplinas))
      } catch (error) {
        logger.error('Erro ao salvar disciplinas:', error)
      }
    }
    setCursoAtual(curso)
  }

  const handleAddDisciplina = async (disciplina: Disciplina) => {
    try {
      // Adicionar ao Firebase se usuário estiver autenticado
      if (user && db) {
        const disciplineData = {
          ...disciplina,
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Remover id se existir (será gerado pelo Firestore)
        delete (disciplineData as any).id

        const docRef = await addDoc(collection(db, 'disciplines'), disciplineData)
        disciplina.id = createDisciplinaId(docRef.id)
      }

      // Atualizar estado local
      const novasDisciplinas = [...disciplinas, disciplina]
      setDisciplinas(novasDisciplinas)

      // Salvar no localStorage também
      localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(novasDisciplinas))

      toast.success('Disciplina adicionada!', {
        description: disciplina.nome,
        duration: 3000,
      })
    } catch (error: unknown) {
      logger.error('Error adding discipline:', error)
      const errorData = handleError(error)
      // Em caso de erro, ainda adicionar localmente mas logar o erro
      logger.warn('Adicionando disciplina apenas localmente devido ao erro:', { error: errorData.message })
      const novasDisciplinas = [...disciplinas, disciplina]
      setDisciplinas(novasDisciplinas)
      localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(novasDisciplinas))

      toast.error(errorData.message)
    }
  }

  const handleUpdateDisciplina = async (disciplina: Disciplina, index: number) => {
    try {
      // Atualizar no Firebase se usuário estiver autenticado e disciplina tiver id
      if (user && db && disciplina.id) {
        const disciplineRef = doc(db, 'disciplines', disciplina.id)
        const disciplineData = {
          ...disciplina,
          updatedAt: new Date(),
        }
        // Remover campos que não devem ser salvos
        delete (disciplineData as any).id
        await updateDoc(disciplineRef, disciplineData)
      }

      // Atualizar estado local
      const novasDisciplinas = [...disciplinas]
      novasDisciplinas[index] = disciplina
      setDisciplinas(novasDisciplinas)

      // Salvar no localStorage também
      localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(novasDisciplinas))

      toast.success('Disciplina atualizada!', {
        description: disciplina.nome,
        duration: 3000,
      })
    } catch (error: unknown) {
      logger.error('Error saving data:', error)
      const errorData = handleError(error)
      logger.warn('Atualizando disciplina apenas localmente devido ao erro:', { error: errorData.message })
      // Mesmo com erro, atualizar localmente
      const novasDisciplinas = [...disciplinas]
      novasDisciplinas[index] = disciplina
      setDisciplinas(novasDisciplinas)
      localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(novasDisciplinas))

      toast.error(errorData.message)
    }
  }

  const handleRemoveDisciplina = async (index: number) => {
    const disciplinaRemovida = disciplinas[index]

    try {
      // Remover do Firebase se usuário estiver autenticado e disciplina tiver id
      if (user && db && disciplinaRemovida.id) {
        const disciplineRef = doc(db, 'disciplines', disciplinaRemovida.id)
        await deleteDoc(disciplineRef)
      }

      // Atualizar estado local
      const novasDisciplinas = disciplinas.filter((_, i) => i !== index)
      setDisciplinas(novasDisciplinas)

      // Salvar no localStorage também
      localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(novasDisciplinas))

      toast.success('Disciplina removida!', {
        description: disciplinaRemovida.nome,
        duration: 3000,
      })
    } catch (error: unknown) {
      logger.error('Error removing discipline:', error)
      const errorData = handleError(error)
      logger.warn('Removendo disciplina apenas localmente devido ao erro:', { error: errorData.message })
      // Mesmo com erro, remover localmente
      const novasDisciplinas = disciplinas.filter((_, i) => i !== index)
      setDisciplinas(novasDisciplinas)
      localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(novasDisciplinas))

      toast.error(errorData.message)
    }
  }

  const handleEditDisciplina = (disciplina: Disciplina, index: number) => {
    formRef.current?.editDiscipline(disciplina, index)
  }

  const handleDisciplineSelect = (disciplina: { codigo: string; nome: string; natureza: string; ch?: number }) => {
    formRef.current?.fillForm(disciplina)
  }

  return (
    <>
      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Carregando disciplinas...</p>
        </div>
      )}

      <CourseSelection cursoAtual={cursoAtual} onCursoChange={handleCursoChange} />

      <DisciplineSearch cursoAtual={cursoAtual} onSelect={handleDisciplineSelect} />

      <DisciplineForm
        ref={formRef}
        cursoAtual={cursoAtual}
        onAdd={handleAddDisciplina}
        onUpdate={handleUpdateDisciplina}
        disciplinas={disciplinas}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <AcademicHistory
            disciplinas={disciplinas}
            cursoAtual={cursoAtual}
            onRemove={handleRemoveDisciplina}
            onEdit={handleEditDisciplina}
          />
        </div>
        <div className="lg:col-span-1">
          <Summary disciplinas={disciplinas} certificados={certificados} cursoAtual={cursoAtual} />
        </div>
      </div>

      <Simulation disciplinas={disciplinas} cursoAtual={cursoAtual} />
    </>
  )
}
