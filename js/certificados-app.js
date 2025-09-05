// Aplicação principal para a página de certificados
import authService from './modules/firebase/auth.js'
import certificadosManager from './modules/certificados.js'

class CertificadosApp {
  constructor() {
    this.init()
  }

  async init() {
    // Verificar autenticação
    authService.onAuthStateChanged((user, userData) => {
      if (user) {
        this.showAuthenticatedContent()
        this.updateUserInfo(userData)
      } else {
        this.showLoginContent()
      }
    })

    // Verificar se já há um usuário logado
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      const userData = authService.getUserData()
      this.showAuthenticatedContent()
      this.updateUserInfo(userData)
    } else {
      this.showLoginContent()
    }

    this.setupEventListeners()
  }

  showAuthenticatedContent() {
    // Mostrar elementos para usuário autenticado
    const profileLink = document.getElementById('profileLink')
    const userGreeting = document.getElementById('userGreeting')
    const userDropdown = document.getElementById('userDropdown')
    const loginBtn = document.getElementById('loginBtn')

    if (profileLink) profileLink.style.display = 'flex'
    if (userGreeting) userGreeting.style.display = 'block'
    if (userDropdown) userDropdown.style.display = 'block'
    if (loginBtn) loginBtn.style.display = 'none'
  }

  showLoginContent() {
    // Mostrar elementos para usuário não autenticado
    const profileLink = document.getElementById('profileLink')
    const userGreeting = document.getElementById('userGreeting')
    const userDropdown = document.getElementById('userDropdown')
    const loginBtn = document.getElementById('loginBtn')

    if (profileLink) profileLink.style.display = 'none'
    if (userGreeting) userGreeting.style.display = 'none'
    if (userDropdown) userDropdown.style.display = 'none'
    if (loginBtn) loginBtn.style.display = 'flex'
  }

  updateUserInfo(userData) {
    const userName = document.getElementById('userName')
    if (userName && userData) {
      userName.textContent = userData.name || 'Usuário'
    }
  }

  setupEventListeners() {
    // Botão de login
    const loginBtn = document.getElementById('loginBtn')
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        window.location.href = '/login.html'
      })
    }

    // Botão de logout
    const logoutBtn = document.getElementById('logoutBtn')
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await authService.logout()
          this.showLoginContent()
          this.showNotification('Logout realizado com sucesso', 'success')
        } catch (error) {
          console.error('Erro no logout:', error)
          this.showNotification('Erro ao fazer logout', 'error')
        }
      })
    }

    // Botão de alterar senha
    const changePasswordBtn = document.getElementById('changePasswordBtn')
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener('click', () => {
        this.showNotification('Funcionalidade em desenvolvimento', 'info')
      })
    }

    // Dropdown do usuário
    const userDropdown = document.getElementById('userDropdown')
    if (userDropdown) {
      userDropdown.addEventListener('click', e => {
        e.stopPropagation()
        const userMenu = userDropdown.querySelector('.user-menu')
        if (userMenu) {
          userMenu.style.display =
            userMenu.style.display === 'block' ? 'none' : 'block'
        }
      })
    }

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', () => {
      const userMenu = document.querySelector('.user-menu')
      if (userMenu) {
        userMenu.style.display = 'none'
      }
    })
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
