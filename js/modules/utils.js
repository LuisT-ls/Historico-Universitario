// js/modules/utils.js
export function compararPeriodos(periodoA, periodoB) {
  // Verificar se os períodos são válidos
  if (!periodoA || !periodoB) {
    return 0
  }

  const [anoA, semestreA] = periodoA.split('.')
  const [anoB, semestreB] = periodoB.split('.')

  if (anoA !== anoB) {
    return parseInt(anoA) - parseInt(anoB)
  }
  return parseInt(semestreA) - parseInt(semestreB)
}

export function getPeriodosUnicos(disciplinas) {
  const periodos = [...new Set(disciplinas.map(d => d.periodo))].filter(
    periodo => periodo && periodo.trim() !== ''
  ) // Filtrar valores null/undefined/vazios
  return periodos.sort((a, b) => compararPeriodos(b, a))
}

export function getPeriodoMaisRecente(disciplinas) {
  const periodos = getPeriodosUnicos(disciplinas)
  return periodos[0] || ''
}
