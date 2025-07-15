import authService from './firebase/auth.js'
import dataService from './firebase/data.js'
import { initializeSyncNonBlocking } from './firebase/sync-manager.js'

class MainApp {
  constructor() {
    this.currentUser = null
    this.userData = null
    this.init()
  }

  async init() {
    // Verificar estado de autenticação
    authService.onAuthStateChanged((user, userData) => {
      if (user) {
        this.currentUser = user
        this.userData = userData
        dataService.setCurrentUser(user)
        this.showAuthenticatedUI()
      } else {
        this.showUnauthenticatedUI()
      }
    })

    this.setupEventListeners()
  }

  showAuthenticatedUI() {
    // Mostrar seção do usuário
    const userNav = document.querySelector('.user-navigation')
    if (userNav) {
      userNav.style.display = 'block'
    }

    // Atualizar informações do usuário
    this.updateUserInfo()

    // Configurar menu do usuário
    this.setupUserMenu()

    // Inicializar sincronização de forma não bloqueante
    initializeSyncNonBlocking()
  }

  showUnauthenticatedUI() {
    // Ocultar seção do usuário
    const userNav = document.querySelector('.user-navigation')
    if (userNav) {
      userNav.style.display = 'none'
    }

    // Redirecionar para login se não estiver na página de login
    if (!window.location.pathname.includes('login.html')) {
      window.location.href = '/login.html'
    }
  }

  updateUserInfo() {
    if (!this.userData) return

    const userName = this.userData.name || 'Usuário'
    const userNameElement = document.getElementById('userName')

    if (userNameElement) {
      userNameElement.textContent = userName
    }
  }

  setupUserMenu() {
    // Toggle do menu do usuário
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
        try {
          console.log('Iniciando logout...')
          const result = await authService.logout()
          console.log('Resultado do logout:', result)

          if (result.success) {
            console.log('Logout bem-sucedido, redirecionando...')
            // Limpar dados locais
            localStorage.removeItem('theme')
            sessionStorage.clear()

            // Redirecionar para login
            window.location.href = '/login.html'
          } else {
            console.error('Erro no logout:', result.error)
            this.showNotification(
              '❌ Erro ao fazer logout: ' + result.error,
              'error'
            )
          }
        } catch (error) {
          console.error('Exceção no logout:', error)
          this.showNotification(
            '❌ Erro ao fazer logout: ' + error.message,
            'error'
          )
        }
      })
    }

    // Alterar senha
    const changePasswordBtn = document.getElementById('changePasswordBtn')
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener('click', e => {
        e.preventDefault()
        window.location.href = '/profile.html#change-password'
      })
    }
  }

  setupEventListeners() {
    // Event listeners gerais da aplicação
    this.setupFormHandlers()
    this.setupDataHandlers()
  }

  setupFormHandlers() {
    // Formulário de disciplina
    const disciplinaForm = document.getElementById('disciplinaForm')
    if (disciplinaForm) {
      disciplinaForm.addEventListener('submit', async e => {
        e.preventDefault()
        await this.handleDisciplineSubmit()
      })
    }

    // Botão de limpar histórico
    const limparBtn = document.getElementById('limparBtn')
    if (limparBtn) {
      limparBtn.addEventListener('click', () => {
        this.showClearConfirmation()
      })
    }

    // Modal de confirmação
    this.setupModalHandlers()
  }

  async handleDisciplineSubmit() {
    if (!this.currentUser) {
      this.showNotification(
        'Você precisa estar logado para adicionar disciplinas.',
        'error'
      )
      return
    }

    const formData = new FormData(document.getElementById('disciplinaForm'))
    const disciplineData = {
      periodo: formData.get('periodo'),
      codigo: formData.get('codigo'),
      nome: formData.get('nome'),
      natureza: formData.get('natureza'),
      creditos: parseInt(formData.get('creditos')) || 0,
      horas: parseInt(formData.get('horas')) || 0,
      nota: parseFloat(formData.get('nota')) || 0,
      status: formData.get('status') || 'completed',
      curso: document.getElementById('curso').value
    }

    try {
      const result = await dataService.addDiscipline(disciplineData)
      if (result.success) {
        this.showNotification('Disciplina adicionada com sucesso!', 'success')
        document.getElementById('disciplinaForm').reset()
        await this.loadUserData()
      } else {
        this.showNotification(
          'Erro ao adicionar disciplina: ' + result.error,
          'error'
        )
      }
    } catch (error) {
      this.showNotification(
        'Erro ao adicionar disciplina: ' + error.message,
        'error'
      )
    }
  }

  async loadUserData() {
    try {
      // Carregar disciplinas do usuário
      const disciplinesResult = await dataService.getUserDisciplines()
      if (disciplinesResult.success) {
        this.updateDisciplinesTable(disciplinesResult.data)
        this.updateSummary(disciplinesResult.data)
      }

      // Carregar histórico acadêmico
      const historyResult = await dataService.loadAcademicHistory()
      if (historyResult.success && historyResult.data) {
        this.updateAcademicHistory(historyResult.data)
      }

      // Carregar requisitos de formatura
      const requirementsResult = await dataService.loadGraduationRequirements()
      if (requirementsResult.success && requirementsResult.data) {
        this.updateGraduationRequirements(requirementsResult.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  updateDisciplinesTable(disciplines) {
    const tbody = document.getElementById('disciplinasBody')
    if (!tbody) return

    tbody.innerHTML = ''

    disciplines.forEach(discipline => {
      const row = document.createElement('tr')
      row.innerHTML = `
        <td>${discipline.periodo}</td>
        <td>${discipline.codigo}</td>
        <td>${discipline.nome}</td>
        <td>${discipline.natureza}</td>
        <td>${discipline.creditos}</td>
        <td>${discipline.horas}</td>
        <td>${discipline.nota}</td>
        <td>${discipline.status}</td>
        <td>
          <button class="btn-edit" data-id="${discipline.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-delete" data-id="${discipline.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `
      tbody.appendChild(row)
    })
  }

  updateSummary(disciplines) {
    // Pegar o curso atual da instância do app
    const cursoAtual = this.cursoAtual || (window.app && window.app.cursoAtual)
    const stats = dataService.calculateSummary(disciplines, cursoAtual)

    // Atualizar estatísticas na interface
    const totalDisciplines = document.getElementById('totalDisciplines')
    const completedDisciplines = document.getElementById('completedDisciplines')
    const averageGrade = document.getElementById('averageGrade')
    const progressPercentage = document.getElementById('progressPercentage')
    const inProgressDisciplines = document.getElementById(
      'inProgressDisciplines'
    )

    if (totalDisciplines) totalDisciplines.textContent = stats.totalDisciplines
    if (completedDisciplines)
      completedDisciplines.textContent = stats.completedDisciplines
    if (averageGrade) averageGrade.textContent = stats.averageGrade
    if (progressPercentage)
      progressPercentage.textContent = stats.progressPercentage + '%'
    if (inProgressDisciplines)
      inProgressDisciplines.textContent = stats.inProgressDisciplines
  }

  updateAcademicHistory(history) {
    // Implementar atualização do histórico acadêmico
    console.log('Atualizando histórico acadêmico:', history)
  }

  updateGraduationRequirements(requirements) {
    // Implementar atualização dos requisitos de formatura
    console.log('Atualizando requisitos de formatura:', requirements)
  }

  setupModalHandlers() {
    const modal = document.getElementById('confirmacaoModal')
    const closeBtn = modal?.querySelector('.close')
    const cancelBtn = document.getElementById('cancelarLimparBtn')
    const confirmBtn = document.getElementById('confirmarLimparBtn')

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none'
      })
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none'
      })
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        await this.clearAllData()
        modal.style.display = 'none'
      })
    }

    // Fechar modal ao clicar fora
    window.addEventListener('click', e => {
      if (e.target === modal) {
        modal.style.display = 'none'
      }
    })
  }

  showClearConfirmation() {
    const modal = document.getElementById('confirmacaoModal')
    if (modal) {
      modal.style.display = 'block'
    }
  }

  async clearAllData() {
    try {
      // Implementar limpeza de todos os dados do usuário
      this.showNotification(
        'Funcionalidade de limpeza será implementada em breve.',
        'info'
      )
    } catch (error) {
      this.showNotification('Erro ao limpar dados: ' + error.message, 'error')
    }
  }

  setupDataHandlers() {
    // Carregar dados quando a página carregar
    if (this.currentUser) {
      this.loadUserData()
    }
  }

  showNotification(message, type = 'info') {
    if (
      typeof window.notificationsEnabled === 'function' &&
      !window.notificationsEnabled()
    )
      return
    // Criar elemento de notificação
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
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
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    `

    // Adicionar ao DOM
    document.body.appendChild(notification)

    // Mostrar notificação
    setTimeout(() => {
      notification.classList.add('show')
    }, 100)

    // Fechar notificação
    const closeBtn = notification.querySelector('.notification-close')
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('show')
      setTimeout(() => {
        notification.remove()
      }, 300)
    })

    // Auto-remover após 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove('show')
        setTimeout(() => {
          notification.remove()
        }, 300)
      }
    }, 5000)
  }
}

// Inicializar aplicação principal
new MainApp()

// Disponibilizar dataService globalmente para acesso do app.js
window.dataService = dataService
