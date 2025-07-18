import authService from './firebase/auth.js'

class SettingsManager {
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
        this.applySettings()
      }
    })

    // Verificar se já há um usuário logado
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      this.currentUser = currentUser
      this.userData = authService.getUserData()
      if (this.userData) {
        this.applySettings()
      }
    }
  }

  applySettings() {
    if (!this.userData?.settings) return

    const settings = this.userData.settings

    // Aplicar tema
    this.applyTheme(settings.theme || 'light')

    // Aplicar notificações
    this.applyNotifications(settings.notifications !== false)

    // Aplicar privacidade
    this.applyPrivacy(settings.privacy || 'private')
  }

  applyTheme(theme) {
    const body = document.body
    const html = document.documentElement

    // Remover classes de tema anteriores
    body.classList.remove('theme-light', 'theme-dark', 'theme-auto')
    html.classList.remove('theme-light', 'theme-dark', 'theme-auto')

    // Aplicar novo tema
    if (theme === 'auto') {
      // Detectar preferência do sistema
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      const systemTheme = prefersDark ? 'dark' : 'light'

      body.classList.add(`theme-${systemTheme}`)
      html.classList.add(`theme-${systemTheme}`)

      // Escutar mudanças na preferência do sistema
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', e => {
          const newTheme = e.matches ? 'dark' : 'light'
          body.classList.remove('theme-light', 'theme-dark')
          html.classList.remove('theme-light', 'theme-dark')
          body.classList.add(`theme-${newTheme}`)
          html.classList.add(`theme-${newTheme}`)
        })
    } else {
      body.classList.add(`theme-${theme}`)
      html.classList.add(`theme-${theme}`)
    }

    // Salvar no localStorage para persistência
    localStorage.setItem('theme', theme)
  }

  applyNotifications(enabled) {
    if (enabled && 'Notification' in window) {
      // Solicitar permissão para notificações
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            window.showNotification('Notificações ativadas!', 'success')
          }
        })
      }
    }
  }

  applyPrivacy(privacy) {
    // Implementar lógica de privacidade
    // Por enquanto, apenas salvar a configuração
    localStorage.setItem('privacy', privacy)
  }

  // Método para mostrar notificações push
  showPushNotification(title, options = {}) {
    if (
      typeof window.notificationsEnabled === 'function' &&
      !window.notificationsEnabled()
    )
      return
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/assets/img/favicon/favicon-32x32.png',
        badge: '/assets/img/favicon/favicon-32x32.png',
        ...options
      })
    }
  }

  // Método para mostrar notificação na interface
  showNotification(message, type = 'info') {
    window.showNotification(message, type)
  }

  // Método para obter configurações atuais
  getCurrentSettings() {
    return (
      this.userData?.settings || {
        theme: 'light',
        notifications: true,
        privacy: 'private'
      }
    )
  }

  // Método para atualizar configurações
  async updateSettings(newSettings) {
    try {
      const result = await authService.updateUserProfile({
        settings: newSettings
      })
      if (result.success) {
        // Recarregar dados do usuário
        await authService.loadUserData()
        this.userData = authService.getUserData()
        this.applySettings()
        this.showNotification('Configurações atualizadas!', 'success')
        return { success: true }
      } else {
        this.showNotification(
          'Erro ao atualizar configurações: ' + result.error,
          'error'
        )
        return { success: false, error: result.error }
      }
    } catch (error) {
      this.showNotification(
        'Erro ao atualizar configurações: ' + error.message,
        'error'
      )
      return { success: false, error: error.message }
    }
  }
}

// Instância global do gerenciador de configurações
const settingsManager = new SettingsManager()

// Função utilitária global para checar se notificações estão ativadas
window.notificationsEnabled = function () {
  if (
    window.settingsManager &&
    window.settingsManager.userData &&
    window.settingsManager.userData.settings
  ) {
    return window.settingsManager.userData.settings.notifications !== false
  }
  // fallback: tenta pegar do localStorage
  try {
    const userData = JSON.parse(localStorage.getItem('userData'))
    if (userData && userData.settings) {
      return userData.settings.notifications !== false
    }
  } catch {}
  return true // padrão: ativado
}

export default settingsManager
