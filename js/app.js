// js/app.js
import { CURSOS } from './modules/constants.js'
import { carregarDisciplinas, salvarDisciplinas } from './modules/storage.js'
import { atualizarTabela } from './modules/ui/table.js'
import { atualizarResumo } from './modules/ui/resumo.js'
import { atualizarRequisitos } from './modules/ui/requisitos.js'
import { setupFormHandlers } from './modules/ui/formHandler.js'
import { getPeriodoMaisRecente } from './modules/utils.js'
import { setupFilterComponent } from './modules/ui/filter.js'
import { inicializarEmenta } from './modules/ui/ementa.js'
import { setupDateTime } from './modules/ui/datetime.js'
import DarkModeManager from './modules/ui/darkmode.js'
import { SimulationUI } from './modules/ui/simulation-ui.js'
import { csrfProtection } from './modules/security/firebase-csrf.js'
import { setupExportButton } from './modules/ui/export.js'
import { setupCleanTableButton } from './modules/ui/cleanTable.js'
import { setupTableHeader } from './modules/ui/tableHeader.js'
// import { initializeHistoricoImporter } from './modules/historico-importer.js'

class App {
  constructor() {
    this.disciplinas = []
    this.cursoAtual = 'BICTI' // valor padrão
    csrfProtection.init()
    this.darkModeManager = new DarkModeManager()
    this.simulation = null
    this.init()
  }

  async init() {
    this.setupCursoSelector()
    await this.carregarDisciplinasDoCurso()
    setupFilterComponent()
    setupDateTime()
    inicializarEmenta()
    setupExportButton()
    setupCleanTableButton()
    setupTableHeader()

    // Inicializar o importador de histórico
    // this.historicoImporter = initializeHistoricoImporter(this)

    const periodoInput = document.getElementById('periodo')
    const periodoRecente = getPeriodoMaisRecente(this.disciplinas)
    if (!periodoInput.value && periodoRecente) {
      periodoInput.value = periodoRecente
    }

    this.setupEventListeners()
    this.atualizarTudo()

    // Inicializa o simulador após carregar tudo
    this.initSimulation()
    window.app.__appInstance = this
  }

  setupCursoSelector() {
    const cursoSelect = document.getElementById('curso')
    cursoSelect.addEventListener('change', e => {
      // Garante que salvamos as disciplinas do curso atual antes de trocar
      console.log(
        `Salvando disciplinas antes da troca de curso. Curso: ${this.cursoAtual}, Qtd: ${this.disciplinas.length}`
      )
      salvarDisciplinas(this.disciplinas, this.cursoAtual)

      // Agora mudamos o curso atual
      this.cursoAtual = e.target.value
      console.log(`Curso alterado para: ${this.cursoAtual}`)

      // Carregamos as disciplinas do novo curso
      await this.carregarDisciplinasDoCurso()
      this.atualizarTudo()

      // Atualiza o simulador quando o curso é alterado
      if (this.simulation) {
        this.simulation.simulator.cursoAtual = this.cursoAtual
        this.simulation.updateNaturezaOptions()

        // Se estiver em modo de simulação, atualiza a visualização
        if (this.simulation.isSimulationMode) {
          this.simulation.atualizarSimulacao()
        }
      }
    })
  }

  async carregarDisciplinasDoCurso() {
    console.log(`Carregando disciplinas do curso: ${this.cursoAtual}`)

    // Verificar se há um usuário autenticado
    if (window.dataService && window.dataService.currentUser) {
      try {
        // Sincronizar dados do Firestore para localStorage
        const syncResult =
          await window.dataService.syncLocalStorageWithFirestore()
        if (syncResult.success) {
          console.log('Dados sincronizados do Firestore para localStorage')
        }
      } catch (error) {
        console.error('Erro ao sincronizar dados:', error)
      }
    }

    this.disciplinas = carregarDisciplinas(this.cursoAtual)
    console.log(`${this.disciplinas.length} disciplinas carregadas`)
  }

  setupEventListeners() {
    setupFormHandlers(this.disciplinas, {
      onSubmit: disciplina => {
        // Garantir que a disciplina esteja no array atual
        if (!this.disciplinas.includes(disciplina)) {
          console.log(
            'Disciplina não encontrada no array principal, adicionando novamente'
          )
          this.disciplinas.push(disciplina)
        }

        console.log(
          `Disciplina adicionada ao curso ${this.cursoAtual}. Total: ${this.disciplinas.length}`,
          disciplina
        )
        salvarDisciplinas(this.disciplinas, this.cursoAtual)
        this.atualizarTudo()

        // Atualiza o simulador quando uma nova disciplina é adicionada
        if (this.simulation && this.simulation.isSimulationMode) {
          this.simulation.simulator.disciplinasCursadas = this.disciplinas
          this.simulation.atualizarSimulacao()
        }
      }
    })

    window.app = {
      removerDisciplina: index => {
        const token = csrfProtection.getToken()
        this.removerDisciplina(index, token)
      },
      simulation: {
        removerDisciplinaSimulada: index => {
          if (this.simulation) {
            this.simulation.removerDisciplinaSimulada(index)
          }
        }
      },
      csrfProtection: csrfProtection
    }
  }

  validarOperacao(token) {
    return csrfProtection.validateToken(token)
  }

  removerDisciplina(index, token) {
    // Verifica o token CSRF antes de permitir a operação
    if (!this.validarOperacao(token)) {
      console.error('Erro de validação CSRF: Operação não autorizada')
      alert(
        'Erro de segurança: Operação não autorizada. A página será recarregada.'
      )
      window.location.reload()
      return
    }

    this.disciplinas.splice(index, 1)
    console.log(
      `Disciplina removida. Restam ${this.disciplinas.length} disciplinas no curso ${this.cursoAtual}`
    )
    salvarDisciplinas(this.disciplinas, this.cursoAtual)
    this.atualizarTudo()

    // Atualiza o simulador quando uma disciplina é removida
    if (this.simulation && this.simulation.isSimulationMode) {
      this.simulation.simulator.disciplinasCursadas = this.disciplinas
      this.simulation.atualizarSimulacao()
    }
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

  // Inicializa o simulador
  initSimulation() {
    this.simulation = new SimulationUI(this)
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(reg => {
      console.log('Service Worker registrado!', reg)

      reg.onupdatefound = () => {
        const installingWorker = reg.installing
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log(
                'Novo Service Worker disponível. Recarregue a página para atualizar.'
              )
            }
          }
        }
      }
    })
    .catch(err => console.log('Erro ao registrar o Service Worker:', err))
}

document.addEventListener('DOMContentLoaded', () => {
  const appInstance = new App()
  document.querySelector('body').__appInstance = appInstance
})

// Função para gerar uma string do PIX
function generatePixString(
  pixKey,
  merchantName = 'Luis Teixeira',
  merchantCity = 'Salvador'
) {
  // Função auxiliar para calcular CRC16
  function crc16(str) {
    const crcTable = Array(256)
      .fill()
      .map((_, i) => {
        let r = i << 8
        for (let j = 0; j < 8; j++) {
          r = ((r << 1) ^ (r & 0x8000 ? 0x1021 : 0)) & 0xffff
        }
        return r
      })

    let crc = 0xffff
    for (let i = 0; i < str.length; i++) {
      crc = (crc << 8) ^ crcTable[((crc >> 8) ^ str.charCodeAt(i)) & 0xff]
    }
    return crc & 0xffff
  }

  // Função para formatar campos do PIX
  function formatPixField(id, content) {
    const len = content.length.toString().padStart(2, '0')
    return `${id}${len}${content}`
  }

  // Montagem do payload do PIX
  const payload = [
    formatPixField('00', '01'),
    formatPixField('01', '12'),
    formatPixField(
      '26',
      [
        formatPixField('00', 'br.gov.bcb.pix'),
        formatPixField('01', pixKey)
      ].join('')
    ),
    formatPixField('52', '0000'),
    formatPixField('53', '986'),
    formatPixField('58', 'BR'),
    formatPixField('59', merchantName),
    formatPixField('60', merchantCity),
    formatPixField('62', formatPixField('05', ''))
  ].join('')

  // Adiciona o CRC16
  const pixCode = `${payload}6304`
  const crc = crc16(pixCode).toString(16).toUpperCase().padStart(4, '0')

  return pixCode + crc
}

document.addEventListener('DOMContentLoaded', function () {
  const pixCode =
    '00020126420014BR.GOV.BCB.PIX0120luisps4.lt@gmail.com5204000053039865802BR5925Luis Antonio Souza Teixei6009SAO PAULO62140510RskQDQkmPG63044276'

  // Configuração do QR Code com suporte a acessibilidade
  const qrCodeContainer = document.getElementById('qrcode')

  // Cria o QR code
  const qrcode = new QRCode(qrCodeContainer, {
    text: pixCode,
    width: 180,
    height: 180,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  })

  // Adiciona o atributo alt à imagem após ela ser gerada
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        const qrImage = document.querySelector('#qrcode img')
        if (qrImage && !qrImage.hasAttribute('alt')) {
          qrImage.setAttribute(
            'alt',
            'QR Code para doação via PIX. Escaneie este código para fazer uma doação de qualquer valor.'
          )
          qrImage.setAttribute('role', 'img')
          observer.disconnect()
        }
      }
    })
  })

  observer.observe(qrCodeContainer, {
    childList: true,
    subtree: true
  })
})

// Adiciona os estilos necessários
const style = document.createElement('style')
style.textContent = `
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Estilos para o simulador */
.simulation-container {
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
  padding: 20px;
}

.simulation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.simulation-actions {
  display: flex;
  gap: 10px;
}

.simulation-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 992px) {
  .simulation-content {
    grid-template-columns: 1fr 1fr;
  }
}

.simulation-form-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.simulation-results {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.impact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.impact-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.impact-card h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.1rem;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.impact-values {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.impact-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-weight: 500;
  color: #555;
}

.value {
  font-weight: 600;
  font-size: 1.1rem;
}

.value.positive {
  color: #2ecc71;
}

.value.negative {
  color: #e74c3c;
}

.simulation-table-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn-primary {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-action {
  background-color: #f1f1f1;
  color: #333;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-simulation {
  background-color: #9b59b6;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
  font-weight: 500;
  display: block;
  width: 100%;
}

.empty-message {
  text-align: center;
  padding: 20px;
  color: #777;
  font-style: italic;
}

.simulada-aprovada {
  background-color: rgba(46, 204, 113, 0.1);
}

.simulada-reprovada {
  background-color: rgba(231, 76, 60, 0.1);
}

.simulation-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  background-color: #2ecc71;
  color: white;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.simulation-notification.error {
  background-color: #e74c3c;
}

.simulation-notification.show {
  opacity: 1;
}

/* Ajustes para quando o simulador está ativo */
.content-container.simulation-active .table-container,
.content-container.simulation-active .resumo-container {
  opacity: 0.7;
  pointer-events: none;
}
`
document.head.appendChild(style)

// Input sanitization
function sanitizeInput(input) {
  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
}

// CSRF protection
function addCSRFToken() {
  const token = Math.random().toString(36).substr(2)
  localStorage.setItem('csrf_token', token)
  return token
}
