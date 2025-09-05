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
import { navigationManager } from './modules/ui/navigation.js'
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
    this.lastSyncTime = null
    this.syncInterval = null
    this.removalsRegistry = new Set() // Registro de disciplinas removidas
    csrfProtection.init()
    this.darkModeManager = new DarkModeManager()
    this.simulation = null
    this.init()
  }

  // Registrar disciplina removida
  registrarRemocao(disciplinaRemovida) {
    const key = `${disciplinaRemovida.codigo}_${this.cursoAtual}`
    this.removalsRegistry.add(key)

    // Salvar no localStorage para persistir entre sessões
    const removals = JSON.parse(
      localStorage.getItem('removalsRegistry') || '[]'
    )
    removals.push(key)
    localStorage.setItem('removalsRegistry', JSON.stringify(removals))

    console.log(
      `Disciplina ${disciplinaRemovida.codigo} registrada como removida`
    )
  }

  // Verificar se disciplina foi removida
  foiRemovida(disciplina) {
    const key = `${disciplina.codigo}_${this.cursoAtual}`
    return this.removalsRegistry.has(key)
  }

  // Carregar registro de remoções
  carregarRegistroRemocoes() {
    try {
      const removals = JSON.parse(
        localStorage.getItem('removalsRegistry') || '[]'
      )
      this.removalsRegistry = new Set(removals)
      console.log(`Carregadas ${removals.length} remoções do registro`)
    } catch (error) {
      console.error('Erro ao carregar registro de remoções:', error)
      this.removalsRegistry = new Set()
    }
  }

  init() {
    this.setupCursoSelector()
    this.carregarDisciplinasDoCurso()
    this.carregarRegistroRemocoes() // Carregar registro de remoções
    setupFilterComponent()
    setupDateTime()
    inicializarEmenta()
    setupExportButton()
    setupCleanTableButton()
    setupTableHeader()

    // Inicializar sincronização automática
    this.iniciarSincronizacaoAutomatica()

    // Verificar e corrigir estatísticas
    this.verificarEstatisticas()

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

  // Iniciar sincronização automática
  iniciarSincronizacaoAutomatica() {
    // Verificar se o usuário está autenticado
    if (!window.dataService || !window.dataService.currentUser) {
      return
    }

    // Sincronizar a cada 30 segundos
    this.syncInterval = setInterval(() => {
      this.verificarSincronizacao()
    }, 30000) // 30 segundos

    console.log('Sincronização automática iniciada (30s)')
  }

  // Verificar se há mudanças para sincronizar
  async verificarSincronizacao() {
    try {
      if (!window.dataService || !window.dataService.currentUser) {
        return
      }

      console.log('Verificando sincronização automática...')

      // Buscar disciplinas do Firestore
      const disciplinesResult = await window.dataService.getUserDisciplines()
      if (disciplinesResult.success) {
        const firestoreDisciplines = disciplinesResult.data

        // Filtrar disciplinas válidas e não removidas
        const validDisciplines = firestoreDisciplines.filter(
          discipline =>
            discipline.codigo &&
            discipline.nome &&
            discipline.codigo.trim() !== '' &&
            discipline.nome.trim() !== '' &&
            !this.foiRemovida(discipline) // Não incluir disciplinas removidas
        )

        // Agrupar por curso
        const disciplinesByCourse = {}
        validDisciplines.forEach(discipline => {
          const curso = discipline.curso || 'BICTI'
          if (!disciplinesByCourse[curso]) {
            disciplinesByCourse[curso] = []
          }
          disciplinesByCourse[curso].push(discipline)
        })

        // Verificar se há mudanças no curso atual
        const cursoAtualDisciplinas = disciplinesByCourse[this.cursoAtual] || []
        const localDisciplinas = this.disciplinas

        // Comparar quantidade de disciplinas
        if (cursoAtualDisciplinas.length !== localDisciplinas.length) {
          console.log('Mudanças detectadas, atualizando dados locais...')

          // Atualizar localStorage
          Object.keys(disciplinesByCourse).forEach(curso => {
            const disciplinas = disciplinesByCourse[curso]
            localStorage.setItem(
              `disciplinas_${curso}`,
              JSON.stringify(disciplinas)
            )
          })

          // Atualizar dados locais se necessário
          if (disciplinesByCourse[this.cursoAtual]) {
            this.disciplinas = disciplinesByCourse[this.cursoAtual]
            this.atualizarTudo()
            console.log('Dados locais atualizados via sincronização automática')
          }
        }
      }
    } catch (error) {
      console.error('Erro na sincronização automática:', error)
    }
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
      this.carregarDisciplinasDoCurso()
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

  carregarDisciplinasDoCurso() {
    console.log(`Carregando disciplinas do curso: ${this.cursoAtual}`)
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
          `Disciplina adicionada ao curso ${this.cursoAtual}. Total: ${this.disciplinas.length}`
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
      editarDisciplina: index => {
        this.prepararEdicaoDisciplina(index)
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

    // Obter a disciplina que será removida para sincronização
    const disciplinaRemovida = this.disciplinas[index]

    // Remover do array local
    this.disciplinas.splice(index, 1)
    console.log(
      `Disciplina removida. Restam ${this.disciplinas.length} disciplinas no curso ${this.cursoAtual}`
    )

    // Salvar no localStorage
    salvarDisciplinas(this.disciplinas, this.cursoAtual)

    // Registrar a remoção
    this.registrarRemocao(disciplinaRemovida)

    // Sincronizar com Firestore em background
    this.sincronizarRemocaoDisciplina(disciplinaRemovida)

    // Atualizar interface
    this.atualizarTudo()

    // Atualiza o simulador quando uma disciplina é removida
    if (this.simulation && this.simulation.isSimulationMode) {
      this.simulation.simulator.disciplinasCursadas = this.disciplinas
      this.simulation.atualizarSimulacao()
    }
  }

  prepararEdicaoDisciplina(index) {
    const disciplina = this.disciplinas[index]
    if (!disciplina) return
    // Preencher o formulário com os dados da disciplina
    document.getElementById('periodo').value = disciplina.periodo
    document.getElementById('codigo').value = disciplina.codigo
    document.getElementById('nome').value = disciplina.nome
    document.getElementById('natureza').value = disciplina.natureza
    document.getElementById('ch').value = disciplina.ch
    document.getElementById('nota').value = disciplina.nota ?? ''
    document.getElementById('trancamento').checked = !!disciplina.trancamento
    document.getElementById('dispensada').checked = !!disciplina.dispensada
    document.getElementById('emcurso').checked = !!disciplina.emcurso

    // Salvar o índice em edição em uma propriedade temporária
    this.indiceEdicao = index

    // Dar foco no formulário
    document.getElementById('codigo').focus()
    // Scroll suave até o formulário
    const formContainer = document.querySelector('.form-container')
    if (formContainer) formContainer.scrollIntoView({ behavior: 'smooth' })

    // Trocar o texto do botão para 'Salvar Edição'
    const btn = document.querySelector('#disciplinaForm button[type="submit"]')
    if (btn) btn.innerHTML = '<i class="fas fa-save"></i> Salvar Edição'
  }

  // Sincronizar remoção de disciplina com Firestore (versão otimizada)
  async sincronizarRemocaoDisciplina(disciplinaRemovida) {
    try {
      // Verificar se o usuário está autenticado
      if (!window.dataService || !window.dataService.currentUser) {
        console.log('Usuário não autenticado, remoção apenas local')
        return
      }

      console.log('Iniciando sincronização de remoção...')

      // Buscar disciplina específica no Firestore (método otimizado)
      const disciplineResult = await window.dataService.findDisciplineByCode(
        disciplinaRemovida.codigo,
        this.cursoAtual
      )

      if (disciplineResult.success) {
        console.log('Disciplina encontrada no Firestore, removendo...')

        // Remover do Firestore usando método otimizado
        const deleteResult = await window.dataService.deleteDisciplineOptimized(
          disciplineResult.data.id
        )

        if (deleteResult.success) {
          console.log('Disciplina removida do Firestore com sucesso')

          // Atualizar localStorage de forma otimizada
          await this.atualizarLocalStorageOtimizado(disciplinaRemovida)
        } else {
          console.error(
            'Erro ao remover disciplina do Firestore:',
            deleteResult.error
          )
        }
      } else {
        console.log(
          'Disciplina não encontrada no Firestore, pode ter sido removida anteriormente'
        )
      }
    } catch (error) {
      console.error('Erro ao sincronizar remoção de disciplina:', error)
    }
  }

  // Atualizar localStorage de forma otimizada após remoção
  async atualizarLocalStorageOtimizado(disciplinaRemovida) {
    try {
      console.log('Atualizando localStorage de forma otimizada...')

      // Buscar disciplinas atualizadas do Firestore
      const disciplinesResult = await window.dataService.getUserDisciplines()
      if (disciplinesResult.success) {
        const firestoreDisciplines = disciplinesResult.data

        // Filtrar apenas disciplinas válidas
        const validDisciplines = firestoreDisciplines.filter(
          discipline =>
            discipline.codigo &&
            discipline.nome &&
            discipline.codigo.trim() !== '' &&
            discipline.nome.trim() !== ''
        )

        // Agrupar disciplinas por curso
        const disciplinesByCourse = {}
        validDisciplines.forEach(discipline => {
          const curso = discipline.curso || 'BICTI'
          if (!disciplinesByCourse[curso]) {
            disciplinesByCourse[curso] = []
          }
          disciplinesByCourse[curso].push(discipline)
        })

        // Atualizar localStorage para cada curso
        Object.keys(disciplinesByCourse).forEach(curso => {
          const disciplinas = disciplinesByCourse[curso]
          localStorage.setItem(
            `disciplinas_${curso}`,
            JSON.stringify(disciplinas)
          )
          console.log(
            `localStorage atualizado: ${disciplinas.length} disciplinas para o curso ${curso}`
          )
        })

        // Se o curso atual foi atualizado, recarregar dados
        if (disciplinesByCourse[this.cursoAtual]) {
          this.disciplinas = disciplinesByCourse[this.cursoAtual]
          this.atualizarTudo()
          console.log('Dados locais atualizados após remoção')
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar localStorage após remoção:', error)
    }
  }

  // Atualizar localStorage após remoção (método otimizado) - DEPRECATED
  async atualizarLocalStorageAposRemocao() {
    // Este método foi substituído por atualizarLocalStorageOtimizado
    await this.atualizarLocalStorageOtimizado()
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

  // Limpar dados duplicados e corrigir estatísticas
  async limparDadosDuplicados() {
    try {
      if (!window.dataService || !window.dataService.currentUser) {
        console.log('Usuário não autenticado, pulando limpeza')
        return
      }

      console.log('Iniciando limpeza de dados duplicados...')

      // Limpar disciplinas duplicadas
      const cleanResult = await window.dataService.cleanDuplicateDisciplines()
      if (cleanResult.success) {
        console.log(
          `Limpeza concluída: ${cleanResult.removed} disciplinas duplicadas removidas`
        )
      }

      // Validar e corrigir dados
      const validateResult = await window.dataService.validateAndFixData()
      if (validateResult.success) {
        console.log(
          `Validação concluída: ${validateResult.fixed} disciplinas corrigidas`
        )
      }

      // Recarregar dados após limpeza
      await this.carregarDisciplinasDoCurso()
      this.atualizarTudo()

      console.log('Limpeza e correção de dados concluída')
    } catch (error) {
      console.error('Erro ao limpar dados duplicados:', error)
    }
  }

  // Verificar e corrigir estatísticas
  async verificarEstatisticas() {
    try {
      console.log('Verificando estatísticas...')

      // Contar por status
      const aprovadas = this.disciplinas.filter(
        d => d.resultado === 'AP'
      ).length
      const reprovadas = this.disciplinas.filter(
        d => d.resultado === 'RR'
      ).length
      const trancadas = this.disciplinas.filter(
        d => d.resultado === 'TR'
      ).length

      console.log(
        `Estatísticas: ${aprovadas} aprovadas, ${reprovadas} reprovadas, ${trancadas} trancadas`
      )

      // Verificar duplicatas locais
      const codigos = this.disciplinas.map(d => d.codigo)
      const duplicatas = codigos.filter(
        (codigo, index) => codigos.indexOf(codigo) !== index
      )

      if (duplicatas.length > 0) {
        console.log(`Duplicatas encontradas: ${duplicatas.length} códigos`)
        await this.limparDadosDuplicados()
      }
    } catch (error) {
      console.error('Erro ao verificar estatísticas:', error)
    }
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

// Função para exibir toast de sugestão de login
function showLoginSuggestionToast() {
  // Não mostrar se já foi fechado recentemente nesta sessão
  const lastClosed = sessionStorage.getItem('loginToastClosedAt')
  const now = Date.now()
  if (lastClosed && now - parseInt(lastClosed, 10) < 5 * 60 * 1000) return
  // Corrigido: só mostrar se NÃO estiver logado
  if (window.dataService && window.dataService.currentUser) return
  if (document.getElementById('login-suggestion-toast')) return

  const toast = document.createElement('div')
  toast.id = 'login-suggestion-toast'
  toast.className = 'login-toast'
  toast.innerHTML = `
    <span class="login-toast-emoji">☁️</span>
    <span class="login-toast-msg">Faça login para salvar seu histórico na nuvem!</span>
    <button class="login-toast-btn">Entrar</button>
    <button class="login-toast-close" title="Fechar">&times;</button>
  `
  document.body.appendChild(toast)

  // Animação de entrada
  setTimeout(() => toast.classList.add('show'), 100)

  // Botão de login
  toast.querySelector('.login-toast-btn').onclick = () => {
    window.location.href = '/login.html'
  }
  // Botão de fechar
  toast.querySelector('.login-toast-close').onclick = () => {
    toast.classList.remove('show')
    sessionStorage.setItem('loginToastClosedAt', String(Date.now()))
    setTimeout(() => toast.remove(), 300)
  }
  // Fechar automaticamente após 10 segundos
  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.classList.remove('show')
      sessionStorage.setItem('loginToastClosedAt', String(Date.now()))
      setTimeout(() => toast.remove(), 300)
    }
  }, 10000)
}

// Exibir toast após inicialização da aplicação e a cada 5 minutos
function scheduleLoginToast() {
  // Exibir o toast 15 segundos após o carregamento da página
  setTimeout(() => {
    showLoginSuggestionToast()
    setInterval(() => {
      showLoginSuggestionToast()
    }, 5 * 60 * 1000) // 5 minutos
  }, 15000) // 15 segundos
}

window.addEventListener('DOMContentLoaded', () => {
  scheduleLoginToast()
})

// Função global de notificação padronizada
window.showNotification = function (message, type = 'info') {
  // Remove qualquer notificação anterior
  const existing = document.querySelector('.notification-global')
  if (existing) existing.remove()

  // Cria o elemento de notificação
  const notification = document.createElement('div')
  notification.className = `notification-global notification-${type}`
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${
        type === 'success'
          ? 'check-circle'
          : type === 'error'
          ? 'exclamation-triangle'
          : 'info-circle'
      }"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close"><i class="fas fa-times"></i></button>
  `
  document.body.appendChild(notification)

  setTimeout(() => notification.classList.add('show'), 100)

  // Fechar manualmente
  notification.querySelector('.notification-close').onclick = () => {
    notification.classList.remove('show')
    setTimeout(() => notification.remove(), 300)
  }
  // Fechar automaticamente após 4s
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.remove('show')
      setTimeout(() => notification.remove(), 300)
    }
  }, 4000)
}

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
