'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress' // Added Progress component
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import {
  User,
  Save,
  Loader2,
  Settings,
  Shield,
  Key,
  Download,
  Trash2,
  Book,
  CheckCircle,
  Clock,
  Star,
  Bell,
  Globe,
  TableProperties,
  Eye,
  EyeOff,
  Camera,
  Calendar,
  Building,
  GraduationCap,
  PlusCircle,
  X
} from 'lucide-react'
import { getProfile, getDisciplines, getCertificates, updateProfile } from '@/services/firestore.service'
import {
  updatePassword,
  deleteAccount,
  reauthenticateWithEmail,
  reauthenticateWithGoogle,
} from '@/services/auth.service'
import { CURSOS, CONCENTRACOES_BICTI } from '@/lib/constants'
import { calcularEstatisticas, sanitizeInput, getCurrentSemester } from '@/lib/utils'
import { getFirebaseErrorMessage } from '@/lib/error-handler'
import type { Profile, Curso, ConcentracaoBICTI, UserStatistics } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { exportAsJSON, exportAsXLSX, exportAsPDF } from '@/lib/export-utils'
import { toast, setNotificationsEnabled } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'
import { createUserId } from '@/lib/constants'

const isProfileDirty = (current: Profile | null, initial: Profile | null): boolean => {
  if (!current || !initial) return false
  return (
    current.nome !== initial.nome ||
    JSON.stringify(current.cursos) !== JSON.stringify(initial.cursos) ||
    current.concentracaoBICTI !== initial.concentracaoBICTI ||
    current.cplStartYear !== initial.cplStartYear ||
    current.cplStartSemester !== initial.cplStartSemester ||
    current.matricula !== initial.matricula ||
    current.institution !== initial.institution ||
    current.startYear !== initial.startYear ||
    current.startSemester !== initial.startSemester ||
    current.suspensions !== initial.suspensions ||
    current.currentSemester !== initial.currentSemester
  )
}

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
  const [showSensitive, setShowSensitive] = useState({
    email: false,
    enrollment: false,
    currentPass: false,
    newPass: false,
    confirmPass: false,
    deletePass: false
  })
  const [settingsSaving, setSettingsSaving] = useState<{ [key: string]: boolean }>({})
  const [settingsSuccess, setSettingsSuccess] = useState<{ [key: string]: boolean }>({})
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' })
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [exportFormat, setExportFormat] = useState<'json' | 'xlsx' | 'pdf'>('json')
  const [uploading, setUploading] = useState(false)
  const [entryInput, setEntryInput] = useState('')
  const [addCursoVisible, setAddCursoVisible] = useState(false)
  const [addCursoValue, setAddCursoValue] = useState<string>('')
  const [bictiProgresso, setBictiProgresso] = useState<number>(0)

  // ... (Image helper functions remain same)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 300
          const scaleSize = MAX_WIDTH / img.width
          canvas.width = MAX_WIDTH
          canvas.height = img.height * scaleSize
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
          resolve(dataUrl)
        }
        img.onerror = (error) => reject(error)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (!file.type.startsWith('image/')) { toast.error('Formato inválido. Use JPG, PNG ou WebP.'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('Arquivo muito grande. Máximo 10MB.'); return }
    try {
      setUploading(true)
      const base64Image = await compressImage(file)
      await updateProfile(user.uid, { photoURL: base64Image })
      setProfile(prev => prev ? ({ ...prev, photoURL: base64Image }) : null)
      toast.success('Foto de perfil atualizada!')
    } catch (error) { toast.error('Erro ao processar imagem') } finally { setUploading(false) }
  }

  // ... (Auth/Profile loading logic remains same)
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
            curso: 'BICTI',
            cursos: ['BICTI'] as Curso[],
            matricula: '',
            institution: '',
            startYear: new Date().getFullYear(),
            startSemester: '1',
            suspensions: 0,
            currentSemester: getCurrentSemester(),
            settings: { notifications: true, privacy: 'private' },
          }
      setProfile(profileData)
      setInitialProfile(profileData)
      setEntryInput(`${profileData.startYear || ''}${profileData.startSemester ? '.' + profileData.startSemester : ''}`)
    } catch (error) { logger.error('Erro ao carregar perfil:', error) } finally { setIsLoading(false) }
  }

  const loadStatistics = async (overrideProfile?: Profile) => {
    if (!user) return
    try {
      const [discs, certs] = await Promise.all([getDisciplines(user.uid), getCertificates(user.uid)])
      const p = overrideProfile || profile
      const periodoLetivo = p?.currentSemester || getCurrentSemester()
      const cursoAtivo = (p?.cursos && p.cursos.length > 0 ? p.cursos[p.cursos.length - 1] : p?.curso) || 'BICTI'
      setStatistics(calcularEstatisticas(discs, certs, cursoAtivo, p || undefined, periodoLetivo))

      // Calcula progresso do BICTI com certificados (AC) — fiel ao status geral
      const discsBicti = discs.filter(d => d.curso === 'BICTI')
      const statsBicti = calcularEstatisticas(discsBicti, certs, 'BICTI')
      const totalHorasBicti = CURSOS['BICTI']?.totalHoras ?? 2401
      setBictiProgresso(Math.min(((statsBicti.totalCH ?? 0) / totalHorasBicti) * 100, 100))
    } catch (error) { logger.error('Erro ao carregar estatísticas:', error) }
  }

  const handleSave = async () => {
    if (!user || !profile) return
    setIsSaving(true)
    try {
      await updateProfile(user.uid, {
        nome: sanitizeInput(profile.nome || ''),
        cursos: profile.cursos,
        concentracaoBICTI: profile.concentracaoBICTI,
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
    } catch (error) { toast.error('Erro ao salvar perfil') } finally { setIsSaving(false) }
  }

  const handleSettingsChange = async (key: string, value: boolean | string) => {
    if (!user || !profile) return
    setSettingsSaving(prev => ({ ...prev, [key]: true }))
    try {
      const newSettings = { ...profile.settings, [key]: value }
      await updateProfile(user.uid, { settings: newSettings })
      setProfile(prev => prev ? ({ ...prev, settings: { ...prev.settings, [key]: value } }) : null)
      if (key === 'notifications') setNotificationsEnabled(value as boolean)
      setSettingsSuccess(prev => ({ ...prev, [key]: true }))
      setTimeout(() => setSettingsSuccess(prev => ({ ...prev, [key]: false })), 2000)
    } catch (error) { toast.error('Erro ao salvar configuração') } finally { setSettingsSaving(prev => ({ ...prev, [key]: false })) }
  }

  const handleChangePassword = async () => {
    if (!user || passwordData.new !== passwordData.confirm) return
    try {
      await reauthenticateWithEmail(passwordData.current)
      await updatePassword(passwordData.new)
      toast.success('Senha alterada!')
      setChangePasswordOpen(false)
    } catch (error) { toast.error('Erro ao alterar senha', { description: getFirebaseErrorMessage(error) }) }
  }

  const handleExportData = async () => {
    if (!user) return
    try {
      const disciplines = await getDisciplines(user.uid)
      const backup = { exportedAt: new Date().toISOString(), disciplines, profile, user: { uid: user.uid, email: user.email, displayName: user.displayName } }
      if (exportFormat === 'json') exportAsJSON(backup)
      else if (exportFormat === 'xlsx') await exportAsXLSX(backup, disciplines, statistics)
      else await exportAsPDF(backup, disciplines, statistics)
      toast.success('Dados exportados!')
    } catch (error) { toast.error('Erro ao exportar dados') }
  }

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirm !== 'EXCLUIR') return
    try {
      const isGoogleUser = user.providerData?.some(p => p.providerId === 'google.com')
      if (isGoogleUser) {
        await reauthenticateWithGoogle()
      } else {
        await reauthenticateWithEmail(deletePassword)
      }
      await deleteAccount()
      localStorage.clear()
      router.push('/')
      toast.success('Conta excluída')
    } catch (error) { toast.error('Erro ao excluir conta') }
  }

  const maskSensitive = (val: string | null | undefined, type: 'email' | 'enrollment') => {
    if (!val) return ''
    if (showSensitive[type]) return val
    if (type === 'email') {
      if (!val.includes('@')) return val
      const parts = val.split('@')
      return (parts[0][0] || '') + '••••@' + (parts[1][0] || '') + '••••'
    }
    if (val.length <= 5) return '••••'
    return val.slice(0, 3) + '••••' + val.slice(-2)
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>

  const cursoAtivo: Curso = (profile?.cursos && profile.cursos.length > 0
    ? profile.cursos[profile.cursos.length - 1]
    : profile?.curso) ?? 'BICTI'

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-16">
          <h1 className="text-4xl font-black tracking-tight mb-2 text-foreground tracking-wide">Meu Perfil</h1>
          <p className="text-slate-400 text-lg">Gerencie suas informações e configurações acadêmicas</p>
        </div>

        <div className="space-y-16">
          {/* Stats Section with Glassmorphism */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Disciplinas', value: statistics.totalDisciplines, icon: Book, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: 'Total Cadastrado' },
              { label: 'Concluídas', value: statistics.completedDisciplines, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: `${Math.round((statistics.completedDisciplines / (statistics.totalDisciplines || 1)) * 100)}% Conclusão` },
              { label: 'Em Andamento', value: statistics.inProgressDisciplines, icon: Clock, color: 'text-sky-500', bg: 'bg-sky-500/10', trend: 'Total no Semestre' },
              { label: 'Semestralização', value: statistics.semestralization !== undefined ? statistics.semestralization : '-', icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: 'Período Letivo SIGAA' },
            ].map((stat, i) => (
              <Card key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md p-6 transition-all hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-3xl font-black text-foreground mb-1">{stat.value}</h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">{stat.label}</p>
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                      {stat.trend}
                    </span>
                  </div>
                  <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            {/* Personal Data - Refined Layout */}
            <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl"><User className="h-6 w-6 text-primary" /></div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Dados Pessoais</h2>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Horizontal Layout for Avatar */}
                <div className="flex flex-col items-center gap-4 shrink-0">
                  <div className="relative group">
                    <div className={cn(
                      "h-36 w-36 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-900 shadow-xl flex items-center justify-center bg-muted transition-all hover:border-primary/20",
                      uploading && "opacity-50"
                    )}>
                      {profile?.photoURL ? (
                        <img src={profile.photoURL} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-14 w-14 text-slate-300" />
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-1 right-2 p-2.5 bg-primary text-white rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-transform hover:scale-110"
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    </label>
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alterar Foto</p>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nome Completo</Label>
                      <Input value={profile?.nome || ''} onChange={e => setProfile(prev => prev ? ({ ...prev, nome: e.target.value }) : null)} className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full" />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">E-mail</Label>
                      <div className="relative">
                        <Input disabled value={maskSensitive(profile?.email, 'email')} className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 pr-10 w-full" />
                        <button type="button" onClick={() => setShowSensitive(p => ({ ...p, email: !p.email }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors !bg-transparent !border-none !shadow-none p-1">
                          {showSensitive.email ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Matrícula</Label>
                      <div className="relative">
                        <Input type={showSensitive.enrollment ? "text" : "password"} value={profile?.matricula || ''} onChange={e => setProfile(prev => prev ? ({ ...prev, matricula: e.target.value }) : null)} className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 pr-10 w-full" />
                        <button type="button" onClick={() => setShowSensitive(p => ({ ...p, enrollment: !p.enrollment }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors !bg-transparent !border-none !shadow-none p-1">
                          {showSensitive.enrollment ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Trajetória Acadêmica</Label>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                        {(profile?.cursos ?? []).map((curso, i, arr) => {
                          const isAtual = i === arr.length - 1
                          return (
                            <div key={curso} className="flex items-center justify-between gap-3 px-4 py-3.5 bg-slate-50 dark:bg-slate-900">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={cn(
                                  'h-2 w-2 rounded-full shrink-0',
                                  isAtual ? 'bg-primary ring-4 ring-primary/20' : 'bg-slate-300 dark:bg-slate-600'
                                )} />
                                <span className="text-sm font-medium truncate">{CURSOS[curso]?.nome || curso}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={cn(
                                  'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                                  isAtual
                                    ? 'text-primary bg-primary/10'
                                    : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                                )}>
                                  {isAtual ? 'Atual' : 'Concluído'}
                                </span>
                                {isAtual && arr.length > 1 && (
                                  <button
                                    type="button"
                                    title="Remover curso atual"
                                    onClick={() => setProfile(prev => {
                                      if (!prev?.cursos) return prev
                                      const novos = prev.cursos.filter((_, idx) => idx !== i)
                                      return { ...prev, cursos: novos, curso: novos[novos.length - 1], cplStartYear: undefined, cplStartSemester: undefined }
                                    })}
                                    className="p-1 text-slate-300 hover:text-destructive transition-colors rounded"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        {/* Linha de adicionar CPL */}
                        {(() => {
                          const adicionados = new Set(profile?.cursos ?? [])
                          const disponiveis = (Object.keys(CURSOS) as Curso[]).filter(k => !adicionados.has(k))
                          if (disponiveis.length === 0) return null

                          const bictiConcluido = bictiProgresso >= 100

                          if (!addCursoVisible) {
                            return (
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => bictiConcluido && setAddCursoVisible(true)}
                                  disabled={!bictiConcluido}
                                  title={bictiConcluido ? undefined : `Conclua o BICTI antes de migrar para CPL (${bictiProgresso.toFixed(1)}% concluído)`}
                                  className={cn(
                                    'w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors bg-white dark:bg-slate-950 group',
                                    bictiConcluido
                                      ? 'text-slate-400 hover:text-primary hover:bg-primary/5 cursor-pointer'
                                      : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                  )}
                                >
                                  <PlusCircle className={cn('h-3.5 w-3.5', bictiConcluido && 'group-hover:scale-110 transition-transform')} />
                                  <span>Adicionar progressão CPL...</span>
                                  {!bictiConcluido && (
                                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                      {bictiProgresso.toFixed(1)}% BICTI
                                    </span>
                                  )}
                                </button>
                              </div>
                            )
                          }

                          return (
                            <div className="flex flex-col gap-2 px-4 py-3 bg-white dark:bg-slate-950">
                              <div className="flex items-center gap-2">
                                <Select
                                  value={addCursoValue}
                                  onChange={e => setAddCursoValue(e.target.value)}
                                  className="flex-1 h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                  <option value="">Selecione o curso...</option>
                                  {disponiveis.map(k => (
                                    <option key={k} value={k}>{CURSOS[k]?.nome || k}</option>
                                  ))}
                                </Select>
                                <button
                                  type="button"
                                  onClick={() => { setAddCursoVisible(false); setAddCursoValue('') }}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 space-y-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ingresso no CPL (ex: 2026.1)</label>
                                  <Input
                                    type="text"
                                    placeholder="2026.1"
                                    value={profile?.cplStartYear ? `${profile.cplStartYear}.${profile.cplStartSemester ?? '1'}` : ''}
                                    onChange={e => {
                                      const val = e.target.value
                                      if (!/^[0-9.]*$/.test(val)) return
                                      const parts = val.split('.')
                                      if (parts.length > 2) return
                                      const year = parts[0]
                                      const sem = parts[1]
                                      if (year.length > 4) return
                                      if (sem && !['1', '2'].includes(sem)) return
                                      if (year.length === 4) {
                                        setProfile(prev => prev ? ({
                                          ...prev,
                                          cplStartYear: year,
                                          cplStartSemester: (sem === '1' || sem === '2') ? sem : (prev.cplStartSemester ?? '1'),
                                        }) : null)
                                      }
                                    }}
                                    className="h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm w-full"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="mt-5 shrink-0"
                                  disabled={!addCursoValue || !profile?.cplStartYear}
                                  onClick={() => {
                                    if (!addCursoValue) return
                                    setProfile(prev => {
                                      if (!prev) return prev
                                      const novos = [...(prev.cursos ?? []), addCursoValue as Curso]
                                      return { ...prev, cursos: novos, curso: addCursoValue as Curso }
                                    })
                                    setAddCursoValue('')
                                    setAddCursoVisible(false)
                                  }}
                                >
                                  Confirmar
                                </Button>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                      {(profile?.cursos?.length ?? 0) <= 1 && (
                        <p className="text-xs text-slate-400 pt-0.5">
                          {bictiProgresso >= 100
                            ? 'Concluiu o BICTI? Adicione sua progressão CPL para acompanhar as disciplinas da nova graduação separadamente.'
                            : `Disponível ao concluir o BICTI. Progresso atual: ${bictiProgresso.toFixed(1)}%.`}
                        </p>
                      )}
                    </div>

                    {cursoAtivo === 'BICTI' && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Concentração BICTI</Label>
                        <Select
                          value={profile?.concentracaoBICTI ?? ''}
                          onChange={e => {
                            const val = e.target.value as ConcentracaoBICTI | ''
                            setProfile(prev => prev ? ({ ...prev, concentracaoBICTI: val || undefined }) : null)
                          }}
                          className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Nenhuma (BICTI geral)</option>
                          {(Object.entries(CONCENTRACOES_BICTI) as [ConcentracaoBICTI, { nome: string }][]).map(([key, val]) => (
                            <option key={key} value={key}>{val.nome}</option>
                          ))}
                        </Select>
                        <p className="text-[11px] text-slate-400">Selecione se está seguindo uma trilha de concentração específica.</p>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Ano Ingresso</Label>
                      <Input
                        type="text"
                        placeholder="Ex: 2021.1 ou 2021.2"
                        value={entryInput}
                        onChange={e => {
                          const val = e.target.value
                          // Permite apenas números e um único ponto
                          if (!/^[0-9.]*$/.test(val)) return

                          const partes = val.split('.')
                          if (partes.length > 2) return // Apenas um ponto

                          const year = partes[0]
                          const semester = partes[1]

                          // Valida o ano (máximo 4 dígitos)
                          if (year && year.length > 4) return
                          // Valida o semestre (apenas 1 ou 2 se existir)
                          if (semester && !['1', '2'].includes(semester)) return
                          if (semester && semester.length > 1) return

                          setEntryInput(val)

                          // Só atualiza o profile se tiver um formato válido para cálculo
                          // Se for só o ano, ou ano.semestre
                          if (year.length === 4) {
                            setProfile(prev => {
                              if (!prev) return null
                              return {
                                ...prev,
                                startYear: year,
                                startSemester: (semester === '1' || semester === '2') ? semester : (prev.startSemester || '1')
                              }
                            })
                          }
                        }}
                        className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Suspensões (Trancamentos Totais)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={profile?.suspensions || 0}
                        onChange={e => setProfile(prev => prev ? ({ ...prev, suspensions: parseInt(e.target.value, 10) || 0 }) : null)}
                        className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Período Atual SIGAA</Label>
                      <Input placeholder="Ex: 2025.2" value={profile?.currentSemester || ''} onChange={e => setProfile(prev => prev ? ({ ...prev, currentSemester: e.target.value }) : null)} className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full" />
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Instituição</Label>
                      <Input value={profile?.institution || ''} onChange={e => setProfile(prev => prev ? ({ ...prev, institution: e.target.value }) : null)} className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full" />
                    </div>
                  </div>

                  {isProfileDirty(profile, initialProfile) && (
                    <div className="flex justify-end pt-2 animate-in fade-in slide-in-from-bottom-2">
                      <Button onClick={handleSave} disabled={isSaving} className={cn("h-11 px-8 rounded-xl font-bold transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30", saveSuccess ? "bg-emerald-600 hover:bg-emerald-700" : "")}>
                        {isSaving ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : saveSuccess ? <CheckCircle className="h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                        {isSaving ? 'Salvando...' : saveSuccess ? 'Salvo!' : 'Salvar Alterações'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Curriculum - Dashboard Feel */}
            {profile && (
              <div className="h-full">
                {CURSOS[cursoAtivo]?.metadata ? (
                  <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-violet-500/10 rounded-xl"><GraduationCap className="h-6 w-6 text-violet-500" /></div>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground">Estrutura Curricular</h2>
                    </div>

                    <div className="flex-1 space-y-8">
                      {/* Key Details List */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Informações Principais</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm"><Book className="h-4 w-4 text-slate-400" /></div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Matriz Curricular</p>
                              <p className="text-sm font-semibold text-foreground line-clamp-1">{CURSOS[cursoAtivo].metadata?.matrizCurricular}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm"><Calendar className="h-4 w-4 text-slate-400" /></div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Vigor</p>
                                <p className="text-sm font-semibold text-foreground">{CURSOS[cursoAtivo].metadata?.entradaVigor}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm"><Building className="h-4 w-4 text-slate-400" /></div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Código</p>
                                <p className="text-sm font-semibold text-foreground">{CURSOS[cursoAtivo].metadata?.codigo}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Limits & Deadlines Visualization */}
                      <div className="space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Progresso & Limites</h3>

                        {/* Integralização Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">Integralização do Curso</span>
                            <span className="text-slate-500">{CURSOS[cursoAtivo].metadata?.prazos?.medio} semestres (médio)</span>
                          </div>
                          <div className="relative pt-1">
                            {/* Only visual representation for now as we don't have current term easily accessible here without calculation */}
                            <div className="flex justify-between text-[10px] text-slate-300 dark:text-slate-700 mb-1 px-1">
                              <span>Min: {CURSOS[cursoAtivo].metadata?.prazos?.minimo}</span>
                              <span>Max: {CURSOS[cursoAtivo].metadata?.prazos?.maximo}</span>
                            </div>
                            <Progress value={50} className="h-2.5 bg-slate-100 dark:bg-slate-800" />
                          </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-900 my-4"></div>

                        {/* Class Hours Distribution Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Obrigatórias</p>
                            <p className="text-lg font-bold">{CURSOS[cursoAtivo].metadata?.limites?.chObrigatoriaAula}h</p>
                            <Progress value={100} className="h-1.5 bg-slate-100 dark:bg-slate-800 [&>div]:bg-blue-500" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Optativas (Min)</p>
                            <p className="text-lg font-bold">{CURSOS[cursoAtivo].metadata?.limites?.chOptativaMinima}h</p>
                            <Progress value={40} className="h-1.5 bg-slate-100 dark:bg-slate-800 [&>div]:bg-purple-500" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Complementar (Min)</p>
                            <p className="text-lg font-bold">{CURSOS[cursoAtivo].metadata?.limites?.chComplementarMinima}h</p>
                            <Progress value={30} className="h-1.5 bg-slate-100 dark:bg-slate-800 [&>div]:bg-amber-500" />
                          </div>
                          <div className="space-y-1 text-slate-400">
                            <p className="text-[10px] uppercase font-bold">Max. Período</p>
                            <p className="text-lg font-bold">{CURSOS[cursoAtivo].metadata?.limites?.chPeriodoMaxima}h</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  // Fallback State
                  <Card className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-transparent p-12 h-full flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full mb-4"><Book className="h-6 w-6 text-slate-400" /></div>
                    <h3 className="text-lg font-bold mb-1">Informações Indisponíveis</h3>
                    <p className="text-sm text-slate-500 max-w-xs">Os detalhes curriculares para este curso ainda não foram cadastrados em nossa base.</p>
                  </Card>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Preferences Section */}
            <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-sky-500/10 rounded-xl"><Settings className="h-6 w-6 text-sky-500" /></div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Preferências</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm"><Bell className="h-4 w-4 text-slate-400" /></div>
                    <div>
                      <span className="text-sm font-bold text-foreground block">Notificações</span>
                      <span className="text-[10px] text-slate-500">Alertas de prazos e notas</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleSettingsChange('notifications', !profile?.settings?.notifications)} className={cn("rounded-lg h-8 px-4 font-medium transition-all", profile?.settings?.notifications ? "bg-sky-500/10 text-sky-600 dark:text-sky-400" : "text-slate-500")}>
                    {profile?.settings?.notifications ? 'Ativado' : 'Desativado'}
                  </Button>
                </div>

                <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm"><Globe className="h-4 w-4 text-slate-400" /></div>
                      <div>
                        <span className="text-sm font-bold text-foreground block">Perfil Público</span>
                        <span className="text-[10px] text-slate-500">Compartilhe seu progresso</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleSettingsChange('privacy', profile?.settings?.privacy === 'public' ? 'private' : 'public')} className={cn("rounded-lg h-8 px-4 font-medium transition-all", profile?.settings?.privacy === 'public' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "text-slate-500")}>
                      {profile?.settings?.privacy === 'public' ? 'Público' : 'Privado'}
                    </Button>
                  </div>

                  {profile?.settings?.privacy === 'public' && (
                    <div className="pl-12 animate-in fade-in slide-in-from-top-1">
                      <div className="flex gap-2">
                        <Input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.uid}`} className="h-9 text-xs font-mono bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                        <Button size="sm" variant="outline" className="h-9" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/u/${profile.uid}`); toast.success('Link copiado!') }}>Copiar</Button>
                        <Button size="sm" variant="ghost" className="h-9 w-9 px-0" onClick={() => window.open(`/u/${profile.uid}`, '_blank')}><Eye className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm"><TableProperties className="h-4 w-4 text-slate-400" /></div>
                      <div>
                        <span className="text-sm font-bold text-foreground block">Grade de Horários Pública</span>
                        <span className="text-[10px] text-slate-500">Compartilhe sua grade com colegas</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleSettingsChange('schedulePrivacy', profile?.settings?.schedulePrivacy === 'public' ? 'private' : 'public')} className={cn("rounded-lg h-8 px-4 font-medium transition-all", profile?.settings?.schedulePrivacy === 'public' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "text-slate-500")}>
                      {profile?.settings?.schedulePrivacy === 'public' ? 'Público' : 'Privado'}
                    </Button>
                  </div>

                  {profile?.settings?.schedulePrivacy === 'public' && (
                    <div className="pl-12 animate-in fade-in slide-in-from-top-1">
                      <div className="flex gap-2">
                        <Input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.uid}/horarios`} className="h-9 text-xs font-mono bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                        <Button size="sm" variant="outline" className="h-9" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/u/${profile.uid}/horarios`); toast.success('Link copiado!') }}>Copiar</Button>
                        <Button size="sm" variant="ghost" className="h-9 w-9 px-0" onClick={() => window.open(`/u/${profile.uid}/horarios`, '_blank')}><Eye className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Security - Danger Zone Highlight */}
            <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-rose-500/10 rounded-xl"><Shield className="h-6 w-6 text-rose-500" /></div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">Segurança</h2>
                </div>

                <div className="space-y-4 mb-8">
                  <Button variant="outline" onClick={() => setChangePasswordOpen(true)} className="w-full h-12 justify-start px-4 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900">
                    <Key className="h-4 w-4 mr-3 text-slate-400" /> Alterar Senha de Acesso
                  </Button>

                  <div className="flex gap-2">
                    <Select aria-label="Formato de exportação" value={exportFormat} onChange={e => setExportFormat(e.target.value as 'json' | 'xlsx' | 'pdf')} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="json">JSON</option><option value="xlsx">EXCEL</option><option value="pdf">PDF</option>
                    </Select>
                    <Button variant="outline" onClick={handleExportData} className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900">
                      <Download className="h-4 w-4 mr-2" /> Exportar Dados
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-900">
                <div className="p-5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 group hover:border-rose-200 transition-colors">
                  <div>
                    <h3 className="text-sm font-black text-rose-600 dark:text-rose-400">Deletar Conta</h3>
                    <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1">Ação irreversível. Seus dados serão perdidos.</p>
                  </div>
                  <Button variant="ghost" onClick={() => setDeleteAccountOpen(true)} className="h-9 bg-white dark:bg-rose-950 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                    Excluir Permanentemente
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
      {/* Dialogs remain identical ... */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="bg-background dark:bg-slate-900 border-border dark:border-slate-800 rounded-2xl max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-foreground"><Key className="h-5 w-5" /> Segurança</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground dark:text-slate-500">Senha Atual</Label>
              <div className="relative">
                <Input type={showSensitive.currentPass ? "text" : "password"} value={passwordData.current} onChange={e => setPasswordData({ ...passwordData, current: e.target.value })} className="h-12 rounded-xl bg-background dark:bg-slate-800 border-border dark:border-slate-700 pr-12" />
                <button type="button" onClick={() => setShowSensitive(p => ({ ...p, currentPass: !p.currentPass }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-slate-500 hover:text-foreground dark:hover:text-slate-300 !bg-transparent !border-none p-0 m-0 focus:outline-none focus:ring-0 focus:ring-offset-0 active:outline-none active:ring-0 !shadow-none outline-none !ring-0 hover:!bg-transparent focus:!bg-transparent active:!bg-transparent focus:!shadow-none">
                  {showSensitive.currentPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground dark:text-slate-500">Nova Senha</Label>
              <div className="relative">
                <Input type={showSensitive.newPass ? "text" : "password"} value={passwordData.new} onChange={e => setPasswordData({ ...passwordData, new: e.target.value })} className="h-12 rounded-xl bg-background dark:bg-slate-800 border-border dark:border-slate-700 pr-12" />
                <button type="button" onClick={() => setShowSensitive(p => ({ ...p, newPass: !p.newPass }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-slate-500 hover:text-foreground dark:hover:text-slate-300 !bg-transparent !border-none p-0 m-0 focus:outline-none focus:ring-0 focus:ring-offset-0 active:outline-none active:ring-0 !shadow-none outline-none !ring-0 hover:!bg-transparent focus:!bg-transparent active:!bg-transparent focus:!shadow-none">
                  {showSensitive.newPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground dark:text-slate-500">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input type={showSensitive.confirmPass ? "text" : "password"} value={passwordData.confirm} onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })} className="h-12 rounded-xl bg-background dark:bg-slate-800 border-border dark:border-slate-700 pr-12" />
                <button type="button" onClick={() => setShowSensitive(p => ({ ...p, confirmPass: !p.confirmPass }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-slate-500 hover:text-foreground dark:hover:text-slate-300 !bg-transparent !border-none p-0 m-0 focus:outline-none focus:ring-0 focus:ring-offset-0 active:outline-none active:ring-0 !shadow-none outline-none !ring-0 hover:!bg-transparent focus:!bg-transparent active:!bg-transparent focus:!shadow-none">
                  {showSensitive.confirmPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
          <Button onClick={handleChangePassword} className="w-full h-12 rounded-xl bg-primary dark:bg-blue-600 font-bold hover:bg-primary/90 dark:hover:bg-blue-500">Confirmar Alteração</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent className="bg-background dark:bg-slate-900 border-border dark:border-slate-800 rounded-2xl max-w-sm">
          <DialogHeader><DialogTitle className="text-destructive dark:text-red-500 flex items-center gap-2"><Trash2 className="h-5 w-5" /> Excluir Conta</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 text-center">
            <Alert variant="destructive" className="bg-destructive/10 dark:bg-red-500/10 border-destructive/20 dark:border-red-500/20 text-destructive dark:text-red-500">
              <AlertDescription className="text-xs">Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.</AlertDescription>
            </Alert>
            <div className="space-y-2 text-left">
              <Label className="text-xs font-bold text-muted-foreground dark:text-slate-500">Digite EXCLUIR para confirmar</Label>
              <Input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} className="h-12 text-center rounded-xl bg-background dark:bg-slate-800 border-destructive/50 dark:border-red-500/50 uppercase" />
            </div>
            {!user?.providerData?.some(p => p.providerId === 'google.com') && (
              <div className="space-y-2 text-left">
                <Label className="text-xs font-bold text-muted-foreground dark:text-slate-500">Sua Senha</Label>
                <div className="relative">
                  <Input type={showSensitive.deletePass ? "text" : "password"} placeholder="Sua Senha" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} className="h-12 rounded-xl bg-background dark:bg-slate-800 border-border dark:border-slate-700 pr-12" />
                  <button type="button" onClick={() => setShowSensitive(p => ({ ...p, deletePass: !p.deletePass }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-slate-500 hover:text-foreground dark:hover:text-slate-300 !bg-transparent !border-none p-0 m-0 focus:outline-none focus:ring-0 focus:ring-offset-0 active:outline-none active:ring-0 !shadow-none outline-none !ring-0 hover:!bg-transparent focus:!bg-transparent active:!bg-transparent focus:!shadow-none">
                    {showSensitive.deletePass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
          <Button variant="destructive" onClick={handleDeleteAccount} className="w-full h-12 rounded-xl font-bold" disabled={deleteConfirm !== 'EXCLUIR'}>Excluir Permanentemente</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
