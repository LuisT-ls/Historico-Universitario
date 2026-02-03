'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import {
  User,
  Save,
  Loader2,
  Settings,
  BarChart3,
  Shield,
  Key,
  Download,
  Trash2,
  Book,
  CheckCircle,
  Clock,
  Star,
  Bell,
  Lock,
  Globe,
  Eye,
  EyeOff,
  Camera,
  Upload,
} from 'lucide-react'
import { doc, getDoc, setDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore'
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  reauthenticateWithPopup
} from 'firebase/auth'
import { db, auth, googleProvider } from '@/lib/firebase/config'
import { CURSOS } from '@/lib/constants'
import { calcularEstatisticas, sanitizeInput } from '@/lib/utils'
import { getFirebaseErrorMessage } from '@/lib/error-handler'
import type { Profile, Curso, Disciplina, UserStatistics } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { exportAsJSON, exportAsXLSX, exportAsPDF } from '@/lib/export-utils'
import { toast, setNotificationsEnabled } from '@/lib/toast'
import { Toaster } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'
import { createUserId } from '@/lib/constants'

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
  const [settingsError, setSettingsError] = useState<{ [key: string]: string | null }>({})
  const [settingsSuccess, setSettingsSuccess] = useState<{ [key: string]: boolean }>({})
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' })
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [exportFormat, setExportFormat] = useState<'json' | 'xlsx' | 'pdf'>('json')
  const [uploading, setUploading] = useState(false)

  // Helper to compress image
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 300 // Resize to 300px width
          const scaleSize = MAX_WIDTH / img.width
          canvas.width = MAX_WIDTH
          canvas.height = img.height * scaleSize

          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

          // Compress to JPEG with 0.7 quality
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
    if (!file || !user || !db) return

    if (!file.type.startsWith('image/')) {
      toast.error('Formato inválido. Use JPG, PNG ou WebP.')
      return
    }

    // Client-side limit before compression check
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.')
      return
    }

    try {
      setUploading(true)

      const base64Image = await compressImage(file)

      // Update Firestore directly
      await setDoc(doc(db, 'users', user.uid), {
        photoURL: base64Image,
        updatedAt: new Date(),
      }, { merge: true })

      // Update local state
      setProfile(prev => prev ? ({ ...prev, photoURL: base64Image }) : null)
      toast.success('Foto de perfil atualizada!')
    } catch (error) {
      console.error('Error processing image:', error)
      toast.error('Erro ao processar imagem')
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    loadProfile()
    loadStatistics()
  }, [user])

  const loadProfile = async () => {
    if (!user || !db) return
    setIsLoading(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        const data = userSnap.data()
        const profileData: Profile = {
          uid: createUserId(user.uid),
          nome: data.name || user.displayName || '',
          email: data.email || user.email || '',
          photoURL: data.photoURL || user.photoURL || '',
          curso: data.profile?.course || 'BICTI',
          matricula: data.profile?.enrollment || '',
          institution: data.profile?.institution || '',
          startYear: data.profile?.startYear || new Date().getFullYear(),
          startSemester: data.profile?.startSemester || '1',
          settings: {
            notifications: data.settings?.notifications !== false,
            privacy: data.settings?.privacy || 'private',
          },
        }
        setProfile(profileData)
        setInitialProfile(profileData)
      } else {
        // Initialize with default data if profile doesn't exist
        const defaultData: Profile = {
          uid: createUserId(user.uid),
          nome: user.displayName || '',
          email: user.email || '',
          curso: 'BICTI',
          matricula: '',
          institution: '',
          startYear: new Date().getFullYear(),
          startSemester: '1',
          settings: {
            notifications: true,
            privacy: 'private',
          },
        }
        setProfile(defaultData)
        setInitialProfile(defaultData)
      }
    } catch (error) {
      logger.error('Erro ao carregar perfil:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStatistics = async () => {
    if (!user || !db) return
    try {
      const q = query(collection(db, 'disciplines'), where('userId', '==', user.uid))
      const snap = await getDocs(q)
      const discs: Disciplina[] = []
      snap.forEach(doc => discs.push({ id: doc.id, ...doc.data() } as any))
      setStatistics(calcularEstatisticas(discs))
    } catch (error) {
      logger.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleSave = async () => {
    if (!user || !db || !profile) return
    setIsSaving(true)
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: sanitizeInput(profile.nome || ''),
        profile: {
          course: profile.curso,
          enrollment: profile.matricula,
          institution: profile.institution,
          startYear: profile.startYear,
          startSemester: profile.startSemester,
        },
        updatedAt: new Date(),
      }, { merge: true })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      toast.success('Perfil atualizado!')
      setInitialProfile(profile)
    } catch (error) {
      toast.error('Erro ao salvar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSettingsChange = async (key: string, value: any) => {
    if (!user || !db || !profile) return
    setSettingsSaving(prev => ({ ...prev, [key]: true }))
    try {
      await setDoc(doc(db, 'users', user.uid), {
        settings: { ...profile.settings, [key]: value },
        updatedAt: new Date(),
      }, { merge: true })
      setProfile(prev => prev ? ({ ...prev, settings: { ...prev.settings, [key]: value } }) : null)
      if (key === 'notifications') setNotificationsEnabled(value)
      setSettingsSuccess(prev => ({ ...prev, [key]: true }))
      setTimeout(() => setSettingsSuccess(prev => ({ ...prev, [key]: false })), 2000)
    } catch (error) {
      toast.error('Erro ao salvar configuração')
    } finally {
      setSettingsSaving(prev => ({ ...prev, [key]: false }))
    }
  }

  const handleChangePassword = async () => {
    if (!user || !auth || passwordData.new !== passwordData.confirm) return
    try {
      const cred = EmailAuthProvider.credential(user.email!, passwordData.current)
      await reauthenticateWithCredential(user, cred)
      await updatePassword(user, passwordData.new)
      toast.success('Senha alterada!')
      setChangePasswordOpen(false)
    } catch (error) {
      toast.error('Erro ao alterar senha', { description: getFirebaseErrorMessage(error) })
    }
  }

  const handleExportData = async () => {
    if (!user || !db) return
    try {
      const q = query(collection(db, 'disciplines'), where('userId', '==', user.uid))
      const snap = await getDocs(q)
      const disciplines: any[] = []
      snap.forEach(doc => disciplines.push({ id: doc.id, ...doc.data() }))

      const backup = {
        exportedAt: new Date().toISOString(),
        disciplines,
        profile,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }
      }

      if (exportFormat === 'json') exportAsJSON(backup)
      else if (exportFormat === 'xlsx') await exportAsXLSX(backup, disciplines, statistics)
      else await exportAsPDF(backup, disciplines, statistics)

      toast.success('Dados exportados!')
    } catch (error) {
      toast.error('Erro ao exportar dados')
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirm !== 'EXCLUIR') return
    try {
      const isGoogleUser = user.providerData?.some(p => p.providerId === 'google.com')
      if (isGoogleUser) {
        if (!googleProvider) throw new Error('Provider not found')
        await reauthenticateWithPopup(user, googleProvider)
      } else {
        const cred = EmailAuthProvider.credential(user.email!, deletePassword)
        await reauthenticateWithCredential(user, cred)
      }
      await deleteUser(user)
      localStorage.clear()
      router.push('/')
      toast.success('Conta excluída')
    } catch (error) {
      toast.error('Erro ao excluir conta')
    }
  }

  const maskSensitive = (val: string | null | undefined, type: 'email' | 'enrollment') => {
    if (!val) return ''
    if (showSensitive[type]) return val
    if (type === 'email') {
      if (!val.includes('@')) return val // Return as is if not a valid email format
      const parts = val.split('@')
      const namePart = parts[0]
      const domainPart = parts[1]

      // Mask logic: first char + dots + @ + first char + dots
      return (namePart[0] || '') + '••••@' + (domainPart[0] || '') + '••••'
    }
    // For enrollment/others: first 3 + dots + last 2
    if (val.length <= 5) return '••••' // Too short to mask partially
    return val.slice(0, 3) + '••••' + val.slice(-2)
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Toaster position="bottom-right" richColors />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-2 text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground dark:text-slate-400">Gerencie suas informações e configurações acadêmicas</p>
        </div>

        <div className="space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Disciplinas', value: statistics.totalDisciplines, color: 'border-t-blue-500', icon: Book, iconColor: 'text-blue-500' },
              { label: 'Concluídas', value: statistics.completedDisciplines, color: 'border-t-green-500', icon: CheckCircle, iconColor: 'text-green-500' },
              { label: 'Em Andamento', value: statistics.inProgressDisciplines, color: 'border-t-sky-400', icon: Clock, iconColor: 'text-sky-400' },
              { label: 'Média', value: statistics.averageGrade.toFixed(1), color: 'border-t-yellow-500', icon: Star, iconColor: 'text-yellow-500' },
            ].map((stat, i) => (
              <Card key={i} className={cn("rounded-xl border-none border-t-4 bg-card dark:bg-slate-900/50 backdrop-blur-sm p-6 transition-all hover:shadow-lg", stat.color)}>
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl bg-muted dark:bg-slate-800", stat.iconColor)}><stat.icon className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground dark:text-slate-500">{stat.label}</p>
                    <p className="text-3xl font-black text-foreground">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="rounded-2xl border-none bg-card dark:bg-slate-900/50 p-8 space-y-8">
              <div className="flex items-center gap-3"><User className="h-6 w-6 text-primary dark:text-blue-500" /><h2 className="text-2xl font-bold text-foreground">Dados Pessoais</h2></div>

              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center sm:flex-row gap-6 pb-6 border-b border-border dark:border-slate-800">
                <div className="relative group">
                  <div className={cn(
                    "h-24 w-24 rounded-full overflow-hidden border-4 border-background shadow-xl flex items-center justify-center bg-muted",
                    uploading && "opacity-50"
                  )}>
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-md hover:bg-primary/90 transition-colors"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="font-bold text-lg">Foto de Perfil</h3>
                  <p className="text-sm text-muted-foreground max-w-[250px]">
                    Carregue uma foto para personalizar seu perfil público.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground dark:text-slate-500">Nome Completo</Label>
                  <Input value={profile?.nome || ''} onChange={e => setProfile(prev => prev ? ({ ...prev, nome: e.target.value }) : null)} className="h-12 rounded-xl bg-background dark:bg-slate-800/50 border-border dark:border-slate-700" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground dark:text-slate-500">E-mail</Label>
                  <div className="relative">
                    <Input value={maskSensitive(profile?.email, 'email')} disabled className="h-12 rounded-xl bg-background dark:bg-slate-800/50 border-border dark:border-slate-700 pr-12" />
                    <button type="button" onClick={() => setShowSensitive(p => ({ ...p, email: !p.email }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-slate-500 hover:text-foreground dark:hover:text-slate-300 !bg-transparent !border-none p-0 m-0 focus:outline-none focus:ring-0 focus:ring-offset-0 active:outline-none active:ring-0 !shadow-none outline-none !ring-0 hover:!bg-transparent focus:!bg-transparent active:!bg-transparent focus:!shadow-none">
                      {showSensitive.email ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground dark:text-slate-500">Matrícula</Label>
                    <div className="relative">
                      <Input
                        type={showSensitive.enrollment ? "text" : "password"}
                        value={profile?.matricula || ''}
                        onChange={e => setProfile(prev => prev ? ({ ...prev, matricula: e.target.value }) : null)}
                        className="h-12 rounded-xl bg-background dark:bg-slate-800/50 border-border dark:border-slate-700 pr-12"
                      />
                      <button type="button" onClick={() => setShowSensitive(p => ({ ...p, enrollment: !p.enrollment }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-slate-500 hover:text-foreground dark:hover:text-slate-300 !bg-transparent !border-none p-0 m-0 focus:outline-none focus:ring-0 focus:ring-offset-0 active:outline-none active:ring-0 !shadow-none outline-none !ring-0 hover:!bg-transparent focus:!bg-transparent active:!bg-transparent focus:!shadow-none">
                        {showSensitive.enrollment ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground dark:text-slate-500">Curso</Label>
                    <select value={profile?.curso || ''} onChange={e => setProfile(prev => prev ? ({ ...prev, curso: e.target.value as Curso }) : null)} className="w-full h-12 rounded-xl bg-background dark:bg-slate-800/50 border border-border dark:border-slate-700 px-4 text-sm focus:outline-none text-foreground">
                      {Object.entries(CURSOS).map(([k, v]) => <option key={k} value={k}>{v.nome}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground dark:text-slate-500">Instituição</Label>
                    <Input value={profile?.institution || ''} onChange={e => setProfile(prev => prev ? ({ ...prev, institution: e.target.value }) : null)} className="h-12 rounded-xl bg-background dark:bg-slate-800/50 border-border dark:border-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground dark:text-slate-500">Ano de Ingresso</Label>
                    <Input type="text" value={profile?.startYear || ''} onChange={e => setProfile(prev => prev ? ({ ...prev, startYear: e.target.value }) : null)} className="h-12 rounded-xl bg-background dark:bg-slate-800/50 border-border dark:border-slate-700" />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                </div>
                {JSON.stringify(profile) !== JSON.stringify(initialProfile) && (
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={isSaving} className={cn("h-12 px-10 rounded-xl font-bold transition-all", saveSuccess ? "bg-green-600 hover:bg-green-600" : "bg-primary dark:bg-blue-600 hover:bg-primary/90 dark:hover:bg-blue-500")}>
                      {isSaving ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : saveSuccess ? <CheckCircle className="h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                      {isSaving ? 'Salvando...' : saveSuccess ? 'Salvo!' : 'Salvar Alterações'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Course Information Card */}
            {profile?.curso && CURSOS[profile.curso]?.metadata && (
              <Card className="rounded-2xl border-none bg-card dark:bg-slate-900/50 p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Book className="h-6 w-6 text-primary dark:text-blue-500" />
                  <h2 className="text-2xl font-bold text-foreground">Estrutura Curricular</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase text-muted-foreground border-b pb-2">Detalhes do Curso</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground">Código</p>
                        <p className="text-sm font-medium">{CURSOS[profile.curso].metadata?.codigo}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground">Matriz Curricular</p>
                        <p className="text-sm font-medium">{CURSOS[profile.curso].metadata?.matrizCurricular}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground">Entrada em Vigor</p>
                        <p className="text-sm font-medium">{CURSOS[profile.curso].metadata?.entradaVigor}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground">Carga Horária Mínima Total</p>
                        <p className="text-sm font-medium">{CURSOS[profile.curso].metadata?.totalMinima}h</p>
                      </div>
                    </div>
                  </div>

                  {/* Term Limits */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase text-muted-foreground border-b pb-2">Prazos e Limites</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground">Integralização (Semestres)</p>
                        <div className="flex gap-2 text-sm">
                          <div className="bg-muted px-2 py-1 rounded">Min: {CURSOS[profile.curso].metadata?.prazos?.minimo}</div>
                          <div className="bg-muted px-2 py-1 rounded">Méd: {CURSOS[profile.curso].metadata?.prazos?.medio}</div>
                          <div className="bg-muted px-2 py-1 rounded">Máx: {CURSOS[profile.curso].metadata?.prazos?.maximo}</div>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground">Max. por Período</p>
                        <p className="text-sm font-medium">{CURSOS[profile.curso].metadata?.limites?.chPeriodoMaxima}h</p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-2">
                      <p className="text-[10px] font-bold text-muted-foreground mb-1">Distribuição de Carga Horária</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between border-b pb-1"><span>Obrigatória Aula:</span> <span className="font-mono">{CURSOS[profile.curso].metadata?.limites?.chObrigatoriaAula}h</span></div>
                        <div className="flex justify-between border-b pb-1"><span>Optativa Min:</span> <span className="font-mono">{CURSOS[profile.curso].metadata?.limites?.chOptativaMinima}h</span></div>
                        <div className="flex justify-between border-b pb-1"><span>Complementar Min:</span> <span className="font-mono">{CURSOS[profile.curso].metadata?.limites?.chComplementarMinima}h</span></div>
                        <div className="flex justify-between border-b pb-1"><span>Eletiva Max:</span> <span className="font-mono">{CURSOS[profile.curso].metadata?.limites?.chEletivaMaxima}h</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-8">
              <Card className="rounded-2xl border-none bg-card dark:bg-slate-900/50 p-8 space-y-6">
                <div className="flex items-center gap-3"><Settings className="h-6 w-6 text-primary dark:text-blue-500" /><h2 className="text-2xl font-bold text-foreground">Preferências</h2></div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted dark:bg-slate-800/30 rounded-xl border border-border dark:border-slate-700/50">
                    <div className="flex items-center gap-3"><Bell className="h-5 w-5 text-muted-foreground dark:text-slate-400" /><span className="text-sm font-medium text-foreground">Notificações</span></div>
                    <Button variant="ghost" size="sm" onClick={() => handleSettingsChange('notifications', !profile?.settings?.notifications)} className={cn("rounded-lg h-8 px-4 border border-border dark:border-slate-700", profile?.settings?.notifications ? "bg-primary/10 dark:bg-blue-500/10 text-primary dark:text-blue-400" : "text-muted-foreground dark:text-slate-500")}>
                      {profile?.settings?.notifications ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>
                  <div className="flex flex-col gap-4 p-4 bg-muted dark:bg-slate-800/30 rounded-xl border border-border dark:border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Globe className="h-5 w-5 text-muted-foreground dark:text-slate-400" /><span className="text-sm font-medium text-foreground">Perfil Público</span></div>
                      <Button variant="ghost" size="sm" onClick={() => handleSettingsChange('privacy', profile?.settings?.privacy === 'public' ? 'private' : 'public')} className={cn("rounded-lg h-8 px-4 border border-border dark:border-slate-700", profile?.settings?.privacy === 'public' ? "bg-primary/10 dark:bg-blue-500/10 text-primary dark:text-blue-400" : "text-muted-foreground dark:text-slate-500")}>
                        {profile?.settings?.privacy === 'public' ? 'Ativado' : 'Desativado'}
                      </Button>
                    </div>

                    {profile?.settings?.privacy === 'public' && (
                      <div className="pl-8 pt-2 animate-in fade-in slide-in-from-top-2">
                        <div className="flex gap-2">
                          <Input
                            readOnly
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.uid}`}
                            className="h-9 text-xs font-mono bg-background dark:bg-slate-900 border-border dark:border-slate-700"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 whitespace-nowrap"
                            onClick={() => {
                              const url = `${window.location.origin}/u/${profile.uid}`
                              navigator.clipboard.writeText(url)
                              toast.success('Link copiado!')
                            }}
                          >
                            Copiar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 px-0"
                            onClick={() => window.open(`/u/${profile.uid}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          ⚠️ Qualquer pessoa com este link poderá ver seu resumo acadêmico.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl border-none bg-card dark:bg-slate-900/50 p-8 space-y-6">
                <div className="flex items-center gap-3"><Shield className="h-6 w-6 text-destructive dark:text-red-500" /><h2 className="text-2xl font-bold text-foreground">Segurança</h2></div>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" onClick={() => setChangePasswordOpen(true)} className="flex-1 h-12 rounded-xl border-border dark:border-slate-700 hover:bg-accent dark:hover:bg-slate-800">
                      <Key className="h-4 w-4 mr-2" /> Alterar Senha
                    </Button>
                    <div className="flex-1 flex gap-2">
                      <select value={exportFormat} onChange={e => setExportFormat(e.target.value as any)} className="bg-background dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl px-3 text-xs focus:outline-none text-foreground">
                        <option value="json">JSON</option><option value="xlsx">EXCEL</option><option value="pdf">PDF</option>
                      </select>
                      <Button variant="outline" onClick={handleExportData} className="flex-1 h-12 rounded-xl border-border dark:border-slate-700 hover:bg-accent dark:hover:bg-slate-800">
                        <Download className="h-4 w-4 mr-2" /> Exportar
                      </Button>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-border dark:border-slate-800">
                    <div className="p-4 bg-destructive/5 dark:bg-red-500/5 border border-destructive/20 dark:border-red-500/20 rounded-xl flex justify-between items-center group">
                      <div><h3 className="text-sm font-bold text-destructive dark:text-red-500">Zona de Perigo</h3><p className="text-[10px] text-muted-foreground dark:text-slate-500">Exclusão permanente de todos os seus dados</p></div>
                      <Button variant="outline" onClick={() => setDeleteAccountOpen(true)} className="h-9 border-destructive/50 dark:border-red-500/50 text-destructive dark:text-red-500 hover:bg-destructive dark:hover:bg-red-500 hover:text-destructive-foreground dark:hover:text-white transition-all">Excluir Conta</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

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
