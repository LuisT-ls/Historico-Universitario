// Aplicação principal para a página de certificados
import authService from './modules/firebase/auth.js'
import certificadosManager from './modules/certificados.js'
import DarkModeManager from './modules/ui/darkmode.js'
import { navigationManager } from './modules/ui/navigation.js'

class CertificadosApp {
  constructor() {
    this.darkModeManager = null
    this.init()
  }

  async init() {
    // Inicializar Dark Mode Manager
    this.darkModeManager = new DarkModeManager()

    // Setup navigation event listeners
    navigationManager.setupAuthEventListeners(authService)

    // Verificar autenticação
    authService.onAuthStateChanged((user, userData) => {
      if (user) {
        this.showAuthenticatedContent()
        this.updateUserInfo(userData)
        navigationManager.updateAuthState(true, userData)
      } else {
        this.showLoginContent()
        navigationManager.updateAuthState(false)
      }
    })

    // Verificar se já há um usuário logado
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      const userData = authService.getUserData()
      this.showAuthenticatedContent()
      this.updateUserInfo(userData)
      navigationManager.updateAuthState(true, userData)
    } else {
      this.showLoginContent()
      navigationManager.updateAuthState(false)
    }

    this.setupEventListeners()
  }

  showAuthenticatedContent() {
    // NavigationManager handles this now
    console.log('Usuário autenticado')
  }

  showLoginContent() {
    // NavigationManager handles this now
    console.log('Usuário não autenticado')
  }

  updateUserInfo(userData) {
    const userName = document.getElementById('userName')
    if (userName && userData) {
      userName.textContent = userData.name || 'Usuário'
    }
  }

  setupEventListeners() {
    // Event listeners específicos da página de certificados
    // (os de navegação são gerenciados pelo NavigationManager)
    console.log('Event listeners da página de certificados configurados')
  }

  showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.textContent = message

    // Estilos da notificação
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      color: white;
      font-weight: 500;
      z-index: 10000;
      max-width: 300px;
      word-wrap: break-word;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `

    // Cores baseadas no tipo
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    }

    notification.style.backgroundColor = colors[type] || colors.info

    // Adicionar ao DOM
    document.body.appendChild(notification)

    // Animar entrada
    setTimeout(() => {
      notification.style.transform = 'translateX(0)'
    }, 100)

    // Remover após 3 segundos
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new CertificadosApp()
})

// Expor função de notificação globalmente
window.showNotification = (message, type) => {
  const app = new CertificadosApp()
  app.showNotification(message, type)
}
