'use client'

import { Copy, ExternalLink, Mail, FolderOpen, MessageCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/lib/toast'
import { isSafeExternalUrl } from '@/lib/utils'
import { INSTITUTOS } from '@/lib/constants'
import type { Instituto } from '@/types'

// ─── helpers ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Mail,
  FolderOpen,
  MessageCircle,
}

function openLink(href: string) {
  if (isSafeExternalUrl(href)) {
    window.open(href, '_blank', 'noopener,noreferrer')
  }
}

// ─── dialog ───────────────────────────────────────────────────────────────────

interface InfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  instituto?: Instituto
}

export function InfoDialog({ open, onOpenChange, instituto = 'ICTI' }: InfoDialogProps) {
  const config = INSTITUTOS[instituto]
  const sections = config?.info ?? []

  function handleCopy(value: string) {
    navigator.clipboard.writeText(value).then(() => {
      toast.success('Copiado para a área de transferência!')
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={[
        '!fixed !bottom-0 !left-0 !right-0 !top-auto',
        '!translate-x-0 !translate-y-0',
        '!max-w-full !w-full',
        '!rounded-t-2xl !rounded-b-none',
        '!p-0',
        'sm:!bottom-auto sm:!left-1/2 sm:!right-auto sm:!top-1/2',
        'sm:!-translate-x-1/2 sm:!-translate-y-1/2',
        'sm:!max-w-md',
        'sm:!rounded-xl',
        'sm:!p-6',
      ].join(' ')}>

        <div className="mx-auto mt-3 mb-1 h-1.5 w-10 rounded-full bg-muted-foreground/20 sm:hidden" />

        <div className="px-6 pb-2 pt-4 sm:p-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              Informações Úteis
            </DialogTitle>
            <DialogDescription>
              Contatos e recursos do {config?.sigla ?? instituto} / UFBA
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="mt-2 px-6 pb-8 sm:px-0 sm:pb-0 sm:mt-4 space-y-5">
          {sections.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma informação disponível para este instituto ainda.
            </p>
          )}
          {sections.map((section) => {
            const Icon = ICON_MAP[section.icon] ?? Mail
            return (
              <div key={section.title}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </span>
                </div>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                        <p className="text-sm font-medium truncate">{item.value}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.copyable && (
                          <button
                            onClick={() => handleCopy(item.value)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label={`Copiar ${item.label}`}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {item.href && (
                          <button
                            onClick={() => item.href && openLink(item.href)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label={`Abrir ${item.label}`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
