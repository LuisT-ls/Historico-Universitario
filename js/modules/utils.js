// js/modules/utils.js
export function compararPeriodos(a, b) {
  const [anoA, semA] = a.split('.')
  const [anoB, semB] = b.split('.')
  if (anoA === anoB) {
    return parseInt(semA) - parseInt(semB)
  }
  return parseInt(anoA) - parseInt(anoB)
}

export function getPeriodosUnicos(disciplinas) {
  const periodos = [...new Set(disciplinas.map(d => d.periodo))]
  return periodos.sort((a, b) => compararPeriodos(b, a))
}

export function getPeriodoMaisRecente(disciplinas) {
  const periodos = getPeriodosUnicos(disciplinas)
  return periodos[0] || ''
}
