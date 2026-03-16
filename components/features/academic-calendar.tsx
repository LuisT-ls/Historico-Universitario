'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CalendarDays, CheckCircle2, Clock, Circle } from 'lucide-react'

// ─── types ────────────────────────────────────────────────────────────────────

interface CalendarEvent {
  label: string
  /** ISO date — start of range or single day */
  start: string
  /** ISO date — end of range (undefined = single day) */
  end?: string
  /** Human-readable string shown in the UI */
  display: string
}

type EventStatus = 'past' | 'active' | 'upcoming'

// ─── data — update each semester ──────────────────────────────────────────────

const SEMESTER = '2026.1'

const EVENTS: CalendarEvent[] = [
  { label: 'Matrícula WEB (SIGAA)',               start: '2026-02-19', end: '2026-02-24', display: '19 a 24/02' },
  { label: 'Processamento da Matrícula (STI)',    start: '2026-02-28', end: '2026-03-02', display: '28/02 a 02/03' },
  { label: 'Resultado da Matrícula WEB',           start: '2026-03-03',                   display: '03/03' },
  { label: 'Início das aulas',                    start: '2026-03-09',                   display: '09/03' },
  { label: 'Processamento da Re-Matrícula (STI)', start: '2026-03-20', end: '2026-03-23', display: '20 a 23/03' },
  { label: 'Re-Matrícula WEB',                    start: '2026-03-23', end: '2026-03-26', display: '23 a 26/03' },
  { label: 'Resultado da Re-Matrícula WEB',        start: '2026-03-24',                   display: '24/03' },
  { label: 'Matrícula Extraordinária WEB',         start: '2026-03-27', end: '2026-03-30', display: '27 a 30/03' },
]

// ─── helpers ──────────────────────────────────────────────────────────────────

function toDay(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

function getStatus(event: CalendarEvent, today: number): EventStatus {
  const start = toDay(event.start)
  const end   = event.end ? toDay(event.end) : start
  if (today > end)    return 'past'
  if (today >= start) return 'active'
  return 'upcoming'
}

function getToday(): number {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

// ─── event row ────────────────────────────────────────────────────────────────

function EventRow({ event, status, isLast }: { event: CalendarEvent; status: EventStatus; isLast: boolean }) {
  const isPast   = status === 'past'
  const isActive = status === 'active'

  return (
    <div className="flex gap-4">
      {/* timeline column */}
      <div className="flex flex-col items-center">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 ${
          isActive ? 'border-green-500 bg-green-500/10'
          : isPast  ? 'border-muted bg-muted/30'
          :           'border-border bg-background'
        }`}>
          {isActive && <Circle className="h-3 w-3 fill-green-500 text-green-500 animate-pulse" />}
          {isPast   && <CheckCircle2 className="h-4 w-4 text-muted-foreground/40" />}
          {!isActive && !isPast && <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />}
        </div>
        {!isLast && (
          <div className={`w-px flex-1 mt-1 mb-0 min-h-[1.5rem] ${isPast ? 'bg-muted/40' : 'bg-border'}`} />
        )}
      </div>

      {/* content */}
      <div className={`pb-5 flex-1 ${isLast ? 'pb-1' : ''}`}>
        <p className={`text-sm font-medium leading-snug ${
          isPast ? 'text-muted-foreground line-through' :
          isActive ? 'text-foreground font-semibold' :
          'text-foreground'
        }`}>
          {event.label}
        </p>
        <p className={`text-xs mt-0.5 tabular-nums ${
          isActive ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground'
        }`}>
          {event.display}
          {isActive && <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 rounded-full px-2 py-0.5">em andamento</span>}
        </p>
      </div>
    </div>
  )
}

// ─── trigger badge ────────────────────────────────────────────────────────────

function CalendarTriggerBadge({ hasActive }: { hasActive: boolean }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 border-primary/20 hover:bg-primary/5 rounded-lg relative"
    >
      <CalendarDays className="h-3.5 w-3.5" />
      <span>Calendário {SEMESTER}</span>
      {hasActive && (
        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
      )}
    </Button>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export function AcademicCalendar() {
  const today = getToday()
  const events = EVENTS.map((event, i) => ({
    event,
    status: getStatus(event, today),
    isLast: i === EVENTS.length - 1,
  }))
  const hasActive = events.some(e => e.status === 'active')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <CalendarTriggerBadge hasActive={hasActive} />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Calendário de Matrícula UFBA
            <span className="ml-auto text-sm font-normal text-muted-foreground">{SEMESTER}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 max-h-[60vh] overflow-y-auto pr-1">
          {events.map(({ event, status, isLast }) => (
            <EventRow key={event.label} event={event} status={status} isLast={isLast} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
