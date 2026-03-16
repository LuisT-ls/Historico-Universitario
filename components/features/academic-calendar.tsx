'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CalendarDays } from 'lucide-react'
import dynamic from 'next/dynamic'

const SEMESTER = '2026.1'

// Only loaded when the user first opens the dialog
const CalendarDialog = dynamic(
  () => import('@/components/features/calendar-dialog').then(mod => mod.CalendarDialog),
  { ssr: false }
)

function hasActiveEvent(): boolean {
  const today = (() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  })()
  // Semester active period: 19 Feb – 11 Jul 2026
  const start = new Date(2026, 1, 19).getTime()
  const end   = new Date(2026, 6, 11).getTime()
  return today >= start && today <= end
}

export function AcademicCalendar() {
  const [open, setOpen] = useState(false)
  const active = hasActiveEvent()

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-label="Abrir calendário de matrícula UFBA"
        className="gap-2 border-primary/20 hover:bg-primary/5 rounded-lg relative"
        onClick={() => setOpen(true)}
      >
        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
        <span className="max-sm:hidden">Calendário {SEMESTER}</span>
        {active && (
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
        )}
      </Button>

      {open && <CalendarDialog open={open} onOpenChange={setOpen} />}
    </>
  )
}
