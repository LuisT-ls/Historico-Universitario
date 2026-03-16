'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, CheckCircle2, Clock, ChevronDown, ChevronUp, Dot } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── types ────────────────────────────────────────────────────────────────────

interface CalendarEvent {
  label: string
  /** ISO date string — start of range or single day */
  start: string
  /** ISO date string — end of range, undefined for single-day events */
  end?: string
  /** Human-readable date string shown in the UI */
  display: string
}

type EventStatus = 'past' | 'active' | 'upcoming'

// ─── data — update each semester ──────────────────────────────────────────────

const SEMESTER = '2026.1'

const EVENTS: CalendarEvent[] = [
  { label: 'Matrícula WEB (SIGAA)',               start: '2026-02-19', end: '2026-02-24', display: '19 a 24/02' },
  { label: 'Processamento da Matrícula (STI)',    start: '2026-02-28', end: '2026-03-02', display: '28/02 a 02/03' },
  { label: 'Resultado da Matrícula WEB',           start: '2026-03-03', display: '03/03' },
  { label: 'Início das aulas',                    start: '2026-03-09', display: '09/03' },
  { label: 'Processamento da Re-Matrícula (STI)', start: '2026-03-20', end: '2026-03-23', display: '20 a 23/03' },
  { label: 'Re-Matrícula WEB',                    start: '2026-03-23', end: '2026-03-26', display: '23 a 26/03' },
  { label: 'Resultado da Re-Matrícula WEB',        start: '2026-03-24', display: '24/03' },
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
  if (today > end)   return 'past'
  if (today >= start) return 'active'
  return 'upcoming'
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: EventStatus }) {
  if (status === 'past')
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground/50" />
  if (status === 'active')
    return <Dot className="h-5 w-5 shrink-0 text-green-500 animate-pulse" />
  return <Clock className="h-4 w-4 shrink-0 text-muted-foreground/70" />
}

function EventRow({ event, status }: { event: CalendarEvent; status: EventStatus }) {
  const isPast   = status === 'past'
  const isActive = status === 'active'

  return (
    <div
      className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-green-500/8 border border-green-500/20'
          : isPast
          ? 'opacity-50'
          : 'hover:bg-muted/40'
      }`}
    >
      <StatusIcon status={status} />
      <span
        className={`flex-1 text-sm leading-snug ${
          isPast   ? 'line-through text-muted-foreground' :
          isActive ? 'font-semibold text-foreground' :
                     'text-foreground'
        }`}
      >
        {event.label}
      </span>
      <span
        className={`text-xs tabular-nums whitespace-nowrap ${
          isActive ? 'font-semibold text-green-600 dark:text-green-400' : 'text-muted-foreground'
        }`}
      >
        {event.display}
      </span>
    </div>
  )
}

// ─── component ────────────────────────────────────────────────────────────────

const PREVIEW_COUNT = 3

export function AcademicCalendar() {
  const [expanded, setExpanded] = useState(false)

  const today = (() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  })()

  const events = EVENTS.map(e => ({ event: e, status: getStatus(e, today) }))

  // Find index of first non-past event to anchor the preview
  const firstActiveOrUpcoming = events.findIndex(e => e.status !== 'past')
  const previewStart = firstActiveOrUpcoming === -1
    ? Math.max(0, events.length - PREVIEW_COUNT)
    : Math.max(0, firstActiveOrUpcoming - 1)

  const visible = expanded
    ? events
    : events.slice(previewStart, previewStart + PREVIEW_COUNT)

  const hiddenCount = events.length - PREVIEW_COUNT

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle as="h2" className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-primary" />
          Calendário de Matrícula UFBA
          <span className="ml-auto text-xs font-normal text-muted-foreground">{SEMESTER}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0.5">
        {visible.map(({ event, status }) => (
          <EventRow key={event.label} event={event} status={status} />
        ))}

        {hiddenCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full mt-1 text-muted-foreground"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded
              ? <><ChevronUp   className="h-3.5 w-3.5 mr-1.5" />Mostrar menos</>
              : <><ChevronDown className="h-3.5 w-3.5 mr-1.5" />Ver todos os {events.length} eventos</>
            }
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
