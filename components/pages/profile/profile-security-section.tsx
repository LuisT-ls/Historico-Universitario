'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Key, Download, Trash2, Eye, EyeOff } from 'lucide-react'
import {
  updatePassword,
  deleteAccount,
  reauthenticateWithEmail,
  reauthenticateWithGoogle,
} from '@/services/auth.service'
import { toast } from '@/lib/toast'
import { getFirebaseErrorMessage } from '@/lib/error-handler'
import type { User } from 'firebase/auth'
import type { Profile, UserStatistics } from '@/types'

interface ProfileSecuritySectionProps {
  user: User | null
  profile: Profile | null
  statistics: UserStatistics
  onExportData: (format: 'json' | 'xlsx' | 'pdf') => Promise<void>
}

export function ProfileSecuritySection({
  user,
  profile: _profile,
  statistics: _statistics,
  onExportData,
}: ProfileSecuritySectionProps) {
  const router = useRouter()

  const [exportFormat, setExportFormat] = useState<'json' | 'xlsx' | 'pdf'>('json')
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' })
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [showSensitive, setShowSensitive] = useState({
    currentPass: false,
    newPass: false,
    confirmPass: false,
    deletePass: false,
  })

  const handleChangePassword = async () => {
    if (!user || passwordData.new !== passwordData.confirm) return
    try {
      await reauthenticateWithEmail(passwordData.current)
      await updatePassword(passwordData.new)
      toast.success('Senha alterada!')
      setChangePasswordOpen(false)
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (error) {
      toast.error('Erro ao alterar senha', { description: getFirebaseErrorMessage(error) })
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirm !== 'EXCLUIR') return
    try {
      const isGoogleUser = user.providerData?.some((p) => p.providerId === 'google.com')
      if (isGoogleUser) {
        await reauthenticateWithGoogle()
      } else {
        await reauthenticateWithEmail(deletePassword)
      }
      await deleteAccount()
      localStorage.clear()
      router.push('/')
      toast.success('Conta excluída')
    } catch {
      toast.error('Erro ao excluir conta')
    }
  }

  const toggleSensitive = (field: keyof typeof showSensitive) =>
    setShowSensitive(prev => ({ ...prev, [field]: !prev[field] }))

  const passwordToggleClass =
    'absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-slate-500 hover:text-foreground dark:hover:text-slate-300 !bg-transparent !border-none p-0 m-0 focus:outline-none focus:ring-0 focus:ring-offset-0 active:outline-none active:ring-0 !shadow-none outline-none !ring-0 hover:!bg-transparent focus:!bg-transparent active:!bg-transparent focus:!shadow-none'

  return (
    <>
      <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-rose-500/10 rounded-xl">
              <Shield className="h-6 w-6 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Segurança</h2>
          </div>

          <div className="space-y-4 mb-8">
            <Button
              variant="outline"
              onClick={() => setChangePasswordOpen(true)}
              className="w-full h-12 justify-start px-4 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <Key className="h-4 w-4 mr-3 text-slate-400" /> Alterar Senha de Acesso
            </Button>

            <div className="flex gap-2">
              <Select
                aria-label="Formato de exportação"
                value={exportFormat}
                onChange={e => setExportFormat(e.target.value as 'json' | 'xlsx' | 'pdf')}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="json">JSON</option>
                <option value="xlsx">EXCEL</option>
                <option value="pdf">PDF</option>
              </Select>
              <Button
                variant="outline"
                onClick={() => onExportData(exportFormat)}
                className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <Download className="h-4 w-4 mr-2" /> Exportar Dados
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-900">
          <div className="p-5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 group hover:border-rose-200 transition-colors">
            <div>
              <h3 className="text-sm font-black text-rose-600 dark:text-rose-400">Deletar Conta</h3>
              <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1">
                Ação irreversível. Seus dados serão perdidos.
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => setDeleteAccountOpen(true)}
              className="h-9 bg-white dark:bg-rose-950 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
            >
              Excluir Permanentemente
            </Button>
          </div>
        </div>
      </Card>

      {/* Dialog: Alterar Senha */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="bg-background dark:bg-slate-900 border-border dark:border-slate-800 rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Key className="h-5 w-5" /> Segurança
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground dark:text-slate-500">Senha Atual</Label>
              <div className="relative">
                <Input
                  type={showSensitive.currentPass ? 'text' : 'password'}
                  value={passwordData.current}
                  onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                  className="h-12 rounded-xl bg-background dark:bg-slate-800 border-border dark:border-slate-700 pr-12"
                />
                <button type="button" onClick={() => toggleSensitive('currentPass')} className={passwordToggleClass}>
                  {showSensitive.currentPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground dark:text-slate-500">Nova Senha</Label>
              <div className="relative">
                <Input
                  type={showSensitive.newPass ? 'text' : 'password'}
                  value={passwordData.new}
                  onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                  className="h-12 rounded-xl bg-background dark:bg-slate-800 border-border dark:border-slate-700 pr-12"
                />
                <button type="button" onClick={() => toggleSensitive('newPass')} className={passwordToggleClass}>
                  {showSensitive.newPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground dark:text-slate-500">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  type={showSensitive.confirmPass ? 'text' : 'password'}
                  value={passwordData.confirm}
                  onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  className="h-12 rounded-xl bg-background dark:bg-slate-800 border-border dark:border-slate-700 pr-12"
                />
                <button type="button" onClick={() => toggleSensitive('confirmPass')} className={passwordToggleClass}>
                  {showSensitive.confirmPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            className="w-full h-12 rounded-xl bg-primary dark:bg-blue-600 font-bold hover:bg-primary/90 dark:hover:bg-blue-500"
          >
            Confirmar Alteração
          </Button>
        </DialogContent>
      </Dialog>

      {/* Dialog: Excluir Conta */}
      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent className="bg-background dark:bg-slate-900 border-border dark:border-slate-800 rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive dark:text-red-500 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Excluir Conta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-center">
            <Alert
              variant="destructive"
              className="bg-destructive/10 dark:bg-red-500/10 border-destructive/20 dark:border-red-500/20 text-destructive dark:text-red-500"
            >
              <AlertDescription className="text-xs">
                Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.
              </AlertDescription>
            </Alert>
            <div className="space-y-2 text-left">
              <Label className="text-xs font-bold text-muted-foreground dark:text-slate-500">
                Digite EXCLUIR para confirmar
              </Label>
              <Input
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                className="h-12 text-center rounded-xl bg-background dark:bg-slate-800 border-destructive/50 dark:border-red-500/50 uppercase"
              />
            </div>
            {!user?.providerData?.some(p => p.providerId === 'google.com') && (
              <div className="space-y-2 text-left">
                <Label className="text-xs font-bold text-muted-foreground dark:text-slate-500">Sua Senha</Label>
                <div className="relative">
                  <Input
                    type={showSensitive.deletePass ? 'text' : 'password'}
                    placeholder="Sua Senha"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    className="h-12 rounded-xl bg-background dark:bg-slate-800 border-border dark:border-slate-700 pr-12"
                  />
                  <button type="button" onClick={() => toggleSensitive('deletePass')} className={passwordToggleClass}>
                    {showSensitive.deletePass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={deleteConfirm !== 'EXCLUIR'}
            className="w-full h-12 rounded-xl font-bold"
          >
            Excluir Permanentemente
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
