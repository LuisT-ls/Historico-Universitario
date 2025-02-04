// Constantes para requisitos de formatura
const REQUISITOS = {
  AC: 240,
  LV: 360,
  OB: 600,
  OG: 780,
  OH: 120,
  OP: 0,
  OX: 180,
  OZ: 120
}

const TOTAL_HORAS_NECESSARIAS = 2400

let disciplinas = []

// Elements
const form = document.getElementById('disciplinaForm')
const trancamentoCheckbox = document.getElementById('trancamento')
const camposSemTrancamento = document.querySelector('.campos-sem-trancamento')

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  carregarDisciplinas()
  atualizarTudo()
})

trancamentoCheckbox.addEventListener('change', e => {
  const campos = document.querySelector('.campos-sem-trancamento')
  const chInput = document.getElementById('ch')
  const notaInput = document.getElementById('nota')

  if (e.target.checked) {
    campos.classList.add('hidden')
    chInput.removeAttribute('required')
    notaInput.removeAttribute('required')
  } else {
    campos.classList.remove('hidden')
    chInput.setAttribute('required', '')
    notaInput.setAttribute('required', '')
  }
})

form.addEventListener('submit', function (e) {
  e.preventDefault()

  const disciplina = {
    periodo: document.getElementById('periodo').value,
    codigo: document.getElementById('codigo').value,
    nome: document.getElementById('nome').value,
    natureza: document.getElementById('natureza').value,
    trancamento: document.getElementById('trancamento').checked
  }

  if (!disciplina.trancamento) {
    disciplina.ch = parseInt(document.getElementById('ch').value)
    disciplina.nota = parseFloat(document.getElementById('nota').value)
    disciplina.resultado = disciplina.nota >= 5 ? 'AP' : 'RR'
  } else {
    disciplina.ch = 0
    disciplina.nota = 0
    disciplina.resultado = 'TR'
  }

  disciplinas.push(disciplina)
  salvarDisciplinas()
  atualizarTudo()
  this.reset()
  camposSemTrancamento.classList.remove('hidden')
})

function carregarDisciplinas() {
  const disciplinasSalvas = localStorage.getItem('disciplinas')
  if (disciplinasSalvas) {
    disciplinas = JSON.parse(disciplinasSalvas)
  }
}

function salvarDisciplinas() {
  localStorage.setItem('disciplinas', JSON.stringify(disciplinas))
}

function atualizarTudo() {
  atualizarTabela()
  atualizarResumo()
  atualizarRequisitos()
}

function compararPeriodos(a, b) {
  const [anoA, semA] = a.split('.')
  const [anoB, semB] = b.split('.')
  if (anoA === anoB) {
    return parseInt(semA) - parseInt(semB)
  }
  return parseInt(anoA) - parseInt(anoB)
}

function atualizarTabela() {
  const tbody = document.getElementById('historicoBody')
  tbody.innerHTML = ''

  // Agrupa disciplinas por período
  const disciplinasPorPeriodo = {}
  disciplinas.forEach(disc => {
    if (!disciplinasPorPeriodo[disc.periodo]) {
      disciplinasPorPeriodo[disc.periodo] = []
    }
    disciplinasPorPeriodo[disc.periodo].push(disc)
  })

  // Ordena os períodos
  const periodos = Object.keys(disciplinasPorPeriodo).sort(compararPeriodos)

  // Cria a tabela organizada por período
  periodos.forEach(periodo => {
    // Adiciona cabeçalho do período
    const trHeader = document.createElement('tr')
    trHeader.className = 'periodo-header'
    trHeader.innerHTML = `
          <td colspan="8" style="background-color: #f0f0f0; font-weight: bold; text-align: center;">
              Período ${periodo}
          </td>
      `
    tbody.appendChild(trHeader)

    // Encontra o índice inicial das disciplinas deste período no array original
    const disciplinasDoPeriodo = disciplinasPorPeriodo[periodo]
    disciplinasDoPeriodo.forEach(disc => {
      const indexNoArray = disciplinas.indexOf(disc) // Encontra o índice no array original
      const tr = document.createElement('tr')
      tr.innerHTML = `
              <td>${disc.periodo}</td>
              <td>${disc.codigo}</td>
              <td>${disc.nome}</td>
              <td>${disc.trancamento ? '-' : disc.ch}</td>
              <td>${disc.natureza}</td>
              <td>${disc.trancamento ? '-' : disc.nota.toFixed(1)}</td>
              <td>${disc.resultado}</td>
              <td>
                  <button class="remover" onclick="removerDisciplina(${indexNoArray})">Remover</button>
              </td>
          `
      tbody.appendChild(tr)
    })

    // Adiciona linha de separação entre períodos (exceto no último período)
    if (periodo !== periodos[periodos.length - 1]) {
      const trSeparator = document.createElement('tr')
      trSeparator.innerHTML = '<td colspan="8" style="height: 20px;"></td>'
      tbody.appendChild(trSeparator)
    }
  })
}

function removerDisciplina(index) {
  disciplinas.splice(index, 1)
  salvarDisciplinas()
  atualizarTudo()
}

function atualizarResumo() {
  const disciplinasAprovadas = disciplinas.filter(d => d.resultado === 'AP')

  // Calcula estatísticas gerais
  const totalDisciplinas = disciplinas.length
  const totalAprovacoes = disciplinasAprovadas.length
  const totalReprovacoes = disciplinas.filter(d => d.resultado === 'RR').length
  const totalTrancamentos = disciplinas.filter(d => d.resultado === 'TR').length

  // Calcula média geral
  const media =
    disciplinasAprovadas.length > 0
      ? disciplinasAprovadas.reduce((sum, d) => sum + d.nota, 0) /
        disciplinasAprovadas.length
      : 0

  // Calcula percentuais
  const percentualAprovacao =
    totalDisciplinas > 0
      ? ((totalAprovacoes / totalDisciplinas) * 100).toFixed(1)
      : 0

  // Atualiza o resumo com informações mais úteis
  document.getElementById('resumo').innerHTML = `
      <h2>Resumo Geral</h2>
      <div class="resumo-content">
          <div class="metricas-gerais">
              <h3>Desempenho Acadêmico</h3>
              <p>Média Geral: ${media.toFixed(2)}</p>
              <p>Total de Disciplinas: ${totalDisciplinas}</p>
              <p>Aprovações: ${totalAprovacoes} (${percentualAprovacao}%)</p>
              <p>Reprovações: ${totalReprovacoes}</p>
              <p>Trancamentos: ${totalTrancamentos}</p>
          </div>
          <div class="horas-natureza">
              <h3>Progresso por Semestre</h3>
              ${gerarProgressoPorPeriodo()}
          </div>
      </div>
  `
}

function gerarProgressoPorPeriodo() {
  const disciplinasPorPeriodo = {}
  disciplinas.forEach(d => {
    if (!disciplinasPorPeriodo[d.periodo]) {
      disciplinasPorPeriodo[d.periodo] = {
        total: 0,
        aprovadas: 0
      }
    }
    disciplinasPorPeriodo[d.periodo].total++
    if (d.resultado === 'AP') {
      disciplinasPorPeriodo[d.periodo].aprovadas++
    }
  })

  return Object.entries(disciplinasPorPeriodo)
    .sort(([periodoA], [periodoB]) => compararPeriodos(periodoA, periodoB))
    .map(([periodo, dados]) => {
      const percentual = ((dados.aprovadas / dados.total) * 100).toFixed(1)
      return `<p>${periodo}: ${dados.aprovadas}/${dados.total} disciplinas (${percentual}%)</p>`
    })
    .join('')
}

function atualizarRequisitos() {
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

// Adiciona novo elemento ao HTML logo após o campo de período
document.querySelector('.form-group:has(#periodo)').insertAdjacentHTML(
  'beforeend',
  `
  <div id="periodosSugeridos" class="periodos-sugeridos"></div>
`
)

// Adiciona novo estilo ao CSS
const style = document.createElement('style')
style.textContent = `
    .periodos-sugeridos {
        position: absolute;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        max-height: 150px;
        overflow-y: auto;
        width: 100%;
        z-index: 1000;
        display: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .periodo-sugerido {
        padding: 8px 12px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .periodo-sugerido:hover {
        background-color: #f0f0f0;
    }

    .form-group {
        position: relative;
    }

    .periodo-atual {
        background-color: #e3f2fd;
        font-weight: bold;
    }
`
document.head.appendChild(style)

// Função para obter períodos únicos das disciplinas
function getPeriodosUnicos() {
  const periodos = [...new Set(disciplinas.map(d => d.periodo))]
  return periodos.sort((a, b) => compararPeriodos(b, a)) // Ordem decrescente
}

// Função para obter o período mais recente
function getPeriodoMaisRecente() {
  const periodos = getPeriodosUnicos()
  return periodos[0] || ''
}

// Função para atualizar sugestões de períodos
function atualizarSugestoesPeriodos() {
  const periodoInput = document.getElementById('periodo')
  const sugestoesDiv = document.getElementById('periodosSugeridos')
  const periodos = getPeriodosUnicos()

  if (periodos.length === 0) {
    sugestoesDiv.style.display = 'none'
    return
  }

  sugestoesDiv.innerHTML = ''
  periodos.forEach(periodo => {
    const div = document.createElement('div')
    div.className = 'periodo-sugerido'
    if (periodo === getPeriodoMaisRecente()) {
      div.classList.add('periodo-atual')
    }
    div.textContent = periodo
    div.onclick = () => {
      periodoInput.value = periodo
      sugestoesDiv.style.display = 'none'
    }
    sugestoesDiv.appendChild(div)
  })
}

// Event listeners para o campo de período
const periodoInput = document.getElementById('periodo')
const sugestoesDiv = document.getElementById('periodosSugeridos')

periodoInput.addEventListener('focus', () => {
  if (getPeriodosUnicos().length > 0) {
    sugestoesDiv.style.display = 'block'
    atualizarSugestoesPeriodos()
  }
})

periodoInput.addEventListener('blur', () => {
  // Pequeno delay para permitir o clique na sugestão
  setTimeout(() => {
    sugestoesDiv.style.display = 'none'
  }, 200)
})

periodoInput.addEventListener('input', () => {
  const valor = periodoInput.value.toLowerCase()
  const periodos = getPeriodosUnicos()

  if (periodos.length > 0) {
    sugestoesDiv.style.display = 'block'
    sugestoesDiv.innerHTML = ''

    periodos
      .filter(periodo => periodo.toLowerCase().includes(valor))
      .forEach(periodo => {
        const div = document.createElement('div')
        div.className = 'periodo-sugerido'
        if (periodo === getPeriodoMaisRecente()) {
          div.classList.add('periodo-atual')
        }
        div.textContent = periodo
        div.onclick = () => {
          periodoInput.value = periodo
          sugestoesDiv.style.display = 'none'
        }
        sugestoesDiv.appendChild(div)
      })
  }
})

// Modificar o event listener do form para incluir a atualização das sugestões
form.addEventListener('submit', function (e) {
  e.preventDefault()

  const disciplina = {
    periodo: document.getElementById('periodo').value,
    codigo: document.getElementById('codigo').value,
    nome: document.getElementById('nome').value,
    natureza: document.getElementById('natureza').value,
    trancamento: document.getElementById('trancamento').checked
  }

  if (!disciplina.trancamento) {
    disciplina.ch = parseInt(document.getElementById('ch').value)
    disciplina.nota = parseFloat(document.getElementById('nota').value)
    disciplina.resultado = disciplina.nota >= 5 ? 'AP' : 'RR'
  } else {
    disciplina.ch = 0
    disciplina.nota = 0
    disciplina.resultado = 'TR'
  }

  disciplinas.push(disciplina)
  salvarDisciplinas()
  atualizarTudo()

  // Mantém o período atual no campo após submeter
  const periodoAtual = document.getElementById('periodo').value
  this.reset()
  document.getElementById('periodo').value = periodoAtual

  camposSemTrancamento.classList.remove('hidden')
})

// Atualizar a função carregarDisciplinas para incluir a inicialização das sugestões
function carregarDisciplinas() {
  const disciplinasSalvas = localStorage.getItem('disciplinas')
  if (disciplinasSalvas) {
    disciplinas = JSON.parse(disciplinasSalvas)
    // Preenche o período mais recente automaticamente se o campo estiver vazio
    const periodoInput = document.getElementById('periodo')
    if (!periodoInput.value) {
      const periodoRecente = getPeriodoMaisRecente()
      if (periodoRecente) {
        periodoInput.value = periodoRecente
      }
    }
  }
}
