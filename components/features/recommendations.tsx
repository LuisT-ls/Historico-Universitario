'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb, ChevronDown, ChevronUp, PlusCircle, ArrowRight, TrendingDown } from 'lucide-react'
import type { Disciplina, Curso, Natureza } from '@/types'
import { CURSOS } from '@/lib/constants'
import disciplinasData from '@/assets/data/disciplinas.json'

// ─── constants ────────────────────────────────────────────────────────────────

const NATUREZA_BADGE: Record<string, string> = {
  OB: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  OX: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  OG: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  OZ: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  OH: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  OP: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
}
const NATUREZA_LABEL: Record<string, string> = {
  OB: 'Obrigatória', OX: 'Ext. Obrigatória', OG: 'Opt. Grande Área',
  OZ: 'Opt. Artística', OH: 'Opt. Humanística', OP: 'Optativa',
}

// Ordem decrescente importa para não cortar parcialmente (ex: "III" antes de "I")
const ROMAN_NEXT: [string, string][] = [['IV', 'V'], ['III', 'IV'], ['II', 'III'], ['I', 'II']]
const LETTER_NEXT: [string, string][] = [['C', 'D'], ['B', 'C'], ['A', 'B']]

const INITIAL_SHOW = 9

// ─── types ────────────────────────────────────────────────────────────────────

type Motivo =
  | { tipo: 'sequencia'; nomePrevio: string }
  | { tipo: 'deficit'; natureza: string; hFaltando: number }
  | { tipo: 'pendente' }

interface DiscRecomendada {
  codigo: string
  nome: string
  natureza: string
  ch?: number
  motivo: Motivo
}

interface DeficitInfo {
  natureza: string
  feitas: number
  exigidas: number
  faltando: number
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function normCodigo(c: string): string {
  return c.length >= 6 && c.endsWith('A') ? c.slice(0, -1) : c
}

function nextSeqNome(nome: string): string | null {
  for (const [cur, next] of ROMAN_NEXT) {
    if (nome.endsWith(` ${cur}`)) return nome.slice(0, -(cur.length + 1)) + ` ${next}`
  }
  for (const [cur, next] of LETTER_NEXT) {
    if (nome.endsWith(` ${cur}`)) return nome.slice(0, -2) + ` ${next}`
  }
  return null
}

// ─── component ────────────────────────────────────────────────────────────────

interface RecommendationsProps {
  disciplinas: Disciplina[]
  cursoAtual: Curso
  onSelect: (d: { codigo: string; nome: string; natureza: string; ch?: number }) => void
}

export function Recommendations({ disciplinas, cursoAtual, onSelect }: RecommendationsProps) {
  const [expanded, setExpanded] = useState(false)

  // ── 1. base data ──
  const { recommendations, deficits } = useMemo(() => {
    const data = disciplinasData as any
    const cursoDisciplinas: { codigo: string; natureza: string }[] = data.cursos[cursoAtual] ?? []
    const catalogo: Record<string, { nome: string; ch: number }> = data.catalogo
    const config = CURSOS[cursoAtual]

    // Codes the user has already handled (approved / in-progress / dispensed)
    const codigosFeitos = new Set(
      disciplinas
        .filter(d =>
          d.resultado === 'AP' ||
          d.resultado === 'DP' ||
          d.emcurso === true ||
          d.dispensada === true
        )
        .map(d => normCodigo(d.codigo))
    )

    // All pending disciplines (from curriculum, not yet done)
    const pendentes = cursoDisciplinas
      .filter(({ codigo }) => !codigosFeitos.has(codigo))
      .map(({ codigo, natureza }) => ({
        codigo,
        natureza,
        nome: catalogo[codigo]?.nome ?? codigo,
        ch: catalogo[codigo]?.ch as number | undefined,
      }))

    // ── 2. deficit calculation (raw, without redistribution) ──
    const horasFeitasPorNat: Partial<Record<Natureza, number>> = {}
    disciplinas.forEach(d => {
      const concluida = (d.resultado === 'AP' || d.dispensada) && !d.emcurso
      if (concluida && d.ch && d.natureza !== 'AC') {
        horasFeitasPorNat[d.natureza] = (horasFeitasPorNat[d.natureza] ?? 0) + d.ch
      }
    })

    const deficits: DeficitInfo[] = []
    Object.entries(config?.requisitos ?? {}).forEach(([nat, exigidas]) => {
      if (nat === 'AC' || nat === 'LV' || !exigidas) return
      const feitas = horasFeitasPorNat[nat as Natureza] ?? 0
      const faltando = Math.max(0, exigidas - feitas)
      if (faltando > 0) {
        deficits.push({ natureza: nat, feitas, exigidas: exigidas as number, faltando })
      }
    })
    // Sort by deficit percentage (most urgent first)
    deficits.sort((a, b) => (b.faltando / b.exigidas) - (a.faltando / a.exigidas))

    // ── 3. sequential detection ──
    // Build name → disc map for pending disciplines in this course
    const nomePendente: Record<string, typeof pendentes[number]> = {}
    pendentes.forEach(d => { nomePendente[d.nome] = d })

    // Canonical names of approved (non-dispensed, non-dropped) disciplines
    const nomesAprovados = new Set(
      disciplinas
        .filter(d => d.resultado === 'AP' && !d.dispensada && !d.trancamento)
        .map(d => catalogo[normCodigo(d.codigo)]?.nome ?? d.nome.toUpperCase())
    )

    const seqAdicionados = new Set<string>()
    const sequential: Array<{ disc: typeof pendentes[number]; nomePrevio: string }> = []

    nomesAprovados.forEach(nomeAprovado => {
      const nextNome = nextSeqNome(nomeAprovado)
      if (!nextNome) return
      const next = nomePendente[nextNome]
      if (!next || seqAdicionados.has(next.codigo)) return
      sequential.push({ disc: next, nomePrevio: nomeAprovado })
      seqAdicionados.add(next.codigo)
    })

    // ── 4. build final ordered list ──
    const adicionados = new Set<string>()
    const result: DiscRecomendada[] = []

    // Priority 1: sequential progressions
    sequential.forEach(({ disc, nomePrevio }) => {
      result.push({ ...disc, motivo: { tipo: 'sequencia', nomePrevio } })
      adicionados.add(disc.codigo)
    })

    // Priority 2: disciplines of deficient natureza (most urgent category first)
    deficits.forEach(({ natureza, faltando }) => {
      pendentes
        .filter(d => d.natureza === natureza && !adicionados.has(d.codigo))
        .forEach(d => {
          result.push({ ...d, motivo: { tipo: 'deficit', natureza, hFaltando: faltando } })
          adicionados.add(d.codigo)
        })
    })

    // Priority 3: remaining pending (no specific deficit context)
    pendentes
      .filter(d => !adicionados.has(d.codigo))
      .forEach(d => {
        result.push({ ...d, motivo: { tipo: 'pendente' } })
      })

    return { recommendations: result, deficits }
  }, [disciplinas, cursoAtual])

  if (recommendations.length === 0) return null

  const visible = expanded ? recommendations : recommendations.slice(0, INITIAL_SHOW)
  const hasMore = recommendations.length > INITIAL_SHOW

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle as="h2" className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Disciplinas Pendentes
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
          {deficits.length > 0 ? (
            <>
              <span>Para se formar, ainda faltam:</span>
              {deficits.map(d => (
                <span
                  key={d.natureza}
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide border rounded-full px-2 py-0.5 ${NATUREZA_BADGE[d.natureza] ?? NATUREZA_BADGE['OP']}`}
                >
                  {d.natureza}: {d.faltando}h
                </span>
              ))}
            </>
          ) : (
            <span>{recommendations.length} disciplina{recommendations.length !== 1 ? 's' : ''} ainda não cursada{recommendations.length !== 1 ? 's' : ''}.</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {visible.map(disc => (
            <DiscCard key={disc.codigo} disc={disc} onSelect={onSelect} />
          ))}
        </div>

        {hasMore && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full mt-1 text-muted-foreground"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded
              ? <><ChevronUp className="h-3.5 w-3.5 mr-1.5" />Mostrar menos</>
              : <><ChevronDown className="h-3.5 w-3.5 mr-1.5" />Ver mais {recommendations.length - INITIAL_SHOW} disciplinas</>
            }
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ─── disc card ────────────────────────────────────────────────────────────────

function DiscCard({ disc, onSelect }: {
  disc: DiscRecomendada
  onSelect: RecommendationsProps['onSelect']
}) {
  const { motivo } = disc

  return (
    <button
      type="button"
      onClick={() => onSelect(disc)}
      className="group flex items-start gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-muted/50 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <PlusCircle className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug line-clamp-2">{disc.nome}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {/* natureza badge */}
          <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wide border rounded-full px-1.5 py-0.5 ${NATUREZA_BADGE[disc.natureza] ?? NATUREZA_BADGE['OP']}`}>
            {NATUREZA_LABEL[disc.natureza] ?? disc.natureza}
          </span>
          {disc.ch && (
            <span className="text-[10px] text-muted-foreground">{disc.ch}h</span>
          )}
          {/* reason tag */}
          {motivo.tipo === 'sequencia' && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
              <ArrowRight className="h-3 w-3" />
              {motivo.nomePrevio.split(' ').slice(-2).join(' ')}
            </span>
          )}
          {motivo.tipo === 'deficit' && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              <TrendingDown className="h-3 w-3" />
              faltam {motivo.hFaltando}h de {motivo.natureza}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
