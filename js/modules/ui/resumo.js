// js/modules/ui/resumo.js
import { compararPeriodos } from '../utils.js'

export function atualizarResumo(disciplinas) {
  // Filtrar disciplinas válidas para cálculos (aprovadas ou reprovadas, excluindo trancamentos e dispensadas)
  const disciplinasValidas = disciplinas.filter(
    d =>
      (d.resultado === 'AP' || d.resultado === 'RR') &&
      !d.dispensada &&
      d.natureza !== 'AC'
  )
  
  // Disciplinas aprovadas (incluindo AC e dispensadas)
  const disciplinasAprovadas = disciplinas.filter(d => d.resultado === 'AP')
  
  // Total de disciplinas cadastradas (todas as disciplinas)
  const totalDisciplinasCadastradas = disciplinas.length
  
  // Total de disciplinas para cálculo de estatísticas (excluindo AC)
  const totalDisciplinas = disciplinas.filter(
    d => !d.dispensada && d.natureza !== 'AC'
  ).length
  
  // Total de aprovações (excluindo AC)
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

  // Média geral - apenas disciplinas com nota válida (excluindo AC, dispensadas e trancamentos)
  const disciplinasComNota = disciplinas.filter(
    d => 
      d.nota !== null && 
      d.nota !== undefined && 
      !d.dispensada && 
      d.natureza !== 'AC' &&
      d.resultado !== 'TR'
  )
  
  const media = disciplinasComNota.length > 0
    ? disciplinasComNota.reduce((sum, d) => sum + d.nota, 0) / disciplinasComNota.length
    : 0

  const percentualAprovacao =
    totalDisciplinas > 0
      ? ((totalAprovacoes / totalDisciplinas) * 100).toFixed(1)
      : 0

  // Calcular indicadores de progresso e metas
  const progressoFormatura = totalCH > 0 ? Math.min((totalCH / 2400) * 100, 100) : 0
  const statusCR = getStatusCR(parseFloat(coeficienteRendimento))
  const tendenciaNotas = calcularTendenciaNotas(disciplinas)
  const previsaoFormatura = calcularPrevisaoFormatura(disciplinas, totalCH)
  
  document.getElementById('resumo').innerHTML = `
    <h2><i class="fas fa-chart-bar"></i> Resumo Geral</h2>
    <div class="resumo-container">
      <!-- Indicadores de Progresso -->
      <div class="progress-indicators">
        <div class="progress-card">
          <div class="progress-header">
            <h3><i class="fas fa-graduation-cap"></i> Progresso para Formatura</h3>
            <span class="progress-percentage">${progressoFormatura.toFixed(1)}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressoFormatura}%"></div>
          </div>
          <div class="progress-details">
            <span>${totalCH}h de 2400h cursadas</span>
            <span class="progress-remaining">${2400 - totalCH}h restantes</span>
          </div>
        </div>
        
        <div class="status-card ${statusCR.class}">
          <div class="status-icon">
            <i class="fas ${statusCR.icon}"></i>
          </div>
          <div class="status-content">
            <h3>Status Acadêmico</h3>
            <p class="status-text">${statusCR.text}</p>
            <p class="status-cr">CR: ${coeficienteRendimento}</p>
          </div>
        </div>
        
        <div class="insight-card">
          <div class="insight-header">
            <h3><i class="fas fa-lightbulb"></i> Insights</h3>
          </div>
          <div class="insight-content">
            <p class="insight-item">
              <i class="fas ${tendenciaNotas.icon}"></i>
              ${tendenciaNotas.text}
            </p>
            <p class="insight-item">
              <i class="fas fa-calendar-check"></i>
              ${previsaoFormatura}
            </p>
          </div>
        </div>
      </div>
      
      <div class="stats-cards">
        <div class="stat-card" data-tooltip="Total de disciplinas cadastradas no sistema">
          <div class="stat-icon">
            <i class="fas fa-book"></i>
          </div>
          <div class="stat-content">
            <h3>Total de Disciplinas</h3>
            <p class="stat-value">${totalDisciplinasCadastradas}</p>
            <small class="stat-subtitle">Cadastradas</small>
          </div>
        </div>

        <div class="stat-card" data-tooltip="Média aritmética de todas as notas válidas">
          <div class="stat-icon">
            <i class="fas fa-calculator"></i>
          </div>
          <div class="stat-content">
            <h3>Média Geral</h3>
            <p class="stat-value">${media.toFixed(2)}</p>
            <small class="stat-subtitle">Nota média</small>
          </div>
        </div>
        
        <div class="stat-card" data-tooltip="CR = Soma(PCH) / Soma(CH) - Peso das notas pela carga horária">
          <div class="stat-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-content">
            <h3>Coeficiente de Rendimento</h3>
            <p class="stat-value">${coeficienteRendimento}</p>
            <small class="stat-subtitle">CR ponderado</small>
          </div>
        </div>

        <div class="stat-card" data-tooltip="Total de horas cursadas em disciplinas aprovadas">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>Carga Horária Total</h3>
            <p class="stat-value">${totalCH}h</p>
            <small class="stat-subtitle">Horas cursadas</small>
          </div>
        </div>

        <div class="stat-card" data-tooltip="Total de créditos = Soma(CH/15) - Excluindo AC e dispensadas">
          <div class="stat-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-content">
            <h3>Créditos Totais</h3>
            <p class="stat-value">${somaCR.toFixed(1)}</p>
            <small class="stat-subtitle">Créditos válidos</small>
          </div>
        </div>

        <div class="stat-card" data-tooltip="PCH = Carga Horária × Nota - Produto para cálculo do CR">
          <div class="stat-icon">
            <i class="fas fa-chart-bar"></i>
          </div>
          <div class="stat-content">
            <h3>PCH (CH × Nota)</h3>
            <p class="stat-value">${somaPCH.toFixed(1)}</p>
            <small class="stat-subtitle">Produto CH×Nota</small>
          </div>
        </div>

        <div class="stat-card" data-tooltip="PCR = Créditos × Nota - Produto para análise de desempenho">
          <div class="stat-icon">
            <i class="fas fa-chart-pie"></i>
          </div>
          <div class="stat-content">
            <h3>PCR (CR × Nota)</h3>
            <p class="stat-value">${somaPCR.toFixed(1)}</p>
            <small class="stat-subtitle">Produto CR×Nota</small>
          </div>
        </div>

        <div class="stat-card" data-tooltip="Disciplinas aprovadas e percentual de aprovação">
          <div class="stat-icon success">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>Aprovações</h3>
            <p class="stat-value">${totalAprovacoes}
              <span class="stat-percentage">${percentualAprovacao}%</span>
            </p>
            <small class="stat-subtitle">Taxa de aprovação</small>
          </div>
        </div>

        <div class="stat-card" data-tooltip="Total de disciplinas reprovadas">
          <div class="stat-icon warning">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <div class="stat-content">
            <h3>Reprovações</h3>
            <p class="stat-value">${totalReprovacoes}</p>
            <small class="stat-subtitle">Disciplinas reprovadas</small>
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

// Funções auxiliares para indicadores de progresso
function getStatusCR(cr) {
  if (cr >= 8.5) {
    return {
      class: 'excellent',
      icon: 'fa-star',
      text: 'Excelente! Continue assim!'
    }
  } else if (cr >= 7.0) {
    return {
      class: 'good',
      icon: 'fa-thumbs-up',
      text: 'Bom desempenho!'
    }
  } else if (cr >= 6.0) {
    return {
      class: 'regular',
      icon: 'fa-exclamation-triangle',
      text: 'Regular. Foque nas próximas disciplinas!'
    }
  } else {
    return {
      class: 'needs-improvement',
      icon: 'fa-exclamation-circle',
      text: 'Precisa melhorar. Revise sua estratégia!'
    }
  }
}

function calcularTendenciaNotas(disciplinas) {
  const disciplinasComNota = disciplinas.filter(d => 
    d.nota !== null && 
    d.nota !== undefined && 
    !d.dispensada && 
    d.natureza !== 'AC' &&
    d.resultado !== 'TR'
  )
  
  if (disciplinasComNota.length < 2) {
    return {
      icon: 'fa-info-circle',
      text: 'Dados insuficientes para análise de tendência'
    }
  }
  
  // Ordenar por período e calcular tendência
  const disciplinasOrdenadas = [...disciplinasComNota].sort((a, b) => 
    compararPeriodos(a.periodo, b.periodo)
  )
  
  const primeirasNotas = disciplinasOrdenadas.slice(0, Math.ceil(disciplinasOrdenadas.length / 2))
  const ultimasNotas = disciplinasOrdenadas.slice(-Math.ceil(disciplinasOrdenadas.length / 2))
  
  const mediaInicial = primeirasNotas.reduce((sum, d) => sum + d.nota, 0) / primeirasNotas.length
  const mediaFinal = ultimasNotas.reduce((sum, d) => sum + d.nota, 0) / ultimasNotas.length
  
  const diferenca = mediaFinal - mediaInicial
  
  if (diferenca > 0.5) {
    return {
      icon: 'fa-arrow-up',
      text: `Tendência de melhoria! (+${diferenca.toFixed(1)} pontos)`
    }
  } else if (diferenca < -0.5) {
    return {
      icon: 'fa-arrow-down',
      text: `Tendência de queda (-${Math.abs(diferenca).toFixed(1)} pontos)`
    }
  } else {
    return {
      icon: 'fa-minus',
      text: 'Desempenho estável'
    }
  }
}

function calcularPrevisaoFormatura(disciplinas, totalCH) {
  if (totalCH === 0) {
    return 'Adicione disciplinas para calcular previsão'
  }
  
  const disciplinasComNota = disciplinas.filter(d => 
    d.nota !== null && 
    d.nota !== undefined && 
    !d.dispensada && 
    d.natureza !== 'AC' &&
    d.resultado !== 'TR'
  )
  
  if (disciplinasComNota.length === 0) {
    return 'Dados insuficientes para previsão'
  }
  
  // Calcular média de CH por semestre
  const periodos = {}
  disciplinasComNota.forEach(d => {
    if (!periodos[d.periodo]) {
      periodos[d.periodo] = { ch: 0, count: 0 }
    }
    periodos[d.periodo].ch += d.ch
    periodos[d.periodo].count++
  })
  
  const chPorSemestre = Object.values(periodos).reduce((sum, p) => sum + p.ch, 0) / Object.keys(periodos).length
  const semestresRestantes = Math.ceil((2400 - totalCH) / chPorSemestre)
  
  if (semestresRestantes <= 0) {
    return 'Você já cumpriu os requisitos de CH!'
  } else if (semestresRestantes <= 2) {
    return `Previsão: ${semestresRestantes} semestre(s) restante(s)`
  } else {
    return `Previsão: ${semestresRestantes} semestres restantes`
  }
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
