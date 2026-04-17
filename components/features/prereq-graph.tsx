'use client'

import { useMemo, useState, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import type { Disciplina, Curso } from '@/types'
import { prerequisitosFaltando } from '@/lib/utils/prerequisites'
import prereqData from '@/assets/data/prerequisitos.json'
import disciplinasData from '@/assets/data/disciplinas.json'
import matrizesData from '@/assets/data/matrizes.json'
import type { DisciplinasCatalogo, MatrizCurricular, MapaPrerequisitos } from '@/types'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

// ─── data ────────────────────────────────────────────────────────────────────

const catalogo = (disciplinasData as DisciplinasCatalogo).catalogo
const matrizes = matrizesData as MatrizCurricular
const prereqs = prereqData as MapaPrerequisitos & { _info?: string }

// ─── constants ────────────────────────────────────────────────────────────────

const NODE_W = 180
const NODE_H = 56

type NodeStatus = 'aprovado' | 'emcurso' | 'reprovado' | 'bloqueada' | 'pendente'

const STATUS_STYLE: Record<NodeStatus, { bg: string; border: string; text: string; ring: string }> = {
  aprovado:  { bg: '#dcfce7', border: '#22c55e', text: '#166534', ring: '#22c55e' },
  emcurso:   { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', ring: '#3b82f6' },
  pendente:  { bg: '#fef9c3', border: '#ca8a04', text: '#713f12', ring: '#ca8a04' },
  bloqueada: { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280', ring: '#9ca3af' },
  reprovado: { bg: '#fee2e2', border: '#ef4444', text: '#7f1d1d', ring: '#ef4444' },
}

const STATUS_LABEL: Record<NodeStatus, string> = {
  aprovado:  'Aprovada',
  emcurso:   'Em curso',
  pendente:  'Pendente',
  bloqueada: 'Bloqueada',
  reprovado: 'Reprovada',
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function normCodigo(c: string): string {
  return c.length >= 6 && c.endsWith('A') ? c.slice(0, -1) : c
}

function getBestStatus(codigo: string, disciplinas: Disciplina[], codigosAprovados: string[], curso: Curso): NodeStatus {
  const norm = normCodigo(codigo.toUpperCase())
  const matches = disciplinas.filter(d => normCodigo(d.codigo.toUpperCase()) === norm || d.codigo.toUpperCase().startsWith(norm))

  if (matches.some(d => (d.resultado === 'AP' && !d.trancamento) || d.dispensada)) return 'aprovado'
  if (matches.some(d => d.emcurso)) return 'emcurso'
  if (matches.some(d => d.resultado === 'RR')) return 'reprovado'

  const faltando = prerequisitosFaltando(codigo, curso, codigosAprovados)
  if (faltando.length > 0) return 'bloqueada'
  return 'pendente'
}

function applyDagreLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 70, marginx: 20, marginy: 20 })

  nodes.forEach(n => g.setNode(n.id, { width: NODE_W, height: NODE_H }))
  edges.forEach(e => g.setEdge(e.source, e.target))

  dagre.layout(g)

  return nodes.map(n => {
    const { x, y } = g.node(n.id)
    return { ...n, position: { x: x - NODE_W / 2, y: y - NODE_H / 2 } }
  })
}

// ─── custom node ──────────────────────────────────────────────────────────────

type DiscNodeData = {
  label: string
  codigo: string
  ch: number
  status: NodeStatus
  nota?: number
  selected?: boolean
}

function DiscNode({ data, selected }: NodeProps & { data: DiscNodeData }) {
  const s = STATUS_STYLE[data.status]
  return (
    <div
      className="rounded-lg border-2 px-3 py-2 text-xs font-medium shadow-sm transition-all duration-150 cursor-pointer"
      style={{
        width: NODE_W,
        minHeight: NODE_H,
        background: s.bg,
        borderColor: selected ? s.ring : s.border,
        color: s.text,
        boxShadow: selected ? `0 0 0 3px ${s.ring}55` : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <p className="leading-snug line-clamp-2">{data.label}</p>
      <p className="mt-0.5 opacity-60 text-[10px] tabular-nums">
        {data.codigo} · {data.ch}h
      </p>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  )
}

const nodeTypes = { disc: DiscNode }

// ─── legend ───────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 bg-background/90 backdrop-blur-sm rounded-xl border border-border p-2 shadow text-[11px]">
      {(Object.entries(STATUS_LABEL) as [NodeStatus, string][]).map(([status, label]) => {
        const s = STATUS_STYLE[status]
        return (
          <span key={status} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border-2" style={{ background: s.bg, borderColor: s.border }} />
            {label}
          </span>
        )
      })}
    </div>
  )
}

// ─── detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({
  codigo,
  curso,
  disciplinas,
  codigosAprovados,
  onClose,
}: {
  codigo: string
  curso: Curso
  disciplinas: Disciplina[]
  codigosAprovados: string[]
  onClose: () => void
}) {
  const entry = catalogo[codigo]
  if (!entry) return null

  const status = getBestStatus(codigo, disciplinas, codigosAprovados, curso)
  const s = STATUS_STYLE[status]
  const prereqsList = prereqs[curso]?.[codigo] ?? []
  const faltando = prerequisitosFaltando(codigo, curso, codigosAprovados)

  // Disciplinas que dependem desta
  const dependentesDir = Object.entries(prereqs[curso] ?? {})
    .filter(([, reqs]) => reqs.includes(codigo))
    .map(([cod]) => cod)

  const matchDisc = disciplinas.find(d =>
    normCodigo(d.codigo.toUpperCase()) === normCodigo(codigo.toUpperCase()) ||
    d.codigo.toUpperCase().startsWith(normCodigo(codigo.toUpperCase()))
  )

  return (
    <div className="absolute top-3 right-3 z-20 w-64 bg-background/95 backdrop-blur-sm rounded-xl border border-border shadow-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold leading-snug">{entry.nome}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{codigo} · {entry.ch}h</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
          aria-label="Fechar"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div
        className="text-[11px] font-semibold px-2 py-1 rounded-full inline-flex"
        style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
      >
        {STATUS_LABEL[status]}
        {matchDisc?.nota !== undefined && matchDisc.nota >= 0 && status === 'aprovado' && (
          <span className="ml-1 opacity-70">· {matchDisc.nota.toFixed(1)}</span>
        )}
      </div>

      {prereqsList.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Pré-requisitos</p>
          <ul className="space-y-1">
            {prereqsList.map(p => {
              const isCumprido = !faltando.includes(p)
              return (
                <li key={p} className="flex items-center gap-1.5 text-[11px]">
                  <span className={cn('w-2 h-2 rounded-full shrink-0', isCumprido ? 'bg-emerald-500' : 'bg-rose-400')} />
                  <span className={isCumprido ? 'text-foreground' : 'text-muted-foreground'}>
                    {catalogo[p]?.nome ?? p}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {dependentesDir.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Desbloqueia</p>
          <ul className="space-y-1">
            {dependentesDir.map(d => (
              <li key={d} className="text-[11px] text-foreground">
                → {catalogo[d]?.nome ?? d}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

interface PrereqGraphProps {
  disciplinas: Disciplina[]
  curso: Curso
}

export function PrereqGraph({ disciplinas, curso }: PrereqGraphProps) {
  const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null)

  const codigosAprovados = useMemo(() =>
    disciplinas
      .filter(d => (d.resultado === 'AP' && !d.trancamento) || d.dispensada)
      .map(d => d.codigo),
    [disciplinas]
  )

  // Constrói o conjunto de códigos a mostrar no grafo:
  // todos os que aparecem no prereqs do curso (como chave ou como pré-requisito)
  // + todos os da matriz curricular
  const codigosGrafo = useMemo(() => {
    const set = new Set<string>()
    const cursoPrer = prereqs[curso] ?? {}

    // Disciplinas da matriz
    const matriz = matrizes[curso] ?? {}
    Object.values(matriz).flat().forEach(c => set.add(c))

    // Disciplinas do mapa de pré-requisitos
    Object.entries(cursoPrer).forEach(([cod, reqs]) => {
      set.add(cod)
      reqs.forEach(r => set.add(r))
    })

    return set
  }, [curso])

  const { initialNodes, initialEdges } = useMemo(() => {
    const cursoPrer = prereqs[curso] ?? {}

    const rawNodes: Node[] = []
    for (const codigo of codigosGrafo) {
      const entry = catalogo[codigo]
      if (!entry) continue
      const status = getBestStatus(codigo, disciplinas, codigosAprovados, curso)
      rawNodes.push({
        id: codigo,
        type: 'disc',
        position: { x: 0, y: 0 },
        data: {
          label: entry.nome,
          codigo,
          ch: entry.ch,
          status,
        } satisfies DiscNodeData,
      })
    }

    const rawEdges: Edge[] = []
    for (const [target, sources] of Object.entries(cursoPrer)) {
      if (!codigosGrafo.has(target)) continue
      for (const source of sources) {
        if (!codigosGrafo.has(source)) continue
        rawEdges.push({
          id: `${source}->${target}`,
          source,
          target,
          animated: false,
          style: { stroke: '#94a3b8', strokeWidth: 1.5 },
          markerEnd: { type: 'arrowclosed' as const, color: '#94a3b8', width: 16, height: 16 },
        })
      }
    }

    const layoutedNodes = applyDagreLayout(rawNodes, rawEdges)
    return { initialNodes: layoutedNodes, initialEdges: rawEdges }
  }, [disciplinas, curso, codigosGrafo, codigosAprovados])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedCodigo(prev => prev === node.id ? null : node.id)
  }, [])

  const nodesWithSelection = useMemo(() =>
    nodes.map(n => ({
      ...n,
      data: { ...n.data, selected: n.id === selectedCodigo },
    })),
    [nodes, selectedCodigo]
  )

  if (codigosGrafo.size === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">
        Nenhuma relação de pré-requisitos mapeada para este curso.
      </p>
    )
  }

  // key={curso} força re-mount do ReactFlow quando o curso muda, reinicializando nodes/edges
  return (
    <div className="relative w-full rounded-2xl border border-border overflow-hidden" style={{ height: 520 }}>
      <ReactFlow
        key={curso}
        nodes={nodesWithSelection}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-30" />
        <Controls showInteractive={false} />
      </ReactFlow>

      <Legend />

      {selectedCodigo && (
        <DetailPanel
          codigo={selectedCodigo}
          curso={curso}
          disciplinas={disciplinas}
          codigosAprovados={codigosAprovados}
          onClose={() => setSelectedCodigo(null)}
        />
      )}
    </div>
  )
}
