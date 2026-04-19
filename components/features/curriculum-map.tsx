'use client'

import { useMemo } from 'react'
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  BookMarked,
  Clock,
  Circle,
  GraduationCap,
  LayoutGrid,
} from 'lucide-react'
import type { Disciplina, Certificado, Curso, Natureza, Profile } from '@/types'
import { calcularEstatisticas } from '@/lib/utils'
import { CURSOS, NATUREZA_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import disciplinasDataIcti from '@/assets/data/icti/disciplinas.json'
import disciplinasDataHum from '@/assets/data/humanidades/disciplinas.json'
import matrizesDataIcti from '@/assets/data/icti/matrizes.json'
import matrizesDataHum from '@/assets/data/humanidades/matrizes.json'
import type { DisciplinasCatalogo, MatrizCurricular } from '@/types'
import { prerequisitosFaltando } from '@/lib/utils/prerequisites'

const catalogo = {
  ...(disciplinasDataIcti as DisciplinasCatalogo).catalogo,
  ...(disciplinasDataHum as DisciplinasCatalogo).catalogo,
}
const cursosData = {
  ...(disciplinasDataIcti as DisciplinasCatalogo).cursos,
  ...(disciplinasDataHum as DisciplinasCatalogo).cursos,
}
const matrizes = { ...matrizesDataIcti, ...matrizesDataHum } as MatrizCurricular

// ─── types ────────────────────────────────────────────────────────────────────

type StatusDisc = 'aprovado' | 'emcurso' | 'reprovado' | 'trancado' | 'pendente' | 'bloqueada'

interface CatalogItem {
  codigo: string
  nome: string
  ch: number
  natureza: Natureza
  status: StatusDisc
  nota?: number
  periodo?: string
  /** Códigos de pré-requisitos ainda não cumpridos (apenas quando status === 'bloqueada') */
  prereqFaltando?: string[]
}

interface Props {
  disciplinas: Disciplina[]
  certificados: Certificado[]
  curso: Curso
  profile?: Profile
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function getBestStatus(matches: Disciplina[]): StatusDisc {
  if (!matches.length) return 'pendente'
  if (matches.some((d) => (d.resultado === 'AP' && !d.trancamento) || d.dispensada)) return 'aprovado'
  if (matches.some((d) => d.emcurso)) return 'emcurso'
  if (matches.some((d) => (d.resultado === 'RR' || d.resultado === 'RF' || d.resultado === 'RMF') && !d.trancamento)) return 'reprovado'
  if (matches.some((d) => d.trancamento)) return 'trancado'
  return 'pendente'
}


const STATUS_CONFIG: Record<StatusDisc, { icon: React.ReactNode; label: string; dot: string; row: string }> = {
  aprovado: {
    icon: <CheckCircle2 className="h-4 w-4 shrink-0" />,
    label: 'Concluída',
    dot: 'text-emerald-500',
    row: 'text-emerald-700 dark:text-emerald-400',
  },
  emcurso: {
    icon: <Clock className="h-4 w-4 shrink-0" />,
    label: 'Em curso',
    dot: 'text-primary',
    row: 'text-primary',
  },
  reprovado: {
    icon: <XCircle className="h-4 w-4 shrink-0" />,
    label: 'Reprovada',
    dot: 'text-rose-500',
    row: 'text-rose-600 dark:text-rose-400',
  },
  trancado: {
    icon: <MinusCircle className="h-4 w-4 shrink-0" />,
    label: 'Trancada',
    dot: 'text-amber-500',
    row: 'text-amber-600 dark:text-amber-400',
  },
  pendente: {
    icon: <Circle className="h-4 w-4 shrink-0" />,
    label: 'Pendente',
    dot: 'text-muted-foreground/40',
    row: 'text-muted-foreground',
  },
  bloqueada: {
    icon: <Circle className="h-4 w-4 shrink-0 opacity-40" />,
    label: 'Bloqueada',
    dot: 'text-muted-foreground/20',
    row: 'text-muted-foreground/50',
  },
}

// ─── sub-components ───────────────────────────────────────────────────────────

function DiscRow({ item, catalogo: cat }: { item: CatalogItem; catalogo: Record<string, { nome: string; ch: number }> }) {
  const cfg = STATUS_CONFIG[item.status]
  const prereqTooltip = item.prereqFaltando && item.prereqFaltando.length > 0
    ? `Requer: ${item.prereqFaltando.map(c => cat[c]?.nome ?? c).join(', ')}`
    : item.nome

  return (
    <li className={cn('flex items-center gap-2 py-1.5 text-sm border-b border-border/30 last:border-0', cfg.row)}>
      <span className="shrink-0">{cfg.icon}</span>
      <span className="flex-1 min-w-0 leading-snug" title={prereqTooltip}>
        {item.nome}
        {item.status === 'bloqueada' && item.prereqFaltando && item.prereqFaltando.length > 0 && (
          <span className="ml-1 text-[10px] font-medium opacity-60">
            — falta {item.prereqFaltando.map(c => cat[c]?.nome ?? c).join(', ')}
          </span>
        )}
      </span>
      <div className="flex items-center gap-2 shrink-0 text-xs">
        {item.nota !== undefined && item.nota >= 0 && item.status !== 'pendente' && item.status !== 'bloqueada' && (
          <span
            className={cn(
              'font-bold tabular-nums px-1.5 py-0.5 rounded-md text-[10px]',
              item.nota >= 7
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : item.nota >= 5
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
            )}
          >
            {item.nota.toFixed(1)}
          </span>
        )}
        <span className="text-muted-foreground font-medium tabular-nums w-10 text-right">
          {item.ch}h
        </span>
      </div>
    </li>
  )
}

function SemesterCard({ semestre, items, catalogo: cat }: { semestre: number; items: CatalogItem[]; catalogo: Record<string, { nome: string; ch: number }> }) {
  const concluidas = items.filter((i) => i.status === 'aprovado').length
  const total = items.length
  const allDone = concluidas === total
  const chTotal = items.reduce((s, i) => s + i.ch, 0)
  const chFeito = items
    .filter((i) => i.status === 'aprovado')
    .reduce((s, i) => s + i.ch, 0)

  return (
    <div
      className={cn(
        'rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md',
        allDone ? 'border-emerald-500/40' : 'border-border/70',
      )}
    >
      {/* Card header */}
      <div
        className={cn(
          'px-4 py-3 flex items-center justify-between',
          allDone
            ? 'bg-emerald-500/8 border-b border-emerald-500/20'
            : 'bg-muted/30 border-b border-border/50',
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-foreground">
            {semestre}º Semestre
          </span>
          {allDone && (
            <Badge className="text-[10px] h-5 px-2 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold">
              Concluído
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="tabular-nums">{chFeito}/{chTotal}h</span>
          <span
            className={cn(
              'font-bold tabular-nums',
              concluidas === total ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground',
            )}
          >
            {concluidas}/{total}
          </span>
        </div>
      </div>

      {/* Discipline list */}
      <ul className="px-4 py-1">
        {items.map((item) => (
          <DiscRow key={item.codigo} item={item} catalogo={cat} />
        ))}
      </ul>
    </div>
  )
}

function NaturezaCard({
  natureza,
  items,
  requiredCH,
  completedCH,
  certificates,
  catalogo: cat,
}: {
  natureza: Natureza
  items: CatalogItem[]
  requiredCH: number
  completedCH: number
  certificates?: number
  catalogo: Record<string, { nome: string; ch: number }>
}) {
  const percent = Math.min(100, requiredCH > 0 ? Math.round((completedCH / requiredCH) * 100) : 0)
  const complete = completedCH >= requiredCH
  const label = NATUREZA_LABELS[natureza] ?? natureza

  const barColor = complete
    ? 'bg-emerald-500'
    : percent >= 50
      ? 'bg-primary'
      : 'bg-amber-500'

  return (
    <div
      className={cn(
        'rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md',
        complete ? 'border-emerald-500/40' : 'border-border/70',
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'px-4 py-3 border-b',
          complete ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-muted/30 border-border/50',
        )}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-bold text-sm text-foreground">{label}</span>
          {complete && (
            <Badge className="text-[10px] h-5 px-2 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold shrink-0">
              Integralizado
            </Badge>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700 ease-out', barColor)}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground tabular-nums">{completedCH}h</span>
              {' '}de{' '}
              <span className="font-semibold text-foreground tabular-nums">{requiredCH}h</span>
            </span>
            <span className={cn('font-bold tabular-nums', complete ? 'text-emerald-600 dark:text-emerald-400' : '')}>
              {percent}%
            </span>
          </div>
        </div>
      </div>

      {/* Disciplines taken */}
      {items.length > 0 ? (
        <ul className="px-4 py-1">
          {items.map((item) => (
            <DiscRow key={item.codigo} item={item} catalogo={cat} />
          ))}
        </ul>
      ) : (
        <p className="px-4 py-3 text-xs text-muted-foreground">
          Nenhuma disciplina cadastrada nesta categoria.
        </p>
      )}

      {natureza === 'AC' && certificates !== undefined && certificates > 0 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <BookMarked className="h-3.5 w-3.5 text-sky-500" />
            {certificates}h via certificados aprovados
          </p>
        </div>
      )}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export function CurriculumMap({ disciplinas, certificados, curso, profile }: Props) {
  // Set de códigos aprovados (para verificação de pré-requisitos)
  const codigosAprovados = useMemo(() => {
    const approved: string[] = []
    for (const d of disciplinas) {
      if ((d.resultado === 'AP' && !d.trancamento) || d.dispensada) {
        approved.push(d.codigo)
      }
    }
    return approved
  }, [disciplinas])

  // Lookup by codigo (primary)
  const byCode = useMemo(() => {
    const map = new Map<string, Disciplina[]>()
    for (const d of disciplinas) {
      if (!d.codigo) continue
      const key = d.codigo.trim().toUpperCase()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(d)
    }
    return map
  }, [disciplinas])

  // Lookup by nome normalizado (fallback — parser já substitui nome pelo canônico do catálogo)
  const byNome = useMemo(() => {
    const map = new Map<string, Disciplina[]>()
    for (const d of disciplinas) {
      const key = d.nome.trim().toUpperCase()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(d)
    }
    return map
  }, [disciplinas])

  // Merge matches from code and nome lookups, deduplicating by identity
  function findMatches(code: string, catalogNome: string): Disciplina[] {
    const codeKey = code.toUpperCase()
    const nomeKey = catalogNome.toUpperCase()
    const seen = new Set<Disciplina>()
    const merged: Disciplina[] = []

    function add(discs: Disciplina[]) {
      for (const d of discs) {
        if (!seen.has(d)) { seen.add(d); merged.push(d) }
      }
    }

    // 1. Exact code match
    add(byCode.get(codeKey) ?? [])

    // 2. Prefix match: student code may have a turma suffix not stripped by parser
    //    e.g. catalog "CTIA10", student stored "CTIA10B"
    for (const [studentCode, discs] of byCode) {
      if (studentCode !== codeKey && studentCode.startsWith(codeKey)) {
        add(discs)
      }
    }

    // 3. Nome match (fallback when codes diverge entirely)
    add(byNome.get(nomeKey) ?? [])

    return merged
  }

  // Build catalog items for a list of codes + natureza override
  function buildItems(codes: string[], naturezaOverride?: Natureza): CatalogItem[] {
    return codes.flatMap((code) => {
      const entry = catalogo[code]
      if (!entry) return []
      const matches = findMatches(code, entry.nome)
      let status = getBestStatus(matches)
      // Nota e período sempre da tentativa aprovada — nunca de trancamentos ou reprovações
      const approvedMatch = matches.find(
        (d) => (d.resultado === 'AP' && !d.trancamento) || d.dispensada,
      )
      const cursoDisciplinas = cursosData[curso] ?? []
      const courseEntry = cursoDisciplinas.find((c) => c.codigo === code)
      const natureza = naturezaOverride ?? (courseEntry?.natureza as Natureza) ?? 'OB'

      // Verifica pré-requisitos: disciplina pendente com pré-req não cumprido → bloqueada
      let prereqFaltando: string[] | undefined
      if (status === 'pendente') {
        const faltando = prerequisitosFaltando(code, curso, codigosAprovados)
        if (faltando.length > 0) {
          status = 'bloqueada'
          prereqFaltando = faltando
        }
      }

      return [
        {
          codigo: code,
          nome: entry.nome,
          ch: entry.ch,
          natureza,
          status,
          nota: approvedMatch?.nota,
          periodo: approvedMatch?.periodo,
          prereqFaltando,
        },
      ]
    })
  }

  // Mandatory semesters from matrizes.json
  const mandatoryByCurso = (matrizes as Record<string, Record<string, string[]>>)[curso] ?? {}
  const mandatoryItems = useMemo(() => {
    const result: Record<string, CatalogItem[]> = {}
    for (const [sem, codes] of Object.entries(mandatoryByCurso)) {
      result[sem] = buildItems(codes as string[], 'OB')
    }
    return result
  }, [byCode, byNome, curso])

  // All mandatory codes (to exclude from electives)
  const mandatoryCodes = useMemo(
    () => new Set(Object.values(mandatoryByCurso).flat()),
    [curso],
  )

  // Elective categories: naturezas with required CH > 0, excluding OB
  const cursoConfig = CURSOS[curso]
  const requisitos = (
    curso === 'BICTI' && profile?.concentracaoBICTI
      ? cursoConfig.concentracoes?.[profile.concentracaoBICTI]?.requisitos
      : undefined
  ) ?? cursoConfig.requisitos
  const electiveNaturezas = useMemo(
    () =>
      (Object.keys(requisitos) as Natureza[]).filter(
        (n) => n !== 'OB' && (requisitos[n] ?? 0) > 0,
      ),
    [curso, profile?.concentracaoBICTI],
  )

  // Build elective items: student disciplines grouped by natureza, excluding mandatory ones
  const electiveItems = useMemo(() => {
    const result: Record<Natureza, CatalogItem[]> = {} as Record<Natureza, CatalogItem[]>
    for (const nat of electiveNaturezas) {
      result[nat] = []
    }
    for (const d of disciplinas) {
      const nat = d.natureza as Natureza
      if (!electiveNaturezas.includes(nat)) continue
      if (d.codigo && mandatoryCodes.has(d.codigo)) continue
      if (!result[nat]) continue
      const isAprovada = (d.resultado === 'AP' && !d.trancamento) || d.dispensada === true
      if (!isAprovada) continue
      const status: StatusDisc = 'aprovado'
      result[nat].push({
        codigo: d.codigo ?? d.nome,
        nome: d.nome,
        ch: d.ch,
        natureza: nat,
        status,
        nota: d.nota,
        periodo: d.periodo,
      })
    }
    return result
  }, [disciplinas, electiveNaturezas, mandatoryCodes])

  // Stats for summary
  const stats = useMemo(
    () => calcularEstatisticas(disciplinas, certificados, curso, profile),
    [disciplinas, certificados, curso, profile],
  )

  // Total mandatory progress
  const allMandatoryItems = Object.values(mandatoryItems).flat()
  const mandatoryTotal = allMandatoryItems.length
  const mandatoryDone = allMandatoryItems.filter((i) => i.status === 'aprovado').length
  const mandatoryCH = allMandatoryItems.reduce((s, i) => s + i.ch, 0)
  const mandatoryDoneCH = allMandatoryItems
    .filter((i) => i.status === 'aprovado')
    .reduce((s, i) => s + i.ch, 0)

  // CH from certificates for AC
  const acCerts = certificados
    .filter((c) => c.status === 'aprovado')
    .reduce((s, c) => s + (c.cargaHoraria || 0), 0)

  const hasData = disciplinas.length > 0 || mandatoryTotal > 0

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
          <LayoutGrid className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Grade não disponível</p>
          <p className="text-sm text-muted-foreground mt-1">
            Importe seu histórico acadêmico para acompanhar a grade curricular.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Summary header */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">
            {cursoConfig.nome} — {cursoConfig.metadata?.matrizCurricular ?? 'Matriz Curricular'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Obrigatórias',
              value: `${mandatoryDone}/${mandatoryTotal}`,
              sub: `${mandatoryDoneCH}/${mandatoryCH}h`,
              color: mandatoryDone === mandatoryTotal && mandatoryTotal > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-foreground',
            },
            {
              label: 'CH concluída',
              value: `${stats.totalCH ?? 0}h`,
              sub: `de ${cursoConfig.totalHoras}h`,
              color: 'text-foreground',
            },
            {
              label: 'Média geral',
              value: stats.averageGrade > 0 ? stats.averageGrade.toFixed(1) : '—',
              sub: 'coeficiente',
              color:
                stats.averageGrade >= 7
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : stats.averageGrade >= 5
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400',
            },
            {
              label: 'Em curso',
              value: String(stats.inProgressDisciplines),
              sub: 'disciplina(s)',
              color: stats.inProgressDisciplines > 0 ? 'text-primary' : 'text-muted-foreground',
            },
          ].map(({ label, value, sub, color }) => (
            <div
              key={label}
              className="flex flex-col gap-1 p-3 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/60"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {label}
              </span>
              <span className={cn('text-xl font-black tabular-nums leading-none', color)}>
                {value}
              </span>
              <span className="text-[11px] text-muted-foreground">{sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory semesters */}
      {Object.keys(mandatoryItems).length > 0 && (
        <section>
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-primary inline-block" aria-hidden="true" />
            Disciplinas Obrigatórias
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(mandatoryItems)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([sem, items]) => (
                <SemesterCard key={sem} semestre={parseInt(sem)} items={items} catalogo={catalogo} />
              ))}
          </div>
        </section>
      )}

      {/* Elective categories */}
      {electiveNaturezas.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-amber-500 inline-block" aria-hidden="true" />
            Componentes Eletivos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {electiveNaturezas.map((nat) => (
              <NaturezaCard
                key={nat}
                natureza={nat}
                items={electiveItems[nat] ?? []}
                requiredCH={requisitos[nat] ?? 0}
                completedCH={stats.horasPorNatureza?.[nat] ?? 0}
                certificates={nat === 'AC' ? acCerts : undefined}
                catalogo={catalogo}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
