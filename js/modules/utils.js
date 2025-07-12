// js/modules/utils.js
export function compararPeriodos(periodoA, periodoB) {
  const [anoA, semestreA] = periodoA.split('.')
  const [anoB, semestreB] = periodoB.split('.')
  if (anoA !== anoB) {
    return parseInt(anoA) - parseInt(anoB)
  }
  return parseInt(semestreA) - parseInt(semestreB)
}

export function getPeriodosUnicos(disciplinas) {
  const periodos = [...new Set(disciplinas.map(d => d.periodo))]
  return periodos.sort((a, b) => compararPeriodos(b, a))
}

export function getPeriodoMaisRecente(disciplinas) {
  const periodos = getPeriodosUnicos(disciplinas)
  return periodos[0] || ''
}
