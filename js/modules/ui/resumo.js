// js/modules/ui/resumo.js
import { compararPeriodos } from '../utils.js'

export function atualizarResumo(disciplinas) {
  const disciplinasAprovadas = disciplinas.filter(d => d.resultado === 'AP')
  const totalDisciplinas = disciplinas.length
  const totalAprovacoes = disciplinasAprovadas.length
  const totalReprovacoes = disciplinas.filter(d => d.resultado === 'RR').length
  const totalTrancamentos = disciplinas.filter(d => d.resultado === 'TR').length

  // Cálculos de CR, PCH e PCR
  const somaCH = disciplinasAprovadas.reduce((sum, d) => sum + d.ch, 0)
  const somaPCH = disciplinasAprovadas.reduce(
    (sum, d) => sum + d.ch * d.nota,
    0
  )
  const somaCR = disciplinasAprovadas.reduce((sum, d) => sum + d.ch / 15, 0) // CR = CH/15
  const somaPCR = disciplinasAprovadas.reduce(
    (sum, d) => sum + (d.ch / 15) * d.nota,
    0
  )

  // Coeficiente de Rendimento (CR)
  const coeficienteRendimento = somaCH > 0 ? (somaPCH / somaCH).toFixed(2) : 0

  const media =
    disciplinasAprovadas.length > 0
      ? disciplinasAprovadas.reduce((sum, d) => sum + d.nota, 0) /
        disciplinasAprovadas.length
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
            <h4>Média Geral</h4>
            <p class="stat-value">${media.toFixed(2)}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-content">
            <h4>Coeficiente de Rendimento</h4>
            <p class="stat-value">${coeficienteRendimento}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h4>Carga Horária Total</h4>
            <p class="stat-value">${somaCH}h</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-content">
            <h4>Créditos Totais</h4>
            <p class="stat-value">${somaCR.toFixed(1)}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-chart-bar"></i>
          </div>
          <div class="stat-content">
            <h4>PCH (CH × Nota)</h4>
            <p class="stat-value">${somaPCH.toFixed(1)}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-chart-pie"></i>
          </div>
          <div class="stat-content">
            <h4>PCR (CR × Nota)</h4>
            <p class="stat-value">${somaPCR.toFixed(1)}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon success">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h4>Aprovações</h4>
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
            <h4>Reprovações</h4>
            <p class="stat-value">${totalReprovacoes}</p>
          </div>
        </div>
      </div>

      <div class="chart-section">
        <div class="chart-container">
          <div class="chart-header">
            <h3><i class="fas fa-chart-bar"></i> Progresso por Semestre</h3>
            <div class="chart-actions">
              <button class="chart-toggle active" data-chart="bar">
                <i class="fas fa-chart-bar"></i>
              </button>
              <button class="chart-toggle" data-chart="line">
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
  disciplinas
    .sort((a, b) => compararPeriodos(a.periodo, b.periodo))
    .forEach(d => {
      if (!periodos[d.periodo]) {
        periodos[d.periodo] = { total: 0, aprovadas: 0 }
      }
      periodos[d.periodo].total++
      if (d.resultado === 'AP') periodos[d.periodo].aprovadas++
    })

  const labels = Object.keys(periodos)
  const data = {
    aprovadas: labels.map(p => periodos[p].aprovadas),
    total: labels.map(p => periodos[p].total)
  }

  return new Chart(document.getElementById('progressoChart'), {
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
        title: {
          display: false
        },
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#333',
          bodyColor: '#666',
          borderColor: '#ddd',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: {
              size: 12
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12
            }
          }
        }
      }
    }
  })
}
