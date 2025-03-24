// js/modules/ui/simulation-ui.js
import { Simulator } from '../simulation/simulator.js'
import { atualizarTabela } from './table.js'
import { atualizarResumo } from './resumo.js'
import { atualizarRequisitos } from './requisitos.js'
import { CURSOS } from '../constants.js'
import { smoothScrollToElement } from './animation-helper.js'

// Caminho para o arquivo JSON de disciplinas
const DISCIPLINAS_CATALOG_PATH = '/assets/data/disciplinas.json'

export class SimulationUI {
  constructor(app) {
    this.app = app
    this.simulator = null
    this.isSimulationMode = false
    this.disciplinaCatalog = []
    this.init()
    this.carregarCatalogoDisciplinas()
  }

  init() {
    // Inicializa o simulador
    this.simulator = new Simulator(this.app.disciplinas, this.app.cursoAtual)

    // Cria o container de simulação (inicialmente oculto)
    this.createSimulationContainer()

    // Adiciona o botão para ativar o modo de simulação
    this.addSimulationButton()

    // Configuração de eventos
    this.setupEventListeners()
  }

  // Cria o container principal da simulação
  createSimulationContainer() {
    const contentContainer = document.querySelector('.content-container')

    // Verifica se o container já existe
    if (document.getElementById('simulation-container')) {
      return
    }

    const simulationContainer = document.createElement('div')
    simulationContainer.id = 'simulation-container'
    simulationContainer.className = 'simulation-container'
    simulationContainer.style.display = 'none'

    simulationContainer.innerHTML = `
      <div class="simulation-header">
        <h2><i class="fas fa-flask"></i> Simulador "E se?"</h2>
        <div class="simulation-actions">
          <button id="close-simulation" class="btn-action">
            <i class="fas fa-times"></i> Fechar
          </button>
        </div>
      </div>
      
      <div class="simulation-content">
        <div class="simulation-form-container">
          <h3><i class="fas fa-plus-circle"></i> Adicionar Disciplina Simulada</h3>
          <form id="simulationForm">
            <div class="form-row">
              <div class="form-group">
                <label for="sim-periodo">
                  <i class="fas fa-calendar-alt"></i> Semestre:
                </label>
                <input type="text" id="sim-periodo" required placeholder="Ex: 2024.1">
              </div>
              
              <div class="form-group">
                <label for="sim-codigo">
                  <i class="fas fa-hashtag"></i> Código:
                </label>
                <input type="text" id="sim-codigo" required placeholder="Ex: CTIA01">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="sim-nome">
                  <i class="fas fa-book"></i> Nome da Disciplina:
                </label>
                <input type="text" id="sim-nome" required placeholder="Ex: Introdução a Computação">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="sim-natureza">
                  <i class="fas fa-tasks"></i> Natureza:
                </label>
                <select id="sim-natureza" required></select>
              </div>
              
              <div class="form-group">
                <label for="sim-ch">
                  <i class="fas fa-clock"></i> Carga Horária:
                </label>
                <input type="number" id="sim-ch" required placeholder="Ex: 60">
              </div>
              
              <div class="form-group">
                <label for="sim-nota">
                  <i class="fas fa-star"></i> Nota Esperada:
                </label>
                <input type="number" id="sim-nota" step="0.1" min="0" max="10" required placeholder="Ex: 7.0">
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-primary">
                <i class="fas fa-plus-circle"></i> Adicionar à Simulação
              </button>
              <button type="button" id="clear-simulation" class="btn-secondary">
                <i class="fas fa-trash"></i> Limpar Simulação
              </button>
            </div>
          </form>
        </div>
        
        <div class="simulation-results">
          <div class="impact-cards">
            <div class="impact-card">
              <h4><i class="fas fa-chart-line"></i> CR</h4>
              <div class="impact-values">
                <div class="impact-value">
                  <span class="label">Atual:</span>
                  <span id="cr-atual" class="value">0.00</span>
                </div>
                <div class="impact-value">
                  <span class="label">Projetado:</span>
                  <span id="cr-projetado" class="value">0.00</span>
                </div>
                <div class="impact-value">
                  <span class="label">Diferença:</span>
                  <span id="cr-diferenca" class="value">0.00</span>
                </div>
              </div>
            </div>
            
            <div class="impact-card">
              <h4><i class="fas fa-clock"></i> Carga Horária</h4>
              <div class="impact-values">
                <div class="impact-value">
                  <span class="label">Atual:</span>
                  <span id="ch-atual" class="value">0h</span>
                </div>
                <div class="impact-value">
                  <span class="label">Projetada:</span>
                  <span id="ch-projetada" class="value">0h</span>
                </div>
                <div class="impact-value">
                  <span class="label">Diferença:</span>
                  <span id="ch-diferenca" class="value">0h</span>
                </div>
              </div>
            </div>
            
            <div class="impact-card">
              <h4><i class="fas fa-graduation-cap"></i> Tempo Estimado</h4>
              <div class="impact-values">
                <div class="impact-value">
                  <span class="label">Horas Faltantes:</span>
                  <span id="horas-faltantes" class="value">0h</span>
                </div>
                <!-- O detalhe das horas faltantes será inserido aqui pelo JS -->
                <div class="impact-value">
                  <span class="label">Semestres Restantes:</span>
                  <span id="semestres-restantes" class="value">0</span>
                </div>
                <div class="impact-value">
                  <span class="label">Previsão de Formatura:</span>
                  <span id="previsao-formatura" class="value">-</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="simulation-table-container">
            <h3><i class="fas fa-list-alt"></i> Disciplinas Simuladas</h3>
            <table id="simulationTable" class="data-table">
              <thead>
                <tr>
                  <th><i class="fas fa-calendar"></i> Semestre</th>
                  <th><i class="fas fa-hashtag"></i> Código</th>
                  <th><i class="fas fa-book"></i> Disciplina</th>
                  <th><i class="fas fa-clock"></i> CH</th>
                  <th><i class="fas fa-tag"></i> NT</th>
                  <th><i class="fas fa-star"></i> Nota</th>
                  <th><i class="fas fa-check-circle"></i> RES</th>
                  <th><i class="fas fa-cogs"></i> Ações</th>
                </tr>
              </thead>
              <tbody id="simulationBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `

    contentContainer.appendChild(simulationContainer)
  }

  // Adiciona o botão de ativar simulação
  addSimulationButton() {
    const container = document.querySelector('.form-container')

    // Verifica se o botão já existe
    if (document.getElementById('activate-simulation')) {
      return
    }

    const simulationButton = document.createElement('button')
    simulationButton.id = 'activate-simulation'
    simulationButton.className = 'btn-simulation'
    simulationButton.innerHTML =
      '<i class="fas fa-flask"></i> Simulador "E se?"'

    container.appendChild(simulationButton)
  }

  // Configura os eventos
  setupEventListeners() {
    // Ativa o simulador
    document
      .getElementById('activate-simulation')
      .addEventListener('click', e => {
        e.preventDefault()
        this.toggleSimulationMode()

        // Adiciona animação de scroll suave até o simulador com destaque
        setTimeout(() => {
          const simulationContainer = document.getElementById(
            'simulation-container'
          )
          smoothScrollToElement(simulationContainer, {
            offset: 30,
            highlightClass: 'simulator-highlight',
            highlightDuration: 1500
          })
        }, 200) // Pequeno atraso para garantir que o container já está visível
      })

    // Fecha o simulador
    document
      .getElementById('close-simulation')
      .addEventListener('click', () => {
        this.toggleSimulationMode()

        // Scroll de volta para o topo do formulário
        setTimeout(() => {
          const formContainer = document.querySelector('.form-container')
          smoothScrollToElement(formContainer, {
            highlightEffect: false
          })
        }, 100)
      })

    // Adiciona disciplina à simulação
    document.getElementById('simulationForm').addEventListener('submit', e => {
      e.preventDefault()
      this.adicionarDisciplinaSimulada()

      // Scroll para a tabela de simulação após adicionar
      setTimeout(() => {
        const simulationTable = document.querySelector(
          '.simulation-table-container'
        )
        smoothScrollToElement(simulationTable, {
          offset: 100,
          highlightEffect: false
        })
      }, 300)
    })

    // Limpa a simulação
    document
      .getElementById('clear-simulation')
      .addEventListener('click', () => {
        this.limparSimulacao()
      })

    // Preenche o select de natureza
    this.updateNaturezaOptions()

    // Preenche o período com o próximo semestre
    document.getElementById('sim-periodo').value = this.simulator.proximoPeriodo
  }

  // Carrega o catálogo de disciplinas do arquivo JSON
  async carregarCatalogoDisciplinas() {
    try {
      const response = await fetch(DISCIPLINAS_CATALOG_PATH)
      if (!response.ok) {
        throw new Error('Falha ao carregar o catálogo de disciplinas')
      }

      const data = await response.json()
      this.disciplinaCatalog = data

      // Adicionar sugestões de disciplinas ao formulário
      this.setupDisciplinaSuggestions()
    } catch (error) {
      console.error('Erro ao carregar catálogo de disciplinas:', error)
    }
  }

  // Configura sugestões de disciplinas nos campos do formulário
  setupDisciplinaSuggestions() {
    const codigoInput = document.getElementById('sim-codigo')
    const nomeInput = document.getElementById('sim-nome')
    const naturezaSelect = document.getElementById('sim-natureza')
    const chInput = document.getElementById('sim-ch')

    // Autocomplete para o código da disciplina
    codigoInput.addEventListener('input', () => {
      const codigo = codigoInput.value.toUpperCase()

      if (codigo.length >= 2) {
        const disciplinasAtivas =
          this.disciplinaCatalog[this.app.cursoAtual] || []
        const disciplinaEncontrada = disciplinasAtivas.find(
          d => d.codigo === codigo
        )

        if (disciplinaEncontrada) {
          nomeInput.value = disciplinaEncontrada.nome
          naturezaSelect.value = disciplinaEncontrada.natureza

          // Tenta encontrar a carga horária típica para este código
          const disciplinaCursada = this.app.disciplinas.find(
            d => d.codigo === codigo
          )
          if (disciplinaCursada) {
            chInput.value = disciplinaCursada.ch
          } else {
            // Valores padrão comuns
            if (codigo.includes('CTIA')) {
              chInput.value = 60
            } else if (codigo.includes('MAT')) {
              chInput.value = 102
            } else {
              chInput.value = 60 // valor padrão
            }
          }
        }
      }
    })

    // Autocomplete para o nome da disciplina
    nomeInput.addEventListener('input', () => {
      const nome = nomeInput.value.toUpperCase()

      if (nome.length >= 3) {
        const disciplinasAtivas =
          this.disciplinaCatalog[this.app.cursoAtual] || []
        const disciplinaEncontrada = disciplinasAtivas.find(d =>
          d.nome.toUpperCase().includes(nome)
        )

        if (disciplinaEncontrada) {
          codigoInput.value = disciplinaEncontrada.codigo
          naturezaSelect.value = disciplinaEncontrada.natureza

          // Busca por carga horária
          const disciplinaCursada = this.app.disciplinas.find(
            d => d.codigo === disciplinaEncontrada.codigo
          )
          if (disciplinaCursada) {
            chInput.value = disciplinaCursada.ch
          }
        }
      }
    })
  }

  // Atualiza as opções de natureza baseado no curso atual
  updateNaturezaOptions() {
    const naturezaSelect = document.getElementById('sim-natureza')
    const naturezasDisponiveis = Object.keys(
      CURSOS[this.app.cursoAtual].requisitos
    )

    // Limpar opções existentes
    naturezaSelect.innerHTML = ''

    // Adicionar naturezas disponíveis para o curso
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

  // Alterna entre modo normal e simulação
  toggleSimulationMode() {
    this.isSimulationMode = !this.isSimulationMode

    // Atualiza o simulador com as disciplinas atuais
    this.simulator = new Simulator(this.app.disciplinas, this.app.cursoAtual)

    // Atualiza UI
    const simulationContainer = document.getElementById('simulation-container')
    const contentContainer = document.querySelector('.content-container')

    if (this.isSimulationMode) {
      simulationContainer.style.display = 'block'
      contentContainer.classList.add('simulation-active')
      this.atualizarSimulacao()
    } else {
      simulationContainer.style.display = 'none'
      contentContainer.classList.remove('simulation-active')
      this.app.atualizarTudo()
    }
  }

  // Adiciona uma disciplina ao simulador
  adicionarDisciplinaSimulada() {
    try {
      const disciplina = {
        periodo: document.getElementById('sim-periodo').value,
        codigo: document.getElementById('sim-codigo').value,
        nome: document.getElementById('sim-nome').value,
        natureza: document.getElementById('sim-natureza').value,
        ch: parseInt(document.getElementById('sim-ch').value),
        nota: parseFloat(document.getElementById('sim-nota').value),
        resultado:
          parseFloat(document.getElementById('sim-nota').value) >= 5
            ? 'AP'
            : 'RR',
        trancamento: false,
        dispensada: false
      }

      this.simulator.adicionarDisciplinaSimulada(disciplina)
      this.atualizarSimulacao()

      // Limpa o formulário mas mantém o período
      const periodoAtual = document.getElementById('sim-periodo').value
      document.getElementById('simulationForm').reset()
      document.getElementById('sim-periodo').value = periodoAtual

      // Exibe mensagem de sucesso
      this.showNotification(
        `Disciplina ${disciplina.codigo} adicionada à simulação com sucesso!`
      )
    } catch (error) {
      this.showNotification(error.message, 'error')
    }
  }

  // Remove uma disciplina da simulação
  removerDisciplinaSimulada(index) {
    this.simulator.removerDisciplinaSimulada(index)
    this.atualizarSimulacao()
  }

  // Limpa toda a simulação
  limparSimulacao() {
    if (this.simulator.disciplinasSimuladas.length === 0) {
      this.showNotification('Não há disciplinas para remover da simulação!')
      return
    }

    this.simulator.limparSimulacao()
    this.atualizarSimulacao()
    this.showNotification('Todas as disciplinas foram removidas da simulação!')
  }

  // Atualiza a interface da simulação
  atualizarSimulacao() {
    this.atualizarTabelaSimulacao()
    this.atualizarImpactoSimulacao()
  }

  // Atualiza a tabela de disciplinas simuladas
  atualizarTabelaSimulacao() {
    const tbody = document.getElementById('simulationBody')
    tbody.innerHTML = ''

    if (this.simulator.disciplinasSimuladas.length === 0) {
      const tr = document.createElement('tr')
      tr.innerHTML =
        '<td colspan="8" class="empty-message">Nenhuma disciplina adicionada à simulação</td>'
      tbody.appendChild(tr)
      return
    }

    this.simulator.disciplinasSimuladas.forEach((disc, index) => {
      const tr = document.createElement('tr')
      tr.className = disc.nota >= 5 ? 'simulada-aprovada' : 'simulada-reprovada'

      tr.innerHTML = `
        <td>${disc.periodo}</td>
        <td>${disc.codigo}</td>
        <td>${disc.nome}</td>
        <td>${disc.ch}</td>
        <td>${disc.natureza}</td>
        <td>${disc.nota.toFixed(1)}</td>
        <td>${disc.resultado}</td>
        <td>
          <button class="remover" onclick="window.app.simulation.removerDisciplinaSimulada(${index})">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `

      tbody.appendChild(tr)
    })
  }

  // Atualiza os cards de impacto da simulação
  atualizarImpactoSimulacao() {
    const impacto = this.simulator.calcularImpacto()

    // Atualiza CR
    document.getElementById('cr-atual').textContent = impacto.cr.atual
    document.getElementById('cr-projetado').textContent = impacto.cr.projetado

    const crDiferenca = document.getElementById('cr-diferenca')
    crDiferenca.textContent = impacto.cr.diferenca
    crDiferenca.className =
      'value ' +
      (parseFloat(impacto.cr.diferenca) >= 0 ? 'positive' : 'negative')

    // Atualiza Carga Horária
    document.getElementById(
      'ch-atual'
    ).textContent = `${impacto.cargaHoraria.atual}h`
    document.getElementById(
      'ch-projetada'
    ).textContent = `${impacto.cargaHoraria.projetada}h`
    document.getElementById(
      'ch-diferenca'
    ).textContent = `${impacto.cargaHoraria.diferenca}h`

    // Atualiza Tempo Estimado
    document.getElementById(
      'horas-faltantes'
    ).textContent = `${impacto.tempoRestante.totalHorasFaltantes}h`

    // Exibição de semestres restantes
    const semestresRestantesEl = document.getElementById('semestres-restantes')
    if (typeof impacto.tempoRestante.semestresRestantes === 'object') {
      // Se for um intervalo de semestres (min a max)
      semestresRestantesEl.textContent = `${impacto.tempoRestante.semestresRestantes.min} a ${impacto.tempoRestante.semestresRestantes.max}`
    } else {
      // Se for um único valor
      semestresRestantesEl.textContent =
        impacto.tempoRestante.semestresRestantes
    }

    // Adicionar informação sobre o cálculo - 5-6 disciplinas por semestre
    this.atualizarInfoCalculoSemestres(impacto.tempoRestante)

    // Calcula a previsão de formatura
    const previsao = this.calcularPrevisaoFormatura(
      // Usando o valor máximo para previsão mais conservadora
      typeof impacto.tempoRestante.semestresRestantes === 'object'
        ? impacto.tempoRestante.semestresRestantes.max
        : impacto.tempoRestante.semestresRestantes
    )
    document.getElementById('previsao-formatura').textContent = previsao

    // Exibe detalhes das horas faltantes por natureza
    this.mostrarDetalheHorasFaltantes(impacto.tempoRestante.horasFaltantes)
  }

  // Método para mostrar informações sobre o cálculo de semestres
  atualizarInfoCalculoSemestres(tempoRestante) {
    // Verificar se o elemento já existe
    let infoElement = document.getElementById('info-calculo-semestres')

    if (!infoElement) {
      // Criar o elemento se não existir
      infoElement = document.createElement('div')
      infoElement.id = 'info-calculo-semestres'
      infoElement.className = 'info-calculo'

      // Inserir após o elemento de semestres restantes
      const semestresEl = document
        .getElementById('semestres-restantes')
        .closest('.impact-value')
      semestresEl.parentNode.insertBefore(infoElement, semestresEl.nextSibling)
    }

    // Atualizar o conteúdo
    const minDisc = tempoRestante.disciplinasPorSemestre?.min || 5
    const maxDisc = tempoRestante.disciplinasPorSemestre?.max || 6
    const minHoras = tempoRestante.horasPorSemestre?.min || minDisc * 60
    const maxHoras = tempoRestante.horasPorSemestre?.max || maxDisc * 60

    infoElement.innerHTML = `
    <div class="info-text">
      <i class="fas fa-info-circle"></i> 
      Baseado em ${minDisc}-${maxDisc} disciplinas por semestre (${minHoras}-${maxHoras}h)
    </div>
  `
  }

  // Exibe detalhes das horas faltantes por natureza
  mostrarDetalheHorasFaltantes(horasFaltantes) {
    // Primeiro, verificamos se já existe o elemento para os detalhes de horas faltantes
    let detalhesContainer = document.getElementById('horas-faltantes-detalhes')

    // Se não existir, criamos
    if (!detalhesContainer) {
      detalhesContainer = document.createElement('div')
      detalhesContainer.id = 'horas-faltantes-detalhes'
      detalhesContainer.className = 'horas-faltantes-detalhes'

      // Encontramos o elemento "Horas Faltantes" para inserir abaixo dele
      const horasFaltantesEl = document
        .getElementById('horas-faltantes')
        .closest('.impact-value')
      horasFaltantesEl.parentNode.insertBefore(
        detalhesContainer,
        horasFaltantesEl.nextSibling
      )
    }

    // Naturezas de disciplinas e seus rótulos amigáveis
    const naturezaLabels = {
      AC: 'Atividades Complementares',
      LV: 'Componentes Livres',
      OB: 'Obrigatórias',
      OG: 'Optativas da Grande Área',
      OH: 'Optativas Humanísticas',
      OP: 'Optativas',
      OX: 'Optativas de Extensão',
      OZ: 'Optativas Artísticas'
    }

    // Criamos o conteúdo HTML para o detalhamento
    let html = '<div class="detalhes-header">Detalhamento por natureza:</div>'

    // Filtramos para mostrar apenas naturezas que ainda têm horas faltantes
    const naturezasComFalta = Object.entries(horasFaltantes)
      .filter(([_, horas]) => horas > 0)
      .sort(([_, horasA], [__, horasB]) => horasB - horasA) // Ordena por quantidade de horas (maior primeiro)

    if (naturezasComFalta.length === 0) {
      html +=
        '<div class="sem-pendencias">Parabéns! Não há pendências de carga horária.</div>'
    } else {
      naturezasComFalta.forEach(([natureza, horas]) => {
        const label = naturezaLabels[natureza] || natureza
        html += `
          <div class="natureza-item">
            <span class="natureza-tipo">${natureza} - ${label}:</span>
            <span class="natureza-horas">${horas}h</span>
          </div>
        `
      })
    }

    detalhesContainer.innerHTML = html
  }

  // Calcula a previsão de formatura
  calcularPrevisaoFormatura(semestresRestantes) {
    if (semestresRestantes <= 0) return 'Pronto para formar!'

    // Pega o próximo período como base
    const [ano, semestre] = this.simulator.proximoPeriodo.split('.')
    let anoFinal = parseInt(ano)
    let semestreFinal = parseInt(semestre)

    // Avança os semestres
    for (let i = 0; i < semestresRestantes; i++) {
      if (semestreFinal === 2) {
        anoFinal++
        semestreFinal = 1
      } else {
        semestreFinal++
      }
    }

    return `${anoFinal}.${semestreFinal}`
  }

  // Exibe notificação
  showNotification(message, type = 'success') {
    // Verifica se o elemento já existe
    let popup = document.querySelector('.simulation-notification')

    if (!popup) {
      popup = document.createElement('div')
      popup.className = 'simulation-notification'
      document.body.appendChild(popup)
    }

    popup.textContent = message
    popup.className = `simulation-notification ${type}`
    popup.classList.add('show')

    setTimeout(() => {
      popup.classList.remove('show')
    }, 3000)
  }
}
