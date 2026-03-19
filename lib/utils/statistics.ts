import { CURSOS } from '@/lib/constants'
import type { Disciplina, Certificado, Curso, Natureza, Profile, UserStatistics } from '@/types'
import { calcularSemestralizacao } from './calculations'

/**
 * Compila estatísticas rápidas sobre o progresso acadêmico
 *
 * @param disciplinas - Lista total de disciplinas
 * @returns Objeto com totais, contagens e média arredondada
 */
export function calcularEstatisticas(
  disciplinas: Disciplina[],
  certificados: Certificado[] = [],
  curso: Curso = 'BICTI',
  profile?: Profile,
  periodoAtual?: string
): UserStatistics {
  // Configuração do curso para limites e redistribuição
  const cursoConfig = CURSOS[curso]

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

  // Calculation of hours by nature with logic ported from Summary component
  // Initialize with zeros
  const horasPorNatureza: Record<Natureza, number> = {
    AC: 0,
    LV: 0,
    OB: 0,
    OG: 0,
    OH: 0,
    OP: 0,
    OX: 0,
    OZ: 0,
  }

  // 1. Calculate base hours from disciplines
  disciplinas.forEach((d) => {
    // Consider only disciplines with approval (AP) or dispensation
    // RR (reproved) or DP (in-progress) should NOT count toward hours
    const isCompleted = (d.resultado === 'AP' || d.dispensada) && !d.emcurso

    if (isCompleted && d.ch) {
      // Disciplinas dispensadas contam como LV
      const natureza = d.dispensada ? 'LV' : d.natureza

      if (natureza && natureza !== 'AC') {
        if (horasPorNatureza[natureza as Natureza] !== undefined) {
          horasPorNatureza[natureza as Natureza] += d.ch
        }
      } else if (natureza === 'AC') {
        horasPorNatureza.AC += d.ch
      }
    }
  })

  // 2. Add Approved Certificates to 'AC' hours
  const acHoursFromCerts = certificados
    .filter(c => c.status === 'aprovado')
    .reduce((sum, c) => sum + (c.cargaHoraria || 0), 0)

  horasPorNatureza.AC += acHoursFromCerts

  // 3. Universal Redistribution to LV
  // Any category that exceeds its requirement overflows to Livre (LV)
  let totalExcessoLV = 0

  Object.keys(horasPorNatureza).forEach((nat) => {
    const natureza = nat as Natureza
    if (natureza === 'LV' || natureza === 'OB' || natureza === 'AC') return

    const requisito = cursoConfig?.requisitos?.[natureza] as number

    if (requisito !== undefined && requisito > 0 && horasPorNatureza[natureza] > requisito) {
      const excesso = horasPorNatureza[natureza] - requisito
      totalExcessoLV += excesso
      horasPorNatureza[natureza] = requisito // Cap original category
    }
  })

  // Add all excesses to LV
  horasPorNatureza.LV += totalExcessoLV

  // 4. Final Caps based on curriculum requirements
  Object.keys(horasPorNatureza).forEach((nat) => {
    const natureza = nat as Natureza
    const requisito = cursoConfig?.requisitos?.[natureza] as number
    if (requisito !== undefined && horasPorNatureza[natureza] > requisito) {
      horasPorNatureza[natureza] = requisito
    }
  })

  // Calculate total capped hours (only approved/dispensada)
  const totalCH = Object.values(horasPorNatureza).reduce((sum, h) => sum + h, 0)

  return {
    totalDisciplines,
    completedDisciplines,
    inProgressDisciplines,
    averageGrade: Math.round(averageGrade * 100) / 100,
    horasPorNatureza,
    totalCH,
    semestralization: profile && periodoAtual ? calcularSemestralizacao(profile, disciplinas, periodoAtual) : undefined
  }
}
