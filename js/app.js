// js/app.js
import { REQUISITOS, TOTAL_HORAS_NECESSARIAS } from './modules/constants.js'
import { carregarDisciplinas, salvarDisciplinas } from './modules/storage.js'
import { atualizarTabela } from './modules/ui/table.js'
import { atualizarResumo } from './modules/ui/resumo.js'
import { atualizarRequisitos } from './modules/ui/requisitos.js'
import { setupFormHandlers } from './modules/ui/formHandler.js'
import { getPeriodoMaisRecente } from './modules/utils.js'
import { setupFilterComponent } from './modules/ui/filter.js'

class App {
  constructor() {
    this.disciplinas = []
    this.init()
  }

  init() {
    this.disciplinas = carregarDisciplinas()
    setupFilterComponent()

    // Add this line to set initial period
    const periodoInput = document.getElementById('periodo')
    const periodoRecente = getPeriodoMaisRecente(this.disciplinas)
    if (!periodoInput.value && periodoRecente) {
      periodoInput.value = periodoRecente
    }

    this.setupEventListeners()
    this.atualizarTudo()
  }

  setupEventListeners() {
    setupFormHandlers(this.disciplinas, {
      onSubmit: () => {
        salvarDisciplinas(this.disciplinas)
        this.atualizarTudo()
      }
    })

    // Make removerDisciplina accessible globally
    window.app = {
      removerDisciplina: this.removerDisciplina.bind(this)
    }
  }

  removerDisciplina(index) {
    this.disciplinas.splice(index, 1)
    salvarDisciplinas(this.disciplinas)
    this.atualizarTudo()
  }

  atualizarTudo() {
    atualizarTabela(this.disciplinas, this.removerDisciplina.bind(this))
    atualizarResumo(this.disciplinas)
    atualizarRequisitos(this.disciplinas, REQUISITOS, TOTAL_HORAS_NECESSARIAS)
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App()
})
