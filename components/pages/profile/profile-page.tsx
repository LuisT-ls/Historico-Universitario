'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Loader2, GraduationCap } from 'lucide-react'
import { getProfile, getDisciplines, getCertificates, updateProfile } from '@/services/firestore.service'
import { CURSOS, CONCENTRACOES_BICTI, CONCENTRACOES_BIHUM, INSTITUTOS, createUserId } from '@/lib/constants'
import { calcularEstatisticas, getCurrentSemester } from '@/lib/utils'
import { exportAsJSON, exportAsXLSX, exportAsPDF } from '@/lib/export-utils'
import { toast, setNotificationsEnabled } from '@/lib/toast'
import { logger } from '@/lib/logger'
import type { Profile, Curso, UserStatistics } from '@/types'
import { ProfileStatsSection } from './profile-stats-section'
import { ProfilePersonalSection } from './profile-personal-section'
import { ProfileCurriculumSection } from './profile-curriculum-section'
import { ProfileSettingsSection } from './profile-settings-section'
import { ProfileSecuritySection } from './profile-security-section'

export function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [initialProfile, setInitialProfile] = useState<Profile | null>(null)
  const [statistics, setStatistics] = useState<UserStatistics>({
    totalDisciplines: 0,
    completedDisciplines: 0,
    inProgressDisciplines: 0,
    averageGrade: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [cursoProgresso, setCursoProgresso] = useState(0)
  const [addCursoValue, setAddCursoValue] = useState('')

  useEffect(() => { if (!authLoading && !user) router.push('/login') }, [user, authLoading, router])
  useEffect(() => { if (!user) return; loadProfile() }, [user])
  useEffect(() => { if (!user || !profile) return; loadStatistics() }, [user, profile])

  const loadProfile = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await getProfile(user.uid)
      const profileData: Profile = data
        ? {
            ...data,
            nome: data.nome || user.displayName || '',
            email: data.email || user.email || '',
            photoURL: data.photoURL || user.photoURL || '',
            startYear: data.startYear ?? new Date().getFullYear(),
            startSemester: data.startSemester ?? '1',
            suspensions: data.suspensions ?? 0,
            currentSemester: data.currentSemester ?? getCurrentSemester(),
            settings: {
              notifications: data.settings?.notifications !== false,
              privacy: data.settings?.privacy ?? 'private',
            },
          }
        : {
            uid: createUserId(user.uid),
            nome: user.displayName || '',
            email: user.email || '',
            cursos: [] as Curso[],
            matricula: '',
            institution: 'Universidade Federal da Bahia',
            startYear: new Date().getFullYear(),
            startSemester: '1',
            suspensions: 0,
            currentSemester: getCurrentSemester(),
            settings: { notifications: true, privacy: 'private' },
          }
      setProfile(profileData)
      setInitialProfile(profileData)
    } catch (error) { logger.error('Erro ao carregar perfil:', error) } finally { setIsLoading(false) }
  }

  const loadStatistics = async (overrideProfile?: Profile) => {
    if (!user) return
    try {
      const [discs, certs] = await Promise.all([getDisciplines(user.uid), getCertificates(user.uid)])
      const p = overrideProfile || profile
      const periodoLetivo = p?.currentSemester || getCurrentSemester()
      const cursoAtivo = (p?.cursos && p.cursos.length > 0 ? p.cursos[p.cursos.length - 1] : p?.curso) as Curso | undefined
      if (cursoAtivo) setStatistics(calcularEstatisticas(discs, certs, cursoAtivo, p || undefined, periodoLetivo))

      const cursoPrimeiro = (p?.cursos?.[0] ?? p?.curso) as Curso | undefined
      if (cursoPrimeiro) {
        const discsCurso = discs.filter(d => d.curso === cursoPrimeiro)
        const statsCurso = calcularEstatisticas(discsCurso, certs, cursoPrimeiro)
        const totalHoras = CURSOS[cursoPrimeiro]?.totalHoras ?? 2401
        setCursoProgresso(Math.min(((statsCurso.totalCH ?? 0) / totalHoras) * 100, 100))
      }
    } catch (error) { logger.error('Erro ao carregar estatísticas:', error) }
  }

  const handleSave = async () => {
    if (!user || !profile) return
    setIsSaving(true)
    try {
      await updateProfile(user.uid, {
        nome: profile.nome || '',
        instituto: profile.instituto,
        cursos: profile.cursos,
        concentracaoBICTI: profile.concentracaoBICTI,
        concentracaoBIHUM: profile.concentracaoBIHUM,
        matricula: profile.matricula,
        institution: profile.institution,
        startYear: profile.startYear,
        startSemester: profile.startSemester,
        cplStartYear: profile.cplStartYear,
        cplStartSemester: profile.cplStartSemester,
        suspensions: profile.suspensions,
        currentSemester: profile.currentSemester,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      toast.success('Perfil atualizado!')
      setInitialProfile(profile)
    } catch { toast.error('Erro ao salvar perfil') } finally { setIsSaving(false) }
  }

  const handleSettingsChange = async (key: string, value: boolean | string) => {
    if (!user || !profile) return
    const newSettings = { ...profile.settings, [key]: value }
    await updateProfile(user.uid, { settings: newSettings })
    setProfile(prev => prev ? ({ ...prev, settings: { ...prev.settings, [key]: value } }) : null)
    if (key === 'notifications') setNotificationsEnabled(value as boolean)
  }

  const handleExportData = async (format: 'json' | 'xlsx' | 'pdf') => {
    if (!user) return
    try {
      const disciplines = await getDisciplines(user.uid)
      const backup = {
        exportedAt: new Date().toISOString(),
        disciplines,
        profile,
        user: { uid: user.uid, email: user.email, displayName: user.displayName },
      }
      if (format === 'json') exportAsJSON(backup)
      else if (format === 'xlsx') await exportAsXLSX(backup, disciplines, statistics)
      else await exportAsPDF(backup, disciplines, statistics)
      toast.success('Dados exportados!')
    } catch { toast.error('Erro ao exportar dados') }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    )
  }

  const cursoAtivo = ((profile?.cursos && profile.cursos.length > 0
    ? profile.cursos[profile.cursos.length - 1]
    : profile?.curso) ?? undefined) as Curso | undefined

  const cursoParaEstrutura = (addCursoValue || cursoAtivo || undefined) as Curso | undefined

  const concentracaoKey = cursoParaEstrutura === 'BI_HUM'
    ? (profile?.concentracaoBIHUM ?? undefined)
    : cursoParaEstrutura === 'BICTI'
    ? (profile?.concentracaoBICTI ?? undefined)
    : undefined

  const configConcentracao = cursoParaEstrutura && concentracaoKey
    ? CURSOS[cursoParaEstrutura]?.concentracoes?.[concentracaoKey]
    : undefined

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        {!isLoading && profile && (!profile.cursos || profile.cursos.length === 0) && (
          <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Configure seu curso</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                Selecione seu curso na seção <strong>Informações Acadêmicas</strong> abaixo para começar a usar o histórico.
              </p>
            </div>
          </div>
        )}

        <div className="mb-16">
          <h1 className="text-4xl font-black tracking-tight mb-2 text-foreground tracking-wide">Meu Perfil</h1>
          <p className="text-slate-400 text-lg">Gerencie suas informações e configurações acadêmicas</p>
        </div>

        <div className="space-y-16">
          <ProfileStatsSection statistics={statistics} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            <ProfilePersonalSection
              profile={profile}
              initialProfile={initialProfile}
              isSaving={isSaving}
              saveSuccess={saveSuccess}
              cursoProgresso={cursoProgresso}
              addCursoValue={addCursoValue}
              onProfileChange={setProfile}
              onInitialProfileChange={setInitialProfile}
              onAddCursoValueChange={setAddCursoValue}
              onSave={handleSave}
            />
            {profile && (
              <ProfileCurriculumSection
                cursoAtivo={cursoAtivo}
                cursoParaEstrutura={cursoParaEstrutura}
                concentracaoKey={concentracaoKey}
                configConcentracao={configConcentracao}
              />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ProfileSettingsSection
              profile={profile}
              onSettingsChange={handleSettingsChange}
            />
            <ProfileSecuritySection
              user={user}
              profile={profile}
              statistics={statistics}
              onExportData={handleExportData}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
