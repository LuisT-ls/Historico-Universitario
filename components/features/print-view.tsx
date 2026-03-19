'use client'

import { Fragment, useMemo } from 'react'
import type { Disciplina, Certificado, Curso, Natureza, Profile } from '@/types'
import { CURSOS } from '@/lib/constants'
import {
  calcularCR,
  calcularSemestralizacao,
  calcularPrevisaoFormaturaCompleta,
  getCurrentSemester,
  compararPeriodos,
} from '@/lib/utils'

// ─── types ────────────────────────────────────────────────────────────────────

interface PrintViewProps {
  disciplinas: Disciplina[]
  certificados: Certificado[]
  cursoAtual: Curso
  profile?: Profile | null
}

// ─── constants ────────────────────────────────────────────────────────────────

const NATUREZA_NOME: Record<string, string> = {
  OB: 'Obrigatória',
  OX: 'Ext. Obrigatória',
  OG: 'Opt. Grande Área',
  OH: 'Opt. Humanística',
  OZ: 'Opt. Artística',
  OP: 'Optativa',
  LV: 'Componente Livre',
  AC: 'Atividade Complementar',
}

const RESULTADO_NOME: Record<string, string> = {
  AP: 'Aprovado',
  RR: 'Reprovado',
  TR: 'Trancado',
  DP: 'Dispensado',
}

// ─── component ────────────────────────────────────────────────────────────────

export function PrintView({ disciplinas, certificados, cursoAtual, profile }: PrintViewProps) {
  const { stats, disciplinasPorPeriodo } = useMemo(() => {
    const config = CURSOS[cursoAtual]

    // Approved / dispensed disciplines
    const aprovadas = disciplinas.filter(d => d.resultado === 'AP' && !d.emcurso)
    const emCurso = disciplinas.filter(d => d.emcurso === true || d.resultado === 'DP' && !d.dispensada)

    // Hours by natureza with redistribution (mirrors Summary logic)
    const horasPorNatureza: Record<Natureza, number> = {
      AC: 0, LV: 0, OB: 0, OG: 0, OH: 0, OP: 0, OX: 0, OZ: 0,
    }
    aprovadas.forEach(d => {
      const nat = d.dispensada ? 'LV' : d.natureza
      if (nat && horasPorNatureza[nat as Natureza] !== undefined) {
        horasPorNatureza[nat as Natureza] += d.ch
      }
    })
    // AC from certificates
    const horasAC = certificados.filter(c => c.status === 'aprovado').reduce((s, c) => s + c.cargaHoraria, 0)
    horasPorNatureza.AC += horasAC

    // Redistribution excess → LV
    let excessoLV = 0
    for (const nat of ['OX', 'OG', 'OH', 'OZ', 'OP'] as Natureza[]) {
      const req = config.requisitos[nat] ?? 0
      if (req > 0 && horasPorNatureza[nat] > req) {
        excessoLV += horasPorNatureza[nat] - req
        horasPorNatureza[nat] = req
      }
    }
    horasPorNatureza.LV += excessoLV
    if (config.requisitos.LV && horasPorNatureza.LV > config.requisitos.LV) {
      horasPorNatureza.LV = config.requisitos.LV
    }

    const totalCH = Object.values(horasPorNatureza).reduce((s, h) => s + h, 0)
    const chEmCurso = emCurso.reduce((s, d) => s + d.ch, 0)

    // Simple unweighted average of approved non-dispensed non-AC non-dropped disciplines
    const comNota = disciplinas.filter(
      d => (d.resultado === 'AP' || d.resultado === 'RR') && !d.dispensada && d.natureza !== 'AC' && !d.trancamento && !d.emcurso
    )
    const mediaGeral = comNota.length > 0
      ? comNota.reduce((s, d) => s + d.nota, 0) / comNota.length
      : 0

    const cr = calcularCR(disciplinas)
    const progresso = Math.min((totalCH / config.totalHoras) * 100, 100)
    const semestre = profile ? calcularSemestralizacao(profile, disciplinas, profile.currentSemester || getCurrentSemester()) : undefined
    const previsao = calcularPrevisaoFormaturaCompleta(
      disciplinas, totalCH, totalCH + chEmCurso, chEmCurso,
      config.totalHoras, emCurso, horasPorNatureza, cursoAtual
    )

    const totalAprovacoes = disciplinas.filter(d => d.resultado === 'AP' && !d.emcurso && !d.dispensada && d.natureza !== 'AC').length
    const totalReprovacoes = disciplinas.filter(d => d.resultado === 'RR').length
    const totalTrancamentos = disciplinas.filter(d => d.resultado === 'TR').length

    // Group disciplines by period
    const porPeriodo: Record<string, Disciplina[]> = {}
    disciplinas.forEach(d => {
      if (!d.periodo) return
      if (!porPeriodo[d.periodo]) porPeriodo[d.periodo] = []
      porPeriodo[d.periodo].push(d)
    })

    const disciplinasPorPeriodo = Object.entries(porPeriodo)
      .sort(([a], [b]) => compararPeriodos(b, a)) // ascendente: mais antigo primeiro (impressão cronológica)

    return {
      stats: {
        cr, mediaGeral, totalCH, progresso, semestre, previsao,
        horasPorNatureza, totalAprovacoes, totalReprovacoes, totalTrancamentos,
      },
      disciplinasPorPeriodo,
    }
  }, [disciplinas, certificados, cursoAtual, profile])

  const config = CURSOS[cursoAtual]
  const geradoEm = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div
      id="print-view"
      style={{
        display: 'none',
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '10pt',
        color: '#111',
        background: '#fff',
        padding: '0',
        lineHeight: 1.4,
      }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ borderBottom: '2px solid #111', paddingBottom: '10px', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '16pt', fontWeight: 'bold', margin: 0, letterSpacing: '-0.5px' }}>
          Relatório Acadêmico
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '9pt', color: '#555' }}>
          Curso: <strong>{config.nome}</strong> &nbsp;|&nbsp; Gerado em: {geradoEm}
        </p>
      </div>

      {/* ── Summary metrics ────────────────────────────────────── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
        <tbody>
          <tr>
            <MetaCell label="CR" value={stats.cr.toFixed(2)} />
            <MetaCell label="Média Geral" value={stats.mediaGeral.toFixed(2)} />
            <MetaCell label="CH Concluída" value={`${stats.totalCH}h / ${config.totalHoras}h`} />
            <MetaCell label="Progresso" value={`${stats.progresso.toFixed(1)}%`} />
            {stats.semestre !== undefined && (
              <MetaCell label="Semestre Atual" value={`${stats.semestre}°`} />
            )}
          </tr>
          <tr>
            <MetaCell label="Aprovações" value={String(stats.totalAprovacoes)} />
            <MetaCell label="Reprovações" value={String(stats.totalReprovacoes)} />
            <MetaCell label="Trancamentos" value={String(stats.totalTrancamentos)} />
            <td colSpan={2} style={{ padding: '6px 8px', border: '1px solid #ddd', background: '#f9f9f9', verticalAlign: 'top' }}>
              <span style={{ fontSize: '8pt', color: '#888', display: 'block', fontVariant: 'small-caps' }}>Previsão de Formatura</span>
              <span style={{ fontSize: '9pt', fontWeight: 'bold' }}>{stats.previsao.texto}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Hours by category ──────────────────────────────────── */}
      <SectionTitle>Horas por Categoria</SectionTitle>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9pt' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <Th>Categoria</Th>
            <Th align="right">Concluídas</Th>
            <Th align="right">Exigidas</Th>
            <Th align="right">Progresso</Th>
            <Th>Barra</Th>
          </tr>
        </thead>
        <tbody>
          {(Object.entries(stats.horasPorNatureza) as [Natureza, number][])
            .filter(([nat, h]) => {
              const req = config.requisitos[nat] ?? 0
              return req > 0 || h > 0
            })
            .map(([nat, h]) => {
              const req = config.requisitos[nat] ?? 0
              const pct = req > 0 ? Math.min((h / req) * 100, 100) : 0
              return (
                <tr key={nat} style={{ borderBottom: '1px solid #eee' }}>
                  <Td><strong>{nat}</strong> — {NATUREZA_NOME[nat] ?? nat}</Td>
                  <Td align="right">{h}h</Td>
                  <Td align="right">{req > 0 ? `${req}h` : '—'}</Td>
                  <Td align="right">{req > 0 ? `${pct.toFixed(0)}%` : '—'}</Td>
                  <Td>
                    {req > 0 && (
                      <div style={{ width: '80px', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', display: 'inline-block' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? '#16a34a' : '#2563eb', borderRadius: '4px' }} />
                      </div>
                    )}
                  </Td>
                </tr>
              )
            })}
        </tbody>
      </table>

      {/* ── Disciplines by period ──────────────────────────────── */}
      <SectionTitle>Histórico de Disciplinas</SectionTitle>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <Th>Código</Th>
            <Th>Disciplina</Th>
            <Th align="center">Nat.</Th>
            <Th align="right">CH</Th>
            <Th align="right">Nota</Th>
            <Th align="center">Situação</Th>
          </tr>
        </thead>
        <tbody>
          {disciplinasPorPeriodo.map(([periodo, discs]) => (
            <Fragment key={`period-${periodo}`}>
              <tr style={{ background: '#e8ecf0' }}>
                <td colSpan={6} style={{ padding: '4px 8px', fontWeight: 'bold', fontSize: '8pt', letterSpacing: '0.05em' }}>
                  {periodo}
                </td>
              </tr>
              {discs.map((d, i) => (
                <tr key={`${d.codigo}-${i}`} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <Td style={{ fontFamily: 'monospace', fontSize: '8pt' }}>{d.codigo}</Td>
                  <Td>{d.nome}</Td>
                  <Td align="center">{d.natureza}</Td>
                  <Td align="right">{d.ch}h</Td>
                  <Td align="right">
                    {d.emcurso ? 'Em curso' : d.dispensada ? '—' : d.trancamento ? '—' : d.nota?.toFixed(1) ?? '—'}
                  </Td>
                  <Td align="center">
                    {d.emcurso ? 'Em Curso' : RESULTADO_NOME[d.resultado ?? ''] ?? '—'}
                  </Td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div style={{ marginTop: '24px', borderTop: '1px solid #ccc', paddingTop: '8px', fontSize: '7.5pt', color: '#888', textAlign: 'center' }}>
        Relatório gerado pelo Sistema de Histórico Universitário em {geradoEm}
      </div>
    </div>
  )
}

// ─── small helpers ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '10pt', fontWeight: 'bold', textTransform: 'uppercase',
      letterSpacing: '0.08em', borderBottom: '1px solid #ccc',
      paddingBottom: '3px', marginBottom: '6px', marginTop: '0', color: '#333',
    }}>
      {children}
    </h2>
  )
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <td style={{ padding: '6px 8px', border: '1px solid #ddd', background: '#f9f9f9', verticalAlign: 'top' }}>
      <span style={{ fontSize: '8pt', color: '#888', display: 'block', fontVariant: 'small-caps' }}>{label}</span>
      <span style={{ fontSize: '11pt', fontWeight: 'bold' }}>{value}</span>
    </td>
  )
}

function Th({ children, align }: { children?: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <th style={{
      padding: '5px 8px', textAlign: align ?? 'left', fontWeight: 'bold',
      border: '1px solid #ddd', fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>
      {children}
    </th>
  )
}

function Td({ children, align, style }: { children?: React.ReactNode; align?: 'left' | 'right' | 'center'; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: '3px 8px', textAlign: align ?? 'left', border: '1px solid #eee', ...style }}>
      {children}
    </td>
  )
}
