'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import {
  User,
  Save,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  Camera,
  GraduationCap,
  PlusCircle,
  X,
} from 'lucide-react'
import { updateProfile } from '@/services/firestore.service'
import { CURSOS, CONCENTRACOES_BICTI, CONCENTRACOES_BIHUM, INSTITUTOS } from '@/lib/constants'
import { sanitizeInput } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth-provider'
import type { Profile, Curso, ConcentracaoBICTI, ConcentracaoBIHUM, Instituto } from '@/types'

const isProfileDirty = (current: Profile | null, initial: Profile | null): boolean => {
  if (!current || !initial) return false
  return (
    current.nome !== initial.nome ||
    current.instituto !== initial.instituto ||
    JSON.stringify(current.cursos) !== JSON.stringify(initial.cursos) ||
    current.concentracaoBICTI !== initial.concentracaoBICTI ||
    current.concentracaoBIHUM !== initial.concentracaoBIHUM ||
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

interface ProfilePersonalSectionProps {
  profile: Profile | null
  initialProfile: Profile | null
  isSaving: boolean
  saveSuccess: boolean
  cursoProgresso: number
  addCursoValue: string
  onProfileChange: React.Dispatch<React.SetStateAction<Profile | null>>
  onInitialProfileChange: React.Dispatch<React.SetStateAction<Profile | null>>
  onAddCursoValueChange: (val: string) => void
  onSave: () => void
}

export function ProfilePersonalSection({
  profile,
  initialProfile,
  isSaving,
  saveSuccess,
  cursoProgresso,
  addCursoValue,
  onProfileChange,
  onInitialProfileChange,
  onAddCursoValueChange,
  onSave,
}: ProfilePersonalSectionProps) {
  const { user } = useAuth()
  const [showSensitive, setShowSensitive] = useState({ email: false, enrollment: false })
  const [uploading, setUploading] = useState(false)
  const [entryInput, setEntryInput] = useState('')
  const [addCursoVisible, setAddCursoVisible] = useState(false)
  const [isSavingCourse, setIsSavingCourse] = useState(false)
  const entryInitialized = useRef(false)

  // Initialize entry input once when profile first loads
  useEffect(() => {
    if (profile && !entryInitialized.current) {
      setEntryInput(
        `${profile.startYear || ''}${profile.startSemester ? '.' + profile.startSemester : ''}`
      )
      entryInitialized.current = true
    }
  }, [profile])

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
          resolve(canvas.toDataURL('image/jpeg', 0.7))
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
      onProfileChange(prev => prev ? { ...prev, photoURL: base64Image } : null)
      toast.success('Foto de perfil atualizada!')
    } catch {
      toast.error('Erro ao processar imagem')
    } finally {
      setUploading(false)
    }
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

  const cursoAtivo = ((
    profile?.cursos && profile.cursos.length > 0
      ? profile.cursos[profile.cursos.length - 1]
      : profile?.curso
  ) ?? undefined) as Curso | undefined

  const institutoAtual = profile?.instituto
  const institutoDoAtivo = cursoAtivo ? CURSOS[cursoAtivo]?.instituto : undefined
  const instituteMismatch = !!(institutoAtual && institutoDoAtivo && institutoAtual !== institutoDoAtivo)
  const showOnboarding = (profile?.cursos?.length ?? 0) === 0 || instituteMismatch

  return (
    <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <User className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Dados Pessoais</h2>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4 shrink-0">
          <div className="relative group">
            <div
              className={cn(
                'h-36 w-36 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-900 shadow-xl flex items-center justify-center bg-muted transition-all hover:border-primary/20',
                uploading && 'opacity-50'
              )}
            >
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
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alterar Foto</p>
          </div>
        </div>

        {/* Form fields */}
        <div className="flex-1 w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

            {/* Nome */}
            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nome Completo</Label>
              <Input
                value={profile?.nome || ''}
                onChange={e => onProfileChange(prev => prev ? { ...prev, nome: e.target.value } : null)}
                className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full"
              />
            </div>

            {/* E-mail */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">E-mail</Label>
              <div className="relative">
                <Input
                  disabled
                  value={maskSensitive(profile?.email, 'email')}
                  className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 pr-10 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowSensitive(p => ({ ...p, email: !p.email }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors !bg-transparent !border-none !shadow-none p-1"
                >
                  {showSensitive.email ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Matrícula */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Matrícula</Label>
              <div className="relative">
                <Input
                  type={showSensitive.enrollment ? 'text' : 'password'}
                  value={profile?.matricula || ''}
                  onChange={e => onProfileChange(prev => prev ? { ...prev, matricula: sanitizeInput(e.target.value) } : null)}
                  className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 pr-10 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowSensitive(p => ({ ...p, enrollment: !p.enrollment }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors !bg-transparent !border-none !shadow-none p-1"
                >
                  {showSensitive.enrollment ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Instituto */}
            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Instituto</Label>
              <Select
                value={profile?.instituto ?? ''}
                onChange={e => {
                  const val = e.target.value as Instituto | ''
                  onProfileChange(prev => prev ? { ...prev, instituto: val || undefined } : null)
                  onAddCursoValueChange('')
                }}
                className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Selecione o instituto...</option>
                {(Object.entries(INSTITUTOS) as [Instituto, typeof INSTITUTOS[Instituto]][]).map(([key, inst]) => (
                  <option key={key} value={key}>{inst.sigla} — {inst.nome}</option>
                ))}
              </Select>
            </div>

            {/* Trajetória Acadêmica */}
            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Trajetória Acadêmica</Label>

              {showOnboarding ? (
                /* ── Onboarding: selecionar primeiro curso ── */
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-5 space-y-4">
                  {instituteMismatch ? (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      O instituto selecionado não corresponde ao curso atual. Escolha o curso correto para este instituto.
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Selecione seu curso para começar a acompanhar o histórico acadêmico.
                    </p>
                  )}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Curso</label>
                      <Select
                        value={addCursoValue}
                        onChange={e => onAddCursoValueChange(e.target.value)}
                        disabled={!profile?.instituto}
                        className="h-10 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">{profile?.instituto ? 'Selecione o curso...' : 'Selecione o instituto primeiro'}</option>
                        {profile?.instituto &&
                          INSTITUTOS[profile.instituto].cursos
                            .filter(k => k in CURSOS)
                            .map(k => (
                              <option key={k} value={k}>{CURSOS[k]?.nome || k}</option>
                            ))
                        }
                      </Select>
                    </div>

                    {addCursoValue === 'BICTI' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Concentração (opcional)</label>
                        <Select
                          value={profile?.concentracaoBICTI ?? ''}
                          onChange={e => {
                            const val = e.target.value as ConcentracaoBICTI | ''
                            onProfileChange(prev => prev ? { ...prev, concentracaoBICTI: val || undefined } : null)
                          }}
                          className="h-10 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Nenhuma (BICTI geral)</option>
                          {(Object.entries(CONCENTRACOES_BICTI) as [ConcentracaoBICTI, { nome: string }][]).map(([key, val]) => (
                            <option key={key} value={key}>{val.nome}</option>
                          ))}
                        </Select>
                      </div>
                    )}

                    {addCursoValue === 'BI_HUM' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Habilitação (opcional)</label>
                        <Select
                          value={profile?.concentracaoBIHUM ?? ''}
                          onChange={e => {
                            const val = e.target.value as ConcentracaoBIHUM | ''
                            onProfileChange(prev => prev ? { ...prev, concentracaoBIHUM: val || undefined } : null)
                          }}
                          className="h-10 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Nenhuma (BI em Humanidades geral)</option>
                          {(Object.entries(CONCENTRACOES_BIHUM) as [ConcentracaoBIHUM, { nome: string }][]).map(([key, val]) => (
                            <option key={key} value={key}>{val.nome}</option>
                          ))}
                        </Select>
                      </div>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      disabled={!addCursoValue || isSavingCourse}
                      onClick={async () => {
                        if (!addCursoValue || !user || !profile) return
                        const novos = [addCursoValue as Curso]
                        const updated: Profile = { ...profile, cursos: novos, curso: addCursoValue as Curso }
                        onProfileChange(() => updated)
                        onInitialProfileChange(() => updated)
                        onAddCursoValueChange('')
                        setIsSavingCourse(true)
                        try {
                          await updateProfile(user.uid, {
                            instituto: updated.instituto,
                            cursos: novos,
                            curso: addCursoValue as Curso,
                            concentracaoBICTI: updated.concentracaoBICTI,
                            concentracaoBIHUM: updated.concentracaoBIHUM,
                          })
                          toast.success('Curso configurado!')
                        } catch {
                          toast.error('Erro ao salvar curso')
                        } finally {
                          setIsSavingCourse(false)
                        }
                      }}
                    >
                      {isSavingCourse ? (
                        <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                      ) : (
                        <GraduationCap className="h-3.5 w-3.5 mr-2" />
                      )}
                      Confirmar curso
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── Lista de cursos + Adicionar CPL ── */
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {(profile?.cursos ?? []).map((curso, i, arr) => {
                    const isAtual = i === arr.length - 1
                    return (
                      <div
                        key={curso}
                        className="flex items-center justify-between gap-3 px-4 py-3.5 bg-slate-50 dark:bg-slate-900"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              'h-2 w-2 rounded-full shrink-0',
                              isAtual ? 'bg-primary ring-4 ring-primary/20' : 'bg-slate-300 dark:bg-slate-600'
                            )}
                          />
                          <span className="text-sm font-medium truncate">{CURSOS[curso]?.nome || curso}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={cn(
                              'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                              isAtual
                                ? 'text-primary bg-primary/10'
                                : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                            )}
                          >
                            {isAtual ? 'Atual' : 'Concluído'}
                          </span>
                          {isAtual && arr.length > 1 && (
                            <button
                              type="button"
                              title="Remover curso atual"
                              onClick={() =>
                                onProfileChange(prev => {
                                  if (!prev?.cursos) return prev
                                  const novos = prev.cursos.filter((_, idx) => idx !== i)
                                  return {
                                    ...prev,
                                    cursos: novos,
                                    curso: novos[novos.length - 1],
                                    cplStartYear: undefined,
                                    cplStartSemester: undefined,
                                  }
                                })
                              }
                              className="p-1 text-slate-300 hover:text-destructive transition-colors rounded"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Adicionar progressão CPL */}
                  {(() => {
                    const adicionados = new Set(profile?.cursos ?? [])
                    const instituto = profile?.instituto ?? 'ICTI'
                    const cursosInst = INSTITUTOS[instituto]?.cursos ?? []
                    const disponiveis = cursosInst.filter(k => !adicionados.has(k as Curso) && k in CURSOS)
                    if (disponiveis.length === 0) return null

                    const cursoAtualKey = (profile?.cursos ?? []).at(-1)
                    const cursoAtualCfg = cursoAtualKey ? CURSOS[cursoAtualKey] : null
                    const podeAdicionar = cursoProgresso >= 100

                    if (!addCursoVisible) {
                      return (
                        <button
                          type="button"
                          onClick={() => podeAdicionar && setAddCursoVisible(true)}
                          disabled={!podeAdicionar}
                          title={
                            podeAdicionar
                              ? undefined
                              : `Conclua ${cursoAtualCfg?.nome ?? 'o curso atual'} antes de migrar para CPL (${cursoProgresso.toFixed(1)}% concluído)`
                          }
                          className={cn(
                            'w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors bg-white dark:bg-slate-950 group',
                            podeAdicionar
                              ? 'text-slate-400 hover:text-primary hover:bg-primary/5 cursor-pointer'
                              : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                          )}
                        >
                          <PlusCircle
                            className={cn(
                              'h-3.5 w-3.5',
                              podeAdicionar && 'group-hover:scale-110 transition-transform'
                            )}
                          />
                          <span>Adicionar progressão CPL...</span>
                          {!podeAdicionar && (
                            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              {cursoProgresso.toFixed(1)}% concluído
                            </span>
                          )}
                        </button>
                      )
                    }

                    return (
                      <div className="flex flex-col gap-2 px-4 py-3 bg-white dark:bg-slate-950">
                        <div className="flex items-center gap-2">
                          <Select
                            value={addCursoValue}
                            onChange={e => onAddCursoValueChange(e.target.value)}
                            className="flex-1 h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="">Selecione o curso...</option>
                            {disponiveis.map(k => (
                              <option key={k} value={k}>{CURSOS[k]?.nome || k}</option>
                            ))}
                          </Select>
                          <button
                            type="button"
                            onClick={() => { setAddCursoVisible(false); onAddCursoValueChange('') }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Ingresso no CPL (ex: 2026.1)
                            </label>
                            <Input
                              type="text"
                              placeholder="2026.1"
                              value={
                                profile?.cplStartYear
                                  ? `${profile.cplStartYear}.${profile.cplStartSemester ?? '1'}`
                                  : ''
                              }
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
                                  onProfileChange(prev =>
                                    prev
                                      ? {
                                          ...prev,
                                          cplStartYear: year,
                                          cplStartSemester:
                                            sem === '1' || sem === '2'
                                              ? sem
                                              : (prev.cplStartSemester ?? '1'),
                                        }
                                      : null
                                  )
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
                              onProfileChange(prev => {
                                if (!prev) return prev
                                const novos = [...(prev.cursos ?? []), addCursoValue as Curso]
                                return { ...prev, cursos: novos, curso: addCursoValue as Curso }
                              })
                              onAddCursoValueChange('')
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
              )}

              {(profile?.cursos?.length ?? 0) === 1 && cursoProgresso < 100 && cursoAtivo && (
                <p className="text-xs text-slate-400 pt-0.5">
                  {`Disponível ao concluir ${CURSOS[cursoAtivo]?.nome ?? 'o curso atual'}. Progresso atual: ${cursoProgresso.toFixed(1)}%.`}
                </p>
              )}
            </div>

            {/* Concentração BICTI */}
            {cursoAtivo === 'BICTI' && profile?.instituto === 'ICTI' && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Concentração BICTI</Label>
                <Select
                  value={profile?.concentracaoBICTI ?? ''}
                  onChange={e => {
                    const val = e.target.value as ConcentracaoBICTI | ''
                    onProfileChange(prev => prev ? { ...prev, concentracaoBICTI: val || undefined } : null)
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

            {/* Habilitação BI em Humanidades */}
            {cursoAtivo === 'BI_HUM' && profile?.instituto === 'HUMANIDADES' && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Habilitação BI em Humanidades</Label>
                <Select
                  value={profile?.concentracaoBIHUM ?? ''}
                  onChange={e => {
                    const val = e.target.value as ConcentracaoBIHUM | ''
                    onProfileChange(prev => prev ? { ...prev, concentracaoBIHUM: val || undefined } : null)
                  }}
                  className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Nenhuma (BI em Humanidades geral)</option>
                  {(Object.entries(CONCENTRACOES_BIHUM) as [ConcentracaoBIHUM, { nome: string }][]).map(([key, val]) => (
                    <option key={key} value={key}>{val.nome}</option>
                  ))}
                </Select>
                <p className="text-[11px] text-slate-400">Selecione sua habilitação se já definiu uma trilha específica.</p>
              </div>
            )}

            {/* Ano de Ingresso */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Ano Ingresso</Label>
              <Input
                type="text"
                placeholder="Ex: 2021.1 ou 2021.2"
                value={entryInput}
                onChange={e => {
                  const val = e.target.value
                  if (!/^[0-9.]*$/.test(val)) return
                  const partes = val.split('.')
                  if (partes.length > 2) return
                  const year = partes[0]
                  const semester = partes[1]
                  if (year && year.length > 4) return
                  if (semester && !['1', '2'].includes(semester)) return
                  if (semester && semester.length > 1) return
                  setEntryInput(val)
                  if (year.length === 4) {
                    onProfileChange(prev => {
                      if (!prev) return null
                      return {
                        ...prev,
                        startYear: year,
                        startSemester:
                          semester === '1' || semester === '2'
                            ? semester
                            : (prev.startSemester || '1'),
                      }
                    })
                  }
                }}
                className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full"
              />
            </div>

            {/* Suspensões */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Suspensões (Trancamentos Totais)
              </Label>
              <Input
                type="number"
                min="0"
                value={profile?.suspensions || 0}
                onChange={e =>
                  onProfileChange(prev =>
                    prev ? { ...prev, suspensions: parseInt(e.target.value, 10) || 0 } : null
                  )
                }
                className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full"
              />
            </div>

            {/* Período Atual SIGAA */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Período Atual SIGAA</Label>
              <Input
                placeholder="Ex: 2025.2"
                value={profile?.currentSemester || ''}
                onChange={e =>
                  onProfileChange(prev => prev ? { ...prev, currentSemester: e.target.value } : null)
                }
                className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full"
              />
            </div>

            {/* Instituição */}
            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Instituição</Label>
              <Input
                value={profile?.institution || ''}
                onChange={e =>
                  onProfileChange(prev => prev ? { ...prev, institution: e.target.value } : null)
                }
                className="h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full"
              />
            </div>
          </div>

          {/* Save button — shows only when profile is dirty */}
          {isProfileDirty(profile, initialProfile) && (
            <div className="flex justify-end pt-2 animate-in fade-in slide-in-from-bottom-2">
              <Button
                onClick={onSave}
                disabled={isSaving}
                className={cn(
                  'h-11 px-8 rounded-xl font-bold transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30',
                  saveSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                )}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : saveSuccess ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {isSaving ? 'Salvando...' : saveSuccess ? 'Salvo!' : 'Salvar Alterações'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
