import { CH_POR_CREDITO, NOTA_MINIMA_APROVACAO } from '@/lib/constants'
import MATRIZES_ICTI from '@/assets/data/icti/matrizes.json'
import MATRIZES_HUM from '@/assets/data/humanidades/matrizes.json'

const MATRIZES = { ...MATRIZES_ICTI, ...MATRIZES_HUM }
import type { Disciplina, Curso, Profile, MatrizCurricular } from '@/types'
import { compararPeriodos, calcularTotalSemestresCursados } from './periods'

/**
 * Calcula o resultado acadêmico (Aprovado, Reprovado, etc) baseado na nota e status
 *
 * @param nota - Valor da nota (0 a 10)
 * @param trancamento - Se a disciplina foi trancada
 * @param dispensada - Se houve dispensa (aproveitamento)
 * @param emcurso - Se a disciplina ainda está sendo cursada
 * @param natureza - Natureza da disciplina (AC, OB, OP, etc)
 * @returns Sigla do resultado: 'AP', 'RR', 'TR', 'DP' ou undefined
 */
export function calcularResultado(
  nota: number,
  trancamento?: boolean,
  dispensada?: boolean,
  emcurso?: boolean,
  natureza?: string
): 'AP' | 'RR' | 'TR' | 'DP' | undefined {
  // Atividades Complementares (AC) não têm resultado
  if (natureza === 'AC') return undefined

  if (trancamento) return 'TR'
  if (dispensada) return 'AP'
  if (emcurso) return 'DP'
  return nota >= NOTA_MINIMA_APROVACAO ? 'AP' : 'RR'
}

/**
 * Calcula a média aritmética simples ponderada pela carga horária
 * de uma lista de disciplinas.
 *
 * @param disciplinas - Lista de disciplinas com nota e ch
 * @returns Valor da média calculado
 */
export function calcularMediaGeral(
  disciplinas: Array<{ nota: number; ch: number; emcurso?: boolean; resultado?: string }>
): number {
  if (disciplinas.length === 0) return 0

  const disciplinasValidas = disciplinas.filter(
    (d) =>
      !d.emcurso &&
      d.resultado !== 'DP' &&
      d.nota !== null &&
      d.nota !== undefined &&
      d.nota >= 0 && d.nota <= 10 &&
      d.ch > 0
  )

  if (disciplinasValidas.length === 0) return 0

  const totalPCH = disciplinasValidas.reduce((acc, d) => acc + d.nota * d.ch, 0)
  const totalCH = disciplinasValidas.reduce((acc, d) => acc + d.ch, 0)

  return totalCH > 0 ? totalPCH / totalCH : 0
}

/**
 * Calcula o Coeficiente de Rendimento (CR) seguindo as regras do SIGAA/UFBA:
 * CR = Σ(nota × CH) / Σ(CH)
 *
 * Entram: APR→'AP' (Aprovado), REP→'RR' (Reprovado por nota).
 * Excluídos: REPF/REPMF→'RF', TRANC/CANC→'TR', DISP/CUMP/TRANS/INCORP→'DP', MATR.
 *
 * @param disciplinas - Lista de disciplinas
 * @returns Valor do CR (0 a 10)
 */
export function calcularCR(
  disciplinas: Array<{
    nota: number
    ch: number
    dispensada?: boolean
    natureza?: string
    trancamento?: boolean
    emcurso?: boolean
    resultado?: string
  }>
): number {
  const disciplinasValidas = disciplinas.filter(
    (d) =>
      // Apenas AP (Aprovado) ou RR (Reprovado por nota) compõem o CR.
      // RF (Reprovado por Falta/REPF) é excluído do numerador E do denominador.
      (d.resultado === 'AP' || d.resultado === 'RR') &&
      // Defesa extra: dispensadas manuais recebem resultado='AP' via calcularResultado
      !d.dispensada &&
      d.natureza !== 'AC' &&
      d.nota !== null &&
      d.nota !== undefined &&
      d.nota >= 0 && d.nota <= 10 &&
      d.ch > 0 &&
      !d.trancamento &&
      !d.emcurso
  )

  if (disciplinasValidas.length === 0) return 0

  const somaCH = disciplinasValidas.reduce((sum, d) => sum + d.ch, 0)
  const somaPCH = disciplinasValidas.reduce((sum, d) => sum + d.ch * d.nota, 0)

  return somaCH > 0 ? somaPCH / somaCH : 0
}

/**
 * Converte a Carga Horária (CH) total em número de créditos
 * (1 crédito = CH_POR_CREDITO horas)
 *
 * @param disciplinas - Lista de disciplinas
 * @returns Total de créditos
 */
export function calcularCreditos(
  disciplinas: Array<{ ch: number; dispensada?: boolean; natureza?: string }>
): number {
  const disciplinasValidas = disciplinas.filter(
    (d) => !d.dispensada && d.natureza !== 'AC' && d.ch > 0
  )

  return disciplinasValidas.reduce((sum, d) => sum + d.ch / CH_POR_CREDITO, 0)
}

/**
 * Calcula o Produto de Carga Horária (PCH) - Soma de (Nota * CH)
 *
 * @param disciplinas - Lista de disciplinas
 * @returns Valor do PCH
 */
export function calcularPCH(
  disciplinas: Array<{ nota: number; ch: number; dispensada?: boolean; natureza?: string }>
): number {
  const disciplinasValidas = disciplinas.filter(
    (d) =>
      !d.dispensada &&
      d.natureza !== 'AC' &&
      d.nota !== null &&
      d.nota !== undefined &&
      d.nota >= 0 && d.nota <= 10 &&
      d.ch > 0
  )

  return disciplinasValidas.reduce((sum, d) => sum + d.ch * d.nota, 0)
}

/**
 * Calcula o Produto de Crédito por Rendimento (PCR) - Soma de (Créditos * Nota)
 *
 * @param disciplinas - Lista de disciplinas
 * @returns Valor do PCR
 */
export function calcularPCR(
  disciplinas: Array<{ nota: number; ch: number; dispensada?: boolean; natureza?: string }>
): number {
  const disciplinasValidas = disciplinas.filter(
    (d) =>
      !d.dispensada &&
      d.natureza !== 'AC' &&
      d.nota !== null &&
      d.nota !== undefined &&
      d.nota >= 0 && d.nota <= 10 &&
      d.ch > 0
  )

  return disciplinasValidas.reduce((sum, d) => sum + (d.ch / CH_POR_CREDITO) * d.nota, 0)
}

/**
 * Retorna metadados visuais (cor, ícone, feedback) baseados no valor do CR
 *
 * @param cr - Valor do Coeficiente de Rendimento
 * @returns Objeto com classe CSS, nome do ícone (lucide) e texto motivacional
 */
export function getStatusCR(cr: number): {
  class: string
  icon: string
  text: string
} {
  if (cr >= 8.5) {
    return {
      class: 'excellent',
      icon: 'star',
      text: 'Excelente! Continue assim!',
    }
  } else if (cr >= 7.0) {
    return {
      class: 'good',
      icon: 'thumbs-up',
      text: 'Bom desempenho!',
    }
  } else if (cr >= 6.0) {
    return {
      class: 'regular',
      icon: 'alert-triangle',
      text: 'Regular. Foque nas próximas disciplinas!',
    }
  } else {
    return {
      class: 'needs-improvement',
      icon: 'alert-circle',
      text: 'Precisa melhorar. Revise sua estratégia!',
    }
  }
}

/**
 * Analisa a variação das notas ao longo dos períodos para identificar tendências
 *
 * @param disciplinas - Histórico de disciplinas
 * @returns Objeto com ícone de tendência e texto descritivo da variação
 */
export function calcularTendenciaNotas(
  disciplinas: Array<{
    nota: number
    periodo: string
    dispensada?: boolean
    natureza?: string
    resultado?: string
  }>
): { icon: string; text: string } {
  const disciplinasComNota = disciplinas.filter(
    (d) =>
      d.nota !== null &&
      d.nota !== undefined &&
      d.nota >= 0 && d.nota <= 10 &&
      !d.dispensada &&
      d.natureza !== 'AC' &&
      d.resultado !== 'TR'
  )

  if (disciplinasComNota.length < 2) {
    return {
      icon: 'info',
      text: 'Dados insuficientes para análise de tendência',
    }
  }

  // Ordenar por período (mais recente primeiro)
  const disciplinasOrdenadas = [...disciplinasComNota].sort((a, b) => compararPeriodos(a.periodo, b.periodo))

  const metade = Math.ceil(disciplinasOrdenadas.length / 2)
  const primeirasNotas = disciplinasOrdenadas.slice(0, metade)
  const ultimasNotas = disciplinasOrdenadas.slice(-metade)

  const mediaRecente = primeirasNotas.reduce((sum, d) => sum + d.nota, 0) / primeirasNotas.length
  const mediaAntiga = ultimasNotas.reduce((sum, d) => sum + d.nota, 0) / ultimasNotas.length

  const diferenca = mediaRecente - mediaAntiga

  if (diferenca > 0.5) {
    return {
      icon: 'trending-up',
      text: `Tendência de melhoria! (+${diferenca.toFixed(1)} pontos)`,
    }
  } else if (diferenca < -0.5) {
    return {
      icon: 'trending-down',
      text: `Tendência de queda (-${Math.abs(diferenca).toFixed(1)} pontos)`,
    }
  } else {
    return {
      icon: 'minus',
      text: 'Desempenho estável',
    }
  }
}

/**
 * Calcula o Perfil Inicial baseado nos aproveitamentos de disciplinas obrigatórias.
 * Um nível é conquistado para cada semestre da matriz onde o aluno
 * aproveitou >= 75% da carga horária.
 */
export function calcularPerfilInicial(
  disciplinas: Disciplina[],
  curso: Curso
): number {
  const matriz = (MATRIZES as MatrizCurricular)[curso]
  if (!matriz) return 0

  let perfil = 0
  const semestres = Object.keys(matriz).map(Number).sort((a, b) => a - b)

  for (const sem of semestres) {
    const codigosObrigatorios = matriz[sem]
    if (!codigosObrigatorios || codigosObrigatorios.length === 0) continue

    let chTotalSemestre = 0
    let chAproveitada = 0

    codigosObrigatorios.forEach((codigo: string) => {
      // Tentar encontrar a CH padrão a partir do array de disciplinas cursadas
      const discEncontrada = disciplinas.find(d => d.codigo === codigo || d.codigo.startsWith(codigo))
      const chPadrao = discEncontrada?.ch || 60 // Padrão 60 se não encontrar
      chTotalSemestre += chPadrao

      // IMPORTANTE: Perfil Inicial no SIGAA UFBA se refere a aproveitamentos
      // de estudos ANTERIORES ao ingresso (transferências, etc).
      // Disciplinas cursadas normalmente não entram no Perfil Inicial.
      const disc = disciplinas.find(d =>
        (d.codigo === codigo || d.codigo.startsWith(codigo)) &&
        d.dispensada // Apenas aproveitamentos contam para o perfil extra
      )

      if (disc) {
        chAproveitada += disc.ch || chPadrao
      }
    })

    if (chTotalSemestre > 0 && (chAproveitada / chTotalSemestre) >= 0.75) {
      perfil++
    } else {
      // Para o cálculo quando não atinge 75% em um semestre consecutivo
      break
    }
  }

  return perfil
}

/**
 * Calcula a semestralização do aluno baseada no Perfil Inicial,
 * semestres cursados e suspensões.
 *
 * @param profile - Objeto de perfil do usuário
 * @param disciplinas - Lista de disciplinas cursadas
 * @param periodoAtual - Período letivo atual (Ex: "2025.2")
 * @returns O semestre letivo atual do aluno
 */
export function calcularSemestralizacao(
  profile: Profile,
  disciplinas: Disciplina[],
  periodoAtual: string
): number {
  if (!periodoAtual) return 0

  const estaNoCPL = (profile.cursos?.length ?? 0) > 1

  if (estaNoCPL) {
    // Em CPL: conta semestres a partir do ingresso no novo curso
    if (!profile.cplStartYear || !profile.cplStartSemester) return 0
    const totalSemestres = calcularTotalSemestresCursados(
      `${profile.cplStartYear}.${profile.cplStartSemester}`,
      periodoAtual
    )
    return Math.max(1, totalSemestres)
  }

  // BICTI: lógica original
  if (!profile.startYear || !profile.startSemester) return 0

  const totalSemestres = calcularTotalSemestresCursados(
    `${profile.startYear}.${profile.startSemester}`,
    periodoAtual
  )

  const suspensões = profile.suspensions || 0
  const perfilInicial = calcularPerfilInicial(disciplinas, profile.curso || 'BICTI')

  return Math.max(1, totalSemestres - suspensões + perfilInicial)
}
