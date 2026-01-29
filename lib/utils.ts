import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Disciplina, UserStatistics, Natureza } from '@/types'
import { logger } from '@/lib/logger'

/**
 * Utilitário para combinar classes do Tailwind CSS com suporte a condições
 * e resolução de conflitos (merging).
 * 
 * @param inputs - Classes, arrays ou objetos de classes a serem combinados
 * @returns String de classes otimizada
 * 
 * @example
 * cn('px-2 py-1', isSelected && 'bg-blue-500')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma data no padrão brasileiro (DD/MM/AAAA HH:mm)
 * 
 * @param date - Objeto Date ou string de data para formatar
 * @returns String formatada: "19/01/2026 14:30"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Identifica o período letivo mais recente em uma lista de disciplinas
 * 
 * @param disciplinas - Lista de objetos contendo o campo periodo (Ex: "2023.1")
 * @returns O período mais recente ou null se a lista estiver vazia
 */
export function getPeriodoMaisRecente(disciplinas: Array<{ periodo: string }>): string | null {
  if (disciplinas.length === 0) return null

  const periodos = disciplinas
    .map((d) => d.periodo)
    .filter((p) => p && p.trim() !== '')
    .sort((a, b) => {
      const [anoA, semA] = a.split('.').map(Number)
      const [anoB, semB] = b.split('.').map(Number)

      if (anoA !== anoB) return anoB - anoA
      return semB - semA
    })

  return periodos[0] || null
}

/**
 * Função de comparação para ordenação de períodos (do mais recente para o mais antigo)
 * 
 * @param a - Período A (Ex: "2023.1")
 * @param b - Período B (Ex: "2022.2")
 * @returns Número indicando a ordem para o método .sort()
 */
export function compararPeriodos(a: string, b: string): number {
  const [anoA, semA] = a.split('.').map(Number)
  const [anoB, semB] = b.split('.').map(Number)

  if (anoA !== anoB) return anoB - anoA // Ano mais recente primeiro
  return semB - semA // Semestre mais recente primeiro
}

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
  return nota >= 5.0 ? 'AP' : 'RR'
}

/**
 * Calcula a média aritmética simples ponderada pela carga horária
 * de uma lista de disciplinas.
 * 
 * @param disciplinas - Lista de disciplinas com nota e ch
 * @returns Valor da média calculado
 */
export function calcularMediaGeral(disciplinas: Array<{ nota: number; ch: number }>): number {
  if (disciplinas.length === 0) return 0

  const totalPCH = disciplinas.reduce((acc, d) => acc + d.nota * d.ch, 0)
  const totalCH = disciplinas.reduce((acc, d) => acc + d.ch, 0)

  return totalCH > 0 ? totalPCH / totalCH : 0
}

/**
 * Calcula o Coeficiente de Rendimento (CR) seguindo as regras acadêmicas:
 * Desconsidera dispensas e Atividades Complementares (AC).
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
  }>
): number {
  const disciplinasValidas = disciplinas.filter(
    (d) =>
      !d.dispensada &&
      d.natureza !== 'AC' &&
      d.nota !== null &&
      d.nota !== undefined &&
      !d.trancamento
  )

  if (disciplinasValidas.length === 0) return 0

  const somaCH = disciplinasValidas.reduce((sum, d) => sum + d.ch, 0)
  const somaPCH = disciplinasValidas.reduce((sum, d) => sum + d.ch * d.nota, 0)

  return somaCH > 0 ? somaPCH / somaCH : 0
}

/**
 * Converte a Carga Horária (CH) total em número de créditos
 * (Geralmente 1 crédito = 15 horas)
 * 
 * @param disciplinas - Lista de disciplinas
 * @returns Total de créditos
 */
export function calcularCreditos(
  disciplinas: Array<{ ch: number; dispensada?: boolean; natureza?: string }>
): number {
  const disciplinasValidas = disciplinas.filter(
    (d) => !d.dispensada && d.natureza !== 'AC'
  )

  return disciplinasValidas.reduce((sum, d) => sum + d.ch / 15, 0)
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
    (d) => !d.dispensada && d.natureza !== 'AC' && d.nota !== null && d.nota !== undefined
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
    (d) => !d.dispensada && d.natureza !== 'AC' && d.nota !== null && d.nota !== undefined
  )

  return disciplinasValidas.reduce((sum, d) => sum + (d.ch / 15) * d.nota, 0)
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

  // Ordenar por período
  const disciplinasOrdenadas = [...disciplinasComNota].sort((a, b) => {
    const [anoA, semA] = a.periodo.split('.').map(Number)
    const [anoB, semB] = b.periodo.split('.').map(Number)
    if (anoA !== anoB) return anoB - anoA
    return semB - semA
  })

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
 * Realiza uma simulação estatística da previsão de formatura baseada no ritmo atual do aluno
 * 
 * @param disciplinas - Histórico completo
 * @param totalCH - Carga horária já concluída
 * @param totalCHComEmCurso - CH concluída + CH das matérias atuais
 * @param chEmCurso - CH das matérias que estão sendo cursadas agora
 * @param totalHorasNecessarias - Meta de horas do curso
 * @param disciplinasEmCurso - Lista de objetos das disciplinas atuais
 * @returns Projeção detalhada com tempo estimado e se é possível formar no semestre
 */
export function calcularPrevisaoFormaturaCompleta(
  disciplinas: Disciplina[],
  totalCH: number,
  totalCHComEmCurso: number,
  chEmCurso: number,
  totalHorasNecessarias: number,
  disciplinasEmCurso: Disciplina[]
): {
  texto: string
  semestresRestantes: number
  disciplinasNecessarias?: number
  podeFormarEsteSemestre: boolean
} {
  if (totalCH === 0 && disciplinasEmCurso.length === 0) {
    return {
      texto: 'Adicione disciplinas para calcular previsão',
      semestresRestantes: 0,
      podeFormarEsteSemestre: false,
    }
  }

  // Verificar se já pode se formar
  if (totalCHComEmCurso >= totalHorasNecessarias) {
    if (disciplinasEmCurso.length > 0) {
      return {
        texto: `Você pode se formar este semestre! (considerando ${disciplinasEmCurso.length} disciplina(s) em curso)`,
        semestresRestantes: 0,
        podeFormarEsteSemestre: true,
      }
    } else {
      return {
        texto: 'Você já cumpriu os requisitos de CH!',
        semestresRestantes: 0,
        podeFormarEsteSemestre: true,
      }
    }
  }

  // Calcular média de CH por disciplina baseada no histórico
  const disciplinasComCH = disciplinas.filter(
    (d) =>
      d.ch > 0 &&
      !d.dispensada &&
      d.natureza !== 'AC' &&
      d.resultado !== 'TR' &&
      (d.resultado === 'AP' || d.resultado === 'RR' || d.emcurso || d.resultado === 'DP')
  )

  if (disciplinasComCH.length === 0) {
    return {
      texto: 'Dados insuficientes para calcular previsão',
      semestresRestantes: 0,
      podeFormarEsteSemestre: false,
    }
  }

  const mediaCHPorDisciplina =
    disciplinasComCH.reduce((sum, d) => sum + d.ch, 0) / disciplinasComCH.length

  // Padrão: 6 disciplinas por semestre
  const disciplinasPorSemestre = 6
  const chPorSemestre = mediaCHPorDisciplina * disciplinasPorSemestre

  // Calcular horas restantes
  const horasRestantes = totalHorasNecessarias - totalCHComEmCurso

  if (horasRestantes <= 0) {
    return {
      texto: 'Você já cumpriu os requisitos de CH!',
      semestresRestantes: 0,
      podeFormarEsteSemestre: true,
    }
  }

  // Calcular semestres restantes
  const semestresRestantes = Math.ceil(horasRestantes / chPorSemestre)

  // Calcular quantas disciplinas são necessárias
  const disciplinasNecessarias = Math.ceil(horasRestantes / mediaCHPorDisciplina)

  // Se estiver no penúltimo semestre (1 ou 2 semestres restantes)
  if (semestresRestantes <= 2) {
    const disciplinasEmCursoTexto =
      disciplinasEmCurso.length > 0
        ? ` (considerando ${disciplinasEmCurso.length} disciplina(s) em curso)`
        : ''

    if (semestresRestantes === 1) {
      // Último semestre - mostrar quantas disciplinas precisa
      return {
        texto: `Previsão: 1 semestre restante${disciplinasEmCursoTexto}. Você precisa cursar aproximadamente ${disciplinasNecessarias} disciplina(s) para se formar.`,
        semestresRestantes: 1,
        disciplinasNecessarias,
        podeFormarEsteSemestre: disciplinasNecessarias <= disciplinasPorSemestre,
      }
    } else {
      // Penúltimo semestre (2 semestres restantes)
      // Calcular quantas disciplinas precisa no próximo semestre (considerando 6 por semestre)
      const chNecessariaProximoSemestre = Math.min(horasRestantes / 2, chPorSemestre)
      const disciplinasProximoSemestre = Math.ceil(chNecessariaProximoSemestre / mediaCHPorDisciplina)

      return {
        texto: `Previsão: 2 semestres restantes${disciplinasEmCursoTexto}. No próximo semestre, você precisará cursar aproximadamente ${disciplinasProximoSemestre} disciplina(s).`,
        semestresRestantes: 2,
        disciplinasNecessarias: disciplinasProximoSemestre,
        podeFormarEsteSemestre: false,
      }
    }
  }

  // Mais de 2 semestres restantes
  const anosRestantes = Math.floor(semestresRestantes / 2)
  const semestresRestantesMod = semestresRestantes % 2

  let texto = 'Previsão: '
  if (anosRestantes > 0) {
    texto += `${anosRestantes} ano(s) `
  }
  if (semestresRestantesMod > 0) {
    texto += `${semestresRestantesMod} semestre(s) `
  }
  texto += 'restantes'

  const disciplinasEmCursoTexto =
    disciplinasEmCurso.length > 0
      ? ` (considerando ${disciplinasEmCurso.length} disciplina(s) em curso)`
      : ''
  texto += disciplinasEmCursoTexto

  return {
    texto,
    semestresRestantes,
    podeFormarEsteSemestre: false,
  }
}

/**
 * Sanitiza input de texto removendo caracteres perigosos e espaços extras
 * @param input - Texto a ser sanitizado
 * @returns Texto sanitizado
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove tags HTML
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
}

/**
 * Normaliza texto para comparação (uppercase, trim, sem acentos)
 */
export function normalizeText(input: string): string {
  if (!input) return ''
  return input
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, '') // Remove todos os espaços para comparação de código
}

/**
 * Sanitiza texto longo (descrições, etc.) mantendo quebras de linha
 * @param input - Texto longo a ser sanitizado
 * @returns Texto sanitizado
 */
export function sanitizeLongText(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove tags HTML
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/\r\n/g, '\n') // Normaliza quebras de linha
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n') // Limita múltiplas quebras de linha
}

/**
 * Compila estatísticas rápidas sobre o progresso acadêmico
 * 
 * @param disciplinas - Lista total de disciplinas
 * @returns Objeto com totais, contagens e média arredondada
 */
export function calcularEstatisticas(disciplinas: Disciplina[]): UserStatistics {
  // Total de disciplinas cadastradas
  const totalDisciplines = disciplinas.length

  // Disciplinas concluídas (AP ou RR)
  const completedDisciplines = disciplinas.filter(
    (d) => d.resultado === 'AP' || d.resultado === 'RR'
  ).length

  // Disciplinas em andamento (DP ou emcurso)
  const inProgressDisciplines = disciplinas.filter(
    (d) => d.resultado === 'DP' || d.emcurso === true
  ).length

  // Média geral: apenas disciplinas concluídas com nota válida, não dispensadas, não trancadas, não AC
  const disciplinasParaMedia = disciplinas.filter(
    (d) =>
      (d.resultado === 'AP' || d.resultado === 'RR') &&
      d.nota !== null &&
      d.nota !== undefined &&
      !d.dispensada &&
      d.natureza !== 'AC' &&
      !d.trancamento
  )

  const averageGrade =
    disciplinasParaMedia.length > 0
      ? disciplinasParaMedia.reduce((sum, d) => sum + d.nota, 0) / disciplinasParaMedia.length
      : 0

  // Calculation of hours by nature
  const horasPorNatureza = disciplinas.reduce((acc, d) => {
    // Consider only disciplines with approval (AP/RR) or dispensation for completed hours
    const isCompleted = d.resultado === 'AP' || d.resultado === 'RR' || d.dispensada

    if (isCompleted && d.natureza && d.ch) {
      acc[d.natureza] = (acc[d.natureza] || 0) + d.ch
    }
    return acc
  }, {} as any) // Using any to avoid initial partial type issues, strictly typed in return

  return {
    totalDisciplines,
    completedDisciplines,
    inProgressDisciplines,
    averageGrade: Math.round(averageGrade * 100) / 100,
    horasPorNatureza
  }
}

/**
 * Limpa todos os dados do usuário do localStorage e sessionStorage
 * Mantém apenas preferências globais como tema (dark mode)
 */
export function clearUserData(): void {
  if (typeof window === 'undefined') return

  try {
    // Lista de chaves que devem ser preservadas (preferências globais)
    const preservedKeys = ['historico-ufba-dark-mode']

    // Limpar todas as chaves do localStorage exceto as preservadas
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && !preservedKeys.includes(key)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))

    // Limpar todo o sessionStorage
    sessionStorage.clear()

    logger.info('Dados do usuário limpos com sucesso')
  } catch (error) {
    logger.error('Erro ao limpar dados do usuário:', error)
  }
}

