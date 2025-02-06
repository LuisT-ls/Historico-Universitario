// js/modules/ui/resumo.js
import { compararPeriodos } from '../utils.js'

export function atualizarResumo(disciplinas) {
  const disciplinasAprovadas = disciplinas.filter(d => d.resultado === 'AP')
  const totalDisciplinas = disciplinas.length
  const totalAprovacoes = disciplinasAprovadas.length
  const totalReprovacoes = disciplinas.filter(d => d.resultado === 'RR').length
  const totalTrancamentos = disciplinas.filter(d => d.resultado === 'TR').length

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
        ${gerarProgressoPorPeriodo(disciplinas)}
      </div>
    </div>
  `
}

function gerarProgressoPorPeriodo(disciplinas) {
  const disciplinasPorPeriodo = {}
  disciplinas.forEach(d => {
    if (!disciplinasPorPeriodo[d.periodo]) {
      disciplinasPorPeriodo[d.periodo] = { total: 0, aprovadas: 0 }
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
