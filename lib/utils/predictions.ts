import { CURSOS } from '@/lib/constants'
import type { Disciplina, Natureza, Curso } from '@/types'

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
  disciplinasEmCurso: Disciplina[],
  horasPorNatureza?: Record<Natureza, number>,
  curso: Curso = 'BICTI'
): {
  texto: string
  semestresRestantes: number
  disciplinasNecessarias?: number
  podeFormarEsteSemestre: boolean
} {
  const cursoConfig = CURSOS[curso]

  if (totalCH === 0 && disciplinasEmCurso.length === 0) {
    return {
      texto: 'Adicione disciplinas para calcular previsão',
      semestresRestantes: 0,
      podeFormarEsteSemestre: false,
    }
  }

  // Verificar se já pode se formar (com tolerância de 1h para BICTI - 2400h de 2401h)
  const metaComTolerancia = totalHorasNecessarias === 2401 ? 2400 : totalHorasNecessarias

  if (totalCHComEmCurso >= metaComTolerancia) {
    if (disciplinasEmCurso.length > 0) {
      return {
        texto: `Você pode se formar este semestre! (considerando ${disciplinasEmCurso.length} disciplina(s) em curso)`,
        semestresRestantes: 0,
        podeFormarEsteSemestre: true,
      }
    } else if (totalCH >= metaComTolerancia) {
      return {
        texto: 'Você já cumpriu os requisitos de CH!',
        semestresRestantes: 0,
        podeFormarEsteSemestre: true,
      }
    }
  }

  // Lógica Especial: Se faltar APENAS Atividade Complementar (AC)
  if (horasPorNatureza && cursoConfig) {
    const acAtual = horasPorNatureza.AC || 0
    const acRequisito = cursoConfig.requisitos.AC || 0

    // Calcular quanto falta excluindo AC
    const totalSemAC = totalCHComEmCurso - acAtual
    const metaSemAC = totalHorasNecessarias - acRequisito
    const metaSemACComTolerancia = totalHorasNecessarias === 2401 ? metaSemAC - 1 : metaSemAC

    // Se ele já bateu a meta de disciplinas mas falta AC
    if (totalSemAC >= metaSemACComTolerancia && acAtual < acRequisito) {
      const horasFaltantesAC = acRequisito - acAtual
      return {
        texto: `Você já concluiu as disciplinas! Faltam apenas ${horasFaltantesAC}h de Atividades Complementares. Adicione certificados para completar.`,
        semestresRestantes: 0,
        podeFormarEsteSemestre: true, // Pode formar se adicionar certificados
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
