'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth-provider'
import { getDisciplines, getCertificates, getProfile } from '@/services/firestore.service'
import { CurriculumMap } from '@/components/features/curriculum-map'
import type { Disciplina, Certificado, Curso, Profile } from '@/types'
import { CURSOS } from '@/lib/constants'
import { Loader2, LayoutGrid } from 'lucide-react'
import { Select } from '@/components/ui/select'

export function GradePage() {
  const { user, loading: authLoading } = useAuth()
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [profile, setProfile] = useState<Profile | undefined>()
  const [curso, setCurso] = useState<Curso>('BICTI')
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const [discs, certs, prof] = await Promise.all([
        getDisciplines(user.uid),
        getCertificates(user.uid),
        getProfile(user.uid),
      ])
      setDisciplinas(discs)
      setCertificados(certs)
      if (prof) {
        setProfile(prof)
        if (prof.curso) setCurso(prof.curso as Curso)
      }
    } catch {
      // CurriculumMap handles empty state gracefully
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && user) load()
  }, [user, authLoading, load])

  if (!authLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <LayoutGrid className="h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
        <p className="text-muted-foreground">Faça login para visualizar sua grade curricular.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground dark:text-slate-100">
            Grade Curricular
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Disciplinas obrigatórias e optativas do seu curso.
          </p>
        </div>

        <Select
          value={curso}
          onChange={(e) => setCurso(e.target.value as Curso)}
          className="w-56 shrink-0 h-10 rounded-lg border border-input bg-background dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          aria-label="Selecionar curso"
        >
          {(Object.keys(CURSOS) as Curso[]).map((key) => (
            <option key={key} value={key}>
              {CURSOS[key].nome}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-20"
          role="status"
          aria-label="Carregando grade curricular"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      ) : (
        <CurriculumMap
          disciplinas={disciplinas}
          certificados={certificados}
          curso={curso}
          profile={profile}
        />
      )}
    </div>
  )
}
