// js/modules/ui/requisitos.js
export function atualizarRequisitos(
  disciplinas,
  REQUISITOS,
  TOTAL_HORAS_NECESSARIAS
) {
  const tbody = document.getElementById('requisitosBody')
  tbody.innerHTML = ''

  const disciplinasAprovadas = disciplinas.filter(d => d.resultado === 'AP')
  const horasPorNatureza = {}

  disciplinasAprovadas.forEach(d => {
    horasPorNatureza[d.natureza] = (horasPorNatureza[d.natureza] || 0) + d.ch
  })

  let totalCursado = 0

  Object.entries(REQUISITOS).forEach(([natureza, meta]) => {
    const cursado = horasPorNatureza[natureza] || 0
    const falta = Math.max(0, meta - cursado)
    totalCursado += cursado

    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${natureza}</td>
      <td>${meta}</td>
      <td>${cursado}</td>
      <td>${falta}</td>
    `
    tbody.appendChild(tr)
  })

  document.getElementById('totalCursado').textContent = totalCursado
  document.getElementById('totalFalta').textContent = Math.max(
    0,
    TOTAL_HORAS_NECESSARIAS - totalCursado
  )
}
