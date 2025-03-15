// js/modules/simulation/simulator.js
import { CURSOS } from '../constants.js'
import { compararPeriodos } from '../utils.js'

export class Simulator {
  constructor(disciplinasCursadas, cursoAtual) {
    this.disciplinasCursadas = disciplinasCursadas
    this.disciplinasSimuladas = []
    this.cursoAtual = cursoAtual
    this.ultimoPeriodo = this.getUltimoPeriodo()
    this.proximoPeriodo = this.calcularProximoPeriodo()
  }

  // Obtém o último período cursado
  getUltimoPeriodo() {
    if (this.disciplinasCursadas.length === 0) return null

    const periodos = this.disciplinasCursadas.map(d => d.periodo)
    return periodos.sort(compararPeriodos).pop()
  }

  // Calcula o próximo período com base no último
  calcularProximoPeriodo() {
    if (!this.ultimoPeriodo) return '2025.1' // Valor padrão se não houver disciplinas

    const [ano, semestre] = this.ultimoPeriodo.split('.')
    let novoAno = parseInt(ano)
    let novoSemestre = parseInt(semestre)

    if (novoSemestre === 2) {
      novoAno++
      novoSemestre = 1
    } else {
      novoSemestre++
    }

    return `${novoAno}.${novoSemestre}`
  }

  // Adiciona uma disciplina simulada
  adicionarDisciplinaSimulada(disciplina) {
    // Verifica se a disciplina já foi aprovada nas cursadas
    const disciplinaAprovada = this.disciplinasCursadas.find(
      d => d.codigo === disciplina.codigo && d.resultado === 'AP'
    )

    if (disciplinaAprovada) {
      throw new Error(
        `A disciplina ${disciplina.codigo} já foi cursada e aprovada!`
      )
    }

    // Verifica se já está na simulação
    const disciplinaSimulada = this.disciplinasSimuladas.find(
      d => d.codigo === disciplina.codigo
    )

    if (disciplinaSimulada) {
      throw new Error(`A disciplina ${disciplina.codigo} já está na simulação!`)
    }

    // Adiciona à simulação
    this.disciplinasSimuladas.push(disciplina)
    return this.disciplinasSimuladas
  }

  // Remove uma disciplina simulada
  removerDisciplinaSimulada(index) {
    this.disciplinasSimuladas.splice(index, 1)
    return this.disciplinasSimuladas
  }

  // Limpa todas as disciplinas simuladas
  limparSimulacao() {
    this.disciplinasSimuladas = []
    return this.disciplinasSimuladas
  }

  // Calcula o impacto no CR e na carga horária
  calcularImpacto() {
    // Disciplinas válidas para cálculo do CR (aprovadas ou reprovadas, sem dispensas e ACs)
    const disciplinasValidasCursadas = this.disciplinasCursadas.filter(
      d =>
        (d.resultado === 'AP' || d.resultado === 'RR') &&
        !d.dispensada &&
        d.natureza !== 'AC'
    )

    // Disciplinas simuladas para cálculo
    const disciplinasValidasSimuladas = this.disciplinasSimuladas.filter(
      d => d.natureza !== 'AC' && !d.dispensada
    )

    // Cálculos para disciplinas cursadas
    const somaCHCursadas = disciplinasValidasCursadas.reduce(
      (sum, d) => sum + d.ch,
      0
    )
    const somaPCHCursadas = disciplinasValidasCursadas.reduce(
      (sum, d) => sum + d.ch * d.nota,
      0
    )

    // Cálculos para disciplinas simuladas
    const somaCHSimuladas = disciplinasValidasSimuladas.reduce(
      (sum, d) => sum + d.ch,
      0
    )
    const somaPCHSimuladas = disciplinasValidasSimuladas.reduce(
      (sum, d) => sum + d.ch * d.nota,
      0
    )

    // CR atual
    const crAtual = somaCHCursadas > 0 ? somaPCHCursadas / somaCHCursadas : 0

    // CR projetado
    const crProjetado =
      somaCHCursadas + somaCHSimuladas > 0
        ? (somaPCHCursadas + somaPCHSimuladas) /
          (somaCHCursadas + somaCHSimuladas)
        : 0

    // Carga horária
    const chTotalAtual = this.disciplinasCursadas
      .filter(d => d.resultado === 'AP')
      .reduce((sum, d) => sum + d.ch, 0)

    const chTotalProjetada =
      chTotalAtual +
      this.disciplinasSimuladas
        .filter(d => d.nota >= 5 || d.resultado === 'AP')
        .reduce((sum, d) => sum + d.ch, 0)

    // Calcular horas por natureza (cursadas + simuladas)
    const horasPorNaturezaAtual = this.calcularHorasPorNatureza(
      this.disciplinasCursadas
    )
    const horasPorNaturezaSimulada = this.calcularHorasPorNatureza(
      this.disciplinasSimuladas
    )

    // Combinar as horas por natureza
    const horasPorNaturezaProjetada = { ...horasPorNaturezaAtual }
    Object.keys(horasPorNaturezaSimulada).forEach(natureza => {
      if (horasPorNaturezaProjetada[natureza]) {
        horasPorNaturezaProjetada[natureza] +=
          horasPorNaturezaSimulada[natureza]
      } else {
        horasPorNaturezaProjetada[natureza] = horasPorNaturezaSimulada[natureza]
      }
    })

    return {
      cr: {
        atual: crAtual.toFixed(2),
        projetado: crProjetado.toFixed(2),
        diferenca: (crProjetado - crAtual).toFixed(2)
      },
      cargaHoraria: {
        atual: chTotalAtual,
        projetada: chTotalProjetada,
        diferenca: chTotalProjetada - chTotalAtual
      },
      horasPorNatureza: {
        atual: horasPorNaturezaAtual,
        projetada: horasPorNaturezaProjetada
      },
      tempoRestante: this.calcularTempoRestante(horasPorNaturezaProjetada)
    }
  }

  // Calcula horas por natureza
  calcularHorasPorNatureza(disciplinas) {
    const horasPorNatureza = {}

    disciplinas
      .filter(d => d.resultado === 'AP')
      .forEach(d => {
        if (!horasPorNatureza[d.natureza]) {
          horasPorNatureza[d.natureza] = 0
        }
        horasPorNatureza[d.natureza] += d.ch
      })

    return horasPorNatureza
  }

  // Calcula o tempo restante estimado para formatura
  calcularTempoRestante(horasPorNaturezaProjetada) {
    const requisitos = CURSOS[this.cursoAtual].requisitos
    const horasFaltantes = {}
    let totalHorasFaltantes = 0

    // Calcular horas faltantes por natureza
    Object.keys(requisitos).forEach(natureza => {
      const horasRequisito = requisitos[natureza]
      const horasCompletas = horasPorNaturezaProjetada[natureza] || 0
      horasFaltantes[natureza] = Math.max(0, horasRequisito - horasCompletas)
      totalHorasFaltantes += horasFaltantes[natureza]
    })

    // Estimativa de semestres restantes (média de 300h por semestre)
    const mediaHorasPorSemestre = 300
    const semestresRestantes = Math.ceil(
      totalHorasFaltantes / mediaHorasPorSemestre
    )

    return {
      horasFaltantes,
      totalHorasFaltantes,
      semestresRestantes
    }
  }

  // Obter um array combinado de disciplinas (cursadas + simuladas)
  getDisciplinasCombinadas() {
    return [
      ...this.disciplinasCursadas,
      ...this.disciplinasSimuladas.map(d => ({
        ...d,
        simulada: true
      }))
    ]
  }
}
