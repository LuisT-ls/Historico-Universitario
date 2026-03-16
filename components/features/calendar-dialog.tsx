'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  { label: 'Matrícula WEB (SIGAA)',               start: '2026-02-19', end: '2026-02-24', display: '19/02 a 24/02' },
  { label: 'Processamento da Matrícula (STI)',    start: '2026-02-28', end: '2026-03-02', display: '28/02 a 02/03' },
  { label: 'Resultado da Matrícula WEB',           start: '2026-03-03',                   display: '03/03' },
  { label: 'Início das aulas',                    start: '2026-03-09',                   display: '09/03' },
  { label: 'Processamento da Re-Matrícula (STI)', start: '2026-03-20', end: '2026-03-23', display: '20/03 a 23/03' },
  { label: 'Re-Matrícula WEB',                    start: '2026-03-23', end: '2026-03-26', display: '23/03 a 26/03' },
  { label: 'Resultado da Re-Matrícula WEB',        start: '2026-03-24',                   display: '24/03' },
  { label: 'Matrícula Extraordinária WEB',         start: '2026-03-27', end: '2026-03-30', display: '27/03 a 30/03' },
  { label: 'Término do Semestre',                  start: '2026-07-11',                   display: '11/07' },
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

// ─── dialog ───────────────────────────────────────────────────────────────────

interface CalendarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CalendarDialog({ open, onOpenChange }: CalendarDialogProps) {
  const today = getToday()
  const events = EVENTS.map((event, i) => ({
    event,
    status: getStatus(event, today),
    isLast: i === EVENTS.length - 1,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Mobile: bottom sheet | Desktop: centered modal */}
      <DialogContent className={[
        // mobile — bottom sheet
        '!fixed !bottom-0 !left-0 !right-0 !top-auto',
        '!translate-x-0 !translate-y-0',
        '!max-w-full !w-full',
        '!rounded-t-2xl !rounded-b-none',
        '!p-0',
        // desktop — centered modal
        'sm:!bottom-auto sm:!left-1/2 sm:!right-auto sm:!top-1/2',
        'sm:!-translate-x-1/2 sm:!-translate-y-1/2',
        'sm:!max-w-md',
        'sm:!rounded-xl',
        'sm:!p-6',
      ].join(' ')}>

        {/* drag handle visible only on mobile */}
        <div className="mx-auto mt-3 mb-1 h-1.5 w-10 rounded-full bg-muted-foreground/20 sm:hidden" />

        <div className="px-6 pb-2 pt-4 sm:p-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CalendarDays className="h-5 w-5 text-primary shrink-0" />
              Calendário de Matrícula UFBA
            </DialogTitle>
            <DialogDescription className="pl-7">Semestre {SEMESTER}</DialogDescription>
          </DialogHeader>
        </div>

        <div className="mt-1 max-h-[65svh] sm:max-h-[60vh] overflow-y-auto px-6 pb-6 sm:px-0 sm:pb-0 sm:mt-4">
          {events.map(({ event, status, isLast }) => (
            <EventRow key={event.label} event={event} status={status} isLast={isLast} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
