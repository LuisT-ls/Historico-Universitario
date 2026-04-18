'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, Bell, Globe, TableProperties, Eye } from 'lucide-react'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

interface ProfileSettingsSectionProps {
  profile: Profile | null
  onSettingsChange: (key: string, value: boolean | string) => Promise<void>
}

export function ProfileSettingsSection({ profile, onSettingsChange }: ProfileSettingsSectionProps) {
  const [settingsSaving, setSettingsSaving] = useState<Record<string, boolean>>({})
  const [settingsSuccess, setSettingsSuccess] = useState<Record<string, boolean>>({})

  const handleChange = async (key: string, value: boolean | string) => {
    setSettingsSaving(prev => ({ ...prev, [key]: true }))
    try {
      await onSettingsChange(key, value)
      setSettingsSuccess(prev => ({ ...prev, [key]: true }))
      setTimeout(() => setSettingsSuccess(prev => ({ ...prev, [key]: false })), 2000)
    } catch {
      toast.error('Erro ao salvar configuração')
    } finally {
      setSettingsSaving(prev => ({ ...prev, [key]: false }))
    }
  }

  return (
    <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-sky-500/10 rounded-xl">
          <Settings className="h-6 w-6 text-sky-500" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Preferências</h2>
      </div>

      <div className="space-y-4">
        {/* Notificações */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <Bell className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground block">Notificações</span>
              <span className="text-[10px] text-slate-500">Alertas de prazos e notas</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={settingsSaving['notifications']}
            onClick={() => handleChange('notifications', !profile?.settings?.notifications)}
            className={cn(
              'rounded-lg h-8 px-4 font-medium transition-all',
              profile?.settings?.notifications
                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                : 'text-slate-500'
            )}
          >
            {settingsSuccess['notifications'] ? 'Salvo!' : profile?.settings?.notifications ? 'Ativado' : 'Desativado'}
          </Button>
        </div>

        {/* Perfil Público */}
        <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <Globe className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground block">Perfil Público</span>
                <span className="text-[10px] text-slate-500">Compartilhe seu progresso</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={settingsSaving['privacy']}
              onClick={() => handleChange('privacy', profile?.settings?.privacy === 'public' ? 'private' : 'public')}
              className={cn(
                'rounded-lg h-8 px-4 font-medium transition-all',
                profile?.settings?.privacy === 'public'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500'
              )}
            >
              {settingsSuccess['privacy'] ? 'Salvo!' : profile?.settings?.privacy === 'public' ? 'Público' : 'Privado'}
            </Button>
          </div>

          {profile?.settings?.privacy === 'public' && (
            <div className="pl-12 animate-in fade-in slide-in-from-top-1">
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.uid}`}
                  className="h-9 text-xs font-mono bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/u/${profile.uid}`)
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
            </div>
          )}
        </div>

        {/* Grade de Horários Pública */}
        <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <TableProperties className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground block">Grade de Horários Pública</span>
                <span className="text-[10px] text-slate-500">Compartilhe sua grade com colegas</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={settingsSaving['schedulePrivacy']}
              onClick={() => handleChange('schedulePrivacy', profile?.settings?.schedulePrivacy === 'public' ? 'private' : 'public')}
              className={cn(
                'rounded-lg h-8 px-4 font-medium transition-all',
                profile?.settings?.schedulePrivacy === 'public'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500'
              )}
            >
              {settingsSuccess['schedulePrivacy']
                ? 'Salvo!'
                : profile?.settings?.schedulePrivacy === 'public'
                ? 'Público'
                : 'Privado'}
            </Button>
          </div>

          {profile?.settings?.schedulePrivacy === 'public' && (
            <div className="pl-12 animate-in fade-in slide-in-from-top-1">
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.uid}/horarios`}
                  className="h-9 text-xs font-mono bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/u/${profile.uid}/horarios`)
                    toast.success('Link copiado!')
                  }}
                >
                  Copiar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 px-0"
                  onClick={() => window.open(`/u/${profile.uid}/horarios`, '_blank')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
