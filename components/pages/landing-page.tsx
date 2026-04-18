// v2 — Premium Academic Dark
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google'
import {
  ArrowRight,
  ChevronRight,
  FileUp,
  LayoutGrid,
  BarChart3,
  Calculator,
  BookOpen,
  Target,
  CheckCircle2,
  Sparkles,
  UserPlus,
  Settings,
  Upload,
  TrendingUp,
} from 'lucide-react'

// ─── Fonts ─────────────────────────────────────────────────────────────────────

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['800'],
  display: 'swap',
  preload: true,
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

// ─── Design tokens dynamic hook will be used ───────────────────────────────

const C = {
  bgBase:                'var(--c-bgBase)',
  bgSurface:             'var(--c-bgBase)',
  bgElevated:            'var(--c-bgElevated)',
  bgElevatedGradientEnd: 'var(--c-bgElevatedGradientEnd)',
  border:                'var(--c-border)',
  borderStrong:          'var(--c-borderStrong)',
  accent:                'var(--c-accent)',
  textPrimary:           'var(--c-textPrimary)',
  textSecondary:         'var(--c-textSecondary)',
  textMuted:             'var(--c-textMuted)',
  success:               'var(--c-success)',
} as const

// ─── Static data ───────────────────────────────────────────────────────────────

const STATS = [
  { value: '6+',   label: 'Ferramentas integradas',      color: '#3B82F6' },
  { value: '100%', label: 'Gratuito para sempre',         color: '#10B981' },
  { value: '3',    label: 'Cursos suportados',            color: '#6366F1' },
  { value: 'UFBA', label: 'Universidade Federal da Bahia', color: '#F59E0B' },
]

const FEATURES = [
  {
    icon: FileUp,
    eyebrow: 'Importação',
    title: 'Upload direto do SIGAA',
    description: 'Selecione o PDF do histórico oficial e todos os dados são extraídos e organizados em segundos.',
    accentHex: '#3B82F6',
    iconBg:    'rgba(59,130,246,0.12)',
  },
  {
    icon: BarChart3,
    eyebrow: 'Desempenho',
    title: 'CR calculado com precisão',
    description: 'Acompanhe seu Coeficiente de Rendimento em tempo real, com a mesma fórmula usada pela UFBA.',
    accentHex: '#10B981',
    iconBg:    'rgba(16,185,129,0.12)',
  },
  {
    icon: LayoutGrid,
    eyebrow: 'Currículo',
    title: 'Grade curricular visual',
    description: 'Veja de uma vez quais disciplinas concluiu, quais faltam e o progresso por categoria.',
    accentHex: '#8B5CF6',
    iconBg:    'rgba(139,92,246,0.12)',
  },
  {
    icon: Calculator,
    eyebrow: 'Simulação',
    title: 'Simule cenários de notas',
    description: 'Descubra qual nota precisa para passar ou quanto o CR vai mudar no próximo semestre.',
    accentHex: '#F59E0B',
    iconBg:    'rgba(245,158,11,0.12)',
  },
  {
    icon: BookOpen,
    eyebrow: 'Materiais',
    title: 'Compartilhe recursos',
    description: 'Encontre e compartilhe materiais de estudo organizados por disciplina com outros estudantes.',
    accentHex: '#06B6D4',
    iconBg:    'rgba(6,182,212,0.12)',
  },
  {
    icon: Target,
    eyebrow: 'Formatura',
    title: 'Planeje sua colação',
    description: 'Saiba exatamente quantas horas faltam em cada categoria para se formar sem surpresas.',
    accentHex: '#EF4444',
    iconBg:    'rgba(239,68,68,0.12)',
  },
]

const STEPS = [
  { number: '01', icon: UserPlus,  title: 'Crie sua conta',        description: 'Cadastro gratuito com e-mail ou Google. Sem burocracia, sem cartão de crédito.' },
  { number: '02', icon: Settings,  title: 'Configure seu perfil',  description: 'Informe seu instituto, curso e ano de ingresso para ativar os recursos personalizados.' },
  { number: '03', icon: Upload,    title: 'Importe seu histórico', description: 'Faça upload do PDF oficial do SIGAA e os dados são lidos e organizados na hora.' },
  { number: '04', icon: TrendingUp, title: 'Acompanhe tudo',       description: 'CR, progresso, requisitos e planejamento disponíveis de qualquer dispositivo.' },
]

const MOCK_DISCIPLINES = [
  { code: 'MAT001',  name: 'CÁLCULO A',                nota: '8.5', status: 'AP', ok: true  },
  { code: 'FIS001',  name: 'FÍSICA I',                  nota: '7.0', status: 'AP', ok: true  },
  { code: 'GCET001', name: 'INTRODUÇÃO À COMPUTAÇÃO',   nota: '9.0', status: 'AP', ok: true  },
  { code: 'MAT002',  name: 'CÁLCULO B',                 nota: '3.5', status: 'RR', ok: false },
  { code: 'GCET010', name: 'PROGRAMAÇÃO I',             nota: '8.0', status: 'AP', ok: true  },
]

const TRUST_ITEMS = ['Sem cartão de crédito', 'Dados criptografados', 'Qualquer dispositivo']

// ─── Helpers ───────────────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

// ─── StatCounter ───────────────────────────────────────────────────────────────

function StatCounter({ raw, color }: { raw: string; color: string }) {
  const match  = raw.match(/^(\d+)(.*)$/)
  const target = match ? parseInt(match[1], 10) : NaN
  const suffix = match ? match[2] : ''

  const [count, setCount] = useState(0)
  const ref      = useRef<HTMLSpanElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    if (isNaN(target)) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animated.current) return
        animated.current = true
        const start = performance.now()
        const tick  = (now: number) => {
          const t      = Math.min((now - start) / 800, 1)
          const eased  = 1 - (1 - t) ** 3
          setCount(Math.round(eased * target))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  if (isNaN(target)) return <span style={{ color }}>{raw}</span>

  return (
    <span ref={ref} style={{ color }}>
      {count}{suffix}
    </span>
  )
}

// ─── SectionHeader ─────────────────────────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  description,
  hCls,
}: {
  eyebrow: string
  title: React.ReactNode
  description?: string
  hCls: string
}) {
  return (
    <div className="max-w-2xl mx-auto text-center mb-16">
      <p
        className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: C.accent }}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(hCls, 'mb-4 text-3xl sm:text-4xl font-extrabold leading-tight')}
        style={{ color: C.textPrimary, letterSpacing: '-0.03em' }}
      >
        {title}
      </h2>
      {description && (
        <p className="text-base leading-[1.7]" style={{ color: C.textSecondary }}>
          {description}
        </p>
      )}
    </div>
  )
}

// ─── LandingPage ───────────────────────────────────────────────────────────────

export function LandingPage() {
  const hCls = bricolage.className

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --c-bgBase: #FAFAFA;
          --c-bgElevated: #FFFFFF;
          --c-bgElevatedGradientEnd: rgba(241, 245, 249, 0.8);
          --c-border: rgba(0, 0, 0, 0.08);
          --c-borderStrong: rgba(0, 0, 0, 0.15);
          --c-accent: #2563EB;
          --c-accentLight: #1D4ED8;
          --c-accentPurple: #4338CA;
          --c-textPrimary: #0F172A;
          --c-textSecondary: #475569;
          --c-textMuted: #64748B;
          --c-success: #059669;
        }
        .dark-mode {
          --c-bgBase: #080B14;
          --c-bgElevated: #161B27;
          --c-bgElevatedGradientEnd: rgba(15, 23, 42, 0.4);
          --c-border: rgba(255, 255, 255, 0.07);
          --c-borderStrong: rgba(255, 255, 255, 0.12);
          --c-accent: #3B82F6;
          --c-accentLight: #60A5FA;
          --c-accentPurple: #818CF8;
          --c-textPrimary: #F1F5F9;
          --c-textSecondary: #94A3B8;
          --c-textMuted: #475569;
          --c-success: #10B981;
        }
      `}} />
      <div
        className={cn('w-full overflow-x-hidden', dmSans.className)}
        style={{ background: C.bgBase }}
      >

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section
        className="relative isolate flex flex-col items-center justify-center text-center min-h-[92vh] px-4 py-32 cursor-crosshair"
      >
        {/* Mesh blobs — no dot grid */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <div className="absolute -top-48 left-1/4 w-[700px] h-[700px] -translate-x-1/2 rounded-full blur-[180px]"
               style={{ background: 'rgba(59,130,246,0.08)' }} />
          <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]"
               style={{ background: 'rgba(99,102,241,0.06)' }} />
          <div className="absolute -bottom-48 right-1/4 w-[600px] h-[600px] translate-x-1/2 rounded-full blur-[160px]"
               style={{ background: 'rgba(139,92,246,0.07)' }} />
        </div>

        <div className="relative max-w-5xl mx-auto flex flex-col items-center">

          {/* Animated eyebrow pill */}
          <div
            className="relative inline-flex items-center gap-2.5 rounded-full px-4 py-2 mb-10 overflow-hidden"
            style={{ background: 'rgba(59,130,246,0.08)' }}
          >
            {/* Spinning gradient border */}
            <span className="absolute inset-0 rounded-full overflow-hidden" aria-hidden>
              <span
                className="absolute inset-[-100%] rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, #3B82F6 20%, #818CF8 40%, transparent 60%)',
                  animation: 'border-spin 3.5s linear infinite',
                }}
              />
              <span
                className="absolute inset-[1px] rounded-full"
                style={{ background: C.bgBase }}
              />
            </span>
            <Sparkles className="relative h-3.5 w-3.5 shrink-0" style={{ color: '#60A5FA' }} />
            <span
              className="relative text-[0.6875rem] font-semibold tracking-wide"
              style={{ color: '#1D4ED8' }}
            >
              Gratuito para estudantes da UFBA
            </span>
          </div>

          {/* Headline */}
          <h1
            className={cn(hCls, 'text-6xl sm:text-7xl lg:text-8xl font-extrabold leading-[1.0] mb-7 max-w-4xl')}
            style={{
              color: C.textPrimary,
              letterSpacing: '-0.04em',
            }}
          >
            Controle total sobre{' '}
            <br className="hidden sm:block" />
            <span style={{ color: 'var(--c-accentPurple)' }}>
              sua graduação
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg sm:text-xl md:text-2xl max-w-[640px] leading-relaxed mb-12 text-center"
            style={{ color: '#334155' }}
          >
            Importe seu histórico do SIGAA, acompanhe seu CR, visualize requisitos e
            planeje cada semestre — <span className="text-[#475569]">num único painel.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 w-full">

            {/* Primary — shimmer */}
            <Link href="/register" className="w-full sm:w-auto">
              <button
                className="group relative flex w-full sm:w-auto items-center justify-center h-14 px-8 rounded-full text-base font-bold overflow-hidden transition-all duration-300 ease-out"
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(59,130,246,0.18)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(59,130,246,0.4), 0 4px 20px rgba(59,130,246,0.18)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.18)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Shimmer sweep */}
                <span
                  className="absolute inset-0 -translate-x-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                    animation: 'shimmer 2.5s ease-in-out infinite',
                  }}
                  aria-hidden
                />
                <span className="relative flex items-center justify-center gap-2">
                  Começar gratuitamente <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </Link>

            {/* Secondary — glassmorphism */}
            <Link href="/login" className="w-full sm:w-auto">
              <button
                className="group flex w-full sm:w-auto items-center justify-center h-14 px-8 rounded-full text-base font-semibold transition-all duration-300 ease-out"
                style={{
                  background: 'transparent',
                  border: `1px solid ${C.borderStrong}`,
                  color: C.textSecondary,
                  backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = C.bgElevated
                  e.currentTarget.style.borderColor = C.accent
                  e.currentTarget.style.color = C.textPrimary
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = C.borderStrong
                  e.currentTarget.style.color = C.textSecondary
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Já tenho conta <ChevronRight className="ml-1.5 h-5 w-5 opacity-50 transition-transform group-hover:translate-x-0.5" />
              </button>
            </Link>
          </div>

          {/* Trust strip — pulsing status dots */}
          <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-4 sm:gap-x-8 space-x-2 sm:space-x-4">
            {TRUST_ITEMS.map((item, index) => (
              <span key={item} className={cn('flex items-center gap-2.5 text-sm font-medium', index > 0 && 'ml-4 sm:ml-8')} style={{ color: '#64748B' }}>
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: C.success,
                    boxShadow: '0 0 8px rgba(16,185,129,0.5)',
                    animation: 'pulse-border 2.5s ease-in-out infinite',
                  }}
                />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ────────────────────────────────────────────────────────── */}
      <div
        className="py-12 px-4 relative z-10"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.03), rgba(139,92,246,0.03), transparent)' }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="flex flex-col items-center text-center px-6 gap-2"
            >
              <span className={cn(hCls, 'text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums')}>
                <StatCounter raw={s.value} color={s.color} />
              </span>
              <span className="text-[0.6875rem] font-medium" style={{ color: C.textSecondary }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ───────────────────────────────────────────────────────────── */}
      <section className="py-32 px-4" style={{ background: C.bgBase }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Recursos"
            title={<>Tudo que você precisa,<br />em um só lugar</>}
            description="Ferramentas construídas para a realidade dos estudantes da UFBA — do primeiro semestre até a formatura."
            hCls={hCls}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => {
              const Icon = f.icon
              const rgb  = hexToRgb(f.accentHex)
              return (
                <div
                  key={f.title}
                  className="group relative rounded-[2rem] p-8 overflow-hidden transition-all duration-500 ease-out cursor-default"
                  style={{
                    background: `linear-gradient(180deg, ${C.bgElevated} 0%, ${C.bgElevatedGradientEnd} 100%)`,
                    border: `1px solid ${C.border}`,
                    borderTop: `2px solid rgba(${rgb}, 0.35)`,
                    boxShadow: `0 1px 3px ${C.border}`,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.transform = 'translateY(-4px)'
                    el.style.borderColor = `rgba(${rgb}, 0.3)`
                    el.style.borderTopColor = f.accentHex
                    el.style.boxShadow = `0 20px 40px rgba(0,0,0,0.15), 0 0 40px rgba(${rgb},0.08)`
                    el.style.background = `linear-gradient(180deg, ${C.bgElevated} 0%, rgba(${rgb},0.06) 100%)`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.transform = 'translateY(0)'
                    el.style.borderColor = C.border
                    el.style.borderTopColor = `rgba(${rgb}, 0.35)`
                    el.style.boxShadow = `0 1px 3px ${C.border}`
                    el.style.background = `linear-gradient(180deg, ${C.bgElevated} 0%, ${C.bgElevatedGradientEnd} 100%)`
                  }}
                >
                  {/* Subtle top glow inside the card */}
                  <div
                    className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40"
                    style={{ background: f.accentHex }}
                    aria-hidden
                  />

                  {/* Icon */}
                  <div
                    className="relative inline-flex items-center justify-center w-14 h-14 rounded-[1.125rem] mb-6 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3"
                    style={{
                      background: f.iconBg,
                      border: `1px solid rgba(${rgb}, 0.15)`,
                      boxShadow: `inset 0 0 20px rgba(${rgb},0.1)`,
                    }}
                  >
                    <Icon className="h-6 w-6 relative z-10 transition-colors duration-300" style={{ color: f.accentHex }} />
                  </div>

                  <p
                    className="mb-2.5 text-[0.7rem] font-bold uppercase tracking-[0.2em]"
                    style={{ color: f.accentHex, opacity: 0.9 }}
                  >
                    {f.eyebrow}
                  </p>
                  <h3
                    className={cn(hCls, 'mb-3 text-[1.15rem] font-extrabold leading-snug')}
                    style={{ color: C.textPrimary }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-[0.95rem] leading-[1.65]" style={{ color: C.textSecondary }}>
                    {f.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SPOTLIGHT — importação PDF ──────────────────────────────────────────── */}
      <section className="relative py-32 px-4">
        {/* Subtle mesh orb for Awwwards-style flow */}
        <div className="pointer-events-none absolute top-1/2 right-0 w-[800px] h-[800px] -translate-y-1/2 translate-x-1/3 rounded-full blur-[200px] opacity-40"
             style={{ background: 'rgba(59,130,246,0.05)' }} aria-hidden />

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--c-accentLight)' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--c-accentLight)' }}>Importação Inteligente</span>
            </div>
            
            <h2
              className={cn(hCls, 'mb-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1]')}
              style={{ color: C.textPrimary, letterSpacing: '-0.03em' }}
            >
              Do SIGAA para o painel<br />em <span style={{ color: 'var(--c-accentLight)' }}>menos de 30 segundos</span>
            </h2>
            
            <p className="mb-8 text-lg leading-relaxed font-medium" style={{ color: C.textSecondary }}>
              Baixe o histórico oficial em PDF pelo SIGAA e faça o upload. Todas as
              disciplinas, notas, situações e períodos são extraídos e categorizados
              automaticamente — sem digitar nenhuma vírgula.
            </p>

            <ul className="space-y-4">
              {[
                'Reconhece aprovadas, reprovadas e trancadas',
                'Infere a natureza das disciplinas automaticamente',
                'Detecta e ignora duplicatas na importação',
              ].map(item => (
                <li key={item} className="flex items-center gap-3 font-medium text-sm" style={{ color: C.textPrimary }}>
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 shrink-0">
                    <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--c-accentLight)' }} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mock card + floating badges */}
          <div className="relative group perspective-1000">

            {/* Main Card */}
            <div
              className="relative rounded-[2rem] p-6 sm:p-8 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)]"
              style={{
                background: `linear-gradient(180deg, ${C.bgElevated} 0%, ${C.bgElevatedGradientEnd} 100%)`,
                border:     `1px solid ${C.borderStrong}`,
                borderTop:  `1px solid ${C.borderStrong}`,
                boxShadow:  `0 8px 32px rgba(0,0,0,0.08), 0 1px 0 ${C.border}`,
              }}
            >
              {/* Internal subtle glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/05 blur-3xl rounded-full pointer-events-none" />

              {/* Card header */}
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(99,102,241,0.15) 100%)', border: '1px solid rgba(96,165,250,0.3)' }}
                >
                  <FileUp className="h-5 w-5 text-blue-500 drop-shadow-md" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(hCls, 'text-base font-extrabold mb-0.5')} style={{ color: C.textPrimary }}>
                    Importar Histórico
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--c-accentLight)' }} />
                    <p className="text-xs font-medium" style={{ color: 'var(--c-accentLight)' }}>
                      Lendo arquivo PDF...
                    </p>
                  </div>
                </div>
              </div>

              {/* Discipline rows */}
              <div className="space-y-1 relative z-10">
                {MOCK_DISCIPLINES.map((d, index) => (
                  <div
                    key={d.code}
                    className="group/row flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all duration-300 cursor-default"
                    style={{ border: `1px solid transparent` }}
                    onMouseEnter={e => {
                      const el = e.currentTarget
                      el.style.background = C.bgElevatedGradientEnd
                      el.style.borderColor = C.border
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget
                      el.style.background = 'transparent'
                      el.style.borderColor = 'transparent'
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-[10px] font-bold font-mono shrink-0 transition-colors"
                        style={{ background: C.bgElevatedGradientEnd, color: C.textMuted, border: `1px solid ${C.border}` }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate" style={{ color: C.textPrimary }}>
                          {d.name}
                        </span>
                        <span className="font-mono text-[10px] mt-0.5" style={{ color: C.textMuted }}>
                          {d.code}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="font-bold tabular-nums" style={{ color: C.textSecondary }}>
                        {d.nota}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-extrabold px-2 py-1 rounded-md transition-colors",
                          d.ok ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/25"
                               : "bg-red-500/10 text-red-500 border border-red-500/25"
                        )}
                      >
                        {d.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer with progress bar */}
              <div className="mt-6 pt-5 border-t border-white/10 relative z-10">
                <div className="flex items-center justify-between text-xs font-semibold mb-3">
                  <span style={{ color: C.textMuted }}>Processando grade...</span>
                  <span style={{ color: 'var(--c-accentLight)' }}>100%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-800/80 shadow-inner">
                  <div
                    className="h-full rounded-full relative"
                    style={{ width: '100%', background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4)' }}
                  >
                     <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────────── */}
      <section className="py-32 px-4" style={{ background: C.bgBase }}>
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            eyebrow="Processo"
            title="Comece em quatro passos"
            description="De zero ao histórico completo organizado em menos de cinco minutos."
            hCls={hCls}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => {
              const StepIcon = step.icon
              return (
                <div key={step.number} className="relative flex flex-col items-center text-center">

                  {/* Gradient connector */}
                  {i < STEPS.length - 1 && (
                    <div
                      className="hidden lg:block absolute top-7 left-[calc(50%+2.25rem)] w-[calc(100%-4.5rem)] h-px"
                      style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.4) 0%, rgba(99,102,241,0.15) 100%)' }}
                      aria-hidden
                    />
                  )}

                  {/* Step circle */}
                  <div
                    className={cn(hCls, 'flex items-center justify-center w-14 h-14 rounded-full text-lg font-extrabold mb-4')}
                    style={{
                      background:  'rgba(59,130,246,0.08)',
                      border:      '1px solid rgba(59,130,246,0.2)',
                      color:       'var(--c-accentLight)',
                      boxShadow:   '0 0 0 6px rgba(59,130,246,0.05), inset 0 0 16px rgba(59,130,246,0.06)',
                    }}
                  >
                    {step.number}
                  </div>

                  {/* Step icon */}
                  <div
                    className="mb-4 flex items-center justify-center w-8 h-8 rounded-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border:     `1px solid ${C.border}`,
                    }}
                  >
                    <StepIcon className="h-3.5 w-3.5" style={{ color: C.accent }} />
                  </div>

                  <h3
                    className={cn(hCls, 'mb-2 text-sm font-bold')}
                    style={{ color: C.textPrimary }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-xs leading-[1.65]" style={{ color: C.textSecondary }}>
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────────────────────── */}
      <section
        className="relative isolate pt-32 px-4"
        style={{ paddingBottom: '5rem' }}
      >
        {/* Floating aura */}
        <div
          className="pointer-events-none absolute left-1/2 top-40 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] -z-10"
          style={{ background: 'rgba(59,130,246,0.08)' }}
          aria-hidden
        />

        <div className="max-w-3xl mx-auto text-center">

          {/* Logo */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-10 transition-transform duration-500 hover:scale-105 hover:-rotate-3"
            style={{
              background:  'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
              boxShadow:   '0 10px 40px rgba(59,130,246,0.3)',
            }}
          >
            <Image src="/assets/img/logo.png" alt="Logo" width={28} height={28} className="brightness-0 invert drop-shadow-md" />
          </div>



          {/* Headline */}
          <h2
            className={cn(hCls, 'mb-6 text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05]')}
            style={{ color: C.textPrimary, letterSpacing: '-0.04em' }}
          >
            Sua graduação merece{' '}
            <br className="hidden md:block" />
            <span style={{ color: 'var(--c-accentPurple)' }}>
              mais organização
            </span>
          </h2>

          <p
            className="mb-12 text-lg sm:text-xl max-w-[600px] mx-auto leading-relaxed"
            style={{ color: C.textSecondary }}
          >
            Junte-se aos estudantes da UFBA que acompanham seu progresso com clareza
            e planejam a formatura sem surpresas.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 w-full">

            {/* Primary — shimmer */}
            <Link href="/register" className="w-full sm:w-auto">
              <button
                className="group relative flex w-full sm:w-auto items-center justify-center h-14 px-8 rounded-full text-base font-bold overflow-hidden transition-all duration-300 ease-out"
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(59,130,246,0.18)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(59,130,246,0.4), 0 4px 20px rgba(59,130,246,0.18)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.18)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Shimmer sweep */}
                <span
                  className="absolute inset-0 -translate-x-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                    animation: 'shimmer 2.5s ease-in-out infinite',
                  }}
                  aria-hidden
                />
                <span className="relative flex items-center justify-center gap-2">
                  Criar conta gratuita <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </Link>

            <Link href="/login" className="w-full sm:w-auto">
              <button
                className="group flex w-full sm:w-auto items-center justify-center h-14 px-8 rounded-full text-base font-semibold transition-all duration-300 ease-out"
                style={{
                  background: 'transparent',
                  border: `1px solid ${C.borderStrong}`,
                  color: C.textSecondary,
                  backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = C.bgElevated
                  e.currentTarget.style.borderColor = C.accent
                  e.currentTarget.style.color = C.textPrimary
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = C.borderStrong
                  e.currentTarget.style.color = C.textSecondary
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Entrar na minha conta <ChevronRight className="ml-1.5 h-5 w-5 opacity-50 transition-transform group-hover:translate-x-0.5" />
              </button>
            </Link>
          </div>

          {/* Trust */}
          <div 
            className="flex flex-wrap items-center justify-center gap-y-4 gap-x-4 sm:gap-x-8 space-x-2 sm:space-x-4 mt-8"
          >
            {['Sem cartão de crédito', 'Dados seguros', 'Acesso permanente'].map((item, index) => (
              <span key={item} className={cn('flex items-center gap-2 text-sm font-medium', index > 0 && 'ml-4 sm:ml-8')} style={{ color: C.textSecondary }}>
                <CheckCircle2 className="h-4 w-4 shrink-0 opacity-80" style={{ color: C.success }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      </div>
    </>
  )
}
