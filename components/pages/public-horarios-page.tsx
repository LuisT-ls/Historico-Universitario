'use client'

import React, { useEffect, useState } from 'react'
import { getProfile, getDisciplines, getScheduleCodes } from '@/services/firestore.service'
import { Loader2, TableProperties, ShieldAlert } from 'lucide-react'
import type { Disciplina } from '@/types'

// ─── constants (same as horarios-page) ───────────────────────────────────────

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
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [codes, setCodes] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      try {
        const profile = await getProfile(userId)
        if (!profile) { setNotFound(true); return }
        if (profile.settings?.privacy !== 'public') { setIsPrivate(true); return }

        setUserName(profile.nome ?? null)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (notFound || isPrivate) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground font-medium">
          {notFound ? 'Perfil não encontrado.' : 'Esta grade de horários é privada.'}
        </p>
        {isPrivate && (
          <p className="text-sm text-muted-foreground/70">
            O dono deste perfil precisa torná-lo público para compartilhar a grade.
          </p>
        )}
      </div>
    )
  }

  const grid = buildGrid(disciplinas, codes)
  const activeDayCols = DAYS.map((_, col) => grid.some(row => row[col] !== null))
  const visibleDays = DAYS.filter((d, i) => d.digit <= 6 || activeDayCols[i])
  const visibleDayIndices = visibleDays.map(d => DAYS.findIndex(dd => dd.digit === d.digit))
  const periodOf = (rowIdx: number) => TIME_SLOTS[rowIdx].period

  const hasCodes = disciplinas.some(d => codes[d.id ?? d.codigo])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground dark:text-slate-100">
          Grade de Horários
        </h1>
        {userName && (
          <p className="text-sm text-muted-foreground mt-1">
            de <span className="font-semibold text-foreground">{userName}</span>
          </p>
        )}
      </div>

      {disciplinas.length === 0 || !hasCodes ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <TableProperties className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">Nenhuma grade configurada.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[500px] rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="w-24 px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/50 border-b border-border">
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
                          <td colSpan={visibleDays.length + 1} className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">
                            {PERIOD_LABELS[period]}
                          </td>
                        </tr>
                      )}
                      <tr className="group">
                        <td className="px-3 py-0 h-9 text-[10px] font-mono text-muted-foreground whitespace-nowrap border-b border-border align-middle">
                          {slot.label}<span> – {slot.end}</span>
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
                                'border-b border-l border-border px-1.5 align-middle',
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
      )}
    </div>
  )
}
