'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { DisciplineFormRef } from '@/components/features/discipline-form'
import { useAuth } from '@/components/auth-provider'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { collection, query, where, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { calcularResultado, normalizeText } from '@/lib/utils'
import { handleError } from '@/lib/error-handler'
import type { Curso, Disciplina, Certificado } from '@/types'
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

export function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const [cursoAtual, setCursoAtual] = useState<Curso>('BICTI')
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef<DisciplineFormRef>(null)

  const loadDisciplinas = useCallback(async () => {
    if (!user || !db) return
    setIsLoading(true)
    try {
      const disciplinesRef = collection(db, 'disciplines')
      const q = query(disciplinesRef, where('userId', '==', user.uid))
      const querySnapshot = await getDocs(q)

      const disciplinasFirebase: Disciplina[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        let resultado = data.resultado
        if (!resultado && data.natureza !== 'AC' && data.nota !== undefined && data.nota !== null) {
          resultado = calcularResultado(data.nota, data.trancamento, data.dispensada, data.emcurso, data.natureza)
        } else if (data.natureza === 'AC') {
          resultado = undefined
        }

        disciplinasFirebase.push({
          id: doc.id,
          periodo: data.periodo || '',
          codigo: data.codigo || '',
          nome: data.nome || '',
          natureza: data.natureza || 'OB',
          ch: data.ch || 0,
          nota: data.nota !== undefined && data.nota !== null ? data.nota : 0,
          trancamento: data.trancamento || false,
          dispensada: data.dispensada || false,
          emcurso: data.emcurso || false,
          resultado: resultado as any,
          curso: data.curso || 'BICTI',
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
        } as Disciplina)
      })

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
      let disciplinasDoCurso = disciplinasFirebase.filter((d) => d.curso === cursoAtual)
      disciplinasDoCurso.sort((a, b) => {
        const [anoA, semA] = a.periodo.split('.').map(Number)
        const [anoB, semB] = b.periodo.split('.').map(Number)
        if (anoA !== anoB) return anoB - anoA
        return semB - semA
      })

      setDisciplinas(disciplinasDoCurso)
      localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(disciplinasDoCurso))
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
      if (user && db) {
        const disciplineData = {
          ...disciplina,
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        delete (disciplineData as any).id
        const docRef = await addDoc(collection(db, 'disciplines'), disciplineData)
        disciplina.id = createDisciplinaId(docRef.id)
      }
      const novas = [...disciplinas, disciplina]
      setDisciplinas(novas)
      localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(novas))
      toast.success('Disciplina adicionada!')
    } catch (error) {
      logger.error('Error adding discipline:', error)
    }
  }

  const handleUpdateDisciplina = async (disciplina: Disciplina, index: number) => {
    try {
      if (user && db && disciplina.id) {
        const disciplineRef = doc(db, 'disciplines', disciplina.id)
        const data = { ...disciplina, updatedAt: new Date() }
        delete (data as any).id
        await updateDoc(disciplineRef, data)
      }
      const novas = [...disciplinas]
      novas[index] = disciplina
      setDisciplinas(novas)
      localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(novas))
      toast.success('Disciplina atualizada!')
    } catch (error) {
      logger.error('Error saving data:', error)
    }
  }

  const handleRemoveDisciplina = async (index: number) => {
    const disc = disciplinas[index]
    try {
      if (user && db && disc.id) {
        await deleteDoc(doc(db, 'disciplines', disc.id))
      }
      const novas = disciplinas.filter((_, i) => i !== index)
      setDisciplinas(novas)
      localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(novas))
      toast.success('Disciplina removida!')
    } catch (error) {
      logger.error('Error removing discipline:', error)
    }
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
      let atualizadas = 0

      if (user && db) {
        // Usuário logado: salvar no Firebase
        logger.info('Usuário autenticado - processando no Firebase')

        for (const disciplina of disciplinasProcessadas) {
          try {
            // Verificar se disciplina já existe (Código e Período)
            // Usar normalização para garantir match mesmo com pequenas diferenças
            const disciplinaExistente = disciplinas.find(
              (d) =>
                normalizeText(d.codigo) === normalizeText(disciplina.codigo) &&
                normalizeText(d.periodo) === normalizeText(disciplina.periodo)
            )

            if (disciplinaExistente && disciplinaExistente.id) {
              // Atualizar existente
              const disciplineRef = doc(db, 'disciplines', disciplinaExistente.id)
              const data = {
                ...disciplina,
                userId: user.uid,
                updatedAt: new Date(),
              }
              delete (data as any).id // Garantir que não sobrescreva ID
              await updateDoc(disciplineRef, data)
              atualizadas++
            } else {
              // Criar nova
              const disciplineData = {
                ...disciplina,
                userId: user.uid,
                curso: disciplina.curso || cursoAtual,
                createdAt: new Date(),
                updatedAt: new Date(),
              }
              delete (disciplineData as any).id

              await addDoc(collection(db, 'disciplines'), disciplineData)
              novas++
            }
          } catch (error) {
            logger.error(`Erro ao salvar disciplina ${disciplina.codigo}:`, error)
            // Continua com as outras disciplinas mesmo se uma falhar
          }
        }

        // Recarregar disciplinas do Firebase para garantir sincronização
        await loadDisciplinas()
      } else {
        // Usuário não logado: salvar apenas no localStorage e estado local
        logger.info('Usuário não autenticado - salvando apenas localmente')

        const listaAtualizada = [...disciplinas]

        disciplinasProcessadas.forEach((disciplina, index) => {
          const indexExistente = listaAtualizada.findIndex(
            (d) =>
              normalizeText(d.codigo) === normalizeText(disciplina.codigo) &&
              normalizeText(d.periodo) === normalizeText(disciplina.periodo)
          )

          if (indexExistente >= 0) {
            // Atualizar existente
            listaAtualizada[indexExistente] = {
              ...listaAtualizada[indexExistente],
              ...disciplina,
              updatedAt: new Date(),
            }
            atualizadas++
          } else {
            // Criar nova
            listaAtualizada.push({
              ...disciplina,
              id: disciplina.id || createDisciplinaId(`local-${Date.now()}-${index}`),
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            novas++
          }
        })

        // Filtrar apenas disciplinas do curso atual
        const disciplinasDoCurso = listaAtualizada.filter((d) => d.curso === cursoAtual)

        // Ordenar por período
        disciplinasDoCurso.sort((a, b) => {
          const [anoA, semA] = a.periodo.split('.').map(Number)
          const [anoB, semB] = b.periodo.split('.').map(Number)
          if (anoA !== anoB) return anoB - anoA
          return semB - semA
        })

        // Atualizar estado local
        setDisciplinas(disciplinasDoCurso)

        // Salvar no localStorage
        localStorage.setItem(`disciplinas_${cursoAtual}`, JSON.stringify(disciplinasDoCurso))
      }

      toast.success(`Importação concluída: ${novas} novas, ${atualizadas} atualizadas.`)
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

      <div className="space-y-1">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground dark:text-muted-foreground/60 px-1">Busca Rápida</h2>
        <DisciplineSearch cursoAtual={cursoAtual} onSelect={(d) => formRef.current?.fillForm(d)} />
      </div>

      <Summary disciplinas={disciplinas} certificados={certificados} cursoAtual={cursoAtual} />

      <AcademicHistory disciplinas={disciplinas} cursoAtual={cursoAtual} onRemove={handleRemoveDisciplina} onEdit={(d, i) => formRef.current?.editDiscipline(d, i)} />

      <DisciplineForm ref={formRef} cursoAtual={cursoAtual} onAdd={handleAddDisciplina} onUpdate={handleUpdateDisciplina} disciplinas={disciplinas} />
    </div>
  )
}
