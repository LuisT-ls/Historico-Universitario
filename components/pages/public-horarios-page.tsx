'use client'

import React, { useEffect, useState } from 'react'
import { getProfile, getDisciplines, getScheduleCodes } from '@/services/firestore.service'
import { Loader2, TableProperties, ShieldAlert, AlertCircle, User as UserIcon, GraduationCap, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { CURSOS } from '@/lib/constants'
import { getCurrentSemester } from '@/lib/utils'
import type { Disciplina } from '@/types'

// ─── constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { digit: 2, label: 'Seg' },
  { digit: 3, label: 'Ter' },
  { digit: 4, label: 'Qua' },
  { digit: 5, label: 'Qui' },
  { digit: 6, label: 'Sex' },
  { digit: 7, label: 'Sáb' },
]

const TIME_SLOTS = [
  { label: '07:00', end: '07:55', period: 'M', slot: 1 },
  { label: '07:55', end: '08:50', period: 'M', slot: 2 },
  { label: '08:50', end: '09:45', period: 'M', slot: 3 },
  { label: '09:45', end: '10:40', period: 'M', slot: 4 },
  { label: '10:40', end: '11:35', period: 'M', slot: 5 },
  { label: '11:35', end: '12:30', period: 'M', slot: 6 },
  { label: '13:00', end: '13:55', period: 'T', slot: 1 },
  { label: '13:55', end: '14:50', period: 'T', slot: 2 },
  { label: '14:50', end: '15:45', period: 'T', slot: 3 },
  { label: '15:45', end: '16:40', period: 'T', slot: 4 },
  { label: '16:40', end: '17:35', period: 'T', slot: 5 },
  { label: '17:35', end: '18:30', period: 'T', slot: 6 },
  { label: '18:30', end: '19:25', period: 'N', slot: 1 },
  { label: '19:25', end: '20:20', period: 'N', slot: 2 },
  { label: '20:20', end: '21:15', period: 'N', slot: 3 },
  { label: '21:15', end: '22:10', period: 'N', slot: 4 },
] as const

const PERIOD_LABELS: Record<string, string> = { M: 'Manhã', T: 'Tarde', N: 'Noite' }

const COLORS = [
  { bg: 'bg-blue-500/15 dark:bg-blue-500/20',      border: 'border-blue-400/40',    text: 'text-blue-700 dark:text-blue-300'    },
  { bg: 'bg-emerald-500/15 dark:bg-emerald-500/20', border: 'border-emerald-400/40', text: 'text-emerald-700 dark:text-emerald-300' },
  { bg: 'bg-violet-500/15 dark:bg-violet-500/20',   border: 'border-violet-400/40',  text: 'text-violet-700 dark:text-violet-300'  },
  { bg: 'bg-amber-500/15 dark:bg-amber-500/20',     border: 'border-amber-400/40',   text: 'text-amber-700 dark:text-amber-300'    },
  { bg: 'bg-rose-500/15 dark:bg-rose-500/20',       border: 'border-rose-400/40',    text: 'text-rose-700 dark:text-rose-300'      },
  { bg: 'bg-cyan-500/15 dark:bg-cyan-500/20',       border: 'border-cyan-400/40',    text: 'text-cyan-700 dark:text-cyan-300'      },
  { bg: 'bg-orange-500/15 dark:bg-orange-500/20',   border: 'border-orange-400/40',  text: 'text-orange-700 dark:text-orange-300'  },
  { bg: 'bg-pink-500/15 dark:bg-pink-500/20',       border: 'border-pink-400/40',    text: 'text-pink-700 dark:text-pink-300'      },
]

// ─── parser ───────────────────────────────────────────────────────────────────

interface ParsedCode { days: number[]; period: 'M' | 'T' | 'N'; slots: number[] }

function parseCode(raw: string): ParsedCode | null {
  const match = raw.toUpperCase().trim().match(/^([2-7]+)([MTN])([1-6]+)$/)
  if (!match) return null
  const days = [...new Set(match[1].split('').map(Number))]
  const period = match[2] as 'M' | 'T' | 'N'
  const slots = [...new Set(match[3].split('').map(Number))].sort((a, b) => a - b)
  const maxSlot = period === 'N' ? 4 : 6
  if (slots.some(s => s < 1 || s > maxSlot)) return null
  return { days, period, slots }
}

function slotToRowIndex(period: string, slot: number): number {
  if (period === 'M') return slot - 1
  if (period === 'T') return 5 + slot
  return 11 + slot
}

interface GridCell {
  disciplinaId: string; nome: string; codigo: string
  colorIndex: number; isFirst: boolean; span: number
}
type Grid = (GridCell | null)[][]

function buildGrid(disciplinas: Disciplina[], codes: Record<string, string>): Grid {
  const grid: Grid = Array.from({ length: TIME_SLOTS.length }, () => Array(DAYS.length).fill(null))

  disciplinas.forEach((d, idx) => {
    const id = d.id ?? d.codigo
    const raw = codes[id]
    if (!raw) return
    const parsed = parseCode(raw)
    if (!parsed) return
    const colorIndex = idx % COLORS.length

    parsed.days.forEach(day => {
      const dayCol = DAYS.findIndex(dd => dd.digit === day)
      if (dayCol === -1) return
      parsed.slots.forEach(slot => {
        const row = slotToRowIndex(parsed.period, slot)
        grid[row][dayCol] = { disciplinaId: id, nome: d.nome, codigo: d.codigo, colorIndex, isFirst: false, span: 1 }
      })
    })
  })

  for (let col = 0; col < DAYS.length; col++) {
    let row = 0
    while (row < TIME_SLOTS.length) {
      const cell = grid[row][col]
      if (!cell) { row++; continue }
      let span = 1
      while (row + span < TIME_SLOTS.length && grid[row + span][col]?.disciplinaId === cell.disciplinaId) span++
      grid[row][col] = { ...cell, isFirst: true, span }
      for (let s = 1; s < span; s++) grid[row + s][col] = { ...grid[row + s][col]!, isFirst: false, span: 0 }
      row += span
    }
  }

  return grid
}

// ─── component ────────────────────────────────────────────────────────────────

interface Props { userId: string }

export function PublicHorariosPage({ userId }: Props) {
  const [loading, setLoading] = useState(true)
  const [isPrivate, setIsPrivate] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userCourse, setUserCourse] = useState<string | null>(null)
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [codes, setCodes] = useState<Record<string, string>>({})

  const semestre = getCurrentSemester()

  useEffect(() => {
    async function load() {
      try {
        const profile = await getProfile(userId)
        if (!profile) { setNotFound(true); return }
        if (profile.settings?.schedulePrivacy !== 'public') { setIsPrivate(true); return }

        setUserName(profile.nome ?? null)
        setUserCourse(profile.curso ?? null)
        setUserPhoto(profile.photoURL ?? null)

        const [allDisciplinas, savedCodes] = await Promise.all([
          getDisciplines(userId),
          getScheduleCodes(userId),
        ])

        setDisciplinas(allDisciplinas.filter(d => d.emcurso))
        setCodes(savedCodes)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  // ── loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="max-w-5xl mx-auto flex items-center gap-5">
              <Skeleton className="h-16 w-16 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto space-y-3">
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  // ── not found ──
  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Perfil não encontrado</h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          Este link pode ter expirado ou o perfil foi removido.
        </p>
      </div>
    )
  }

  // ── private ──
  if (isPrivate) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Grade privada</h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          O dono deste perfil precisa tornar a grade de horários pública nas configurações.
        </p>
      </div>
    )
  }

  // ── grid ──
  const grid = buildGrid(disciplinas, codes)
  const activeDayCols = DAYS.map((_, col) => grid.some(row => row[col] !== null))
  const visibleDays = DAYS.filter((d, i) => d.digit <= 6 || activeDayCols[i])
  const visibleDayIndices = visibleDays.map(d => DAYS.findIndex(dd => dd.digit === d.digit))
  const periodOf = (rowIdx: number) => TIME_SLOTS[rowIdx].period
  const hasCodes = disciplinas.some(d => codes[d.id ?? d.codigo])
  const courseLabel = userCourse ? (CURSOS[userCourse as keyof typeof CURSOS]?.nome ?? userCourse) : null

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Hero / Header ── */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-lg shrink-0 overflow-hidden">
              {userPhoto
                ? <img src={userPhoto} alt={userName ?? 'Estudante'} className="h-full w-full object-cover" />
                : <UserIcon className="h-7 w-7 text-primary" />
              }
            </div>
            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">
                  {userName ?? 'Estudante'}
                </h1>
                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                  Grade Compartilhada
                </Badge>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                {courseLabel && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {courseLabel}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Semestre {semestre}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto space-y-6">

          {disciplinas.length === 0 || !hasCodes ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <TableProperties className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-muted-foreground text-sm">Nenhuma grade configurada.</p>
            </div>
          ) : (
            <>
              {/* Legend — discipline chips */}
              <div className="flex flex-wrap gap-2">
                {disciplinas
                  .filter(d => codes[d.id ?? d.codigo])
                  .map((d, idx) => {
                    const color = COLORS[idx % COLORS.length]
                    return (
                      <span
                        key={d.id ?? d.codigo}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${color.bg} ${color.border} ${color.text}`}
                      >
                        <span className="font-mono opacity-70">{d.codigo}</span>
                        <span>{d.nome}</span>
                      </span>
                    )
                  })}
              </div>

              {/* Grid */}
              <div className="-mx-4 sm:mx-0 overflow-x-auto">
                <div className="min-w-[480px] px-4 sm:px-0">
                  <div className="rounded-none sm:rounded-xl border-y sm:border border-border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr>
                          <th className="w-20 sm:w-24 px-2 sm:px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/50 border-b border-border">
                            Horário
                          </th>
                          {visibleDays.map(day => (
                            <th key={day.digit} className="px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/50 border-b border-l border-border">
                              {day.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {TIME_SLOTS.map((slot, rowIdx) => {
                          const isFirstOfPeriod = rowIdx === 0 || periodOf(rowIdx) !== periodOf(rowIdx - 1)
                          const period = periodOf(rowIdx)

                          return (
                            <React.Fragment key={rowIdx}>
                              {isFirstOfPeriod && (
                                <tr className="bg-muted/30">
                                  <td colSpan={visibleDays.length + 1} className="px-2 sm:px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">
                                    {PERIOD_LABELS[period]}
                                  </td>
                                </tr>
                              )}
                              <tr className="group">
                                <td className="px-2 sm:px-3 py-0 h-9 text-[10px] font-mono text-muted-foreground whitespace-nowrap border-b border-border align-middle">
                                  <span className="hidden sm:inline">{slot.label} – {slot.end}</span>
                                  <span className="sm:hidden">{slot.label}</span>
                                </td>
                                {visibleDayIndices.map(colIdx => {
                                  const cell = grid[rowIdx][colIdx]
                                  if (cell && !cell.isFirst && cell.span === 0) return null
                                  const color = cell ? COLORS[cell.colorIndex] : null
                                  return (
                                    <td
                                      key={colIdx}
                                      rowSpan={cell?.isFirst ? cell.span : undefined}
                                      className={[
                                        'border-b border-l border-border px-1 sm:px-1.5 align-middle',
                                        cell?.isFirst ? `${color!.bg} ${color!.border}` : 'group-hover:bg-muted/20',
                                      ].join(' ')}
                                      style={cell?.isFirst ? { height: `${cell.span * 36}px` } : { height: '36px' }}
                                    >
                                      {cell?.isFirst && (
                                        <div className="flex flex-col justify-center h-full py-1 gap-0.5">
                                          <span className={`font-semibold leading-tight line-clamp-2 ${color!.text}`}>{cell.nome}</span>
                                          <span className={`text-[10px] font-mono opacity-70 ${color!.text}`}>{cell.codigo}</span>
                                        </div>
                                      )}
                                    </td>
                                  )
                                })}
                              </tr>
                            </React.Fragment>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
