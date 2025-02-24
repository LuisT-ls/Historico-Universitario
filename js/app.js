// js/app.js
import { CURSOS } from './modules/constants.js'
import { carregarDisciplinas, salvarDisciplinas } from './modules/storage.js'
import { atualizarTabela } from './modules/ui/table.js'
import { atualizarResumo } from './modules/ui/resumo.js'
import { atualizarRequisitos } from './modules/ui/requisitos.js'
import { setupFormHandlers } from './modules/ui/formHandler.js'
import { getPeriodoMaisRecente } from './modules/utils.js'
import { setupFilterComponent } from './modules/ui/filter.js'
import { setupDateTime } from './modules/ui/datetime.js'
import { csrfProtection } from './modules/security/csrf.js'

class App {
  constructor() {
    this.disciplinas = []
    this.cursoAtual = 'BICTI' // valor padrão
    csrfProtection.init()
    this.init()
  }

  init() {
    this.setupCursoSelector()
    this.carregarDisciplinasDoCurso()
    setupFilterComponent()
    setupDateTime()

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
      removerDisciplina: function (index) {
        const token = csrfProtection.getToken()
        const app = document.querySelector('body').__appInstance
        app.removerDisciplina(index, token)
      }
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
