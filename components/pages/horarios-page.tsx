'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/components/auth-provider'
import { getDisciplines, getScheduleCodes, saveScheduleCodes } from '@/services/firestore.service'
import { getCurrentSemester } from '@/lib/utils'
import type { Disciplina } from '@/types'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, TableProperties, BookOpen, Info } from 'lucide-react'

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
  // Manhã
  { label: '07:00', end: '07:55', period: 'M', slot: 1 },
  { label: '07:55', end: '08:50', period: 'M', slot: 2 },
  { label: '08:50', end: '09:45', period: 'M', slot: 3 },
  { label: '09:45', end: '10:40', period: 'M', slot: 4 },
  { label: '10:40', end: '11:35', period: 'M', slot: 5 },
  { label: '11:35', end: '12:30', period: 'M', slot: 6 },
  // Tarde
  { label: '13:00', end: '13:55', period: 'T', slot: 1 },
  { label: '13:55', end: '14:50', period: 'T', slot: 2 },
  { label: '14:50', end: '15:45', period: 'T', slot: 3 },
  { label: '15:45', end: '16:40', period: 'T', slot: 4 },
  { label: '16:40', end: '17:35', period: 'T', slot: 5 },
  { label: '17:35', end: '18:30', period: 'T', slot: 6 },
  // Noite
  { label: '18:30', end: '19:25', period: 'N', slot: 1 },
  { label: '19:25', end: '20:20', period: 'N', slot: 2 },
  { label: '20:20', end: '21:15', period: 'N', slot: 3 },
  { label: '21:15', end: '22:10', period: 'N', slot: 4 },
] as const

const PERIOD_LABELS: Record<string, string> = { M: 'Manhã', T: 'Tarde', N: 'Noite' }

const COLORS = [
  { bg: 'bg-blue-500/15 dark:bg-blue-500/20',    border: 'border-blue-400/40',    text: 'text-blue-700 dark:text-blue-300'    },
  { bg: 'bg-emerald-500/15 dark:bg-emerald-500/20', border: 'border-emerald-400/40', text: 'text-emerald-700 dark:text-emerald-300' },
  { bg: 'bg-violet-500/15 dark:bg-violet-500/20',  border: 'border-violet-400/40',  text: 'text-violet-700 dark:text-violet-300'  },
  { bg: 'bg-amber-500/15 dark:bg-amber-500/20',    border: 'border-amber-400/40',    text: 'text-amber-700 dark:text-amber-300'    },
  { bg: 'bg-rose-500/15 dark:bg-rose-500/20',      border: 'border-rose-400/40',     text: 'text-rose-700 dark:text-rose-300'      },
  { bg: 'bg-cyan-500/15 dark:bg-cyan-500/20',      border: 'border-cyan-400/40',     text: 'text-cyan-700 dark:text-cyan-300'      },
  { bg: 'bg-orange-500/15 dark:bg-orange-500/20',  border: 'border-orange-400/40',   text: 'text-orange-700 dark:text-orange-300'  },
  { bg: 'bg-pink-500/15 dark:bg-pink-500/20',      border: 'border-pink-400/40',     text: 'text-pink-700 dark:text-pink-300'      },
]

// ─── parser ───────────────────────────────────────────────────────────────────

interface ParsedCode {
  days: number[]
  period: 'M' | 'T' | 'N'
  slots: number[]
}

function parseCode(raw: string): ParsedCode | null {
  const match = raw.toUpperCase().trim().match(/^([2-7]+)([MTN])([1-6]+)$/)
  if (!match) return null
  const days = [...new Set(match[1].split('').map(Number))]
  const period = match[2] as 'M' | 'T' | 'N'
  const slots = [...new Set(match[3].split('').map(Number))].sort((a, b) => a - b)
  // Validate slot range
  const maxSlot = period === 'N' ? 4 : 6
  if (slots.some(s => s < 1 || s > maxSlot)) return null
  return { days, period, slots }
}

function slotToRowIndex(period: string, slot: number): number {
  if (period === 'M') return slot - 1
  if (period === 'T') return 5 + slot      // 6 + (slot-1) = 5 + slot
  return 11 + slot                          // 12 + (slot-1) = 11 + slot
}

// ─── types ────────────────────────────────────────────────────────────────────

interface GridCell {
  disciplinaId: string
  nome: string
  codigo: string
  colorIndex: number
  /** true when this is the first slot of a contiguous block (show name) */
  isFirst: boolean
  /** count of contiguous slots for this block */
  span: number
}

// grid[rowIndex][dayDigit] = GridCell | null
type Grid = (GridCell | null)[][]

// ─── grid builder ─────────────────────────────────────────────────────────────

function buildGrid(
  disciplinas: Disciplina[],
  codes: Record<string, string>
): Grid {
  const grid: Grid = Array.from({ length: TIME_SLOTS.length }, () =>
    Array(DAYS.length).fill(null)
  )

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
        grid[row][dayCol] = {
          disciplinaId: id,
          nome: d.nome,
          codigo: d.codigo,
          colorIndex,
          isFirst: false,
          span: 1,
        }
      })
    })
  })

  // Mark first slot and span for visual grouping
  for (let col = 0; col < DAYS.length; col++) {
    let row = 0
    while (row < TIME_SLOTS.length) {
      const cell = grid[row][col]
      if (!cell) { row++; continue }

      // Find contiguous slots for the same discipline
      let span = 1
      while (
        row + span < TIME_SLOTS.length &&
        grid[row + span][col]?.disciplinaId === cell.disciplinaId
      ) {
        span++
      }
      grid[row][col] = { ...cell, isFirst: true, span }
      // Mark intermediate rows as "occupied but not first"
      for (let s = 1; s < span; s++) {
        grid[row + s][col] = { ...grid[row + s][col]!, isFirst: false, span: 0 }
      }
      row += span
    }
  }

  return grid
}

// ─── component ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'horarios_codes_v1'

function readLocalCodes(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}

function writeLocalCodes(codes: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(codes))
}

export function HorariosPage() {
  const { user, loading: authLoading } = useAuth()
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [codes, setCodes] = useState<Record<string, string>>({})
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const semestre = getCurrentSemester()

  // Load disciplines
  useEffect(() => {
    if (authLoading || !user) return
    setIsLoading(true)
    getDisciplines(user.uid)
      .then(all => setDisciplinas(all.filter(d => d.emcurso)))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [user, authLoading])

  // Load codes: Firebase first, localStorage as fallback
  useEffect(() => {
    if (authLoading || !user) return
    getScheduleCodes(user.uid)
      .then(saved => {
        setCodes(saved)
        setInputs(saved)
        writeLocalCodes(saved)
      })
      .catch(() => {
        const local = readLocalCodes()
        setCodes(local)
        setInputs(local)
      })
  }, [user, authLoading])

  // Debounced Firebase save — fires 1s after last change
  const scheduleSave = useCallback((nextCodes: Record<string, string>) => {
    if (!user) return
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveScheduleCodes(user.uid, nextCodes).catch(() => {})
    }, 1000)
  }, [user])

  const handleCodeChange = useCallback((id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }))

    const trimmed = value.trim()
    if (trimmed === '') {
      setErrors(prev => ({ ...prev, [id]: false }))
      setCodes(prev => {
        const next = { ...prev }
        delete next[id]
        writeLocalCodes(next)
        scheduleSave(next)
        return next
      })
      return
    }

    const parsed = parseCode(trimmed)
    if (parsed) {
      setErrors(prev => ({ ...prev, [id]: false }))
      setCodes(prev => {
        const next = { ...prev, [id]: trimmed.toUpperCase() }
        writeLocalCodes(next)
        scheduleSave(next)
        return next
      })
    } else {
      setErrors(prev => ({ ...prev, [id]: true }))
    }
  }, [scheduleSave])

  const grid = buildGrid(disciplinas, codes)

  // Which day columns actually have at least one class
  const activeDayCols = DAYS.map((_, col) =>
    grid.some(row => row[col] !== null)
  )
  // Always show Mon–Fri; show Sat only if it has a class
  const visibleDays = DAYS.filter((d, i) => d.digit <= 6 || activeDayCols[i])
  const visibleDayIndices = visibleDays.map(d => DAYS.findIndex(dd => dd.digit === d.digit))

  // Period separators
  const periodOf = (rowIdx: number) => TIME_SLOTS[rowIdx].period

  // ── not logged in ──
  if (!authLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <TableProperties className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">Faça login para visualizar sua grade de horários.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground dark:text-slate-100">
          Grade de Horários
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Semestre <span className="font-semibold text-primary">{semestre}</span>
          {' '}· Os códigos são salvos localmente e não vão ao banco de dados.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6">

          {/* ── Sidebar: discipline list ── */}
          <aside className="xl:w-72 shrink-0 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
              Disciplinas em Curso
            </h2>

            {disciplinas.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 px-4 border rounded-xl border-dashed text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma disciplina marcada como <strong>em curso</strong>.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Na página inicial, marque uma disciplina como "Em Curso" ao adicioná-la.
                </p>
              </div>
            ) : (
              disciplinas.map((d, idx) => {
                const id = d.id ?? d.codigo
                const color = COLORS[idx % COLORS.length]
                const hasCode = !!codes[id]
                const hasError = errors[id]

                return (
                  <div
                    key={id}
                    className={`p-3 rounded-xl border ${color.bg} ${color.border} space-y-2`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${color.text}`}>{d.nome}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{d.codigo}</p>
                      </div>
                      {hasCode && !hasError && (
                        <Badge variant="outline" className={`text-[10px] px-1.5 shrink-0 ${color.border} ${color.text}`}>
                          {codes[id]}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Input
                        placeholder="ex: 46T56"
                        value={inputs[id] ?? ''}
                        onChange={e => handleCodeChange(id, e.target.value)}
                        className={`h-8 text-xs font-mono uppercase bg-background/70 ${
                          hasError ? 'border-destructive focus-visible:ring-destructive' : ''
                        }`}
                        maxLength={10}
                        spellCheck={false}
                        aria-label={`Código de horário de ${d.nome}`}
                      />
                      {hasError && (
                        <p className="text-[10px] text-destructive">
                          Código inválido. Ex: 2M34, 46T56, 35N12
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            )}

            {/* Legend */}
            <div className="mt-4 p-3 rounded-xl bg-muted/40 border border-border space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Formato do código</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <code className="text-[11px] bg-background border border-border rounded px-1.5 py-0.5 font-mono">dias</code>
                <code className="text-[11px] bg-background border border-border rounded px-1.5 py-0.5 font-mono">M/T/N</code>
                <code className="text-[11px] bg-background border border-border rounded px-1.5 py-0.5 font-mono">slots</code>
              </div>
              <div className="text-[10px] text-muted-foreground space-y-0.5">
                <p><span className="font-semibold">Dias:</span> 2=Seg 3=Ter 4=Qua 5=Qui 6=Sex 7=Sáb</p>
                <p><span className="font-semibold">Turno:</span> M=Manhã T=Tarde N=Noite</p>
                <p><span className="font-semibold">Slots M/T:</span> 1–6 · <span className="font-semibold">Slots N:</span> 1–4</p>
              </div>
              <div className="flex items-start gap-1 pt-1">
                <Info className="h-3 w-3 text-muted-foreground shrink-0 mt-px" />
                <p className="text-[10px] text-muted-foreground">
                  Ex: <span className="font-mono font-semibold">46T56</span> = Qua+Sex, Tarde, 16:40–18:30
                </p>
              </div>
            </div>
          </aside>

          {/* ── Schedule grid ── */}
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-[500px] rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="w-24 px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/50 border-b border-border">
                      Horário
                    </th>
                    {visibleDays.map(day => (
                      <th
                        key={day.digit}
                        className="px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/50 border-b border-l border-border"
                      >
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
                            <td
                              colSpan={visibleDays.length + 1}
                              className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border"
                            >
                              {PERIOD_LABELS[period]}
                            </td>
                          </tr>
                        )}
                        <tr className="group">
                          {/* Time label */}
                          <td className="px-3 py-0 h-9 text-[10px] font-mono text-muted-foreground whitespace-nowrap border-b border-border align-middle">
                            {slot.label}
                            <span className="text-muted-foreground/40"> – {slot.end}</span>
                          </td>

                          {/* Day cells */}
                          {visibleDayIndices.map(colIdx => {
                            const cell = grid[rowIdx][colIdx]

                            // Hidden: this row is covered by a spanning cell above
                            if (cell && !cell.isFirst && cell.span === 0) return null

                            const color = cell ? COLORS[cell.colorIndex] : null

                            return (
                              <td
                                key={colIdx}
                                rowSpan={cell?.isFirst ? cell.span : undefined}
                                className={[
                                  'border-b border-l border-border px-1.5 align-middle',
                                  cell?.isFirst
                                    ? `${color!.bg} ${color!.border}`
                                    : 'group-hover:bg-muted/20',
                                ].join(' ')}
                                style={cell?.isFirst ? { height: `${cell.span * 36}px` } : { height: '36px' }}
                              >
                                {cell?.isFirst && (
                                  <div className="flex flex-col justify-center h-full py-1 gap-0.5">
                                    <span className={`font-semibold leading-tight line-clamp-2 ${color!.text}`}>
                                      {cell.nome}
                                    </span>
                                    <span className={`text-[10px] font-mono opacity-70 ${color!.text}`}>
                                      {cell.codigo}
                                    </span>
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
      )}
    </div>
  )
}
