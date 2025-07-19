import authService from './firebase/auth.js'
import dataService from './firebase/data.js'
import { initializeSyncNonBlocking } from './firebase/sync-manager.js'
import { carregarDisciplinas } from './storage.js'

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
    // Atualizar informações do usuário
    this.updateUserInfo()

    // Configurar eventos do usuário
    this.setupUserMenu()

    // Mostrar elementos para usuário autenticado
    const userGreeting = document.getElementById('userGreeting')
    const userDropdown = document.getElementById('userDropdown')
    const loginLink = document.getElementById('loginLink')
    const profileLink = document.getElementById('profileLink')

    if (userGreeting) userGreeting.style.display = 'block'
    if (userDropdown) userDropdown.style.display = 'block'
    if (loginLink) loginLink.style.display = 'none'
    if (profileLink) profileLink.style.display = 'flex'

    // Inicializar sincronização de forma não bloqueante
    initializeSyncNonBlocking()
    // Recarregar dados do Firebase e atualizar interface
    this.carregarDisciplinasDoCurso(true)
  }

  showUnauthenticatedUI() {
    // Mostrar elementos para usuário não autenticado
    const userGreeting = document.getElementById('userGreeting')
    const userDropdown = document.getElementById('userDropdown')
    const loginLink = document.getElementById('loginLink')
    const profileLink = document.getElementById('profileLink')

    if (userGreeting) userGreeting.style.display = 'none'
    if (userDropdown) userDropdown.style.display = 'none'
    if (loginLink) loginLink.style.display = 'flex'
    if (profileLink) profileLink.style.display = 'none'

    // Importar dados do localStorage e atualizar interface
    this.carregarDisciplinasDoCurso(false)
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
      changePasswordBtn.addEventListener('click', e => {
        e.preventDefault()
        window.location.href = '/profile.html#change-password'
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
          if (key.startsWith('disciplinas_') || key === 'removalsRegistry') {
            localStorage.removeItem(key)
          }
        })
        // Redirecionar para a página principal
        window.location.href = '/'
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
  }

  setupEventListeners() {
    // Event listeners gerais da aplicação
    this.setupFormHandlers()
    this.setupDataHandlers()
  }

  setupFormHandlers() {
    // Formulário de disciplina
    // Removido o eventListener duplicado do submit
    // O submit será tratado apenas pelo formHandler

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

  // Remover a função handleDisciplineSubmit, pois o submit será tratado pelo formHandler

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

    disciplines.forEach((discipline, index) => {
      const row = document.createElement('tr')
      row.innerHTML = `
        <td>${discipline.periodo}</td>
        <td>${discipline.codigo}</td>
        <td>${discipline.nome}</td>
        <td>${discipline.natureza}</td>
        <td>${discipline.creditos ?? discipline.ch ?? ''}</td>
        <td>${discipline.horas ?? ''}</td>
        <td>${discipline.nota ?? ''}</td>
        <td>${discipline.status ?? discipline.resultado ?? ''}</td>
        <td>
          <button class="btn-edit" data-id="${
            discipline.id
          }" data-index="${index}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-delete" data-id="${
            discipline.id
          }" data-index="${index}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `
      tbody.appendChild(row)
    })

    // Adicionar listeners para editar/remover
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = parseInt(btn.getAttribute('data-index'))
        this.prepararEdicaoDisciplina(idx)
      })
    })
    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async e => {
        const idx = parseInt(btn.getAttribute('data-index'))
        const discipline = disciplines[idx]
        if (window.removerDisciplinaFirebase) {
          await window.removerDisciplinaFirebase(discipline)
        }
      })
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
    window.showNotification(message, type)
  }

  // Modificar carregarDisciplinasDoCurso para aceitar parâmetro de origem
  async carregarDisciplinasDoCurso(fromFirebase = null) {
    // Garantir contexto correto
    if (typeof this.atualizarTudo !== 'function') {
      // Apenas retorna silenciosamente se não existir
      return
    }
    if (
      fromFirebase === true &&
      window.dataService &&
      window.dataService.currentUser
    ) {
      // Buscar do Firebase
      try {
        const result = await window.dataService.getUserDisciplines()
        if (result.success) {
          this.disciplinas = result.data.filter(
            d => d.curso === this.cursoAtual
          )
        } else {
          this.disciplinas = []
        }
      } catch (e) {
        this.disciplinas = []
      }
    } else if (fromFirebase === false) {
      // Buscar do localStorage
      this.disciplinas = carregarDisciplinas(this.cursoAtual)
    } else {
      // Comportamento padrão (detecta login)
      if (window.dataService && window.dataService.currentUser) {
        try {
          const result = await window.dataService.getUserDisciplines()
          if (result.success) {
            this.disciplinas = result.data.filter(
              d => d.curso === this.cursoAtual
            )
          } else {
            this.disciplinas = []
          }
        } catch (e) {
          this.disciplinas = []
        }
      } else {
        this.disciplinas = carregarDisciplinas(this.cursoAtual)
      }
    }
    this.atualizarTudo()
  }
}

// Inicializar aplicação principal
new MainApp()

// Disponibilizar dataService globalmente para acesso do app.js
window.dataService = dataService

// Garantir contexto correto ao passar métodos como callback
window.addEventListener('DOMContentLoaded', () => {
  const appInstance = new MainApp()
  document.querySelector('body').__appInstance = appInstance
  // Expor métodos com bind para garantir contexto, só se existirem
  window.app = {
    ...window.app,
    carregarDisciplinasDoCurso:
      typeof appInstance.carregarDisciplinasDoCurso === 'function'
        ? appInstance.carregarDisciplinasDoCurso.bind(appInstance)
        : undefined,
    atualizarTudo:
      typeof appInstance.atualizarTudo === 'function'
        ? appInstance.atualizarTudo.bind(appInstance)
        : undefined
  }
})
