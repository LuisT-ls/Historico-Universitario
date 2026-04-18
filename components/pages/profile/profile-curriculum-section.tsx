'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { GraduationCap, Book, Calendar, Building } from 'lucide-react'
import { CURSOS } from '@/lib/constants'
import type { Curso, ConfigConcentracao } from '@/types'

interface ProfileCurriculumSectionProps {
  cursoAtivo: Curso | undefined
  cursoParaEstrutura: Curso | undefined
  concentracaoKey: string | undefined
  configConcentracao: ConfigConcentracao | undefined
}

export function ProfileCurriculumSection({
  cursoAtivo,
  cursoParaEstrutura,
  concentracaoKey: _concentracaoKey,
  configConcentracao,
}: ProfileCurriculumSectionProps) {
  if (!cursoParaEstrutura || !CURSOS[cursoParaEstrutura]?.metadata) {
    return (
      <Card className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-transparent p-12 h-full flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full mb-4">
          <GraduationCap className="h-6 w-6 text-slate-400" />
        </div>
        {!cursoAtivo ? (
          <>
            <h3 className="text-lg font-bold mb-1">Nenhum curso selecionado</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Configure seu instituto e curso nas <strong>Informações Acadêmicas</strong> ao lado para ver a estrutura curricular.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold mb-1">Informações Indisponíveis</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Os detalhes curriculares para este curso ainda não foram cadastrados em nossa base.
            </p>
          </>
        )}
      </Card>
    )
  }

  const cfg = CURSOS[cursoParaEstrutura]
  const matriz = configConcentracao?.matrizCurricular ?? cfg?.metadata?.matrizCurricular
  const totalH = configConcentracao?.totalHoras ?? cfg?.totalHoras
  const req = configConcentracao?.requisitos ?? cfg?.requisitos ?? {}
  const meta = cfg?.metadata

  return (
    <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-violet-500/10 rounded-xl">
          <GraduationCap className="h-6 w-6 text-violet-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Estrutura Curricular</h2>
          {!cursoAtivo && cursoParaEstrutura && (
            <p className="text-[11px] text-amber-500 font-medium mt-0.5">
              Pré-visualização — confirme o curso para salvar
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-8">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Informações Principais</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <Book className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Matriz Curricular</p>
                <p className="text-sm font-semibold text-foreground line-clamp-2">{matriz}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Vigor</p>
                  <p className="text-sm font-semibold text-foreground">{meta?.entradaVigor}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                  <Building className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Código</p>
                  <p className="text-sm font-semibold text-foreground">{meta?.codigo}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Progresso & Limites</h3>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium">Integralização do Curso</span>
              <span className="text-slate-500">{meta?.prazos?.medio} semestres (médio)</span>
            </div>
            <div className="relative pt-1">
              <div className="flex justify-between text-[10px] text-slate-300 dark:text-slate-700 mb-1 px-1">
                <span>Min: {meta?.prazos?.minimo}</span>
                <span>Max: {meta?.prazos?.maximo}</span>
              </div>
              <Progress value={50} className="h-2.5 bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-900 my-4" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Obrigatórias</p>
              <p className="text-lg font-bold">{req.OB ?? meta?.limites?.chObrigatoriaAula}h</p>
              <Progress value={100} className="h-1.5 bg-slate-100 dark:bg-slate-800 [&>div]:bg-blue-500" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Optativas (Min)</p>
              <p className="text-lg font-bold">{req.OP ?? meta?.limites?.chOptativaMinima}h</p>
              <Progress value={40} className="h-1.5 bg-slate-100 dark:bg-slate-800 [&>div]:bg-purple-500" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Complementar (Min)</p>
              <p className="text-lg font-bold">{req.AC ?? meta?.limites?.chComplementarMinima}h</p>
              <Progress value={30} className="h-1.5 bg-slate-100 dark:bg-slate-800 [&>div]:bg-amber-500" />
            </div>
            <div className="space-y-1 text-slate-400">
              <p className="text-[10px] uppercase font-bold">Total</p>
              <p className="text-lg font-bold">{totalH}h</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
