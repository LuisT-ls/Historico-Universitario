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

// ─── data ──────────────────────────────────────────────────────────────────────

interface InfoItem {
  label: string
  value: string
  href?: string
  copyable?: boolean
}

interface InfoSection {
  title: string
  icon: React.ElementType
  items: InfoItem[]
}

const SECTIONS: InfoSection[] = [
  {
    title: 'Emails importantes ✨',
    icon: Mail,
    items: [
      { label: 'Colegiado BICTI (Prof. Carina)', value: 'colicti@ufba.br', href: 'mailto:colicti@ufba.br', copyable: true },
      { label: 'Colegiado Eng. Produção (Prof. Renato)', value: 'renato.vivas@ufba.br', href: 'mailto:renato.vivas@ufba.br', copyable: true },
      { label: 'Secretaria acadêmica', value: 'seacicti@ufba.br', href: 'mailto:seacicti@ufba.br', copyable: true },
      { label: 'Secretaria acadêmica', value: 'italo.caiana@ufba.br', href: 'mailto:italo.caiana@ufba.br', copyable: true },
      { label: 'Direção (Prof. Maiana)', value: 'icti@ufba.br', href: 'mailto:icti@ufba.br', copyable: true },
      { label: 'NOAE', value: 'noae.icti@ufba.br', href: 'mailto:noae.icti@ufba.br', copyable: true },
    ],
  },
  {
    title: 'Documentos',
    icon: FolderOpen,
    items: [
      { label: 'Drive do DA', value: 'Acesse o Drive', href: 'https://drive.google.com/drive/folders/1y9asx8s_i6nJ7Qcl1w9KTZPYCXOGlTD6' },
    ],
  },
  {
    title: 'Comunidades',
    icon: MessageCircle,
    items: [
      { label: 'Grupo Informativo ICTI', value: 'WhatsApp', href: 'https://chat.whatsapp.com/Gkm4vKJcL1D3skgIcJWr4b' },
    ],
  },
]

// ─── helpers ──────────────────────────────────────────────────────────────────

function openLink(href: string) {
  if (isSafeExternalUrl(href)) {
    window.open(href, '_blank', 'noopener,noreferrer')
  }
}

// ─── dialog ───────────────────────────────────────────────────────────────────

interface InfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InfoDialog({ open, onOpenChange }: InfoDialogProps) {
  function handleCopy(value: string) {
    navigator.clipboard.writeText(value).then(() => {
      toast.success('Copiado para a área de transferência!')
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

        {/* drag handle — mobile only */}
        <div className="mx-auto mt-3 mb-1 h-1.5 w-10 rounded-full bg-muted-foreground/20 sm:hidden" />

        <div className="px-6 pb-2 pt-4 sm:p-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              Informações Úteis
            </DialogTitle>
            <DialogDescription>
              Contatos e recursos do ICTI / UFBA
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="mt-2 px-6 pb-8 sm:px-0 sm:pb-0 sm:mt-4 space-y-5">
          {SECTIONS.map((section) => {
            const Icon = section.icon
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
