import authService from './modules/firebase/auth.js'
import certificadosManager from './modules/certificados.js'

class CertificadosApp {
  constructor() {
    this.init()
  }

  async init() {
    // Aguardar um pouco para verificar se há autenticação em andamento
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Verificar autenticação
    authService.onAuthStateChanged((user, userData) => {
      if (user) {
        this.setupAuthenticatedUI(user, userData)
      } else {
        // Aguardar mais um pouco antes de redirecionar
        setTimeout(() => {
          const currentUser = authService.getCurrentUser()
          if (!currentUser) {
            this.setupUnauthenticatedUI()
          }
        }, 500)
      }
    })

    // Verificar se já há um usuário logado
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      const userData = authService.getUserData()
      this.setupAuthenticatedUI(currentUser, userData)
    } else {
      // Aguardar um pouco mais antes de redirecionar
      setTimeout(() => {
        const currentUser = authService.getCurrentUser()
        if (!currentUser) {
          this.setupUnauthenticatedUI()
        }
      }, 1500)
    }
  }

  setupAuthenticatedUI(user, userData) {
    // Atualizar informações do usuário
    this.updateUserInfo(user, userData)

    // Configurar eventos do usuário
    this.setupUserEvents()

    // Mostrar conteúdo autenticado
    document.body.classList.add('authenticated')
  }

  setupUnauthenticatedUI() {
    // Redirecionar para login se não estiver autenticado
    window.location.href = '/login.html'
  }

  updateUserInfo(user, userData) {
    // Atualizar nome do usuário
    const userNameElements = document.querySelectorAll(
      '#userName, #dropdownUserName'
    )
    userNameElements.forEach(element => {
      element.textContent = userData?.name || user.displayName || 'Usuário'
    })

    // Atualizar email do usuário
    const userEmailElements = document.querySelectorAll('#dropdownUserEmail')
    userEmailElements.forEach(element => {
      element.textContent = user.email || 'usuario@email.com'
    })
  }

  setupUserEvents() {
    // Menu do usuário
    const userButton = document.getElementById('userButton')
    const userDropdown = document.querySelector('.user-dropdown')

    if (userButton && userDropdown) {
      userButton.addEventListener('click', () => {
        userDropdown.classList.toggle('active')
      })

      // Fechar menu ao clicar fora
      document.addEventListener('click', e => {
        if (!e.target.closest('.user-dropdown')) {
          userDropdown.classList.remove('active')
        }
      })
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn')
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await this.performLogout()
      })
    }

    // Alterar senha
    const changePasswordBtn = document.getElementById('changePasswordBtn')
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener('click', () => {
        window.location.href = '/profile.html'
      })
    }
  }

  async performLogout() {
    try {
      console.log('Iniciando logout...')
      const result = await authService.logout()
      console.log('Resultado do logout:', result)

      if (result.success) {
        console.log('Logout bem-sucedido, redirecionando...')
        // Limpar dados locais
        localStorage.removeItem('theme')
        sessionStorage.clear()
        // Limpar disciplinas de todos os cursos e registro de remoções
        Object.keys(localStorage).forEach(key => {
          if (
            key.startsWith('disciplinas_') ||
            key === 'removalsRegistry'
          ) {
            localStorage.removeItem(key)
          }
        })
        // Redirecionar para a página principal
        window.location.href = '/'
      } else {
        console.error('Erro no logout:', result.error)
        window.showNotification(
          '❌ Erro ao fazer logout: ' + result.error,
          'error'
        )
      }
    } catch (error) {
      console.error('Exceção no logout:', error)
      window.showNotification(
        '❌ Erro ao fazer logout: ' + error.message,
        'error'
      )
    }
  }
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new CertificadosApp()
})

// Função global para notificações
window.showNotification = function (message, type = 'info') {
  // Criar elemento de notificação
  const notification = document.createElement('div')
  notification.className = `notification-popup ${type}`
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${
        type === 'success'
          ? 'check-circle'
          : type === 'error'
          ? 'exclamation-circle'
          : type === 'warning'
          ? 'exclamation-triangle'
          : 'info-circle'
      }"></i>
      <span>${message}</span>
    </div>
  `

  // Adicionar ao body
  document.body.appendChild(notification)

  // Mostrar notificação
  setTimeout(() => {
    notification.classList.add('show')
  }, 100)

  // Remover após 5 segundos
  setTimeout(() => {
    notification.classList.remove('show')
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, 5000)
}
