// js/app.js
import { CURSOS } from './modules/constants.js'
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
    this.cursoAtual = 'BICTI' // valor padrão
    this.init()
  }

  init() {
    this.setupCursoSelector()
    this.carregarDisciplinasDoCurso()
    setupFilterComponent()

    const periodoInput = document.getElementById('periodo')
    const periodoRecente = getPeriodoMaisRecente(this.disciplinas)
    if (!periodoInput.value && periodoRecente) {
      periodoInput.value = periodoRecente
    }

    this.setupEventListeners()
    this.atualizarTudo()
  }

  setupCursoSelector() {
    const cursoSelect = document.getElementById('curso')
    cursoSelect.addEventListener('change', e => {
      this.cursoAtual = e.target.value
      this.carregarDisciplinasDoCurso()
      this.atualizarTudo()
    })
  }

  carregarDisciplinasDoCurso() {
    this.disciplinas = carregarDisciplinas(this.cursoAtual)
  }

  setupEventListeners() {
    setupFormHandlers(this.disciplinas, {
      onSubmit: () => {
        salvarDisciplinas(this.disciplinas, this.cursoAtual)
        this.atualizarTudo()
      }
    })

    window.app = {
      removerDisciplina: this.removerDisciplina.bind(this)
    }
  }

  removerDisciplina(index) {
    this.disciplinas.splice(index, 1)
    salvarDisciplinas(this.disciplinas, this.cursoAtual)
    this.atualizarTudo()
  }

  atualizarTudo() {
    const cursoConfig = CURSOS[this.cursoAtual]
    atualizarTabela(this.disciplinas, this.removerDisciplina.bind(this))
    atualizarResumo(this.disciplinas)
    atualizarRequisitos(
      this.disciplinas,
      cursoConfig.requisitos,
      cursoConfig.totalHoras
    )

    document.getElementById('metaTotal').textContent = cursoConfig.totalHoras
    document.getElementById('totalFalta').textContent =
      cursoConfig.totalHoras -
      this.disciplinas.reduce((total, disc) => total + (disc.ch || 0), 0)

    // Atualizar o select de natureza baseado no curso
    this.atualizarOpcoesNatureza()
  }

  atualizarOpcoesNatureza() {
    const naturezaSelect = document.getElementById('natureza')
    const naturezasDisponiveis = Object.keys(CURSOS[this.cursoAtual].requisitos)

    // Limpar opções existentes
    naturezaSelect.innerHTML = ''

    // Adicionar apenas as naturezas relevantes para o curso
    const naturezaLabels = {
      AC: 'AC - Atividade Complementar',
      LV: 'LV - Componente Livre',
      OB: 'OB - Obrigatória',
      OG: 'OG - Optativa da Grande Área',
      OH: 'OH - Optativa Humanística',
      OP: 'OP - Optativa',
      OX: 'OX - Optativa de Extensão',
      OZ: 'OZ - Optativa Artística'
    }

    naturezasDisponiveis.forEach(natureza => {
      const option = document.createElement('option')
      option.value = natureza
      option.textContent = naturezaLabels[natureza]
      naturezaSelect.appendChild(option)
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App()
})
