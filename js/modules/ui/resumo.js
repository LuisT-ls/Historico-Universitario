// js/modules/ui/resumo.js
import { compararPeriodos } from '../utils.js'

export function atualizarResumo(disciplinas) {
  // Filtragem de disciplinas válidas (aprovadas ou reprovadas, excluindo trancamentos e dispensadas)
  const disciplinasValidas = disciplinas.filter(
    d =>
      (d.resultado === 'AP' || d.resultado === 'RR') &&
      !d.dispensada &&
      d.natureza !== 'AC'
  )
  const disciplinasAprovadas = disciplinas.filter(d => d.resultado === 'AP')
  const totalDisciplinas = disciplinas.filter(
    d => !d.dispensada && d.natureza !== 'AC'
  ).length
  const totalAprovacoes = disciplinasAprovadas.filter(
    d => !d.dispensada && d.natureza !== 'AC'
  ).length
  const totalReprovacoes = disciplinas.filter(d => d.resultado === 'RR').length
  const totalTrancamentos = disciplinas.filter(d => d.resultado === 'TR').length
  const totalDispensadas = disciplinas.filter(d => d.dispensada).length

  // Cálculos de CR, PCH e PCR excluindo disciplinas dispensadas e AC
  const somaCH = disciplinasValidas.reduce((sum, d) => sum + d.ch, 0)
  const somaPCH = disciplinasValidas.reduce((sum, d) => sum + d.ch * d.nota, 0)
  const somaCR = disciplinasValidas.reduce((sum, d) => sum + d.ch / 15, 0)
  const somaPCR = disciplinasValidas.reduce(
    (sum, d) => sum + (d.ch / 15) * d.nota,
    0
  )

  // Total CH incluindo disciplinas aprovadas (incluindo AC) e dispensadas
  const totalCH = disciplinasAprovadas.reduce((sum, d) => sum + d.ch, 0)

  // Coeficiente de Rendimento (CR) - excluindo dispensadas e AC
  const coeficienteRendimento = somaCH > 0 ? (somaPCH / somaCH).toFixed(2) : 0

  // Média geral - excluindo dispensadas e AC
  const media =
    disciplinasValidas.length > 0
      ? disciplinasValidas.reduce((sum, d) => sum + d.nota, 0) /
        disciplinasValidas.length
      : 0

  const percentualAprovacao =
    totalDisciplinas > 0
      ? ((totalAprovacoes / totalDisciplinas) * 100).toFixed(1)
      : 0

  document.getElementById('resumo').innerHTML = `
    <h2><i class="fas fa-chart-bar"></i> Resumo Geral</h2>
    <div class="resumo-container">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-calculator"></i>
          </div>
          <div class="stat-content">
            <h3>Média Geral</h3>
            <p class="stat-value">${media.toFixed(2)}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-content">
            <h3>Coeficiente de Rendimento</h3>
            <p class="stat-value">${coeficienteRendimento}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>Carga Horária Total</h4>
            <p class="stat-value">${totalCH}h</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-content">
            <h3>Créditos Totais</h3>
            <p class="stat-value">${somaCR.toFixed(1)}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-chart-bar"></i>
          </div>
          <div class="stat-content">
            <h3>PCH (CH × Nota)</h3>
            <p class="stat-value">${somaPCH.toFixed(1)}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-chart-pie"></i>
          </div>
          <div class="stat-content">
            <h3>PCR (CR × Nota)</h3>
            <p class="stat-value">${somaPCR.toFixed(1)}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon success">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>Aprovações</h3>
            <p class="stat-value">${totalAprovacoes}
              <span class="stat-percentage">${percentualAprovacao}%</span>
            </p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon warning">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <div class="stat-content">
            <h3>Reprovações</h3>
            <p class="stat-value">${totalReprovacoes}</p>
          </div>
        </div>
      </div>

    <div class="chart-section">
      <div class="chart-container">
        <div class="chart-header">
          <h3><i class="fas fa-chart-bar"></i> Progresso por Semestre</h3>
          <div class="chart-actions">
            <button class="chart-toggle active" data-chart="bar" aria-label="Alternar para gráfico de barras">
              <i class="fas fa-chart-bar"></i>
            </button>
            <button class="chart-toggle" data-chart="line" aria-label="Alternar para gráfico de linhas">
              <i class="fas fa-chart-line"></i>
            </button>
          </div>
        </div>
        <div class="chart-wrapper">
          <canvas id="progressoChart"></canvas>
        </div>
      </div>
    </div>
  </div>
`

  const chart = criarGraficoProgresso(disciplinas)

  // Configuração de eventos para os botões de toggle
  const toggleButtons = document.querySelectorAll('.chart-toggle')
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      toggleButtons.forEach(btn => btn.classList.remove('active'))
      button.classList.add('active')

      if (button.dataset.chart === 'bar') {
        chart.config.type = 'bar'
      } else {
        chart.config.type = 'line'
      }
      chart.update()
    })
  })
}

function criarGraficoProgresso(disciplinas) {
  const periodos = {}

  // Primeiro, ordena as disciplinas por período
  const disciplinasOrdenadas = [...disciplinas].sort((a, b) =>
    compararPeriodos(a.periodo, b.periodo)
  )

  // Depois, agrupa os dados
  disciplinasOrdenadas.forEach(d => {
    if (!periodos[d.periodo]) {
      periodos[d.periodo] = { total: 0, aprovadas: 0 }
    }
    if (!d.dispensada) {
      // Não conta disciplinas dispensadas no gráfico
      periodos[d.periodo].total++
      if (d.resultado === 'AP') periodos[d.periodo].aprovadas++
    }
  })

  const labels = Object.keys(periodos)
  const data = {
    aprovadas: labels.map(p => periodos[p].aprovadas),
    total: labels.map(p => periodos[p].total)
  }

  const ctx = document.getElementById('progressoChart').getContext('2d')
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Aprovadas',
          data: data.aprovadas,
          backgroundColor: 'rgba(46, 213, 115, 0.8)',
          borderColor: 'rgba(46, 213, 115, 1)',
          borderWidth: 2
        },
        {
          label: 'Total de Disciplinas',
          data: data.total,
          backgroundColor: 'rgba(54, 162, 235, 0.4)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })
}
