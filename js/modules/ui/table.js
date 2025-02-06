// js/modules/ui/table.js
import { compararPeriodos } from '../utils.js'

export function atualizarTabela(disciplinas, removerDisciplina) {
  const tbody = document.getElementById('historicoBody')
  tbody.innerHTML = ''

  const disciplinasPorPeriodo = {}
  disciplinas.forEach(disc => {
    if (!disciplinasPorPeriodo[disc.periodo]) {
      disciplinasPorPeriodo[disc.periodo] = []
    }
    disciplinasPorPeriodo[disc.periodo].push(disc)
  })

  const periodos = Object.keys(disciplinasPorPeriodo).sort(compararPeriodos)

  periodos.forEach(periodo => {
    const trHeader = document.createElement('tr')
    trHeader.className = 'periodo-header'
    trHeader.innerHTML = `
      <td colspan="8" style="background-color: #f0f0f0; font-weight: bold; text-align: center;">
        Período ${periodo}
      </td>
    `
    tbody.appendChild(trHeader)

    const disciplinasDoPeriodo = disciplinasPorPeriodo[periodo]

    // Ordenando as disciplinas dentro do período:
    disciplinasDoPeriodo.sort((a, b) => {
      // Primeiro, ordenar pelo código (alfabeticamente)
      if (a.codigo < b.codigo) return -1
      if (a.codigo > b.codigo) return 1

      // Se os códigos forem iguais, ordena por status (AP, TR, RP)
      const statusOrder = { AP: 0, TR: 1, RP: 2 }
      return statusOrder[a.resultado] - statusOrder[b.resultado]
    })

    disciplinasDoPeriodo.forEach(disc => {
      const indexNoArray = disciplinas.indexOf(disc)
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td>${disc.periodo}</td>
        <td>${disc.codigo}</td>
        <td>${disc.nome}</td>
        <td>${disc.trancamento ? '-' : disc.ch}</td>
        <td>${disc.natureza}</td>
        <td>${
          disc.trancamento ? '-' : disc.nota ? disc.nota.toFixed(1) : '-'
        }</td>
        <td>${disc.resultado}</td>
        <td>
          <button class="remover" onclick="window.app.removerDisciplina(${indexNoArray})">Remover</button>
        </td>
      `
      tbody.appendChild(tr)
    })

    if (periodo !== periodos[periodos.length - 1]) {
      const trSeparator = document.createElement('tr')
      trSeparator.innerHTML = '<td colspan="8" style="height: 20px;"></td>'
      tbody.appendChild(trSeparator)
    }
  })
}
