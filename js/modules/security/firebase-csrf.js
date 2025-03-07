// js/modules/security/csrf.js
/**
 * Gerenciamento de CSRF para proteção contra ataques de falsificação de solicitação entre sites
 */

export class CSRFProtection {
  constructor() {
    this.tokenName = 'csrf_token'
    this.headerName = 'X-CSRF-Token'
    this.tokenLifetime = 3600000 // 1 hora em milissegundos
  }

  /**
   * Gera um novo token CSRF
   * @returns {string} Token CSRF gerado
   */
  generateToken() {
    const random = new Uint8Array(16)
    window.crypto.getRandomValues(random)
    const token = Array.from(random)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    const tokenData = {
      value: token,
      expires: Date.now() + this.tokenLifetime
    }

    localStorage.setItem(this.tokenName, JSON.stringify(tokenData))
    return token
  }

  /**
   * Obtém o token CSRF atual ou gera um novo se não existir ou estiver expirado
   * @returns {string} Token CSRF válido
   */
  getToken() {
    try {
      const storedData = localStorage.getItem(this.tokenName)

      if (!storedData) {
        return this.generateToken()
      }

      const tokenData = JSON.parse(storedData)

      // Verifica se o token expirou
      if (Date.now() > tokenData.expires) {
        return this.generateToken()
      }

      return tokenData.value
    } catch (error) {
      console.error('Erro ao obter token CSRF:', error)
      return this.generateToken()
    }
  }

  /**
   * Adiciona o token CSRF a um formulário
   * @param {HTMLFormElement} form Elemento de formulário
   */
  protectForm(form) {
    // Remove campo CSRF existente, se houver
    const existingInput = form.querySelector(`input[name="${this.tokenName}"]`)
    if (existingInput) {
      existingInput.remove()
    }

    // Cria um novo campo de entrada oculto com o token
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = this.tokenName
    input.value = this.getToken()

    // Adiciona o campo ao formulário
    form.appendChild(input)
  }

  /**
   * Protege todas as requisições fetch adicionando o token CSRF
   */
  protectFetch() {
    const originalFetch = window.fetch
    const self = this

    window.fetch = function (url, options = {}) {
      // Prepara as opções com cabeçalhos
      options.headers = options.headers || {}

      // Adiciona o token CSRF como cabeçalho
      options.headers[self.headerName] = self.getToken()

      // Chama a função fetch original com as opções modificadas
      return originalFetch.call(this, url, options)
    }
  }

  protectXHR() {
    const originalOpen = XMLHttpRequest.prototype.open
    const self = this

    XMLHttpRequest.prototype.open = function (...args) {
      const originalSend = this.send

      this.send = function (body) {
        this.setRequestHeader(self.headerName, self.getToken())
        return originalSend.apply(this, arguments)
      }

      return originalOpen.apply(this, args)
    }
  }

  /**
   * Verifica se um token CSRF é válido
   * @param {string} token Token a ser verificado
   * @returns {boolean} Verdadeiro se o token for válido
   */
  validateToken(token) {
    try {
      const storedData = localStorage.getItem(this.tokenName)

      if (!storedData) {
        return false
      }

      const tokenData = JSON.parse(storedData)

      // Verifica se o token expirou
      if (Date.now() > tokenData.expires) {
        return false
      }

      // Compara o token fornecido com o armazenado
      return token === tokenData.value
    } catch (error) {
      console.error('Erro ao validar token CSRF:', error)
      return false
    }
  }

  /**
   * Inicializa a proteção CSRF na aplicação
   */
  init() {
    // Protege todas as requisições fetch
    this.protectFetch()
    this.protectXHR()

    // Protege todos os formulários existentes
    document.querySelectorAll('form').forEach(form => {
      this.protectForm(form)
    })

    // Observa a adição de novos formulários ao DOM
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          // Verifica se o nó é um elemento
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Se for um formulário, protege-o
            if (node.tagName === 'FORM') {
              this.protectForm(node)
            }

            // Verifica formulários dentro do nó adicionado
            node.querySelectorAll('form').forEach(form => {
              this.protectForm(form)
            })
          }
        })
      })
    })

    // Configura o observador para monitorar todo o documento
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // Atualiza todos os formulários quando o token for renovado
    window.addEventListener('storage', event => {
      if (event.key === this.tokenName) {
        document.querySelectorAll('form').forEach(form => {
          this.protectForm(form)
        })
      }
    })
  }
}

// Exporta uma instância única para uso em toda a aplicação
export const csrfProtection = new CSRFProtection()
