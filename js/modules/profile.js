import authService from './firebase/auth.js'
import dataService from './firebase/data.js'
import settingsManager from './settings.js'
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'

class ProfileManager {
  constructor() {
    this.currentUser = null
    this.userData = null
    this.init()
  }

  async init() {
    // Verificar autenticação
    authService.onAuthStateChanged((user, userData) => {
      if (user) {
        this.currentUser = user
        this.userData = userData
        dataService.setCurrentUser(user)
        this.loadUserData()
        this.setupEventListeners()
      } else {
        // Usuário não está logado, não redirecionar mais para login
      }
    })

    // Verificar se já há um usuário logado
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      this.currentUser = currentUser
      this.userData = authService.getUserData()
      if (this.userData) {
        this.loadUserData()
        this.setupEventListeners()
      }
    }
  }

  loadUserData() {
    if (!this.userData) return

    // Preencher formulário de perfil
    document.getElementById('fullName').value = this.userData.name || ''
    document.getElementById('email').value = this.userData.email || ''
    document.getElementById('institution').value =
      this.userData.profile?.institution || ''
    document.getElementById('course').value =
      this.userData.profile?.course || ''
    document.getElementById('enrollment').value =
      this.userData.profile?.enrollment || ''
    document.getElementById('startYear').value =
      this.userData.profile?.startYear || new Date().getFullYear()
    document.getElementById('startSemester').value =
      this.userData.profile?.startSemester || '1'

    // Configurar controles de configurações
    // Novo: select de notificações
    document.getElementById('notificationsSelect').value =
      this.userData.settings?.notifications !== false ? 'true' : 'false'
    document.getElementById('privacySelect').value =
      this.userData.settings?.privacy || 'private'

    // Atualizar informações do usuário no header
    this.updateUserInfo()

    // Carregar estatísticas
    this.loadStatistics()
  }

  updateUserInfo() {
    const userName = this.userData.name || 'Usuário'
    const userEmail = this.userData.email || ''

    document.getElementById('userName').textContent = userName
    document.getElementById('dropdownUserName').textContent = userName
    document.getElementById('dropdownUserEmail').textContent = userEmail
  }

  async loadStatistics() {
    try {
      const summaryResult = await dataService.loadSummary()
      if (summaryResult.success && summaryResult.data) {
        const stats = summaryResult.data

        document.getElementById('totalDisciplines').textContent =
          stats.totalDisciplines || 0
        document.getElementById('completedDisciplines').textContent =
          stats.completedDisciplines || 0
        document.getElementById('inProgressDisciplines').textContent =
          stats.inProgressDisciplines || 0
        document.getElementById('averageGrade').textContent =
          stats.averageGrade || 0.0
      } else {
        // Se não há resumo, calcular baseado nas disciplinas
        const disciplinesResult = await dataService.getUserDisciplines()
        if (disciplinesResult.success) {
          const stats = dataService.calculateSummary(disciplinesResult.data)

          document.getElementById('totalDisciplines').textContent =
            stats.totalDisciplines || 0
          document.getElementById('completedDisciplines').textContent =
            stats.completedDisciplines || 0
          document.getElementById('inProgressDisciplines').textContent =
            stats.inProgressDisciplines || 0
          document.getElementById('averageGrade').textContent =
            stats.averageGrade || 0.0
        }
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  setupEventListeners() {
    // Formulário de perfil
    document.getElementById('profileForm').addEventListener('submit', e => {
      e.preventDefault()
      this.saveProfile()
    })

    // Configurações
    // Novo: select de notificações
    document
      .getElementById('notificationsSelect')
      .addEventListener('change', e => {
        this.saveSettings({ notifications: e.target.value === 'true' })
      })

    document.getElementById('privacySelect').addEventListener('change', e => {
      this.saveSettings({ privacy: e.target.value })
    })

    // Menu do usuário
    document.getElementById('userButton').addEventListener('click', () => {
      document.querySelector('.user-dropdown').classList.toggle('active')
    })

    // Fechar menu ao clicar fora
    document.addEventListener('click', e => {
      if (!e.target.closest('.user-dropdown')) {
        document.querySelector('.user-dropdown').classList.remove('active')
      }
    })

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      this.logout()
    })

    // Alterar senha
    document
      .getElementById('changePasswordBtn')
      .addEventListener('click', () => {
        this.openChangePasswordModal()
      })

    document
      .getElementById('changePasswordAction')
      .addEventListener('click', () => {
        this.openChangePasswordModal()
      })

    // Modal de alteração de senha
    this.setupPasswordModal()

    // Exportar dados
    document.getElementById('exportDataBtn').addEventListener('click', () => {
      this.exportData()
    })

    // Excluir conta
    document
      .getElementById('deleteAccountBtn')
      .addEventListener('click', () => {
        this.openDeleteAccountModal()
      })

    this.setupDeleteModal()
  }

  async saveProfile() {
    const formData = new FormData(document.getElementById('profileForm'))
    const profileData = {
      name: formData.get('fullName'),
      profile: {
        institution: formData.get('institution'),
        course: formData.get('course'),
        enrollment: formData.get('enrollment'),
        startYear:
          parseInt(formData.get('startYear')) || new Date().getFullYear(),
        startSemester: formData.get('startSemester') || '1'
      }
    }

    try {
      const result = await authService.updateUserProfile(profileData)
      if (result.success) {
        // Recarregar dados do usuário
        await authService.loadUserData()
        this.userData = authService.getUserData()

        // Recarregar dados nos inputs para confirmar que foram salvos
        this.loadUserData()

        // Atualizar informações do usuário no header
        this.updateUserInfo()

        // Mostrar notificação de sucesso
        window.showNotification(
          '✅ Informações pessoais salvas com sucesso!',
          'success'
        )
      } else {
        window.showNotification(
          '❌ Erro ao atualizar perfil: ' + result.error,
          'error'
        )
      }
    } catch (error) {
      window.showNotification(
        '❌ Erro ao atualizar perfil: ' + error.message,
        'error'
      )
    }
  }

  async saveSettings(settings) {
    try {
      const result = await settingsManager.updateSettings(settings)
      if (result.success) {
        // Recarregar dados do usuário
        await authService.loadUserData()
        this.userData = authService.getUserData()

        // Aplicar configurações imediatamente
        if (settings.notifications !== undefined) {
          settingsManager.applyNotifications(settings.notifications)
        }
        if (settings.privacy) {
          settingsManager.applyPrivacy(settings.privacy)
        }

        // Mostrar notificação de sucesso
        window.showNotification(
          '✅ Configurações salvas com sucesso!',
          'success'
        )
      } else {
        window.showNotification(
          '❌ Erro ao salvar configurações: ' + result.error,
          'error'
        )
      }
    } catch (error) {
      window.showNotification(
        '❌ Erro ao salvar configurações: ' + error.message,
        'error'
      )
    }
  }

  async logout() {
    try {
      console.log('Iniciando logout...')
      // Limpar todos os dados locais
      localStorage.clear()
      sessionStorage.clear()
      // Redirecionar para a página principal após logout
      const result = await authService.logout()
      console.log('Resultado do logout:', result)

      if (result.success) {
        console.log('Logout bem-sucedido, redirecionando...')
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

  setupPasswordModal() {
    const modal = document.getElementById('changePasswordModal')
    const form = document.getElementById('changePasswordForm')
    const closeBtn = document.getElementById('closePasswordModal')
    const cancelBtn = document.getElementById('cancelPasswordChange')

    // Abrir modal
    this.openChangePasswordModal = () => {
      modal.classList.add('active')
      document.body.style.overflow = 'hidden'
    }

    // Fechar modal
    const closeModal = () => {
      modal.classList.remove('active')
      document.body.style.overflow = ''
      form.reset()
    }

    closeBtn.addEventListener('click', closeModal)
    cancelBtn.addEventListener('click', closeModal)

    // Fechar ao clicar fora
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        closeModal()
      }
    })

    // Formulário de alteração de senha
    form.addEventListener('submit', async e => {
      e.preventDefault()

      const currentPassword = document.getElementById('currentPassword').value
      const newPassword = document.getElementById('newPassword').value
      const confirmPassword =
        document.getElementById('confirmNewPassword').value

      if (newPassword !== confirmPassword) {
        window.showNotification('As senhas não correspondem!', 'error')
        return
      }

      if (newPassword.length < 6) {
        window.showNotification(
          'A nova senha deve ter pelo menos 6 caracteres!',
          'error'
        )
        return
      }

      try {
        // Reautenticar usuário
        const credential = EmailAuthProvider.credential(
          this.currentUser.email,
          currentPassword
        )
        await reauthenticateWithCredential(this.currentUser, credential)

        // Alterar senha
        await updatePassword(this.currentUser, newPassword)

        window.showNotification('Senha alterada com sucesso!', 'success')
        closeModal()
      } catch (error) {
        window.showNotification(
          'Erro ao alterar senha: ' + this.getErrorMessage(error.code),
          'error'
        )
      }
    })
  }

  setupDeleteModal() {
    const modal = document.getElementById('deleteAccountModal')
    const input = document.getElementById('deleteConfirmInput')
    const passwordInput = document.getElementById('deletePasswordInput')
    const confirmBtn = document.getElementById('confirmDeleteBtn')
    const cancelBtn = document.getElementById('cancelDeleteBtn')
    let typed = ''

    // Detectar se o usuário é Google
    let isGoogleUser = false
    if (this.currentUser && this.currentUser.providerData) {
      isGoogleUser = this.currentUser.providerData.some(
        p => p.providerId === 'google.com'
      )
    }
    // Esconder ou mostrar campo de senha conforme o provedor
    if (isGoogleUser) {
      passwordInput.style.display = 'none'
    } else {
      passwordInput.style.display = 'block'
    }

    // Bloquear colar
    input.addEventListener('paste', e => {
      e.preventDefault()
      window.showNotification(
        'Você deve digitar manualmente a palavra EXCLUIR.',
        'warning'
      )
    })

    // Só habilita se digitar EXCLUIR e senha não está vazia (exceto Google)
    function updateConfirmState() {
      if (isGoogleUser) {
        confirmBtn.disabled = !(input.value === 'EXCLUIR')
      } else {
        confirmBtn.disabled = !(
          input.value === 'EXCLUIR' && passwordInput.value.length > 0
        )
      }
    }
    input.addEventListener('input', updateConfirmState)
    passwordInput.addEventListener('input', updateConfirmState)

    // Abrir modal
    this.openDeleteAccountModal = () => {
      input.value = ''
      passwordInput.value = ''
      confirmBtn.disabled = true
      modal.style.display = 'block'
      input.focus()
      // Atualizar visibilidade do campo senha
      if (isGoogleUser) {
        passwordInput.style.display = 'none'
      } else {
        passwordInput.style.display = 'block'
      }
    }

    // Fechar modal
    cancelBtn.onclick = () => {
      modal.style.display = 'none'
    }

    // Excluir conta de verdade, com reautenticação se necessário
    confirmBtn.onclick = async () => {
      confirmBtn.disabled = true
      confirmBtn.textContent = 'Excluindo...'
      try {
        // 1. Excluir todos os dados do Firestore
        const result = await dataService.deleteUserAccount()
        if (!result.success)
          throw new Error(result.error || 'Erro ao excluir dados do Firestore')
        // 2. Excluir usuário do Authentication
        let authResult = await authService.deleteCurrentUser()
        if (
          isGoogleUser &&
          !authResult.success &&
          authResult.error &&
          authResult.error.includes('auth/requires-recent-login')
        ) {
          // Reautenticar com popup Google
          const reauth = await authService.reauthenticateWithGoogle()
          if (!reauth.success)
            throw new Error('Falha na reautenticação Google: ' + reauth.error)
          // Tentar excluir novamente
          authResult = await authService.deleteCurrentUser()
        } else if (
          !isGoogleUser &&
          !authResult.success &&
          authResult.error &&
          authResult.error.includes('auth/requires-recent-login')
        ) {
          // Reautenticar com senha
          const email =
            this.currentUser?.email ||
            (authService.currentUser && authService.currentUser.email)
          const senha = passwordInput.value
          if (!email || !senha)
            throw new Error(
              'E-mail ou senha não informados para reautenticação.'
            )
          const reauth = await authService.reauthenticate(email, senha)
          if (!reauth.success)
            throw new Error('Senha incorreta. Não foi possível reautenticar.')
          // Tentar excluir novamente
          authResult = await authService.deleteCurrentUser()
        }
        if (!authResult.success)
          throw new Error(
            authResult.error || 'Erro ao excluir usuário do sistema'
          )
        // 3. Limpar dados locais e redirecionar
        localStorage.clear()
        sessionStorage.clear()
        window.showNotification('Conta excluída com sucesso!', 'success')
        setTimeout(() => {
          window.location.href = '/'
        }, 1500)
      } catch (err) {
        window.showNotification(
          'Erro ao excluir conta: ' + (err?.message || err),
          'error'
        )
        confirmBtn.disabled = false
        confirmBtn.textContent = 'Excluir Permanentemente'
      }
    }
  }

  async exportData() {
    try {
      const result = await dataService.backupUserData()
      if (result.success) {
        // Criar arquivo de download
        const dataStr = JSON.stringify(result.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })

        const link = document.createElement('a')
        link.href = URL.createObjectURL(dataBlob)
        link.download = `historico-universitario-${
          new Date().toISOString().split('T')[0]
        }.json`
        link.click()

        window.showNotification('Dados exportados com sucesso!', 'success')
      } else {
        window.showNotification(
          'Erro ao exportar dados: ' + result.error,
          'error'
        )
      }
    } catch (error) {
      window.showNotification(
        'Erro ao exportar dados: ' + error.message,
        'error'
      )
    }
  }

  showNotification(message, type = 'info') {
    window.showNotification(message, type)
  }

  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/wrong-password': 'Senha atual incorreta.',
      'auth/weak-password': 'A nova senha deve ter pelo menos 6 caracteres.',
      'auth/requires-recent-login': 'Por segurança, faça login novamente.',
      'auth/user-mismatch': 'Credenciais inválidas.',
      'auth/invalid-credential': 'Credenciais inválidas.'
    }

    return errorMessages[errorCode] || 'Ocorreu um erro inesperado.'
  }
}

// Inicializar gerenciador de perfil
new ProfileManager()

if (typeof window.showNotification !== 'function') {
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
    notification.querySelector('.notification-close').onclick = () => {
      notification.classList.remove('show')
      setTimeout(() => notification.remove(), 300)
    }
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove('show')
        setTimeout(() => notification.remove(), 300)
      }
    }, 4000)
  }
}
