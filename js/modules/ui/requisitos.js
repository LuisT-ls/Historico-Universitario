// requisitos.js
export function atualizarRequisitos(
  disciplinas,
  REQUISITOS,
  TOTAL_HORAS_NECESSARIAS
) {
  const tbody = document.getElementById('requisitosBody')
  tbody.innerHTML = ''

  const disciplinasAprovadas = disciplinas.filter(d => d.resultado === 'AP')
  const horasPorNatureza = {}

  // Calculate hours per nature
  disciplinasAprovadas.forEach(d => {
    if (!horasPorNatureza[d.natureza]) {
      horasPorNatureza[d.natureza] = 0
    }
    horasPorNatureza[d.natureza] += d.ch
  })

  // Handle LV excess hours calculation
  const naturezasParaLV = ['OX', 'OG', 'OH', 'OZ']
  let totalExcessoLV = 0

  naturezasParaLV.forEach(nat => {
    if (horasPorNatureza[nat] && REQUISITOS[nat]) {
      if (horasPorNatureza[nat] > REQUISITOS[nat]) {
        const excesso = horasPorNatureza[nat] - REQUISITOS[nat]
        totalExcessoLV += excesso
        horasPorNatureza[nat] = REQUISITOS[nat]
      }
    }
  })

  if (!horasPorNatureza.LV) {
    horasPorNatureza.LV = 0
  }
  horasPorNatureza.LV += totalExcessoLV

  let totalCursado = 0

  // Nature labels for better readability
  const naturezaLabels = {
    AC: 'Atividade Complementar',
    LV: 'Componente Livre',
    OB: 'Obrigatória',
    OG: 'Optativa da Grande Área',
    OH: 'Optativa Humanística',
    OP: 'Optativa',
    OX: 'Optativa de Extensão',
    OZ: 'Optativa Artística'
  }

  // Create table rows with enhanced visualization
  Object.entries(REQUISITOS).forEach(([natureza, meta]) => {
    const cursado = horasPorNatureza[natureza] || 0
    const falta = Math.max(0, meta - cursado)
    totalCursado += cursado

    // Calculate completion percentage
    const completionPercent = Math.min(100, (cursado / meta) * 100)
    const statusClass =
      completionPercent >= 100 ? 'status-complete' : 'status-incomplete'

    const tr = document.createElement('tr')
    tr.innerHTML = `
    <td>
      <div class="natureza-info">
        <span class="natureza-codigo">${natureza}</span>
        <span class="natureza-descricao" title="${
          naturezaLabels[natureza] || natureza
        }">
          ${naturezaLabels[natureza] || natureza}
        </span>
      </div>
    </td>
    <td class="hours-number">${meta}</td>
    <td class="progress-cell ${statusClass}">
      <span class="hours-number">${cursado}</span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${completionPercent}%"></div>
      </div>
    </td>
    <td class="${statusClass}">
      <span class="hours-number">${falta}</span>
      ${falta === 0 ? '<i class="fas fa-check-circle"></i>' : ''}
    </td>
  `
    tbody.appendChild(tr)
  })

  // Update totals
  const totalFalta = Math.max(0, TOTAL_HORAS_NECESSARIAS - totalCursado)
  const totalPercent = (totalCursado / TOTAL_HORAS_NECESSARIAS) * 100

  document.getElementById('totalCursado').innerHTML = `
    ${totalCursado}
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${totalPercent}%"></div>
    </div>
  `
  document.getElementById('totalFalta').textContent = totalFalta
  document.getElementById('metaTotal').textContent = TOTAL_HORAS_NECESSARIAS
}

// Add tooltip functionality
document.querySelectorAll('[title]').forEach(element => {
  element.addEventListener('mouseenter', e => {
    const tooltip = document.createElement('div')
    tooltip.className = 'tooltip'
    tooltip.textContent = e.target.getAttribute('title')
    document.body.appendChild(tooltip)

    const rect = e.target.getBoundingClientRect()
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`
    tooltip.style.left = `${
      rect.left + (rect.width - tooltip.offsetWidth) / 2
    }px`
  })

  element.addEventListener('mouseleave', () => {
    document.querySelector('.tooltip')?.remove()
  })
})
