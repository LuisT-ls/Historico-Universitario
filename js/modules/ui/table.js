// js/modules/ui/table.js
import { compararPeriodos } from '../utils.js'

export function atualizarTabela(disciplinas, removerDisciplina) {
  const tbody = document.getElementById('historicoBody')
  tbody.innerHTML = ''

  if (disciplinas.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" class="empty-table">Nenhuma disciplina cadastrada</td></tr>'
    return
  }

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
      <td colspan="9" style="background-color: #f0f0f0; font-weight: bold; text-align: center;">
        Período ${periodo}
      </td>
    `
    tbody.appendChild(trHeader)

    const disciplinasDoPeriodo = disciplinasPorPeriodo[periodo]

    // Ordenando as disciplinas dentro do período
    disciplinasDoPeriodo.sort((a, b) => {
      if (a.codigo < b.codigo) return -1
      if (a.codigo > b.codigo) return 1
      const statusOrder = { AP: 0, TR: 1, RR: 2 } // Correção de RP para RR
      return statusOrder[a.resultado] - statusOrder[b.resultado]
    })

    disciplinasDoPeriodo.forEach(disc => {
      const indexNoArray = disciplinas.indexOf(disc)
      const tr = document.createElement('tr')

      // Calcula o PCH (Produto Carga Horária = CH × Nota)
      const pch = disc.trancamento
        ? '-'
        : (disc.ch * (disc.nota || 0)).toFixed(1)

      tr.innerHTML = `
        <td>${disc.periodo}</td>
        <td>${disc.codigo}</td>
        <td>${disc.nome}</td>
        <td>${disc.trancamento ? '-' : disc.ch}</td>
        <td>${disc.natureza}</td>
        <td>${
          disc.trancamento ? '-' : disc.nota ? disc.nota.toFixed(1) : '-'
        }</td>
        <td>${pch}</td>
        <td>${disc.resultado}</td>
        <td>
          <div class="acoes-disciplina">
            <button class="btn-acao btn-editar" title="Editar disciplina" onclick="window.app.editarDisciplina(${indexNoArray})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-acao btn-remover" title="Remover disciplina" onclick="window.app.removerDisciplina(${indexNoArray})">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      `

      // Adiciona classes para estilização baseada no resultado
      if (disc.resultado === 'AP') {
        tr.classList.add('aprovada')
      } else if (disc.resultado === 'RR') {
        tr.classList.add('reprovada')
      } else if (disc.resultado === 'TR') {
        tr.classList.add('trancada')
      }

      tbody.appendChild(tr)
    })

    if (periodo !== periodos[periodos.length - 1]) {
      const trSeparator = document.createElement('tr')
      trSeparator.innerHTML = '<td colspan="9" style="height: 20px;"></td>'
      tbody.appendChild(trSeparator)
    }
  })
}

// Função para criar o cabeçalho da tabela
function criarCabecalhoTabela() {
  const thead = document.createElement('thead')
  thead.innerHTML = `
    <tr>
      <th><i class="fas fa-calendar"></i> Semestre</th>
      <th><i class="fas fa-hashtag"></i> Código</th>
      <th><i class="fas fa-book"></i> Disciplina</th>
      <th><i class="fas fa-clock"></i> CH</th>
      <th><i class="fas fa-tag"></i> NT</th>
      <th><i class="fas fa-star"></i> Nota</th>
      <th><i class="fas fa-calculator"></i> PCH</th>
      <th><i class="fas fa-check-circle"></i> RES</th>
      <th><i class="fas fa-cogs"></i> Ações</th>
    </tr>
  `
  return thead
}
