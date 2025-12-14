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
import { calcularEstatisticas } from '@/lib/utils'
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

export function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [statistics, setStatistics] = useState<UserStatistics>({
    totalDisciplines: 0,
    completedDisciplines: 0,
    inProgressDisciplines: 0,
    averageGrade: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState<{ [key: string]: boolean }>({})
  const [settingsError, setSettingsError] = useState<{ [key: string]: string | null }>({})
  const [settingsSuccess, setSettingsSuccess] = useState<{ [key: string]: boolean }>({})
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deletePassword, setDeletePassword] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && db) {
      loadProfile()
      loadStatistics()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user || !db) return

    setIsLoading(true)
    try {
      // Carregar dados do documento users/{uid}
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        setProfile({
          uid: user.uid,
          nome: userData.name || user.displayName || '',
          email: userData.email || user.email || '',
          curso: userData.profile?.course || 'BICTI',
          matricula: userData.profile?.enrollment || '',
          institution: userData.profile?.institution || '',
          startYear: userData.profile?.startYear || new Date().getFullYear(),
          startSemester: userData.profile?.startSemester || '1',
          settings: {
            notifications: userData.settings?.notifications !== false,
            privacy: userData.settings?.privacy || 'private',
          },
        })
      } else {
        // Criar perfil inicial
        const initialProfile: Profile = {
          uid: user.uid,
          nome: user.displayName || '',
          email: user.email || '',
          curso: 'BICTI',
          startYear: new Date().getFullYear(),
          startSemester: '1',
          settings: {
            notifications: true,
            privacy: 'private',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        // Salvar perfil inicial no Firestore
        try {
          await setDoc(
            userRef,
            {
              name: initialProfile.nome,
              email: initialProfile.email || user.email,
              profile: {
                course: initialProfile.curso,
                enrollment: initialProfile.matricula || '',
                institution: initialProfile.institution || '',
                startYear: initialProfile.startYear,
                startSemester: initialProfile.startSemester,
              },
              settings: initialProfile.settings,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            { merge: true }
          )
        } catch (error) {
          console.error('Erro ao criar perfil inicial:', error)
        }
        
        setProfile(initialProfile)
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStatistics = async () => {
    if (!user || !db) return

    try {
      // Buscar disciplinas do usuário
      const disciplinesRef = collection(db, 'disciplines')
      const q = query(disciplinesRef, where('userId', '==', user.uid))
      const querySnapshot = await getDocs(q)

      const disciplinas: Disciplina[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        disciplinas.push({
          id: doc.id,
          periodo: data.periodo || '',
          codigo: data.codigo || '',
          nome: data.nome || '',
          natureza: data.natureza,
          ch: data.ch || 0,
          nota: data.nota || 0,
          trancamento: data.trancamento || false,
          dispensada: data.dispensada || false,
          emcurso: data.emcurso || false,
          resultado: data.resultado,
          curso: data.curso,
        } as Disciplina)
      })

      // Calcular estatísticas
      const stats = calcularEstatisticas(disciplinas)
      setStatistics(stats)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleSave = async () => {
    if (!user || !db || !profile) return

    setIsSaving(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      
      // Garantir que as configurações existam
      const currentSettings = profile.settings || {
        notifications: true,
        privacy: 'private',
      }
      
      await setDoc(
        userRef,
        {
          name: profile.nome,
          email: profile.email || user.email,
          profile: {
            course: profile.curso,
            enrollment: profile.matricula,
            institution: profile.institution,
            startYear: profile.startYear,
            startSemester: profile.startSemester,
          },
          settings: currentSettings, // Preservar configurações
          updatedAt: new Date(),
        },
        { merge: true }
      )
      
      // Atualizar estado local para garantir sincronização
      setProfile({
        ...profile,
        settings: currentSettings,
      })

      // Mostrar notificação de sucesso (pode usar um toast component)
      alert('✅ Informações pessoais salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      alert('❌ Erro ao salvar perfil: ' + (error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSettingsChange = async (key: 'notifications' | 'privacy', value: boolean | string) => {
    if (!user || !db || !profile) return

    // Validação
    if (key === 'privacy' && value !== 'private' && value !== 'public') {
      setSettingsError({ ...settingsError, [key]: 'Valor de privacidade inválido' })
      return
    }

    if (key === 'notifications' && typeof value !== 'boolean') {
      setSettingsError({ ...settingsError, [key]: 'Valor de notificações inválido' })
      return
    }

    // Limpar estados anteriores
    setSettingsError({ ...settingsError, [key]: null })
    setSettingsSuccess({ ...settingsSuccess, [key]: false })
    setSettingsSaving({ ...settingsSaving, [key]: true })

    try {
      const userRef = doc(db, 'users', user.uid)
      
      // Garantir que as configurações existam
      const currentSettings = profile.settings || {
        notifications: true,
        privacy: 'private',
      }

      await setDoc(
        userRef,
        {
          settings: {
            ...currentSettings,
            [key]: value,
          },
          updatedAt: new Date(),
        },
        { merge: true }
      )

      // Atualizar estado local
      setProfile({
        ...profile,
        settings: {
          ...currentSettings,
          [key]: value,
        },
      })

      // Feedback de sucesso
      setSettingsSuccess({ ...settingsSuccess, [key]: true })
      
      // Limpar sucesso após 2 segundos
      setTimeout(() => {
        setSettingsSuccess((prev) => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error)
      const errorMessage = 
        error.code === 'permission-denied'
          ? 'Permissão negada. Verifique as regras do Firestore.'
          : error.code === 'unavailable'
          ? 'Serviço temporariamente indisponível. Tente novamente.'
          : 'Erro ao salvar configurações: ' + (error.message || 'Erro desconhecido')
      
      setSettingsError({ ...settingsError, [key]: errorMessage })
      
      // Limpar erro após 5 segundos
      setTimeout(() => {
        setSettingsError((prev) => ({ ...prev, [key]: null }))
      }, 5000)
    } finally {
      setSettingsSaving({ ...settingsSaving, [key]: false })
    }
  }

  const handleChangePassword = async () => {
    if (!user || !auth) return

    // Verificar se é usuário Google (não pode alterar senha)
    const isGoogleUser = user.providerData?.some((p) => p.providerId === 'google.com')
    if (isGoogleUser) {
      alert('❌ Usuários que fazem login com Google não podem alterar senha através desta interface.')
      return
    }

    if (!passwordData.current) {
      alert('❌ Por favor, digite sua senha atual.')
      return
    }

    if (passwordData.new !== passwordData.confirm) {
      alert('❌ As senhas não correspondem!')
      return
    }

    if (passwordData.new.length < 6) {
      alert('❌ A nova senha deve ter pelo menos 6 caracteres!')
      return
    }

    // Validação de força da senha básica
    if (passwordData.new === passwordData.current) {
      alert('❌ A nova senha deve ser diferente da senha atual.')
      return
    }

    try {
      // Reautenticar usuário
      const credential = EmailAuthProvider.credential(user.email!, passwordData.current)
      await reauthenticateWithCredential(user, credential)

      // Alterar senha
      await updatePassword(user, passwordData.new)

      alert('✅ Senha alterada com sucesso!')
      setChangePasswordOpen(false)
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error)
      let errorMessage = 'Erro ao alterar senha.'
      
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'Senha atual incorreta.'
          break
        case 'auth/weak-password':
          errorMessage = 'A nova senha deve ter pelo menos 6 caracteres.'
          break
        case 'auth/requires-recent-login':
          errorMessage = 'Por segurança, faça login novamente antes de alterar a senha.'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
          break
        default:
          errorMessage = error.message || 'Erro desconhecido ao alterar senha.'
      }
      
      alert('❌ ' + errorMessage)
    }
  }

  const handleExportData = async () => {
    if (!user || !db) return

    try {
      // Buscar todas as disciplinas
      const disciplinesRef = collection(db, 'disciplines')
      const q = query(disciplinesRef, where('userId', '==', user.uid))
      const querySnapshot = await getDocs(q)

      const disciplinas: any[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        disciplinas.push({
          id: doc.id,
          periodo: data.periodo || '',
          codigo: data.codigo || '',
          nome: data.nome || '',
          natureza: data.natureza || '',
          ch: data.ch || 0,
          nota: data.nota || 0,
          trancamento: data.trancamento || false,
          dispensada: data.dispensada || false,
          emcurso: data.emcurso || false,
          resultado: data.resultado || null,
          curso: data.curso || '',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || null,
        })
      })

      // Buscar certificados (se houver)
      let certificados: any[] = []
      try {
        const certificadosRef = collection(db, 'certificados')
        const certQuery = query(certificadosRef, where('userId', '==', user.uid))
        const certSnapshot = await getDocs(certQuery)
        certSnapshot.forEach((doc) => {
          certificados.push({
            id: doc.id,
            ...doc.data(),
          })
        })
      } catch (error) {
        console.warn('Erro ao buscar certificados:', error)
      }

      // Buscar perfil
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      const userData = userSnap.exists() ? userSnap.data() : {}

      // Criar objeto de backup completo
      const backup = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        exportedBy: user.email || user.uid,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        },
        profile: userData,
        disciplines: disciplinas,
        certificados: certificados,
        statistics: statistics,
        metadata: {
          totalDisciplines: disciplinas.length,
          totalCertificates: certificados.length,
          exportFormat: 'JSON',
        },
      }

      // Criar arquivo de download
      const dataStr = JSON.stringify(backup, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `historico-universitario-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpar URL após download
      setTimeout(() => URL.revokeObjectURL(link.href), 100)

      alert('✅ Dados exportados com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert('❌ Erro ao exportar dados: ' + errorMessage)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || !auth || !db) return

    if (deleteConfirm !== 'EXCLUIR') {
      alert('❌ Por favor, digite EXCLUIR para confirmar.')
      return
    }

    // Verificar se é usuário Google
    const isGoogleUser = user.providerData?.some((p) => p.providerId === 'google.com')

    if (!isGoogleUser && !deletePassword) {
      alert('❌ Por favor, digite sua senha para confirmar.')
      return
    }

    try {
      // Reautenticação necessária antes de excluir
      if (isGoogleUser) {
        // Para usuários Google, reautenticar com popup
        try {
          if (!googleProvider) {
            throw new Error('Google Auth Provider não está disponível')
          }
          await reauthenticateWithPopup(user, googleProvider)
        } catch (reauthError: any) {
          if (reauthError.code === 'auth/popup-closed-by-user') {
            alert('❌ Reautenticação cancelada. A exclusão da conta foi cancelada.')
            return
          }
          throw reauthError
        }
      } else {
        // Para usuários email/password, reautenticar com senha
        if (!deletePassword) {
          alert('❌ Por favor, digite sua senha para confirmar.')
          return
        }
        const credential = EmailAuthProvider.credential(user.email!, deletePassword)
        await reauthenticateWithCredential(user, credential)
      }

      // Usar batch para operações atômicas
      const batch = writeBatch(db)
      let operationsCount = 0

      // 1. Excluir todas as disciplinas
      try {
        const disciplinesRef = collection(db, 'disciplines')
        const q = query(disciplinesRef, where('userId', '==', user.uid))
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref)
          operationsCount++
        })
      } catch (error) {
        console.warn('Erro ao buscar disciplinas para exclusão:', error)
      }

      // 2. Excluir certificados (se houver)
      try {
        const certificadosRef = collection(db, 'certificados')
        const certQuery = query(certificadosRef, where('userId', '==', user.uid))
        const certSnapshot = await getDocs(certQuery)
        certSnapshot.forEach((doc) => {
          batch.delete(doc.ref)
          operationsCount++
        })
      } catch (error) {
        console.warn('Erro ao buscar certificados para exclusão:', error)
      }

      // 3. Excluir perfil do usuário
      try {
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          batch.delete(userRef)
          operationsCount++
        }
      } catch (error) {
        console.warn('Erro ao buscar perfil para exclusão:', error)
      }

      // Executar todas as exclusões do Firestore
      if (operationsCount > 0) {
        await batch.commit()
      }

      // 4. Excluir usuário do Authentication
      await deleteUser(user)

      // 5. Limpar dados locais
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (error) {
        console.warn('Erro ao limpar storage local:', error)
      }

      alert('✅ Conta excluída com sucesso!')
      router.push('/')
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error)
      let errorMessage = 'Erro ao excluir conta.'
      
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta.'
          break
        case 'auth/requires-recent-login':
          errorMessage = 'Por segurança, faça login novamente antes de excluir a conta.'
          break
        case 'auth/popup-closed-by-user':
          errorMessage = 'Reautenticação cancelada. A exclusão foi cancelada.'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
          break
        case 'permission-denied':
          errorMessage = 'Permissão negada. Verifique as regras do Firestore.'
          break
        default:
          errorMessage = error.message || 'Erro desconhecido ao excluir conta.'
      }
      
      alert('❌ ' + errorMessage)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isGoogleUser = user.providerData?.some((p) => p.providerId === 'google.com')
  const isPrivate = profile?.settings?.privacy === 'private'

  // Função para mascarar dados sensíveis quando privado
  const maskSensitiveData = (value: string | null | undefined, type: 'email' | 'enrollment' = 'email'): string => {
    if (!isPrivate || !value || value.trim() === '') return value || ''
    
    if (type === 'email') {
      // Mascarar e-mail: ex: user@example.com -> u***@e***.com
      const [localPart, domain] = value.split('@')
      if (!domain || !localPart) return '••••••••'
      
      // Mascarar parte local (antes do @)
      const maskedLocal = localPart.length > 1 
        ? localPart[0] + '•'.repeat(Math.min(localPart.length - 1, 3))
        : '•'.repeat(3)
      
      // Mascarar domínio
      const domainParts = domain.split('.')
      if (domainParts.length === 0) return `${maskedLocal}@••••`
      
      const domainName = domainParts[0]
      const domainExt = domainParts.slice(1).join('.')
      const maskedDomain = domainName.length > 1
        ? domainName[0] + '•'.repeat(Math.min(domainName.length - 1, 3))
        : '•'.repeat(3)
      
      return domainExt 
        ? `${maskedLocal}@${maskedDomain}.${domainExt}`
        : `${maskedLocal}@${maskedDomain}`
    } else {
      // Mascarar matrícula: ex: 123456789 -> 123••••89
      const trimmedValue = value.trim()
      if (trimmedValue.length <= 2) return '••••'
      if (trimmedValue.length <= 4) return '••••'
      
      const start = trimmedValue.slice(0, 3)
      const end = trimmedValue.slice(-2)
      const middleLength = trimmedValue.length - 5
      const maskedMiddle = '•'.repeat(Math.min(middleLength, 6))
      
      return `${start}${maskedMiddle}${end}`
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e configurações da conta
          </p>
        </div>

        <div className="space-y-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>Atualize seus dados pessoais e acadêmicos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={profile?.nome || ''}
                    onChange={(e) => setProfile({ ...profile!, nome: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={isPrivate ? maskSensitiveData(profile?.email || user.email || '', 'email') : (profile?.email || user.email || '')}
                    disabled
                    placeholder="Seu e-mail será exibido aqui"
                    className={isPrivate ? 'blur-sm select-none' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isPrivate ? 'E-mail oculto por privacidade' : 'O e-mail não pode ser alterado'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institution">Instituição</Label>
                  <Input
                    id="institution"
                    value={profile?.institution || ''}
                    onChange={(e) => setProfile({ ...profile!, institution: e.target.value })}
                    placeholder="Nome da sua universidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Curso</Label>
                  <Input
                    id="course"
                    value={profile?.curso || ''}
                    onChange={(e) => setProfile({ ...profile!, curso: e.target.value as Curso })}
                    placeholder="Ex: Engenharia de Produção"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="enrollment">Matrícula</Label>
                  <Input
                    id="enrollment"
                    value={isPrivate ? maskSensitiveData(profile?.matricula || '', 'enrollment') : (profile?.matricula || '')}
                    onChange={(e) => {
                      if (!isPrivate) {
                        setProfile({ ...profile!, matricula: e.target.value })
                      }
                    }}
                    placeholder="Número de matrícula"
                    disabled={isPrivate}
                    className={isPrivate ? 'blur-sm select-none' : ''}
                  />
                  {isPrivate && (
                    <p className="text-xs text-muted-foreground">Matrícula oculta por privacidade</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startYear">Ano de Ingresso</Label>
                  <Input
                    id="startYear"
                    type="number"
                    min="2000"
                    max="2030"
                    value={profile?.startYear || new Date().getFullYear()}
                    onChange={(e) =>
                      setProfile({ ...profile!, startYear: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startSemester">Semestre de Ingresso</Label>
                  <select
                    id="startSemester"
                    value={profile?.startSemester || '1'}
                    onChange={(e) =>
                      setProfile({ ...profile!, startSemester: e.target.value as '1' | '2' })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="1">1º Semestre</option>
                    <option value="2">2º Semestre</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configurações da Conta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações da Conta
              </CardTitle>
              <CardDescription>Gerencie suas preferências e configurações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Notificações */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">Notificações</h3>
                      <p className="text-sm text-muted-foreground">Receber avisos importantes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {settingsSaving.notifications && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {settingsSuccess.notifications && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <select
                      value={profile?.settings?.notifications !== false ? 'true' : 'false'}
                      onChange={(e) =>
                        handleSettingsChange('notifications', e.target.value === 'true')
                      }
                      disabled={settingsSaving.notifications}
                      className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="true">Ativar</option>
                      <option value="false">Desativar</option>
                    </select>
                  </div>
                </div>
                {settingsError.notifications && (
                  <Alert variant="destructive">
                    <AlertDescription>{settingsError.notifications}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Privacidade */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {profile?.settings?.privacy === 'public' ? (
                      <Globe className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <h3 className="font-semibold">Privacidade</h3>
                      <p className="text-sm text-muted-foreground">Visibilidade dos seus dados</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {profile?.settings?.privacy === 'public' ? (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" /> Público - Seus dados podem ser visualizados por outros usuários
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Privado - Apenas você pode visualizar seus dados
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {settingsSaving.privacy && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {settingsSuccess.privacy && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <select
                      value={profile?.settings?.privacy || 'private'}
                      onChange={(e) => handleSettingsChange('privacy', e.target.value)}
                      disabled={settingsSaving.privacy}
                      className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="private">Privado</option>
                      <option value="public">Público</option>
                    </select>
                  </div>
                </div>
                {settingsError.privacy && (
                  <Alert variant="destructive">
                    <AlertDescription>{settingsError.privacy}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estatísticas
              </CardTitle>
              <CardDescription>Resumo do seu progresso acadêmico</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Book className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Disciplinas</h3>
                  </div>
                  <div className="text-2xl font-bold">{statistics.totalDisciplines}</div>
                  <div className="text-sm text-muted-foreground">Total cadastradas</div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Concluídas</h3>
                  </div>
                  <div className="text-2xl font-bold">{statistics.completedDisciplines}</div>
                  <div className="text-sm text-muted-foreground">Disciplinas finalizadas</div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Em Andamento</h3>
                  </div>
                  <div className="text-2xl font-bold">{statistics.inProgressDisciplines}</div>
                  <div className="text-sm text-muted-foreground">Disciplinas atuais</div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold">Média Geral</h3>
                  </div>
                  <div className="text-2xl font-bold">{statistics.averageGrade.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Nota média</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Segurança da Conta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança da Conta
              </CardTitle>
              <CardDescription>Ações importantes para proteger sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">Alterar Senha</h3>
                      <p className="text-sm text-muted-foreground">
                        Atualize sua senha para manter a conta segura
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
                    Alterar Senha
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">Exportar Dados</h3>
                      <p className="text-sm text-muted-foreground">
                        Faça backup dos seus dados acadêmicos
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleExportData}>
                    Exportar
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg border-destructive">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5 text-destructive" />
                    <div>
                      <h3 className="font-semibold text-destructive">Excluir Conta</h3>
                      <p className="text-sm text-muted-foreground">
                        Exclua permanentemente sua conta e todos os dados
                      </p>
                    </div>
                  </div>
                  <Button variant="destructive" onClick={() => setDeleteAccountOpen(true)}>
                    Excluir Conta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Modal de Alteração de Senha */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Alterar Senha
            </DialogTitle>
            <DialogDescription>
              {isGoogleUser 
                ? 'Usuários que fazem login com Google não podem alterar senha através desta interface. A senha é gerenciada pela sua conta Google.'
                : 'Digite sua senha atual e a nova senha para alterar.'}
            </DialogDescription>
          </DialogHeader>
          {isGoogleUser ? (
            <>
              <Alert>
                <AlertDescription>
                  Usuários que fazem login com Google não podem alterar senha através desta interface.
                  Para alterar sua senha, acesse sua{' '}
                  <a
                    href="https://myaccount.google.com/security"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80"
                  >
                    conta Google
                  </a>
                  .
                </AlertDescription>
              </Alert>
              <DialogFooter>
                <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.current}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, current: e.target.value })
                    }
                    required
                    placeholder="Digite sua senha atual"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    required
                    minLength={6}
                    placeholder="Mínimo de 6 caracteres"
                  />
                  <p className="text-xs text-muted-foreground">
                    A senha deve ter pelo menos 6 caracteres
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirm: e.target.value })
                    }
                    required
                    minLength={6}
                    placeholder="Digite a nova senha novamente"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setChangePasswordOpen(false)
                  setPasswordData({ current: '', new: '', confirm: '' })
                }}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleChangePassword}
                  disabled={!passwordData.current || !passwordData.new || !passwordData.confirm}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Alterar Senha
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão de Conta */}
      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Para confirmar a exclusão permanente da sua conta e de todos os seus dados, digite{' '}
              <strong>EXCLUIR</strong> no campo abaixo:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente
                excluídos.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="deleteConfirmInput">Digite EXCLUIR para confirmar</Label>
              <Input
                id="deleteConfirmInput"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Digite EXCLUIR"
                onPaste={(e) => {
                  e.preventDefault()
                  alert('Você deve digitar manualmente a palavra EXCLUIR.')
                }}
              />
              <p className="text-xs text-muted-foreground">
                Atenção: não é possível colar, é necessário digitar manualmente.
              </p>
            </div>

            {!isGoogleUser && (
              <div className="space-y-2">
                <Label htmlFor="deletePasswordInput">Digite sua senha para confirmar</Label>
                <Input
                  id="deletePasswordInput"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Senha da sua conta"
                />
                <p className="text-xs text-muted-foreground">
                  Sua senha é necessária para confirmar a exclusão por segurança.
                </p>
              </div>
            )}

            {isGoogleUser && (
              <Alert>
                <AlertDescription>
                  <strong>Usuário Google:</strong> Após confirmar, você será redirecionado para
                  fazer login novamente com o Google para finalizar a exclusão da conta.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAccountOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== 'EXCLUIR' || (!isGoogleUser && !deletePassword)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
